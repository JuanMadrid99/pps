/* RUTAS DE PANEL DE SUCURSALES */
import express from 'express';
import { methods as panelSucursalCon } from '../controllers/panelSucursalCon.js'
const panelSucursalRou = express.Router();
// Body parser para analizar datos de formularios
panelSucursalRou.use(express.urlencoded({ extended: true }));

panelSucursalRou.get('/sucursales', panelSucursalCon.getSucursales); // Pedimos los datos de las sucursales

panelSucursalRou.post('/sucursales/agregar', panelSucursalCon.postSucursal); // Agregamos una nueva sucursal

panelSucursalRou.post('/sucursales/actualizar', panelSucursalCon.patchSucursal); // Actualizamos una sucursal

panelSucursalRou.post('/sucursales/eliminar', panelSucursalCon.deleteSucursal) // Eliminamos una sucursal

// Exportar las Rutas
export default panelSucursalRou;