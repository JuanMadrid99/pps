/* MODEL DE AUTENTICACIÓN DE USUARIOS */
import dbConnection from '../db/connection.js'; // Llamar la conexión a la base de datos
import bcrypt from 'bcrypt'; // Encriptar datos
import sql from 'mssql';

/* Comprobar si el usuario existe o no en la base de datos */
async function comprobarUsuario(nickname, psw) {
    try {
        await dbConnection(); // Conectar a la base de datos

        const query = 'SELECT nickname, psw, isAdmin FROM users WHERE nickname = @nickname';
        const request = new sql.Request();
        request.input('nickname', sql.VarChar, nickname);
        const resultado = await request.query(query);

        if (resultado.recordset.length > 0) { // Si el usuario existe (aun no validado)
            const usuario = resultado.recordset[0].nickname;
            const admon = resultado.recordset[0].isAdmin;
            const hashAlmacenado = resultado.recordset[0].psw;

            // Verificar la contraseña
            const valid = await new Promise((resolve, reject) => {
                bcrypt.compare(psw, hashAlmacenado, (error, valid) => {
                    if (error) {
                        reject(error); // Rechaza la Promesa con el error
                    } else {
                        resolve(valid); // Resuelve la Promesa con el resultado de la comparación
                    }
                });
            });

            if (valid) {
                console.log("Las contraseñas coinciden.");
                return { usuario, admon }; // Retorna el usuario y el estado de administrador
            } else {
                console.log("Las contraseñas no coinciden.");
                return { usuario: null, admon: null }; // Retorna nulos si las contraseñas no coinciden
            }
        } else {
            console.log("El usuario no existe");
            return { usuario: null, admon: null }; // No existe el usuario
        }
    } catch (error) {
        console.error('Error al comprobar usuario:', error);
        throw error; // Lanzar el error para que se maneje en el controlador
    } finally {
        try {
            await sql.close(); // Intenta cerrar la conexión a la base de datos
        } catch (closeError) {
            console.error('Error al cerrar la conexión:', closeError);
        }
    }
}


// Exportarmos la funcion
export { comprobarUsuario };