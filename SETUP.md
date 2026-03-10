# Quick Setup Guide

## Step 1: Install Dependencies

Open terminal in the project root and run:

```bash
npm install
cd client
npm install
cd ..
```

Or use the convenience script:
```bash
npm run install-all
```

## Step 2: Start the Application

### Option 1: Run both server and client together (Recommended)
```bash
npm run dev
```

### Option 2: Run separately

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

## Step 3: Access the Application

- **User Portal**: http://localhost:3000/user/login
- **Admin Portal**: http://localhost:3000/admin/login

## Default Admin Login

- **Email**: admin@service.com
- **Password**: admin123

## First Steps

1. **As Admin**:
   - Login with default credentials
   - Add technicians from "Technicians" menu
   - Set payment amounts from "Payment Settings" menu
   - View and manage services from "Services" menu

2. **As User**:
   - Register a new account from user login page
   - Request a service from "Request Service" tab
   - View service history from "Service History" tab

## Database

The SQLite database (`database.sqlite`) will be created automatically in the `server` folder on first run. No additional setup needed!

## Troubleshooting

- If port 3000 or 5000 is already in use, you can change them:
  - Frontend: Edit `client/package.json` scripts or set `PORT` environment variable
  - Backend: Edit `server/index.js` or set `PORT` in `.env` file

- If you see CORS errors, make sure the backend is running on port 5000

- Clear browser cache if you see authentication issues
