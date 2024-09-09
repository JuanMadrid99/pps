/* CONTROLADORES DE LA INFORMACIÓN */
import dbConnection from '../db/connection.js';
import sql from 'mssql'

// Pide el nombre del dispositivo
const nombre = async (req, res) => {
    try {
        if (req.session.admin != undefined) {
            const dispositivo = req.params.nombre
            req.session.dispositivo = dispositivo            
            req.session.save(err => {
                if (err) {
                    console.error('Error al guardar la sesión:', err);
                }
            });
        } else {
            res.redirect('http://localhost:3000')
        }
    } catch (error) {
        console.error('Error :', error);
    }
}

// Manda los dispositivos con ese nombre
const dispositivos = async (req, res) => {
    if (req.session.admin != undefined) {
        try {
            await dbConnection(); // Establecer la conexión a la base de datos
            const dispositivo = req.session.dispositivo;
            
            const query = 'SELECT dispo.nombre as nombre, dispo.ip as ip, sucu.nombre as sucursal FROM dispositivos dispo INNER JOIN sucursales sucu ON dispo.economico = sucu.economico WHERE dispo.nombre = @dispositivo'; // Preparar la consulta SQL parametrizada para insertar en SQL Server
            const request = new sql.Request(); // Crear un nuevo objeto de solicitud de consulta

            // Añadir parámetros a la consulta
            request.input('dispositivo', sql.VarChar, dispositivo);

            const dispositivos = await request.query(query); // Ejecutar la consulta

            return res.json(dispositivos.recordset)

        } catch (error) { // Manejar errores
            console.error('Error :', error);

        } finally {
            try {
                await sql.close();
            } catch (closeError) {
                console.error('Error al cerrar la conexión:', closeError);
            }
        }
    } else {
        res.redirect('http://localhost:3000')
    }
}

// Consulta para los datos de los dispositivos
const info = async (req, res) => {
    if (req.session.admin != undefined) {
        try {
            const dispositivo = req.params.dispo
            await dbConnection()
            const result = await sql.query(`SELECT sucu.nombre AS sucursal, sucu.economico AS economico, dispo.nombre AS nombre, dispo.descripcion AS descripcion, info.informacion AS informacion FROM sucursales sucu INNER JOIN dispositivos dispo ON sucu.economico = dispo.economico INNER JOIN info info ON dispo.ip = info.ip WHERE dispo.nombre = '${dispositivo}'`)            
            res.json(result.recordset);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send("Error al obtener los datos");
        } finally {
            try {
                await sql.close();
            } catch (closeError) {
                console.error('Error al cerrar la conexión:', closeError);
            }
        }
    } else {
        res.redirect('http://localhost:3000')
    }
}

// Exportar los Controladores
export const methods = {
    info, nombre, dispositivos
}