import User from "../models/user.js"
import bcrypt from "bcrypt";
import { createToken } from "../services/jwt.js"

export const testUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador: user.js"
  });
}
export const register = async (req, res) => {
  try{   
    const params = req.body;
    console.log('params:', req.body);
    
    // Validaciones: verificamos que los datos obligatorios estén presentes
    if (!params.name || !params.position || !params.email || !params.password){
      return res.status(400).json({
        status: "error",
        message: "Faltan datos por enviar"
      });
    }


    // Crear una instancia del modelo User con los datos validados
    const user_to_save = new User(params);
    const count = await User.countDocuments(); 

    if(count === 0){
      user_to_save.role = "super-admin";
    }
    console.log('user_to_save:', user_to_save); 
    

    // Buscar si ya existe un usuario con el mismo email 
    const existingUser = await User.findOne({
      $or: [
        { email: user_to_save.email.toLowerCase() }
      ]
    });
    
    // Si encuentra un usuario, devuelve un mensaje indicando que ya existe
    if(existingUser) {
      return res.status(409).json({
        status: "error",
        message: "!El usuario ya existe!"
      });
    }

    // Cifrar contraseña
    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(user_to_save.password, salt);
    user_to_save.password = hasedPassword;

    // Guardar el usuario en la base de datos
    await user_to_save.save();

    // Devolver respuesta exitosa y el usuario registrado
    return res.status(201).json({
      status: "created",
      message: "Usuario registrado con éxito",
      user: user_to_save
    });

  }catch (error) {

    console.log("Error en registro de usuario:", error);
    return res.status(500).json({
      status: "error",
      message: "Error en registro de usuarios"
    });
  }
}

// Método para autenticar usuarios
export const login = async (req, res) => {
  try {

    // Recoger los parámetros del body
    let params = req.body;

    // Validar si llegaron el email y password
    if (!params.email || !params.password){
      return res.status(400).send({
        status: "error",
        message: "Faltan datos por enviar"
      });
    }

    // Buscar en la BD si existe el email que nos envió el usuario
    const user = await User.findOne({ email: params.email.toLowerCase()});

    // Si no existe el user
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado"
      });
    }

    // Comprobar si el password recibido es igual al que está almacenado en la BD
    const validPassword = await bcrypt.compare(params.password, user.password);

    // Si los passwords no coinciden
    if (!validPassword) {
      return res.status(401).json({
        status: "error",
        message: "Contraseña incorrecta"
      });
    }

    // Generar token de autenticación
    const token = createToken(user);

    // Devolver Token generado y los datos del usuario
    return res.status(200).json({
      status: "success",
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        name: user.name,
        position: user.position,
        email: user.email,
        role:user.role,
        access:user.access,
        notes: user.notes,
        created_at: user.created_at
      }
    });

  } catch (error) {
    console.log("Error en el login del usuario: ", error);
    return res.status(500).send({
      status: "error",
      message: "Error en el login del usuario"
    });
  }
}
// Método para actualizar los datos del usuario
export const updateUser = async (req, res) => {
  try {
    // Recoger información del usuario a actualizar
    let userIdentity = req.user;
    let userToUpdate = req.body;

    // Validar que los campos necesarios estén presentes
    if (!userToUpdate.email ) {
      return res.status(400).send({
        status: "error",
        message: "¡El campo email es requerido!"
      });
    }
    

    // Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;

    // Comprobar si el usuario ya existe
    const users = await User.find({
      $or: [
        { email: userToUpdate.email.toLowerCase() }
      ]
    }).exec();

    // Buscar en la BD si existe el email que nos envió el usuario
    const userToUpdateInfo = await User.findOne({ email: userToUpdate.email.toLowerCase()});
    userIdentity = await User.findById(userIdentity.userId);
    console.log('userIdentity', userIdentity)

    // Si es empleado solo se puede modificar a si mismo


    switch( userIdentity.role){
      case 'empleado':
        console.log('es empleado')
        if(userIdentity.id !== userToUpdateInfo.id){
          return res.status(400).send({
            status: "error",
            message: "Solo se puede modificar los datos del usuario logueado."
          });
        }
        delete userToUpdate.email;
        if(userToUpdate.role){
          return res.status(400).send({
            status: "error",
            message: "No puedes modificar el rol."
          });
        }
        break;
      case 'administrador':
        console.log('es administrador')
        if(userToUpdateInfo.role !== 'empleado' && userIdentity.id !== userToUpdateInfo.id){
          return res.status(400).send({
            status: "error",
            message: "Solo se puede modificar los datos de usuario con role empleado."
          });
        }
        delete userToUpdate.email;
        if(userToUpdate.role){
          return res.status(400).send({
            status: "error",
            message: "No puedes asignar roles."
          });
        }
        break;
      case 'super-admin':
        console.log('es super admin')
        if(userToUpdate.role === 'super-admin'){
          return res.status(400).send({
            status: "error",
            message: "No puedes asignar roles de super administrador."
          });
        }
        break;
      default:
        console.log('No tiene rol asignado')
        return res.status(400).send({
          status: "error",
          message: "No puede modificar ningún usuario"
        });
    }

    // Cifrar la contraseña si se proporciona
    if (userToUpdate.password) {
      try {
        let pwd = await bcrypt.hash(userToUpdate.password, 10);
        userToUpdate.password = pwd;
      } catch (hashError) {
        return res.status(500).send({
          status: "error",
          message: "Error al cifrar la contraseña"
        });
      }
    } else {
      delete userToUpdate.password;
    }



    console.log('userIdentity', userIdentity)
    console.log('userToUpdateInfo', userToUpdateInfo)
    console.log('datos a actualizar', userToUpdate)

    // Buscar y Actualizar el usuario a modificar en la BD
    let userUpdated = await User.findByIdAndUpdate(userToUpdateInfo.id, userToUpdate, { new: true});

    if (!userUpdated) {
      return res.status(400).send({
        status: "error",
        message: "Error al actualizar el usuario"
      });
    }

    // Devolver respuesta exitosa con el usuario actualizado
    return res.status(200).json({
      status: "success",
      message: "¡Usuario actualizado correctamente!",
      user: userUpdated
    });
    
  } catch (error) {
    console.log("Error al actualizar los datos del usuario", error);
    return res.status(500).send({
      status: "error",
      message: "Error al actualizar los datos del usuario"
    });
  }
}
