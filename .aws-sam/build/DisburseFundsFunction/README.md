# Line of Credit API

A serverless API for managing line of credit applications using AWS Lambda, MongoDB, and TypeScript.

## Features

- User management (create, read, update)
- Line of credit application management
- Fund disbursement and repayment
- Application status tracking
- Transaction history

## Prerequisites

- Node.js 18.x
- AWS CLI configured with appropriate credentials
- AWS SAM CLI
- MongoDB instance

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Deploy to AWS:
```bash
sam deploy --guided
```

When prompted, provide your MongoDB connection URI.

## API Endpoints

### Users

#### Create User
- **POST** `/users`
- Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "creditLimit": 10000
}
```

#### Get User
- **GET** `/users/{userId}`

#### Update User
- **PUT** `/users/{userId}`
- Body:
```json
{
  "name": "John Doe Updated",
  "email": "john.updated@example.com",
  "creditLimit": 15000
}
```

### Applications

#### Create Application
- **POST** `/applications`
- Body:
```json
{
  "userId": "user_id",
  "requestedAmount": 5000,
  "expressDelivery": true,
  "tip": 100
}
```

#### Disburse Funds
- **POST** `/applications/disburse`
- Body:
```json
{
  "applicationId": "application_id",
  "amount": 5000,
  "expressDelivery": true,
  "tip": 100
}
```

#### Repay Funds
- **POST** `/applications/repay`
- Body:
```json
{
  "applicationId": "application_id",
  "amount": 5000
}
```

#### Reject Application
- **POST** `/applications/reject`
- Body:
```json
{
  "applicationId": "application_id",
  "adminId": "admin_id"
}
```

#### Get User Applications
- **GET** `/users/{userId}/applications`

## Application States

1. **Open**: Application created but funds not disbursed
2. **Cancelled**: User-initiated cancellation before disbursement
3. **Rejected**: Admin has rejected the application
4. **Outstanding**: Funds have been disbursed
5. **Repaid**: User has fully repaid the outstanding amount

## Development

1. Install dependencies:
```bash
npm install
```

2. Start local development:
```bash
npm run dev
```

3. Run tests:
```bash
npm test
```

## Architecture

- AWS Lambda functions for serverless compute
- MongoDB for data storage
- API Gateway for HTTP endpoints
- TypeScript for type safety
- Mongoose for MongoDB ODM

## Security

- Input validation on all endpoints
- MongoDB connection string stored as environment variable
- CORS enabled for API endpoints
- Error handling and logging

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
