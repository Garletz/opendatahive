# OpenDataHive 🐝

A modern, interactive platform for discovering and managing open data sources, structured as a hexagonal hive. Built with React, TypeScript, and Firebase.

![OpenDataHive](https://img.shields.io/badge/OpenDataHive-v0.2.0-amber)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)
![Firebase](https://img.shields.io/badge/Firebase-11.9.1-orange)

## 🎥 Demo Video

Watch the full presentation and demo of OpenDataHive:

[![OpenDataHive Demo](https://img.youtube.com/vi/MtsT2KD26II/maxresdefault.jpg)](https://www.youtube.com/watch?v=MtsT2KD26II)

*Click the image above to watch the video on YouTube*

## ✨ Features

- **Interactive Hexagonal Grid**: Visualize data sources in a beautiful honeycomb layout
- **3D Sphere View**: Alternative 3D visualization of your data sources
- **AI Archivist**: Intelligent assistant to help manage and discover data
- **Data Bounty Board**: Request specific datasets and collaborate with the community
- **User Authentication**: GitHub and anonymous authentication support
- **Real-time Statistics**: Track views, clicks, and engagement metrics
- **Advanced Search & Filtering**: Find data by tags, format, and access type
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Technologies Used

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Animation**: Framer Motion
- **3D Graphics**: Three.js, React Three Fiber
- **Backend**: Firebase (Firestore, Authentication, Analytics)
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher)
- **npm** (version 9.0.0 or higher)
- A **Firebase account** (free tier is sufficient)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Garletz/opendatahive.git
cd opendatahive
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Setup

#### Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "opendatahive")
4. Enable Google Analytics (optional)
5. Click "Create project"

#### Enable Required Services

**Firestore Database:**
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (we'll configure security rules later)
4. Select a location for your database

**Authentication:**
1. Go to "Authentication" → "Sign-in method"
2. Enable "GitHub" provider:
   - You'll need to create a GitHub OAuth App
   - Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
   - Set Authorization callback URL to: `https://your-project-id.firebaseapp.com/__/auth/handler`
   - Copy Client ID and Client Secret to Firebase
3. Enable "Anonymous" provider

#### Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" → Web app (</>) 
4. Register your app with a nickname
5. Copy the configuration object

### 4. Environment Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your Firebase configuration:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Application Configuration
VITE_APP_NAME=OpenDataHive
VITE_APP_URL=https://opendatahive.fr
```

### 5. Configure Firebase Security Rules

1. In Firebase Console, go to "Firestore Database" → "Rules"
2. Copy the rules from `FIREBASE_RULES_UPDATE.md` and paste them
3. Click "Publish"

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript type checking

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── archivist/      # AI Archivist components
│   ├── auth/           # Authentication components
│   ├── dataRequests/   # Data request components
│   ├── grid/           # Hexagonal grid components
│   ├── icons/          # Custom icons
│   ├── layout/         # Layout components
│   └── modals/         # Modal components
├── context/            # React contexts
├── pages/              # Page components
├── styles/             # CSS styles
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🔧 Configuration

### Firebase Security Rules

The project includes comprehensive Firebase security rules in `FIREBASE_RULES_UPDATE.md`. These rules ensure:

- Users can only modify their own data
- Public data is readable by everyone
- Private data is only accessible to the owner
- Proper validation of data structure

### Environment Variables

All sensitive configuration is handled through environment variables. Never commit your `.env` file to version control.

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Firebase Hosting (Optional)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init hosting
```

4. Deploy:
```bash
firebase deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Firebase Connection Issues

If you see Firebase-related errors:

1. Verify all environment variables are set correctly in `.env`
2. Check that your Firebase project has Firestore and Authentication enabled
3. Ensure your Firebase security rules are properly configured
4. Check the browser console for detailed error messages

### Build Issues

If you encounter build errors:

1. Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`
2. Check that all environment variables are prefixed with `VITE_`
3. Ensure you're using Node.js version 18 or higher

### Authentication Issues

If authentication isn't working:

1. Verify GitHub OAuth app is configured correctly
2. Check that the callback URL matches your Firebase project
3. Ensure both GitHub and Anonymous providers are enabled in Firebase


## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Powered by [Firebase](https://firebase.google.com/)
- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- 3D graphics with [Three.js](https://threejs.org/)

---

## 📞 Contact

Get in touch with the OpenDataHive team:

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/opendatahive)
[![Devpost](https://img.shields.io/badge/Devpost-003E54?style=for-the-badge&logo=devpost&logoColor=white)](https://devpost.com/lixo-argent/followers)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/33628782725)

---

Built for the open data community 🌍