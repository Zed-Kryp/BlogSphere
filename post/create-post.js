document.addEventListener("DOMContentLoaded", async () => {
  const baseUrl =
    "https://ymqaxl6qde.execute-api.us-east-1.amazonaws.com/prodt";

  // Initialize Quill editor
  var quill = new Quill("#editor", {
    theme: "snow",
    modules: {
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ["bold", "italic", "underline"],
          ["image", "video", "code-block"], // Added "video"
        ],
        handlers: {
          image: imageHandler,
          video: videoHandler, // Custom handler for video
        },
      },
    },
  });

  // Custom handler for image and video uploads
  async function imageHandler() {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*,video/*"); // Accept both images and videos
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const fileType = file.type;
      const isImage = fileType.startsWith("image/");
      const isVideo = fileType.startsWith("video/");

      if (!isImage && !isVideo) {
        alert("Only image and video files are supported.");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = reader.result.split(",")[1]; // Get base64 part
        const fileName = file.name;
        const contentType = file.type;

        try {
          const response = await fetch(`${baseUrl}/upload-media`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              fileData: base64Data,
              fileName: fileName,
              contentType: contentType,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          const mediaUrl = result.url;

          const range = quill.getSelection();
          if (range) {
            if (isImage) {
              quill.insertEmbed(range.index, "image", mediaUrl);
            } else if (isVideo) {
              quill.insertEmbed(range.index, "video", mediaUrl);
            }
            quill.setSelection(range.index + 1); // Move cursor after inserted media
          }
        } catch (error) {
          console.error("Error uploading media:", error);
          alert(`Error uploading media: ${error.message}`);
        }
      };
    };
  }

  // Video handler can just call the imageHandler as it handles both
  async function videoHandler() {
    imageHandler();
  }

  const createPostForm = document.getElementById("createPostForm");
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("categorySelect");

  let currentUserId = localStorage.getItem("userId"); // Get current user ID

  // Redirect to login if user is not logged in
  if (!currentUserId) {
    alert("Please log in to create a post.");
    window.location.href = "/auth/login.html";
    return;
  }

  // Fetch categories and populate the dropdown
  async function fetchCategories() {
    try {
      const response = await fetch(`${baseUrl}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const categories = data.items || []; // Assuming 'items' key for scan results

      categorySelect.innerHTML = '<option value="">Select a Category</option>'; // Reset options
      categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.categoryId; // Use categoryId as value
        option.textContent = category.name; // Display category name
        categorySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Error loading categories. Please try again later.");
    }
  }

  await fetchCategories(); // Fetch categories on page load

  // Handle form submission
  createPostForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = titleInput.value;
    const content = quill.root.innerHTML;
    const selectedCategoryId = categorySelect.value;

    if (!title || !content || !selectedCategoryId) {
      alert("Please fill in all required fields (Title, Content, Category).");
      return;
    }

    const newPost = {
      title: title,
      content: content,
      authorId: currentUserId, // Automatically fetched authorId
      status: "published", // Default status
    };

    try {
      const response = await fetch(`${baseUrl}/blog-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const postId = result.id; // Get the ID of the newly created post

      // Link post to category in post-categories table
      const postCategoryLink = {
        postId: postId,
        categoryId: selectedCategoryId,
      };

      const linkResponse = await fetch(`${baseUrl}/post-categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postCategoryLink),
      });

      if (!linkResponse.ok) {
        console.warn("Failed to link post to category:", linkResponse.status);
        alert(
          "Blog post created, but failed to link to category. Please check backend logs."
        );
      }

      alert("Blog post created successfully!");
      createPostForm.reset();
      quill.setContents([{ insert: "\n" }]); // Clear Quill editor
      categorySelect.value = ""; // Reset category dropdown
      window.location.href = `/post/post.html?id=${postId}`; // Redirect to new post
    } catch (error) {
      console.error("Error creating blog post:", error);
      alert(`Error creating blog post: ${error.message}`);
    }
  });
});
