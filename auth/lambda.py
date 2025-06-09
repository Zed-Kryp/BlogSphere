import json
import boto3
import uuid
import datetime
import os
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from decimal import Decimal # Import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return json.JSONEncoder.default(self, obj)

dynamodb = boto3.resource('dynamodb')
users_table = dynamodb.Table(os.environ.get('USERS_TABLE', 'Users'))
user_profiles_table = dynamodb.Table(os.environ.get('USER_PROFILES_TABLE', 'UserProfiles'))
blog_posts_table = dynamodb.Table(os.environ.get('BLOG_POSTS_TABLE', 'BlogPosts'))
s3 = boto3.client('s3') # Initialize S3 client globally again

def respond(status_code, body):
    response = {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        'body': json.dumps(body, cls=DecimalEncoder) # Use custom encoder
    }
    return response

def get_user_by_email(email):
    try:
        resp = users_table.query(
            IndexName='EmailIndex',
            KeyConditionExpression=Key('email').eq(email)
        )
        items = resp.get('Items', [])
        return items[0] if items else None
    except ClientError as e:
        print(f"Error querying by email: {e}")
        return None

def get_user_by_username(username):
    try:
        resp = users_table.query(
            IndexName='UsernameIndex',
            KeyConditionExpression=Key('username').eq(username)
        )
        items = resp.get('Items', [])
        return items[0] if items else None
    except ClientError as e:
        print(f"Error querying by username: {e}")
        return None

# --- Handler Functions for Endpoints ---

def handle_login(event, body):
    email = body.get('email')
    password = body.get('password')

    if not email or not password:
        return respond(400, {'error': 'Email and password are required'})

    user = get_user_by_email(email)
    # WARNING: Passwords are being compared in plain text. For production, use a strong hashing algorithm (e.g., bcrypt).
    if not user or user.get('password') != password:
        return respond(401, {'error': 'Invalid credentials'})

    user_data = {
        'userId': user.get('userId'),
        'username': user.get('username'),
        'email': user.get('email'),
        'name': user.get('name', '')
    }
    return respond(200, {
        'message': 'Login successful',
        'user': user_data,
        'token': str(uuid.uuid4())
    })

def handle_register(event, body):
    username = body.get('username')
    email = body.get('email')
    password = body.get('password')
    name = body.get('name')

    if not username or not email or not password or not name:
        return respond(400, {'error': 'All fields are required'})

    if get_user_by_username(username):
        return respond(409, {'error': 'Username already exists'})
    if get_user_by_email(email):
        return respond(409, {'error': 'Email already exists'})

    new_user_id = str(uuid.uuid4())
    item = {
        'userId': new_user_id,
        'username': username,
        'email': email,
        'password': password,
        'name': name,
        'createdAt': str(datetime.datetime.now())
    }

    users_table.put_item(Item=item)

    profile_item = {
        'userId': new_user_id,
        'username': username,
        'email': email,
        'name': name,
        'gender': '',
        'age': None,
        'dob': '',
        'phoneNumber': '',
        'profilePictureUrl': 'https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'authorId': new_user_id, # Set authorId to the new user's ID
        'bio': '',
        'followers': 0,
        'following': 0,
        'education': '',
        'status': '',
        'address': ''
    }
    print(f"Attempting to create user profile for userId: {new_user_id}, username: {username}")
    print(f"Profile item: {json.dumps(profile_item)}")
    try:
        user_profiles_table.put_item(Item=profile_item)
        print(f"Successfully created user profile for userId: {new_user_id}")
    except ClientError as e:
        print(f"Error creating user profile for userId {new_user_id}: {e}")
        users_table.delete_item(Key={'userId': new_user_id})
        return respond(500, {'error': 'Failed to create user profile. Please try again.'})

    user_data = {
        'userId': new_user_id,
        'username': username,
        'email': email,
        'name': name
    }
    return respond(201, {
        'message': 'User registered successfully',
        'user': user_data
    })

def handle_forgot_password(event, body):
    email = body.get('email')

    if not email:
        return respond(400, {'error': 'Email is required'})

    user = get_user_by_email(email)
    if not user:
        return respond(404, {'error': 'User not found'})
    
    reset_token = str(uuid.uuid4())
    reset_token_expiry = (datetime.datetime.now() + datetime.timedelta(minutes=30)).isoformat()

    users_table.update_item(
        Key={'userId': user['userId']},
        UpdateExpression="SET passwordResetToken = :token, passwordResetTokenExpiry = :expiry",
        ExpressionAttributeValues={
            ':token': reset_token,
            ':expiry': reset_token_expiry
        }
    )
    return respond(200, {'message': 'Password reset token generated', 'token': reset_token})

def handle_reset_password(event, body):
    token = body.get('token')
    password = body.get('password')

    if not token or not password:
        return respond(400, {'error': 'Token and password are required'})
    
    email = body.get('email')
    user = get_user_by_email(email)
    if not user:
        return respond(404, {'error': 'User not found'})

    if user.get('passwordResetToken') != token:
        return respond(400, {'error': 'Invalid reset token'})
    
    if user.get('passwordResetTokenExpiry') < datetime.datetime.now().isoformat():
        return respond(400, {'error': 'Reset token has expired'})
    
    users_table.update_item(
        Key={'userId': user['userId']},
        UpdateExpression="SET password = :p REMOVE passwordResetToken, passwordResetTokenExpiry",
        ExpressionAttributeValues={':p': password}
    )
    return respond(200, {'message': 'Password reset successfully'})

def handle_get_user(event, user_id):
    # This function is now expected to fetch from user_profiles_table
    # as per the frontend's confirmed API endpoint /users/{userId}
    # which maps to handle_get_user in this Lambda.
    if not user_id:
        # If no user_id is provided, it might be a request for all users.
        # Assuming 'Users' table holds core user data for listing.
        # If user profiles are meant to be listed, this should use user_profiles_table.scan()
        response = users_table.scan() # 'users_table' refers to 'Users' table
        users = response.get('Items', [])
        for user in users:
            user.pop('password', None) # Remove sensitive data
        return respond(200, users)
    else:
        # Fetch single user profile from 'UserProfiles' table
        response = user_profiles_table.get_item(Key={'userId': user_id})
        user_profile = response.get('Item')
        if not user_profile:
            print(f"User profile not found in UserProfiles table for userId: {user_id}")
            return respond(404, {'error': 'User profile not found'})
        
        # The frontend expects 'username' field. Ensure it's present.
        # If 'username' is not directly in UserProfiles, you might need to fetch from 'Users' table too.
        # For now, assuming 'username' is part of UserProfiles.
        print(f"Successfully retrieved user profile for userId: {user_id}")
        return respond(200, user_profile)

def handle_put_user(event, body, user_id):
    if not user_id:
        return respond(400, {'error': 'User ID is required for update'})
    
    update_data = {k: v for k, v in body.items() if k != 'userId'}
    if not update_data:
        return respond(400, {'error': 'No fields to update'})

    if 'password' in update_data:
        return respond(400, {'error': 'Use forgot-password endpoint to change password'})

    update_expr = "SET " + ", ".join(f"#{k} = :{k}" for k in update_data)
    expr_attr_names = {f"#{k}": k for k in update_data}
    expr_attr_values = {f":{k}": v for k, v in update_data.items()}

    response = users_table.update_item(
        Key={'userId': user_id},
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_attr_names,
        ExpressionAttributeValues=expr_attr_values,
        ReturnValues="ALL_NEW"
    )
    updated_user = response.get('Attributes', {})
    updated_user.pop('password', None)
    return respond(200, updated_user)

def handle_delete_user(event, user_id):
    if not user_id:
        return respond(400, {'error': 'User ID is required for deletion'})
    users_table.delete_item(Key={'userId': user_id})
    return respond(200, {'message': 'User deleted successfully'})

def handle_get_profile(event, user_id):
    print(f"handle_get_profile received event: {json.dumps(event)}") # Log the full event
    if not user_id:
        print("Error: User ID is missing for profile lookup.")
        return respond(400, {'error': 'User ID is required for profile lookup'})
    
    print(f"Attempting to retrieve user profile for userId: {user_id}")
    try:
        response = user_profiles_table.get_item(Key={'userId': user_id})
        print(f"DynamoDB get_item response: {json.dumps(response, cls=DecimalEncoder)}") # Log DynamoDB response
        profile = response.get('Item')
        
        if not profile:
            print(f"User profile not found for userId: {user_id}")
            return respond(404, {'error': 'User profile not found'})
        
        print(f"Successfully retrieved user profile for userId: {user_id}")
        return respond(200, profile)
    except ClientError as e:
        print(f"DynamoDB ClientError in handle_get_profile: {e}")
        return respond(500, {'error': 'DynamoDB error fetching profile'})
    except Exception as e:
        print(f"Unexpected error in handle_get_profile: {e}")
        return respond(500, {'error': 'Internal server error fetching profile'})

def handle_put_profile(event, body, user_id):
    if not user_id:
        return respond(400, {'error': 'User ID is required for profile update'})
    
    update_data = {k: v for k, v in body.items() if k != 'userId'}
    if not update_data:
        return respond(400, {'error': 'No fields to update'})

    update_expr = "SET " + ", ".join(f"#{k} = :{k}" for k in update_data)
    expr_attr_names = {f"#{k}": k for k in update_data}
    expr_attr_values = {f":{k}": v for k, v in update_data.items()}

    response = user_profiles_table.update_item(
        Key={'userId': user_id},
        UpdateExpression=update_expr,
        ExpressionAttributeNames=expr_attr_names,
        ExpressionAttributeValues=expr_attr_values,
        ReturnValues="ALL_NEW"
    )
    updated_profile = response.get('Attributes', {})
    return respond(200, updated_profile)

def handle_get_user_posts(event, user_id):
    if not user_id:
        return respond(400, {'error': 'User ID is required to fetch posts'})
    
    try:
        response = blog_posts_table.query(
            IndexName='AuthorIdIndex', # Assuming an index on authorId
            KeyConditionExpression=Key('authorId').eq(user_id)
        )
        posts = response.get('Items', [])
        return respond(200, posts)
    except ClientError as e:
        print(f"Error fetching user posts for {user_id}: {e}")
        return respond(500, {'error': 'Failed to fetch user posts'})

def handle_get_bookmarked_posts(event, user_id):
    if not user_id:
        return respond(400, {'error': 'User ID is required to fetch bookmarked posts'})
    
    try:
        # Assuming 'Bookmarks' is the table name for bookmarked posts
        bookmarks_table = dynamodb.Table('Bookmarks') 
        response = bookmarks_table.query(
            IndexName='UserIdIndex', # Assuming an index on userId for bookmarks
            KeyConditionExpression=Key('userId').eq(user_id)
        )
        bookmarks = response.get('Items', [])
        return respond(200, bookmarks)
    except ClientError as e:
        print(f"Error fetching bookmarked posts for {user_id}: {e}")
        return respond(500, {'error': 'Failed to fetch bookmarked posts'})

def handle_upload_profile_picture(event, body):
    # Reverted s3 client initialization to global scope as per debugging findings.
    # The issue is likely environmental (Lambda runtime/layers/permissions).
    print(f"handle_upload_profile_picture received body: {json.dumps(body)}")
    user_id = body.get('userId') # Get userId from the request body
    file_name = body.get('fileName')
    file_type = body.get('fileType')

    if not user_id or not file_name or not file_type:
        print(f"Error: Missing userId, fileName, or fileType in body: {body}")
        return respond(400, {'error': 'userId, fileName, and fileType are required'})

    if not file_type.startswith('image/'):
        return respond(400, {'error': 'Only image files are allowed'})

    file_extension = file_name.split('.')[-1] if '.' in file_name else 'jpg'
    unique_file_name = f"{uuid.uuid4()}.{file_extension}"
    s3_key = f"profile-picture/{unique_file_name}"
    bucket_name = os.environ.get('PROFILE_PICTURE_BUCKET', 'blogsphere-20') # Use environment variable or default

    print(f"Attempting to generate pre-signed URL for file: {file_name}, type: {file_type}")
    print(f"S3 Bucket: {bucket_name}, Key: {s3_key}")
    print(f"S3 client object: {s3}") # Check the s3 object

    # Explicitly define params to ensure no None values
    s3_params = {
        'Bucket': bucket_name,
        'Key': s3_key,
        'ContentType': file_type
    }
    print(f"S3 generate_presigned_url Params: {json.dumps(s3_params)}")

    try:
        upload_url = s3.generate_presigned_url(
            ClientMethod='put_object',
            Params=s3_params,
            ExpiresIn=300
        )
        
        file_url = f"https://{bucket_name}.s3.amazonaws.com/{s3_key}"
        print(f"Successfully generated pre-signed URL. Upload URL: {upload_url}, File URL: {file_url}")

        # Update user profile with the new profile picture URL
        try:
            user_profiles_table.update_item(
                Key={'userId': user_id},
                UpdateExpression="SET profilePictureUrl = :url",
                ExpressionAttributeValues={':url': file_url}
            )
            print(f"Successfully updated profilePictureUrl for userId {user_id} to {file_url}")
        except ClientError as e:
            print(f"Error updating profilePictureUrl for userId {user_id}: {e}")
            return respond(500, {'error': 'Failed to update user profile with new picture URL'})

        return respond(200, {
            'message': 'Profile picture URL generated and profile updated successfully',
            'uploadUrl': upload_url,
            'fileUrl': file_url
        })
    except Exception as e: # Catch all exceptions
        import traceback # Import traceback
        print(f"An unexpected error occurred during pre-signed URL generation for {file_name}: {e}")
        traceback.print_exc() # Print full traceback
        return respond(500, {'error': 'Failed to generate upload URL due to internal error'})

# --- Main Lambda Handler ---

def lambda_handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")
        http_method = event.get('httpMethod')
        path = event.get('requestContext', {}).get('resourcePath', event.get('path', '')).strip()
        print(f"Path (stripped): '{path}', HTTP Method: {http_method}")
        
        if http_method == 'OPTIONS':
            return respond(200, {})

        body = {}
        if http_method in ['POST', 'PUT']:
            raw_body = event.get('body')
            if raw_body:
                try:
                    body = json.loads(raw_body)
                except json.JSONDecodeError:
                    return respond(400, {'error': 'Invalid JSON body'})

        # Define routes
        routes = {
            ('/login', 'POST'): handle_login,
            ('/register', 'POST'): handle_register,
            ('/forgot-password', 'POST'): handle_forgot_password,
            ('/reset-password', 'POST'): handle_reset_password,
            ('/profile/upload-url', 'POST'): handle_upload_profile_picture,
        }

        # Dispatch based on exact path and method first
        route_key = (path, http_method)
        if route_key in routes:
            return routes[route_key](event, body)

        # Then handle /users and /profile with dynamic user_id
        # Ensure pathParameters is a dictionary, even if it's null in the event
        path_params = event.get('pathParameters') or {} 

        if path.startswith('/users/'):
            user_id = path_params.get('userId')
            if http_method == 'GET':
                return handle_get_user(event, user_id)
            elif http_method == 'PUT':
                return handle_put_user(event, body, user_id)
            elif http_method == 'DELETE':
                return handle_delete_user(event, user_id)
        elif path == '/users' and http_method == 'GET': # For GET /users (list all)
            return handle_get_user(event, None) # Pass None for user_id to get all users
        elif path.startswith('/profile/'):
            user_id = path_params.get('userId')
            if http_method == 'GET':
                return handle_get_profile(event, user_id)
            elif http_method == 'PUT':
                return handle_put_profile(event, body, user_id)
        elif path.startswith('/posts/user/'):
            user_id = path_params.get('userId')
            if http_method == 'GET':
                return handle_get_user_posts(event, user_id)
        elif path.startswith('/bookmarks/user/'):
            user_id = path_params.get('userId')
            if http_method == 'GET':
                return handle_get_bookmarked_posts(event, user_id)
        
        return respond(404, {'error': 'Endpoint not found'})

    except ClientError as e:
        print(f"DynamoDB or S3 Client error: {e}")
        return respond(500, {'error': 'Database or S3 client error'})
    except Exception as e:
        print(f"Unexpected error: {e}")
        return respond(500, {'error': 'Internal server error'})
