# ChatterSphere

ChatterSphere is a full-featured real-time chat application with user authentication and file sharing capabilities. Built with Node.js and React, this application demonstrates the use of WebSockets for live communication and showcases user presence with online/offline statuses.

## Features

- **User Authentication**: Secure login and registration system.
- **Real-Time Messaging**: Instantly send and receive messages through WebSockets.
- **File Sharing**: Attach files to messages which can be downloaded by recipients.
- **Online/Offline Status**: Shows who is currently online and who is offline.
- **Auto-scroll**: Automatically scrolls to the latest message in the chat window.
- **Logout Capability**: Allows users to securely logout.

## Technologies Used

- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: bcrypt for hashing and salting passwords
- **Other**: WebSocket for real-time communication, dotenv for environment variables management

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- Node.js
- npm or yarn
- MongoDB

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chatapp.git
   cd chatapp
   
2. # Install backend dependencies
    npm install

  # Navigate to the frontend directory (if separate) and install dependencies
    cd frontend
    npm install

3. Create a .env file in the root directory of your project and add the following environment variables:
   MONGO_URL=mongodb://localhost:27017/chatapp
  JWT_SECRET=your_jwt_secret
  CLIENT_URL=http://localhost:3000
  PORT=4000

4. Run the development servers:
  Start the backend server: nodemon index.js

5. In a new terminal, start the frontend server:
   npm run dev

# Usage
After starting the servers, open http://localhost:3000 in your browser to view the application.

## Author

- **Vaishavi Vijayakandan** - *Author* - [VaishaviV](https://github.com/vaishavi)





