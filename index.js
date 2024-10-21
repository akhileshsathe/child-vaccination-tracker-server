// Imports

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import {vcReport,adminReport,AppointmentsDataVC,completeAppointment,AppointmentsVC,sendReminder,cancelAppointment,Appointmentsperchild,pGetAppointments,BookAppointment, VCTimeSlot,userGetVC, addVCVaccine,removeVCVaccine,adminGetVC,removeVaccine,addVaccine,adminGetVaccines,vcRegister,parentRegister,login,addchild,logout,adminRegister, ManageVC } from "./controllers/auth.js";
import { body } from "express-validator";
import cookieParser from "cookie-parser";

import authenticateUser from "./middleware/authenticateUser.js";

dotenv.config();
const app = express();
app.use(cookieParser())
app.use(express.json());



//  Routes
app.post("/parentRegister",
  [body("parentName", "Name is required").exists(),
  body("parentName", "Name is too short").isLength({ min: 3}),
  body("Email", "Email is required").exists(),
  body("Email", "Invalid Email").isEmail(),
  body("parentPhone", "Phone is required").exists(),
  body("parentPhone", "Invalid phone number").isMobilePhone(),
  body("parentDOB", "Parent DOB is required").exists(),
  body("address", "Address is required").exists(),
  body("address", "Address is too short").isLength({ min: 3}),

  body("childName", "Child's Name is required").exists(),
  body("childName", "Child's Name is too short").isLength({ min: 3}),
  body("childDOB", "Child's DOB is required").exists(),
  body("childGender", "Child's Gender is required").exists(),
  body("password", "password is required").exists(),
  body("password", "password is too short").isLength({ min: 6}),
  body("password", "Please set a strong password").isStrongPassword(
                    { minLength: 6, 
                    minLowercase: 1, 
                    minUppercase: 1, 
                    }
  ),
  

  

],
  parentRegister,
);
app.post("/vcRegister",
  [body("vcName", "Name is required").exists(),
  body("vcName", "Name is too short").isLength({ min: 3}),
  body("Email", "Email is required").exists(),
  body("Email", "Invalid Email").isEmail(),
  body("vcPhone", "Phone is required").exists(),
  body("vcPhone", "Invalid phone number").isMobilePhone(),
  body("vcOwnerName", "Owner Name is required").exists(),
  body("vcOwnerName", "Owner Name is too short").isLength({ min: 3}),
  body("address", "Address is required").exists(),
  body("address", "Address is too short").isLength({ min: 3}),

  body("password", "password is too short").isLength({ min: 6}),
  body("password", "Please set a strong password").isStrongPassword(
                    { minLength: 6, 
                    minLowercase: 1, 
                    minUppercase: 1, 
                    }
  ),
  

  

],
  vcRegister,
);
app.post("/removeVaccine",removeVaccine);
app.post("/removeVCVaccine",removeVCVaccine);
app.post("/addVCVaccine",addVCVaccine);

app.post("/adminRegister",adminRegister);
app.post("/login",
[
  body("Email", "Email is required").exists(),
  body("Email", "Email is invalid").isEmail(),
  body("password", "Password is required").exists()
],
  login);
app.post("/userGetVC",userGetVC)
app.get("/ParentHome",authenticateUser)
app.get("/VCDash",authenticateUser)
app.get("/AdminDash",authenticateUser)
app.get("/adminGetVaccines",adminGetVaccines)
app.get("/adminGetVC",adminGetVC)
app.post("/Appointmentsperchild",Appointmentsperchild)





app.get("/secret",async(req,res)=>res.status(201).send(req.body.parentEmail))
app.post("/addchild",[ 
  body("childName", "Child's Name is required").exists(),
body("childName", "Child's Name is too short").isLength({ min: 3}),
body("childDOB", "Child's DOB is required").exists(),
body("childGender", "Child's Gender is required").exists(),





],addchild)
app.post("/logout",logout);
app.post("/adminGetVC",adminGetVC);
app.post("/addVaccine",addVaccine);
app.post("/ManageVC",ManageVC);
app.post("/VCTimeSlot",VCTimeSlot);
app.post("/BookAppointment",BookAppointment);
app.post("/pGetAppointments",pGetAppointments);
app.post("/cancelAppointment",cancelAppointment);
app.get("/sendReminder",sendReminder);

app.post("/AppointmentsVC",AppointmentsVC);
app.post("/completeAppointment",completeAppointment);

app.post("/AppointmentsDataVC",AppointmentsDataVC);
app.get("/adminReport",adminReport);
app.post("/vcReport",vcReport);






const notifier=()=>{
console.log("notifier started")
try{
sendReminder()
}
catch(err){console.log(err)}
}

// const intervalDuration = 86400000
const intervalDuration = 86400000




//mongoose module setup
const PORT = process.env.PORT || 6001;


  mongoose.set("strictQuery", true);
  mongoose.connect(process.env.MONGO_URL)
  .then(

    app.listen(PORT, () => console.log(`server Port:${PORT}`)),
    
    // setTimeout(() => {
    //   const intervalId = setInterval(notifier, intervalDuration);
    //   console.log(`Notifier scheduled to run every ${intervalDuration / 1000} seconds`);
    // }, 5000)

  )
  
.catch (error => console.log(`${error} did not connect:index.js`));


