import mongoose from "mongoose";
import Jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  parentName: {
    type: String,
    require: true,
    min: 2,
    max: 50,
  },
  Email: {
    type: String,
    require: true,
    min: 2,
    max: 50,
    unique: true,
  },
  parentPhone: {
    type: Number,
    require: true,
    length: 10,
  },
  parentDOB: {
    type: Date,
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
  children: [
    {
      childName: {
        type: String,
        require: true,
      },
      childDOB: {
        type: Date,
        require: true,
      },
      childGender: {
        type: String,
        require: true,
      },
      Vaccines:[],
    },
  ],
  password: {
    type: String,
    require: true,
    min: 6,
  },
  token: {
    type: String,
  },
  locationLat: {
    type:Number,
    },

  locationLon: {
    type:Number,
    },
  userType: {
    type: String,
  },
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

    this.children = this.children.concat(child);
    await this.save();
    
  } catch (error) {
    console.log(error);
  }
};


UserSchema.methods.updateVaccine = async function (child) {
  try {

    this.children = this.children.concat(child);
    await this.save();
    
  } catch (error) {
    console.log(error);
  }
};

const User = mongoose.model("User", UserSchema);
export default User;
