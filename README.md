# Voluntarios Platform

This repository contains the backend for the Voluntarios platform, designed to connect volunteer opportunities with individuals seeking to complete social service hours.

## Project Structure

This project uses a single-project structure with:

-   **Backend**: Node.js + Express + SQLite (with better-sqlite3)
-   **Frontend**: React (with Vite) + Tailwind CSS (To be implemented)
-   **Authentication**: JWT-based with email/password

## Backend Setup

### Technologies Used

-   Node.js
-   Express.js
-   better-sqlite3
-   jsonwebtoken
-   bcryptjs
-   cors
-   nodemailer
-   dotenv
-   multer

### Installation

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration

Create a `.env` file in the `server` directory based on `server/.env.example` and fill in the necessary details, especially for `JWT_SECRET` and `SMTP` settings for email functionality.

```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here

# Nodemailer SMTP settings
SMTP_HOST=smtp.your-email-provider.com
SMTP_PORT=587 # or 465 for SSL
SMTP_SECURE=false # true for 465, false for other ports
SMTP_USER=your_email@example.com
PASS=your_email_password
```

### Running the Backend

From the `server` directory, start the server:

```bash
npm start
```

The server will run on `http://localhost:5000` (or the port specified in your `.env` file).

## Database Schema

The SQLite database (`voluntarios.db`) is set up with the following tables:

-   **users**: Stores user information (email, password hash, role, email verification status, organization ID).
-   **organizations**: Stores details about organizations (name, contact email, logo path, description, status).
-   **opportunities**: Stores volunteer opportunities (title, description, location, dates, slots, status).
-   **signups**: Records volunteer sign-ups for opportunities.
-   **activity_log**: Logs important actions within the system.

## API Endpoints (Backend)

### Authentication (`/api/auth`)

-   `POST /register`: Register a new volunteer user.
-   `GET /verify-email`: Verify user email with a token.
-   `POST /login`: Authenticate user and get a JWT token.
-   `GET /me`: Get details of the currently logged-in user (protected).

### Super Admin (`/api/admin`)

*(Requires `super_admin` role)*

-   `POST /organizations`: Create a new organization and assign an organization admin.
-   `PUT /organizations/:id/status`: Update an organization's status (approved, rejected, disabled).
-   `GET /organizations`: View all organizations with optional status filter.
-   `GET /opportunities`: View all opportunities across the platform.
-   `GET /signups`: View all volunteer sign-ups across the platform.

### Organization Admin (`/api/organizations`)

*(Requires `org_admin` role)*

-   `POST /opportunities`: Create a new volunteer opportunity.
-   `PUT /opportunities/:id`: Update an existing opportunity.
-   `GET /opportunities`: View all opportunities belonging to the organization.
-   `GET /opportunities/:id/volunteers`: View volunteers signed up for a specific opportunity.
-   `PUT /signups/:id/status`: Mark attendance/status for a volunteer signup.
-   `GET /opportunities/:id/export-csv`: Export volunteer list for an opportunity as CSV.

### Volunteer (`/api/volunteers`)

*(Requires `volunteer` role)*

-   `GET /opportunities`: Browse all published and approved opportunities.
-   `POST /opportunities/:id/signup`: Sign up for an opportunity.
-   `PUT /signups/:id/cancel`: Cancel a volunteer signup.
-   `GET /my-signups`: View personal signup history.

### Public (`/api/public`)

*(No authentication required)*

-   `GET /opportunities`: Get all published and approved opportunities with optional filters (location, date).
-   `GET /opportunities/:id`: Get details for a single opportunity.

## Business Rules Implemented

-   **Organization Approval**: Only approved organizations can publish opportunities.
-   **Opportunity Status**: Automatically updates to 'full' when remaining slots reach zero.
-   **Duplicate Signups**: Prevents a volunteer from signing up for the same opportunity multiple times.
-   **Overbooking Prevention**: Ensures `remaining_slots` cannot go below zero.
-   **Activity Logging**: Important actions (e.g., organization approval, opportunity published, volunteer registered) are logged.
-   **Email Verification**: Volunteers must verify their email once.
-   **Cancellation Policy**: Volunteers cannot cancel signups for opportunities that have already started.

## Default Super Admin Credentials

-   **Email**: `admin@voluntarios.com`
-   **Password**: `admin123`
