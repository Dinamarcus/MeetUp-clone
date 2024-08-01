import { Sequelize } from "sequelize";

const db = new Sequelize("meeti", "postgres", "cufa2024", {
    host: "localhost",
    dialect: "postgres",
    port: 5432,
    pool: {
        max: 5, 
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false // Deshabilita los logs
})

export default db;