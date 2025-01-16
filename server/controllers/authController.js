
// TODO: login for mobile app, return JWT for mobile app
const login = (req, res, db) => {
  console.log('login');
  res.json({ message: 'Login successful' });
};

const register = (req, res, db) => {
  console.log('register');
  res.json({ message: 'Registration successful' });
};

module.exports = { login, register }