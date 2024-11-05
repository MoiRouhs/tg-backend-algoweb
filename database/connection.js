import { connect } from "mongoose";
let host = process.env.HOST
let dbname = process.env.NAMEDB

const connection = async() => {

  try {
    await connect(`mongodb://${host}:27017/${dbname}`);
    console.log(`Conectado correctamente a la BD: ${dbname}` );
  } catch (error) {
    console.log(error);
    throw new error("¡No se ha podido conectar a la base de datos!");
  }

}

export default connection;
