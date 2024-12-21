const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// VolunteerManagement
// hkLIWYSeOICyIWuZ

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nzorc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  async function run() {
    try {
      const db = client.db("voulenteer-db");
      const voulenteerCollection = db.collection("voulenteer");

      // Save data to Voulenteer
      app.post("/add-post", async (req, res) => {
        const data = req.body;
        console.log(data);
        const result = await voulenteerCollection.insertOne(data);
        res.send(result);
      });

      //   get data from db
      app.get("/all-volunteer", async (req, res) => {
        const result = await voulenteerCollection.find().toArray();
        res.send(result);
      });

      //   get post for specific user
      app.get("/post/:email", async (req, res) => {
        const email = req.params.email;
        const filter = {
          "volunteer.email": email,
        };
        const result = await voulenteerCollection.find(filter).toArray();
        res.send(result);
      });

      //   delete
      app.delete("/post/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await voulenteerCollection.deleteOne(query);
        res.send(result);
      });

      app.get("/update/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const result = await voulenteerCollection.findOne(query);
        res.send(result);
      });
      // update on data
      app.put("/updatedJob/:id", async (req, res) => {
        const id = req.params.id;
        const data = req.body;
        const query = { _id: new ObjectId(id) };
        const updated = {
          $set: data,
        };
        const options = { upsert: true };
        const result = await voulenteerCollection.updateOne(
          query,
          updated,
          options
        );
        res.send(result);
      });

      await client.connect();
      console.log("Connected to MongoDB successfully!");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }
  run().catch(console.dir);

  // Keep the server running
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
run().catch(console.dir);
