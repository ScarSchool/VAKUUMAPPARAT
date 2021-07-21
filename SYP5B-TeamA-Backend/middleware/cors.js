const cors = require('config').get('security.cors');

module.exports.enable = (req, res, next) => {
  if (cors.origin.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, POST, DELETE');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }

  if (req.method == 'OPTIONS') res.status(200).send();
  else next();
};
