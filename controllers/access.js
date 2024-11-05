// Acciones de prueba
export const testAccess = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador: access.js"
  });
}

