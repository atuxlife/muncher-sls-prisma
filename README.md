# muncher-sls-prisma
Prueba técnica con serverless y prisma. Actualización de saldos y ventas.

En serverless.yml están declaradas las configuraciones del AWS y los endpoints usados para interactuar con la aplicación.

- lstusers (Listado de usuarios). Tipo de petición GET, no necesita parámetros.
- register (Registro de usuarios). Petición POST y necesita que se le envíe por el body { email: 'somemail@mail.com', name: 'Nombre del usuario', balance: 500 }
- buybalance (Comprar balance o saldo para un usuario). Petición POST. Estructura del body { iduser: 1, balance: 500 }. Id del usuario y el saldo a comprar.
- purchase (Compra de artículos). Petición POST. Estructura del body { iduser: 1, valpur: 500 }. Id del usuario que compra y valor de la compra.
- transfer (Transferencia de saldos). Petición POST. Estructura del body { userfrom: 1, userto: 2, valtrans: 500 }. Id del usuario de origen, id del usuario destino y la cantidad de saldo a pasar.

Dependencias del proyecto

- serverless-offline
- prisma.io
- querystring

La estructura de la base de datos comprende tres tablas:

- User: datos del usuario, los cuales son email, nombre, balance o saldo.
- Movement: Modelo de movimientos. Aquí podemos ver quién ha hecho qué tipo de movimientos y por qué montos.
- PurchaseOrder: Modelo de órdenes de compra. Estas registran quién compró y cuánto compró.
