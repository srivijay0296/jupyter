# Social Media App 🚀

A comprehensive Twitter-like social media application built with modern technologies including React, Next.js, Node.js, Express, MongoDB, and Socket.IO.

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login with JWT authentication
- Profile management with bio, location, website, and profile pictures
- Password security with bcrypt hashing
- Email and username validation

### 📝 Posts & Content
- Create, edit, and delete posts (280 character limit)
- Rich media support (images, videos, GIFs)
- Hashtag and mention support
- Post visibility controls (public, followers only)
- Real-time post updates

### 🤝 Social Features
- Follow/unfollow users
- Like and retweet posts
- Comment on posts with threading support
- Real-time notifications for likes, follows, comments
- User suggestions based on activity

### 🔍 Discovery & Search
- Search for users by username or full name
- Trending topics and hashtags
- Explore feed with popular posts
- Suggested users to follow

### 💬 Real-time Features
- Live notifications using Socket.IO
- Real-time post updates
- Live activity indicators
- Instant messaging (planned)

### 🎨 User Experience
- Modern, responsive design with Tailwind CSS
- Dark/light theme support
- Mobile-first approach
- Infinite scroll for feeds
- Image/video upload with Cloudinary integration

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **React Hot Toast** - Beautiful notifications
- **Axios** - HTTP client for API requests
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **Bcrypt** - Password hashing
- **Cloudinary** - Media management and optimization
- **Multer** - File upload handling

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **MongoDB Atlas** - Cloud database (production)
- **Vercel** - Frontend deployment
- **Railway/Heroku** - Backend deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd social-media-app
\`\`\`

### 2. Environment Setup

#### Backend Environment
Create \`backend/.env\`:
\`\`\`env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialmedia
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000

# Optional: Cloudinary for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

#### Frontend Environment
Create \`frontend/.env.local\`:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

### 3. Install Dependencies
\`\`\`bash
# Install root dependencies
npm install

# Install all dependencies (frontend + backend)
npm run install-all
\`\`\`

### 4. Start MongoDB
Make sure MongoDB is running locally or use MongoDB Atlas.

### 5. Run the Application
\`\`\`bash
# Start both frontend and backend
npm run dev

# Or run separately:
npm run backend:dev  # Backend on http://localhost:5000
npm run frontend:dev # Frontend on http://localhost:3000
\`\`\`

## 🐳 Docker Development

### Using Docker Compose
\`\`\`bash
# Build and start all services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
\`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: mongodb://localhost:27017

## 📁 Project Structure

\`\`\`
social-media-app/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app router pages
│   │   ├── components/      # Reusable React components
│   │   │   ├── ui/          # UI components (Button, Spinner, etc.)
│   │   │   ├── layout/      # Layout components (Sidebar, Header)
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── posts/       # Post-related components
│   │   │   └── users/       # User-related components
│   │   ├── contexts/        # React contexts (Auth, Theme)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility libraries (API client)
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Helper functions
│   ├── public/              # Static assets
│   └── package.json
├── backend/                 # Express.js backend API
│   ├── models/              # Mongoose data models
│   ├── routes/              # API route handlers
│   ├── middleware/          # Express middleware
│   ├── utils/               # Helper utilities
│   ├── server.js            # Main server file
│   └── package.json
├── database/                # Database scripts and migrations
├── docker-compose.yml       # Docker Compose configuration
└── README.md
\`\`\`

## 🔧 API Endpoints

### Authentication
- \`POST /api/auth/register\` - User registration
- \`POST /api/auth/login\` - User login
- \`GET /api/auth/me\` - Get current user profile
- \`PUT /api/auth/profile\` - Update user profile

### Posts
- \`GET /api/posts\` - Get feed posts
- \`POST /api/posts\` - Create new post
- \`GET /api/posts/:id\` - Get single post
- \`POST /api/posts/:id/like\` - Like/unlike post
- \`POST /api/posts/:id/retweet\` - Retweet post
- \`POST /api/posts/:id/comment\` - Comment on post
- \`DELETE /api/posts/:id\` - Delete post

### Users
- \`GET /api/users/:username\` - Get user profile
- \`POST /api/users/:id/follow\` - Follow/unfollow user
- \`GET /api/users/:id/followers\` - Get user followers
- \`GET /api/users/:id/following\` - Get user following
- \`GET /api/users/search\` - Search users
- \`GET /api/users/suggestions\` - Get suggested users

### Media Upload
- \`POST /api/upload/image\` - Upload single image
- \`POST /api/upload/video\` - Upload single video
- \`POST /api/upload/multiple\` - Upload multiple images

## 🌐 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Create new app on Railway or Heroku
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Database (MongoDB Atlas)
1. Create MongoDB Atlas cluster
2. Update MONGODB_URI in environment variables
3. Configure network access and database users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by Twitter's design and functionality
- Built with modern web development best practices
- Uses open-source libraries and frameworks

## 📞 Support

If you have any questions or need help with setup, please:
1. Check the documentation above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Contact the development team

---

Made with ❤️ by the Social Media App Team