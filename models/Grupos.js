import { Sequelize, UUIDV4 } from "sequelize";
import db from "../config/db.js";
import Categorias from "./Categorias.js";
import Usuarios from "./Usuarios.js";

const Grupos = db.define("grupos", {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: UUIDV4
    },
    nombre: {
        type: Sequelize.TEXT(100),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "El nombre del grupo no puede ir vacío"
            }
        }
    },
    descripcion: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "La descripción no puede ir vacía"
            }
        }
    },
    url: {
        type: Sequelize.TEXT
    },
    imagen: {
        type: Sequelize.TEXT
    }
});

// Crea una relación de tipo 1 a 1 entre Grupos y Categorias
Grupos.belongsTo(Categorias, {
    foreignKey: {
        allowNull: true,
        name: 'categoriaId'
    },
    onDelete: 'CASCADE'
});

// Crea una relación de tipo 1 a 1 entre Grupos y Usuarios
Grupos.belongsTo(Usuarios, {
    foreignKey: {
        allowNull: true,
        name: 'usuarioId'
    },
    onDelete: 'CASCADE'
});

export default Grupos;