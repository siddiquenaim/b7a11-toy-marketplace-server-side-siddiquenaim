const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zilkyvq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toysCollection = client.db("toyMarket").collection("toys");
    const imageCollection = client.db("toyMarket").collection("gallery");
    const indexKeys = { name: 1 };
    const indexOptions = { name: "toyName" };
    const result = await toysCollection.createIndex(indexKeys, indexOptions);

    app.get("/allData", async (req, res) => {
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    app.post("/allData", async (req, res) => {
      const toyInfo = req.body;
      // console.log(toyInfo);
      const result = await toysCollection.insertOne(toyInfo);
      res.send(result);
    });

    app.get("/allData/:text", async (req, res) => {
      console.log(req.params.text);
      if (
        req.params.text == "lego-cars" ||
        req.params.text == "lego-city" ||
        req.params.text == "lego-architecture"
      ) {
        result = await toysCollection
          .find({ subcategory: req.params.text })
          .toArray();
        return res.send(result);
      }
      result = await toysCollection.find().toArray();
      res.send(result);
    });

    app.get("/toySearchByName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await toysCollection
        .find({
          $or: [
            {
              name: { $regex: searchText, $options: "i" },
            },
          ],
        })
        .toArray();
      res.send(result);
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    app.get("/toys", async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const toys = await toysCollection.find().limit(limit).toArray();
      res.json(toys);
    });

    app.get("/gallery", async (req, res) => {
      const result = await imageCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The server is running");
});

app.listen(port, (req, res) => {
  console.log(`The server is running on port: ${port}`);
});

// toyMarket
// gJdJZBP6RJAOnNYL
