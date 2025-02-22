import * as AuthSession from 'expo-auth-session';

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_KEY;
const REDIRECT_URI = AuthSession.makeRedirectUri({ useProxy: true });

export const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export const authConfig = {
  clientId: CLIENT_ID,
  redirectUri: REDIRECT_URI,
  responseType: 'id_token',
  scopes: ['openid', 'profile', 'email'],
};
