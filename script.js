// script.js

// API Base URLs
const API_AUTH_BASE_URL =
  "https://dr7kat5az5.execute-api.us-east-1.amazonaws.com/prod"; // For authentication and profile
const API_POSTS_BASE_URL =
  "https://ymqaxl6qde.execute-api.us-east-1.amazonaws.com/prodt"; // For posts and categories

let currentPage = 0;
const postsPerPage = 10; // Number of posts to load per scroll
let isLoading = false;
let hasMorePosts = true;

// --- Header and Authentication Functions ---
async function updateHeader() {
  const headerActions = document.getElementById("headerActions");
  const userId = localStorage.getItem("userId");
  const isLoggedIn = userId !== null;

  if (isLoggedIn) {
    let profilePictureUrl =
      "https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
    let userName = "User";

    try {
      const response = await fetch(`${API_AUTH_BASE_URL}/profile/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const profile = await response.json();
        profilePictureUrl =
          profile.profilePictureUrl || "/frontend/images/default-avatar.png";
        userName = profile.name || profile.username || "User";
      } else {
        console.error(
          "Failed to fetch user profile for header:",
          await response.json()
        );
      }
    } catch (error) {
      console.error("Error fetching user profile for header:", error);
    }

    headerActions.innerHTML = `
        <div class="user-menu" style="display: flex">
          <img
            src="${profilePictureUrl}"
            alt="Avatar"
            class="user-avatar"
          />
          <span class="user-name">Hi, <strong id="userName">${userName}</strong></span>
          <a href="/dashboard/dashboard.html" class="btn btn-outline">Dashboard</a>
          <button class="btn-logout" onclick="logout()" aria-label="Logout">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      `;
  } else {
    headerActions.innerHTML = `
        <div class="auth-buttons">
          <a href="/auth/login.html" class="btn btn-outline">Log In</a>
          <a href="/auth/register.html" class="btn btn-primary">Sign Up</a>
        </div>
      `;
  }
}

function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  window.location.href = "/";
}

// --- Helper Functions for Posts ---
function extractMediaAndExcerpt(htmlContent) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  let mediaUrl = "";
  const img = doc.querySelector("img");
  const video = doc.querySelector("video");

  if (img) {
    mediaUrl = img.src;
  } else if (video) {
    mediaUrl = video.src;
  }

  const textContent = doc.body.textContent || "";
  const excerpt = textContent.substring(0, 150);
  return { mediaUrl, excerpt };
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// --- Data Fetching Functions for Posts ---
async function fetchUsername(userId) {
  try {
    console.log(`Attempting to fetch username for userId: ${userId}`);
    const response = await fetch(`${API_AUTH_BASE_URL}/users/${userId}`);
    if (!response.ok) {
      console.error(
        `Error fetching username for ${userId}: HTTP error! status: ${response.status}`
      );
      return "Unknown Author";
    }
    const userData = await response.json();
    console.log(`Received user data for ${userId}:`, userData);
    return userData.username || "Unknown Author";
  } catch (error) {
    console.error(`Error fetching username for ${userId}:`, error);
    return "Unknown Author";
  }
}

async function fetchAllCategories() {
  try {
    const response = await fetch(`${API_POSTS_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Received all categories data:", JSON.stringify(data, null, 2));
    console.log(
      "Full allCategories array:",
      JSON.stringify(data.items, null, 2)
    );
    return data.items || [];
  } catch (error) {
    console.error("Error fetching all categories:", error);
    return [];
  }
}

async function fetchPostCategories() {
  try {
    const response = await fetch(`${API_POSTS_BASE_URL}/post-categories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(
      "Received post-categories data:",
      JSON.stringify(data, null, 2)
    );
    return data.items || [];
  } catch (error) {
    console.error("Error fetching post-categories:", error);
    return [];
  }
}

async function fetchBlogPosts(page = 0, limit = postsPerPage) {
  const blogPostsContainer = document.getElementById("blogPosts");
  const loadingSpinner = document.getElementById("loadingSpinner");

  if (!blogPostsContainer || !loadingSpinner) {
    console.log("Required elements not found, skipping fetchBlogPosts.");
    return;
  }

  if (isLoading || !hasMorePosts) {
    return;
  }

  isLoading = true;
  loadingSpinner.style.display = "block"; // Show spinner

  try {
    const offset = page * limit;
    const postsResponse = await fetch(
      `${API_POSTS_BASE_URL}/blog-posts?offset=${offset}&limit=${limit}`
    );

    if (!postsResponse.ok) {
      throw new Error(`HTTP error! status: ${postsResponse.status}`);
    }

    const postsData = await postsResponse.json();
    const posts = postsData.items || [];

    if (!Array.isArray(posts)) {
      throw new Error(
        'Invalid API response format: "items" array not found or not an array.'
      );
    }

    if (posts.length === 0) {
      hasMorePosts = false; // No more posts to load
      loadingSpinner.innerHTML = "You are all updated!"; // Update message
      return;
    }

    // Fetch categories and post-categories only once or if needed for new posts
    // For simplicity, assuming categories are mostly static or fetched initially
    // If categories are dynamic per post, this logic might need adjustment
    const allCategories = await fetchAllCategories();
    const postCategories = await fetchPostCategories();

    let usernames = [];
    try {
      const authorPromises = posts.map((post) => fetchUsername(post.authorId));
      usernames = await Promise.all(authorPromises);
    } catch (authorError) {
      console.error(
        "Error fetching one or more author usernames:",
        authorError
      );
      usernames = posts.map(() => "Unknown Author");
    }

    posts.forEach((post, index) => {
      const { mediaUrl, excerpt } = extractMediaAndExcerpt(post.content);
      const authorUsername = usernames[index];
      const formattedDate = formatDate(post.createdAt);

      const postElement = document.createElement("div");
      postElement.classList.add("blog-post");

      postElement.innerHTML = `
          ${
            mediaUrl
              ? `<div class="blog-post-media"><img src="${mediaUrl}" alt="${post.title}" /></div>`
              : ""
          }
          <div class="blog-post-content">
            <h3 class="blog-post-title">
              <a href="post/post.html?id=${post.postId}">${post.title}</a>
            </h3>
            <div class="blog-post-meta">
              <span class="blog-post-author">By <a href="pages/profile.html?userId=${
                post.authorId
              }">${authorUsername}</a></span>
              <span class="blog-post-date">${formattedDate}</span>
            </div>
            <p class="blog-post-excerpt">${excerpt}...</p>
            <a href="post/post.html?id=${
              post.postId
            }" class="read-more">Read More</a>
          </div>
        `;
      blogPostsContainer.appendChild(postElement);
    });

    // Update categories list only if it's the first load or if new categories appear
    if (page === 0) {
      const categoriesListContainer = document.getElementById("categoriesList");
      if (categoriesListContainer) {
        const categoryIdsInPosts = new Set();
        const postCategoryCounts = {};

        postsData.items.forEach((post) => {
          // Use postsData.items for initial category count
          const linkedCategories = postCategories.filter(
            (pc) => pc.postId === post.postId
          );
          linkedCategories.forEach((pc) => {
            categoryIdsInPosts.add(pc.categoryId);
            postCategoryCounts[pc.categoryId] =
              (postCategoryCounts[pc.categoryId] || 0) + 1;
          });
        });

        const categoriesWithPosts = allCategories.filter((category) =>
          categoryIdsInPosts.has(category.categoryId)
        );

        const categoriesMap = {};
        categoriesWithPosts.forEach((category) => {
          const displayCategoryName =
            category.name.charAt(0).toUpperCase() +
            category.name.slice(1).toLowerCase();
          categoriesMap[displayCategoryName] =
            postCategoryCounts[category.categoryId] || 0;
        });

        categoriesListContainer.innerHTML = "";
        const sortedCategories = Object.keys(categoriesMap).sort();

        sortedCategories.forEach((categoryName) => {
          const postCount = categoriesMap[categoryName];
          const listItem = document.createElement("li");
          listItem.innerHTML = `
              <a href="pages/category.html?category=${encodeURIComponent(
                categoryName
              )}">
                ${categoryName} <span>${postCount}</span>
              </a>
            `;
          categoriesListContainer.appendChild(listItem);
        });
      }
    }

    currentPage++; // Increment page for next fetch
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    if (blogPostsContainer) {
      blogPostsContainer.innerHTML += "<p>Error loading more posts.</p>";
    }
  } finally {
    isLoading = false;
    loadingSpinner.style.display = "none"; // Hide spinner
  }
}

// --- Category Page Functions ---
async function fetchPostsByCategory() {
  const categoryHeroTitle = document.getElementById("categoryHeroTitle");
  const categoryPostsGrid = document.getElementById("categoryPostsGrid");
  const loadingSpinner = document.getElementById("loadingSpinner");

  if (!categoryHeroTitle || !categoryPostsGrid || !loadingSpinner) {
    console.log(
      "Required elements for category page not found, skipping fetchPostsByCategory."
    );
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const categoryName = urlParams.get("category");

  if (categoryName) {
    categoryHeroTitle.textContent = decodeURIComponent(categoryName);
  } else {
    categoryHeroTitle.textContent = "All Categories";
    categoryPostsGrid.innerHTML = "<p>No category specified in the URL.</p>";
    loadingSpinner.style.display = "none";
    return;
  }

  loadingSpinner.style.display = "block"; // Show spinner

  try {
    const allCategories = await fetchAllCategories();
    const postCategories = await fetchPostCategories();
    const postsResponse = await fetch(`${API_POSTS_BASE_URL}/blog-posts`);

    if (!postsResponse.ok) {
      throw new Error(`HTTP error! status: ${postsResponse.status}`);
    }
    const postsData = await postsResponse.json();
    let posts = postsData.items || [];

    const targetCategory = allCategories.find(
      (cat) =>
        cat.name.toLowerCase() ===
        decodeURIComponent(categoryName).toLowerCase()
    );

    if (targetCategory) {
      const postIdsInCategory = postCategories
        .filter((pc) => pc.categoryId === targetCategory.categoryId)
        .map((pc) => pc.postId);
      posts = posts.filter((post) => postIdsInCategory.includes(post.postId));
    } else {
      posts = []; // No posts for this category
    }

    if (!Array.isArray(posts)) {
      throw new Error(
        'Invalid API response format: "items" array not found or not an array.'
      );
    }

    if (posts.length === 0) {
      categoryPostsGrid.innerHTML = `<p>No posts found for "${decodeURIComponent(
        categoryName
      )}" category.</p>`;
      loadingSpinner.style.display = "none";
      return;
    }

    let usernames = [];
    try {
      const authorPromises = posts.map((post) => fetchUsername(post.authorId));
      usernames = await Promise.all(authorPromises);
    } catch (authorError) {
      console.error(
        "Error fetching one or more author usernames:",
        authorError
      );
      usernames = posts.map(() => "Unknown Author");
    }

    categoryPostsGrid.innerHTML = ""; // Clear existing content

    posts.forEach((post, index) => {
      const { mediaUrl, excerpt } = extractMediaAndExcerpt(post.content);
      const authorUsername = usernames[index];
      const formattedDate = formatDate(post.createdAt);

      const postElement = document.createElement("div");
      postElement.classList.add("blog-post", "animate-fade-in-up"); // Add animation class

      postElement.innerHTML = `
          ${
            mediaUrl
              ? `<div class="blog-post-media"><img src="${mediaUrl}" alt="${post.title}" /></div>`
              : ""
          }
          <div class="blog-post-content">
            <h3 class="blog-post-title">
              <a href="post.html?id=${post.postId}">${post.title}</a>
            </h3>
            <div class="blog-post-meta">
              <span class="blog-post-author">By ${authorUsername}</span>
              <span class="blog-post-date">${formattedDate}</span>
            </div>
            <p class="blog-post-excerpt">${excerpt}...</p>
            <a href="post.html?id=${
              post.postId
            }" class="read-more">Read More</a>
          </div>
        `;
      categoryPostsGrid.appendChild(postElement);
    });
  } catch (error) {
    console.error("Error fetching posts by category:", error);
    categoryPostsGrid.innerHTML =
      "<p>Error loading posts for this category.</p>";
  } finally {
    loadingSpinner.style.display = "none"; // Hide spinner
  }
}

// --- Infinite Scroll Logic ---
function setupInfiniteScroll() {
  const blogPostsSection = document.querySelector(".blog-posts");
  if (!blogPostsSection) {
    console.log("Blog posts section not found, infinite scroll not set up.");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const lastPostEntry = entries[0];
      if (lastPostEntry.isIntersecting && hasMorePosts && !isLoading) {
        fetchBlogPosts(currentPage);
      }
    },
    {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.1, // Trigger when 10% of the element is visible
    }
  );

  // Observe the last post in the grid
  const targetElement = document.getElementById("loadingSpinner"); // Observe the spinner
  if (targetElement) {
    observer.observe(targetElement);
  } else {
    console.error(
      "Loading spinner element not found for Intersection Observer."
    );
  }
}

// --- DOMContentLoaded Listener ---
document.addEventListener("DOMContentLoaded", function () {
  updateHeader(); // Update header on all pages

  // Conditional loading based on page
  if (document.getElementById("blogPosts")) {
    // Only on index.html
    fetchBlogPosts(currentPage);
    setupInfiniteScroll();
  }

  if (document.getElementById("categoriesGrid")) {
    // Only on pages/categories.html
    renderCategoryCards();
  }

  if (document.getElementById("featuredPostsGrid")) {
    // Only on pages/featured.html
    fetchFeaturedPosts();
  }

  if (document.getElementById("tagPostsGrid")) {
    // Only on pages/tag.html
    fetchPostsByTag();
  }

  // Add this for category page
  if (document.getElementById("categoryPostsGrid")) {
    fetchPostsByCategory();
  }

  setupScrollAnimations(); // Call the new function
});

// --- Categories Page Functions ---
async function renderCategoryCards() {
  const categoriesGrid = document.getElementById("categoriesGrid");
  if (!categoriesGrid) {
    console.log("Categories grid not found, skipping renderCategoryCards.");
    return;
  }

  try {
    const allCategories = await fetchAllCategories();
    const postCategories = await fetchPostCategories();

    const categoryPostCounts = {};
    postCategories.forEach((pc) => {
      categoryPostCounts[pc.categoryId] =
        (categoryPostCounts[pc.categoryId] || 0) + 1;
    });

    categoriesGrid.innerHTML = ""; // Clear existing content

    allCategories.forEach((category) => {
      const postCount = categoryPostCounts[category.categoryId] || 0;
      const categoryNameDisplay =
        category.name.charAt(0).toUpperCase() +
        category.name.slice(1).toLowerCase();

      const categoryCard = document.createElement("div");
      categoryCard.classList.add("category-card-item", "animate-fade-in-up");
      categoryCard.innerHTML = `
        <h3>${categoryNameDisplay}</h3>
        <p>${postCount} post${postCount === 1 ? "" : "s"}</p>
        <a href="/pages/category.html?category=${encodeURIComponent(
          category.name
        )}" class="btn btn-primary">View Posts</a>
      `;
      categoriesGrid.appendChild(categoryCard);
    });
  } catch (error) {
    console.error("Error rendering category cards:", error);
    categoriesGrid.innerHTML = "<p>Error loading categories.</p>";
  }
}

// --- Featured Posts Page Functions ---
async function fetchFeaturedPosts() {
  const featuredPostsGrid = document.getElementById("featuredPostsGrid");
  if (!featuredPostsGrid) {
    console.log("Featured posts grid not found, skipping fetchFeaturedPosts.");
    return;
  }

  try {
    // For now, fetching all posts. If a specific "featured" endpoint exists, use it here.
    const postsResponse = await fetch(`${API_POSTS_BASE_URL}/blog-posts`);
    if (!postsResponse.ok) {
      throw new Error(`HTTP error! status: ${postsResponse.status}`);
    }
    const postsData = await postsResponse.json();
    const posts = postsData.items || [];

    if (!Array.isArray(posts)) {
      throw new Error(
        'Invalid API response format: "items" array not found or not an array.'
      );
    }

    if (posts.length === 0) {
      featuredPostsGrid.innerHTML = "<p>No featured posts available.</p>";
      return;
    }

    const allCategories = await fetchAllCategories();
    const postCategories = await fetchPostCategories();

    let usernames = [];
    try {
      const authorPromises = posts.map((post) => fetchUsername(post.authorId));
      usernames = await Promise.all(authorPromises);
    } catch (authorError) {
      console.error(
        "Error fetching one or more author usernames:",
        authorError
      );
      usernames = posts.map(() => "Unknown Author");
    }

    featuredPostsGrid.innerHTML = ""; // Clear existing content

    posts.forEach((post, index) => {
      const { mediaUrl, excerpt } = extractMediaAndExcerpt(post.content);
      const authorUsername = usernames[index];
      const formattedDate = formatDate(post.createdAt);

      const postElement = document.createElement("div");
      postElement.classList.add("blog-post", "animate-fade-in-up"); // Add animation class

      postElement.innerHTML = `
          ${
            mediaUrl
              ? `<div class="blog-post-media"><img src="${mediaUrl}" alt="${post.title}" /></div>`
              : ""
          }
          <div class="blog-post-content">
            <h3 class="blog-post-title">
              <a href="post.html?id=${post.postId}">${post.title}</a>
            </h3>
            <div class="blog-post-meta">
              <span class="blog-post-author">By ${authorUsername}</span>
              <span class="blog-post-date">${formattedDate}</span>
            </div>
            <p class="blog-post-excerpt">${excerpt}...</p>
            <a href="post.html?id=${
              post.postId
            }" class="read-more">Read More</a>
          </div>
        `;
      featuredPostsGrid.appendChild(postElement);
    });
  } catch (error) {
    console.error("Error fetching featured posts:", error);
    featuredPostsGrid.innerHTML = "<p>Error loading featured posts.</p>";
  }
}

// --- Tag Page Functions ---
async function fetchPostsByTag() {
  const tagNameDisplay = document.getElementById("tagNameDisplay");
  const tagPostsGrid = document.getElementById("tagPostsGrid");
  const loadingSpinner = document.getElementById("loadingSpinner");

  if (!tagNameDisplay || !tagPostsGrid || !loadingSpinner) {
    console.log(
      "Required elements for tag page not found, skipping fetchPostsByTag."
    );
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const tagName = urlParams.get("tag");

  if (tagName) {
    tagNameDisplay.textContent = decodeURIComponent(tagName);
  } else {
    tagNameDisplay.textContent = "Unknown Tag";
    tagPostsGrid.innerHTML = "<p>No tag specified in the URL.</p>";
    loadingSpinner.style.display = "none";
    return;
  }

  loadingSpinner.style.display = "block"; // Show spinner

  try {
    // For now, fetching all posts. If a specific "tag" endpoint exists, use it here.
    // Example: `${API_POSTS_BASE_URL}/blog-posts?tag=${encodeURIComponent(tagName)}`
    const postsResponse = await fetch(`${API_POSTS_BASE_URL}/blog-posts`);
    if (!postsResponse.ok) {
      throw new Error(`HTTP error! status: ${postsResponse.status}`);
    }
    const postsData = await postsResponse.json();
    let posts = postsData.items || [];

    // Filter posts by tag if the API doesn't do it
    if (tagName) {
      const allCategories = await fetchAllCategories();
      const postCategories = await fetchPostCategories();

      const targetCategory = allCategories.find(
        (cat) => cat.name.toLowerCase() === tagName.toLowerCase()
      );

      if (targetCategory) {
        const postIdsInTag = postCategories
          .filter((pc) => pc.categoryId === targetCategory.categoryId)
          .map((pc) => pc.postId);
        posts = posts.filter((post) => postIdsInTag.includes(post.postId));
      } else {
        posts = []; // No posts for this tag
      }
    }

    if (!Array.isArray(posts)) {
      throw new Error(
        'Invalid API response format: "items" array not found or not an array.'
      );
    }

    if (posts.length === 0) {
      tagPostsGrid.innerHTML = "<p>No posts found for this tag.</p>";
      loadingSpinner.style.display = "none";
      return;
    }

    const allCategories = await fetchAllCategories(); // Re-fetch if not already in scope
    const postCategories = await fetchPostCategories(); // Re-fetch if not already in scope

    let usernames = [];
    try {
      const authorPromises = posts.map((post) => fetchUsername(post.authorId));
      usernames = await Promise.all(authorPromises);
    } catch (authorError) {
      console.error(
        "Error fetching one or more author usernames:",
        authorError
      );
      usernames = posts.map(() => "Unknown Author");
    }

    tagPostsGrid.innerHTML = ""; // Clear existing content

    posts.forEach((post, index) => {
      const { mediaUrl, excerpt } = extractMediaAndExcerpt(post.content);
      const authorUsername = usernames[index];
      const formattedDate = formatDate(post.createdAt);

      const postElement = document.createElement("div");
      postElement.classList.add("blog-post", "animate-fade-in-up"); // Add animation class

      postElement.innerHTML = `
          ${
            mediaUrl
              ? `<div class="blog-post-media"><img src="${mediaUrl}" alt="${post.title}" /></div>`
              : ""
          }
          <div class="blog-post-content">
            <h3 class="blog-post-title">
              <a href="post.html?id=${post.postId}">${post.title}</a>
            </h3>
            <div class="blog-post-meta">
              <span class="blog-post-author">By ${authorUsername}</span>
              <span class="blog-post-date">${formattedDate}</span>
            </div>
            <p class="blog-post-excerpt">${excerpt}...</p>
            <a href="post.html?id=${
              post.postId
            }" class="read-more">Read More</a>
          </div>
        `;
      tagPostsGrid.appendChild(postElement);
    });
  } catch (error) {
    console.error("Error fetching posts by tag:", error);
    tagPostsGrid.innerHTML = "<p>Error loading posts for this tag.</p>";
  } finally {
    loadingSpinner.style.display = "none"; // Hide spinner
  }
}

// --- Scroll Animation Functions ---
function setupScrollAnimations() {
  const animatedElements = document.querySelectorAll('[class*="animate-"]');

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target); // Stop observing once animated
        }
      });
    },
    {
      root: null, // viewport
      rootMargin: "0px",
      threshold: 0.1, // Trigger when 10% of the element is visible
    }
  );

  animatedElements.forEach((element) => {
    observer.observe(element);
  });
}
