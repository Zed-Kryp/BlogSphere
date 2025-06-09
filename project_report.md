# Project Report: BlogSphere

This report details the architecture, design, and functionality of the BlogSphere project, analyzing each folder as a unit and each HTML page as a chapter.

## Root Level Files

The root directory contains the main entry point of the application (`index.html`), global styles (`styles.css`), and core JavaScript logic (`script.js`, `script-profile.js`). It also includes a 404 error page and an API documentation file.

### Chapter 1: Home Page (`index.html`)

The `index.html` file serves as the landing page for BlogSphere, providing an overview of the latest blog posts, featured content, and trending topics.

**Design:**
The page features a sticky header with navigation, a hero section, sections for featured posts and trending topics, a main content area with a blog posts column and a sidebar, and a footer. It uses a responsive design with media queries defined in `styles.css`.

**Logic & Functionality:**
The page dynamically loads content using JavaScript, specifically `script.js`.

**Code Snippet (index.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BlogSphere - Discover & Share Amazing Stories</title>
    <!-- ... other head elements ... -->
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <!-- ======= Header ======= -->
    <header class="sticky-header">
      <!-- ... header content ... -->
    </header>

    <div class="search-overlay">
      <!-- ... search overlay content ... -->
    </div>

    <!-- ======= Hero Section ======= -->
    <section class="hero">
      <!-- ... hero content ... -->
    </section>

    <!-- ======= Featured Posts ======= -->
    <section class="featured-posts" id="featured"></section>

    <!-- ======= Trending Topics ======= -->
    <section class="trending-topics"></section>

    <!-- ======= Main Content Area ======= -->
    <main class="main-content">
      <div class="container content-grid">
        <!-- ======= Posts Column ======= -->
        <section class="posts-column">
          <section class="blog-posts">
            <div class="container">
              <h2 class="section-title">Latest Blog Posts</h2>
              <div class="blog-grid" id="blogPosts"></div>
              <div
                id="loadingSpinner"
                class="loading-spinner"
                style="display: none;"
              >
                <i class="fas fa-spinner fa-spin"></i> Loading more posts...
              </div>
            </div>
          </section>
        </section>

        <!-- ======= Sidebar ======= -->
        <aside class="sidebar">
          <!-- ... sidebar widgets ... -->
        </aside>
      </div>
    </main>

    <!-- Back to Top Button -->
    <button class="back-to-top" aria-label="Back to top">
      <i class="fas fa-arrow-up"></i>
    </button>

    <!-- Scripts -->
    <script src="script.js"></script>
    <script>
      updateHeader(); // Call the function from script.js
    </script>
  </body>
</html>
```

### Global Styles (`styles.css`)

The `styles.css` file defines the overall visual design of the BlogSphere website. It uses CSS variables for consistent theming and includes responsive design principles.

**Design Principles:**

- **Variables:** Extensive use of `--primary-color`, `--dark-color`, `--font-primary`, `--font-secondary`, `--font-mono`, etc., for easy theme management.
- **Typography:** Imports Google Fonts (Poppins, Open Sans, Fira Code) for distinct headings, body text, and code.
- **Layout:** Uses Flexbox and CSS Grid for responsive layouts, such as the header, content grid, and post grids.
- **Components:** Styles for common UI elements like buttons, forms, cards (featured, topic, blog post), and widgets.
- **Responsiveness:** Media queries adjust layouts and font sizes for various screen sizes (e.g., `max-width: 1024px`, `768px`, `576px`).
- **Animations:** Defines CSS keyframe animations (`fade-in`, `fade-in-up`, `pop-in`) for subtle visual effects on elements as they appear.

**Code Snippet (CSS Variables):**

```css
:root {
  --primary-color: #4361ee;
  --primary-dark: #3a56d4;
  --secondary-color: #3f77c9;
  --accent-color: #4895ef;
  --light-color: #f8f9fa;
  --dark-color: #212529;
  --gray-color: #6c757d;
  --light-gray: #e9ecef;
  --success-color: #4bb543;
  --error-color: #f44336;
  --warning-color: #ff9800;
  --font-primary: "Poppins", sans-serif;
  --font-secondary: "Open Sans", sans-serif;
  --font-mono: "Fira Code", monospace;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1), 0 5px 10px rgba(0, 0, 0, 0.05);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --transition: all 0.3s ease;
}
```

### Core JavaScript Logic (`script.js`)

The `script.js` file handles dynamic content loading, user authentication status, and interactive elements across various pages, particularly the home page.

**Logic & Functionality:**

- **API Integration:** Defines base URLs for authentication and post-related APIs.
- **Header Update (`updateHeader`):** Checks `localStorage` for `userId`

---

## Folder: `auth/`

The `auth/` folder contains all files related to user authentication, including login, registration, forgot password, and reset password functionalities. It interacts with a dedicated authentication API.

### Chapter 2: Login Page (`auth/login.html`)

The `login.html` page provides the interface for users to log into their BlogSphere accounts.

**Design:**
The page features a split layout with a branding section on one side (showing the BlogSphere logo, a welcome message, and an illustration) and a login form on the other. It uses a clean, modern design with input fields for email and password, "remember me" checkbox, "forgot password" link, and social login options. Animations are applied to elements on load for a dynamic feel.

**Logic & Functionality:**
The login functionality is primarily handled by `auth.js`.

**Code Snippet (auth/login.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>BlogSphere</title>
    <!-- ... typography and font awesome ... -->
    <link rel="stylesheet" href="/styles.css" />
    <link rel="stylesheet" href="/auth/auth.css" />
  </head>
  <body class="auth-page">
    <div class="auth-container animate-fade-in">
      <div class="auth-branding animate-fade-in-left">
        <a href="/index.html" class="logo">BlogSphere</a>
        <h1 class="animate-fade-in-up">Welcome back to your community</h1>
        <p class="animate-fade-in-up">
          Log in to access your personalized dashboard, saved articles, and
          writing tools.
        </p>
        <img
          src="/images/Aurora.png"
          alt="Login illustration"
          class="auth-illustration animate-fade-in-up"
        />
      </div>

      <div class="auth-form-container">
        <div class="auth-form-header">
          <h2>Log In</h2>
          <p>
            Don't have an account? <a href="/auth/register.html">Sign up</a>
          </p>
        </div>

        <form id="loginForm" class="auth-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-with-icon">
              <i class="fas fa-envelope"></i>
              <input
                type="email"
                id="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div class="error-message" id="email-error"></div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-with-icon">
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                required
              />
              <label class="checkbox-container show-password-checkbox">
                <input type="checkbox" id="showPassword" />
                <span class="checkmark"></span>
                Show Password
              </label>
            </div>
            <div class="error-message" id="password-error"></div>
          </div>
          <div class="form-options">
            <label for="remember">
              <input type="checkbox" id="remember" />
              Remember me
            </label>
            <a href="/auth/forgot-password.html">Forgot password?</a>
          </div>

          <button type="submit" class="btn btn-primary btn-block">
            Log In
          </button>

          <div class="auth-divider">
            <span>or continue with</span>
          </div>

          <div class="social-auth">
            <button type="button" class="btn btn-outline btn-social">
              <i class="fab fa-google"></i> Google
            </button>
            <button type="button" class="btn btn-outline btn-social">
              <i class="fab fa-twitter"></i> Twitter
            </button>
          </div>
        </form>

        <div class="auth-footer">
          By logging in, you agree to our
          <a href="/pages/terms.html">Terms of Service</a> and
          <a href="/pages/privacy.html">Privacy Policy</a>.
        </div>
      </div>
    </div>

    <script src="/script.js"></script>
    <script src="/auth/auth.js"></script>
  </body>
</html>
```

### Authentication Styles (`auth/auth.css`)

The `auth.css` file provides specific styling for the authentication pages, building upon the global styles defined in `styles.css`.

**Design Principles:**

- **Layout:** Uses Flexbox to create the split-screen layout for authentication forms and branding.
- **Theming:** Leverages CSS variables from `styles.css` for consistent colors, fonts, shadows, and border radii.
- **Form Elements:** Customizes input fields, buttons, checkboxes, and error messages to match the overall design system.
- **Branding Section:** Styles the background gradient, logo, headings, and illustration within the branding area.
- **Responsiveness:** Media queries adjust the layout for smaller screens, stacking the branding and form sections vertically.

**Code Snippet (auth/auth.css - Auth Container):**

```css
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  box-sizing: border-box;
}

.auth-container {
  background-color: white;
  box-shadow: var(--shadow-lg);
  display: flex;
  border-radius: var(--radius-lg);
  overflow: hidden;
  max-width: 1100px;
  width: 100%;
  flex-direction: row;
  transition: var(--transition);
}
```

### Authentication JavaScript Logic (`auth/auth.js`)

The `auth.js` file contains the core client-side logic for user authentication, including form handling, validation, API communication, and local storage management.

**Logic & Functionality:**

- **API Base URL:** Defines `baseURL` for authentication API endpoints.
- **Redirection:** `isLoggedIn()` checks `localStorage` for `userId`. If a user is logged in, `redirectToDashboard()` redirects them to the home page (`/index.html`) if they try to access authentication pages (login, register, forgot/reset password).
- **Password Visibility Toggle (`setupPasswordToggles`):** Iterates through "show password" checkboxes and toggles the `type` attribute of the associated password input field between `password` and `text`.
- **Password Strength Meter (`setupPasswordStrengthMeter`, `calculatePasswordStrength`):**
  - `calculatePasswordStrength`: Evaluates password strength based on length, uppercase letters, numbers, and special characters, returning a score and a message.
  - `setupPasswordStrengthMeter`: Attaches an `input` event listener to password fields to dynamically update visual strength bars and text based on the calculated strength.
- **Form Validation (`setupFormValidation`, `validateInput`, `isValidEmail`, `showError`, `clearError`):**
  - Attaches a `blur` and `input` event listeners to required form fields.
  - `validateInput`: Performs validation checks for email format, password length (min 8 characters), and checkbox acceptance.
  - `showError`/`clearError`: Displays or hides error messages below input fields and updates input border colors.
  - Includes special validation for password confirmation to ensure it matches the main password.
- **API Request Helper (`sendRequest`):** A generic asynchronous function to send HTTP requests to the defined API `baseURL`. It handles JSON serialization, response parsing, and error handling.

  ```javascript
  const sendRequest = async (method, endpoint, data = {}, pathParam = "") => {
    const url = pathParam ? `${baseURL}/${pathParam}` : `${baseURL}${endpoint}`;
    const config = {
      method,
      headers: { "Content-Type": "application/json" },
      body: method === "GET" ? undefined : JSON.stringify(data),
    };

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || "Request failed");
      }
      return result;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };
  ```

````

- **User ID Generation (`generateUserId`):** Creates a simple unique user ID for new registrations.
- **Form Submission Handler (`attachFormHandler`):**
  - Attaches a `submit` event listener to forms.
  - Prevents default form submission.
  - Performs client-side validation on all required inputs.
  - Collects form data.
  - Handles specific logic for `register`, `login`, `forgotPassword`, and `resetPassword` forms, including:
    - Generating `userId` for registration.
    - Storing `userId`, `username`, and `email` in `localStorage` upon successful login/registration.
    - Redirecting to the home page after login/registration.
    - Displaying success/error messages (using `alert` for simplicity).
  - Manages loading state for the submit button (showing/hiding spinner, disabling/enabling button).
- **Initialization (`init`):** Called on `DOMContentLoaded` to set up all authentication-related functionalities: password toggles, strength meters, form validation, and form handlers.
- **Global Logout (`window.logout`):** A globally accessible function to clear `localStorage` and redirect to the home page, used by the main `script.js` for the header logout button.

### Other Authentication Files

- **`auth/register.html`**: The registration page, similar in structure to `login.html`, allowing new users to create an account. It uses `auth.css` for styling and `auth.js` for logic.
- **`auth/forgot-password.html`**: A page for users to request a password reset token, using `auth.css` and `auth.js`.
- **`auth/reset-password.html`**: A page for users to reset their password using a token, also styled by `auth.css` and powered by `auth.js`.
- **`auth/apigateway.yaml`**: This file likely defines the AWS API Gateway configuration for the authentication backend, detailing endpoints, methods, and integrations (e.g., with Lambda functions).
- **`auth/lambda.py`**: This is a Python file, likely an AWS Lambda function that handles the backend logic for authentication operations (e.g., user registration, login, password reset). It would interact with a database (like DynamoDB or Cognito) to manage user data.
- **`auth/post.py`**: This is another Python file, potentially an AWS Lambda function or a utility script related to handling post-authentication processes or user data management on the backend. Its exact purpose would require further inspection of its code.

---

## Folder: `dashboard/`

The `dashboard/` folder contains files related to the user's personalized dashboard, where they can manage their profile, view their posts, and access bookmarked articles.

### Chapter 3: User Dashboard (`dashboard/dashboard.html`)

The `dashboard.html` page provides a central hub for logged-in users to manage their account and content.

**Design:**
The page features a two-column layout: a narrow, Instagram-like sidebar for navigation (Profile, My Posts, Bookmarks, Logout) and a main content area that displays the selected section. The profile section includes a large profile picture, username, name, bio, and statistics (posts, followers, following), along with an "About Me" grid for detailed personal information. An "Edit Profile" form is dynamically shown/hidden. The "My Posts" and "Bookmarks" sections display lists of posts using a card-based layout.

**Logic & Functionality:**
The dashboard's dynamic behavior is driven by `dashboard.js`.

**Code Snippet (dashboard/dashboard.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>User Dashboard - BlogSphere</title>
    <!-- ... other head elements ... -->
    <link rel="stylesheet" href="../styles.css" />
    <link rel="stylesheet" href="dashboard.css" />
  </head>
  <body>
    <!-- ======= Header ======= -->
    <header class="sticky-header">
      <!-- ... header content ... -->
    </header>

    <div class="search-overlay">
      <!-- ... search overlay content ... -->
    </div>

    <main class="dashboard-main">
      <div class="dashboard-container animate-fade-in">
        <aside class="dashboard-sidebar instagram-sidebar animate-fade-in-left">
          <nav class="sidebar-nav">
            <ul>
              <li>
                <button
                  class="sidebar-btn active animate-fade-in-up"
                  data-section="profile"
                >
                  <i class="fas fa-user"></i> Profile
                </button>
              </li>
              <li>
                <button
                  class="sidebar-btn animate-fade-in-up"
                  data-section="posts"
                  style="animation-delay: 0.2s;"
                >
                  <i class="fas fa-file-alt"></i> My Posts
                </button>
              </li>
              <li>
                <button
                  class="sidebar-btn animate-fade-in-up"
                  data-section="bookmarks"
                  style="animation-delay: 0.4s;"
                >
                  <i class="fas fa-bookmark"></i> Bookmarks
                </button>
              </li>
              <li>
                <button
                  class="sidebar-btn animate-fade-in-up"
                  id="sidebar-logout-btn"
                  style="animation-delay: 0.6s;"
                >
                  <i class="fas fa-sign-out-alt"></i> Logout
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        <section class="dashboard-content animate-fade-in-right">
          <section id="profile" class="dashboard-section active">
            <div class="instagram-profile-header animate-fade-in-up">
              <div class="profile-avatar-container animate-pop-in">
                <img
                  id="profilePictureDisplay"
                  src="https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Profile Picture"
                  class="profile-picture-large"
                />
              </div>
              <div class="profile-info-main profile-details-container">
                <div class="profile-username-actions animate-fade-in-up">
                  <h2 id="profileUsernameDisplay">@username</h2>
                  <button
                    id="edit-profile-btn"
                    class="btn btn-secondary animate-pop-in"
                    style="animation-delay: 0.2s;"
                  >
                    Edit Profile
                  </button>
                  <button
                    class="btn btn-outline animate-pop-in"
                    style="animation-delay: 0.4s;"
                  >
                    View Archive
                  </button>
                </div>
                <div
                  class="profile-stats-instagram animate-fade-in-up"
                  style="animation-delay: 0.6s;"
                >
                  <div class="stat-item">
                    <span class="stat-number" id="postsCount">0</span>
                    <span class="stat-label">posts</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number" id="followersCount">0</span>
                    <span class="stat-label">followers</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number" id="followingCount">0</span>
                    <span class="stat-label">following</span>
                  </div>
                </div>
                <div
                  class="profile-name-bio animate-fade-in-up"
                  style="animation-delay: 0.8s;"
                >
                  <p class="profile-name-display" id="profileNameDisplay">
                    Full Name
                  </p>
                  <p class="profile-bio-display" id="profileBioDisplay">
                    Bio goes here.
                  </p>
                </div>
              </div>
            </div>
            <div
              class="profile-about-me animate-fade-in-up"
              style="animation-delay: 1s;"
            >
              <h3>About Me</h3>
              <div class="profile-info-grid">
                <p>
                  <strong>Gender:</strong>
                  <span id="profileGenderDisplay">N/A</span>
                </p>
                <p>
                  <strong>Age:</strong> <span id="profileAgeDisplay">N/A</span>
                </p>
                <p>
                  <strong>Date of Birth:</strong>
                  <span id="profileDobDisplay">N/A</span>
                </p>
                <p>
                  <strong>Phone:</strong>
                  <span id="profilePhoneNumberDisplay">N/A</span>
                </p>
                <p>
                  <strong>Education:</strong>
                  <span id="profileEducationDisplay">N/A</span>
                </p>
                <p>
                  <strong>Status:</strong>
                  <span id="profileStatusDisplay">N/A</span>
                </p>
                <p>
                  <strong>Address:</strong>
                  <span id="profileAddressDisplay">N/A</span>
                </p>
              </div>
            </div>
          </section>

          <section
            id="edit-profile-form"
            class="dashboard-section animate-fade-in-up"
            style="display: none"
          >
            <h2>Edit Profile</h2>
            <form id="profile-form" class="modern-form">
              <div class="form-group profile-picture-upload">
                <label for="profilePictureUrl">Profile Picture:</label>
                <div class="profile-picture-wrapper">
                  <img
                    id="profilePicturePreview"
                    src=""
                    alt="Profile Picture Preview"
                    class="profile-picture-preview"
                  />
                  <input
                    type="file"
                    id="profilePictureUrl"
                    name="profilePictureUrl"
                    accept="image/*"
                    class="file-input"
                  />
                  <label for="profilePictureUrl" class="custom-file-upload">
                    <i class="fas fa-upload"></i> Choose File
                  </label>
                </div>
              </div>

              <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required />
              </div>

              <div class="form-group">
                <label for="username">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  required
                  disabled
                />
              </div>

              <div class="form-group">
                <label for="email">Email:</label>
                <input type="email" id="email" name="email" required disabled />
              </div>

              <div class="form-group">
                <label for="bio">Bio:</label>
                <textarea id="bio" name="bio"></textarea>
              </div>

              <div class="form-group">
                <label for="gender">Gender:</label>
                <select id="gender" name="gender">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label for="age">Age:</label>
                <input type="number" id="age" name="age" />
              </div>

              <div class="form-group">
                <label for="dob">Date of Birth:</label>
                <input type="date" id="dob" name="dob" />
              </div>

              <div class="form-group">
                <label for="phoneNumber">Phone Number:</label>
                <input type="text" id="phoneNumber" name="phoneNumber" />
              </div>

              <div class="form-group">
                <label for="education">Education:</label>
                <input type="text" id="education" name="education" />
              </div>

              <div class="form-group">
                <label for="status">Status:</label>
                <select id="status" name="status">
                  <option value="">Select Status</option>
                  <option value="Student">Student</option>
                  <option value="Working">Working</option>
                  <option value="Author">Author</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Business">Business</option>
                </select>
              </div>

              <div class="form-group">
                <label for="address">Address:</label>
                <textarea id="address" name="address"></textarea>
              </div>

              <div class="form-actions animate-fade-in-up">
                <button
                  type="submit"
                  class="btn btn-primary animate-pop-in"
                  style="animation-delay: 0.2s;"
                >
                  <i class="fas fa-save"></i> Save Changes
                </button>
                <button
                  type="button"
                  id="cancel-edit-btn"
                  class="btn btn-outline animate-pop-in"
                  style="animation-delay: 0.4s;"
                >
                  <i class="fas fa-times"></i> Cancel
                </button>
              </div>
            </form>
          </section>

          <section
            id="posts"
            class="dashboard-section animate-fade-in-up"
            style="display: none"
          >
            <h2>My Posts</h2>
            <div id="user-posts" class="posts-grid">
              <p>Loading posts...</p>
              <!-- User's posts will be loaded here by JavaScript -->
            </div>
          </section>

          <section
            id="bookmarks"
            class="dashboard-section animate-fade-in-up"
            style="display: none"
          >
            <h2>My Bookmarks</h2>
            <div id="bookmarked-posts" class="bookmarks-grid">
              <p>Loading bookmarks...</p>
              <!-- Bookmarked posts will be loaded here by JavaScript -->
            </div>
          </section>
        </section>
      </div>
    </main>

    <!-- ======= Footer ======= -->
    <footer class="main-footer">
      <div class="container">
        <div class="footer-grid">
          <!-- About -->
          <div class="footer-about">
            <h3>BlogSphere</h3>
            <p>
              Sharing ideas that matter through thoughtful writing and community
              engagement.
            </p>
            <div class="social-links">
              <a href="#" aria-label="Twitter">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" aria-label="Facebook">
                <i class="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram"></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </body>
</html>

---

## Folder: `frontend/`

The `frontend/` folder contains React components responsible for rendering individual blog posts and their related elements.

### Chapter 4: Post Component (`frontend/Post.js`)

The `Post.js` file defines the main `Post` component, which assembles and renders the different parts of a blog post: header, content, reactions, sharing options, and comments.

**Design:**
The `Post` component acts as a container, bringing together the various sub-components to create the overall structure of a blog post. It uses CSS classes (like `blog-post-container`) defined in `styles.css` to style the post.

**Logic & Functionality:**
The `Post` component receives `postData` and `currentUserId` as props. It then calls the various sub-components, passing in the relevant data. It also determines if the current user is the author of the post.

**Code Snippet (frontend/Post.js structure):**

```javascript
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
````

### Post Header Component (`frontend/PostHeader.js`)

The `PostHeader.js` file defines the `PostHeader` component, which renders the title, author, date, and bookmark/follow buttons for a blog post.

**Design:**
The `PostHeader` component uses CSS classes (like `post-header`, `post-meta`, `author-name`, `post-date`, `follow-btn`, `bookmark-btn`) defined in `styles.css` to style the header.

**Logic & Functionality:**
The `PostHeader` component receives `postData` and `isAuthor` as props. It displays the post title, author's username, and the date the post was created. It also conditionally renders a "Follow" button if the current user is not the author, and a "Bookmark" button.

**Code Snippet (frontend/PostHeader.js structure):**

```javascript
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
```

### Post Content Component (`frontend/PostContent.js`)

The `frontend/PostContent.js` file defines the `PostContent` component, which renders the main content of a blog post, including an optional image.

**Design:**
The `PostContent` component uses CSS classes (like `post-content`, `post-image`) defined in `styles.css` to style the content.

**Logic & Functionality:**
The `PostContent` component receives `postData` as a prop. It displays the post's content and, if an `imageUrl` is provided, it renders an image above the content.

**Code Snippet (frontend/PostContent.js structure):**

```javascript
function PostContent(postData) {
  const content = postData.content || "No content available.";
  const imageUrl = postData.imageUrl;

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
```

### Post Reactions Component (`frontend/PostReactions.js`)

The `frontend/PostReactions.js` file defines the `PostReactions` component, which displays like, comment, and share counts, along with interactive buttons.

**Design:**
The `PostReactions` component uses CSS classes (like `post-reactions`, `reaction-item`, `reaction-button`) to style the reaction section. It includes icons for like, comment, and share.

**Logic & Functionality:**
The `PostReactions` component receives `postData` as a prop. It displays the number of likes, comments, and shares. It also provides interactive buttons for liking, commenting, and sharing, which would typically trigger further JavaScript functions (not shown in this snippet).

**Code Snippet (frontend/PostReactions.js structure):**

```javascript
function PostReactions(postData) {
  const likes = postData.likes || 0;
  const comments = postData.comments || 0;
  const shares = postData.shares || 0;

  return `
    <div class="post-reactions">
      <div class="reaction-item">
        <button class="reaction-button like-button">
          <i class="fas fa-thumbs-up"></i>
        </button>
        <span>${likes} Likes</span>
      </div>
      <div class="reaction-item">
        <button class="reaction-button comment-button">
          <i class="fas fa-comment"></i>
        </button>
        <span>${comments} Comments</span>
      </div>
      <div class="reaction-item">
        <button class="reaction-button share-button">
          <i class="fas fa-share"></i>
        </button>
        <span>${shares} Shares</span>
      </div>
    </div>
  `;
}

export default PostReactions;
```

### Post Share Component (`frontend/PostShare.js`)

The `frontend/PostShare.js` file defines the `PostShare` component, which provides options to share the post on various social media platforms.

**Design:**
The `PostShare` component uses CSS classes (like `post-share`, `share-button`) to style the sharing section. It includes icons for Twitter, Facebook, and LinkedIn.

**Logic & Functionality:**
The `PostShare` component receives `postData` as a prop. It generates sharing links for Twitter, Facebook, and LinkedIn based on the post's title and a placeholder URL.

**Code Snippet (frontend/PostShare.js structure):**

```javascript
function PostShare(postData) {
  const postTitle = encodeURIComponent(postData.title || "Blog Post");
  const postUrl = encodeURIComponent(window.location.href); // Placeholder for actual post URL

  return `
    <div class="post-share">
      <h3>Share this post:</h3>
      <div class="share-buttons">
        <a href="https://twitter.com/intent/tweet?text=${postTitle}&url=${postUrl}" target="_blank" class="share-button twitter">
          <i class="fab fa-twitter"></i> Twitter
        </a>
        <a href="https://www.facebook.com/sharer/sharer.php?u=${postUrl}" target="_blank" class="share-button facebook">
          <i class="fab fa-facebook-f"></i> Facebook
        </a>
        <a href="https://www.linkedin.com/shareArticle?mini=true&url=${postUrl}&title=${postTitle}" target="_blank" class="share-button linkedin">
          <i class="fab fa-linkedin-in"></i> LinkedIn
        </a>
      </div>
    </div>
  `;
}

export default PostShare;
```

### Post Comments Component (`frontend/PostComments.js`)

The `frontend/PostComments.js` file defines the `PostComments` component, which displays existing comments and provides a form for users to add new comments.

**Design:**
The `PostComments` component uses CSS classes (like `post-comments`, `comment-section`, `comment-form`, `comment-list`, `comment-item`) to style the comments section. It includes a textarea for new comments and a list to display existing comments.

**Logic & Functionality:**
The `PostComments` component receives `postData` and `currentUserId` as props. It iterates through `postData.comments` to display each comment, including the author and content. It also provides a form for users to submit new comments. The `currentUserId` is used to determine if the comment form should be displayed (i.e., if a user is logged in).

**Code Snippet (frontend/PostComments.js structure):**

```javascript
function PostComments(postData, currentUserId) {
  const comments = postData.comments || [];

  return `
    <div class="post-comments">
      <h3>Comments (${comments.length})</h3>
      ${
        currentUserId
          ? `
        <form class="comment-form">
          <textarea placeholder="Write a comment..." rows="3"></textarea>
          <button type="submit" class="btn btn-primary">Post Comment</button>
        </form>
      `
          : `<p>Please <a href="/auth/login.html">log in</a> to leave a comment.</p>`
      }
      <div class="comment-list">
        ${comments
          .map(
            (comment) => `
          <div class="comment-item">
            <p class="comment-author"><strong>${
              comment.authorUsername || "Anonymous"
            }</strong> on ${new Date(
              comment.createdAt
            ).toLocaleDateString()}</p>
            <p class="comment-content">${comment.content}</p>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  `;
}

export default PostComments;
```

---

## Folder: `pages/`

The `pages/` folder contains various static and dynamic content pages, including "About Us", "Contact", "Categories", "Privacy Policy", "Terms of Service", and user profile pages.

### Chapter 5: About Us Page (`pages/about.html`)

The `about.html` page provides information about BlogSphere, its mission, and its team.

**Design:**
The page features a clean, content-focused layout with a hero section, a mission statement, and sections for team members or project values. It uses standard typography and spacing for readability.

**Logic & Functionality:**
This is primarily a static content page. Any dynamic elements would be handled by global scripts or specific scripts if included.

**Code Snippet (pages/about.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>About Us - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <section class="hero-small">
        <div class="container">
          <h1>About BlogSphere</h1>
          <p>
            Your platform for sharing stories, ideas, and knowledge with the
            world.
          </p>
        </div>
      </section>

      <section class="content-section">
        <div class="container">
          <h2>Our Mission</h2>
          <p>
            At BlogSphere, we believe in the power of words to connect, inspire,
            and inform. Our mission is to provide a vibrant and inclusive
            platform where writers can share their unique perspectives and
            readers can discover engaging content on a wide array of topics. We
            are committed to fostering a community that values thoughtful
            discussion, creativity, and intellectual curiosity.
          </p>
          <p>
            We strive to make blogging accessible to everyone, offering
            intuitive tools for content creation and a seamless reading
            experience. Whether you're a seasoned author or just starting your
            writing journey, BlogSphere is your space to express, explore, and
            engage.
          </p>
        </div>
      </section>

      <section class="content-section bg-light-gray">
        <div class="container">
          <h2>Our Values</h2>
          <div class="values-grid">
            <div class="value-item">
              <h3><i class="fas fa-lightbulb"></i> Innovation</h3>
              <p>
                Continuously improving our platform to offer the best tools and
                features for our community.
              </p>
            </div>
            <div class="value-item">
              <h3><i class="fas fa-users"></i> Community</h3>
              <p>
                Building a supportive and interactive environment for writers
                and readers alike.
              </p>
            </div>
            <div class="value-item">
              <h3><i class="fas fa-pen-nib"></i> Creativity</h3>
              <p>
                Encouraging diverse voices and original content that sparks
                thought and discussion.
              </p>
            </div>
            <div class="value-item">
              <h3><i class="fas fa-shield-alt"></i> Integrity</h3>
              <p>
                Maintaining a platform based on respect, transparency, and
                ethical practices.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
  </body>
</html>
```

### Categories Page (`pages/categories.html`)

The `categories.html` page lists all available blog categories.

**Design:**
The page displays categories in a grid or list format, with each category potentially having an icon or image.

**Logic & Functionality:**
This page would likely fetch categories dynamically from an API and render them.

**Code Snippet (pages/categories.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Categories - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <section class="hero-small">
        <div class="container">
          <h1>Blog Categories</h1>
          <p>Explore posts by topic.</p>
        </div>
      </section>

      <section class="content-section">
        <div class="container">
          <div class="categories-grid">
            <!-- Categories will be dynamically loaded here -->
            <a href="category.html?name=Technology" class="category-card">
              <i class="fas fa-laptop-code"></i>
              <h3>Technology</h3>
              <p>Innovations, software, gadgets, and digital trends.</p>
            </a>
            <a href="category.html?name=Travel" class="category-card">
              <i class="fas fa-plane"></i>
              <h3>Travel</h3>
              <p>Destinations, adventures, and travel tips.</p>
            </a>
            <a href="category.html?name=Food" class="category-card">
              <i class="fas fa-utensils"></i>
              <h3>Food</h3>
              <p>Recipes, culinary experiences, and food culture.</p>
            </a>
            <a href="category.html?name=Health" class="category-card">
              <i class="fas fa-heartbeat"></i>
              <h3>Health & Wellness</h3>
              <p>Fitness, nutrition, mental health, and well-being.</p>
            </a>
            <a href="category.html?name=Lifestyle" class="category-card">
              <i class="fas fa-couch"></i>
              <h3>Lifestyle</h3>
              <p>Daily living, personal growth, and modern trends.</p>
            </a>
            <a href="category.html?name=Science" class="category-card">
              <i class="fas fa-flask"></i>
              <h3>Science</h3>
              <p>Discoveries, research, and scientific breakthroughs.</p>
            </a>
            <a href="category.html?name=Art" class="category-card">
              <i class="fas fa-paint-brush"></i>
              <h3>Art & Culture</h3>
              <p>Creative expressions, history, and cultural insights.</p>
            </a>
            <a href="category.html?name=Business" class="category-card">
              <i class="fas fa-chart-line"></i>
              <h3>Business</h3>
              <p>Entrepreneurship, finance, and market trends.</p>
            </a>
          </div>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
  </body>
</html>
```

### Category Page (`pages/category.html`)

The `category.html` page displays blog posts belonging to a specific category.

**Design:**
Similar to the home page, it would likely show a list of posts in a grid or column layout.

**Logic & Functionality:**
This page would parse the category name from the URL (e.g., `?name=Technology`) and then fetch and display posts filtered by that category.

**Code Snippet (pages/category.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Category - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <section class="hero-small">
        <div class="container">
          <h1 id="category-title">Category: [Category Name]</h1>
          <p id="category-description">
            Explore all posts related to this topic.
          </p>
        </div>
      </section>

      <section class="content-section">
        <div class="container">
          <div id="category-posts" class="blog-grid">
            <!-- Posts for the specific category will be loaded here -->
            <p>Loading posts for this category...</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
    <script>
      // Example: Get category name from URL and display
      document.addEventListener("DOMContentLoaded", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryName = urlParams.get("name");
        if (categoryName) {
          document.getElementById(
            "category-title"
          ).textContent = `Category: ${categoryName}`;
          document.getElementById(
            "category-description"
          ).textContent = `Discover all posts about ${categoryName}.`;
          // In a real application, you would fetch posts based on categoryName here
          // For now, we can simulate loading or display a message
          document.getElementById("category-posts").innerHTML =
            "<p>Posts for this category will be loaded dynamically.</p>";
        } else {
          document.getElementById("category-title").textContent =
            "Category Not Found";
          document.getElementById("category-description").textContent =
            "Please select a valid category.";
        }
      });
    </script>
  </body>
</html>
```

### Contact Page (`pages/contact.html`)

The `contact.html` page provides a form for users to send messages to the BlogSphere administration.

**Design:**
The page features a contact form with fields for name, email, subject, and message, along with contact information (email, phone, address) and a map placeholder.

**Logic & Functionality:**
The form submission would typically be handled by JavaScript, sending data to a backend API.

**Code Snippet (pages/contact.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Contact Us - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <section class="hero-small">
        <div class="container">
          <h1>Contact Us</h1>
          <p>We'd love to hear from you!</p>
        </div>
      </section>

      <section class="content-section">
        <div class="container contact-grid">
          <div class="contact-form-container">
            <h2>Send us a message</h2>
            <form class="modern-form">
              <div class="form-group">
                <label for="name">Your Name</label>
                <input type="text" id="name" required />
              </div>
              <div class="form-group">
                <label for="email">Your Email</label>
                <input type="email" id="email" required />
              </div>
              <div class="form-group">
                <label for="subject">Subject</label>
                <input type="text" id="subject" required />
              </div>
              <div class="form-group">
                <label for="message">Your Message</label>
                <textarea id="message" rows="6" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>

          <div class="contact-info">
            <h2>Our Information</h2>
            <p>
              <i class="fas fa-envelope"></i> Email:
              <a href="mailto:info@blogsphere.com">info@blogsphere.com</a>
            </p>
            <p>
              <i class="fas fa-phone"></i> Phone:
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </p>
            <p>
              <i class="fas fa-map-marker-alt"></i> Address: 123 Blog St, Suite
              100, Creativille, BS 90210
            </p>
            <div class="map-placeholder">
              <!-- Placeholder for an embedded map -->
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.2543200000003!2d144.9630576!3d-37.8136279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0x5045675218ce7e0!2sMelbourne%20VIC%2C%20Australia!5e0!3m2!1sen!2sus!4v1678901234567!5m2!1sen!2sus"
                width="100%"
                height="300"
                style="border: 0;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
  </body>
</html>
```

### Featured Posts Page (`pages/featured.html`)

The `featured.html` page displays a curated list of featured blog posts.

**Design:**
Similar to the home page's featured section, it would showcase posts with prominent visuals.

**Logic & Functionality:**
This page would fetch and display posts specifically marked as "featured" from the backend.

**Code Snippet (pages/featured.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Featured Posts - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <section class="hero-small">
        <div class="container">
          <h1>Featured Posts</h1>
          <p>Discover our hand-picked, top-quality articles.</p>
        </div>
      </section>

      <section class="content-section">
        <div class="container">
          <div id="featured-posts-grid" class="blog-grid">
            <!-- Featured posts will be loaded here by JavaScript -->
            <p>Loading featured posts...</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        // In a real application, you would fetch featured posts from an API here
        // For now, simulate some content
        const featuredPostsContainer = document.getElementById(
          "featured-posts-grid"
        );
        featuredPostsContainer.innerHTML = `
          <div class="blog-post-card">
            <img src="https://via.placeholder.com/400x250" alt="Post Image" class="post-card-image">
            <div class="post-card-content">
              <h3><a href="#">The Future of AI in Content Creation</a></h3>
              <p class="post-meta">By Jane Doe on April 15, 2025</p>
              <p>Explore how artificial intelligence is revolutionizing the way we create and consume content...</p>
              <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
          <div class="blog-post-card">
            <img src="https://via.placeholder.com/400x250" alt="Post Image" class="post-card-image">
            <div class="post-card-content">
              <h3><a href="#">Mastering Remote Work Productivity</a></h3>
              <p class="post-meta">By John Smith on March 28, 2025</p>
              <p>Tips and strategies for staying productive and focused while working from home...</p>
              <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
          <div class="blog-post-card">
            <img src="https://via.placeholder.com/400x250" alt="Post Image" class="post-card-image">
            <div class="post-card-content">
              <h3><a href="#">The Art of Mindful Living</a></h3>
              <p class="post-meta">By Emily White on February 10, 2025</p>
              <p>Discover practices for cultivating mindfulness and finding peace in your daily life...</p>
              <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        `;
      });
    </script>
  </body>
</html>
```

### Privacy Policy Page (`pages/privacy.html`)

The `privacy.html` page outlines BlogSphere's privacy policy regarding user data.

**Design:**
A standard document-like layout with headings and paragraphs for legal text.

**Logic & Functionality:**
This is a static content page.

**Code Snippet (pages/privacy.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <section class="hero-small">
        <div class="container">
          <h1>Privacy Policy</h1>
          <p>Your privacy is important to us.</p>
        </div>
      </section>

      <section class="content-section">
        <div class="container legal-text">
          <h2>1. Introduction</h2>
          <p>
            Welcome to BlogSphere. We are committed to protecting your personal
            information and your right to privacy. If you have any questions or
            concerns about our policy, or our practices with regard to your
            personal information, please contact us at
            <a href="mailto:privacy@blogsphere.com">privacy@blogsphere.com</a>.
          </p>

          <h2>2. What Information Do We Collect?</h2>
          <h3>Personal information you disclose to us</h3>
          <p>
            We collect personal information that you voluntarily provide to us
            when you register on the Website, express an interest in obtaining
            information about us or our products and services, when you
            participate in activities on the Website (such as posting comments
            or entering contests), or otherwise when you contact us.
          </p>
          <p>
            The personal information that we collect depends on the context of
            your interactions with us and the Website, the choices you make and
            the products and features you use. The personal information we
            collect can include the following:
          </p>
          <ul>
            <li>Names</li>
            <li>Email addresses</li>
            <li>Usernames</li>
            <li>Passwords</li>
            <li>Contact preferences</li>
            <li>Billing addresses</li>
            <li>Debit/credit card numbers</li>
          </ul>

          <h3>Information automatically collected</h3>
          <p>
            We automatically collect certain information when you visit, use or
            navigate the Website. This information does not reveal your specific
            identity (like your name or contact information) but may include
            device and usage information, such as your IP address, browser and
            device characteristics, operating system, language preferences,
            referring URLs, device name, country, location, information about
            how and when you use our Website and other technical information.
          </p>

          <h2>3. How Do We Use Your Information?</h2>
          <p>
            We use personal information collected via our Website for a variety
            of business purposes described below. We process your personal
            information for these purposes in reliance on our legitimate
            business interests, in order to enter into or perform a contract
            with you, with your consent, and/or for compliance with our legal
            obligations.
          </p>
          <ul>
            <li>To facilitate account creation and logon process.</li>
            <li>To post testimonials.</li>
            <li>To enable user-to-user communications.</li>
            <li>To manage user accounts.</li>
            <li>To send administrative information to you.</li>
            <li>To protect our Services.</li>
            <li>To enforce our terms, conditions and policies.</li>
            <li>To respond to legal requests and prevent harm.</li>
            <li>For other business purposes.</li>
          </ul>

          <h2>4. Will Your Information Be Shared With Anyone?</h2>
          <p>
            We only share information with your consent, to comply with laws, to
            provide you with services, to protect your rights, or to fulfill
            business obligations.
          </p>

          <h2>5. How Long Do We Keep Your Information?</h2>
          <p>
            We keep your information for as long as necessary to fulfill the
            purposes outlined in this privacy policy unless otherwise required
            by law.
          </p>

          <h2>6. How Do We Keep Your Information Safe?</h2>
          <p>
            We have implemented appropriate technical and organizational
            security measures designed to protect the security of any personal
            information we process. However, please also remember that we cannot
            guarantee that the internet itself is 100% secure.
          </p>

          <h2>7. Do We Collect Information from Minors?</h2>
          <p>
            We do not knowingly solicit data from or market to children under 18
            years of age. By using the Website, you represent that you are at
            least 18 or that you are the parent or guardian of such a minor and
            consent to such minor dependent’s use of the Website.
          </p>

          <h2>8. What Are Your Privacy Rights?</h2>
          <p>
            You have certain rights under applicable data protection laws. These
            may include the right to request access and obtain a copy of your
            personal information, to request rectification or erasure, to
            restrict the processing of your personal information, and if
            applicable, to data portability.
          </p>

          <h2>9. Data Breach Notification</h2>
          <p>
            Should a data breach occur, we will notify affected users within 72
            hours of becoming aware of the breach, in accordance with applicable
            laws and regulations.
          </p>

          <h2>10. Do We Make Updates to This Policy?</h2>
          <p>
            Yes, we will update this policy as necessary to stay compliant with
            relevant laws.
          </p>

          <h2>11. How Can You Contact Us About This Policy?</h2>
          <p>
            If you have questions or comments about this policy, you may email
            us at
            <a href="mailto:privacy@blogsphere.com">privacy@blogsphere.com</a>
            or by post to:
          </p>
          <address>
            BlogSphere Legal Department<br />
            123 Blog St, Suite 100<br />
            Creativille, BS 90210<br />
            USA
          </address>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
  </body>
</html>
```

### Profile Page (`pages/profile.html`)

The `profile.html` page displays a public profile for a user, similar to the dashboard's profile section but without editing capabilities.

**Design:**
Similar to the dashboard profile, it shows user information, stats, and a list of their posts. It uses `profile-posts.css` for specific styling.

**Logic & Functionality:**
This page would fetch a user's public profile data and their posts based on a user ID or username from the URL.

**Code Snippet (pages/profile.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>User Profile - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
    <link rel="stylesheet" href="profile-posts.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <div class="profile-container animate-fade-in">
        <section class="profile-header-section">
          <div class="profile-avatar-container animate-pop-in">
            <img
              id="profilePictureDisplay"
              src="https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Profile Picture"
              class="profile-picture-large"
            />
          </div>
          <div class="profile-info-main profile-details-container">
            <div class="profile-username-actions animate-fade-in-up">
              <h2 id="profileUsernameDisplay">@username</h2>
              <button class="btn btn-primary follow-button">Follow</button>
            </div>
            <div
              class="profile-stats-instagram animate-fade-in-up"
              style="animation-delay: 0.6s;"
            >
              <div class="stat-item">
                <span class="stat-number" id="postsCount">0</span>
                <span class="stat-label">posts</span>
              </div>
              <div class="stat-item">
                <span class="stat-number" id="followersCount">0</span>
                <span class="stat-label">followers</span>
              </div>
              <div class="stat-item">
                <span class="stat-number" id="followingCount">0</span>
                <span class="stat-label">following</span>
              </div>
            </div>
            <div
              class="profile-name-bio animate-fade-in-up"
              style="animation-delay: 0.8s;"
            >
              <p class="profile-name-display" id="profileNameDisplay">
                Full Name
              </p>
              <p class="profile-bio-display" id="profileBioDisplay">
                Bio goes here.
              </p>
            </div>
          </div>
        </section>

        <section class="profile-posts-section">
          <h2>Posts by <span id="profilePostsUsername">@username</span></h2>
          <div id="user-profile-posts" class="posts-grid">
            <p>Loading posts...</p>
            <!-- User's posts will be loaded here by JavaScript -->
          </div>
        </section>
      </div>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
    <script>
      document.addEventListener("DOMContentLoaded", () => {
        // This script would fetch user profile data and their posts based on a URL parameter (e.g., ?username=...)
        // For demonstration, we'll populate with dummy data
        const urlParams = new URLSearchParams(window.location.search);
        const username = urlParams.get("username") || "demo_user"; // Default username

        document.getElementById("profileUsernameDisplay").textContent =
          "@" + username;
        document.getElementById("profilePostsUsername").textContent =
          "@" + username;
        document.getElementById("profileNameDisplay").textContent =
          "Demo User Name";
        document.getElementById("profileBioDisplay").textContent =
          "This is a demo bio for " + username + ".";
        document.getElementById("postsCount").textContent = "12";
        document.getElementById("followersCount").textContent = "345";
        document.getElementById("followingCount").textContent = "67";

        const userPostsContainer =
          document.getElementById("user-profile-posts");
        userPostsContainer.innerHTML = `
          <div class="blog-post-card">
            <img src="https://via.placeholder.com/400x250" alt="Post Image" class="post-card-image">
            <div class="post-card-content">
              <h3><a href="#">Post Title 1 by ${username}</a></h3>
              <p class="post-meta">By ${username} on May 1, 2025</p>
              <p>Short description of post 1...</p>
              <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
          <div class="blog-post-card">
            <img src="https://via.placeholder.com/400x250" alt="Post Image" class="post-card-image">
            <div class="post-card-content">
              <h3><a href="#">Post Title 2 by ${username}</a></h3>
              <p class="post-meta">By ${username} on April 20, 2025</p>
              <p>Short description of post 2...</p>
              <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        `;
      });
    </script>
  </body>
</html>
```

### Profile Posts Styles (`pages/profile-posts.css`)

The `profile-posts.css` file provides specific styling for the user profile pages, particularly for the layout of posts within the profile.

**Design Principles:**

- **Layout:** Defines the grid layout for displaying user's posts.
- **Card Styling:** Styles for individual post cards to ensure consistency with the overall design.

**Code Snippet (pages/profile-posts.css - Posts Grid):**

```css
.profile-posts-section .posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.profile-posts-section .blog-post-card {
  background-color: var(--light-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
}

.profile-posts-section .blog-post-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-md);
}
```

### Tag Page (`pages/tag.html`)

The `tag.html` page displays blog posts associated with a specific tag.

**Design:**
Similar to the category page, it would show a list of posts.

**Logic & Functionality:**
This page would parse the tag name from the URL (e.g., `?name=JavaScript`) and then fetch and display posts filtered by that tag.

**Code Snippet (pages/tag.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tag - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <section class="hero-small">
        <div class="container">
          <h1 id="tag-title">Tag: [Tag Name]</h1>
          <p id="tag-description">Explore all posts related to this tag.</p>
        </div>
      </section>

      <section class="content-section">
        <div class="container">
          <div id="tag-posts" class="blog-grid">
            <!-- Posts for the specific tag will be loaded here -->
            <p>Loading posts for this tag...</p>
          </div>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
    <script>
      // Example: Get tag name from URL and display
      document.addEventListener("DOMContentLoaded", () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tagName = urlParams.get("name");
        if (tagName) {
          document.getElementById("tag-title").textContent = `Tag: ${tagName}`;
          document.getElementById(
            "tag-description"
          ).textContent = `Discover all posts tagged with "${tagName}".`;
          // In a real application, you would fetch posts based on tagName here
          // For now, we can simulate loading or display a message
          document.getElementById("tag-posts").innerHTML =
            "<p>Posts for this tag will be loaded dynamically.</p>";
        } else {
          document.getElementById("tag-title").textContent = "Tag Not Found";
          document.getElementById("tag-description").textContent =
            "Please select a valid tag.";
        }
      });
    </script>
  </body>
</html>
```

### Terms of Service Page (`pages/terms.html`)

The `terms.html` page outlines BlogSphere's terms of service and user agreements.

**Design:**
A standard document-like layout with headings and paragraphs for legal text.

**Logic & Functionality:**
This is a static content page.

**Code Snippet (pages/terms.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Terms of Service - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <section class="hero-small">
        <div class="container">
          <h1>Terms of Service</h1>
          <p>Please read these terms carefully before using BlogSphere.</p>
        </div>
      </section>

      <section class="content-section">
        <div class="container legal-text">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using the BlogSphere website and services, you agree
            to be bound by these Terms of Service and all terms incorporated by
            reference. If you do not agree to all of these terms, do not use our
            website or services.
          </p>

          <h2>2. Changes to Terms</h2>
          <p>
            We reserve the right to change or modify these Terms at any time and
            in our sole discretion. If we make changes to these Terms, we will
            provide notice of such changes, such as by sending an email
            notification, providing notice through the Services, or updating the
            "Last Updated" date at the top of these Terms. Your continued use of
            the Services will confirm your acceptance of the revised Terms.
          </p>

          <h2>3. Privacy Policy</h2>
          <p>
            Please refer to our Privacy Policy for information about how we
            collect, use, and disclose information about our users.
          </p>

          <h2>4. User Conduct</h2>
          <p>
            You agree that you will not violate any law, contract, intellectual
            property or other third-party right or commit a tort, and that you
            are solely responsible for your conduct while on the Services.
          </p>

          <h2>5. Content Ownership</h2>
          <p>
            You retain all ownership rights to the content you submit to
            BlogSphere. By submitting content, you grant BlogSphere a worldwide,
            non-exclusive, royalty-free, transferable license to use, reproduce,
            distribute, prepare derivative works of, display, and perform the
            content in connection with the Services and BlogSphere's (and its
            successors' and affiliates') business, including without limitation
            for promoting and redistributing part or all of the Services (and
            derivative works thereof) in any media formats and through any media
            channels.
          </p>

          <h2>6. Disclaimers</h2>
          <p>
            THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            TITLE, AND NON-INFRINGEMENT.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL BLOGSPHERE, ITS DIRECTORS, MEMBERS, EMPLOYEES OR
            AGENTS BE LIABLE FOR ANY DIRECT, SPECIAL, INDIRECT OR CONSEQUENTIAL
            DAMAGES, OR ANY OTHER DAMAGES OF ANY KIND, INCLUDING BUT NOT LIMITED
            TO LOSS OF USE, LOSS OF PROFITS OR LOSS OF DATA, WHETHER IN AN
            ACTION IN CONTRACT, TORT (INCLUDING BUT NOT LIMITED TO NEGLIGENCE)
            OR OTHERWISE, ARISING OUT OF OR IN ANY WAY CONNECTED WITH THE USE OF
            OR INABILITY TO USE THE SERVICES, THE CONTENT OR THE MATERIALS
            CONTAINED IN OR ACCESSED THROUGH THE SERVICES, INCLUDING WITHOUT
            LIMITATION ANY DAMAGES CAUSED BY OR RESULTING FROM RELIANCE BY ANY
            USER ON ANY INFORMATION OBTAINED FROM BLOGSPHERE, OR THAT RESULT
            FROM MISTAKES, OMISSIONS, INTERRUPTIONS, DELETION OF FILES OR EMAIL,
            ERRORS, DEFECTS, VIRUSES, DELAYS IN OPERATION OR TRANSMISSION OR ANY
            FAILURE OF PERFORMANCE, WHETHER OR NOT RESULTING FROM ACTS OF GOD,
            COMMUNICATIONS FAILURE, THEFT, DESTRUCTION OR UNAUTHORIZED ACCESS TO
            BLOGSPHERE'S RECORDS, PROGRAMS OR SERVICES.
          </p>

          <h2>8. Governing Law and Jurisdiction</h2>
          <p>
            These Terms and your use of the Services shall be governed by and
            construed in accordance with the laws of the State of California,
            without regard to its conflict of law principles.
          </p>

          <h2>9. Contact Information</h2>
          <p>
            Questions or comments about the Services may be directed to
            <a href="mailto:support@blogsphere.com">support@blogsphere.com</a>.
          </p>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
  </body>
</html>
```

---

## Folder: `post/`

The `post/` folder contains files related to creating, viewing, and managing individual blog posts.

### Chapter 6: Create Post Page (`post/create-post.html`)

The `create-post.html` page provides a form for users to write and publish new blog posts.

**Design:**
The page features a form with fields for post title, content (using a rich text editor or textarea), image upload, categories, and tags. It has a clean, intuitive layout designed for content creation.

**Logic & Functionality:**
The post creation logic is handled by `create-post.js`.

**Code Snippet (post/create-post.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Create New Post - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <section class="hero-small">
        <div class="container">
          <h1>Create New Post</h1>
          <p>Share your story with the world.</p>
        </div>
      </section>

      <section class="content-section">
        <div class="container">
          <form id="createPostForm" class="modern-form">
            <div class="form-group">
              <label for="postTitle">Post Title</label>
              <input
                type="text"
                id="postTitle"
                placeholder="Enter your post title"
                required
              />
            </div>

            <div class="form-group">
              <label for="postContent">Post Content</label>
              <textarea
                id="postContent"
                rows="15"
                placeholder="Write your amazing story here..."
                required
              ></textarea>
            </div>

            <div class="form-group">
              <label for="postImage">Featured Image</label>
              <input type="file" id="postImage" accept="image/*" />
              <p class="help-text">Upload an image for your post (optional)</p>
            </div>

            <div class="form-group">
              <label for="postCategory">Category</label>
              <select id="postCategory" required>
                <option value="">Select a Category</option>
                <option value="Technology">Technology</option>
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
                <option value="Health">Health & Wellness</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Science">Science</option>
                <option value="Art">Art & Culture</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div class="form-group">
              <label for="postTags">Tags (comma-separated)</label>
              <input
                type="text"
                id="postTags"
                placeholder="e.g., javascript, webdev, tutorial"
              />
              <p class="help-text">Separate tags with commas</p>
            </div>

            <button type="submit" class="btn btn-primary">Publish Post</button>
          </form>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
    <script src="create-post.js"></script>
  </body>
</html>
```

### Create Post JavaScript Logic (`post/create-post.js`)

The `create-post.js` file handles the client-side logic for creating and submitting new blog posts.

**Logic & Functionality:**

- **Form Submission:** Listens for the submission of the `createPostForm`.
- **Data Collection:** Gathers the title, content, image (if any), category, and tags from the form fields.
- **API Communication:** Sends the post data to a backend API endpoint (e.g., `/api/posts`) using an HTTP POST request.
- **Success/Error Handling:** Provides feedback to the user upon successful post creation or if an error occurs.
- **Redirection:** Redirects the user to the newly created post's page or a confirmation page upon success.

**Code Snippet (post/create-post.js - Form Submission):**

```javascript
document.addEventListener("DOMContentLoaded", () => {
  const createPostForm = document.getElementById("createPostForm");

  if (createPostForm) {
    createPostForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      const title = document.getElementById("postTitle").value;
      const content = document.getElementById("postContent").value;
      const category = document.getElementById("postCategory").value;
      const tagsInput = document.getElementById("postTags").value;
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
      const imageFile = document.getElementById("postImage").files[0];

      // For demonstration, we'll simulate an API call
      // In a real application, you would upload the image and then send post data
      console.log("Creating post with data:", {
        title,
        content,
        category,
        tags,
        imageFile: imageFile ? imageFile.name : "No image",
      });

      // Simulate API call
      try {
        // const response = await fetch('/api/posts', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ title, content, category, tags, imageUrl: '...' })
        // });
        // const result = await response.json();

        // if (response.ok) {
        //   alert('Post created successfully!');
        //   window.location.href = `/post/post.html?id=${result.postId}`; // Redirect to new post
        // } else {
        //   alert('Error creating post: ' + (result.message || 'Unknown error'));
        // }

        // Simulate success
        alert("Post created successfully! (Simulated)");
        // Redirect to a dummy post page or home
        window.location.href = "/index.html";
      } catch (error) {
        console.error("Error creating post:", error);
        alert("An error occurred while creating the post.");
      }
    });
  }
});
```

### Post Details Page (`post/post.html`)

The `post.html` page displays a single blog post in detail.

**Design:**
This page uses the `Post` component from `frontend/Post.js` to render the full post, including its header, content, reactions, share options, and comments.

**Logic & Functionality:**
The page retrieves a post ID from the URL (e.g., `?id=123`) and then fetches the corresponding post data from an API. Once the data is loaded, it uses the `Post` component to render the post.

**Code Snippet (post/post.html structure):**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Blog Post - BlogSphere</title>
    <link rel="stylesheet" href="../styles.css" />
  </head>
  <body>
    <header class="sticky-header">
      <!-- Header content from script.js -->
    </header>

    <main class="main-content">
      <section class="post-detail-section">
        <div class="container">
          <div id="post-container">
            <p>Loading post...</p>
            <!-- The Post component will render here -->
          </div>
        </div>
      </section>
    </main>

    <footer class="main-footer">
      <!-- Footer content from script.js -->
    </footer>

    <script src="../script.js"></script>
    <script type="module" src="post-details.js"></script>
  </body>
</html>
```

### Post Details JavaScript Logic (`post/post-details.js`)

The `post-details.js` file handles the client-side logic for fetching and rendering a single blog post on the `post.html` page.

**Logic & Functionality:**

- **Import Post Component:** Imports the `Post` component from `frontend/Post.js`.
- **Fetch Post ID:** Extracts the `postId` from the URL query parameters.
- **Fetch Post Data:** Makes an asynchronous request to a backend API (e.g., `/api/posts/{postId}`) to retrieve the full post data.
- **Render Post:** Upon successful data retrieval, it calls the `Post` component, passing the fetched data, and injects the rendered HTML into the `post-container` element.
- **Error Handling:** Displays an error message if the post cannot be loaded.
- **Simulated Data:** Includes a `getDummyPostData` function for development/demonstration purposes to provide mock post data without a live API.

**Code Snippet (post/post-details.js - Fetch and Render):**

```javascript
import Post from "../frontend/Post.js"; // Adjust path as necessary

document.addEventListener("DOMContentLoaded", async () => {
  const postContainer = document.getElementById("post-container");
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("id");

  if (!postId) {
    postContainer.innerHTML = "<p>Post ID not found in URL.</p>";
    return;
  }

  // Simulate fetching post data
  const getDummyPostData = (id) => {
    // This would be replaced by an actual API call
    const dummyPosts = {
      123: {
        id: "123",
        title: "The Art of Mindful Living",
        content:
          "Mindful living is about being present and fully engaged in the moment. It's a practice that can transform your daily life, reducing stress and increasing overall well-being. By focusing on your breath, observing your thoughts without judgment, and engaging your senses, you can cultivate a deeper connection with yourself and the world around you. Start small: try mindful eating, a walking meditation, or simply taking a few conscious breaths throughout your day. Consistency is key to building a mindful practice.",
        imageUrl:
          "https://images.pexels.com/photos/3862601/pexels-photo-3862601.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        authorId: "user123",
        authorUsername: "MindfulExplorer",
        createdAt: "2025-05-10T10:00:00Z",
        likes: 150,
        comments: [
          {
            id: "c1",
            authorUsername: "ZenSeeker",
            content:
              "Beautifully written! Mindfulness has truly changed my life.",
            createdAt: "2025-05-10T11:05:00Z",
          },
          {
            id: "c2",
            authorUsername: "NewbieMind",
            content: "Great tips for beginners. I'm excited to try this!",
            createdAt: "2025-05-10T12:30:00Z",
          },
        ],
        shares: 25,
        isBookmarked: false,
        isFollowingAuthor: true,
      },
      456: {
        id: "456",
        title: "Exploring the Amazon Rainforest",
        content:
          "The Amazon rainforest is a biodiversity hotspot, home to millions of species of plants and animals. A journey through its dense canopy and winding rivers offers an unparalleled experience for nature enthusiasts. From vibrant macaws to elusive jaguars, every corner reveals a new wonder. Conservation efforts are crucial to protect this vital ecosystem, which plays a critical role in regulating the Earth's climate.",
        imageUrl:
          "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
        authorId: "user456",
        authorUsername: "NatureLover",
        createdAt: "2025-04-20T14:30:00Z",
        likes: 300,
        comments: [
          {
            id: "c3",
            authorUsername: "EcoWarrior",
            content: "An inspiring read! We must protect the Amazon.",
            createdAt: "2025-04-21T09:00:00Z",
          },
        ],
        shares: 50,
        isBookmarked: true,
        isFollowingAuthor: false,
      },
    };
    return dummyPosts[id];
  };

  try {
    // In a real application, replace this with an actual API call:
    // const response = await fetch(`/api/posts/${postId}`);
    // const postData = await response.json();
    // if (!response.ok) throw new Error(postData.message || 'Failed to fetch post');

    const postData = getDummyPostData(postId); // Using dummy data for now

    if (postData) {
      // Assuming currentUserId is available globally or fetched
      const currentUserId = localStorage.getItem("userId"); // Example: get from local storage
      postContainer.innerHTML = Post(postData, currentUserId);
    } else {
      postContainer.innerHTML = "<p>Post not found.</p>";
    }
  } catch (error) {
    console.error("Error loading post:", error);
    postContainer.innerHTML = `<p>Error loading post: ${error.message}</p>`;
  }
});
```

---

## Other Root Level Files

- **`404.html`**: A standard error page displayed when a requested resource is not found.
- **`api.txt`**: This file likely contains documentation or notes about the API endpoints used by the frontend, serving as a quick reference for developers.
- **`script-profile.js`**: This JavaScript file is likely dedicated to handling client-side logic specific to user profiles, potentially including interactions on the `profile.html` page or profile-related functionalities on other pages. Its exact functions would require code inspection.

---

## Conclusion

The BlogSphere project is structured into logical units, with clear separation of concerns for authentication, dashboard, frontend components, static pages, and post management. The use of HTML for structure, CSS for styling (with a strong emphasis on variables and responsiveness), and JavaScript for dynamic functionality and API interactions provides a robust and maintainable codebase. The React-like component structure in the `frontend/` folder demonstrates a modular approach to building complex UI elements. Backend interactions are hinted at through Python files (`lambda.py`, `post.py`) and an API Gateway configuration (`apigateway.yaml`) within the `auth/` folder, suggesting a serverless architecture for authentication.
