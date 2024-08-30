import Grupos from "../models/Grupos.js";

const panelAdministracion = async (req, res) => {
    const grupos = await Grupos.findAll({
        where: {
            usuarioId: req.user.id
        }
    })

    res.render("administracion", {
        nombrePagina: "Panel de Administración",
        grupos
    })
}

export { panelAdministracion };