import passport from 'passport';
import LocalStrategy from 'passport-local';
import Usuarios from '../models/Usuarios.js';

passport.use(new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    },
    async(email, password, next) => {
        // Codigo que se ejecuta al llenar el form
        const usuario = await Usuarios.findOne({ where: { email, activo: 1 } });

        // Revisar si el usuario existe
        if (!usuario) {
            return next(null, false, {
                message: "Ese usuario no existe o no has confirmado tu cuenta"
            });
        }

        // El usuario existe, pero el password es incorrecto
        if (!usuario.validarPassword(password)) return next(null, false, {
            message: "Password Incorrecto"
        });

        // Todo bien
        return next(null, usuario); // Lo que hace esta linea es pasar al siguiente middle ware que va a ser panelAdministracion ya que en caso de ser correcto se redirecciona a /administracion, por lo que la informacion del usuario se pasa por medio del req.user y se puede acceder a ella en el panel de administracion
    }
))

// Serializar el usuario y pasar la informacion a la sesion
passport.serializeUser((usuario, cb) => {
        cb(null, usuario);
    }
);

// Deserializar el usuario por mas que haya error en la sesion 
passport.deserializeUser((usuario, cb) => {
    cb(null, usuario);
}
);

export default passport;