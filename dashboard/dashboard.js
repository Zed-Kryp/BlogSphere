document.addEventListener("DOMContentLoaded", () => {
  // const profileDetailsDiv = document.getElementById("profile-details"); // This div is now removed from HTML
  const editProfileBtn = document.getElementById("edit-profile-btn");
  const editProfileFormSection = document.getElementById("edit-profile-form");
  const profileForm = document.getElementById("profile-form");
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  const sidebarLogoutBtn = document.getElementById("sidebar-logout-btn");

  const profilePictureInput = document.getElementById("profilePictureUrl");
  const profilePicturePreview = document.getElementById(
    "profilePicturePreview"
  );

  const dashboardSections = document.querySelectorAll(".dashboard-section");
  const sidebarBtns = document.querySelectorAll(".sidebar-btn");

  // Base URL for your API Gateway endpoint
  // IMPORTANT: This URL was updated by the user. Ensure it's correct.
  const API_AUTH_BASE_URL =
    "https://dr7kat5az5.execute-api.us-east-1.amazonaws.com/prod"; // For authentication and profile
  const API_POSTS_BASE_URL =
    "https://ymqaxl6qde.execute-api.us-east-1.amazonaws.com/prodt"; // For posts and bookmarks

  let currentUserId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage after login
  let authToken = localStorage.getItem("token"); // Assuming JWT token is stored in localStorage

  if (!currentUserId) {
    alert("You are not logged in. Redirecting to login page.");
    window.location.href = "../auth/login.html"; // Adjust path as needed
    return;
  }

  // Function to fetch and display user profile
  async function fetchUserProfile() {
    try {
      const response = await fetch(
        `${API_AUTH_BASE_URL}/profile/${currentUserId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${authToken}` // Include if profile API also requires token
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch profile");
      }

      const profile = await response.json();
      displayUserProfile(profile);
      populateProfileForm(profile);
      await updatePostsCountDisplay(); // Call to update posts count after profile is loaded
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Removed profileDetailsDiv.innerHTML as it's no longer used for error display
      // Consider a more robust error display mechanism if needed
    }
  }

  // Function to fetch user posts and update the posts count display
  async function updatePostsCountDisplay() {
    try {
      const response = await fetch(
        `${API_POSTS_BASE_URL}/users/${currentUserId}/posts`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, // Include JWT token
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

  // Get new elements for Instagram-like profile header
  const profilePictureDisplay = document.getElementById(
    "profilePictureDisplay"
  );
  const profileUsernameDisplay = document.getElementById(
    "profileUsernameDisplay"
  );
  const profileNameDisplay = document.getElementById("profileNameDisplay");
  const profileBioDisplay = document.getElementById("profileBioDisplay");
  const postsCount = document.getElementById("postsCount");
  const followersCount = document.getElementById("followersCount");
  const followingCount = document.getElementById("followingCount");

  // Function to display user profile details
  function displayUserProfile(profile) {
    // Update Instagram-like header elements
    profilePictureDisplay.src =
      profile.profilePictureUrl ||
      "https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
    profileUsernameDisplay.textContent = `@${profile.username || "N/A"}`;
    profileNameDisplay.textContent = profile.name || "";
    profileBioDisplay.textContent = profile.bio || "No bio yet.";

    // Update stats (followers and following still come from profile)
    followersCount.textContent =
      profile.followers !== undefined ? profile.followers : 0;
    followingCount.textContent =
      profile.following !== undefined ? profile.following : 0;
    // postsCount is now updated by updatePostsCountDisplay()

    // Populate the new "About Me" section
    document.getElementById("profileGenderDisplay").textContent =
      profile.gender || "N/A";
    document.getElementById("profileAgeDisplay").textContent =
      profile.age !== undefined ? profile.age : "N/A";
    document.getElementById("profileDobDisplay").textContent =
      profile.dob || "N/A";
    document.getElementById("profilePhoneNumberDisplay").textContent =
      profile.phoneNumber || "N/A";
    document.getElementById("profileEducationDisplay").textContent =
      profile.education || "N/A";
    document.getElementById("profileStatusDisplay").textContent =
      profile.status || "N/A";
    document.getElementById("profileAddressDisplay").textContent =
      profile.address || "N/A";
  }

  // Function to populate the edit profile form
  function populateProfileForm(profile) {
    // Set the current profile picture URL to the preview image in the form
    const currentProfilePicUrl =
      profile.profilePictureUrl || "/frontend/images/default-avatar.png";
    profilePicturePreview.src = currentProfilePicUrl;
    profilePicturePreview.style.display = "block"; // Always show preview if there's a default or actual pic

    document.getElementById("name").value = profile.name || "";
    document.getElementById("username").value = profile.username || "";
    document.getElementById("email").value = profile.email || "";
    document.getElementById("bio").value = profile.bio || "";
    document.getElementById("gender").value = profile.gender || ""; // Now a select
    document.getElementById("age").value =
      profile.age !== undefined ? profile.age : "";
    document.getElementById("dob").value = profile.dob || "";
    document.getElementById("phoneNumber").value = profile.phoneNumber || "";
    document.getElementById("education").value = profile.education || "";
    document.getElementById("status").value = profile.status || ""; // Now a select
    document.getElementById("address").value = profile.address || "";
  }

  // Event listener for file input change to show preview
  profilePictureInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePicturePreview.src = e.target.result;
        profilePicturePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      profilePicturePreview.src = "";
      profilePicturePreview.style.display = "none";
    }
  });

  // Event listener for Edit Profile button
  editProfileBtn.addEventListener("click", () => {
    document.getElementById("profile").style.display = "none";
    editProfileFormSection.style.display = "block";
  });

  // Event listener for Cancel button in edit form
  cancelEditBtn.addEventListener("click", () => {
    editProfileFormSection.style.display = "none";
    document.getElementById("profile").style.display = "block";
    profilePictureInput.value = ""; // Clear selected file
    // Re-fetch to restore original profile picture and form data if not saved
    fetchUserProfile();
  });

  // Event listener for profile form submission
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const file = profilePictureInput.files[0];
    let newProfilePictureUrl = "";

    if (file) {
      // Step 1: Get pre-signed URL from backend
      try {
        const getUploadUrlResponse = await fetch(
          `${API_AUTH_BASE_URL}/profile/upload-url`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // 'Authorization': `Bearer ${authToken}` // Include if profile API also requires token
            },
            body: JSON.stringify({
              userId: currentUserId, // Include userId for the Lambda function
              fileName: file.name,
              fileType: file.type,
            }),
          }
        );

        if (!getUploadUrlResponse.ok) {
          const errorData = await getUploadUrlResponse.json();
          throw new Error(errorData.error || "Failed to get upload URL");
        }

        const { uploadUrl, fileUrl } = await getUploadUrlResponse.json();
        newProfilePictureUrl = fileUrl; // This is the public URL to save to DynamoDB

        // Step 2: Upload file directly to S3 using the pre-signed URL
        const uploadToS3Response = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadToS3Response.ok) {
          const errorText = await uploadToS3Response.text();
          console.error(
            "S3 upload response status:",
            uploadToS3Response.status
          );
          console.error("S3 upload response text:", errorText);
          throw new Error(`Failed to upload file to S3: ${errorText}`);
        }
        alert("Profile picture uploaded to S3 successfully!");
      } catch (error) {
        console.error("Error during S3 upload process:", error);
        alert(`Error uploading profile picture: ${error.message}`);
        return; // Stop if S3 upload fails
      }
    } else {
      // If no new file selected, keep the existing profile picture URL
      // This assumes populateProfileForm sets the preview src, which we can use
      newProfilePictureUrl = profilePicturePreview.src;
      // If the current src is empty or default, it means no custom picture
      if (
        newProfilePictureUrl.includes("default-avatar.png") ||
        newProfilePictureUrl === window.location.origin + "/"
      ) {
        newProfilePictureUrl = ""; // Or keep the default path if that's preferred for DB
      }
    }

    const updatedProfile = {
      profilePictureUrl: newProfilePictureUrl, // Use the new S3 URL or existing URL
      name: document.getElementById("name").value,
      bio: profileForm.bio.value,
      gender: profileForm.gender.value, // Now a select
      age: profileForm.age.value ? parseInt(profileForm.age.value) : null,
      dob: profileForm.dob.value,
      phoneNumber: profileForm.phoneNumber.value,
      education: profileForm.education.value,
      status: profileForm.status.value, // Now a select
      address: profileForm.address.value,
    };

    try {
      const response = await fetch(
        `${API_AUTH_BASE_URL}/profile/${currentUserId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // 'Authorization': `Bearer ${authToken}` // Include if profile API also requires token
          },
          body: JSON.stringify(updatedProfile),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      const result = await response.json();
      alert("Profile updated successfully!");
      console.log("Updated profile:", result);

      // Re-fetch and display updated profile
      fetchUserProfile();

      // Hide form and show profile details
      editProfileFormSection.style.display = "none";
      document.getElementById("profile").style.display = "block";
      profilePictureInput.value = ""; // Clear file input after successful save
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(`Error updating profile: ${error.message}`);
    }
  });

  // Logout functionality (now using sidebarLogoutBtn)
  sidebarLogoutBtn.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("userId");
    localStorage.removeItem("username"); // Assuming username is also stored
    localStorage.removeItem("email"); // Assuming email is also stored
    localStorage.removeItem("token"); // If you use tokens
    alert("You have been logged out.");
    window.location.href = "../auth/login.html"; // Redirect to login page
  });

  // --- Sidebar Navigation Logic ---
  sidebarBtns.forEach((button) => {
    button.addEventListener("click", () => {
      const targetSectionId = button.dataset.section;

      // Remove active class from all buttons and sections
      sidebarBtns.forEach((btn) => btn.classList.remove("active"));
      dashboardSections.forEach((section) => (section.style.display = "none"));

      // Add active class to clicked button
      button.classList.add("active");

      // Display the target section
      document.getElementById(targetSectionId).style.display = "block";

      // Special handling for profile section to ensure form is hidden
      if (targetSectionId === "profile") {
        editProfileFormSection.style.display = "none";
      }

      // Call specific fetch functions if needed
      if (targetSectionId === "posts") {
        fetchUserPosts();
      } else if (targetSectionId === "bookmarks") {
        fetchBookmarkedPosts();
      }
    });
  });

  // Initial fetch of user profile when the page loads
  fetchUserProfile();

  // --- Posts and Bookmarks functionality ---
  async function fetchUserPosts() {
    const userPostsDiv = document.getElementById("user-posts");
    userPostsDiv.innerHTML = "<p>Loading your posts...</p>";
    try {
      const response = await fetch(
        `${API_POSTS_BASE_URL}/users/${currentUserId}/posts`, // Updated endpoint
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, // Include JWT token
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch user posts");
      }

      const posts = await response.json();

      if (posts.length === 0) {
        userPostsDiv.innerHTML =
          "<p>No posts found yet. Start creating some!</p>";
        return;
      }

      userPostsDiv.innerHTML = ""; // Clear loading message
      posts.forEach((post) => {
        const postElement = document.createElement("div");
        postElement.classList.add("post-card"); // New class for styling
        postElement.innerHTML = `
          <div class="post-card-header">
            <h3><a href="/post/post.html?id=${post.postId}">${
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
            <a href="/post/post.html?id=${
              post.postId
            }" class="btn btn-sm btn-primary">Read More</a>
          </div>
        `;
        userPostsDiv.appendChild(postElement);
      });
    } catch (error) {
      console.error("Error fetching user posts:", error);
      userPostsDiv.innerHTML = `<p style="color: red;">Error loading posts: ${error.message}</p>`;
    }
  }

  async function fetchBookmarkedPosts() {
    const bookmarkedPostsDiv = document.getElementById("bookmarked-posts");
    bookmarkedPostsDiv.innerHTML = "<p>Loading your bookmarked posts...</p>";
    try {
      const response = await fetch(
        `${API_POSTS_BASE_URL}/users/${currentUserId}/bookmarks`, // Updated endpoint
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, // Include JWT token
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch bookmarked posts");
      }

      const bookmarkedPosts = await response.json(); // Renamed from 'bookmarks' to 'bookmarkedPosts'

      if (bookmarkedPosts.length === 0) {
        bookmarkedPostsDiv.innerHTML = "<p>No bookmarked posts found yet.</p>";
        return;
      }

      bookmarkedPostsDiv.innerHTML = ""; // Clear loading message
      bookmarkedPosts.forEach((post) => {
        // Iterate through posts directly
        const bookmarkElement = document.createElement("div");
        bookmarkElement.classList.add("post-card"); // Use the same card style
        bookmarkElement.innerHTML = `
          <div class="post-card-header">
            <h3><a href="/post/post.html?id=${post.postId}">${
          post.title
        }</a></h3>
            <span class="post-author">By: ${post.authorUsername || "N/A"}</span>
          </div>
          <div class="post-card-footer">
            <a href="/post/post.html?id=${
              post.postId
            }" class="btn btn-sm btn-outline">View Post</a>
          </div>
        `;
        bookmarkedPostsDiv.appendChild(bookmarkElement);
      });
    } catch (error) {
      console.error("Error fetching bookmarked posts:", error);
      bookmarkedPostsDiv.innerHTML = `<p style="color: red;">Error loading bookmarks: ${error.message}</p>`;
    }
  }

  // Ensure the initial active section is displayed
  document.getElementById("profile").style.display = "block";
});
