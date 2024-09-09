/* RUTAS DE PANEL DE SUCURSALES */
import express from 'express';
import { methods as panelAppsCon } from '../controllers/panelAppsCon.js'
const panelAppsRou = express.Router();
// Body parser para analizar datos de formularios
panelAppsRou.use(express.urlencoded({ extended: true }));

panelAppsRou.get('/dispositivos', panelAppsCon.getApps); // Pedimos los datos de los dispositivos

panelAppsRou.post('/dispositivos/agregar', panelAppsCon.postApp); // Agregamos un nuevo dispositivo

panelAppsRou.post('/dispositivos/actualizar', panelAppsCon.patchApp); // Actualizamos un dispositivo

panelAppsRou.post('/dispositivos/eliminar', panelAppsCon.deleteApp) // Eliminamos un dispositivo

// Exportar las Rutas
export default panelAppsRou;