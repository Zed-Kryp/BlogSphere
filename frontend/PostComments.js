function PostComments(postData, currentUserId) {
  const comments = postData.comments || [];
  console.log("PostComments received comments:", comments); // Add this line
  const commentCount = comments.length;

  const commentHtml =
    comments.length > 0
      ? comments
          .map((comment) => {
            const isCurrentUserComment = comment.userId === currentUserId; // Check if current user made this comment
            const commentItemClass = isCurrentUserComment
              ? "comment-item current-user-comment"
              : "comment-item"; // Add class if it's current user's comment

            return `
                <div class="${commentItemClass}">
                  <p class="comment-author"><strong>${
                    comment.username || "Anonymous"
                  }:</strong></p>
                  <p class="comment-text">${
                    comment.content || "No comment content."
                  }</p>
                </div>
              `;
          })
          .join("")
      : "<p>No comments yet. Be the first to comment!</p>";

  return `
    <div class="post-comments">
      <h3>Comments (${commentCount})</h3>
      <div class="comment-list">
        ${commentHtml}
      </div>
      <div class="comment-form">
        <input type="text" id="commentInput" placeholder="Add a comment..." />
        <button id="postCommentBtn">Post Comment</button>
      </div>
    </div>
  `;
}

export default PostComments;
