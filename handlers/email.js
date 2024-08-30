import nodemailer from "nodemailer";
import fs from "fs"; // File System, para leer los archivos de la vista de los emails (ejs) y compilarlos
import util from "util";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import config from "../config/email.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    auth: {
        user: config.username,
        pass: config.password
    }
})

const enviarEmail = async (opciones) => {
    console.log(opciones);

    // Leer el archivo para el mail
    const archivo = __dirname + `/../views/emails/${opciones.archivo}.ejs`;

    // Compilarlo
    const compilado = ejs.compile(fs.readFileSync(archivo, "utf8"));

    // Crear el html
    const html = compilado({
        url: opciones.url
    }) // esta funcion se ejecuta con el objeto que le pasamos como parametro y devuelve el html. En este caso, el objeto contiene la url

    // Configurar las opciones del mail
    const opcionesEmail = {
        from: "Meeti <noreply@meeti.com", 
        to: opciones.usuario.email,
        subject: opciones.subject,
        html
    };

    // Enviar el mail
    const sendEmail = util.promisify(transport.sendMail, transport); // Promisificar la funcion sendMail de nodemailer. Esto nos permite usar async/await en vez de .then() y .catch() para manejar las promesas en el envio de emails. 

    return sendEmail.call(transport,  opcionesEmail); // Mandamos a llamar a la funcion sendEmail con el objeto opcionesEmail como parametro y transport como contexto de la funcion.
}

export {
    enviarEmail
};