
import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
    {
        appointmentID:{
            type: String,
            require: true,
        },
        parentEmail:{
            type: String,
            require: true,
            min: 2,
            max: 50,
        },
        parentName:{
            type: String,
            require: true,
            min: 2,
            max: 50,
        },
        vName:{
            type: String,
            require: true,
            min: 2,
            max: 50,
        },
        vid:{
            type: String,
            require: true,
            min: 2,
            max: 50,
            
        },
        vcName:{
            type: String,
            require: true,
            min: 2,
            max: 50,
        },
        vcid:{
            type: String,
            require: true,
            min: 2,
            max: 50,
            
        },
        pid:{
            type: String,
            require: true,
            min: 2,
            max: 50,
            
        },
        cid:{
            type: String,
            require: true,
            min: 2,
            max: 50,
            
        },
        cName:{
            type: String,
            require: true,
            min: 2,
            max: 50,   
        },
        aStatus:{
            type: String,
            require: true,
            min: 2,
            max: 50,
            
        },

        vDate:{
            type: Date,
            require: true,
        },
        timeslot:{
            type: String,
            require: true,
        },
    }
);


const Appointment = mongoose.model("Appointments",AppointmentSchema);
export default Appointment;
