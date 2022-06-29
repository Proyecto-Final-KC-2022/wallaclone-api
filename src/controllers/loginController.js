'use strict';

import { sign } from 'jsonwebtoken';

import { User } from '../models/User';

class LoginController {
  // login post desde API que retorna JWT
  async postJWT(req, res, next) {
    try {
      const { email, password } = req.body;

      // buscar el usuario en la BD
      const usuario = await User.findOne({ email });

      // si no lo encuentro o no coincide la contraseña --> error
      if (!usuario || !(await usuario.comparePassword(password))) {
        res.json({ error: 'invalid credentials'})
        return;
      }

      // generamos un JWT con su _id
      sign({ _id: usuario._id }, "secreto", {
        expiresIn: '2d'
      }, (err, jwtToken) => {
        if (err) {
          next(err);
          return;
        }
        // devolver al cliente es token generado
        res.json({ token: jwtToken });
      });
    } catch (err) {
      next(err);
    }
  }
}

export default LoginController;