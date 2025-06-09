function PostContent(postData) {
  const content = postData.content || "No content available.";
  const imageUrl = postData.imageUrl; // No fallback image

  return `
    <div class="post-content">
      ${
        imageUrl
          ? `<img src="${imageUrl}" alt="Post Image" class="post-image">`
          : ""
      }
      <p>${content}</p>
    </div>
  `;
}

export default PostContent;
