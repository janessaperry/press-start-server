# Press Start Server

A Node.js Express server with TypeScript.

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=8080
   CORS_ORIGIN=http://localhost:3000
   NODE_ENV=development
   ```

## Development

To run the server in development mode with hot reloading:

```
npm run dev
```

## Building for Production

To compile TypeScript to JavaScript:

```
npm run build
```

To start the production server:

```
npm start
```

## API Endpoints

- `GET /`: Welcome message
- `GET /health`: Health check endpoint

## Project Structure

```
press-start-server/
├── src/                  # TypeScript source files
│   └── index.ts          # Main application entry point
├── dist/                 # Compiled JavaScript (generated)
├── node_modules/         # Dependencies
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project metadata and dependencies
├── package-lock.json     # Dependency lock file
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## Technologies Used

- Node.js
- Express
- TypeScript
- CORS
- dotenv