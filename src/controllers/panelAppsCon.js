/* CONTROLADORES DE PANEL DE APLICACIONES */
import dbConnection from '../db/connection.js';
import sql from 'mssql';
import { SucursalExiste, IpOcupada, comprobarID } from '../models/AppInfoMod.js'

// Pedimos los datos de las aplicaciones y a que sucursal pertenece
const getApps = async (req, res) => {
    if (req.session.admin) {
        try {
            await dbConnection();
            const result = await sql.query('SELECT dispo.id AS id, sucu.canal AS canal, sucu.nombre AS nombre, sucu.economico AS economico, dispo.ip AS ip, dispo.nombre AS dispositivo FROM sucursales sucu INNER JOIN dispositivos dispo ON sucu.economico = dispo.economico');            
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
};

// Agregamos una nueva sucursal
const postApp = async (req, res) => {
    if (req.session.admin) {
        try {
            const { economico, ip, nombre } = req.body;
            const descripcion = req.body.descripcion || '';

            const isEconomicoValid = await SucursalExiste(economico)
            if (!isEconomicoValid) {
                res.status(404).json({ message: 'No se encontro la sucursal (economico no valido)' }); // Responder con falla        
                return;
            }

            const EsIpOcupada = await IpOcupada(ip);
            if (EsIpOcupada) {
                res.status(406).json({ message: 'La IP definida ya se encuentra en la base de datos' })
                return;
            }

            const query = 'INSERT INTO dispositivos (ip, economico, nombre, descripcion) VALUES (@ip, @economico, @nombre, @descripcion)'; // Preparar la consulta SQL parametrizada para insertar en SQL Server
            const request = new sql.Request(); // Crear un nuevo objeto de solicitud de consulta
            // Añadir parámetros a la consulta
            request.input('ip', sql.VarChar, ip);
            request.input('economico', sql.VarChar, economico);
            request.input('nombre', sql.VarChar, nombre);
            request.input('descripcion', sql.VarChar, descripcion);
            await request.query(query); // Ejecutar la consulta
            res.status(200).json({ message: 'Dispositivo agregado exitosamente' }); // Responder con éxito  
        } catch (error) { // Manejar errores
            console.error('Error agregando nuevos datos:', error);
            res.status(500).json({ message: 'Error agregando nuevos datos' }); // Responder con error
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
};

// Actualizamos un dispositivo
const patchApp = async (req, res) => {
    if (req.session.admin) {
        try {
            const { economico, ip, nombre, descripcion, id } = req.body;
            const updates = [];

            const IdExiste = await comprobarID(id);
            if (!IdExiste) {
                res.status(404).json({ message: 'No se encontro el ID' }); // Responder con falla       
                return;
            }

            if (economico.length !== 0) {
                const LaSucursalExiste = await SucursalExiste(economico);
                if (LaSucursalExiste) {
                    updates.push('economico = @economico');
                } else {
                    res.status(404).json({ message: 'No se encontro la sucursal (economico no valido)' })
                    return;
                }
            }
            if (ip.length !== 0) {
                const EsIpOcupada = await IpOcupada(ip);
                if (!EsIpOcupada) {
                    updates.push('ip = @ip');
                } else {
                    res.status(404).json({ message: 'La IP definida ya se encuentra en la base de datos' })
                    return;
                }
            }
            if (nombre.length !== 0) {
                updates.push('nombre = @nombre');
            }
            if (descripcion.length !== 0) {
                updates.push('descripcion = @descripcion');
            }
            if (updates.length === 0) {
                res.status(400).json({ message: 'No hay datos para actualizar' });
                return;
            }
            const query = `UPDATE dispositivos SET ${updates.join(', ')} WHERE id = @id`;

            await dbConnection();
            const request = new sql.Request(); // Crear un nuevo objeto de solicitud de consulta

            // Añadir parámetros a la consulta
            request.input('economico', sql.VarChar, economico);
            request.input('ip', sql.VarChar, ip);
            request.input('nombre', sql.VarChar, nombre);
            request.input('descripcion', sql.VarChar, descripcion); request.input('id', sql.Numeric, id);
            await request.query(query);
            res.status(200).json({ message: 'Dispositivo actualizado exitosamente' });
        } catch (error) {
            console.error('Error al actualizar los datos', error);
            res.status(500).json({ message: 'Error actualizando datos' }); // Responder con error
        } finally {
            try {
                await sql.close();
            } catch (errorError) {
                console.error('Error al cerrar la conexión', closeError);
            }
        }
    }
    else {
        res.redirect('http://localhost:3000')
    }
}

// Eliminamos un dispositivo
const deleteApp = async (req, res) => {
    if (req.session.admin) {
        let transaction
        try {
            const { id } = req.body;
            const IdExiste = await comprobarID(id)
            if (!IdExiste) {
                res.status(404).json({ message: 'No se encontro el ID' }); // Responder con falla        
                return;
            }

            // Establecer la conexión a la base de datos
            await dbConnection();

            // Iniciar una transacción
            transaction = new sql.Transaction();
            await transaction.begin();

            const request = new sql.Request(transaction); // Crear un nuevo objeto de solicitud de consulta con transacción

            // Deshabilitar la restricción de clave foránea
            await request.query('ALTER TABLE info NOCHECK CONSTRAINT FK_info_dispositivos');

            // Eliminar datos
            const query = 'DELETE FROM dispositivos WHERE id = @id'; // Preparar la consulta SQL parametrizada para insertar en SQL Server
            // Añadir parámetros a la consulta
            request.input('id', sql.Numeric, id);
            await request.query(query); // Ejecutar la consulta

            // Habilitar la restricción de clave foránea
            await request.query('ALTER TABLE info CHECK CONSTRAINT FK_info_dispositivos');

            // Confirmar la transacción
            await transaction.commit();



            res.status(200).json({ message: 'Dispositivo eliminado exitosamente' }); // Responder con éxito  
        } catch (error) {
            res.status(500).json({ message: 'Error eliminando datos' }); // Responder con error
            console.error('Error al eliminar los datos', error);
        } finally {
            try {
                await sql.close();
            } catch (errorError) {
                console.error('Error al cerrar la conexión', closeError);
            }
        }
    } else {
        res.redirect('http://localhost:3000')
    }
}

// Exportar los Controladores
export const methods = {
    getApps, postApp, patchApp, deleteApp
}