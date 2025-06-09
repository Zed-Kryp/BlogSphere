import Post from "/frontend/Post.js";
import PostHeader from "/frontend/PostHeader.js";
import PostContent from "/frontend/PostContent.js";
import PostReactions from "/frontend/PostReactions.js";
import PostShare from "/frontend/PostShare.js";
import PostComments from "/frontend/PostComments.js";

document.addEventListener("DOMContentLoaded", async () => {
  const postContainer = document.getElementById("post-container");
  const baseUrl =
    "https://ymqaxl6qde.execute-api.us-east-1.amazonaws.com/prodt";

  // Function to get query parameter from URL
  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }

  const postId = getQueryParam("id"); // Get post ID from URL, e.g., post.html?id=123

  if (!postId) {
    postContainer.innerHTML = "<p>Post ID not found in URL.</p>";
    console.error("Post ID is missing from the URL.");
    return;
  }

  const currentUserId = localStorage.getItem("userId") || "anonymous"; // Get current user ID (should be userId, not username)

  const postUrl = `${baseUrl}/blog-posts/${postId}${
    currentUserId !== "anonymous" ? `?currentUserId=${currentUserId}` : ""
  }`; // Fetch from API Gateway, append currentUserId if logged in

  try {
    const response = await fetch(postUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const postData = await response.json();
    console.log("Fetched Post Data:", postData);

    // Render the post with fetched data
    // Assuming postData is an array and we need the first item, or it's a single object
    const currentPostData = postData.length > 0 ? postData[0] : postData;
    postContainer.innerHTML = Post(currentPostData, currentUserId); // Pass currentUserId

    // --- Comment Submission Logic ---
    // Function to re-fetch and re-render the post
    async function refreshPostData() {
      const refreshPostUrl = `${baseUrl}/blog-posts/${postId}${
        currentUserId !== "anonymous" ? `?currentUserId=${currentUserId}` : ""
      }`; // Ensure currentUserId is used for refresh
      try {
        const updatedPostResponse = await fetch(refreshPostUrl);
        if (!updatedPostResponse.ok) {
          throw new Error(`HTTP error! status: ${updatedPostResponse.status}`);
        }
        const updatedPostData = await updatedPostResponse.json();
        postContainer.innerHTML = Post(
          updatedPostData.length > 0 ? updatedPostData[0] : updatedPostData,
          currentUserId // Pass currentUserId
        );
        attachEventListeners(); // Re-attach event listeners after re-rendering
      } catch (error) {
        console.error("Error refreshing post data:", error);
        alert(`Error refreshing post data: ${error.message}`);
      }
    }

    // Function to log share event to backend
    async function logShareEvent(shareType) {
      const userId = localStorage.getItem("username") || "anonymous";
      const shareData = {
        postId: postId,
        userId: userId,
        shareType: shareType,
        createdAt: new Date().toISOString(),
      };

      try {
        const response = await fetch(`${baseUrl}/post-shares`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shareData),
        });

        if (!response.ok) {
          console.warn(`Failed to log share event: ${response.status}`);
        } else {
          console.log(`Share event (${shareType}) logged.`);
          await refreshPostData(); // Update share count
        }
      } catch (error) {
        console.error(`Error logging share event (${shareType}):`, error);
      }
    }

    // Function to toggle follow status
    async function toggleFollow() {
      const authorId = currentPostData.authorId;
      if (!currentUserId || currentUserId === "anonymous") {
        alert("Please log in to follow users.");
        return;
      }
      if (currentUserId === authorId) {
        alert("You cannot follow yourself.");
        return;
      }

      const isFollowing = currentPostData.isFollowingAuthor;
      const method = isFollowing ? "DELETE" : "POST";
      const url = isFollowing
        ? `${baseUrl}/user-follows/${currentUserId}/${authorId}`
        : `${baseUrl}/user-follows`;
      const body = isFollowing
        ? undefined
        : JSON.stringify({ followerId: currentUserId, followedId: authorId });

      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(
          `User ${isFollowing ? "unfollowed" : "followed"} successfully.`
        );
        await refreshPostData(); // Re-fetch and re-render to update UI
      } catch (error) {
        console.error(`Error toggling follow status:`, error);
        alert(`Error toggling follow status: ${error.message}`);
      }
    }

    // Function to toggle bookmark status
    async function toggleBookmark() {
      const postIdToBookmark = currentPostData.postId; // Assuming postId is available in currentPostData
      if (!currentUserId || currentUserId === "anonymous") {
        alert("Please log in to bookmark posts.");
        return;
      }

      const isBookmarked = currentPostData.isBookmarked;
      const method = isBookmarked ? "DELETE" : "POST";
      const url = isBookmarked
        ? `${baseUrl}/post-bookmarks/${currentUserId}/${postIdToBookmark}`
        : `${baseUrl}/post-bookmarks`;
      const body = isBookmarked
        ? undefined
        : JSON.stringify({ userId: currentUserId, postId: postIdToBookmark });

      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: body,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(
          `Post ${isBookmarked ? "unbookmarked" : "bookmarked"} successfully.`
        );
        await refreshPostData(); // Re-fetch and re-render to update UI
      } catch (error) {
        console.error(`Error toggling bookmark status:`, error);
        alert(`Error toggling bookmark status: ${error.message}`);
      }
    }

    // Function to attach all event listeners
    function attachEventListeners() {
      const commentInput = document.getElementById("commentInput");
      const postCommentBtn = document.getElementById("postCommentBtn");
      const likeBtn = document.getElementById("likeBtn");
      const followBtn = document.getElementById("followBtn"); // NEW
      const bookmarkBtn = document.getElementById("bookmarkBtn"); // NEW
      const shareBtn = document.getElementById("shareBtn"); // From PostReactions
      const shareTwitterBtn = document.getElementById("shareTwitterBtn"); // From PostShare
      const shareFacebookBtn = document.getElementById("shareFacebookBtn"); // From PostShare
      const shareCopyLinkBtn = document.getElementById("shareCopyLinkBtn"); // From PostShare

      if (postCommentBtn && commentInput) {
        postCommentBtn.onclick = async () => {
          // Use onclick to prevent multiple listeners
          const commentContent = commentInput.value.trim();
          if (!commentContent) {
            alert("Comment cannot be empty.");
            return;
          }

          const userId = localStorage.getItem("userId") || "anonymous"; // Use userId from localStorage
          const commentData = {
            postId: postId,
            userId: userId,
            content: commentContent,
            createdAt: new Date().toISOString(),
          };

          try {
            const response = await fetch(`${baseUrl}/post-comments`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(commentData),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Comment posted:", result);
            commentInput.value = "";

            await refreshPostData();
          } catch (error) {
            console.error("Error posting comment:", error);
            alert(`Error posting comment: ${error.message}`);
          }
        };
      }

      if (likeBtn) {
        const userId = localStorage.getItem("userId"); // Get userId from localStorage
        if (!userId) {
          // Disable like button or show message if not logged in
          likeBtn.disabled = true;
          likeBtn.title = "Log in to like this post";
          return; // Exit if not logged in
        }

        likeBtn.onclick = async () => {
          const isLiked = likeBtn.classList.contains("liked");
          let method = "";
          let url = `${baseUrl}/post-reactions`;

          console.log("Like button clicked. isLiked:", isLiked);
          console.log("Current Post Data:", currentPostData);

          if (isLiked) {
            // If already liked, unlike it (DELETE request)
            method = "DELETE";
            const userReactionId = currentPostData.userReactionId; // Get the reactionId from the fetched post data
            console.log(
              "Attempting to unlike. userReactionId:",
              userReactionId
            );
            if (!userReactionId) {
              alert(
                "Error: Cannot unlike. Reaction ID not found in post data."
              );
              console.error("Error: userReactionId is null or undefined.");
              return;
            }
            url = `${baseUrl}/post-reactions/${userReactionId}`; // Use reactionId for DELETE
          } else {
            // If not liked, like it (POST request)
            method = "POST";
            console.log("Attempting to like.");
          }

          const reactionData = {
            postId: postId,
            userId: userId,
            reactionType: "like",
            createdAt: new Date().toISOString(),
          };

          try {
            const response = await fetch(url, {
              method: method,
              headers: {
                "Content-Type": "application/json",
              },
              body:
                method === "POST" ? JSON.stringify(reactionData) : undefined, // Only send body for POST
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log(
              isLiked ? "Unlike recorded:" : "Like recorded:",
              result
            );

            if (!isLiked) {
              // If it was a 'like' operation
              // Optimistically update currentPostData with the new reaction ID and like status
              currentPostData.userLiked = true;
              currentPostData.userReactionId = result.id; // Store the new reaction ID
              currentPostData.likes = (currentPostData.likes || 0) + 1; // Increment likes count
              console.log(
                "Optimistically updated currentPostData:",
                currentPostData
              );
            } else {
              // If it was an 'unlike' operation
              // Optimistically update currentPostData for unlike
              currentPostData.userLiked = false;
              currentPostData.userReactionId = null; // Clear reaction ID
              currentPostData.likes = Math.max(
                0,
                (currentPostData.likes || 0) - 1
              ); // Decrement likes count
              console.log(
                "Optimistically updated currentPostData for unlike:",
                currentPostData
              );
            }

            await refreshPostData(); // Re-fetch and re-render post to ensure full consistency
          } catch (error) {
            console.error(
              isLiked ? "Error unliking post:" : "Error liking post:",
              error
            );
            alert(
              `${isLiked ? "Error unliking post" : "Error liking post"}: ${
                error.message
              }`
            );
          }
        };
      }

      if (shareBtn) {
        shareBtn.onclick = async () => {
          // Use onclick
          try {
            const postLink = window.location.href;
            await navigator.clipboard.writeText(postLink);
            await logShareEvent("link_copy_reaction_btn");
          } catch (error) {
            console.error("Error copying link:", error);
            alert("Failed to copy link to clipboard. Please try manually.");
          }
        };
      }

      if (shareTwitterBtn) {
        shareTwitterBtn.onclick = () => {
          // Use onclick
          const postLink = encodeURIComponent(window.location.href);
          const postTitle = encodeURIComponent(document.title);
          window.open(
            `https://twitter.com/intent/tweet?url=${postLink}&text=${postTitle}`,
            "_blank"
          );
          logShareEvent("twitter");
        };
      }

      if (shareFacebookBtn) {
        shareFacebookBtn.onclick = () => {
          // Use onclick
          const postLink = encodeURIComponent(window.location.href);
          window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${postLink}`,
            "_blank"
          );
          logShareEvent("facebook");
        };
      }

      if (shareCopyLinkBtn) {
        shareCopyLinkBtn.onclick = async () => {
          // Use onclick
          try {
            const postLink = window.location.href;
            await navigator.clipboard.writeText(postLink);
            logShareEvent("link_copy_share_btn");
          } catch (error) {
            console.error("Error copying link:", error);
            alert("Failed to copy link to clipboard. Please try manually.");
          }
        };
      }

      if (followBtn) {
        followBtn.onclick = toggleFollow;
      }

      if (bookmarkBtn) {
        bookmarkBtn.onclick = toggleBookmark;
      }
    } // End of attachEventListeners

    // Initial fetch and render
    const initialPostResponse = await fetch(postUrl);
    if (!initialPostResponse.ok) {
      throw new Error(`HTTP error! status: ${initialPostResponse.status}`);
    }
    const initialPostData = await initialPostResponse.json();
    postContainer.innerHTML = Post(
      initialPostData.length > 0 ? initialPostData[0] : initialPostData,
      currentUserId // Pass currentUserId
    );
    attachEventListeners(); // Attach listeners after initial render
  } catch (error) {
    console.error("Error fetching post:", error);
    postContainer.innerHTML = `<p>Error loading post: ${error.message}</p>`;
  }
});
