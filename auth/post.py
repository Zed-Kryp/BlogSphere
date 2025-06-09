import json
import boto3
from botocore.exceptions import ClientError
import uuid
from typing import Dict, Any, Optional, List, Union
import datetime # Import datetime for ISO format
from boto3.dynamodb.conditions import Key # Import Key for query

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')

# Table initialization with type hints (updated to match your API resources)
tables: Dict[str, Any] = {
    'blog-posts': dynamodb.Table('BlogPosts'),
    'categories': dynamodb.Table('Categories'),
    'post-categories': dynamodb.Table('PostCategories'),
    'post-comments': dynamodb.Table('PostComments'),
    'post-reactions': dynamodb.Table('PostReactions'),
    'post-shares': dynamodb.Table('PostShares'),
    'tags': dynamodb.Table('Tags'),
    'users': dynamodb.Table('Users'),
    'user-follows': dynamodb.Table('UserFollows'), # NEW
    'post-bookmarks': dynamodb.Table('PostBookmarks'), # NEW
    'user-profiles': dynamodb.Table('UserProfiles') # NEW: For updating follower/following counts
}

# Add a helper function to get username by userId
def get_user_username(user_id: str) -> Optional[str]:
    """Fetches username for a given userId from the Users table, handling both UUID and email as userId."""
    try:
        user = None
        if "@" in user_id: # Check if it looks like an email
            # Try to get user by email (assuming EmailIndex exists on the Users table)
            response = tables['users'].query(
                IndexName='EmailIndex', # Assuming you have an EmailIndex on the Users table
                KeyConditionExpression=Key('email').eq(user_id)
            )
            items = response.get('Items', [])
            user = items[0] if items else None
        else:
            # Assume it's a UUID and get user by primary key (userId)
            response = tables['users'].get_item(Key={'userId': user_id})
            user = response.get('Item')

        return user.get('username') if user else None
    except ClientError as e:
        print(f"Error fetching username for userId {user_id}: {e}")
        return None

# =================== UTILS ===================

def build_response(
    status_code: int, 
    body: Optional[Union[Dict, List]] = None, 
    headers: Optional[Dict] = None
) -> Dict:
    """Build a standardized API response."""
    base_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Content-Type': 'application/json'
    }
    if headers:
        base_headers.update(headers)
    
    return {
        'statusCode': status_code,
        'headers': base_headers,
        'body': json.dumps(body if body is not None else {})
    }

def get_path_parameter(event: Dict, name: str) -> Optional[str]:
    """Safely get path parameter."""
    return (event.get('pathParameters') or {}).get(name)

def get_query_parameter(event: Dict, name: str) -> Optional[str]:
    """Safely get query parameter."""
    return (event.get('queryStringParameters') or {}).get(name)

def get_body(event: Dict) -> Optional[Dict]:
    """Safely parse request body."""
    try:
        body = event.get('body')
        return json.loads(body) if body else None
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON body: {str(e)}")

def validate_required_fields(data: Dict, required_fields: List[str]) -> None:
    """Validate that required fields are present."""
    if not isinstance(data, dict):
        raise ValueError("Input data must be a dictionary")
    
    missing = [field for field in required_fields if not data.get(field)]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

def handle_options_request() -> Dict:
    """Handle CORS preflight OPTIONS request."""
    return build_response(200, {'message': 'CORS preflight successful'})

def get_table_key_attribute(table: Any) -> str:
    """Get the primary key attribute name from table schema."""
    try:
        key_schema = table.key_schema
        if not key_schema:
            raise ValueError("Table has no key schema defined")
        return key_schema[0]['AttributeName']
    except (IndexError, KeyError, AttributeError) as e:
        raise ValueError(f"Could not determine table key attribute: {str(e)}")

# =================== HANDLERS ===================

def get_item_handler(table: Any, event: Dict) -> Dict:
    """Handle GET requests for a single item."""
    try:
        # Check for both 'id' and 'postId' path parameters
        item_id = (get_path_parameter(event, 'id') or 
                  get_path_parameter(event, 'postId') or 
                  get_query_parameter(event, 'id'))
        
        print(f"GET /blog-posts/{item_id} requested.") # Debug print

        if not item_id:
            return build_response(400, {'error': 'Missing ID parameter'})
        
        key_attr = get_table_key_attribute(table)
        
        try:
            response = table.get_item(Key={key_attr: item_id})
            item = response.get('Item')

            if item:
                # Enrich post author with username
                if 'authorId' in item:
                    author_username = get_user_username(item['authorId'])
                    item['authorUsername'] = author_username if author_username else 'Anonymous'
                
                # Ensure createdAt is present for older posts
                if 'createdAt' not in item:
                    item['createdAt'] = datetime.datetime.now().isoformat()

                # Fetch comments for this post
                comments_response = tables['post-comments'].query( # Use correct table object
                    IndexName='PostCommentsIndex', # Corrected GSI name
                    KeyConditionExpression=boto3.dynamodb.conditions.Key('postId').eq(item_id)
                )
                print(f"Comments query response: {comments_response.get('Items', [])}") # Debug print
                item['comments'] = comments_response.get('Items', [])
                # Enrich comments with usernames
                for comment in item['comments']:
                    if 'userId' in comment:
                        username = get_user_username(comment['userId'])
                        comment['username'] = username if username else 'Anonymous' # Add username, default to 'Anonymous'

                # Fetch reactions for this post (e.g., count likes)
                reactions_response = tables['post-reactions'].query( # Use correct table object
                    IndexName='PostReactionIndex', # Corrected GSI name
                    KeyConditionExpression=boto3.dynamodb.conditions.Key('postId').eq(item_id)
                )
                print(f"DEBUG: Reactions query response raw: {reactions_response}") # NEW DEBUG PRINT
                print(f"DEBUG: Reactions query items: {reactions_response.get('Items', [])}") # NEW DEBUG PRINT
                all_reactions = reactions_response.get('Items', [])
                item['likes'] = sum(1 for r in all_reactions if r.get('reactionType') == 'like')

                # Determine if the current user has liked this post
                current_user_id = get_query_parameter(event, 'currentUserId') # Get current user ID from query param
                item['userLiked'] = False
                item['userReactionId'] = None # Initialize to None
                print(f"DEBUG: Checking user likes for current_user_id: {current_user_id}") # MODIFIED DEBUG PRINT
                if current_user_id and current_user_id != "anonymous": # Ensure a valid user ID is present
                    normalized_current_user_id = current_user_id.lower() # Normalize to lowercase
                    print(f"DEBUG: Normalized current_user_id: {normalized_current_user_id}") # NEW DEBUG PRINT
                    for reaction in all_reactions:
                        reaction_user_id = reaction.get('userId')
                        reaction_type = reaction.get('reactionType')
                        reaction_id = reaction.get('reactionId')

                        print(f"  Processing reaction: {reaction_id}, userId: {reaction_user_id}, type: {reaction_type}")
                        print(f"  DEBUG: Comparing '{reaction_user_id.lower() if reaction_user_id else 'None'}' with '{normalized_current_user_id}'") # NEW DEBUG PRINT

                        if reaction_user_id and reaction_user_id.lower() == normalized_current_user_id and reaction_type == 'like':
                            item['userLiked'] = True
                            if reaction_id: # Ensure reactionId exists before storing
                                item['userReactionId'] = reaction_id
                                print(f"  User {current_user_id} found to have liked this post. Reaction ID: {reaction_id}")
                            else:
                                print(f"  Warning: Reaction found for user {current_user_id} but reactionId is missing.")
                            break
                else:
                    print("No valid current_user_id provided for like check.")

                # Fetch shares for this post
                shares_response = tables['post-shares'].query( # Use correct table object
                    IndexName='PostSharesIndex', # Corrected GSI name
                    KeyConditionExpression=boto3.dynamodb.conditions.Key('postId').eq(item_id)
                )
                print(f"Shares query response: {shares_response.get('Items', [])}") # Debug print
                item['shareCount'] = len(shares_response.get('Items', []))

                # Determine if current user is following the author
                item['isFollowingAuthor'] = False
                if current_user_id and current_user_id != "anonymous" and 'authorId' in item:
                    try:
                        follow_response = tables['user-follows'].get_item(
                            Key={'followerId': current_user_id, 'followedId': item['authorId']}
                        )
                        if 'Item' in follow_response:
                            item['isFollowingAuthor'] = True
                    except ClientError as e:
                        print(f"Error checking follow status: {e}")
                        # Continue without setting isFollowingAuthor if there's an error

                # Determine if current user has bookmarked this post
                item['isBookmarked'] = False
                if current_user_id and current_user_id != "anonymous" and 'postId' in item: # Assuming postId is the primary key for BlogPosts
                    try:
                        bookmark_response = tables['post-bookmarks'].get_item(
                            Key={'userId': current_user_id, 'postId': item['postId']}
                        )
                        if 'Item' in bookmark_response:
                            item['isBookmarked'] = True
                    except ClientError as e:
                        print(f"Error checking bookmark status: {e}")
                        # Continue without setting isBookmarked if there's an error

                print(f"Final item before response: {item}") # Debug print

                return build_response(200, item)
            else:
                return build_response(404, {'error': 'Item not found'})
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            error_msg = e.response['Error'].get('Message', 'Unknown error occurred')
            
            if error_code == 'ResourceNotFoundException':
                return build_response(404, {'error': 'Resource not found'})
            return build_response(500, {
                'error': 'Database operation failed',
                'code': error_code,
                'message': error_msg
            })
            
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

def scan_table_handler(table: Any, event: Dict) -> Dict:
    """Handle scan operations on tables."""
    try:
        # Parse limit parameter
        limit_param = get_query_parameter(event, 'limit')
        limit = 20  # Default value
        if limit_param:
            try:
                limit = int(limit_param)
                if limit <= 0 or limit > 100:
                    return build_response(400, {
                        'error': 'Limit must be between 1 and 100',
                        'provided': limit_param
                    })
            except ValueError:
                return build_response(400, {
                    'error': 'Invalid limit parameter',
                    'provided': limit_param
                })

        # Get pagination token
        exclusive_start_key = get_query_parameter(event, 'last_evaluated_key')
        
        # Get key attribute
        key_attr = get_table_key_attribute(table)
        
        # Build scan parameters
        scan_params: Dict[str, Any] = {'Limit': limit}
        if exclusive_start_key:
            scan_params['ExclusiveStartKey'] = {key_attr: exclusive_start_key}
        
        # Add filters based on table type
        filter_expression_parts = []
        expression_attribute_values = {}
        
        if table.name == 'BlogPosts':
            if author_id := get_query_parameter(event, 'authorId'):
                filter_expression_parts.append('authorId = :authorId')
                expression_attribute_values[':authorId'] = author_id
            
            if category_id := get_query_parameter(event, 'categoryId'):
                filter_expression_parts.append('contains(categories, :categoryId)')
                expression_attribute_values[':categoryId'] = category_id

        # Special handling for post-related tables
        if table.name in ['PostComments', 'PostReactions', 'PostShares']:
            if post_id := get_query_parameter(event, 'postId'):
                filter_expression_parts.append('postId = :postId')
                expression_attribute_values[':postId'] = post_id

        if filter_expression_parts:
            scan_params['FilterExpression'] = ' AND '.join(filter_expression_parts)
            scan_params['ExpressionAttributeValues'] = expression_attribute_values

        # Execute scan
        try:
            response = table.scan(**scan_params)
        except ClientError as e:
            return build_response(500, {
                'error': 'Database scan failed',
                'code': e.response['Error'].get('Code', 'UnknownError'),
                'message': e.response['Error'].get('Message', 'Unknown error')
            })

        # Build response
        result = {
            'items': response.get('Items', []),
            'count': response.get('Count', 0),
            'scanned_count': response.get('ScannedCount', 0),
        }
        
        if 'LastEvaluatedKey' in response:
            result['last_evaluated_key'] = response['LastEvaluatedKey'].get(key_attr)

        return build_response(200, result)
        
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

def create_item_handler(table: Any, event: Dict) -> Dict:
    """Handle item creation."""
    try:
        # Parse and validate body
        body = get_body(event)
        if body is None:
            return build_response(400, {'error': 'Request body is required'})
        
        key_attr = get_table_key_attribute(table)

        # Table-specific validation
        required_fields_map = {
            'Users': ['username', 'email'],
            'BlogPosts': ['title', 'content', 'authorId'],
            'PostComments': ['postId', 'userId', 'content'],
            'PostReactions': ['postId', 'userId', 'reactionType'],
            'PostShares': ['postId', 'userId', 'shareType'],
            'Categories': ['name', 'slug'],
            'Tags': ['name', 'slug'],
            'PostCategories': ['postId', 'categoryId'],
        }

        required_fields = required_fields_map.get(table.name, [])
        validate_required_fields(body, required_fields)

        # For post-related items, check if postId is in path parameters
        if table.name in ['PostComments', 'PostReactions', 'PostShares']:
            path_post_id = get_path_parameter(event, 'postId')
            if path_post_id:
                if 'postId' in body and body['postId'] != path_post_id:
                    return build_response(400, {
                        'error': 'postId in path conflicts with postId in body'
                    })
                body['postId'] = path_post_id

        # Generate ID if not provided
        if key_attr not in body:
            body[key_attr] = str(uuid.uuid4())

        # Add createdAt timestamp if not present
        if 'createdAt' not in body:
            body['createdAt'] = datetime.datetime.now().isoformat() # Use datetime from import

        # Create item
        try:
            table.put_item(Item=body)

            # If a blog post is created, increment postsCount for the author
            if table.name == 'BlogPosts' and 'authorId' in body:
                author_id = body['authorId']
                tables['user-profiles'].update_item(
                    Key={'userId': author_id},
                    UpdateExpression="SET #postsCount = if_not_exists(#postsCount, :start) + :inc",
                    ExpressionAttributeNames={'#postsCount': 'postsCount'},
                    ExpressionAttributeValues={':inc': 1, ':start': 0}
                )
            
            return build_response(201, {
                'message': 'Item created successfully',
                'id': body[key_attr],
                'resource': f"/{table.name.lower()}/{body[key_attr]}"
            })
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            
            if error_code == 'ConditionalCheckFailedException':
                return build_response(409, {'error': 'Item already exists'})
                
            return build_response(500, {
                'error': 'Database operation failed',
                'code': error_code,
                'message': e.response['Error'].get('Message', 'Unknown error')
            })
            
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

def update_item_handler(table: Any, event: Dict) -> Dict:
    """Handle item updates."""
    try:
        # Check for both 'id' and 'postId' path parameters
        item_id = (get_path_parameter(event, 'id') or 
                  get_path_parameter(event, 'postId') or 
                  get_query_parameter(event, 'id'))
        
        if not item_id:
            return build_response(400, {'error': 'Missing ID parameter'})
        
        body = get_body(event)
        if not body:
            return build_response(400, {'error': 'Request body is required'})
        
        key_attr = get_table_key_attribute(table)
        body.pop(key_attr, None)  # Prevent ID modification

        if not body:
            return build_response(400, {'error': 'No fields to update'})

        # Build update expression
        update_expr = "SET " + ", ".join(f"#{k}=:{k}" for k in body)
        expr_attr_names = {f"#{k}": k for k in body}
        expr_attr_values = {f":{k}": v for k, v in body.items()}

        try:
            response = table.update_item(
                Key={key_attr: item_id},
                UpdateExpression=update_expr,
                ExpressionAttributeNames=expr_attr_names,
                ExpressionAttributeValues=expr_attr_values,
                ReturnValues="UPDATED_NEW"
            )
            return build_response(200, {
                'message': 'Item updated successfully',
                'updated_attributes': response.get('Attributes', {})
            })
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            
            if error_code == 'ConditionalCheckFailedException':
                return build_response(404, {'error': 'Item not found'})
                
            return build_response(500, {
                'error': 'Database operation failed',
                'code': error_code,
                'message': e.response['Error'].get('Message', 'Unknown error')
            })
            
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

def delete_item_handler(table: Any, event: Dict) -> Dict:
    """Handle item deletion."""
    try:
        key_attr = get_table_key_attribute(table) # Get key_attr first

        # Use the table's primary key attribute name to get the ID from path parameters
        item_id = get_path_parameter(event, key_attr)
        
        if not item_id:
            return build_response(400, {'error': f'Missing {key_attr} parameter'})

        try:
            # Check existence
            existing = table.get_item(Key={key_attr: item_id})
            if 'Item' not in existing:
                return build_response(404, {'error': 'Item not found'})
            
            # If a blog post is deleted, decrement postsCount for the author
            if table.name == 'BlogPosts' and 'authorId' in existing['Item']:
                author_id = existing['Item']['authorId']
                tables['user-profiles'].update_item(
                    Key={'userId': author_id},
                    UpdateExpression="SET #postsCount = if_not_exists(#postsCount, :start) - :dec",
                    ExpressionAttributeNames={'#postsCount': 'postsCount'},
                    ExpressionAttributeValues={':dec': 1, ':start': 1},
                    ConditionExpression="attribute_exists(userId) AND #postsCount >= :dec"
                )

            # If a blog post is deleted, decrement postsCount for the author
            if table.name == 'BlogPosts' and 'authorId' in existing['Item']:
                author_id = existing['Item']['authorId']
                tables['user-profiles'].update_item(
                    Key={'userId': author_id},
                    UpdateExpression="SET #postsCount = if_not_exists(#postsCount, :start) - :dec",
                    ExpressionAttributeNames={'#postsCount': 'postsCount'},
                    ExpressionAttributeValues={':dec': 1, ':start': 1},
                    ConditionExpression="attribute_exists(userId) AND #postsCount >= :dec"
                )
            
            # If a post reaction (like) is deleted, decrement totalLikesReceived for the post's author
            if table.name == 'PostReactions':
                # Need to get the reaction item first to know its postId and reactionType
                reaction_item_response = table.get_item(Key={key_attr: item_id})
                reaction_item = reaction_item_response.get('Item')

                if reaction_item and reaction_item.get('reactionType') == 'like':
                    post_id = reaction_item.get('postId')
                    if post_id:
                        # Fetch the post to get its authorId
                        post_response = tables['blog-posts'].get_item(Key={'postId': post_id})
                        post = post_response.get('Item')
                        if post and 'authorId' in post:
                            author_id = post['authorId']
                            tables['user-profiles'].update_item(
                                Key={'userId': author_id},
                                UpdateExpression="SET #totalLikesReceived = if_not_exists(#totalLikesReceived, :start) - :dec",
                                ExpressionAttributeNames={'#totalLikesReceived': 'totalLikesReceived'},
                                ExpressionAttributeValues={':dec': 1, ':start': 1},
                                ConditionExpression="attribute_exists(userId) AND #totalLikesReceived >= :dec"
                            )

            # Delete item
            table.delete_item(Key={key_attr: item_id})
            return build_response(200, {
                'message': 'Item deleted successfully',
                'id': item_id
            })
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            return build_response(500, {
                'error': 'Database operation failed',
                'code': error_code,
                'message': e.response['Error'].get('Message', 'Unknown error')
            })
            
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

# =================== USER FOLLOWS HANDLERS ===================

def create_follow_handler(event: Dict) -> Dict:
    """Handle POST requests to create a user follow relationship."""
    try:
        body = get_body(event)
        if body is None:
            return build_response(400, {'error': 'Request body is required'})

        follower_id = body.get('followerId')
        followed_id = body.get('followedId')

        if not follower_id or not followed_id:
            return build_response(400, {'error': 'followerId and followedId are required'})
        
        if follower_id == followed_id:
            return build_response(400, {'error': 'Cannot follow yourself'})

        # Check if already following
        try:
            response = tables['user-follows'].get_item(
                Key={'followerId': follower_id, 'followedId': followed_id}
            )
            if 'Item' in response:
                return build_response(409, {'error': 'Already following this user'})
        except ClientError as e:
            print(f"Error checking existing follow: {e}")
            return build_response(500, {'error': 'Database error during check'})

        item = {
            'followerId': follower_id,
            'followedId': followed_id,
            'createdAt': datetime.datetime.now().isoformat()
        }

        tables['user-follows'].put_item(Item=item)
        
        # Increment following count for follower
        tables['user-profiles'].update_item(
            Key={'userId': follower_id},
            UpdateExpression="SET #following = if_not_exists(#following, :start) + :inc",
            ExpressionAttributeNames={'#following': 'following'},
            ExpressionAttributeValues={':inc': 1, ':start': 0}
        )
        
        # Increment followers count for followed user
        tables['user-profiles'].update_item(
            Key={'userId': followed_id},
            UpdateExpression="SET #followers = if_not_exists(#followers, :start) + :inc",
            ExpressionAttributeNames={'#followers': 'followers'},
            ExpressionAttributeValues={':inc': 1, ':start': 0}
        )

        return build_response(201, {'message': 'User followed successfully'})

    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except ClientError as e:
        error_code = e.response['Error'].get('Code', 'UnknownError')
        return build_response(500, {
            'error': 'Database operation failed',
            'code': error_code,
            'message': e.response['Error'].get('Message', 'Unknown error')
        })
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

def delete_follow_handler(event: Dict) -> Dict:
    """Handle DELETE requests to remove a user follow relationship."""
    try:
        follower_id = get_path_parameter(event, 'followerId')
        followed_id = get_path_parameter(event, 'followedId')

        if not follower_id or not followed_id:
            return build_response(400, {'error': 'followerId and followedId path parameters are required'})

        try:
            # Check existence before deleting
            response = tables['user-follows'].get_item(
                Key={'followerId': follower_id, 'followedId': followed_id}
            )
            if 'Item' not in response:
                return build_response(404, {'error': 'Follow relationship not found'})

            tables['user-follows'].delete_item(
                Key={'followerId': follower_id, 'followedId': followed_id}
            )
            
            # Decrement following count for follower
            tables['user-profiles'].update_item(
                Key={'userId': follower_id},
                UpdateExpression="SET #following = if_not_exists(#following, :start) - :dec",
                ExpressionAttributeNames={'#following': 'following'},
                ExpressionAttributeValues={':dec': 1, ':start': 1}, # Start at 1 to prevent negative if not exists
                ConditionExpression="attribute_exists(userId) AND #following >= :dec" # Ensure count doesn't go negative
            )
            
            # Decrement followers count for followed user
            tables['user-profiles'].update_item(
                Key={'userId': followed_id},
                UpdateExpression="SET #followers = if_not_exists(#followers, :start) - :dec",
                ExpressionAttributeNames={'#followers': 'followers'},
                ExpressionAttributeValues={':dec': 1, ':start': 1}, # Start at 1 to prevent negative if not exists
                ConditionExpression="attribute_exists(userId) AND #followers >= :dec" # Ensure count doesn't go negative
            )

            return build_response(200, {'message': 'User unfollowed successfully'})
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            return build_response(500, {
                'error': 'Database operation failed',
                'code': error_code,
                'message': e.response['Error'].get('Message', 'Unknown error')
            })
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

def get_following_handler(event: Dict) -> Dict:
    """Handle GET requests to retrieve users a specific user is following."""
    try:
        user_id = get_path_parameter(event, 'userId')
        if not user_id:
            return build_response(400, {'error': 'userId path parameter is required'})

        try:
            response = tables['user-follows'].query(
                IndexName='FollowerUsersIndex',
                KeyConditionExpression=Key('followerId').eq(user_id)
            )
            following_items = response.get('Items', [])
            
            # Enrich with followed user's username
            for item in following_items:
                if 'followedId' in item:
                    followed_username = get_user_username(item['followedId'])
                    item['followedUsername'] = followed_username if followed_username else 'Anonymous'

            return build_response(200, following_items)
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            return build_response(500, {
                'error': 'Database query failed',
                'code': error_code,
                'message': e.response['Error'].get('Message', 'Unknown error')
            })
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

def get_followers_handler(event: Dict) -> Dict:
    """Handle GET requests to retrieve followers of a specific user."""
    try:
        user_id = get_path_parameter(event, 'userId')
        if not user_id:
            return build_response(400, {'error': 'userId path parameter is required'})

        try:
            response = tables['user-follows'].query(
                IndexName='FollowedUsersIndex',
                KeyConditionExpression=Key('followedId').eq(user_id)
            )
            follower_items = response.get('Items', [])

            # Enrich with follower user's username
            for item in follower_items:
                if 'followerId' in item:
                    follower_username = get_user_username(item['followerId'])
                    item['followerUsername'] = follower_username if follower_username else 'Anonymous'

            return build_response(200, follower_items)
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            return build_response(500, {
                'error': 'Database query failed',
                'code': error_code,
                'message': e.response['Error'].get('Message', 'Unknown error')
            })
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

# =================== USER BOOKMARKS HANDLERS ===================

def create_bookmark_handler(event: Dict) -> Dict:
    """Handle POST requests to create a post bookmark."""
    try:
        body = get_body(event)
        if body is None:
            return build_response(400, {'error': 'Request body is required'})

        user_id = body.get('userId')
        post_id = body.get('postId')

        if not user_id or not post_id:
            return build_response(400, {'error': 'userId and postId are required'})

        # Check if already bookmarked
        try:
            response = tables['post-bookmarks'].get_item(
                Key={'userId': user_id, 'postId': post_id}
            )
            if 'Item' in response:
                return build_response(409, {'error': 'Post already bookmarked by this user'})
        except ClientError as e:
            print(f"Error checking existing bookmark: {e}")
            return build_response(500, {'error': 'Database error during check'})

        item = {
            'userId': user_id,
            'postId': post_id,
            'createdAt': datetime.datetime.now().isoformat()
        }

        tables['post-bookmarks'].put_item(Item=item)
        return build_response(201, {'message': 'Post bookmarked successfully'})

    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except ClientError as e:
        error_code = e.response['Error'].get('Code', 'UnknownError')
        return build_response(500, {
            'error': 'Database operation failed',
            'code': error_code,
            'message': e.response['Error'].get('Message', 'Unknown error')
        })
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

def delete_bookmark_handler(event: Dict) -> Dict:
    """Handle DELETE requests to remove a post bookmark."""
    try:
        user_id = get_path_parameter(event, 'userId')
        post_id = get_path_parameter(event, 'postId')

        if not user_id or not post_id:
            return build_response(400, {'error': 'userId and postId path parameters are required'})

        try:
            # Check existence before deleting
            response = tables['post-bookmarks'].get_item(
                Key={'userId': user_id, 'postId': post_id}
            )
            if 'Item' not in response:
                return build_response(404, {'error': 'Bookmark not found'})

            tables['post-bookmarks'].delete_item(
                Key={'userId': user_id, 'postId': post_id}
            )
            return build_response(200, {'message': 'Bookmark removed successfully'})
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            return build_response(500, {
                'error': 'Database operation failed',
                'code': error_code,
                'message': e.response['Error'].get('Message', 'Unknown error')
            })
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

def get_user_posts_handler(event: Dict) -> Dict:
    """Handle GET requests to retrieve posts by a specific user (authorId)."""
    try:
        user_id = get_path_parameter(event, 'userId')
        if not user_id:
            return build_response(400, {'error': 'userId path parameter is required'})

        try:
            # Query the BlogPosts table using the AuthorIndex
            response = tables['blog-posts'].query(
                IndexName='AuthorIndex', # Corrected index name based on user feedback
                KeyConditionExpression=Key('authorId').eq(user_id)
            )
            posts = response.get('Items', [])

            # Enrich posts with author username and counts (likes, comments, shares)
            for post in posts:
                if 'authorId' in post:
                    author_username = get_user_username(post['authorId'])
                    post['authorUsername'] = author_username if author_username else 'Anonymous'
                
                # Fetch comments count for this post
                comments_response = tables['post-comments'].query(
                    IndexName='PostCommentsIndex',
                    KeyConditionExpression=Key('postId').eq(post['postId'])
                )
                post['comments'] = comments_response.get('Items', []) # Store full comments for length calculation

                # Fetch reactions (likes) count for this post
                reactions_response = tables['post-reactions'].query(
                    IndexName='PostReactionIndex',
                    KeyConditionExpression=Key('postId').eq(post['postId'])
                )
                all_reactions = reactions_response.get('Items', [])
                post['likes'] = sum(1 for r in all_reactions if r.get('reactionType') == 'like')

                # Fetch shares count for this post
                shares_response = tables['post-shares'].query(
                    IndexName='PostSharesIndex',
                    KeyConditionExpression=Key('postId').eq(post['postId'])
                )
                post['shareCount'] = len(shares_response.get('Items', []))
            
            return build_response(200, posts)
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            return build_response(500, {
                'error': 'Database query failed',
                'code': error_code,
                'message': e.response['Error'].get('Message', 'Unknown error')
            })
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

def get_bookmarks_handler(event: Dict) -> Dict:
    """Handle GET requests to retrieve bookmarked posts for a specific user, enriching with post details."""
    try:
        user_id = get_path_parameter(event, 'userId')
        if not user_id:
            return build_response(400, {'error': 'userId path parameter is required'})

        try:
            # First, get all bookmark items for the user
            response = tables['post-bookmarks'].query(
                KeyConditionExpression=Key('userId').eq(user_id)
            )
            bookmark_items = response.get('Items', [])
            
            bookmarked_posts = []
            for bookmark in bookmark_items:
                post_id = bookmark.get('postId')
                if post_id:
                    # Fetch full post details from BlogPosts table
                    post_response = tables['blog-posts'].get_item(Key={'postId': post_id})
                    post = post_response.get('Item')
                    if post:
                        # Enrich post with author username
                        if 'authorId' in post:
                            author_username = get_user_username(post['authorId'])
                            post['authorUsername'] = author_username if author_username else 'Anonymous'
                        bookmarked_posts.append(post)
            
            return build_response(200, bookmarked_posts)
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            return build_response(500, {
                'error': 'Database query failed',
                'code': error_code,
                'message': e.response['Error'].get('Message', 'Unknown error')
            })
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

# =================== MEDIA UPLOAD HANDLER ===================

import base64
import mimetypes
import os

s3 = boto3.client('s3')
S3_BUCKET_NAME = os.environ.get('S3_BUCKET_NAME', 'blogsphere-20') # Use the bucket name provided by the user

def upload_media_handler(event: Dict) -> Dict:
    """Handle POST requests to upload media (images/videos) to S3."""
    try:
        body = event.get('body')
        if body is None:
            return build_response(400, {'error': 'Request body is required'})
        
        # Assuming the body contains 'fileData' (base64 encoded) and 'fileName'
        # For binary data, API Gateway might pass it directly or base64 encoded depending on integration
        # For simplicity, let's assume base64 encoded JSON payload for now.
        # If direct binary, event['body'] would be bytes and event['headers']['Content-Type'] would be the file's MIME type.
        
        # If the body is JSON, parse it
        try:
            payload = json.loads(body)
            file_data_base64 = payload.get('fileData')
            file_name = payload.get('fileName')
            content_type = payload.get('contentType') # MIME type from frontend
        except json.JSONDecodeError:
            # If not JSON, assume it's raw binary/base64 from API Gateway proxy integration
            file_data_base64 = body
            content_type = event.get('headers', {}).get('Content-Type')
            file_name = f"upload_{uuid.uuid4()}" # Generate a generic name if not provided

        if not file_data_base64:
            return build_response(400, {'error': 'fileData is required'})

        file_content = base64.b64decode(file_data_base64)

        if not content_type:
            # Try to guess content type from file extension if available
            if '.' in file_name:
                ext = file_name.rsplit('.', 1)[1].lower()
                content_type = mimetypes.guess_type(f"dummy.{ext}")[0]
            if not content_type:
                content_type = 'application/octet-stream' # Default if cannot guess

        # Determine folder based on content type
        if content_type.startswith('image/'):
            s3_folder = 'posts-media/images/'
        elif content_type.startswith('video/'):
            s3_folder = 'posts-media/videos/'
        else:
            s3_folder = 'posts-media/others/' # Fallback for other types

        # Generate a unique key for S3
        file_extension = mimetypes.guess_extension(content_type) or '.bin'
        s3_key = f"{s3_folder}{uuid.uuid4()}{file_extension}"

        try:
            s3.put_object(
                Bucket=S3_BUCKET_NAME,
                Key=s3_key,
                Body=file_content,
                ContentType=content_type
            )
            
            # Construct the public URL
            media_url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{s3_key}"
            
            return build_response(200, {'message': 'Media uploaded successfully', 'url': media_url})
        except ClientError as e:
            error_code = e.response['Error'].get('Code', 'UnknownError')
            return build_response(500, {
                'error': 'S3 upload failed',
                'code': error_code,
                'message': e.response['Error'].get('Message', 'Unknown error')
            })
            
    except ValueError as e:
        return build_response(400, {'error': str(e)})
    except Exception as e:
        return build_response(500, {'error': 'Internal server error', 'details': str(e)})

# =================== MAIN LAMBDA ===================
def lambda_handler(event: Dict, context: Any) -> Dict:
    """Main Lambda function handler - updated for new API structure."""
    try:
        # Handle CORS preflight
        if event.get('httpMethod') == 'OPTIONS':
            return handle_options_request()

        # Extract resource path and method
        path_parts = [p for p in event.get('resource', '').split('/') if p]
        method = event.get('httpMethod', '').upper()

        # Determine the table based on the resource path
        # Note: 'users' is included here to handle nested paths like /users/{userId}/following
        resource_map = {
            'blog-posts': 'blog-posts',
            'categories': 'categories',
            'post-categories': 'post-categories',
            'post-comments': 'post-comments',
            'post-reactions': 'post-reactions',
            'post-shares': 'post-shares',
            'tags': 'tags',
            'user-follows': 'user-follows', # NEW
            'post-bookmarks': 'post-bookmarks', # NEW
            'users': 'users' # Included to handle nested user paths like /users/{userId}/following
        }

        # Handle root path
        if not path_parts:
            return build_response(404, {'error': 'Resource not found'})

        # Get the base resource (first part of path)
        base_resource = path_parts[0]
        
        # Special routing for user-related nested paths
        if base_resource == 'users' and len(path_parts) > 2:
            user_id = path_parts[1]
            sub_resource = path_parts[2]
            if sub_resource == 'following' and method == 'GET':
                return get_following_handler(event)
            elif sub_resource == 'followers' and method == 'GET':
                return get_followers_handler(event)
            elif sub_resource == 'bookmarks' and method == 'GET':
                return get_bookmarks_handler(event)
            elif sub_resource == 'posts' and method == 'GET': # NEW: Route for user's posts
                return get_user_posts_handler(event)
            # If it's /users/{userId} without a sub-resource, let it fall through to the general handler if needed
            # Or explicitly return 404 if only nested paths are allowed here
            return build_response(404, {'error': f'Sub-resource {sub_resource} not found for user'})

        # Route for user-follows and post-bookmarks directly
        if base_resource == 'user-follows':
            if method == 'POST':
                return create_follow_handler(event)
            elif method == 'DELETE' and len(path_parts) == 3: # /user-follows/{followerId}/{followedId}
                return delete_follow_handler(event)
            return build_response(405, {'error': 'Method not allowed for /user-follows'})
        
        if base_resource == 'post-bookmarks':
            if method == 'POST':
                return create_bookmark_handler(event)
            elif method == 'DELETE' and len(path_parts) == 3: # /post-bookmarks/{userId}/{postId}
                return delete_bookmark_handler(event)
            return build_response(405, {'error': 'Method not allowed for /post-bookmarks'})
        
        # Route for media uploads
        if base_resource == 'upload-media': # NEW
            if method == 'POST':
                return upload_media_handler(event)
            return build_response(405, {'error': 'Method not allowed for /upload-media'})

        # For other resources, determine the table and route
        if base_resource not in resource_map:
            return build_response(404, {
                'error': 'Resource not found',
                'requested': base_resource,
                'available': list(resource_map.keys())
            })

        table = tables[resource_map[base_resource]]

        # Route to appropriate handler based on method for standard CRUD
        try:
            if method == 'GET':
                if len(path_parts) > 1 and path_parts[1] in {'{postId}', '{commentId}', '{reactionId}', '{shareId}', '{tagId}', '{categoryId}'}:
                    return get_item_handler(table, event)
                return scan_table_handler(table, event)
            elif method == 'POST':
                return create_item_handler(table, event)
            elif method == 'PUT':
                if len(path_parts) < 2:
                    return build_response(400, {'error': 'Missing ID parameter'})
                return update_item_handler(table, event)
            elif method == 'DELETE':
                if len(path_parts) < 2:
                    return build_response(400, {'error': 'Missing ID parameter'})
                return delete_item_handler(table, event)
            else:
                return build_response(405, {
                    'error': 'Method not allowed',
                    'requested': method,
                    'allowed': ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
                })
        except Exception as e:
            return build_response(500, {
                'error': 'Request processing failed',
                'details': str(e),
                'resource': base_resource,
                'method': method
            })
            
    except Exception as e:
        # Top-level error handler
        return build_response(500, {
            'error': 'Unexpected server error',
            'details': str(e),
            'event': {k: v for k, v in event.items() if k != 'body'}  # Don't log full body
        })


