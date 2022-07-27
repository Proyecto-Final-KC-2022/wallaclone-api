# [Wallaclone-API]
> ### Api que cubre las funcionalidades básicas para la aplicación de publicación de anuncios wallaclone.

# Getting started

Para arrancar el servidor de node en local:

- Clona este repositorio
- Haz `npm install` para instalar las dependencias necesarias
- Instala MongoDB Community Edition ([instrucciones](https://docs.mongodb.com/manual/installation/#tutorials)) y arrancalo con `mongod`
- `npm run initdb:dev` para cargar la base de datos con algunos registros de ejemplo
- `npm run start:dev` para arrancar el servidor en local

# Descripción general

## Dependencias

- [express](https://github.com/expressjs/express) - Servidor que gestiona y enruta peticiones HTTP
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) - Para generación de JWT utilizado para gestionar la autenticación del API
- [mongoose](https://github.com/Automattic/mongoose) - Para el modelado y mapeo de datos almacenados con MongoDB a Javascript
- [aws-sdk](https://github.com/aws/aws-sdk-js) - API de JavaScript para conectar con los servicios de AWS, en este caso usado para conectar con el almacenamiento de imágenes
- [bcrypt](https://github.com/kelektiv/node.bcrypt.js) - Biblioteca para hashear contraseñas
- [cors](https://github.com/expressjs/cors) - Para habilitar el intercambio de recursos de origen cruzado (CORS) entre ambas aplicaciones (backend y frontend)
- [multer-s3](https://github.com/anacronw/multer-s3) - Motor de almacenamiento múltiple para AWS S3
- [socket.io](https://github.com/socketio/socket.io) - Biblioteca que habilita una comunicación bidireccional y basada en eventos entre el servidor (backend) y el cliente (frontend)


## Estructura de la aplicación

- `src/app.ts` - Punto de entrada de la aplicación. Este fichero define el servidor de express e inicializa los middlewares y el enrutado para los endpoints de la zona pública así como también la zona privada.
- `src/routes/controllers` - Carpeta que contiene los controllers (cada controller contiene una serie de endpoints asociados a un caso de uso).
- `src/routes/controllers/private_routes` - Carpeta que contiene los controllers con endpoints privados que requieren autenticación para acceder.
- `src/routes/controllers/public_routes` - Carpeta que contiene los controllers con endpoints públicos, sin necesidad de autenticación.
- `src/routes/controllers/models` - Contiene archivos con modelos útiles para los controllers.
- `src/routes/services` - Carpeta que contiene servicios con funciones que se invocan desde los controllers, y que realizan la lógica de negocio necesaria en cada endpoint.
- `src/models` - Carpeta que contiene archivos con las definiciones, de esquemas y todo lo relacionado con el modelado y mapeo de datos con Mongoose.
- `src/connectMongoose.ts` - Archivo que conecta la aplicación con mongodb usando mongoose.
- `src/initDB.ts` - Archivo que carga una serie de datos iniciales para probar el funcionameinto del servidor.

- `postman_collection` - Carpeta con una colección de POSTMAN de todos los endpoints del API, para poder realizar pruebas


## Authenticación

Las peticiones que van a los endpoints definidos en la zona privada son autenticadas con un header `Authorization` que necesita un JWT válido. En el caso de que esta autenticación no sea válida, el servidor responderá a la consulta realizada con un HTTP Status 401.


<br />