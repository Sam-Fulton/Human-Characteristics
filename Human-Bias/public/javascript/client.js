function initiateAuthorization() {
  const clientId = '1011280470420-sbgbbes073p7bkvlg2glcnnu572f4o3o.apps.googleusercontent.com';
  const redirectUri = 'http://localhost:5000/callback';
  const profileScope = 'profile';
  const emailScope = 'email';

  const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${profileScope}+${emailScope}`;

  window.location.href = authUrl;
}
  
  document.getElementById('signInButton').addEventListener('click', () => {
    initiateAuthorization();
  });
  
  function getAuthorizationCode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
  }
  
  const authorizationCode = getAuthorizationCode();
  if (authorizationCode) {
    handleAuthorizationCode(authorizationCode);
  }