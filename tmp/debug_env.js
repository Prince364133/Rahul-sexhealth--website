const dotenv = require('dotenv').config({ path: './backend/.env' });
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('MONGO_URI start:', process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 10) : 'N/A');
