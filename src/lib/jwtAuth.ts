'use strict';

import jwt from 'jsonwebtoken';

// módulo que exporta un middleware
const jwtAuth = (req, res, next) => {
  // recoger el jwtToken de la cabecera, o de la query-string, o del body

  const authHeader = req.get('Authorization') 
  const jwtToken = authHeader.replace('Bearer ', '') || req.query.token || req.body.token;
  
  
  // comprobar que me han dado un token
  if (!jwtToken) {
    const error = {status: 401,
    message: "No token provided"}
    next(error);
    return;
  }

  // comprobar que el token es válido
  jwt.verify(jwtToken, "secreto", (err: any, payload: { _id: any; }) => {
    if (err) {
      const error =  {status: 401,
        message: "Invalid token"}
      next(error);
      return;
    }

    req.apiUserId = payload._id;

    // si es válido, continuar
    next();
  });

}

export default jwtAuth;