const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const adminToken = process.env.ADMIN_SECRET_TOKEN;

  if (!adminToken) {
    console.error('ADMIN_SECRET_TOKEN not set in environment variables');
    return res.status(500).json({ status: 'error', message: 'Internal Server Error: Auth configuration missing' });
  }

  if (token !== adminToken) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized: Invalid token' });
  }

  next();
};

module.exports = authMiddleware;
