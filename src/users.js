const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const querystring = require('querystring');

// Listado de usuarios registrados, con sus respectivos saldos
module.exports.lstusers = async (event) => {
    
    const allUsers = await prisma.user.findMany();
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            lstusers: allUsers,
            input: event
        },null,2),
    };

};

// Registramos un usuario con su respectivo saldo. Este es un endpoint accedido por POST. 
// El body de la petición debe tener la siguiente estructura { email: 'somemail@mail.com', name: 'Nombre del usuario', balance: 500 }
module.exports.register = async (event) => {

    // Recogemos los datos del body de la petición
    const body = querystring.parse(event.body);

    // Insertar datos
    const createUser = await prisma.user.create({
        data : {
            email   : body.email,
            name    : body.name,
            balance : parseInt(body.balance)
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Registrando usuario',
            input: `Registrando datos ${JSON.stringify(createUser)}`
        },null,2),
    };

};

// Compramos saldo para un usuario específico. Este es un endpoint accedido por POST. 
// El body de la petición debe tener la siguiente estructura { iduser: 1, balance: 500 } Es el id del usuario y su respectivo saldo a comprar
module.exports.buybalance = async (event) => {

    // Recogemos los datos del body de la petición
    const body = querystring.parse(event.body);

    // Consultar datos del usuario al que se le modificará el saldo
    const userMod =  await prisma.user.findUnique({
        where: { id: parseInt(body.iduser) }
    });

    // Aumentamos el saldo de lo consultado más lo que se comprará
    let newbalance = parseInt(userMod.balance) + parseInt(body.balance);

    // Actualizamos el balance del usuario seleccionado
    const udateBalance = await prisma.user.update({
        where: { id: parseInt(body.iduser) },
        data : { balance : newbalance }
    });

    // Creamos un movimiento donde se registra el tipo de operación realizada y el monto de la misma, asignándola a un usuario en específico
    const createMove = await prisma.movement.create({
        data : {
            valmov      : parseInt(body.balance),
            movtype     : 'BYB',
            userId      : parseInt(body.iduser)
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Comprando ${body.balance} en saldo para ${userMod.name}. El saldo anterior era: ${userMod.balance}. El nuevo saldo es: ${newbalance}.`
        },null,2),
    };

};

// Compramos unos artículos agrupados en una orden de compra, esta resta del saldo del usuario el valor comprado.
// Este es un endpoint accedido por POST. 
// El body de la petición debe tener la siguiente estructura { iduser: 1, valpur: 500 } Es el id del usuario y su respectivo valor de compra
module.exports.purchase = async (event) => {

    // Recogemos los datos del body de la petición
    const body = querystring.parse(event.body);

    // Consultar datos del usuario al que hará la compra
    const userMod =  await prisma.user.findUnique({
        where: { id: parseInt(body.iduser) }
    });

    // Resta del valor de la compra al saldo disponible del usuario
    let newbalance = parseInt(userMod.balance) - parseInt(body.valpur);

    // Validación que el saldo no sea menor a cero
    if( newbalance < 0 ){
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'No tiene suficiente saldo para comprar.'
            },null,2),
        };
    }

    // Creo una orden de compra en la base de datos
    const createPurchase = await prisma.purchaseOrder.create({
        data : {
            valpur  : parseInt(body.valpur),
            userId  : parseInt(body.iduser)
        }
    });

    // Actualizo el saldo del usuario dependiendo del valor de la compra (resta hecha anteriormente)
    const udateBalance = await prisma.user.update({
        where: { id: parseInt(body.iduser) },
        data : { balance : newbalance }
    });

    
    // Creamos un movimiento donde se registra el tipo de operación realizada y el monto de la misma, asignándola a un usuario en específico.
    // En este caso es un movimiento en negativo porque es de resta de saldo
    const createMove = await prisma.movement.create({
        data : {
            valmov      : parseInt(body.valpur) * -1,
            movtype     : 'PRC',
            userId      : parseInt(body.iduser)
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `Comprando ${body.valpur} en productos para ${userMod.name}. El saldo anterior era: ${userMod.balance}. El nuevo saldo es: ${newbalance}.`
        },null,2),
    };

};

// Este método o endpoint se usa para hacer transferencia de saldos entre usuarios. Este es un endpoint accedido por POST. 
// El body de la petición debe tener la siguiente estructura { userfrom: 1, userto: 2, valtrans: 500 } 
// Es el id del usuario que envía, el id del usuario que recibe y el respectivo saldo a transferir
module.exports.transfer = async (event) => {

    // Recogemos los datos del body de la petición
    const body = querystring.parse(event.body);

    // Consultamos datos del usuario que envía el saldo
    const userFrom =  await prisma.user.findUnique({
        where: { id: parseInt(body.userfrom) }
    });

    // Consultamos datos del usuario que recibe el saldo
    const userTo =  await prisma.user.findUnique({
        where: { id: parseInt(body.userto) }
    });

    let newbalance = parseInt(userFrom.balance) - parseInt(body.valtrans); // Restar saldo al usuario que envía
    let newbaltous = parseInt(userTo.balance) + parseInt(body.valtrans); // Sumar saldo al usuario que recibe

    // Validación que el saldo no sea menor a cero
    if( newbalance < 0 ){
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'No tiene suficiente saldo para hacer esta transferencia.'
            },null,2),
        };
    }

    // Actualizamos saldo de quien envía el saldo
    const udateBalanceFrom = await prisma.user.update({
        where: { id: parseInt(body.userfrom) },
        data : { balance : newbalance }
    });

    // Actualizamos saldo de quien recibe el saldo
    const udateBalanceTo = await prisma.user.update({
        where: { id: parseInt(body.userto) },
        data : { balance : newbaltous }
    });

    // Creamos movimiento negativo para el usuario que envía el saldo
    const createMoveFrom = await prisma.movement.create({
        data : {
            valmov      : parseInt(body.valtrans) * -1,
            movtype     : 'TFB',
            userId      : parseInt(body.userfrom),
            transFrom   : parseInt(body.userfrom),
            transTo     : parseInt(body.userto)
        }
    });

    // Creamos movimiento positivo para el usuario que recibe el saldo
    const createMoveTo = await prisma.movement.create({
        data : {
            valmov      : parseInt(body.valtrans),
            movtype     : 'TFB',
            userId      : parseInt(body.userfrom),
            transFrom   : parseInt(body.userfrom),
            transTo     : parseInt(body.userto)
        }
    });

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: `El usuario ${userFrom.name} le transfirió en saldo ${body.valtrans} para el usuario ${userTo.name}. El nuevo saldo de: ${userFrom.name} es ${newbalance}. El nuevo saldo de: ${userTo.name} es ${newbaltous}.`
        },null,2),
    };

};