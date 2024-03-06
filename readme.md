# Video Sharing Platform - Backend

Welcome to the Video Sharing Platform backend, a Node.js and Express.js application that provides a robust foundation for a video-sharing platform. This backend handles user authentication, file uploads to Cloudinary, and various social features.

## Features

### 1. Proper Routing

Ensure a structured and organized application flow with proper routing using Express.js. Different routes handle user authentication, video uploads, likes, comments, subscriptions, and more.

### 2. User Authentication and Authorization

Implement secure user authentication and authorization using JWT (JSON Web Tokens) and bcrypt. This ensures that only authenticated users can perform certain actions, maintaining the privacy and security of user data.

### 3. File Uploads to Cloudinary

Utilize Cloudinary for efficient storage and retrieval of multimedia content. Multer is employed to handle file uploads, allowing users to upload both image and video files seamlessly.

### 4. Social Features

Enable users to engage with content through various social features:

- **Like:** Users can express their appreciation for videos.
- **Comment:** Foster discussions and interactions with a commenting system.
- **Subscribe:** Allow users to subscribe to channels for updates.
- **Tweet:** Community post for channel.

### 5. MongoDB Database

Utilize MongoDB as the database for storing user information, video metadata, likes, comments, and other relevant data. The `mongoose` library simplifies interaction with the MongoDB database.

## Dependencies

- **bcrypt** (`^5.1.1`): Library for hashing passwords.
- **cloudinary** (`^2.0.1`): Cloud storage for images and videos.
- **cookie-parser** (`^1.4.6`): Parse HTTP request cookies.
- **cors** (`^2.8.5`): Enable Cross-Origin Resource Sharing.
- **dotenv** (`^16.4.5`): Load environment variables from a `.env` file.
- **express** (`^4.18.2`): Web application framework for Node.js.
- **jsonwebtoken** (`^9.0.2`): Generate and verify JSON web tokens.
- **mongoose** (`^8.2.0`): MongoDB object modeling for Node.js.
- **mongoose-aggregate-paginate-v2** (`^1.0.7`): Paginate plugin for Mongoose.
- **multer** (`^1.4.5-lts.1`): Handle file uploads in Express.

## Development Dependencies

- **nodemon** (`^3.1.0`): Monitor for changes and automatically restart the server during development.

## Getting Started

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Create a `.env` file and configure your environment variables (e.g., Cloudinary credentials, MongoDB URI, JWT secret, refer .env.sample).
4. Start the server with `npm start` or `npm run dev` for development with nodemon.

## Contributing

Feel free to contribute, report issues, or suggest enhancements. Your contributions are valuable in making this backend even better!

Happy coding! 🚀
