/* CONTROLADORES DE PANEL DE USUARIOS */
import dbConnection from '../db/connection.js';
import { IDdelAdmin, NicknameOcupado, comprobarID } from '../models/usersMod.js';
import sql from 'mssql'
import bcrypt from 'bcrypt'

// Pedimos los datos de los usuarios
const getUsers = async (req, res) => {
    if (req.session.admin) {
        try {
            await dbConnection();
            let result = await sql.query('SELECT id,nickname,psw,isAdmin as admin FROM users');
            res.json(result.recordset);

        } catch (error) {
            console.error('Error:', error);
            res.status(500).send("Error al obtener los datos");
        }
    } else {
        res.redirect('http://localhost:3000')
    }
};

// Agregamos un nuevo usuario
const postUser = async (req, res) => {
    if (req.session.admin) {
        try {
            await dbConnection(); // Establecer la conexión a la base de datos
            let { nickname, psw, isAdmin } = req.body;

            // Verificar nickname valido
            const EsNicknameOcupado = await NicknameOcupado(nickname);
            if (EsNicknameOcupado) {
                res.status(404).json({ message: 'El Nickname definido ya existe en la base de datos. ' });
                return;
            }
            psw = psw.trim();
            psw = await bcrypt.hash(psw, 12); // Hash de la contraseña

            const query = 'INSERT INTO users (nickname, psw, isAdmin) VALUES (@nickname, @psw, @isAdmin)'; // Preparar la consulta SQL parametrizada
            const request = new sql.Request(); // Crear un nuevo objeto de solicitud de consulta

            // Añadir parámetros a la consulta
            request.input('nickname', sql.VarChar, nickname);
            request.input('psw', sql.VarChar, psw);
            request.input('isAdmin', sql.Bit, isAdmin)

            await request.query(query); // Ejecutar la consulta

            res.status(200).json({ message: 'Usuario agregado exitosamente' }); // Responder con éxito

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
        res.status(403).json({ message: 'No autorizado' });
    }
};

// Actualizamos un usuario
const patchUser = async (req, res) => {
    if (req.session.admin) {
        try {
            let { nickname, psw, id, isAdmin } = req.body;

            psw = psw.trim();
            const isAdminValue = isAdmin === 'yes' ? 1 : 0;
            const Admin = await IDdelAdmin(id)
            const updates = [];
            
            const IdExiste = await comprobarID(id);
            if (!IdExiste) {
                res.status(404).json({ message: 'No se encontró el ID' });
                return;
            }
            if (nickname.length !== 0) {
                const EsNicknameOcupado = await NicknameOcupado(nickname);
                if (EsNicknameOcupado) {
                    res.status(404).json({ message: 'El Nickname definido ya existe en la base de datos. ' });
                    return;
                } else {
                    updates.push('nickname = @nickname');
                }
            }
            if (psw.length !== 0) {
                psw = await bcrypt.hash(psw, 12);
                updates.push('psw = @psw');
            }
            if (isAdmin.length !== 0) {
                if (Admin) {
                    res.status(403).json({ message: 'No se puede modificar super administrador' })
                    return;
                }
                updates.push('isAdmin = @isAdmin')
            }
            if (updates.length === 0) {
                res.status(400).json({ message: 'No hay datos para actualizar' });
                return;
            }

            const query = `UPDATE users SET ${updates.join(', ')} WHERE id = @id`;

            await dbConnection();
            const request = new sql.Request();

            // Añadir parámetros a la consulta
            request.input('nickname', sql.VarChar, nickname);
            request.input('psw', sql.VarChar, psw);
            request.input('id', sql.Numeric, id);
            request.input('isAdmin', sql.Bit, isAdminValue)

            await request.query(query);
            res.status(200).json({ message: 'Usuario actualizado exitosamente' });

        } catch (error) {
            console.error('Error actualizando datos:', error);
            res.status(500).json({ message: 'Error actualizando datos' });
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
};

// Eliminamos un usuario
const deleteUser = async (req, res) => {
    if (req.session.admin) {
        try {
            await dbConnection(); // Establecer la conexión a la base de datos
            const { id } = req.body;

            const IdExiste = await comprobarID(id)
            if (!IdExiste) {
                res.status(404).json({ message: 'No se encontro el ID' }); // Responder con falla        
                return;
            }

            const Admin = await IDdelAdmin(id)
            if (Admin) {
                res.status(403).json({ message: 'No se puede eliminar al super administrador' })
                return;
            }

            const query = 'DELETE FROM users WHERE id = @id'; // Preparar la consulta SQL parametrizada para insertar en SQL Server
            const request = new sql.Request(); // Crear un nuevo objeto de solicitud de consulta

            // Añadir parámetros a la consulta
            request.input('id', sql.Numeric, id);

            await request.query(query); // Ejecutar la consulta

            res.status(200).json({ message: 'Usuario eliminado exitosamente' }); // Responder con éxito

        } catch (error) { // Manejar errores
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
        res.redirect('http://localhost:3000')
    }
}

// Exportar los Controladores
export const methods = {
    postUser,
    getUsers,
    patchUser,
    deleteUser
}