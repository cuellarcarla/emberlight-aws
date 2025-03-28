const express = require("express");
const AWS = require("aws-sdk");
const router = express.Router();

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const EXERCISES_TABLE = process.env.DYNAMODB_EXERCISES_TABLE;

// Create an exercise
router.post("/", async (req, res) => {
  try {
    const { id, name, duration, restTime, imageUrl, routineId } = req.body;

    const params = {
      TableName: EXERCISES_TABLE,
      Item: { id, name, duration, restTime, imageUrl, routineId },
    };

    await dynamoDB.put(params).promise();
    res.status(201).json({ message: "Exercise created", exercise: params.Item });
  } catch (error) {
    res.status(500).json({ error: "Error creating exercise" });
  }
});

// Get all exercises
router.get("/", async (req, res) => {
  try {
    const params = { TableName: EXERCISES_TABLE };
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (error) {
    res.status(500).json({ error: "Error fetching exercises" });
  }
});

// Get exercises by routine ID
router.get("/routine/:routineId", async (req, res) => {
  try {
    const params = {
      TableName: EXERCISES_TABLE,
      IndexName: "routineId-index", // Create a secondary index if necessary
      KeyConditionExpression: "routineId = :routineId",
      ExpressionAttributeValues: { ":routineId": req.params.routineId },
    };

    const data = await dynamoDB.query(params).promise();
    res.json(data.Items);
  } catch (error) {
    res.status(500).json({ error: "Error fetching exercises by routine" });
  }
});

module.exports = router;
