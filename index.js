import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import expressEjsLayouts from 'express-ejs-layouts';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passport from './config/passport.js';
import router from './routes/index.js';
import db from './config/db.js';
import Grupos from './models/Grupos.js';
import Categorias from './models/Categorias.js';
import Usuarios from './models/Usuarios.js';
import Meeti from './models/Meeti.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db.sync()
    .then(() => {
        console.log("Base de datos conectada");
    }).catch(error => {
        console.log(error);
    });

// Configuracion dotenv
dotenv.config({
    path: path.join(__dirname, '.env')
});

// Recursos estaticos
app.use(express.static(path.join(__dirname, "./public")));

// Habilitar cookieParser
app.use(cookieParser());

// Habilitar sessiones
app.use(session({
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false
}));

// Inicializar passport
app.use(passport.initialize());
app.use(passport.session());

// Habilitar EJS como template engine
app.use(expressEjsLayouts);
app.set("view engine", "ejs");

// Ubicacion vistas
app.set("views", path.join(__dirname, "./views"));

// Habilitar flash messages
app.use(flash());

// MiddleWare (usuario logueado, flash messages, fecha actual)
app.use((req, res, next) => {
    const flashData = req.flash();

    if (Object.keys(flashData).find(key => key === "datosRegistro")) {
        flashData.datosRegistro = flashData.datosRegistro.pop();
    } else if (Object.keys(flashData).find(key => key === "datosGrupo")) {
        flashData.datosGrupo = flashData.datosGrupo.pop();
    } else if (Object.keys(flashData).find(key => key === "datosMeeti")) {
        flashData.datosMeeti = flashData.datosMeeti.pop();
    }

    res.locals.flash = { ...flashData };

    // Asignar el año actual
    const fecha = new Date();
    res.locals.year = fecha.getFullYear();
    next();
});

// Routing
app.use("/", router);

// Puerto
const PORT = process.env.PORT || 3080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});