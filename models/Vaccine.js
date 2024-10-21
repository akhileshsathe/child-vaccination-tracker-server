
import mongoose from "mongoose";

const VaccineSchema = new mongoose.Schema(
    {
        vName:{
            type: String,
            require: true,
            min: 2,
            max: 50,
        },
        vShortName:{
            type: String,
            require: true,
            min: 2,
            max: 50,
            
        },
        vSideEffects:[],

        vStartRangeNumber:{
            type: Number,
            require: true,
        },
        vStartRangePost:{
            type: String,
            require: true,
        },
        vEndRangeNumber:{
            type: Number,
            require: true,
        },
        vEndRangePost:{
            type: String,
            require: true,
        },
        vSortVar:{
            type: Number,
            require: true,
        },
        vEndVar:{
            type: Number,
            require: true,
        },
        vEndRangeE:{
            type: Number,
            require: true,
        },

    medium:{
            type: String,
            require: true,
            min: 6,
        },
        vDiseasePrevented:{
            type: String,
            require: true,
            min: 6,
        },
        vDesc:{
            type: String,
            require: true,
            min: 6,
        },
    }
);

VaccineSchema.methods.addVaccine = async function (vaccine) {
    try {
      console.log(this);
      await this.save();
    } catch (error) {
      console.log(error);
    }
  };
const Vaccine = mongoose.model("Vaccines",VaccineSchema);
export default Vaccine;
