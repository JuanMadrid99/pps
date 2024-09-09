/* CONTROLADORES DE LA INFORMACIÓN DE LAS APLICACIONES */
import dbConnection from '../db/connection.js';
import sql from 'mssql'

// Pedimos los datos de las aplicaciones
const getAplicaciones = async (req, res) => {
    if (req.session.hasOwnProperty('admin')) { // Si se ha validado el usuario
        try {
            await dbConnection();
            const result = await sql.query('SELECT sucu.canal AS canal, sucu.nombre AS nombre, sucu.economico AS economico, dispo.ip AS ip, dispo.nombre AS dispositivo FROM sucursales sucu INNER JOIN dispositivos dispo ON sucu.economico = dispo.economico');                        
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
export default getAplicaciones;