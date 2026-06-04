module.exports = function(req, res, next) {
    const originalJson = res.json;
    
    res.json = function(data) {
      // If token was extended, add it to the response
      if (req.shouldExtendToken) {
        if (typeof data === 'object') {
          data.token = req.token;
        }
        
        // Set the new token in response header
        res.set('X-New-Token', req.token);
      }
      
      originalJson.call(res, data);
    };
    
    next();
  };