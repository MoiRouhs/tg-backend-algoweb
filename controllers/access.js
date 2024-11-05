import Access from "../models/access.js"
import User from "../models/user.js"
import bcrypt from "bcrypt";
// Acciones de prueba
export const testAccess = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador: access.js"
  });
}
export const register = async (req, res) => {
  try{   
    let userIdentity = req.user;
    const params = req.body;
    console.log('params:', req.body);


    if( userIdentity.role === 'empleado'){
      return res.status(400).json({
        status: "error",
        message: "Este tipo de usuario no puede crear credenciales"
      });
    }
    // Validaciones: verificamos que los datos obligatorios estén presentes
    if (!params.name_client || !params.name_project || !params.user || !params.password){
      return res.status(400).json({
        status: "error",
        message: "Faltan datos por enviar"
      });
    }

    // Crear una instancia del modelo Access con los datos validados
    const access_to_save = new Access(params);
    console.log('access_to_save:', access_to_save); 
    
    // Cifrar contraseña
    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(access_to_save.password, salt);
    access_to_save.password = hasedPassword;
    console.log('access_to_save2:', access_to_save); 


    // Buscar si ya existe un usuario con el mismo email 
    const existingAccess = await Access.findOne({
      $and: [
        { name_client: access_to_save.name_client.toLowerCase() },
        { name_project: access_to_save.name_project.toLowerCase() },
        { user: access_to_save.user },
        { password: access_to_save.password }
      ]
    });
    
    // Si encuentra un usuario, devuelve un mensaje indicando que ya existe
    if(existingAccess) {
      return res.status(409).json({
        status: "error",
        message: "!las credenciales ya existe!"
      });
    }


    // Guardar las credenciales en la base de datos
    await access_to_save.save();

    // Devolver respuesta exitosa y el usuario registrado
    return res.status(201).json({
      status: "created",
      message: "Accesos registrados con éxito",
      user: access_to_save
    });

  }catch (error) {

    console.log("Error en registro de usuario:", error);
    return res.status(500).json({
      status: "error",
      message: "Error en registro de accesos"
    });
  }
}

export const updateAccess = async (req, res)=>{
  try{   
    let userIdentity = req.user;
    const params = req.body;
    const accessId = params.id;
    console.log('params:', req.body);
    
    if( userIdentity.role === 'empleado'){
      return res.status(400).json({
        status: "error",
        message: "Este tipo de usuario no puede actualizar credenciales"
      });
    }
    
    // Validar que los campos necesarios estén presentes
    if (!accessId) {
      return res.status(400).send({
        status: "error",
        message: "¡El campo id es requerido!"
      });
    }

    // Eliminar campos sobrantes
    delete params.iat;
    delete params.exp;
    delete params.id;

    // Comprobar si el usuario ya existe
    const accessInDb = await Access.findById(accessId);
    
    if(!accessInDb){
      return res.status(400).send({
        status: "error",
        message: "No existe los accessos"
      });
    }
    // Buscar y Actualizar las credenciales en la BD
    let accessUpdated = await Access.findByIdAndUpdate(accessId, params, { new: true});

    if(!accessUpdated){
      return res.status(400).send({
        status: "error",
        message: "No se pudo actualizar los accessos"
      });
    }

    // Devolver respuesta exitosa con el usuario actualizado
    return res.status(200).json({
      status: "success",
      message: "¡Accesos actualizado correctamente!",
      access: accessUpdated
    });

  }catch(error){
    console.log("Error en registro de usuario:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar los accesos"
    });

  }
}

export const data = async (req, res)=>{
  try{   
    let userIdentity = req.user;
    const params = req.body;
    const accessId = params.id;
    let userAccess = await User.findById(userIdentity.userId).select('access -_id');
        userAccess = userAccess.access
    let isIdInArray = userAccess.some(userAccessId => userAccessId == accessId );
    console.log('isIdInArray', isIdInArray);   

    if( userIdentity.role === 'empleado' && !isIdInArray){
      return res.status(400).json({
        status: "error",
        message: "No tienes permisos para ver estos accesos"
      });
    }
    
    // Validar que los campos necesarios estén presentes
    if (!accessId) {
      return res.status(400).send({
        status: "error",
        message: "¡El campo id es requerido!"
      });
    }

    // Eliminar campos sobrantes
    delete params.iat;
    delete params.exp;

    // Comprobar si el usuario ya existe
    const accessInDb = await Access.findById(accessId);
    
    if(!accessInDb){
      return res.status(400).send({
        status: "error",
        message: "No existe los accessos"
      });
    }

    // Devolver respuesta exitosa con el usuario actualizado
    return res.status(200).json({
      status: "success",
      access: accessInDb
    });

  }catch(error){
    console.log("Error en registro de usuario:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al consultar los accesos"
    });

  }
}

// Método para listar Accesos con paginación
export const listAccess = async (req, res) => {
  try {
    let userIdentity = req.user;
    let access ;
    // Controlar en qué página estamos y el número de ítemas por página
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    // Realizar la consulta paginada
    const options = {
      page: page,
      limit: itemsPerPage,
      select: '-__v'
    };

    switch( userIdentity.role){
      case 'empleado':
        console.log('es empleado')
         return res.status(400).send({
          status: "error",
          message: "No puedes consultar ninguna lista de credenciales"
        });       
        break;
      case 'administrador':
        console.log('es administrador')
        access = await Access.paginate( {}, options);
        break;
      case 'super-admin':
        console.log('es super administrador')
        access = await Access.paginate( {}, options);
        break;
      default:
        console.log('No tiene rol asignado')
        return res.status(400).send({
          status: "error",
          message: "No puede ver ninguna lista de usuarios"
        });
    }

    // Si no hay usuario en la página solicitada
    if (!access || access.docs.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay accesos disponibles"
      });
    }

     // Devolver los usuarios paginados
    return res.status(200).json({
      status: "success",
      access: access.docs,
      totalDocs: access.totalDocs,
      totalPages: access.totalPages,
      page: access.page,
      pagingCounter: access.pagingCounter,
      hasPrevPage: access.hasPrevPage,
      hasNextPage: access.hasNextPage,
      prevPage: access.prevPage,
      nextPage: access.nextPage,
    });

  } catch (error) {
    console.log("Error al listar los usuarios:", error);
    return res.status(500).send({
      status: "error",
      message: "Error al listar los usuarios"
    });
  }
}
