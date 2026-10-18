const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization; // "Bearer <token>"
  const token = header && header.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Token missing, please login" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // aage ke routes isse user pehchanenge
    next();                  // check pass, aage badho
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};