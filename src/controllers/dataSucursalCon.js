/* CONTROLADORES DE LA INFORMACIÓN DE LAS SUCURSALES */
import dbConnection from '../db/connection.js';
import sql from 'mssql'

// Pedimos los datos de las sucursales
const getSucursales = async (req, res) => {
    if (req.session.hasOwnProperty('admin')) { // Si se ha validado el usuario
        try {
            await dbConnection();
            const result = await sql.query('SELECT economico, canal, nombre FROM sucursales');
            res.json(result.recordset);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send("Error al obtener los datos");
        }
    } else {
        res.redirect('http://localhost:3000')
    }
};

// Exportar los Controladores
export default getSucursales;