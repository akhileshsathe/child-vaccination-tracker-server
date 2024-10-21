
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {

        adminName:{
            type:String,
            require:true,
        },
        Email:{
            type:String,
            require:true,
        },
        adminPhone:{
            type:Number,
            require:true,
        },
        adminDOB:{
            type:Date,
            require:true,
        },
        userType:{
            type:String,
            require:true,
        },
        level:{
            type:Number,
            require:true,
        },
        isApproved:{
            type:Boolean,
            require:true,
        },
        password:{
            type:String,
            require:true,
        },
                
    }
);

UserSchema.methods.GenerateAuthToken = function () {
    try {
      // const token="TOKENTOKEN"
      const token = Jwt.sign({ _id: this._id }, process.env.SECRET, {
        expiresIn: "24H",
      });
      this.token = token;
      this.save();
      return token;
    } catch (err) {
      console.log(err);
    }
  };
  
const Admin = mongoose.model("Admin",UserSchema,"users");
export default Admin;