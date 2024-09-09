/* RUTAS DE LA INFORMACIÓN DE LAS SUCURSALES */
import express from 'express';
import getSucursales from '../controllers/dataSucursalCon.js'
const dataSucursalRou = express.Router();

dataSucursalRou.get('/sucursales', getSucursales); // Pedimos los datos de las sucursales

// Exportar las Rutas
export default dataSucursalRou;