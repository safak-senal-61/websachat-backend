// src/config/passport_setup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const { PrismaClient, UserRole } = require('../generated/prisma');
const prisma = new PrismaClient();

// Google Stratejisi
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Bu, Google Console'dakiyle aynı olmalı
      // passReqToCallback: true, // Eğer request objesine erişmek isterseniz
    },
    async (accessToken, refreshToken, profile, done) => {
      // profile objesi Google'dan gelen kullanıcı bilgilerini içerir
      // (profile.id, profile.displayName, profile.emails[0].value, profile.photos[0].value vb.)
      try {
        // 1. Google ID'si ile kullanıcıyı veritabanında ara
        let user = await prisma.user.findUnique({
          where: { authId: profile.id }, // Prisma şemanızda authId alanı olmalı ve unique olmalı
        });

        if (user) {
          // Kullanıcı bulundu, devam et
          return done(null, user);
        } else {
          // Kullanıcı bulunamadı, e-posta ile ara (belki daha önce normal kayıt olmuştur)
          const userEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
          if (!userEmail) {
            return done(new Error('Google profili e-posta adresi içermiyor.'), null);
          }

          user = await prisma.user.findUnique({
            where: { email: userEmail },
          });

          if (user) {
            // E-posta ile kullanıcı bulundu, Google authId'sini bu kullanıcıya bağla
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                authProvider: 'google',
                authId: profile.id,
                isEmailVerified: true, // Google e-postayı doğruladığı için true
                // İsteğe bağlı: Google'dan gelen nickname veya profil resmini güncelle
                // nickname: user.nickname || profile.displayName,
                // profilePictureUrl: user.profilePictureUrl || (profile.photos && profile.photos[0] ? profile.photos[0].value : null),
              },
            });
            return done(null, user);
          } else {
            // Kullanıcı hiç yok, yeni kullanıcı oluştur
            // Benzersiz bir username oluşturmak gerekebilir
            let username = profile.displayName.replace(/\s+/g, '').toLowerCase();
            const existingUsername = await prisma.user.findUnique({ where: { username } });
            if (existingUsername) {
              username = `${username}_${profile.id.substring(0, 5)}`; // Basit bir unique'leştirme
            }

            const newUser = await prisma.user.create({
              data: {
                authProvider: 'google',
                authId: profile.id,
                email: userEmail,
                username: username,
                nickname: profile.displayName,
                profilePictureUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
                isEmailVerified: true, // Google e-postayı doğruladığı için true
                role: UserRole.USER, // Varsayılan rol
                // password alanı null olabilir çünkü Google ile giriş yapıyor
              },
            });
            return done(null, newUser);
          }
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Twitter Stratejisi
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: process.env.TWITTER_CALLBACK_URL,
      includeEmail: true // Twitter'dan e-posta almak için gerekli
    },
    async (token, tokenSecret, profile, done) => {
      try {
        // Twitter ID'si ile kullanıcıyı veritabanında ara
        let user = await prisma.user.findUnique({
          where: { authId: profile.id },
        });

        if (user) {
          // Kullanıcı bulundu, devam et
          return done(null, user);
        } else {
          // Kullanıcı bulunamadı, e-posta ile ara (varsa)
          const userEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
          
          if (userEmail) {
            user = await prisma.user.findUnique({
              where: { email: userEmail },
            });
          }

          if (user) {
            // E-posta ile kullanıcı bulundu, Twitter authId'sini bu kullanıcıya bağla
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                authProvider: 'twitter',
                authId: profile.id,
                isEmailVerified: true, // Twitter e-postayı doğruladığı için true
              },
            });
            return done(null, user);
          } else {
            // Kullanıcı hiç yok, yeni kullanıcı oluştur
            let username = profile.username || `twitter_${profile.id.substring(0, 8)}`;
            const existingUsername = await prisma.user.findUnique({ where: { username } });
            if (existingUsername) {
              username = `${username}_${profile.id.substring(0, 5)}`;
            }

            const newUser = await prisma.user.create({
              data: {
                authProvider: 'twitter',
                authId: profile.id,
                email: userEmail,
                username: username,
                nickname: profile.displayName || username,
                profilePictureUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
                isEmailVerified: userEmail ? true : false,
                role: UserRole.USER,
              },
            });
            return done(null, newUser);
          }
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Facebook Stratejisi
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ['id', 'displayName', 'photos', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Facebook ID'si ile kullanıcıyı veritabanında ara
        let user = await prisma.user.findUnique({
          where: { authId: profile.id },
        });

        if (user) {
          // Kullanıcı bulundu, devam et
          return done(null, user);
        } else {
          // Kullanıcı bulunamadı, e-posta ile ara
          const userEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
          if (!userEmail) {
            return done(new Error('Facebook profili e-posta adresi içermiyor.'), null);
          }

          user = await prisma.user.findUnique({
            where: { email: userEmail },
          });

          if (user) {
            // E-posta ile kullanıcı bulundu, Facebook authId'sini bu kullanıcıya bağla
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                authProvider: 'facebook',
                authId: profile.id,
                isEmailVerified: true,
              },
            });
            return done(null, user);
          } else {
            // Kullanıcı hiç yok, yeni kullanıcı oluştur
            let username = profile.displayName.replace(/\s+/g, '').toLowerCase();
            const existingUsername = await prisma.user.findUnique({ where: { username } });
            if (existingUsername) {
              username = `${username}_${profile.id.substring(0, 5)}`;
            }

            const newUser = await prisma.user.create({
              data: {
                authProvider: 'facebook',
                authId: profile.id,
                email: userEmail,
                username: username,
                nickname: profile.displayName,
                profilePictureUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
                isEmailVerified: true,
                role: UserRole.USER,
              },
            });
            return done(null, newUser);
          }
        }
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Passport'un kullanıcıyı session'a nasıl serialize/deserialize edeceğini belirler.
// API tabanlı JWT kullandığımız için bunlar daha az önemli olabilir,
// ama passport-google-oauth20'nin callback'i için gerekebilir.
// JWT kullandığımız için session'da kullanıcı ID'si tutmak yerine,
// callback'te doğrudan kendi JWT'mizi oluşturup frontend'e yönlendireceğiz.
passport.serializeUser((user, done) => {
  done(null, user.id); // Sadece kullanıcı ID'sini session'a kaydet
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});