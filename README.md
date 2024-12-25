# Volunteer Management Server

## Overview

The server-side of the Volunteer Management Website is responsible for handling API requests, managing data storage, and ensuring secure communication between the frontend and the database. It is built using **Node.js** and **Express.js**, with **MongoDB** as the database.

## Features

1. **Authentication**

   - Email/password-based authentication.
   - JWT implementation for secure user sessions.
   - Role-based access for specific routes.

2. **API Endpoints**

   - CRUD operations for volunteer need posts.
   - Volunteer requests management.
   - Search functionality for posts.

3. **Security**

   - Secures sensitive information using environment variables.
   - Prevents unauthorized access to private routes.

4. **Performance**
   - Optimized queries to handle large datasets.
   - Implements middleware for error handling and CORS.

## Technologies Used

- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Framework for building RESTful APIs.
- **MongoDB**: Database to store application data.
- **dotenv**: For environment variable management.
- **jsonwebtoken (JWT)**: For authentication.
- **cors**: To handle cross-origin resource sharing.
