import bcrypt from "bcrypt";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import VaccineCenter from "../models/VaccineCenter.js";
import Appointment from "../models/Appointment.js";
import Jwt from "jsonwebtoken";
import Vaccine from "../models/Vaccine.js";
import { validationResult } from "express-validator";
import nodemailer from "nodemailer";
import { google, oauth2_v2 } from "googleapis";
const OAuth2 = google.auth.OAuth2;
import config from "../config.js";
const Oauth2_client = new OAuth2(config.client_id, config.clientSecret);
Oauth2_client.setCredentials({ refresh_token: config.refreshToken });

//common

//Login for all user classes
export const login = async (req, res) => {
  try {
    const { Email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
    } else {
      User.findOne({ Email })
        .then((user) => {
          bcrypt
            .compare(password, user.password)
            .then((passwordMatched) => {
              if (!passwordMatched) {
                return res
                  .status(400)
                  .json({ error: [{ msg: "Email/Password Invalid" }] });
              }
              const token = user.GenerateAuthToken();
              res.cookie("token", token);
              console.log({ message: token });
              console.log(user.userType);

              return res
                .status(201)
                .json({ message: "OK", userType: user.userType });
            })
            .catch((error) => {
              return res.status(400).json({
                error: [
                  { msg: "Email/Password might be incorrect", er: error },
                ],
              });
            });
        })
        .catch((error) => {
          return res
            .status(400)
            .json({ error: [{ msg: "Email/Password incorrect", er: error }] });
        });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Logout for all user classes
export const logout = async (req, res) => {
  // res.cookie("token",null)
  // res.clearCookie('token');
  res.clearCookie("token");
  return res.status(201).send({ message: "OK" });
};

export const completeAppointment = async (req, res) => {
  const { pid, vid, cid } = req.body;

  Appointment.updateOne({ pid, vid, cid }, { aStatus: "d" }, (err, reuslt) => {
    if (err) {
      console.error(err);
      return res.status(401).send({ message: err });
    } else {
      return res.status(201).send({ message: "ok" });
      // console.log(`Document with pid=${pid}, vid=${vid}, and cid=${cid} was deleted`);
    }
  });
};
export const cancelAppointment = async (req, res) => {
  const { pid, vid, cid } = req.body;

  Appointment.deleteOne({ pid, vid, cid }, (err) => {
    if (err) {
      console.error(err);
      return res.status(401).send({ error: err, message: "ok" });
    } else {
      return res.status(201).send({ message: "ok" });
      // console.log(`Document with pid=${pid}, vid=${vid}, and cid=${cid} was deleted`);
    }
  });
};
//Admin
//Admin Registration
export const adminRegister = async (req, res) => {
  try {
    const {
      adminName,
      Email,
      adminPhone,
      adminDOB,
      userType,
      level,
      isApproved,
      password,
    } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });

      // res.status(400).send("{ error: errors.array() }");
    } else {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = new Admin({
        adminName,
        Email,
        adminPhone,
        adminDOB,
        userType,
        level,
        isApproved,

        password: passwordHash,
      });
      const userExists = await User.findOne({ Email: Email });
      if (userExists != null) {
        res.status(400).json({
          error: [
            {
              msg: "Email is already registered",
            },
          ],
        });
      } else {
        newUser.save().then(res.status(201).send({ message: "OK" }));
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Get vaccination center details for admin
export const adminGetVC = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const VC = await User.find({ userType: { $in: ["v", "vr", "vrr", "vu"] } });
    // console.log(VC);

    if (VC.length > 0) {
      return res.json({ VC: VC });
    } else {
      return res.send({ VC: [] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Get vaccination details for admin
export const adminGetVaccines = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });

      // res.status(400).send("{ error: errors.array() }");
    } else {
      const Vaccines = await Vaccine.find().sort({ vSortVar: "ascending" });
      if (Vaccines != null) {
        res.status(200).json({ Vaccines: Vaccines });
      } else {
        res.status(200).send({ Vaccines: [] });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Add or Update Vaccine
export const addVaccine = async (req, res) => {
  try {
    const {
      _id,
      vName,
      vShortName,
      vSideEffects,
      vStartRangeNumber,
      vStartRangePost,
      vEndRangeNumber,
      vEndRangePost,
      medium,
      vDiseasePrevented,
      vDesc,
      vSortVar,
      vEndVar,
      mode,
    } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });

      // res.status(400).send("{ error: errors.array() }");
    } else {
      // if mode is update then execute updatequery
      // if mode is add then execute save
      if (mode == "add") {
        console.log("adding");
        const vaccine = await Vaccine.findOne({ vName: vName });
        if (vaccine != null) {
          return res
            .status(400)
            .json({ error: vName + " vaccine already exists" });
        } else {
          const vaccine = new Vaccine({
            vName,
            vShortName,
            vSideEffects,
            vStartRangeNumber,
            vStartRangePost,
            vEndRangeNumber,
            vEndRangePost,
            medium,
            vDiseasePrevented,
            vDesc,
            vSortVar,
            vEndVar,
          });

          vaccine.save().then(res.status(201).send({ message: "OK" }));
        }
      } else if (mode == "update") {
        console.log("updating", _id);

        const vaccine = {
          vName,
          vShortName,
          vSideEffects,
          vStartRangeNumber,
          vStartRangePost,
          vEndRangeNumber,
          vEndRangePost,
          medium,
          vDiseasePrevented,
          vDesc,
          vSortVar,
          vEndVar,
        };
        // console.log(vaccine);

        Vaccine.findOneAndUpdate(
          { _id },
          vaccine,
          { new: true },
          (error, document) => {
            if (error) {
              console.log(error);
            } else {
              res.status(201).json(document);
            }
          }
        );
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Remove Vaccine
export const removeVaccine = async (req, res) => {
  try {
    const { _id } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
    } else {
      Vaccine.findOneAndDelete({ _id: _id }, (error, document) => {
        if (error) {
          console.log(error);
        } else {
          res.status(201).json(document);
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Manage Vaccination Center Approval
export const ManageVC = async (req, res) => {
  try {
    const { _id, userType } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
    } else {
      {
        User.findOneAndUpdate(
          { _id },
          {
            userType: userType,
          },
          { new: true },
          (error, document) => {
            if (error) {
              console.log(error);
            } else {
              res.status(201).json(document);
            }
          }
        );
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//Parent
//Parent Registration
export const parentRegister = async (req, res) => {
  try {
    const {
      parentName,
      Email,
      parentPhone,
      parentDOB,
      address,
      childName,
      childDOB,
      childGender,
      password,
      userType,
      locationLat,
      locationLon,
    } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });

      // res.status(400).send("{ error: errors.array() }");
    } else {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      let Vaccines = await Vaccine.find().sort({ vSortVar: "ascending" });
      Vaccines = Vaccines.map((obj) => {
        return {
          ...obj,
          AppointmentStatus: "p",
          vc: null,
          DoneOn: null,
        };
      });
      const newUser = new User({
        parentName,
        Email,
        parentPhone,
        parentDOB,
        address,
        locationLat,
        locationLon,
        children: [
          {
            childName: childName,
            childDOB: childDOB,
            childGender: childGender,
            Vaccines: Vaccines,
          },
        ],
        password: passwordHash,
        userType,
      });
      const userExists = await User.findOne({ Email: Email });
      if (userExists != null) {
        res.status(400).json({
          error: [
            {
              msg: "Email is already registered",
            },
          ],
        });
      } else {
        newUser.save().then(res.status(201).send({ message: "OK" }));
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Get all the appointments for a parent
export const pGetAppointments = async (req, res) => {
  try {
    const { cookies } = req;
    const token = cookies.token;
    const verifyToken = Jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({ _id: verifyToken._id, token: token });

    if (!user) throw new Error("User not found");
    else {
      const pid = user._id;
      const appointments = await Appointment.find({ pid });
      res.status(201).json({ user: user, appointments: appointments });
    }
  } catch (err) {
    res.status(401).send(err);
  }
};
//Add a new child
export const addchild = async (req, res) => {
  try {
    const { Email, childName, childDOB, childGender } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });

      // res.status(400).send("{ error: errors.array() }");
    } else {
      let Vaccines = await Vaccine.find()
        .sort({ vSortVar: "ascending" })
        .lean();
      Vaccines = Vaccines.map((obj) => {
        return { ...obj, AppointmentStatus: "p", vc: null, DoneOn: null };
      });

      const user = await User.findOne({ Email: Email });
      const child = {
        childDOB: childDOB,
        childGender: childGender,
        childName: childName,
        Vaccines: Vaccines,
      };

      user.addChild(child).then(res.status(201).send({ message: "OK" }));
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Get Vaccination Center list which provide a particular vaccine
export const userGetVC = async (req, res) => {
  try {
    const { vid } = req.body;
    // console.log(vid);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    // const VC = await User.find({
    //   userType: { $in: ["v"] },
    //   vaccines: { $elemMatch: { _id: vid } }
    // });

    const VC = await VaccineCenter.find({
      userType: "v",
      vaccines: { $in: [vid] },
    });
    //console.log("_____",VC);

    if (VC.length > 0) {
      return res.json({ VC: VC });
    } else {
      return res.json({ VC: [] });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Book appointment and send email to the user
export const BookAppointment = async (req, res) => {
  // AppointmentStatus: "p",
  //           vc: null,
  //           DoneOn: null,
  const { vid, pid, vDate, timeslot, userData, child, vc, vaccine } = req.body;
  const BookingEmail = () => {
    const accessToken = Oauth2_client.getAccessToken();
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: config.user,
        clientId: config.client_id,
        clientSecret: config.clientSecret,
        refreshToken: config.refreshToken,
        accessToken: accessToken,
      },
    });

    // define email options
    let mailOptions = {
      from: config.user,
      to: userData.Email,
      subject: "CVT - Appointment Booked",
      text: "CVT ",
      html: `
      <html>
            <head>
              <style>
                body {
                  font-family: Arial, sans-serif;
            text-align:center;
            background-color:#444;
                }
                h1 {
                  color: #1a73e8;
                  font-size: 24px;
                }
              a{
                height:50px;
                width:150px;
                background-color:#5377c1;
                color:#444;
              }
               td,tr,th{
                  border:1px solid grey;
            text-align:center;
            padding:5px;
                }
              </style>
            </head>
            <body>
            <h1>Appointment Booking Details</h1>
                  <table className="timeslot-table">
                    <thead>
                      <td colSpan="2">appointment Details</td>
      
                    </thead>
      
                    <tr>
                      <th>Parent's Name</th>
                      <td>${userData.parentName}</td>
      
                    </tr>
                    <tr>
                      <th>Child's Name</th>
                      <td>${child.childName}</td>
      
                    </tr>
                    <tr>
                      <th>Vaccination Name</th>
                      <td>${vaccine.vName}</td>
      
                    </tr>
                    <tr>
                      <th>Vaccination Center</th>
                      <td>${vc.vcName}</td>
      
                    </tr>
                    <tr>
                      <th>Appointment Date:</th>
                      <td>${vDate}</td>
      
                    </tr>
                    <tr>
                      <th>Appointment Timeslot:</th>
                      <td>${timeslot}</td>  
      
                    </tr>
      
                  </table>
                  <p>Get directions to the vaccination center -></p><a href='http://maps.google.com/maps?q=${vc.locationLat},${vc.locationLon}'>Vaccination Center Location</a>
            </body>
          </html>
      `,
    };

    // send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email was sent");
        //console.log('Email sent: ' + info.response);
      }
    });
  };
  const appointmentID = `${vc._id}_${userData._id}_${child.childName}_${vaccine._id}`;
  console.log(appointmentID);

  const appointment = await Appointment.findOne({ appointmentID });
  //console.log(appointmentID==appointment.appointmentID)
  if (appointment != null) {
    return res
      .status(400)
      .json({ error: [{ msg: "Appointment already exists" }] });
  } else {
    const appointment = new Appointment({
      appointmentID,
      parentEmail: userData.Email,
      parentName: userData.parentName,
      cName: child.childName,
      vName: vaccine.vName,
      vid: vaccine._id,
      pid: userData._id,
      cid: child._id,
      vDate: vDate,
      timeslot: timeslot,

      vcid: vc._id,
      vaccine,
      aStatus: "a",
    });

    appointment.save().then(res.status(201).send({ message: "OK" }));

    BookingEmail();
  }
};

export const Appointmentsperchild = async (req, res) => {
  // AppointmentStatus: "p",
  //           vc: null,
  //           DoneOn: null,
  const { pid } = req.body;

  const appointments = await Appointment.find({ pid });
  if (!appointments) return res.status(200).json({ appointments: [] });
  else {
    console.log("Reached here");
    const result = appointments.reduce((acc, curr) => {
      const { vid, cid, aStatus } = curr;
      if (acc[cid]) {
        acc[cid].push({ ["vid"]: { vid, aStatus } });
      } else {
        acc[cid] = [{ ["vid"]: { vid, aStatus } }];
      }
      return acc;
    }, {});
    console.log(result);
    return res.status(200).json({ astati: result });
  }
};

//Vaccine Center

//Vaccination Center Registrations
export const vcRegister = async (req, res) => {
  try {
    const {
      vcName,
      Email,
      vcPhone,
      vcOwnerName,
      address,
      userType,
      password,
      locationLat,
      locationLon,
    } = req.body;
    console.log(locationLat);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });

      // res.status(400).send("{ error: errors.array() }");
    } else {
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);
      const newUser = new VaccineCenter({
        vcName,
        Email,
        vcPhone,
        vcOwnerName,
        address,
        userType,
        locationLat,
        locationLon,

        password: passwordHash,
      });
      const userExists = await User.findOne({ Email: Email });
      if (userExists != null) {
        res.status(400).json({
          error: [
            {
              msg: "Email is already registered",
            },
          ],
        });
      } else {
        newUser.save().then(res.status(201).send({ message: "OK" }));
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Make a vaccine available at vaccinatoin center
export const addVCVaccine = async (req, res) => {
  try {
    const { _id, Email } = req.body;
    const errors = validationResult(req);
    console.log(_id, Email);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    } else {
      await VaccineCenter.updateOne(
        { Email: Email },
        { $push: { vaccines: _id } }
      );
      return res.status(201).send({ message: "Vaccine added successfully." });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
//Make a vaccine available at vaccinatoin center
export const removeVCVaccine = async (req, res) => {
  try {
    const { _id, Email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
    } else {
      // console.log(Email);
      await VaccineCenter.updateOne(
        { Email: Email },
        { $pull: { vaccines: _id } }
      );
      return res.status(201).send({ message: "OK" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//Manage Time Slots for Vaccination Center
export const VCTimeSlot = async (req, res) => {
  try {
    const { _id, timeslots } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ error: errors.array() });
    } else {
      {
        VaccineCenter.findOneAndUpdate(
          { _id },
          {
            timeslots: timeslots,
          },
          { new: true },
          (error, document) => {
            if (error) {
              console.log(error);
            } else {
              res.status(201).json(document);
            }
          }
        );
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const AppointmentsVC = async (req,res) =>{
//   // AppointmentStatus: "p",
//   //           vc: null,
//   //           DoneOn: null,
//       const {
//         vcid

//       }
//       =req.body;

//           const appointments = await Appointment.find({ vcid })
//           console.log(req.body)
//           if(!appointments) return res.status(201).json({"appointments":[]})
//           else{
//             const today=new Date();
//             const x=appointments.filter((item)=>{

//               const date1 = new Date(item.vDate);
//               const date2 = today;

//               if (date1.getDate() === date2.getDate() &&
//                   date1.getMonth() === date2.getMonth() &&
//                   date1.getFullYear() === date2.getFullYear()) {
//                 return item
//               } else {

//               }})

//               // console.log(Date(item.vDate),today)

//               // Date(item.vDate) == today})
//             console.log(x)
//             return res.status(201).json(x)
//           }

//     };

export const AppointmentsVC = async (req, res) => {
  try {
    const { cookies } = req;
    const token = cookies.token;
    const verifyToken = Jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({ _id: verifyToken._id, token: token });

    if (!user) throw new Error("User not found");
    else {
      const vcid = user._id;
      const appointments = await Appointment.find({ vcid });
      if (!appointments) return res.status(201).json({ appointments: [] });
      else {
        const today = new Date();
        const x = appointments.filter((item) => {
          const date1 = new Date(item.vDate);
          const date2 = today;

          if (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
          ) {
            return item;
          } else {
          }
        });

        res.status(201).json({ user: user, appointments: x });
      }
    }
  } catch (err) {
    res.status(401).send(err);
  }
};

export const AppointmentsDataVC = async (req, res) => {
  // AppointmentStatus: "p",
  //           vc: null,
  //           DoneOn: null,
  const { vcid } = req.body;

  const appointments = await Appointment.find({ vcid });
  console.log(req.body);
  if (!appointments) return res.status(201).json({ appointments: [] });

  // console.log(Date(item.vDate),today)

  // Date(item.vDate) == today})
  console.log(x);
  return res.status(201).json(x);
};

export const sendReminder = async (req, res) => {
  console.log("Starting Remider Email Task");
  let usersData;
  User.find({ userType: "p" }, (err, users) => {
    if (err) {
      console.log(err);
      return;
    }

    //console.log(users);
    usersData = users;
  });

  const appointments = await Appointment.find();

  try {
    usersData.forEach((element) => {
      //const parentEmail=element['Email']
      console.log(element);
    });
  } catch (err) {
    console.log(err);
  }
  // const csStudents = students.filter(student => student.major === "Computer Science");
};

export const adminReport = async (req, res) => {
  // AppointmentStatus: "p",
  //           vc: null,
  //           DoneOn: null,

  const users = await User.find();

  // if(!users) return res.status(201).json({"report":[]})

  const countP = () => {
    let count = 0;
    for (let i = 0; i < users.length; i++) {
      // Check if userType is 'p'
      if (users[i].userType === "p") {
        count++;
      }
    }
    return count;
  };

  const countVC = () => {
    let count = 0;
    for (let i = 0; i < users.length; i++) {
      // Check if userType is 'p'
      if (
        users[i].userType === "v" ||
        users[i].userType === "vu" ||
        users[i].userType === "vr" ||
        users[i].userType === "vrr"
      ) {
        count++;
      }
    }
    return count;
  };

  const countA = () => {
    let count = 0;
    for (let i = 0; i < users.length; i++) {
      // Check if userType is 'p'
      if (users[i].userType === "a") {
        count++;
      }
    }
    return count;
  };

  let nameCounts = {};
  const appointments = await Appointment.find();
  console.log(appointments);
  // Loop through each object in the array
  for (let i = 0; i < appointments.length; i++) {
    // Get the name from the current object
    let vName = appointments[i].vName;
    // If the name is not in the nameCounts object, initialize the count to 1
    if (!nameCounts[vName]) {
      nameCounts[vName] = 1;
    }
    // Otherwise, increment the count for the name
    else {
      nameCounts[vName]++;
    }
  }

  // Output the name counts
  console.log(nameCounts);
  // console.log(Date(item.vDate),today)

  // Date(item.vDate) == today})

  return res
    .status(201)
    .json({
      report: {
        adminCount: countA(),
        vcCount: countVC(),
        pCount: countP(),
        vaccineCount: nameCounts,
      },
    });
};


export const vcReport = async (req, res) => {
  // AppointmentStatus: "p",
  //           vc: null,
  //           DoneOn: null,


  // if(!users) return res.status(201).json({"report":[]})



  let nameCounts = {};
  const appointments = await Appointment.find({vid:vid});
  console.log(appointments);
  // Loop through each object in the array
  for (let i = 0; i < appointments.length; i++) {
    // Get the name from the current object
    let vName = appointments[i].vName;
    // If the name is not in the nameCounts object, initialize the count to 1
    if (!nameCounts[vName]) {
      nameCounts[vName] = 1;
    }
    // Otherwise, increment the count for the name
    else {
      nameCounts[vName]++;
    }
  }

  // Output the name counts
  console.log(nameCounts);
  // console.log(Date(item.vDate),today)

  // Date(item.vDate) == today})

  return res
    .status(201)
    .json({
      report: {

        vaccineCount: nameCounts,
      },
    });
};
