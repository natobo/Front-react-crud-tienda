# ¡Bienvenido a Front-react-crud-tienda! 🚀

_Esta es una aplicación que despliega un la interfaz gráfica de una tienda con un crud simple, este es desarrollado con el framework de [React](https://es.reactjs.org/)_

# Introducción 📋
Este proyecto se desarrollo con el fin de crear un CRUD básico de una tienda con servicios de AWS y para aprender a utilizar el framework CDK. Dentro del proyecto se utilizan los siguientes productos de AWS:
* Api gateway
* Lambda functions
* Cloudfront
* WAF
* S3
* Cognito
* DynamoDB
* IAM

## Comandos útiles ⚙️

En la carpeta del proyecto, puede correr el commando:

### `npm start`

Ejecuta la aplicación en el modo de desarrollo. \
Abra [http: // localhost: 3000] (http: // localhost: 3000) para verlo en el navegador.

La página se recargará si realiza modificaciones. \
También verá errores de indentación en la consola.

### `npm run build`

Construye la aplicación para producción en la carpeta `build`. \
Agrupa correctamente React en el modo de producción y optimiza la compilación para obtener el mejor rendimiento.

La compilación se minimiza y los nombres de archivo incluyen los hash. \
¡Tu aplicación está lista para implementarse!

Consulte la sección sobre [implementación] (https://facebook.github.io/create-react-app/docs/deployment) para obtener más información.

**Adicionalmente los archivos de esta carpeta es el que vamos a montar dentro de un bucket s3 para montar un CDN con cloudfront.**

## Aprender más 📖

Puede obtener más información en la [documentación de Create React App] (https://facebook.github.io/create-react-app/docs/getting-started).
Para aprender React, consulte la [documentación de React] (https://reactjs.org/).

