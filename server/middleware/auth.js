
const jwt = require("jsonwebtoken");
const db = require("../db");

const auth = (roles = []) => {
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    const token = req.header("x-auth-token");

    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;

      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ msg: "Access denied: Insufficient role" });
      }
      next();
    } catch (err) {
      res.status(401).json({ msg: "Token is not valid" });
    }
  };
};

module.exports = auth;
