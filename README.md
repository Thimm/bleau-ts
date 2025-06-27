# 🧗‍♀️ Fontainebleau Route Finder

A beautiful and functional Progressive Web App for discovering amazing bouldering routes in Fontainebleau, France.

## ✨ Features

### 🗺️ Interactive Map
- **Route Visualization**: View thousands of routes plotted on an interactive map
- **Area Boundaries**: Toggle area boundaries to understand the geographical layout
- **Grade-Coded Markers**: Routes are color-coded by difficulty grade
- **Rich Popups**: Detailed route information with direct links to Bleau.info

### 🔍 Advanced Filtering
- **Grade Range**: Filter by French bouldering grades (2 to 8b+)
- **Steepness**: Filter by route style (slab, vertical, overhang, traverse, etc.)
- **Areas**: Select specific climbing areas
- **Start Type**: Filter by sit start vs standing start
- **Popularity**: Filter by route popularity (0-100)

### 📱 Project Management
- **Save Projects**: Bookmark routes you want to climb
- **Export Projects**: Download your project list as CSV
- **Project Visualization**: Projects are highlighted on the map with special markers

### 🎨 Beautiful Design
- **Dark Theme**: Eye-friendly dark interface perfect for outdoor use
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Grade Color Coding**: Visual grade representation with color-coded badges

### 📱 Progressive Web App
- **Offline Capable**: Install on your device and use offline
- **Fast Loading**: Optimized performance with data caching
- **App-like Experience**: Native app feel with push notifications support
- **Cross-Platform**: Works on iOS, Android, and desktop

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

4. **Install as PWA**
   - Open in browser
   - Look for "Install App" prompt or add to home screen

## 📊 Data Source

The application uses data from:
- **Routes**: Extracted from the Boolder database (~28,000+ routes)
- **Areas**: GeoJSON data for area boundaries and priorities
- **External Links**: Direct integration with Bleau.info for detailed route information

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom design system
- **Maps**: React Leaflet with OpenStreetMap
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **PWA**: next-pwa for offline functionality
- **TypeScript**: Full type safety

## 🎯 Key Components

### RouteMap
Interactive Leaflet map displaying routes and areas with clustering and popups.

### FilterPanel
Comprehensive filtering system with real-time route updates.

### RouteList
Grid-based route display with detailed information cards.

### ProjectList
Personal project management with export functionality.

## 📱 Mobile Optimization

- **Touch-Friendly**: Large touch targets and gesture support
- **Responsive Layout**: Adapts to all screen sizes
- **PWA Features**: Install prompt and offline functionality
- **Performance**: Optimized for mobile networks

## 🌟 Usage Tips

1. **Finding Routes**: Use the grade and area filters to narrow down routes
2. **Planning Sessions**: Add routes to your projects for trip planning
3. **Offline Use**: Install as PWA for offline access to your projects
4. **Sharing**: Export your project list to share with climbing partners

## 🏗️ Architecture

The app follows a clean, modular architecture:
- **Data Layer**: JSON files for routes and areas
- **State Management**: React hooks for client-side state
- **UI Components**: Reusable, typed components
- **Utilities**: Grade conversion and helper functions

## 🔧 Development

### File Structure
```
├── app/                 # Next.js app directory
├── components/          # React components
├── types/              # TypeScript definitions
├── utils/              # Utility functions
├── public/             # Static assets and data
└── styles/             # Global styles
```

### Key Features Implementation
- **PWA Manifest**: Configured for standalone app experience
- **Service Worker**: Automatic caching with next-pwa
- **TypeScript**: Full type safety throughout
- **Responsive Design**: Mobile-first approach

## 🚀 Performance

- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Next.js automatic image optimization
- **Data Caching**: Efficient caching strategies
- **Bundle Splitting**: Automatic code splitting

## 🌍 Deployment

The app is ready for deployment on:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Static hosting** (after `npm run build`)

## 📜 License

This project is open source and available under the MIT License.

---

**Happy Climbing! 🧗‍♀️** 

Discover your next project in the beautiful forests of Fontainebleau! 