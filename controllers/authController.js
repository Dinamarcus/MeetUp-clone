import passport from "passport";

const autenticarUsuario = passport.authenticate("local", {
    successRedirect: "/administracion",
    failureRedirect: "/iniciar-sesion",
    failureFlash: true,
    badRequestMessage: "Ambos campos son obligatorios"
})

const usuarioAutenticado = async (req, res, next) => {
    // Si el usuario esta autenticado, adelante
    if (req.isAuthenticated()) {
        return next();
    }

    // Si no esta autenticado, redirigir al formulario
    return res.redirect("/iniciar-sesion");
}

export { autenticarUsuario, usuarioAutenticado };