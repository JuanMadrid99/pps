/* Cómo se deben ejecutar y administrar tus aplicaciones en PM2 */
module.exports = {
  apps: [{
    name: 'back',       // Nombre de la aplicación en PM2 (opcional)
    script: 'src/index.js', // Ruta al archivo principal
    watch: false,       // Opcional: habilita la vigilancia de archivos
    env: {
      watch:true,
      DEBUG: 'app:*',  // Configura para mostrar mensajes con prefijo app:server
      NODE_ENV: 'development', // Configura el entorno de desarrollo
    },
    env_production: {
      watch: false,
      DEBUG: '',        // Desactiva el logging de depuración en producción
      NODE_ENV: 'production', // Configura el entorno de producción
    }
  }],

  deploy: {
    production: {
      user: 'SSH_USERNAME',        // Reemplaza con el nombre de usuario SSH
      host: 'SSH_HOSTMACHINE',     // Reemplaza con la dirección del host SSH
      ref: 'origin/master',        // Rama de Git a desplegar
      repo: 'GIT_REPOSITORY',      // Reemplaza con la URL del repositorio Git
      path: 'DESTINATION_PATH',   // Reemplaza con el destino en el servidor
      'pre-deploy-local': '',      // Comando local a ejecutar antes del despliegue
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production', // Comando a ejecutar después del despliegue
      'pre-setup': ''              // Comando a ejecutar antes de la configuración del servidor
    }
  }
};
