import User from "../models/User.js"
import Appointment from "../models/Appointment.js";
import Jwt from "jsonwebtoken"

const authenticateUser = async (req,res) => {

  try{
    const {cookies} =req;
    // console.log(cookies);
    const token = cookies.token;
    const verifyToken = Jwt.verify(token,process.env.SECRET);
    const user = await User.findOne({_id:verifyToken._id,"token":token})
    
    if(!user){
      throw new Error("User not found");
  }

  user.password=undefined
  
  res.status(201).send(user)
}
  catch(err){
    res.status(401).send(err)
    console.log(err)
  }
   
}

export default authenticateUser;