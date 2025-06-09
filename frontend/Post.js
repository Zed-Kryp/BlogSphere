import PostHeader from "./PostHeader.js";
import PostContent from "./PostContent.js";
import PostReactions from "./PostReactions.js";
import PostShare from "./PostShare.js";
import PostComments from "./PostComments.js";

function Post(postData, currentUserId) {
  // Add currentUserId parameter
  if (!postData) {
    return `<p>No post data available.</p>`;
  }

  const isAuthor = postData.authorId === currentUserId; // Determine if current user is author

  return `
    <div class="blog-post-container">
      ${PostHeader(postData, isAuthor)}
      ${PostContent(postData)}
      ${PostReactions(postData)}
      ${PostShare(postData)}
      ${PostComments(postData, currentUserId)}
    </div>
  `;
}

export default Post;
