function PostReactions(postData) {
  const likes = postData.likes || 0;
  const comments = (postData.comments && postData.comments.length) || 0; // Calculate from comments array
  const shares = postData.shareCount || 0; // Assuming a shareCount field
  const userLiked = postData.userLiked || false; // Assuming postData includes this boolean

  const likeButtonClass = userLiked ? "liked" : "";
  const likeIconClass = userLiked ? "fas fa-heart" : "far fa-heart";

  return `
    <div class="post-reactions">
      <button id="likeBtn" class="${likeButtonClass}"><i class="${likeIconClass}"></i> Like (<span id="likeCount">${likes}</span>)</button>
      <button><i class="far fa-comment"></i> Comment (<span id="commentCountDisplay">${comments}</span>)</button>
      <button id="shareBtn"><i class="fas fa-share"></i> Share (<span id="shareCount">${shares}</span>)</button>
    </div>
  `;
}

export default PostReactions;
