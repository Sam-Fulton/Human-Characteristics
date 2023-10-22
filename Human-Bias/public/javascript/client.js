// Perform the OAuth 2.0 authorization on the client side
function initiateAuthorization() {
    const clientId = '1011280470420-sbgbbes073p7bkvlg2glcnnu572f4o3o.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:5000/callback';
    const driveScope = 'https://www.googleapis.com/auth/drive';
  
    // Construct the authorization URL
    const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${driveScope}`;
  
    // Redirect the user to the authorization URL
    window.location.href = authUrl;
  }
  
  // Attach click event to the "Sign In" button
  document.getElementById('signInButton').addEventListener('click', () => {
    initiateAuthorization();
  });
  
  // Function to extract the authorization code from the URL query parameters
  function getAuthorizationCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
  }
  
  // Check if the page was redirected with an authorization code
  const authorizationCode = getAuthorizationCode();
  if (authorizationCode) {
    // Handle the authorization code (e.g., send it to the server for token exchange)
    handleAuthorizationCode(authorizationCode);
  }