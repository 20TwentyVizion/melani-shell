
# Melani OS - AI-Enhanced Web Operating System

## Project Overview

Melani OS is a sophisticated web-based operating system that brings the power of artificial intelligence directly to your browser. Built with modern web technologies, it provides a complete desktop-like experience with advanced AI integration, smart automation, and intuitive voice controls.

**Live Project**: https://lovable.dev/projects/1397a91c-90b2-4593-94ea-934bc2b6fb68

## 🌟 Key Features

### AI-Powered Core
- **Melani Assistant**: Integrated AI assistant powered by Google Gemini (default), WebLLM, or Ollama
- **Smart Suggestions**: Context-aware app recommendations based on usage patterns and time of day
- **Predictive Text**: Intelligent text completion across all applications
- **Voice Commands**: Full voice control system with wake word detection and natural language processing

### Modern Operating System Experience
- **Desktop Environment**: Complete windowing system with movable, resizable windows
- **System Bar**: Dynamic status bar with time, system stats, and quick actions
- **Dock**: macOS-style application launcher with animated icons
- **File System**: Complete file explorer with folder navigation and file management
- **Global Search**: Instant search across apps, files, and system functions

### Built-in Applications
- **Calculator**: Advanced calculator with scientific functions
- **Notes**: Rich text editor with AI-powered suggestions
- **Calendar**: Full calendar application with event management
- **Music Player**: Media player with playlist support
- **Task Manager**: Productivity app with smart scheduling
- **Profile Manager**: User profile customization and settings
- **System Monitor**: Real-time system performance monitoring
- **App Store**: Marketplace for additional applications
- **Games Suite**: Collection of classic games (Snake, Pong, Tetris, Space Invaders, Tic-Tac-Toe)

### Visual & User Experience
- **Dynamic Themes**: Multiple visual themes with time-based automatic switching
- **Particle Effects**: Animated background particles for visual appeal
- **Dynamic Wallpapers**: Time-sensitive and interactive background systems
- **Fluid Animations**: Smooth transitions and micro-interactions throughout the UI
- **Glass Morphism**: Modern translucent design elements with backdrop blur effects
- **Responsive Design**: Fully responsive layout that works on desktop and mobile devices

### Advanced AI Integration
- **Context-Aware Intelligence**: AI understands current time, active apps, and user patterns
- **Usage Analytics**: Smart tracking of app usage for personalized recommendations
- **Natural Language Processing**: Voice commands processed through advanced NLP
- **Multi-LLM Support**: Choose between Google Gemini, WebLLM (local), or Ollama
- **Predictive Workflows**: AI suggests next actions based on usage patterns

### System Features
- **Memory Management**: Real-time memory usage monitoring and optimization
- **Process Management**: Track and manage running applications
- **Notification System**: Toast notifications with categories and priorities
- **Keyboard Shortcuts**: Comprehensive keyboard shortcuts for power users
- **Voice Settings**: Customizable voice input/output with multiple voice options
- **Theme Customization**: Personalize appearance with multiple theme options

## 🛠️ Technical Architecture

### Frontend Technologies
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and enhanced development experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn/UI**: High-quality component library
- **Zustand**: Lightweight state management
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing

### AI & Machine Learning
- **Google Gemini API**: Primary LLM provider for AI responses
- **WebLLM**: Local browser-based language models
- **Ollama Integration**: Support for local Ollama instances
- **Web Speech API**: Native browser speech recognition and synthesis
- **Pattern Recognition**: Custom algorithms for usage pattern analysis

### State Management
- **Zustand Stores**: Modular state management for different features
- **Persistent Storage**: Local storage for user preferences and data
- **Context Providers**: React context for global state management
- **Real-time Updates**: Live system monitoring and updates

### Key Libraries & Dependencies
- **Lucide React**: Icon library with 1000+ icons
- **Recharts**: Data visualization and charts
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Dynamic className generation
- **React Hook Form**: Form handling and validation

## 🚀 Getting Started

### Prerequisites
- Node.js & npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Modern web browser with Web Speech API support

### Installation
```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### AI Configuration
1. **Google Gemini (Recommended)**:
   - Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Enter in Settings > System Settings > LLM Settings

2. **WebLLM (Local)**:
   - No configuration needed - runs entirely in browser
   - Best for privacy-conscious users

3. **Ollama (Local Server)**:
   - Install Ollama locally
   - Configure URL (default: http://localhost:11434)
   - Set model name (default: llama2)

## 🎯 Core Functionalities

### Voice Commands
- **Navigation**: "open settings", "show files", "open calculator"
- **AI Interaction**: "hey melani", "melani help", "what time is it"
- **Smart Features**: "smart suggestions", "system status"
- **Search**: "search for [query]", "find [item]"

### Keyboard Shortcuts
- `Ctrl+K`: Open global search
- `Ctrl+N`: Open notes
- `Ctrl+Shift+C`: Open calculator
- `Ctrl+F`: Open file explorer
- `Ctrl+P`: Open profile
- `Ctrl+V`: Start voice commands
- `Escape`: Close search/modals

### Smart Features
- **Time-based Suggestions**: Different app recommendations based on time of day
- **Usage Pattern Learning**: AI learns from your app usage patterns
- **Context-aware Responses**: AI understands current system state
- **Predictive Text**: Smart text completion in notes and other apps
- **Dynamic Theming**: Automatic theme switching based on time

### System Integration
- **Real-time Monitoring**: Live system stats and performance metrics
- **Memory Management**: Track and optimize memory usage
- **Process Monitoring**: View and manage running applications
- **Notification Management**: Centralized notification system
- **Settings Persistence**: All preferences saved locally

## 🔧 Customization

### Themes
- **Cyber**: Dark theme with neon accents
- **Sunset**: Warm gradient theme
- **Ocean**: Cool blue theme with wave effects
- **Forest**: Nature-inspired green theme
- **Aurora**: Dynamic theme with northern lights effect

### Voice Settings
- **Input Control**: Enable/disable voice recognition
- **Output Control**: Enable/disable voice responses
- **Voice Selection**: Choose from available system voices
- **Wake Word**: Configure voice activation phrases

### AI Preferences
- **Provider Selection**: Choose between Gemini, WebLLM, or Ollama
- **Response Style**: Customize AI personality and response length
- **Privacy Settings**: Control data sharing and learning

## 📱 Mobile Support

Melani OS is fully responsive and provides an optimized mobile experience:
- **Touch-friendly Interface**: All elements optimized for touch interaction
- **Mobile Navigation**: Simplified navigation for smaller screens
- **Adaptive Layouts**: Components automatically adjust to screen size
- **Gesture Support**: Touch gestures for window management

## 🔒 Privacy & Security

- **Local-first Approach**: Most data stored locally in browser
- **API Key Security**: Secure handling of API keys with local storage
- **No Data Collection**: No user analytics or tracking
- **Open Source**: Transparent codebase for security auditing

## 🚀 Deployment

### Using Lovable (Recommended)
1. Click "Publish" button in Lovable interface
2. Your app will be deployed instantly
3. Custom domain available with paid plans

### Manual Deployment
```bash
# Build for production
npm run build

# Deploy to your preferred hosting service
# (Netlify, Vercel, GitHub Pages, etc.)
```

## 🤝 Contributing

This project is built with Lovable's AI-powered development environment. To contribute:
1. Fork the project in Lovable
2. Make your changes using Lovable's AI assistant
3. Test thoroughly in the preview environment
4. Submit changes via the integrated version control

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

- **Documentation**: [Lovable Docs](https://docs.lovable.dev/)
- **Community**: [Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Tutorials**: [YouTube Playlist](https://www.youtube.com/watch?v=9KHLTZaJcR8&list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO)

---

## 🎮 Application Details

### Calculator
- Basic arithmetic operations
- Scientific functions
- Memory operations
- Keyboard shortcuts
- History tracking

### Notes Application
- Rich text editing
- Auto-save functionality
- AI-powered text suggestions
- Search within notes
- Export capabilities

### File Explorer
- Folder navigation
- File operations (create, delete, rename)
- Search functionality
- Multiple view modes
- Drag and drop support

### Music Player
- Audio playback controls
- Playlist management
- Volume control
- Track information display
- Shuffle and repeat modes

### Games Suite
- **Snake**: Classic snake game with score tracking
- **Pong**: Two-player paddle game
- **Tetris**: Block-falling puzzle game
- **Space Invaders**: Retro arcade shooter
- **Tic-Tac-Toe**: Strategic board game

### System Monitor
- CPU usage tracking
- Memory utilization
- Running processes
- Network statistics
- System health indicators

---

Built with ❤️ using Lovable's AI-powered development platform.
