# 🚀 WebSaChat Backend

<div align="center">
  <img src="https://img.shields.io/badge/Node.js-v16+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License">
</div>

<p align="center">
  <strong>A powerful, scalable backend service for WebSaChat - The next-generation social media platform</strong>
</p>

<p align="center">
  Built with modern technologies to handle real-time messaging, social interactions, and seamless user experiences at scale.
</p>

---

## ✨ Features

- 🔐 **Robust Authentication** - JWT-based secure user authentication and authorization
- 💬 **Real-time Messaging** - WebSocket support for instant messaging and notifications
- 📱 **Social Media Core** - Posts, comments, likes, follows, and user interactions
- 🖼️ **Media Management** - Image and video upload with cloud storage integration
- 🔍 **Advanced Search** - Full-text search capabilities across users and content
- 📊 **Analytics** - User engagement tracking and content performance metrics
- 🛡️ **Security First** - Rate limiting, input validation, and CORS protection
- 🚀 **Performance Optimized** - Caching, database indexing, and query optimization
- 📈 **Scalable Architecture** - Modular design ready for microservices migration

## 🏗️ Architecture

```
websachat-backend/
├── 📁 src/
│   ├── 🚀 app.js                    # Express application setup
│   ├── 🌐 server.js                 # Server startup & WebSocket configuration
│   ├── ⚙️ config/
│   │   ├── database.js              # Database connection config
│   │   ├── redis.js                 # Redis caching config
│   │   └── cloudinary.js            # Media storage config
│   ├── 📊 models/
│   │   ├── User.js                  # User model & relationships
│   │   ├── Post.js                  # Post model
│   │   ├── Comment.js               # Comment model
│   │   ├── Message.js               # Direct message model
│   │   └── index.js                 # Model associations
│   ├── 🎮 controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── userController.js        # User management
│   │   ├── postController.js        # Post operations
│   │   ├── messageController.js     # Messaging system
│   │   └── mediaController.js       # File upload handling
│   ├── 🔧 services/
│   │   ├── authService.js           # Authentication business logic
│   │   ├── notificationService.js   # Push notification service
│   │   ├── emailService.js          # Email service integration
│   │   └── analyticsService.js      # User analytics tracking
│   ├── 🛣️ routes/
│   │   ├── auth.js                  # Authentication routes
│   │   ├── users.js                 # User management routes
│   │   ├── posts.js                 # Social media posts routes
│   │   ├── messages.js              # Direct messaging routes
│   │   └── api.js                   # Main API router
│   ├── 🛡️ middlewares/
│   │   ├── auth.js                  # JWT authentication middleware
│   │   ├── validation.js            # Request validation
│   │   ├── rateLimiter.js           # API rate limiting
│   │   ├── upload.js                # File upload middleware
│   │   └── errorHandler.js          # Global error handling
│   ├── 🔌 socket/
│   │   ├── socketHandlers.js        # WebSocket event handlers
│   │   └── roomManager.js           # Chat room management
│   └── 🛠️ utils/
│       ├── logger.js                # Application logging
│       ├── helpers.js               # Common utility functions
│       ├── validators.js            # Input validation schemas
│       └── constants.js             # Application constants
├── 📋 tests/                        # Test suites
├── 📚 docs/                         # API documentation
├── 🐳 docker/                       # Docker configuration
├── 📄 .env.example                  # Environment variables template
├── 📦 package.json                  # Dependencies and scripts
├── 🔒 .gitignore                    # Git ignore rules
└── 📖 README.md                     # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16.0.0 or higher) 
- **npm** or **yarn** package manager
- **PostgreSQL** (v12 or higher)
- **Redis** (v6 or higher) - for caching and sessions
- **Cloudinary Account** - for media storage (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/websachat-backend.git
   cd websachat-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   
   Copy the example environment file and configure your settings:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3000
   API_VERSION=v1

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=websachat_db
   DB_DIALECT=postgres

   # Authentication
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret

   # Redis Configuration
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=

   # Media Storage (Cloudinary)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Email Service (SendGrid/NodeMailer)
   EMAIL_SERVICE=sendgrid
   EMAIL_API_KEY=your_email_api_key
   FROM_EMAIL=noreply@websachat.com

   # External APIs
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   FACEBOOK_APP_ID=your_facebook_app_id
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb websachat_db

   # Run migrations
   npm run migrate

   # Seed initial data (optional)
   npm run seed
   ```

5. **Start the application**
   ```bash
   # Development mode (with hot reload)
   npm run dev

   # Production mode
   npm start
   ```

The server will be running at `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | User registration |
| POST | `/auth/login` | User login |
| POST | `/auth/logout` | User logout |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |

### User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/profile` | Get current user profile |
| PUT | `/users/profile` | Update user profile |
| GET | `/users/:id` | Get user by ID |
| POST | `/users/follow/:id` | Follow/unfollow user |
| GET | `/users/followers` | Get followers list |
| GET | `/users/following` | Get following list |

### Posts & Social Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/posts` | Get timeline posts |
| POST | `/posts` | Create new post |
| GET | `/posts/:id` | Get specific post |
| PUT | `/posts/:id` | Update post |
| DELETE | `/posts/:id` | Delete post |
| POST | `/posts/:id/like` | Like/unlike post |
| POST | `/posts/:id/comments` | Add comment |
| GET | `/posts/:id/comments` | Get post comments |

### Real-time Messaging

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages/conversations` | Get user conversations |
| GET | `/messages/:conversationId` | Get conversation messages |
| POST | `/messages` | Send new message |
| PUT | `/messages/:id/read` | Mark message as read |

### WebSocket Events

| Event | Description |
|-------|-------------|
| `connection` | User connects to chat |
| `join_room` | Join specific chat room |
| `leave_room` | Leave chat room |
| `new_message` | Send/receive new message |
| `typing` | Typing indicator |
| `user_online` | User online status |
| `notification` | Real-time notifications |

## 🔧 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run database migrations
npm run migrate

# Rollback last migration
npm run migrate:rollback

# Seed database with sample data
npm run seed

# Build for production
npm run build

# Generate API documentation
npm run docs:generate
```

### Code Style & Standards

This project follows:
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **Conventional Commits** for commit messages

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start all services (app, database, redis)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Build image
docker build -t websachat-backend .

# Run container
docker run -p 3000:3000 --env-file .env websachat-backend
```

## 🚀 Production Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
DB_SSL=true
CORS_ORIGIN=https://yourdomain.com
LOG_LEVEL=error
```

### Recommended Production Setup

- **Process Manager**: PM2 for Node.js process management
- **Reverse Proxy**: Nginx for load balancing and SSL termination
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for session storage and caching
- **Monitoring**: Winston logging with external log aggregation
- **Security**: Helmet.js for security headers

## 📊 Performance & Monitoring

### Key Metrics

- **Response Time**: Average API response time
- **Throughput**: Requests per second
- **Database Performance**: Query execution time
- **Memory Usage**: Application memory consumption
- **WebSocket Connections**: Active real-time connections

### Monitoring Tools Integration

- **Application Performance Monitoring (APM)**
- **Database Query Analysis**
- **Real-time Error Tracking**
- **User Analytics**

## 🔒 Security Features

- **JWT Authentication** with refresh token rotation
- **Password Hashing** using bcrypt
- **Rate Limiting** to prevent abuse
- **Input Validation** and sanitization
- **CORS Configuration** for cross-origin requests
- **Security Headers** via Helmet.js
- **SQL Injection Protection** via ORM
- **XSS Protection** through input sanitization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation when necessary
- Ensure all tests pass before submitting PR
- Use meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 WebSaChat Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Support & Contact

- **Documentation**: [docs.websachat.com](https://docs.websachat.com)
- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/websachat-backend/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/yourusername/websachat-backend/discussions)
- **Email**: support@websachat.com
- **Discord**: [Join our community](https://discord.gg/websachat)

---

<div align="center">
  <p>Made with ❤️ by the WebSaChat Team</p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>