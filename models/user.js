import { Schema, model} from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const UserSchema = Schema ({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  role: {
    type: String,
    default: "empleado"
  },
  access: [
    {
      type: Schema.ObjectId,
      ref: "access",
      required: false
    }
  ],
  notes:[
    {type:String}
  ],
  password: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Añadir pluggin de paginación
UserSchema.plugin(mongoosePaginate);


export default model("User", UserSchema, "users");
