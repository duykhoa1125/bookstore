# Bookstore Frontend

A modern React + TypeScript frontend for the Bookstore E-commerce application.

## Features

- 🛍️ Browse and search books
- 🔐 User authentication (Login/Register)
- 🛒 Shopping cart functionality
- 📦 Order management
- ⭐ Book ratings and reviews
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router** - Routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults are set):
```env
VITE_API_URL=http://localhost:3000/api
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── contexts/        # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/            # Utilities and API client
│   │   └── api.ts
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   ├── Books.tsx
│   │   ├── BookDetail.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Cart.tsx
│   │   ├── Orders.tsx
│   │   ├── OrderDetail.tsx
│   │   └── Profile.tsx
│   ├── types/          # TypeScript types
│   │   └── index.ts
│   ├── App.tsx         # Main app component
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## API Integration

The frontend communicates with the backend API through the `api.ts` client. All API calls are configured to:
- Use JWT tokens for authentication
- Handle errors automatically
- Redirect to login on 401 errors

## Features Overview

### Authentication
- User registration and login
- Protected routes
- JWT token management
- User profile

### Books
- Browse all books
- Search books
- Filter by category
- View book details
- See ratings and reviews

### Shopping Cart
- Add/remove items
- Update quantities
- View cart total
- Checkout process

### Orders
- View order history
- Order details
- Order status tracking

## Development

The app uses Vite's proxy feature to forward API requests to the backend during development. This is configured in `vite.config.ts`.

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: `http://localhost:3000/api`)

