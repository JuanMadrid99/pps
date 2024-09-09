/* CONFIGURACIÓN AL BASE DE DATOS */
// Constantes que voy a obtener atraves de variables de entorno (.env)
import { config } from "dotenv" // Permite ejecutar la funcion config ..entrega las variables de entorno

config();

export default {
  host: process.env.HOST || "",
  database: process.env.DATABASE || "",
  user: process.env.USER || "",
  password: process.env.PASSWORD || "",
};