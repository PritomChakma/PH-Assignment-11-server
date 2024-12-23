const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

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
      const requestCollection = db.collection("request");

      app.post("/add-post", async (req, res) => {
        const data = req.body;
        console.log(data);
        const result = await voulenteerCollection.insertOne(data);
        res.send(result);
      });

      app.get("/all-volunteer", async (req, res) => {
        const search = req.query.title;
        try {
          const query = search
            ? { title: { $regex: search, $options: "i" } }
            : {};
          const result = await voulenteerCollection.find(query).toArray();
          res.send(result);
        } catch (error) {
          console.error("Error fetching volunteers:", error);
          res.status(500).send("Server error");
        }
      });

      app.get("/post/:email", async (req, res) => {
        const email = req.params.email;
        const filter = {
          "volunteer.email": email,
        };
        const result = await voulenteerCollection.find(filter).toArray();
        res.send(result);
      });

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

      app.post("/add-request", async (req, res) => {
        const request = req.body;

        const query = { email: request.email, requestId: request.requestId };
        const alreadyExist = await requestCollection.findOne(query);
        if (alreadyExist) {
          return res
            .status(400)
            .send("You are already submit on this volunteer");
        }
        console.log(request);
        const result = await requestCollection.insertOne(request);
        const filter = { _id: new ObjectId(request.requestId) };
        const update = {
          $inc: { noofvolunteer: -1 },
        };
        const updateRequest = await voulenteerCollection.updateOne(
          filter,
          update
        );
        console.log(updateRequest);
        res.send(result);
      });

      await client.connect();
      console.log("Connected to MongoDB successfully!");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  }
  run().catch(console.dir);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
run().catch(console.dir);
