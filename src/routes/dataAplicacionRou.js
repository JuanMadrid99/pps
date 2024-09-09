/* RUTAS DE LA INFORMACIÓN DE LAS APLICACIONES */
import express from 'express';
import getAplicaciones from '../controllers/dataAplicacionCon.js'
const dataAplicacionRou = express.Router();

dataAplicacionRou.get('/aplicaciones', getAplicaciones); // Pedimos los datos de las aplicaciones

// Exportar las Rutas
export default dataAplicacionRou;