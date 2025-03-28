const express = require("express");
const AWS = require("aws-sdk");
const router = express.Router();

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const ROUTINES_TABLE = process.env.DYNAMODB_ROUTINES_TABLE;

// Create a routine
router.post("/", async (req, res) => {
  try {
    const { id, name, description, exerciseIds } = req.body;

    const params = {
      TableName: ROUTINES_TABLE,
      Item: { id, name, description, exerciseIds },
    };

    await dynamoDB.put(params).promise();
    res.status(201).json({ message: "Routine created", routine: params.Item });
  } catch (error) {
    res.status(500).json({ error: "Error creating routine" });
  }
});

// Get all routines
router.get("/", async (req, res) => {
  try {
    const params = { TableName: ROUTINES_TABLE };
    const data = await dynamoDB.scan(params).promise();
    res.json(data.Items);
  } catch (error) {
    res.status(500).json({ error: "Error fetching routines" });
  }
});

// Get a routine by ID
router.get("/:id", async (req, res) => {
  try {
    const params = {
      TableName: ROUTINES_TABLE,
      Key: { id: req.params.id },
    };

    const data = await dynamoDB.get(params).promise();
    if (!data.Item) return res.status(404).json({ error: "Routine not found" });

    res.json(data.Item);
  } catch (error) {
    res.status(500).json({ error: "Error fetching routine" });
  }
});

module.exports = router;
