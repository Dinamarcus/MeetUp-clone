import { validationResult } from "express-validator";
import multer from "multer";
import shortid from "shortid";
import Categorias from "../models/Categorias.js";
import Grupos from "../models/Grupos.js";
import path from "path";
import fs from "fs";
import Swal from "sweetalert2";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const formNuevoGrupo = async (req, res) => {
    const categorias = await Categorias.findAll();

    if (res.locals.flash.datosGrupo) {
        const { nombre, sitio, descripcion } = res.locals.flash.datosGrupo;

        return res.render("nuevo-grupo", { 
            nombrePagina: "Crea tu cuenta",
            nombre,
            sitio,
            descripcion,
            categorias
        });
    }

    return res.render("nuevo-grupo", { 
        nombrePagina: "Crea tu cuenta",
        nombre: "",
        sitio: "",
        descripcion: "",
        categorias
    });
};

const crearGrupo = async (req, res) => {
    const erroresExpress = validationResult(req);

    const grupo = req.body;

    grupo.usuarioId = req.user.id; // Mapear el id del usuario 
    grupo.categoriaId = req.body.categoria; // Mapear la categoria del grupo
    grupo.imagen = req.file?.filename; // Mapear la imagen del grupo si existe file, sino invalida toda la expresion

    try {
        // Almacenar en la base de datos
        await Grupos.create(grupo);

        req.flash("exito", "Grupo creado correctamente");
        return res.redirect("/administracion");
    } catch (error) {
        // Extraer mensajes de error de Sequelize
        const mensajesErroresSequelize = error.errors ? error.errors.map(err => err.message) : [];

        // Extraer mensajes de error de Express-Validator
        const mensajesErroresExpress = erroresExpress.array().map(error => error.msg);

        // Unir los errores
        const listaErrores = [...mensajesErroresExpress, ...mensajesErroresSequelize];
                
        const { usuarioId, categoria, categoriaId, ...grupo } = req.body;

        req.flash("error", listaErrores);
        req.flash("datosGrupo", grupo);
        return res.redirect("/nuevo-grupo");
    }
}

const configMulter = {
    limits: { 
        fileSize: 100000,
        files: 1,
        
    },
    storage: multer.diskStorage({
        destination: (req, file, next) => {
            next(null, __dirname + "/../public/uploads/grupos/");
        },
        filename: (req, file, next) => {
            const extension = file.mimetype.split("/")[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter: (req, file, next) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return next(new Error("Formato de archivo no permitido. Solo se permiten imágenes."), false);
        }
        return next(null, true);
    }
};

const upload = multer(configMulter).single("imagen");

const subirImagen = async (req, res, next) => {
    upload(req, res, function(error) {
        if (error) {
            const erroresMulter = [];
            if (error instanceof multer.MulterError) {
                if (error.code === "LIMIT_FILE_SIZE") {
                    erroresMulter.push("El archivo es muy grande. Máximo 100kb.");
                }
                if (error.code === "LIMIT_UNEXPECTED_FILE") {
                    erroresMulter.push(error.message);
                }
            } else {
                erroresMulter.push("Hubo un error al subir la imagen.");
            }
            
            const { usuarioId, categoria, categoriaId, ...grupo } = req.body;

            req.flash("error", erroresMulter);  
            req.flash("datosGrupo", grupo);
            return res.redirect("/nuevo-grupo");
        } else {
            return next();
        }
    });
}

const formEditarGrupo = async (req, res) => {
    const [grupo, categorias] = await Promise.all([
        Grupos.findByPk(req.params.grupoId),
        Categorias.findAll()
    ]);

    res.render("editar-grupo", {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    });
}

// Guardar los cambios en la base de datos
const editarGrupo = async (req, res) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    })

    if (!grupo) {
        req.flash("error", "Operación no válida");
        return res.redirect("/administracion");
    }

    // Leer los valores
    const { nombre, descripcion, categoriaId, sitio } = req.body;

    // Asignar los valores
    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoriaId;
    grupo.sitio = sitio;

    // Guardar en la base de datos
    try {
        await grupo.save();

        req.flash("exito", "Cambios almacenados correctamente");
        return res.redirect("/administracion");
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message);
        
        req.flash("error", erroresSequelize);
        return res.redirect("/editar-grupo/" + req.params.grupoId);
    }
}

const formEditarImagen = async (req, res) => {
    const grupo = await Grupos.findByPk(req.params.grupoId);

    console.log(grupo);
    
    res.render("imagen-grupo", {
        nombrePagina: "Editar Imagen Grupo: " + grupo.nombre,
        grupo
    })
}

const editarImagen = async (req, res) => {
    const grupo = await Grupos.findOne({
        where: {
            id: req.params.grupoId,
            usuarioId: req.user.id
        }
    });

    if (!grupo) {
        req.flash("error", "Operación no válida");
        return res.redirect("/administracion");
    }

    // Si hay imagen anterior y nueva, eliminamos la anterior
    if (req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`;

        // Eliminar archivo con filesystem
        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        });
    }

    // Si hay una imagen nueva, la guardamos
    if (req.file) {
        grupo.imagen = req.file.filename;
    }

    // Guardar en la base de datos
    await grupo.save();
    req.flash("exito", "Cambios almacenados correctamente");
    return res.redirect("/administracion");
}

const eliminarGrupo = async (req, res) => {
    const { grupoId } = req.params;

    console.log(grupoId, "ID DEL GRUPO");

    try {
        const grupo = await Grupos.findOne({
            where: {
                id: grupoId,
                usuarioId: req.user.id
            }
        });

        if (!grupo) {
            req.flash("error", "Operación no válida");
            return res.status(404).json({ success: false, message: "Grupo no encontrado" });
        }

        // Eliminar la imagen asociada si existe
        if (grupo.imagen) {
            const imagenPath = path.join(__dirname, `../public/uploads/grupos/${grupo.imagen}`);
            fs.unlink(imagenPath, (error) => {
                if (error) {
                    console.log(error);
                }
            });
        }

        // Eliminar el grupo de la base de datos
        await grupo.destroy();

        req.flash("exito", "Grupo eliminado correctamente");
        return res.status(200).json({ success: true, message: "Grupo eliminado" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Error al eliminar el grupo" });
    }
};


export { formNuevoGrupo, crearGrupo, subirImagen, formEditarGrupo, editarGrupo, formEditarImagen, editarImagen, eliminarGrupo };