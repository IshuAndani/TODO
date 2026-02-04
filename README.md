# JWT Authentication with Node.js, Express, and MongoDB

This project is a simple web application that demonstrates user authentication using JWTs. It includes user registration, login, and protected routes.

## Project Structure

- `backend/`: Contains the Node.js/Express server and all related files.
  - `index.js`: The main server file.
  - `package.json`: Project dependencies and scripts.
- `frontend/`: Contains the HTML files for the user interface.
  - `index.html`: The home page.
  - `login.html`: The login page.
  - `register.html`: The registration page.

## How to Run the Application

1. **Prerequisites:**
   - Make sure you have Node.js and MongoDB installed and running on your local machine.

2. **Backend Setup:**
   - Navigate to the `backend` directory:
     ```bash
     cd backend
     ```
   - Install the dependencies:
     ```bash
     npm install
     ```
   - Start the server:
     ```bash
     node index.js
     ```
   - The server will be running on `http://localhost:3000`.

3. **Frontend:**
   - Open your web browser and navigate to `http://localhost:3000`.

## Security Note

The `JWT_SECRET` is currently hardcoded in `backend/index.js`. In a production environment, you should store this secret securely, for example, as an environment variable.