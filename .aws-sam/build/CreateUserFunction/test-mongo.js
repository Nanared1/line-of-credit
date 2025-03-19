const mongoose = require('mongoose');

const uri = 'mongodb://localhost:27017/line-of-credit';

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  retryWrites: true,
  retryReads: true,
  directConnection: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  process.exit(0);
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
}); 