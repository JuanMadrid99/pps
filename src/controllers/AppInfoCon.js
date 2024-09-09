/* CONTROLADORES DE LA INFORMACIÓN */
import dbConnection from '../db/connection.js';
import sql from 'mssql'

// Pide el numero economico
const economico = async (req, res) => {
    try {
        if (req.session.admin != undefined) {
            const numero = req.params.economico;
            req.session.numero = numero; // Guardamos el economico
            req.session.save(err => {
                if (err) {
                    console.error('Error al guardar la sesión:', err);
                }
            });
        } else {
            res.redirect('http://localhost:3000');
        }
    } catch (error) {
        console.error('Error :', error);
    }
}

// Manda las aplicaciones vinculadas a ese numero economico
const aplicaciones = async (req, res) => {
    if (req.session.admin != undefined) {
        try {
            await dbConnection(); // Establecer la conexión a la base de datos
            const economico = req.session.numero;

            const query = 'SELECT nombre,ip FROM dispositivos WHERE economico = @economico'; // Preparar la consulta SQL parametrizada para insertar en SQL Server
            const request = new sql.Request(); // Crear un nuevo objeto de solicitud de consulta

            // Añadir parámetros a la consulta
            request.input('economico', sql.VarChar, economico);

            const aplicaciones = await request.query(query); // Ejecutar la consulta

            return res.json(aplicaciones.recordset)

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

// Consulta para los datos de las aplicaciones
const info = async (req, res) => {
    if (req.session.admin != undefined) {
        try {
            const ip = req.params.section
            await dbConnection()
            const result = await sql.query(`SELECT sucu.nombre AS sucursal, sucu.economico AS economico, dispo.nombre AS nombre, dispo.descripcion AS descripcion, info.informacion AS informacion, info.evealtos,info.evemedios, info.evebajos FROM sucursales sucu INNER JOIN dispositivos dispo ON sucu.economico = dispo.economico INNER JOIN info info ON dispo.ip = info.ip WHERE dispo.ip = '${ip}'`);
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

// Manda toda la informacion de los dispositivos que pertenezcan al economico 
const dispositivos = async (req, res) => {
    if (req.session.admin != undefined) {
        try {
            await dbConnection()
            const economico = req.session.numero;
            const result = await sql.query(`SELECT sucu.nombre AS sucursal, sucu.economico AS economico, dispo.nombre AS nombre, dispo.descripcion AS descripcion, info.informacion AS informacion, info.evealtos, info.evemedios, info.evebajos FROM sucursales sucu INNER JOIN dispositivos dispo ON sucu.economico = dispo.economico INNER JOIN info info ON dispo.ip = info.ip WHERE sucu.economico ='${economico}'`); // Preparar la consulta SQL parametrizada para insertar en SQL Server
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
    info, economico, aplicaciones, dispositivos
}