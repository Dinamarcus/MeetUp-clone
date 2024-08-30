import db from "../config/db.js";
import Categorias from "../models/Categorias.js";

const categorias = [
    "Programacion",
    "Diseño",
    "Negocios y Emprendimiento",
    "Moda y Estilos",
    "Salud y Ejercicio",
    "Fotografia y Viajes",
    "Comida y Bebida",
    "Diseño y Arquitectura",
    "Café",
    "Cine y Peliculas",
    "Libros",
    "Aprendizaje"
];

async function insertarCategorias(categorias) {
    // Verificar si esta establecida la conexion con la base de datos 
    if (db) {
        // Recorrer el arreglo de categorias
        for (let i = 0; i < categorias.length; i++) {
            // Crear un objeto de la clase Categorias
            const categoria = new Categorias({
                nombre: categorias[i]
            });

            // Comprobar que la categoria no exista en la base de datos
            const categoriaExistente = await Categorias.findOne({where: { nombre: categoria.nombre }});

            // Si la categoria ya existe, no se guarda en la base de datos
            if (categoriaExistente) {
                continue;
            }

            // Guardar la categoria en la base de datos
            await categoria.save();
        }

        // Mostrar un mensaje en consola
        console.log("Categorias insertadas correctamente");

        return;
    } 

    console.log("No se pudo establecer la conexion con la base de datos");
}

async function ejecutarComando () {
    if (process.argv[2] === "-i") {
        await insertarCategorias(categorias);
    } 
};

ejecutarComando();