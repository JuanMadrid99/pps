/* CONTROLADORES DE PANEL DE SUCURSALES */
import dbConnection from '../db/connection.js';
import sql from 'mssql';
import { EconomicoOcupado, comprobarID, Neconomico } from '../models/sucursalMod.js';

// Pedimos los datos de las sucursales
const getSucursales = async (req, res) => {
    if (req.session.admin) {
        try {
            await dbConnection();
            const result = await sql.query('SELECT * FROM sucursales');
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
const postSucursal = async (req, res) => {
    if (req.session.admin) {
        try {
            await dbConnection(); // Establecer la conexión a la base de datos
            const { economico, canal, nombre } = req.body;

            const EsEconomicoOcupado = await EconomicoOcupado(economico);
            if (EsEconomicoOcupado) {
                res.status(406).json({ message: 'El Economico definido ya existe en la base de datos' })
                return;
            }

            const query = 'INSERT INTO sucursales (economico, canal, nombre) VALUES (@economico, @canal, @nombre)'; // Preparar la consulta SQL parametrizada para insertar en SQL Server
            const request = new sql.Request(); // Crear un nuevo objeto de solicitud de consulta

            // Añadir parámetros a la consulta
            request.input('economico', sql.VarChar, economico);
            request.input('canal', sql.VarChar, canal);
            request.input('nombre', sql.VarChar, nombre);

            await request.query(query); // Ejecutar la consulta

            res.status(200).json({ message: 'Sucursal agregado exitosamente' }); // Responder con éxito
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

// Actualizamos una sucursal
const patchSucursal = async (req, res) => {
    if (req.session.admin) {
        let transaction;
        try {
            await dbConnection(); // Establecer la conexión a la base de datos
            const { economico, canal, nombre, id } = req.body;            
            const IdExiste = await comprobarID(id)
            if (!IdExiste) {
                res.status(404).json({ message: 'No se encontro el ID' }); // Responder con falla  
                return;
            }

            const EsEconomicoOcupado = await EconomicoOcupado(economico)
            if (EsEconomicoOcupado) {
                res.status(406).json({ message: 'El Economico definido ya existe en la base de datos' })
                return;
            }

            const updates = [];
            if (economico.length !== 0) {
                updates.push('economico = @economico');
            }
            if (canal.length !== 0) {
                updates.push('canal = @canal');
            }
            if (nombre.length !== 0) {
                updates.push('nombre = @nombre');
            }
            if (updates.length === 0) {
                throw new Error('No hay datos para actualizar');
            }

            const numeroE = await Neconomico(id);

            // Iniciar una transacción
            transaction = new sql.Transaction();
            await transaction.begin();

            const request = new sql.Request(transaction);

            const query = `UPDATE sucursales SET ${updates.join(', ')} WHERE economico = '${numeroE}'`;
            request.input('economico', sql.VarChar, economico);
            request.input('canal', sql.VarChar, canal);
            request.input('nombre', sql.VarChar, nombre);
            

            // Deshabilitar la restricción de clave foránea
            await request.query('ALTER TABLE dispositivos NOCHECK CONSTRAINT fk_economico');

            await request.query(query); // Ejecutar la consulta
            if (economico.length !== 0) {
                await request.query(`UPDATE dispositivos SET economico = '${economico}' FROM dispositivos WHERE economico = '${numeroE}'`);
            }

            // Habilitar la restricción de clave foránea
            await request.query('ALTER TABLE dispositivos CHECK CONSTRAINT fk_economico');

            // Confirmar la transacción
            await transaction.commit();

            res.status(200).json({ message: 'Sucursal actualizado exitosamente' }); // Responder con éxito    
        } catch (error) {
            if (transaction) {
                try {
                    // Revertir la transacción en caso de error
                    await transaction.rollback();
                } catch (rollbackError) {
                    console.error('Error al revertir la transacción:', rollbackError);
                }
            }
            console.error('Error actualizando datos:', error);
            res.status(500).json({ message: 'Error actualizando datos' }); // Responder con error
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

// Eliminamos una sucursal
const deleteSucursal = async (req, res) => {
    if (req.session.admin) {
        let transaction;
        try {
            // Establecer la conexión a la base de datos
            await dbConnection();

            const { id } = req.body;

            const IdExiste = await comprobarID(id);
            if (!IdExiste) {
                res.status(404).json({ message: 'No se encontró el ID' }); // Responder con falla  
                return;
            }

            const numeroE = await Neconomico(id);

            // Iniciar una transacción
            transaction = new sql.Transaction();
            await transaction.begin();

            const request = new sql.Request(transaction); // Crear un nuevo objeto de solicitud de consulta con transacción

            // Deshabilitar la restricción de clave foránea
            await request.query('ALTER TABLE dispositivos NOCHECK CONSTRAINT fk_economico');

            // Eliminar datos
            // await request.input('id', sql.Numeric, id).query('DELETE FROM sucursales WHERE id = @id');
            await request.query(`DELETE FROM sucursales WHERE economico = '${numeroE}'`);
            await request.query(`UPDATE dispositivos SET economico = '00000' FROM dispositivos WHERE economico = ${numeroE}`);
            // await request.input('id', sql.Numeric, id).query('DELETE FROM sucursales WHERE id = @id');

            // Habilitar la restricción de clave foránea
            await request.query('ALTER TABLE dispositivos CHECK CONSTRAINT fk_economico');

            // Confirmar la transacción
            await transaction.commit();

            res.status(200).json({ message: 'Sucursal eliminada exitosamente' }); // Responder con éxito

        } catch (error) { // Manejar errores
            if (transaction) {
                try {
                    // Revertir la transacción en caso de error
                    await transaction.rollback();
                } catch (rollbackError) {
                    console.error('Error al revertir la transacción:', rollbackError);
                }
            }
            res.status(500).json({ message: 'Error eliminando datos' }); // Responder con error
            console.error('Error eliminando datos:', error);

        } finally {
            try {
                await sql.close();
            } catch (closeError) {
                console.error('Error al cerrar la conexión:', closeError);
            }
        }
    } else {
        res.redirect('http://localhost:3000');
    }
}

// Exportar los Controladores
export const methods = {
    getSucursales,
    postSucursal,
    patchSucursal,
    deleteSucursal
}