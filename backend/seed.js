/*require("dotenv").config();
const mongoose = require('mongoose');
const Exercise = require('./models/Exercise');  // Path to your Exercise model
const Routine = require('./models/Routine');  // Path to your Routine model

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Delete existing data (optional)
    await Exercise.deleteMany({});
    await Routine.deleteMany({});

    // 1. Insert Exercises (Mock Data)
    const exercises = [
      { name: "Push-Up", duration: 30, restTime: 15, imageUrl: "http://example.com/images/pushup.jpg" },
      { name: "Squat", duration: 30, restTime: 15, imageUrl: "http://example.com/images/squat.jpg" },
      { name: "Plank", duration: 60, restTime: 20, imageUrl: "http://example.com/images/plank.jpg" }
    ];

    const createdExercises = await Exercise.insertMany(exercises);
    console.log(`Inserted ${createdExercises.length} exercises.`);

    // 2. Create Routine and add references to exercises
    const routine = new Routine({
      name: "Full Body Routine",
      description: "A comprehensive workout routine for the whole body.",
      exercises: createdExercises.map(exercise => exercise._id)  // Add exercise IDs
    });

    await routine.save();
    console.log("Routine created and exercises added.");

    // Close the connection
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
    mongoose.connection.close();
  });*/

  require("dotenv").config();
  const AWS = require("aws-sdk");
  
  // Configure AWS SDK for DynamoDB
  AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: process.env.AWS_SESSION_TOKEN,
  });
  
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  const EXERCISES_TABLE = process.env.DYNAMODB_EXERCISES_TABLE;
  const ROUTINES_TABLE = process.env.DYNAMODB_ROUTINES_TABLE;
  
  // Function to delete all items from a DynamoDB table
  const deleteAllItems = async (tableName) => {
    try {
      const scanParams = { TableName: tableName };
      const data = await dynamoDB.scan(scanParams).promise();
  
      if (data.Items.length > 0) {
        const deleteRequests = data.Items.map((item) => ({
          DeleteRequest: { Key: { id: item.id } },
        }));
  
        while (deleteRequests.length) {
          const batchParams = {
            RequestItems: { [tableName]: deleteRequests.splice(0, 25) }, // DynamoDB allows 25 items per batchWrite
          };
          await dynamoDB.batchWrite(batchParams).promise();
        }
        console.log(`Deleted all items from ${tableName}`);
      }
    } catch (error) {
      console.error(`Error deleting items from ${tableName}:`, error);
    }
  };
  
  // Function to seed data
  const seedDatabase = async () => {
    try {
      console.log("Seeding DynamoDB...");
  
      // Delete existing data
      await deleteAllItems(EXERCISES_TABLE);
      await deleteAllItems(ROUTINES_TABLE);
  
      // Define exercises
      const exercises = [
        { id: "1", name: "Push-Up", duration: 30, restTime: 15, imageUrl: "http://example.com/images/pushup.jpg", routineId: "101" },
        { id: "2", name: "Squat", duration: 30, restTime: 15, imageUrl: "http://example.com/images/squat.jpg", routineId: "101" },
        { id: "3", name: "Plank", duration: 60, restTime: 20, imageUrl: "http://example.com/images/plank.jpg", routineId: "101" },
      ];
  
      // Batch write exercises
      while (exercises.length) {
        const batchParams = {
          RequestItems: {
            [EXERCISES_TABLE]: exercises.splice(0, 25).map((e) => ({ PutRequest: { Item: e } })),
          },
        };
        await dynamoDB.batchWrite(batchParams).promise();
      }
      console.log("Inserted exercises.");
  
      // Create routine referencing exercises
      const routine = {
        id: "101",
        name: "Full Body Routine",
        description: "A comprehensive workout routine for the whole body.",
        exercises: ["1", "2", "3"], // Store exercise IDs
      };
  
      await dynamoDB.put({ TableName: ROUTINES_TABLE, Item: routine }).promise();
      console.log("Inserted routine.");
  
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  };
  
  // Run the function
  seedDatabase();
  