import mongoose from "mongoose";
import Jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  vcName: {
    type: String,
    require: true,

  },
  Email: {
    type: String,
    require: true,

    unique: true,
  },
  vcPhone: {
    type: Number,
    require: true,
    length: 10,
  },
  vcOwnerName: {
    type: String,
    require: true,
  },
  vaccines:[],

  userType: {
    type: String,
    require: true,
  },
  // address: {
  //   type: String,
  //   require: true,
  // },

  address: [
    {
      addrHouseNo: {
        type: String,
        require: true,
      },
      addrLocality: {
        type: String,
        require: true,
      },
      addrRoad: {
        type: String,
        require: true,
      },
      addrCity: {
        type: String,
        require: true,
      },
      addrTaluka: {
        type: String,
        require: true,
      },
      addrDistrict: {
        type: String,
        require: true,
      },
      addrState: {
        type: String,
        require: true,
      },
      addrCountry: {
        type: String,
        require: true,
      },
      addrPinCode: {
        type: String,
        require: true,
      },
    },

  ],
  locationLat: {
    type:Number,
    },

  locationLon: {
    type:Number,
    },
  isApproved: {
    type:Boolean,
    },
  password: {
    type: String,
    require: true,
    min: 6,
  },
  token: {
    type: String,
  },
  timeslots:[],
  vcRating:{
    vcAvgRating:{
      type:Number
    },
    Ratings:[
      {
        p_id:{
          type:String,
        },
        rating:{
          type:Number,
        },
      }
    
    ]
  }
});

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

UserSchema.methods.addChild = async function (child) {
  try {
    console.log(this);
    this.children = this.children.concat(child);

    await this.save();
  } catch (error) {
    console.log(error);
  }
};
const VaccineCenter = mongoose.model("VaccinationCenter", UserSchema,"users");
export default VaccineCenter;
