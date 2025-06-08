import Fastify from "fastify";
import db from "./db.js";
import cors from "@fastify/cors";
const fastify = Fastify({ logger: true });
import yup from 'yup'
import multipart from '@fastify/multipart';
import fs from 'node:fs';
import path from 'path';
import { pipeline } from 'node:stream/promises';
import fastifyStatic from '@fastify/static';
import { nanoid } from 'nanoid'

const yupOptions = {
  strict: false,
  abortEarly: false,
  stripUnknown: true,
  recursive: true
}

await fastify.register(fastifyStatic, {
  root: path.join(process.cwd(), 'uploads'),
  prefix: '/uploads/',
});

await fastify.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

await fastify.register(db);

await fastify.register(multipart,{
  attachFieldsToBody: false,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const collection = fastify.mongo.db.collection("Users");
const blogCollection = fastify.mongo.db.collection("Blogs");
const tagCollection = fastify.mongo.db.collection("Tags");
const categoriesCollection = fastify.mongo.db.collection("Categories");

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Add createdAt to user schema
const userSchema = yup.object().shape({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  maidenName: yup.string().required("Maiden Name is required"),
  age: yup.number().positive().integer().required("Age is required"),
  gender: yup.string().required("Gender is required"),
  email: yup.string().email().required("Email is required"),
  phone: yup.string().required("Phone is required"),
  username: yup.string().required("Username is required"),
  password: yup.string().min(6).required("Password is required"),
  birthDate: yup.string().required("Birth Date is required"),
  image: yup.string(), 
  bloodGroup: yup.string().required("Blood Group is required"),
  height: yup.number().positive().required("Height is required"),
  weight: yup.number().positive().required("Weight is required"),
  eyeColor: yup.string().required("Eye Color is required"),
  hair: yup.object().shape({
    color: yup.string().required(),
    type: yup.string().required(),
  }).required(),
  domain: yup.string().required("Domain is required"),
  ip: yup.string().required("IP Address is required"),
  macAddress: yup.string().required("MAC Address is required"),
  university: yup.string().required("University is required"),
  address: yup.object().shape({
    address: yup.string().required(),
    city: yup.string().required(),
    state: yup.string().required(),
    postalCode: yup.string().required(),
    coordinates: yup.object().shape({
      lat: yup.number().required(),
      lng: yup.number().required(),
    }).required(),
  }).required(),
  bank: yup.object().shape({
    cardExpire: yup.string().required(),
    cardNumber: yup.string().required(),
    cardType: yup.string().required(),
    currency: yup.string().required(),
    iban: yup.string().required(),
  }).required(),
  company: yup.object().shape({
    department: yup.string().required(),
    name: yup.string().required(),
    title: yup.string().required(),
    address: yup.object().shape({
      address: yup.string().required(),
      city: yup.string().required(),
      state: yup.string().required(),
      postalCode: yup.string().required(),
      coordinates: yup.object().shape({
        lat: yup.number().required(),
        lng: yup.number().required(),
      }).required(),
    }).required(),
  }).required(),
  ein: yup.string().required("EIN is required"),
  ssn: yup.string().required("SSN is required"),
  userAgent: yup.string().required("User Agent is required"),
  crypto: yup.object().shape({
    coin: yup.string().required(),
    wallet: yup.string().required(),
    network: yup.string().required(),
  }).required(),
  role: yup.string().required("Role is required"),
  createdAt: yup.date().default(() => new Date()),
});

// User Analytics Endpoint
// fastify.get('/users/analytics', async (request, reply) => {
//   const { timeframe = 'day' } = request.query;

  

//   try {
//     const now = new Date();
//     let start;

//     if (timeframe === 'hour') {
//       start = new Date(now);
//       start.setHours(0, 0, 0, 0);
//     } else if (timeframe === 'day') {
//       start = new Date(now);
//       start.setDate(1);
//       start.setHours(0, 0, 0, 0);
//     } else if (timeframe === 'month') {
//       start = new Date(now.getFullYear(), 0, 1);
//     }

//     const groupBy = {
//       year: { $year: "$createdAt" },
//     };

//     if (timeframe === 'month') {
//       groupBy.month = { $month: "$createdAt" };
//     } else if (timeframe === 'day') {
//       groupBy.month = { $month: "$createdAt" };
//       groupBy.day = { $dayOfMonth: "$createdAt" };
//     } else if (timeframe === 'hour') {
//       groupBy.month = { $month: "$createdAt" };
//       groupBy.day = { $dayOfMonth: "$createdAt" };
//       groupBy.hour = { $hour: "$createdAt" };
//     }

//     const result = await collection.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: start }
//         }
//       },
//       {
//         $group: {
//         _id: {
//         year: { $year: { date: "$createdAt", timezone: "Asia/Kolkata" } },
//         month: { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } },
//         day: { $dayOfMonth: { date: "$createdAt", timezone: "Asia/Kolkata" } },
//         hour: { $hour: { date: "$createdAt", timezone: "Asia/Kolkata" } }
//       },
//       count: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           count: 1,
//           start: {
//             $dateFromParts: {
//               year: "$_id.year",
//               month: "$_id.month",
//               day: "$_id.day",
//               hour: "$_id.hour",
//               timezone: "Asia/Kolkata"
//             }
//           },
//           end: {
//             $dateAdd: {
//               startDate: {
//                 $dateFromParts: {
//                   year: "$_id.year",
//                   month: "$_id.month",
//                   day: "$_id.day",
//                   hour: "$_id.hour",
//                   timezone: "Asia/Kolkata"
//                 }
//               },
//               unit: "hour",
//               amount: 1,
//               timezone: "Asia/Kolkata"
//             }
//           }
//         }
//       },
//       {
//         $sort: { start: 1 }
//       }
//     ]).toArray();

//     reply.send(result);
//   } catch (err) {
//     console.error('Error:', err.message);
//     reply.status(500).send({ error: err.message });
//   }
// });

// fastify.get('/users/analytics', async (request, reply) => {
//   const { timeframe = 'day' } = request.query;

//   try {
//     const now = new Date();
//     let start;

//     if (timeframe === 'hour') {
//       start = new Date(now);
//       start.setHours(0, 0, 0, 0);
//     } else if (timeframe === 'day') {
//       start = new Date(now);
//       start.setDate(1);
//       start.setHours(0, 0, 0, 0);
//     } else if (timeframe === 'month') {
//       start = new Date(now.getFullYear(), 0, 1);
//     }

//     // 🎯 Dynamic group key
//     const groupId = {
//       year: { $year: { date: "$createdAt", timezone: "Asia/Kolkata" } }
//     };

//     if (timeframe === 'month') {
//       groupId.month = { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//     }

//     if (timeframe === 'day') {
//       groupId.month = { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//       groupId.day = { $dayOfMonth: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//     }

//     if (timeframe === 'hour') {
//       groupId.month = { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//       groupId.day = { $dayOfMonth: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//       groupId.hour = { $hour: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//     }

//     const result = await collection.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: start }
//         }
//       },
//       {
//         $group: {
//           _id: groupId,
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//          _id: 0,
//     count: 1,
//     timeframe: timeframe,
//           start: {
//             $switch: {
//               branches: [
//                 {
//                   case: { $eq: [timeframe, 'hour'] },
//                   then: {
//                     $dateFromParts: {
//                       year: "$_id.year",
//                       month: "$_id.month",
//                       day: "$_id.day",
//                       hour: "$_id.hour",
//                       timezone: "Asia/Kolkata"
//                     }
//                   }
//                 },
//                 {
//                   case: { $eq: [timeframe, 'day'] },
//                   then: {
//                     $dateFromParts: {
//                       year: "$_id.year",
//                       month: "$_id.month",
//                       day: "$_id.day",
//                       timezone: "Asia/Kolkata"
//                     }
//                   }
//                 },
//                 {
//                   case: { $eq: [timeframe, 'month'] },
//                   then: {
//                     $dateFromParts: {
//                       year: "$_id.year",
//                       month: "$_id.month",
//                       timezone: "Asia/Kolkata"
//                     }
//                   }
//                 }
//               ],
//               default: "$$REMOVE"
//             }
//           }
//         }
//       },
//       { $sort: { start: 1 } }
//     ]).toArray();

//     reply.send(result);
//   } catch (err) {
//     console.error('Error:', err.message);
//     reply.status(500).send({ error: err.message });
//   }
// });


// fastify.get('/users/analytics', async (request, reply) => {
//   const { timeframe = 'day' } = request.query;

//   try {
//     const now = new Date();
//     let start;

//     if (timeframe === 'hour') {
//       start = new Date(now);
//       start.setHours(0, 0, 0, 0);
//     } else if (timeframe === 'day') {
//       start = new Date(now);
//       start.setDate(1);
//       start.setHours(0, 0, 0, 0);
//     } else if (timeframe === 'month') {
//       start = new Date(now.getFullYear(), 0, 1);
//     }

//     const groupId = {
//       year: { $year: { date: "$createdAt", timezone: "Asia/Kolkata" } }
//     };

//     if (timeframe === 'month') {
//       groupId.month = { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//     }

//     if (timeframe === 'day') {
//       groupId.month = { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//       groupId.day = { $dayOfMonth: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//     }

//     if (timeframe === 'hour') {
//       groupId.month = { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//       groupId.day = { $dayOfMonth: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//       groupId.hour = { $hour: { date: "$createdAt", timezone: "Asia/Kolkata" } };
//     }

//     const result = await collection.aggregate([
//       {
//         $match: {
//           createdAt: { $gte: start }
//         }
//       },
//       {
//         $group: {
//           _id: groupId,
//           count: { $sum: 1 }
//         }
//       },
//       {
//         $project: {
//           _id: 0,
//           count: 1,
//           timeframe: timeframe,
//           start: {
//             $switch: {
//               branches: [
//                 {
//                   case: { $eq: [timeframe, 'hour'] },
//                   then: {
//                     $dateFromParts: {
//                       year: "$_id.year",
//                       month: "$_id.month",
//                       day: "$_id.day",
//                       hour: "$_id.hour",
//                       timezone: "Asia/Kolkata"
//                     }
//                   }
//                 },
//                 {
//                   case: { $eq: [timeframe, 'day'] },
//                   then: {
//                     $dateFromParts: {
//                       year: "$_id.year",
//                       month: "$_id.month",
//                       day: "$_id.day",
//                       timezone: "Asia/Kolkata"
//                     }
//                   }
//                 },
//                 {
//                   case: { $eq: [timeframe, 'month'] },
//                   then: {
//                     $dateFromParts: {
//                       year: "$_id.year",
//                       month: "$_id.month",
//                       timezone: "Asia/Kolkata"
//                     }
//                   }
//                 }
//               ],
//               default: "$$REMOVE"
//             }
//           },
//           end: {
//             $switch: {
//               branches: [
//                 {
//                   case: { $eq: [timeframe, 'hour'] },
//                   then: {
//                     $dateAdd: {
//                       startDate: {
//                         $dateFromParts: {
//                           year: "$_id.year",
//                           month: "$_id.month",
//                           day: "$_id.day",
//                           hour: "$_id.hour",
//                           timezone: "Asia/Kolkata"
//                         }
//                       },
//                       unit: "hour",
//                       amount: 1
//                     }
//                   }
//                 },
//                 {
//                   case: { $eq: [timeframe, 'day'] },
//                   then: {
//                     $dateAdd: {
//                       startDate: {
//                         $dateFromParts: {
//                           year: "$_id.year",
//                           month: "$_id.month",
//                           day: "$_id.day",
//                           timezone: "Asia/Kolkata"
//                         }
//                       },
//                       unit: "day",
//                       amount: 1
//                     }
//                   }
//                 },
//                 {
//                   case: { $eq: [timeframe, 'month'] },
//                   then: {
//                     $dateAdd: {
//                       startDate: {
//                         $dateFromParts: {
//                           year: "$_id.year",
//                           month: "$_id.month",
//                           timezone: "Asia/Kolkata"
//                         }
//                       },
//                       unit: "month",
//                       amount: 1
//                     }
//                   }
//                 }
//               ],
//               default: "$$REMOVE"
//             }
//           }
//         }
//       },
//       { $sort: { start: 1 } }
//     ]).toArray();

//     reply.send(result);
//   } catch (err) {
//     console.error('Error:', err.message);
//     reply.status(500).send({ error: err.message });
//   }
// });


fastify.get('/users/analytics', async (request, reply) => {
  const { timeframe = 'day' } = request.query;

  try {
    const now = new Date();
    let start;

    if (timeframe === 'hour') {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
    } else if (timeframe === 'day') {
      start = new Date(now);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (timeframe === 'month') {
      start = new Date(now.getFullYear(), 0, 1);
    }

    // Dynamic group _id parts based on timeframe
    const groupId = {
      year: { $year: { date: "$createdAt", timezone: "Asia/Kolkata" } }
    };
    if (timeframe === 'month' || timeframe === 'day' || timeframe === 'hour') {
      groupId.month = { $month: { date: "$createdAt", timezone: "Asia/Kolkata" } };
    }
    if (timeframe === 'day' || timeframe === 'hour') {
      groupId.day = { $dayOfMonth: { date: "$createdAt", timezone: "Asia/Kolkata" } };
    }
    if (timeframe === 'hour') {
      groupId.hour = { $hour: { date: "$createdAt", timezone: "Asia/Kolkata" } };
    }

    const result = await collection.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: groupId,
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          count: 1,
          timeframe,
          start: {
            $switch: {
              branches: [
                {
                  case: { $eq: [timeframe, 'hour'] },
                  then: {
                    $dateFromParts: {
                      year: "$_id.year",
                      month: "$_id.month",
                      day: "$_id.day",
                      hour: "$_id.hour",
                      timezone: "Asia/Kolkata"
                    }
                  }
                },
                {
                  case: { $eq: [timeframe, 'day'] },
                  then: {
                    $dateFromParts: {
                      year: "$_id.year",
                      month: "$_id.month",
                      day: "$_id.day",
                      timezone: "Asia/Kolkata"
                    }
                  }
                },
                {
                  case: { $eq: [timeframe, 'month'] },
                  then: {
                    $dateFromParts: {
                      year: "$_id.year",
                      month: "$_id.month",
                      timezone: "Asia/Kolkata"
                    }
                  }
                }
              ],
              default: "$$REMOVE"
            }
          },
          end: {
            $switch: {
              branches: [
                {
                  case: { $eq: [timeframe, 'hour'] },
                  then: {
                    $dateAdd: {
                      startDate: {
                        $dateFromParts: {
                          year: "$_id.year",
                          month: "$_id.month",
                          day: "$_id.day",
                          hour: "$_id.hour",
                          timezone: "Asia/Kolkata"
                        }
                      },
                      unit: "hour",
                      amount: 1
                    }
                  }
                },
                {
                  case: { $eq: [timeframe, 'day'] },
                  then: {
                    $dateAdd: {
                      startDate: {
                        $dateFromParts: {
                          year: "$_id.year",
                          month: "$_id.month",
                          day: "$_id.day",
                          timezone: "Asia/Kolkata"
                        }
                      },
                      unit: "day",
                      amount: 1
                    }
                  }
                },
                {
                  case: { $eq: [timeframe, 'month'] },
                  then: {
                    $dateAdd: {
                      startDate: {
                        $dateFromParts: {
                          year: "$_id.year",
                          month: "$_id.month",
                          timezone: "Asia/Kolkata"
                        }
                      },
                      unit: "month",
                      amount: 1
                    }
                  }
                }
              ],
              default: "$$REMOVE"
            }
          }
        }
      },
      { $sort: { start: 1 } }
    ]).toArray();

    reply.send(result);

  } catch (err) {
    console.error('Error:', err.message);
    reply.status(500).send({ error: err.message });
  }
});


fastify.get("/", async (request, reply) => {
  try {
    const blogs = await collection.find().toArray();
    return reply.status(200).send(blogs);
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});



// Updated User Creation
fastify.post("/create", async (request, reply) => {
  const data = {};
  let imageFilename = null;

  const parts = request.parts();

  for await (const part of parts) {
    if (part.file) {
      imageFilename = `${Date.now()}-${part.filename}`;
      const filePath = path.join(uploadDir, imageFilename);
      await pipeline(part.file, fs.createWriteStream(filePath));
    } else if (part.fieldname === 'data') {
      try {
        Object.assign(data, JSON.parse(part.value));
      } catch (err) {
        return reply.status(400).send({ error: "Invalid JSON data" });
      }
    }
  }

  // ✅ If image was uploaded, set full image URL
  if (imageFilename) {
    data.image = `http://localhost:3000/uploads/${imageFilename}`;
  }

  try {
    // ✅ Add createdAt field explicitly (yup default doesn't work here)
    data.createdAt = new Date();

    // ✅ Validate using Yup
    const validated = await userSchema.validate(data, {
      abortEarly: false,
      stripUnknown: true, // extra safety
    });

    // ✅ Insert to MongoDB
    const result = await collection.insertOne(validated);

    return reply.status(201).send(result);
  } catch (err) {
    return reply.status(400).send({ errors: err.errors || err.message });
  }
});

// fastify.get('/users/filter', async (request, reply) => {
//   try {
//     const { start, end } = request.query;
    
//     const users = await collection.find({
//       createdAt: { 
//         $gte: new Date(start),
//         $lt: new Date(end)
//       }
//     }).toArray();

//     reply.send(users);
//   } catch (err) {
//     reply.status(500).send({ error: err.message });
//   }
// });


// fastify.get('/users/filter', async (request, reply) => {
//   try {
//     const { start, end } = request.query;

//     console.log('FILTER START:', start);
//     console.log('FILTER END:', end);

//     const startDate = new Date(start);
//     const endDate = new Date(end);

//     if (isNaN(startDate) || isNaN(endDate)) {
//       return reply.status(400).send({ error: "Invalid date format" });
//     }

//     const users = await collection.find({
//       createdAt: {
//         $gte: startDate,
//         $lt: endDate
//       }
//     }).toArray();

//     reply.send(users);
//   } catch (err) {
//     reply.status(500).send({ error: err.message });
//   }
// });



// fastify.get('/users/filter', async (request, reply) => {
//   try {
//     const { start, end } = request.query;
    
//     console.log('Received filter request with:');
//     console.log('Start:', start);
//     console.log('End:', end);

//     const startDate = new Date(start);
//     const endDate = new Date(end);

//     if (isNaN(startDate) || isNaN(endDate)) {
//       console.error('Invalid date format received');
//       return reply.status(400).send({ error: "Invalid date format" });
//     }

//     console.log('Converted dates:');
//     console.log('Start:', startDate);
//     console.log('End:', endDate);

//     const users = await collection.find({
//       createdAt: {
//         $gte: startDate,
//         $lt: endDate
//       }
//     }).toArray();

//     console.log(`Found ${users.length} users in this range`);
    
//     reply.send(users);
//   } catch (err) {
//     console.error('Filter error:', err);
//     reply.status(500).send({ error: err.message });
//   }
// });

// fastify.get('/users/filter', async (request, reply) => {
//   try {
//     const { start, end } = request.query;

//     const toIST = (dateStr) => {
//       const utcDate = new Date(dateStr);
//       return new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000); // Add 5.5 hrs
//     };

//     const startDate = toIST(start);
//     const endDate = toIST(end);

//     if (isNaN(startDate) || isNaN(endDate)) {
//       console.error('Invalid date format received');
//       return reply.status(400).send({ error: "Invalid date format" });
//     }

//     const users = await collection.find({
//       createdAt: {
//         $gte: startDate,
//         $lte: endDate
//       }
//     }).toArray();

//     console.log(`Found ${users.length} users in this range`);
//     reply.send(users);
//   } catch (err) {
//     console.error('Filter error:', err);
//     reply.status(500).send({ error: err.message });
//   }
// });

// fastify.get('/users/filter', async (request, reply) => {
//   const { start, end } = request.query;

//   if (!start || !end) {
//     return reply.status(400).send({ error: "Start and end are required" });
//   }

//   try {
//     const users = await collection.find({
//       createdAt: {
//         $gte: new Date(start),
//         $lt: new Date(end)
//       }
//     }).toArray();

//     reply.send(users);
//   } catch (err) {
//     console.error("Error filtering users:", err.message);
//     reply.status(500).send({ error: err.message });
//   }
// });

// fastify.get('/users/filter', async (request, reply) => {
//   const { start, end } = request.query;

//   if (!start || !end) {
//     return reply.status(400).send({ error: "Start and end are required" });
//   }

//   try {
//     const users = await collection.find({
//       createdAt: {
//         $gte: new Date(start),
//         $lt: new Date(end)
//       }
//     }).toArray();

//     reply.send(users);
//   } catch (err) {
//     console.error("Error filtering users:", err.message);
//     reply.status(500).send({ error: err.message });
//   }
// });

fastify.get('/users/filter', async (request, reply) => {
  const { start, end } = request.query;

  if (!start || !end) {
    return reply.status(400).send({ error: "start and end query parameters required" });
  }

  try {
    const startDate = new Date(start);
    const endDate = new Date(end);

    const filteredUsers = await collection.find({
      createdAt: {
        $gte: startDate,
        $lt: endDate
      }
    }).toArray();

    reply.send(filteredUsers);

  } catch (err) {
    console.error('Error filtering users:', err.message);
    reply.status(500).send({ error: err.message });
  }
});






fastify.get("/user/:userId", async (request, reply) => {
  const { userId } = request.params;
  
  try {
    // 1. Get user details
    const user = await collection.findOne({
      _id: new fastify.mongo.ObjectId(userId),
    });
    
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    // 2. Get user's blogs
    const blogs = await blogCollection.find({
      author: new fastify.mongo.ObjectId(userId)
    }).toArray();

    return reply.status(200).send({
      ...user,
      blogsCount: blogs.length,
      blogs: blogs // Optional: include full blog data if needed
    });
  } catch (err) {
    console.error("Error fetching user:", err);
    return reply.status(500).send({ error: "Internal server error" });
  }
});

fastify.get("/users/:userId/blogs", async (request, reply) => {
  const { userId } = request.params;
  
  try {
    const blogs = await blogCollection.find({
      author: new fastify.mongo.ObjectId(userId)
    }).toArray();

    return reply.status(200).send(blogs);
  } catch (err) {
    console.error("Error fetching user blogs:", err);
    return reply.status(500).send({ error: "Internal server error" });
  }
});

fastify.put("/user/:userId", async (request, reply) => {
  const { userId } = request.params;
  const data = {};
  let imageFilename = null;

  const parts = request.parts();
  for await (const part of parts) {
    if (part.file) {
      imageFilename = `${Date.now()}-${part.filename}`;
      const filePath = path.join(uploadDir, imageFilename);
      await pipeline(part.file, fs.createWriteStream(filePath));
    } else if (part.fieldname === 'data') {
      try {
        Object.assign(data, JSON.parse(part.value));
      } catch (err) {
        return reply.status(400).send({ error: "Invalid JSON data" });
      }
    }
  }

  if (imageFilename) {
    data.image = `http://localhost:3000/uploads/${imageFilename}`;
  }

  try {
    const validated = opt.schema.body.validateSync(data, {
      strict: false,
      abortEarly: false,
      stripUnknown: true
    });

    const result = await collection.updateOne(
      { _id: new fastify.mongo.ObjectId(userId) },
      { $set: validated }
    );

    if (result.modifiedCount === 0) {
      return reply.status(404).send({ message: "User not found or no changes made" });
    }
    return reply.status(200).send({ message: "User updated successfully" });
  } catch (err) {
    console.error("Update error:", err);
    return reply.status(400).send({ errors: err.errors || err.message });
  }
});


fastify.delete("/user/:userId", async (request, reply) => {
  const { userId } = request.params;
  
  try {
    const result = await collection.deleteOne({
      _id: new fastify.mongo.ObjectId(userId)
    });

    if (result.deletedCount === 0) {
      return reply.status(404).send({ message: "User not found" });
    }
    return reply.status(200).send({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    return reply.status(500).send({ error: "Internal server error" });
  }
});



// Blog Routes
fastify.get("/blogs", async (request, reply) => {
  try {
    const blogs = await blogCollection.find().toArray();
    return reply.status(200).send(blogs);
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});

fastify.post("/blogs", async (request, reply) => {
  const blog = {};
  let imageFilename = null;
  let userId = null; // To store the user ID

  const parts = request.parts();
  for await (const part of parts) {
    if (part.file) {
      imageFilename = `${Date.now()}-${part.filename}`;
      const filePath = path.join(uploadDir, imageFilename);
      await pipeline(part.file, fs.createWriteStream(filePath));
    } else if (part.fieldname === 'userId') {
      // Capture the user ID from form data
      userId = part.value;
    } else if (part.fieldname === "tags") {
      try {
        blog.tags = JSON.parse(part.value);
      } catch {
        blog.tags = part.value;
      }
    } else {
      if (part.fieldname !== 'author') { // Ignore incoming author full name
        blog[part.fieldname] = part.value;
      }
    }
  }

  if (imageFilename) {
    blog.image = `http://localhost:3000/uploads/${imageFilename}`;
  }

  blog.createdAt = new Date();
  blog.updatedAt = new Date();

  try {
    // 1. First create the blog
    const result = await blogCollection.insertOne({
      ...blog,
      author: new fastify.mongo.ObjectId(userId), // Store user reference
    });

    // 2. Update user's blogs array (if user exists)
    if (userId) {
      await collection.updateOne(
        { _id: new fastify.mongo.ObjectId(userId) },
        { $push: { blogs: result.insertedId } }
      );
    }

    return reply.status(201).send({ 
      data: { ...blog, _id: result.insertedId },
      message: "Blog created successfully" 
    });
  } catch (err) {
    console.error("Blog creation error:", err);
    return reply.status(500).send({ error: err.message });
  }
});

fastify.put("/blogs/:blogId", async (request, reply) => {
  const { blogId } = request.params;
  const updatedData = {};
  let imageFilename = null;

  const parts = request.parts();
  for await (const part of parts) {
    if (part.file) {
      imageFilename = `${Date.now()}-${part.filename}`;
      const filePath = path.join(uploadDir, imageFilename);
      await pipeline(part.file, fs.createWriteStream(filePath));
    } else {
      updatedData[part.fieldname] = part.value;
    }
  }

  if (imageFilename) {
    updatedData.image = `http://localhost:3000/uploads/${imageFilename}`;
  }

  // 🕒 Update timestamp
  updatedData.updatedAt = new Date();

  try {
    const result = await blogCollection.updateOne(
      { _id: new fastify.mongo.ObjectId(blogId) },
      { $set: updatedData }
    );

    if (result.matchedCount === 0) {
      return reply.status(404).send({ message: "Blog not found" });
    }

    return reply.status(200).send({ message: "Blog updated successfully" });
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});


fastify.get("/blogs/:blogId", async (request, reply) => {
  const { blogId } = request.params;

  try {
    const blog = await blogCollection.findOne({
      _id: new fastify.mongo.ObjectId(blogId),
    });

    if (!blog) {
      return reply.status(404).send({ message: "Blog not found" });
    }

    return reply.status(200).send(blog);
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});

fastify.delete("/blogs/:blogId", async (request, reply) => {
  const { blogId } = request.params;

  try {
    const result = await blogCollection.deleteOne({
      _id: new fastify.mongo.ObjectId(blogId),
    });

    if (result.deletedCount === 0) {
      return reply.status(404).send({ message: "Blog not found" });
    }

    return reply.status(200).send({ message: "Blog deleted successfully" });
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});


// Tag Routes
fastify.get("/tags", async (request, reply) => {
  try {
    const tags = await tagCollection.find().toArray();
    return reply.status(200).send(tags);
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
})

fastify.post("/tags", async (request, reply) => {
  const { tagName } = request.body;
  if (!tagName) {
    return reply.status(400).send({ message: "Tag name is required" });
  }

  try {
    const result = await tagCollection.insertOne({ tagName });
    return reply.status(201).send({ message: "Tag created", result });
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
})

fastify.get("/tags/:tagId", async (request, reply) => {
  const { tagId } = request.params;

  try {
    const tag = await tagCollection.findOne({
      _id: new fastify.mongo.ObjectId(tagId),
    });

    if (!tag) {
      return reply.status(404).send({ message: "Tag not found" });
    }

    return reply.status(200).send(tag);
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
})

fastify.put("/tags/:tagId", async (request, reply) => {
  const { tagId } = request.params;
  const { tagName } = request.body;

  if (!tagName) {
    return reply.status(400).send({ message: "Tag name is required" });
  }

  try {
    const result = await tagCollection.updateOne(
      { _id: new fastify.mongo.ObjectId(tagId) },
      { $set: { tagName } }
    );

    if (result.matchedCount === 0) {
      return reply.status(404).send({ message: "Tag not found" });
    }

    return reply.status(200).send({ message: "Tag updated successfully" });
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});


fastify.delete("/tags/:tagId", async (request, reply) => {
  const { tagId } = request.params;

  try {
    const result = await tagCollection.deleteOne({
      _id: new fastify.mongo.ObjectId(tagId),
    });

    if (result.deletedCount === 0) {
      return reply.status(404).send({ message: "Tag not found" });
    }

    return reply.status(200).send({ message: "Tag deleted successfully" });
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});

// Category Routes
fastify.get("/categories", async (request, reply) => {
  try {
    const tags = await categoriesCollection.find().toArray();
    return reply.status(200).send(tags);
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
})

fastify.post("/categories", async (request, reply) => {
  const { categoryName } = request.body;
  try{
    const categories = await categoriesCollection.insertOne({categoryName})
    return reply.status(200).send({ data: categories,message: "Category created", categories})
  }
  catch(err){
    return reply.status(500).send({error: err.message})
  }
})

fastify.get("/categories/:categoryId", async (request, reply) => {
  const { categoryId } = request.params;

  try {
    const category = await categoriesCollection.findOne({
      _id: new fastify.mongo.ObjectId(categoryId),
    });

    if (!category) {
      return reply.status(404).send({ message: "Category not found" });
    }

    return reply.status(200).send(category);
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
})

fastify.put("/categories/:categoryId", async (request, reply) => {
  const { categoryId } = request.params;
  const { categoryName } = request.body;

  if (!categoryName) {
    return reply.status(400).send({ message: "Category name is required" });
  }

  try {
    const result = await categoriesCollection.updateOne(
      { _id: new fastify.mongo.ObjectId(categoryId) },
      { $set: { categoryName } }
    );

    if (result.matchedCount === 0) {
      return reply.status(404).send({ message: "Category not found" });
    }

    return reply.status(200).send({ message: "Category updated successfully" });
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});

fastify.delete("/categories/:categoryId", async (request, reply) => {
  const { categoryId } = request.params;

  try {
    const result = await categoriesCollection.deleteOne({
      _id: new fastify.mongo.ObjectId(categoryId),
    });

    if (result.deletedCount === 0) {
      return reply.status(404).send({ message: "Category not found" });
    }

    return reply.status(200).send({ message: "Category deleted successfully" });
  } catch (err) {
    return reply.status(500).send({ error: err.message });
  }
});

fastify.get('/api/users/count', async (request, reply) => {
  try {
    const count = await collection.countDocuments();
    return reply.send({ count });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

fastify.get('/api/blogs/count', async (request, reply) => {
  try {
    const count = await blogCollection.countDocuments();
    return reply.send({ count });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

fastify.get('/api/tags/count', async (request, reply) => {
  try {
    const count = await tagCollection.countDocuments();
    return reply.send({ count });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});

fastify.get('/api/categories/count', async (request, reply) => {
  try {
    const count = await categoriesCollection.countDocuments();
    return reply.send({ count });
  } catch (err) {
    reply.status(500).send({ error: err.message });
  }
});



fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at http://localhost:3000`);
});

