# Line of Credit Demo

A demo application showcasing a line of credit system with user management, application processing, and transaction tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB running locally or a MongoDB Atlas connection string
- AWS SAM CLI (for local development)

### Running the Application

1. **Start the Backend**
```bash
# Install dependencies
npm install

# Build the application
sam build

# Start the API locally
npm run dev
```

2. **Start the Frontend**
```bash
# Navigate to the frontend directory
cd line-of-credit-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

3. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## 🏗️ Project Structure

```
line-of-credit/
├── src/
│   ├── handlers/         # Lambda function handlers
│   ├── models/          # MongoDB models
│   ├── utils/           # Utility functions
│   └── types/           # TypeScript type definitions
├── line-of-credit-frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── types/      # TypeScript type definitions
│   │   └── App.tsx     # Main application component
│   └── package.json
├── template.yaml        # AWS SAM template
└── package.json
```

## 🔧 Configuration

1. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

2. Update the frontend API URL in `line-of-credit-frontend/src/App.tsx` if needed:
```typescript
const API_BASE_URL = 'http://localhost:3000'
```

## 🎯 Features

- User management with credit limits
- Application processing workflow
- Transaction tracking
- Admin dashboard
- Real-time status updates
- Responsive design

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd line-of-credit-frontend
npm test
```

## 📝 API Endpoints

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PUT /users/:id` - Update user

### Applications
- `GET /applications` - Get all applications
- `GET /applications/:id` - Get application by ID
- `POST /applications` - Create new application
- `POST /applications/disburse` - Disburse funds
- `POST /applications/repay` - Repay funds
- `GET /applications/:id/transactions` - Get application transactions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
