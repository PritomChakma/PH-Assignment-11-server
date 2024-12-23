const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

const corsOption = {
  origin: ["http://localhost:5173"],
  credentials: true,
  optionalSuccessStatus: 200,
};

// middleware
app.use(cors(corsOption));
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

      // JWT
      app.post("/jwt", async (req, res) => {
        const email = req.body;
        const token = jwt.sign(email, process.env.SECRET_TOKEN, {
          expiresIn: "365d",
        });
        // console.log(token);
        res
          .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      });

      // clear cookie
      app.get("/logout", async (req, res) => {
        res
          .clearCookie("token", {
            maxAge: 0,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          })
          .send({ success: true });
      });

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

      app.put("/updatedPost/:id", async (req, res) => {
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
        const query = { _id: new ObjectId(request.postId) };
        const query2 = { email: request.email, postId: request.postId };

        try {
          const alreadyExist = await voulenteerCollection.findOne(query);
          const requestExist = await requestCollection.findOne(query2);


          if (requestExist) {
            return res
              .status(400)
              .send("You have already submitted for this volunteer post.");
          }

    
          if (parseInt(alreadyExist.noofvolunteer) === 0) {
            return res.status(400).send("No volunteers needed for this post.");
          }

          // Insert the request
          const inserted = await requestCollection.insertOne(request);

 
          const noOfV = parseInt(alreadyExist.noofvolunteer) - 1;
          const updateDocument = {
            $set: {
              noofvolunteer: noOfV,
            },
          };
          const updated = await voulenteerCollection.updateOne(
            query,
            updateDocument
          );

          res.send(updated);
        } catch (err) {
          console.error("Error processing volunteer request:", err);
          res.status(500).send("Server error occurred.");
        }
      });


      app.get("/request/:email", async (req, res) => {
        const email = req.params.email;
        try {
          // Find requests for the given email
          const result = await requestCollection.find({ email }).toArray();
          res.send(result);
        } catch (error) {
          console.error("Error fetching requests:", error);
          res.status(500).send("Failed to fetch requests");
        }
      });

      app.get("/vouleenter-request/:email", async (req, res) => {
        const isVolunteer = req.query.volunteer;
        console.log(isVolunteer);
        const email = req.params.email;
        let filter = {};
        if (isVolunteer) {
 
          filter.volunteer = email;
        } else {
  
          filter.email = email;
        }
        const result = await requestCollection.find(filter).toArray();
        res.send(result);
      });

    

      // update status
      app.patch("/reqStatus-update/:id", async (req, res) => {
        const id = req.params.id;
        const { status } = req.body;

        const filter = { _id: new ObjectId(id) };
        const updated = {
          $set: { status },
        };
        const result = await requestCollection.updateOne(filter, updated);
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
