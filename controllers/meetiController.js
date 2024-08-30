import { validationResult } from "express-validator";
import Grupos from "../models/Grupos.js";
import Meeti from "../models/Meeti.js";

// Muestra el formulario para nuevos meeti
const formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({
        where: {
            usuarioId: req.user.id
        }
    })


    if (res.locals.flash.datosMeeti) {
        const { titulo, grupoId, invitado, fecha, hora, cupo, descripcion, direccion, ciudad, estado, pais, lat, lng } = res.locals.flash.datosMeeti;

        return res.render("nuevo-meeti", {
            nombrePagina: "Crear un nuevo meeti",
            titulo,  
            grupoId,
            invitado,
            fecha,
            hora,
            cupo,
            descripcion,
            direccion,
            ciudad,
            estado,
            pais,
            lat,
            lng,
            grupos
        });
    }

    return res.render("nuevo-meeti", {
        nombrePagina: "Crear un nuevo meeti",
        titulo : "",  
        grupoId : "",
        invitado : "",
        fecha : "",
        hora : "",
        cupo : "",
        descripcion : "",
        direccion : "",
        ciudad : "",
        estado : "",
        pais : "",
        lat : "",
        lng : "",
        grupos
    })
}

const crearMeeti = async (req, res) => {
    // Obtener los datos
    const meeti = req.body;

    // Asignar el usuario
    meeti.usuarioId = req.user.id;

    // Almacenar la ubicacion con un point
    const point = {
        type: "Point", 
        coordinates: [
            parseFloat(req.body.lat),
            parseFloat(req.body.lng)
        ]
    }
    meeti.ubicacion = point;

    // Cupo opcional
    if (req.body.cupo === "") {
        meeti.cupo = 0;
    }

    // Almacenar en la base de datos
    try {
        await Meeti.create(meeti);
        req.flash("exito", "Meeti creado correctamente");
        return res.redirect("/administracion");
    } catch (error) {
        // Extraer mensajes de error de Sequelize
        const mensajesErroresSequelize = error.errors ? error.errors.map(err => err.message) : [];

        // Extraer datos del meeti
        const {...grupo } = req.body;

        req.flash("error", mensajesErroresSequelize);
        req.flash("datosMeeti", grupo);
            
        return res.redirect("/nuevo-meeti");
    }
    
}

export {
    formNuevoMeeti,
    crearMeeti
};