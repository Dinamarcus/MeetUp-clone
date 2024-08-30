import express from 'express';
import { body } from 'express-validator';
import { home } from '../controllers/homeController.js';
import { formCrearCuenta, crearNuevaCuenta, formIniciarSesion, confirmarCuenta} from '../controllers/usuariosController.js';
import { autenticarUsuario, usuarioAutenticado } from '../controllers/authController.js';
import { panelAdministracion } from '../controllers/adminController.js';
import { formNuevoGrupo, crearGrupo, subirImagen, formEditarGrupo, editarGrupo, formEditarImagen, editarImagen, eliminarGrupo } from '../controllers/gruposController.js';
import { formNuevoMeeti, crearMeeti } from '../controllers/meetiController.js';

const router = express.Router();

router.get("/", home);

// Crear y confirmar cuentas
router.get("/crear-cuenta", formCrearCuenta);
router.post("/crear-cuenta",
    body("repetir")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Las contraseñas no coinciden"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("nombre").not().isEmpty().withMessage("El nombre es obligatorio"),
    crearNuevaCuenta
);
router.get("/confirmar-cuenta/:correo", confirmarCuenta);

// Iniciar sesion
router.get("/iniciar-sesion", formIniciarSesion);
router.post("/iniciar-sesion", autenticarUsuario);

// Administracion
router.get("/administracion", usuarioAutenticado, panelAdministracion);

// Nuevos grupos
router.get("/nuevo-grupo", usuarioAutenticado, formNuevoGrupo);
router.post("/nuevo-grupo", 
    body("categoria").not().isEmpty().withMessage("Debe seleccionar la categoria"),
    subirImagen,
    crearGrupo)
;

// Editar Grupos
router.get("/editar-grupo/:grupoId", usuarioAutenticado, formEditarGrupo);
router.post("/editar-grupo/:grupoId", usuarioAutenticado, editarGrupo);

// Editar imagen del grupo
router.get("/imagen-grupo/:grupoId", usuarioAutenticado, formEditarImagen);
router.post("/imagen-grupo/:grupoId", usuarioAutenticado, subirImagen, editarImagen);

// Eliminar Grupos
router.post("/eliminar-grupo/:grupoId", usuarioAutenticado, eliminarGrupo);

// Nuevos meeti
router.get("/nuevo-meeti", usuarioAutenticado, formNuevoMeeti);
router.post("/nuevo-meeti", 
    usuarioAutenticado,
    crearMeeti
);

export default router;