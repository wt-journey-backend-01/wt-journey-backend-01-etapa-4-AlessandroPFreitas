const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  

  const authHeader = req.headers["authorization"]
  const token =  authHeader && authHeader.split(" ")[1]

  if(!token){
   return res.status(401).json({message: "Token necessario"})
  }

  jwt.verify(token, process.env.JWT_SECRET, (err) => {
    if(err){
       return res.status(401).json({message: "Token Inválido"})
    }
    next()
  })

}


module.exports = authMiddleware
