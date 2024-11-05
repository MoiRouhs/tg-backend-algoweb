import { Schema, model} from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const AccessSchema = Schema ({
  name_client: {
    type: String,
    required: true
  },
  name_project: {
    type: String,
    required: true
  },
  user: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  notes:[
    {type:String}
  ],
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Añadir pluggin de paginación
AccessSchema.plugin(mongoosePaginate);


export default model("Access", AccessSchema, "access");
