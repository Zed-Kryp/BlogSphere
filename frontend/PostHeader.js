function PostHeader(postData, isAuthor) {
  // Add isAuthor parameter
  const title = postData.title || "Untitled Post";
  const author = postData.authorUsername || "Unknown Author"; // Use authorUsername
  const date = postData.createdAt
    ? new Date(postData.createdAt).toLocaleDateString()
    : "Unknown Date";

  return `
    <div class="post-header">
      <h1>${title}</h1>
      <p class="post-meta">By <span class="author-name">${author}${
    isAuthor ? " (You)" : ""
  }</span> 
      ${
        !isAuthor
          ? `<button id="followBtn" class="follow-btn">${
              postData.isFollowingAuthor ? "Following" : "Follow"
            }</button>`
          : ""
      }
      on <span class="post-date">${date}</span>
      <button id="bookmarkBtn" class="bookmark-btn">${
        postData.isBookmarked ? "★ Bookmarked" : "☆ Bookmark"
      }</button>
      </p>
    </div>
  `;
}

export default PostHeader;
