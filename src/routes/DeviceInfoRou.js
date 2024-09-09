/* RUTAS DE LA INFORMACIÓN */
import express from 'express'
import { methods as DeviceInfoControllers } from '../controllers/DeviceInfoCon.js';
const DeviceInfoRou = express.Router();

DeviceInfoRou.get('/dispositivo/:nombre', DeviceInfoControllers.nombre); // Pide el numero economico
DeviceInfoRou.get('/dispositivos', DeviceInfoControllers.dispositivos); // Manda los dispositivos con ese nombre
DeviceInfoRou.get('/device/:dispo', DeviceInfoControllers.info) // Consulta para los datos de los dispositivos

// Exportar las Rutas
export default DeviceInfoRou;