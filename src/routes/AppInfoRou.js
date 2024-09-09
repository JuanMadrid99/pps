/* RUTAS DE LA INFORMACIÓN */
import express from 'express'
import { methods as infoControllers } from '../controllers/AppInfoCon.js';
const infoRou = express.Router();

infoRou.get('/numero/:economico', infoControllers.economico); // Pide el numero economico
infoRou.get('/aplicaciones', infoControllers.aplicaciones); // Manda las aplicaciones vinculadas a ese numero economico
infoRou.get('/aplicacion/:section', infoControllers.info) // Consulta para los datos de las aplicaciones
infoRou.get('/dispositivos', infoControllers.dispositivos) // Manda toda la informacion de los dispositivos que pertenezcan al economico 

// Exportar las Rutas
export default infoRou;