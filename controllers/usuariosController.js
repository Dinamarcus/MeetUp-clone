import Usuarios from "../models/Usuarios.js";
import { validationResult } from "express-validator";
import { enviarEmail } from "../handlers/email.js";

const formCrearCuenta = (req, res) => {   
    if (res.locals.flash.datosRegistro) {
        const { nombre, email } = res.locals.flash.datosRegistro;

        return res.render("crear-cuenta", { 
            nombrePagina: "Crea tu cuenta",
            nombre,
            email
        });
    }

    return res.render("crear-cuenta", {
        nombrePagina: "Crea tu cuenta",
        nombre: "",
        email: ""
    });
}

const crearNuevaCuenta = async (req, res) => {
    const erroresExpress = validationResult(req);
    const usuario = req.body;

    try {
        await Usuarios.create(req.body);

        // Url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        // Enviar email de confirmacion
        await enviarEmail({
            usuario,
            url,
            subject: "Confirma tu cuenta de Meeti",
            archivo: "confirmar-cuenta"
        })

        req.flash("exito", "Hemos enviado un E-mail, confirma tu cuenta.");

        return res.redirect("/iniciar-sesion");
    } catch (e) {
        // Extraer mensajes de error de Sequelize
        const mensajesErroresSequelize = error.errors ? error.errors.map(err => err.message) : [];

        // Extraer mensajes de error de Express-Validator
        const mensajesErroresExpress = erroresExpress.array().map(error => error.msg);

        // Unir los errores
        const listaErrores = [...mensajesErroresExpress, ...mensajesErroresSequelize];

        req.flash("error", listaErrores);
        req.flash("datosRegistro", { nombre: req.body.nombre, email: req.body.email });

        return res.redirect("/crear-cuenta");
    }
}

// Confirma la suscripcion del usuario
const confirmarCuenta = async (req, res, next) => {
    // Verificar que el usuario existe
    const usuario = await Usuarios.findOne({ where: { email: req.params.correo } });

    // si no existe, redireccionamos
    if (!usuario) {
        req.flash("error", "No existe un usuario con ese correo");
        res.redirect("/crear-cuenta");

        return next();
    }
    
    // si existe, actualizamos el campo activo y redireccionamos
    usuario.activo = 1;
    await usuario.save();

    req.flash("exito", "Usuario confirmado correctamente");
    return res.redirect("/iniciar-sesion");
}

const formIniciarSesion = (req, res) => {
    return res.render("iniciar-sesion", {
        nombrePagina: "Iniciar Sesión"
    });
}

export {
    formCrearCuenta,
    crearNuevaCuenta,
    formIniciarSesion,
    confirmarCuenta
}