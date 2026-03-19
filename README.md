# Production Order Dashboard - Vue.js Frontend

A modern, responsive Vue.js application for managing production orders with AI-powered insights and real-time tracking capabilities.

## 🚀 Features

### Core Functionality
- **📋 Order Management**: Create, view, and update production orders
- **📊 Real-time Dashboard**: Live statistics and AI-powered recommendations
- **🔄 Status Tracking**: Track orders through Pending → In Progress → Completed workflow
- **⚡ Priority Scoring**: AI-driven priority calculation based on quantity and due dates
- **🔍 Advanced Filtering**: Filter by status, search by product name or ID
- **👥 User Management**: Admin interface to view, create, edit, and delete users
- **📱 Responsive Design**: Optimized for desktop, tablet, and mobile devices

### Technical Features
- **🎨 Modern UI/UX**: Clean, intuitive interface with accessibility best practices
- **⚡ Performance Optimized**: Lazy loading, efficient state management, and optimized builds
- **🔐 Authentication & Authorization**: JWT-based auth with role-based access control (RBAC)
- **🧪 Well Tested**: Comprehensive test suite with Vue Test Utils and Vitest
- **♿ Accessibility First**: WCAG compliant with ARIA labels and keyboard navigation
- **🌐 API Integration**: RESTful API communication with error handling
- **👮 Admin Panel**: Complete user management system for administrators

## 🏗️ Architecture Overview

### Frontend Stack
```
Vue 3 (Composition API) + TypeScript
├── 🏪 Pinia (State Management)
├── 🛣️ Vue Router (Navigation)
├── 🎨 Custom CSS (Responsive Design)
├── 📡 Axios (HTTP Client)
├── 🧪 Vitest + Vue Test Utils (Testing)
└── ⚡ Vite (Build Tool)
```

### Project Structure
```
po-frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable Vue components
│   │   ├── __tests__/      # Component tests
│   │   ├── AppHeader.vue   # Navigation header
│   │   ├── AppFooter.vue   # Application footer
│   │   ├── OrderList.vue   # Orders table with filtering
│   │   ├── OrderForm.vue   # Create new order form
│   │   ├── OrderRow.vue    # Individual order row
│   │   ├── StatusBadge.vue # Status indicator
│   │   ├── PriorityBadge.vue # Priority indicator
│   │   ├── StatusButton.vue  # Status update button
│   │   ├── StatsDashboard.vue # Statistics overview
│   │   └── UserList.vue    # User management table
│   ├── views/              # Page components
│   │   ├── Dashboard.vue   # Main dashboard page
│   │   ├── Login.vue       # Authentication page
│   │   ├── Register.vue    # User registration
│   │   ├── Profile.vue     # User profile
│   │   ├── Users.vue       # User management (admin)
│   │   ├── CreateUser.vue  # Create new user (admin)
│   │   ├── EditUser.vue    # Edit user (admin)
│   │   └── NotFound.vue    # 404 error page
│   ├── stores/             # Pinia stores
│   │   ├── __tests__/      # Store tests
│   │   ├── orders.ts       # Order management state
│   │   └── auth.ts         # Authentication state
│   ├── services/           # Business logic
│   │   ├── __tests__/      # Service tests
│   │   ├── api.ts          # API communication
│   │   └── utils.ts        # Utility functions
│   ├── types/              # TypeScript definitions
│   │   └── index.ts        # Type definitions
│   ├── assets/             # Styles and assets
│   │   └── css/
│   │       └── main.css    # Global styles
│   ├── router/             # Route configuration
│   │   └── index.ts        # Router setup
│   └── main.ts             # Application entry point
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── vitest.config.ts        # Test configuration
└── tsconfig.json           # TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running on `http://localhost:3000`

### Installation

1. **Clone and navigate to the frontend directory:**
   ```bash
   cd po-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # .env file is already configured with:
   VITE_API_BASE_URL=http://localhost:3000
   VITE_APP_TITLE=Production Order Dashboard
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:8080`

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Lint code with ESLint
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
```

## 🎯 Usage Guide

### Dashboard Overview
The main dashboard provides:
- **Statistics Cards**: Total orders, status breakdown, priority metrics
- **AI Recommendations**: Critical orders, overdue alerts, batch processing suggestions
- **Order Management**: Create, view, and update production orders

### Creating Orders
1. Click "New Order" button
2. Fill in product details:
   - Product Name (required, 1-255 characters)
   - Quantity (required, positive integer, max 1,000,000)
   - Due Date (required, future date)
3. Submit to create the order

### Managing Orders
- **View Orders**: Sortable table with filtering and search
- **Update Status**: Click status buttons to progress orders
- **Filter & Search**: Use status dropdown and search box
- **Priority Insights**: AI-calculated priority scores with color coding

### Authentication
- **Sign In**: Use demo credentials (username: `admin`, password: `Admin123`)
- **Register**: Create new account with role selection
- **Profile**: View account details and manage settings

### User Management (Admin Only)
- **View Users**: Sortable table with all system users
- **Filter & Search**: Filter by role (admin/manager/user), search by username, email, or ID
- **Create Users**: Admin interface to register new users with specific roles
- **Edit Users**: Update username, email, role, or reset passwords
- **Delete Users**: Remove users from the system (with self-delete protection)
- **Role-Based Access**: Only administrators can access user management features

## 👥 User Management System

### Overview
The application includes a comprehensive user management system accessible only to administrators. This allows admins to manage all system users, assign roles, and control access.

### Available Roles
- **Admin**: Full system access including user management
- **Manager**: Enhanced permissions for production order management
- **User**: Standard access to view and manage production orders

### Admin Features

#### View All Users (`/users`)
- Sortable table displaying all users with ID, username, email, role, and creation date
- Filter users by role (admin/manager/user)
- Search across usernames, emails, and user IDs
- Pagination support (10 users per page)
- Real-time refresh capability

#### Create New User (`/users/new`)
- Admin-only user registration interface
- Required fields: username, email, password, role
- Client-side validation with real-time feedback
- Password strength requirements enforced
- Automatic redirect to users list on success

#### Edit User (`/users/:id/edit`)
- Update user information (username, email, role)
- Optional password reset functionality
- Shows user metadata (ID, creation date)
- Change detection - only saves if modifications made
- Validation ensures data integrity

#### Delete User
- Confirmation modal before deletion
- Self-delete protection (admins cannot delete themselves)
- Permanent deletion with no recovery
- Immediate UI update on success

### Access Control
- User management routes protected by `requiresAdmin` guard
- Navigation menu shows "Users" link only for admin users
- API endpoints require admin role authentication
- Unauthorized access attempts redirect to dashboard

### API Endpoints
All user management endpoints require admin authentication:
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get specific user details
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user information
- `DELETE /api/users/:id` - Delete user

## 🔧 Technical Choices & Rationale

### Frontend Framework: Vue 3
- **Composition API**: Better TypeScript integration and code organization
- **Performance**: Optimized reactivity system and tree-shaking
- **Developer Experience**: Excellent tooling and debugging capabilities

### State Management: Pinia
- **Type Safety**: Full TypeScript support out of the box
- **Simplicity**: Less boilerplate compared to Vuex
- **DevTools**: Excellent debugging experience

### Styling: Custom CSS
- **Performance**: No external CSS framework overhead
- **Customization**: Complete control over design system
- **Accessibility**: Built-in focus management and ARIA support

### Build Tool: Vite
- **Speed**: Fast development server and HMR
- **Modern**: ES modules and optimized builds
- **TypeScript**: Native TypeScript support

### Testing: Vitest + Vue Test Utils
- **Speed**: Faster than Jest with native ES modules
- **Integration**: Built for Vite projects
- **Coverage**: Comprehensive testing utilities


### Running Tests
```bash
npm run test              # Run all tests
npm run test:ui           # Visual test runner
npm run test:coverage     # Generate coverage report
```

This project is ulitize the tools of AI coding, Claude Sonnet 4.0 and Sonnet 4.5.