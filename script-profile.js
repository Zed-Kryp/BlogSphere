document.addEventListener("DOMContentLoaded", async () => {
  // Base URLs for your API Gateway endpoints
  const API_AUTH_BASE_URL =
    "https://dr7kat5az5.execute-api.us-east-1.amazonaws.com/prod"; // For authentication and profile
  const API_POSTS_BASE_URL =
    "https://ymqaxl6qde.execute-api.us-east-1.amazonaws.com/prodt"; // For posts and bookmarks

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userId");

  if (userId) {
    await fetchUserProfile(userId); // Ensure profile is fetched before updating post count
    await updatePostsCountDisplay(userId); // Call the new function to update posts count
    fetchUserPosts(userId);
  } else {
    // Handle case where no userId is provided, maybe redirect to 404 or home
    console.error("No userId found in URL for profile page.");
    document.getElementById("userName").textContent = "User Not Found";
    document.getElementById("aboutMeContent").textContent =
      "The requested user profile could not be found.";
    document.getElementById("loadingSpinner").style.display = "none";
  }
});

const authorCache = {}; // Cache for author profiles

async function getAuthorUsername(authorId) {
  if (authorCache[authorId]) {
    return authorCache[authorId];
  }

  const authToken = localStorage.getItem("token");
  try {
    const response = await fetch(`${API_AUTH_BASE_URL}/profile/${authorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const user = await response.json();
    authorCache[authorId] = {
      username: user.username || "Anonymous",
      profilePictureUrl:
        user.profilePictureUrl ||
        "https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    };
    return authorCache[authorId];
  } catch (error) {
    console.error(`Error fetching author profile for ${authorId}:`, error);
    return {
      username: "Anonymous",
      profilePictureUrl:
        "https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    };
  }
}

async function fetchUserProfile(userId) {
  // Assume authToken is available globally or passed from a login context
  const authToken = localStorage.getItem("token"); // Example: retrieve from localStorage

  // Get new elements for Instagram-like profile header and About Me section
  const profilePictureDisplay = document.getElementById("profilePicture"); // Reusing existing ID
  const profileUsernameDisplay = document.getElementById(
    "profileUsernameDisplay"
  );
  const profileNameDisplay = document.getElementById("profileNameDisplay");
  const profileBioDisplay = document.getElementById("profileBioDisplay");
  const postsCount = document.getElementById("postsCount");
  const followersCount = document.getElementById("followersCount");
  const followingCount = document.getElementById("followingCount");

  const profileGenderDisplay = document.getElementById("profileGenderDisplay");
  const profileAgeDisplay = document.getElementById("profileAgeDisplay");
  const profileDobDisplay = document.getElementById("profileDobDisplay");
  const profilePhoneNumberDisplay = document.getElementById(
    "profilePhoneNumberDisplay"
  );
  const profileEducationDisplay = document.getElementById(
    "profileEducationDisplay"
  );
  const profileStatusDisplay = document.getElementById("profileStatusDisplay");
  const profileAddressDisplay = document.getElementById(
    "profileAddressDisplay"
  );

  try {
    const response = await fetch(`${API_AUTH_BASE_URL}/profile/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`, // Include authorization token
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const user = await response.json();

    // Populate Instagram-like header elements
    profilePictureDisplay.src =
      user.profilePictureUrl || "../images/default-avatar.png";
    profileUsernameDisplay.textContent = `@${user.username || "N/A"}`;
    profileNameDisplay.textContent = user.name || "";
    profileBioDisplay.textContent = user.bio || "No bio yet.";

    // Populate stats (followers and following)
    followersCount.textContent =
      user.followers !== undefined ? user.followers : 0;
    followingCount.textContent =
      user.following !== undefined ? user.following : 0;
    // postsCount will be updated by updatePostsCountDisplay()

    // Populate the new "About Me" section
    profileGenderDisplay.textContent = user.gender || "N/A";
    profileAgeDisplay.textContent = user.age !== undefined ? user.age : "N/A";
    profileDobDisplay.textContent = user.dob || "N/A";
    profilePhoneNumberDisplay.textContent = user.phoneNumber || "N/A";
    profileEducationDisplay.textContent = user.education || "N/A";
    profileStatusDisplay.textContent = user.status || "N/A";
    profileAddressDisplay.textContent = user.address || "N/A";

    document.getElementById("postsByUser").textContent =
      user.name || "Unknown User"; // Still used for the posts section title
  } catch (error) {
    console.error("Error fetching user profile:", error);
    // Update error messages to target the new display elements
    if (profileUsernameDisplay) {
      profileUsernameDisplay.textContent = "Error Loading Profile";
    }
    if (profileBioDisplay) {
      profileBioDisplay.textContent = "Could not load user profile data.";
    }
    // Also update the general "About Me" section if it's still used for a fallback message
    const aboutMeContentElement = document.getElementById("aboutMeContent");
    if (aboutMeContentElement) {
      aboutMeContentElement.textContent = "Could not load user profile data.";
    }
  }
}

async function fetchUserPosts(userId) {
  const loadingSpinner = document.getElementById("loadingSpinner");
  const userPostsGrid = document.getElementById("userPostsGrid");

  loadingSpinner.style.display = "block";
  userPostsGrid.innerHTML = ""; // Clear previous posts

  // Assume authToken is available globally or passed from a login context
  const authToken = localStorage.getItem("token"); // Example: retrieve from localStorage

  try {
    const response = await fetch(
      `${API_POSTS_BASE_URL}/users/${userId}/posts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`, // Include authorization token
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const posts = await response.json();

    if (posts.length === 0) {
      userPostsGrid.innerHTML = "<p>No posts found for this user.</p>";
    } else {
      // Fetch author names for all unique authors
      const uniqueAuthorIds = [...new Set(posts.map((post) => post.authorId))];
      await Promise.all(uniqueAuthorIds.map((id) => getAuthorUsername(id)));

      posts.forEach(async (post) => {
        // Added async here
        // Assign authorName and profilePictureUrl from cache
        const authorInfo = await getAuthorUsername(post.authorId); // Await here to ensure authorInfo is fetched
        post.authorName = authorInfo.username;
        post.authorProfilePictureUrl = authorInfo.profilePictureUrl;

        const postElement = renderBlogPost(post);
        userPostsGrid.appendChild(postElement);
      });
    }
  } catch (error) {
    console.error("Error fetching user posts:", error);
    userPostsGrid.innerHTML = "<p>Error loading posts.</p>";
  } finally {
    loadingSpinner.style.display = "none";
  }
}

// Function to fetch user posts and update the posts count display for the profile page
async function updatePostsCountDisplay(userId) {
  // Assume authToken is available globally or passed from a login context
  const authToken = localStorage.getItem("token"); // Example: retrieve from localStorage

  try {
    const response = await fetch(
      `${API_POSTS_BASE_URL}/users/${userId}/posts`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`, // Include authorization token
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to fetch user posts for count"
      );
    }

    const posts = await response.json();
    postsCount.textContent = posts.length; // Update the postsCount element
  } catch (error) {
    console.error("Error updating posts count:", error);
    postsCount.textContent = 0; // Set to 0 on error
  }
}

// Reusing renderBlogPost from script.js or defining it here if script.js is not loaded first
// For simplicity, assuming script.js is loaded first and renderBlogPost is globally available.
// If not, you would need to copy the function here or import it.
function renderBlogPost(post) {
  const postElement = document.createElement("div");
  postElement.classList.add("post-card");
  postElement.innerHTML = `
        <div class="post-card-header">
            <div class="post-author-info">
                <img src="${post.authorProfilePictureUrl}" alt="${
    post.authorName
  }" class="post-author-avatar">
                <span class="post-author-name"><a href="profile.html?userId=${
                  post.authorId
                }">${post.authorName}</a></span>
            </div>
            <h3><a href="../post/post.html?postId=${post.postId}">${
    post.title
  }</a></h3>
            <span class="post-date">${new Date(
              post.createdAt
            ).toLocaleDateString()}</span>
        </div>
        <div class="post-card-footer">
            <div class="post-stats">
              <span><i class="fas fa-heart"></i> ${post.likes || 0}</span>
              <span><i class="fas fa-comment"></i> ${
                post.comments ? post.comments.length : 0
              }</span>
              <span><i class="fas fa-share-alt"></i> ${
                post.shareCount || 0
              }</span>
            </div>
            <a href="../post/post.html?postId=${
              post.postId
            }" class="btn btn-sm btn-primary">Read More</a>
        </div>
    `;
  return postElement;
}
