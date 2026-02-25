export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  // Verificar se window existe (client-side)
  if (typeof window === 'undefined') {
    return 'http://localhost:3000/app-auth';
  }

  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || 'http://localhost:3000';
  const appId = import.meta.env.VITE_APP_ID || 'test-app-id';
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri );

  console.log("URL do Portal OAuth:", oauthPortalUrl);
  console.log("ID do App:", appId);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  console.log("URL Construída:", url.toString());

  return url.toString();
};


