/* CONTROLADORES DE AUTENTICACIÓN DE USUARIOS */
import { comprobarUsuario } from '../models/authMod.js'; // Importamos el model de autenticación de usuarios

// Recogemos los datos que se ingresaron en el panel de login
const login = async (req, res) => {
    try {
        const { nickname, psw } = req.body; // Pedimos los datos al cuerpo de la página

        // Llamar a la función asincrónica comprobarUsuario y esperar su resultado
        const { usuario, admon } = await comprobarUsuario(nickname, psw);

        if (usuario) {
            // Usuario válido
            console.log("Usuario autenticado");

            // Guardamos los datos en el almacenamiento de sesión
            req.session.admin = admon;
            req.session.user = nickname;

            // Guarda si es administrador o no
            req.session.save(err => {
                if (err) {
                    console.error('Error al guardar la sesión:', err);
                    res.status(500).redirect('http://localhost:3000/');
                    return;
                }

                if (req.session.admin) {
                    res.redirect('http://localhost:3000/pansucursal');
                } else {
                    res.redirect('http://localhost:3000/sucursales');
                }
            });
        } else {
            // Usuario no encontrado o credenciales incorrectas
            console.log("El usuario no existe o las credenciales son incorrectas");
            res.redirect('http://localhost:3000/');
        }
    } catch (error) {
        console.error('Error en login:', error);
        res.redirect('http://localhost:3000/');
    }
};

// Destruimos la sesión al salir de cuenta
const logout = async (req, res) => {
    req.session.destroy()
    res.redirect('http://localhost:3000/')
}

// Definimos el tipo de usuario si se ha definido o no entre administrador y visita
const user = async (req, res) => {
    const user = {
        username: req.session.user,
        isAdmin: req.session.admin,
        id: 0
    };
    if (req.session.admin == undefined) {
        return res.json(user);
    } else {
        if (req.session.admin == true) {
            user.id = 1
            return res.json(user);
        } else {
            user.id = 2
            return res.json(user);
        }
    };
}

// Exportar los Controladores
export const methods = {
    login, logout, user
}