import connection from './database/connection.js';
import  express, { json, urlencoded } from 'express';
import cors from "cors";
import UserRoutes from './routes/user.js';
import AccessRoutes from './routes/access.js';



// Conexión a la BD
connection();

const app = express()
const port = process.env.PORT 

// Configurar cors: permite que las peticiones se hagan correctamente
app.use(cors());

// Conversión de datos (body a objetos JS)
app.use(json());
app.use(urlencoded({extended: true}));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Configurar rutas
app.use('/api/user', UserRoutes);
app.use('/api/access', AccessRoutes);

app.listen(port, () => {
  console.log(`API NODE arriba en port ${port}`)
})

