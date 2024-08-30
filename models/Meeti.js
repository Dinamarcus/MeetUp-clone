import { Sequelize } from "sequelize";
import db from "../config/db.js";
import { UUIDV4 } from "sequelize";
import slug from "slug";
import shortid from "shortid";
import Usuarios from "./Usuarios.js";
import Grupos from "./Grupos.js";

const Meeti = db.define("meeti", {
    id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: UUIDV4
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Agrega un título"
            }
        }
    },
    slug: {
        type: Sequelize.STRING
    },
    invitado: Sequelize.STRING,
    cupo: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Agrega una descripción"
            }
        }
    },
    fecha: {
        type: Sequelize.DATEONLY, // Solo fecha sin hora (AÑO MES Y DIA)
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Agrega una fecha para el Meeti"
            }
        }
    },
    hora: {
        type: Sequelize.TIME,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Agrega una hora para el Meeti"
            }
        }
    },
    direccion: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Agregar una dirección"
            }
        }
    },
    ciudad: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Agregar una ciudad"
            }
        }
    },
    estado: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Agregar un estado"
            }
        }
    },
    pais: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Agregar un país"
            }
        }
    },
    ubicacion: {
        type: Sequelize.GEOMETRY("POINT") // Latitud y Longitud
    },
    interesados: {
        type: Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue: []
    },
}, {
    hooks: {
        async beforeCreate(meeti) {
            const url = slug(meeti.titulo).toLowerCase();
            meeti.slug = `${url}-${shortid.generate()}`; // URL única
        }
    }
})

Meeti.belongsTo(Usuarios);
Meeti.belongsTo(Grupos);

export default Meeti;