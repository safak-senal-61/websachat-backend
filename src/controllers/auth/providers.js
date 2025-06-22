// src/controllers/auth/providers.js

/**
 * Auth.js için kimlik doğrulama sağlayıcıları yapılandırması
 */

const Google = {
  id: 'google',
  name: 'Google',
  type: 'oauth',
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  authorization: {
    url: 'https://accounts.google.com/o/oauth2/v2/auth',
    params: {
      prompt: 'consent',
      access_type: 'offline',
      response_type: 'code'
    }
  },
  token: 'https://oauth2.googleapis.com/token',
  userinfo: {
    url: 'https://www.googleapis.com/oauth2/v2/userinfo',
    async request({ tokens, provider }) {
      const response = await fetch(provider.userinfo.url, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profile = await response.json();
      return profile;
    },
  },
  profile(profile) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      image: profile.picture,
    };
  },
};

const Facebook = {
  id: 'facebook',
  name: 'Facebook',
  type: 'oauth',
  clientId: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  authorization: 'https://www.facebook.com/v11.0/dialog/oauth?scope=email',
  token: 'https://graph.facebook.com/v11.0/oauth/access_token',
  userinfo: {
    url: 'https://graph.facebook.com/me',
    params: { fields: 'id,name,email,picture' },
    async request({ tokens, provider }) {
      const response = await fetch(
        `${provider.userinfo.url}?fields=${provider.userinfo.params.fields}&access_token=${tokens.access_token}`
      );
      const profile = await response.json();
      return profile;
    },
  },
  profile(profile) {
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      image: profile.picture?.data?.url,
    };
  },
};

const Apple = {
  id: 'apple',
  name: 'Apple',
  type: 'oauth',
  clientId: process.env.APPLE_CLIENT_ID,
  clientSecret: process.env.APPLE_CLIENT_SECRET,
  authorization: {
    url: 'https://appleid.apple.com/auth/authorize',
    params: {
      scope: 'name email',
      response_mode: 'form_post',
      response_type: 'code',
    },
  },
  token: 'https://appleid.apple.com/auth/token',
  userinfo: {
    url: 'https://appleid.apple.com/auth/userinfo',
    async request({ tokens, provider }) {
      const response = await fetch(provider.userinfo.url, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const profile = await response.json();
      return profile;
    },
  },
  profile(profile) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: null,
    };
  },
};

const Twitter = {
  id: 'twitter',
  name: 'Twitter',
  type: 'oauth',
  version: '2.0',
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
  authorization: {
    url: 'https://twitter.com/i/oauth2/authorize',
    params: {
      scope: 'users.read tweet.read offline.access',
    },
  },
  token: 'https://api.twitter.com/2/oauth2/token',
  userinfo: {
    url: 'https://api.twitter.com/2/users/me',
    params: {
      'user.fields': 'profile_image_url,name,username',
    },
    async request({ tokens, provider }) {
      const response = await fetch(
        `${provider.userinfo.url}?${new URLSearchParams(provider.userinfo.params)}`,
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        }
      );
      const profile = await response.json();
      return profile.data;
    },
  },
  profile(profile) {
    return {
      id: profile.id,
      name: profile.name,
      email: null, // Twitter API does not provide email
      image: profile.profile_image_url,
    };
  },
};

module.exports = {
  Google,
  Facebook,
  Apple,
  Twitter
};