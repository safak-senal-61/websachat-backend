// src/app.js

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const nodePath = require('path');
const cookieParser = require('cookie-parser');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const session = require('express-session');
const passport = require('passport');

const mainRouter = require('./routes');
const Response = require('./utils/responseHandler');
require('./config/passport_setup');

const app = express();
console.log('DEBUG: app.js - Express uygulaması yapılandırılıyor...');

// Frontend ve diğer gerekli adresler için izin verilen origin'ler listesi
const allowedOrigins = [
    'https://websachat-web-610000.web.app', // Firebase Hosting'deki adresiniz
    'http://localhost:3000',               // Yerel frontend geliştirme (Next.js genellikle 3000 portunu kullanır)
    'http://localhost:3001',               // Farklı bir yerel port
    // Google Cloud Workstations URL'leriniz
    'https://3000-firebase-websachat-bacendgit-1750692398761.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev',
    'https://3000-firebase-chatgit-1749503120290.cluster-l6vkdperq5ebaqo3qy4ksvoqom.cloudworkstations.dev',
    'https://3000-firebase-websachat-web-1748782524865.cluster-3gc7bglotjgwuxlqpiut7yyqt4.cloudworkstations.dev',
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS Engeli: ${origin} adresine izin verilmiyor.`);
      callback(new Error('Bu adres için CORS politikası tarafından izin verilmiyor.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
};

// --- GÜNCELLENMİŞ KISIM: Proxy ve Güvenlik Ayarları ---
app.set('trust proxy', 1); // Nginx, Cloudflare, Google Cloud Load Balancer gibi proxy'lerin arkasında çalışırken bu ayar önemlidir.

app.use(cors(corsOptions));

// Helmet'i daha esnek yapılandırıyoruz.
app.use(helmet({
    contentSecurityPolicy: false, // Geliştirme için daha esnek. Canlı ortamda spesifik kurallar ekleyebilirsiniz.
    crossOriginEmbedderPolicy: false,
}));
// --- GÜNCELLEME SONU ---

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

app.use(session({
    secret: process.env.SESSION_SECRET || 'varsayilan-cok-gizli-session-anahtari',
    resave: false,
    saveUninitialized: false,
    proxy: true, // Session'ın da proxy'ye güvenmesini sağlar
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
}));
app.use(passport.initialize());
app.use(passport.session());

const publicPath = nodePath.join(__dirname, '../public');
app.use(express.static(publicPath));
console.log(`✅ Statik dosyalar şu dizinden sunulacak: ${publicPath}`);

app.use('/', mainRouter);

const SWAGGER_API_BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'WEBSACHAT API',
      version: '1.0.0',
      description: 'Görüntülü ve Sesli Sohbet Uygulaması API Dokümantasyonu',
    },
    servers: [{ url: SWAGGER_API_BASE_URL }],
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
    },
  },
  apis: ['./src/routes/**/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'WEBSACHAT API Docs' }));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use((req, res, next) => {
    Response.notFound(res, `API Kaynağı bulunamadı: ${req.method} ${req.originalUrl}`);
});

app.use((err, req, res, next) => {
    console.error("GLOBAL HATA YÖNETİCİSİ:", err);
    Response.internalServerError(res, err.message || 'Beklenmedik bir sunucu hatası oluştu.');
});

module.exports = { app, corsOptions };