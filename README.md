# Service Company Management Application

A full-stack web application for managing home repair services with separate admin and user portals.

## Features

### Admin Features
- **Dashboard**: View statistics (total services, users, technicians, revenue)
- **Services Management**: View all services, assign technicians, update status
- **Users Management**: View all registered users
- **Technicians Management**: Add and manage technicians
- **Payment Settings**: Set fixed payment amounts for different service types
- **Payments View**: View all payments (admin only)

### User Features
- **User Registration & Login**: Separate login page for users
- **Request Service**: Submit service requests (Fridge, AC, TV, etc.)
- **Service History**: View all past and current services
- **Dashboard**: Overview of services and statistics

## Technology Stack

- **Backend**: Node.js, Express.js, SQLite
- **Frontend**: React, Material-UI
- **Authentication**: JWT tokens with role-based access control

## Installation

1. Install backend dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

Or install all at once:
```bash
npm run install-all
```

## Running the Application

### Development Mode (runs both server and client):
```bash
npm run dev
```

### Or run separately:

Backend server:
```bash
npm run server
```

Frontend client:
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login Credentials

### Admin
- Email: `admin@service.com`
- Password: `admin123`

### User
- Register a new account from the user login page

## Project Structure

```
├── server/
│   ├── index.js              # Main server file
│   ├── database.js           # Database setup and initialization
│   ├── middleware/
│   │   └── auth.js          # Authentication middleware
│   └── routes/
│       ├── auth.js          # Authentication routes
│       ├── admin.js         # Admin routes
│       ├── user.js          # User routes
│       └── services.js     # Service routes
├── client/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context (Auth)
│   │   └── App.js           # Main app component
│   └── public/
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Admin Routes (requires admin role)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/services` - Get all services
- `GET /api/admin/users` - Get all users
- `GET /api/admin/technicians` - Get all technicians
- `POST /api/admin/technicians` - Add technician
- `PUT /api/admin/services/:id/assign` - Assign technician
- `PUT /api/admin/services/:id/status` - Update service status
- `GET /api/admin/payment-settings` - Get payment settings
- `POST /api/admin/payment-settings` - Set payment amount
- `GET /api/admin/payments` - Get all payments

### User Routes (requires user role)
- `GET /api/user/services` - Get user's services
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Services
- `POST /api/services` - Create service request
- `GET /api/services/:id` - Get service by ID

## Database Schema

- **users**: User accounts (admin and regular users)
- **technicians**: Technician information
- **services**: Service requests with status tracking
- **payments**: Payment records
- **payment_settings**: Fixed payment amounts per service type

## Security Features

- Separate login pages for admin and users
- Role-based access control (admin cannot access user pages and vice versa)
- JWT token authentication
- Password hashing with bcrypt
- Protected API routes

## Notes

- The database (SQLite) is created automatically on first run
- Default admin account is created automatically
- Payment amounts are set by admin and automatically applied to new service requests
- Service history is maintained for all users
- All dates and times are stored and displayed for service tracking
