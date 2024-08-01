import express from 'express';
import { body } from 'express-validator';
import { home } from '../controllers/homeController.js';
import { formCrearCuenta, crearNuevaCuenta, formIniciarSesion} from '../controllers/usuariosController.js';

const router = express.Router();

router.get("/", home);

router.get("/crear-cuenta", formCrearCuenta);
router.post("/crear-cuenta",
    body("repetir")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Las contraseñas no coinciden"),
    body("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("nombre").not().isEmpty().withMessage("El nombre es obligatorio"),
    crearNuevaCuenta
);

// Iniciar sesion
router.get("/iniciar-sesion", formIniciarSesion);

export default router;