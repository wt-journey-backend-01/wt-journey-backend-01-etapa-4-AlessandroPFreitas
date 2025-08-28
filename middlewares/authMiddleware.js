const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: 401,
      message: "Token não fornecido ou formato inválido",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Dados do usuário no token
    next();
  } catch (error) {
    return res.status(401).json({
      status: 401,
      message: "Token inválido",
    });
  }
}

module.exports = authMiddleware;