// src/controllers/auth/authjs_config.js

const { PrismaAdapter } = require('@auth/prisma-adapter');
const { PrismaClient } = require('../../generated/prisma');
const prisma = new PrismaClient();
const { sanitizeUser } = require('./utils');
const { JWT_SECRET } = require('./constants');

/**
 * Auth.js için yapılandırma ayarları
 */
const authConfig = {
  adapter: PrismaAdapter(prisma),
  secret: JWT_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  callbacks: {
    async jwt({ token, user }) {
      // İlk giriş yapıldığında user objesi dolu gelir
      if (user) {
        token.userId = user.id;
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId;
        session.user.role = token.role;
        session.user.twoFactorEnabled = token.twoFactorEnabled;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Kullanıcı giriş yaparken ek kontroller yapılabilir
      if (user) {
        // Hesap durumu kontrolü
        if (['SUSPENDED', 'BANNED'].includes(user.accountStatus)) {
          return false;
        }
        
        // Email doğrulama kontrolü (admin hariç)
        if (user.role !== 'ADMIN' && !user.isEmailVerified) {
          return false;
        }
        
        // 2FA kontrolü burada yapılmaz, ayrı bir endpoint ile kontrol edilecek
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  debug: process.env.NODE_ENV === 'development',
};

module.exports = authConfig;