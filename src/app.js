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

// --- ROTA İMPORTLARI ---
// SADECE ana birleştirici rotayı import ediyoruz. Diğer tüm rotalar bunun içindedir.
const mainRouter = require('./routes');

const Response = require('./utils/responseHandler');
require('./config/passport_setup');

const app = express();
console.log('DEBUG: app.js - Express uygulaması yapılandırılıyor...');

// --- CORS Yapılandırması ---
const allowedOrigins = [
    'https://3000-firebase-websachat-bacendgit-1750692398761.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev/auth/google/callback',
    'https://3000-firebase-chatgit-1749503120290.cluster-l6vkdperq5ebaqo3qy4ksvoqom.cloudworkstations.dev',
    'https://websachat-web-610000.web.app',
    'http://localhost:3000',
    'https://3000-firebase-websachat-bacendgit-1750692398761.cluster-axf5tvtfjjfekvhwxwkkkzsk2y.cloudworkstations.dev',
    'http://localhost:3001',
    'https://d033c711-5834-4f77-868a-94ae778c35f1-00-33t75erjtazez.janeway.replit.dev',
    'https://sandbox-api.iyzipay.com',
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

// --- Temel Middleware'ler ---
app.use(cors(corsOptions));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "script-src": ["'self'", "'unsafe-inline'", "https://unpkg.com", "https://download.agora.io"],
        },
    },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
}

// --- Session ve Passport Middleware'leri ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'varsayilan-cok-gizli-session-anahtari',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
}));
app.use(passport.initialize());
app.use(passport.session());

// --- Statik Dosya Sunumu ---
const publicPath = nodePath.join(__dirname, '../public');
app.use(express.static(publicPath));
console.log(`✅ Statik dosyalar şu dizinden sunulacak: ${publicPath}`);

// --- API ROTALARI ---
// Tüm rotalarımızı  altında merkezi olarak kullanıyoruz.
app.use('/', mainRouter);

// --- Swagger ---
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
  // Modüler yapıya uygun olarak, 'routes' klasöründeki tüm .js dosyalarını tara.
  apis: ['./src/routes/**/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'WEBSACHAT API Docs' }));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
// --- Hata Yönetimi Middleware'leri ---
app.use('/*', (req, res) => {
    Response.notFound(res, `API Kaynağı bulunamadı: ${req.originalUrl}`);
});

app.use((err, req, res, next) => {
    console.error("GLOBAL HATA YÖNETİCİSİ:", err.message);
    if(process.env.NODE_ENV === 'development') {
      console.error(err.stack);
    }
    Response.internalServerError(res, err.message || 'Beklenmedik bir sunucu hatası oluştu.');
});

app.use((req, res) => {
    res.status(404).send("<h1>404 - Sayfa Bulunamadı</h1>");
});

module.exports = { app, corsOptions };
