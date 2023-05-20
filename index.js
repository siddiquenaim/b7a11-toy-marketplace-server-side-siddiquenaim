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
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect((err) => {
      if (err) {
        console.error(err);
        return;
      }
    });

    const toysCollection = client.db("toyMarket").collection("toys");
    const imageCollection = client.db("toyMarket").collection("gallery");
    // const indexKeys = { name: 1 };
    // const indexOptions = { name: "toyName" };
    // const result = await toysCollection.createIndex(indexKeys, indexOptions);

    // all data
    app.get("/allData", async (req, res) => {
      const result = await toysCollection.find().toArray();
      res.send(result);
    });

    // filtering by subcategory
    app.get("/allData/:text", async (req, res) => {
      // console.log(req.params.text);
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

    // adding new data to all data
    app.post("/allData", async (req, res) => {
      const toyInfo = req.body;
      // console.log(toyInfo);
      const result = await toysCollection.insertOne(toyInfo);
      res.send(result);
    });

    // search feature
    app.get("/toySearch", async (req, res) => {
      const searchText = req.query.text;
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

    // app.get("/toySearchByName/:text", async (req, res) => {
    //   const searchText = req.params.text;
    //   const result = await toysCollection
    //     .find({
    //       $or: [
    //         {
    //           name: { $regex: searchText, $options: "i" },
    //         },
    //       ],
    //     })
    //     .toArray();
    //   res.send(result);
    // });

    // single toy information
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.findOne(query);
      res.send(result);
    });

    // limiting number of toys
    app.get("/toys", async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const toys = await toysCollection.find().limit(limit).toArray();
      res.json(toys);
    });

    // filtering toys added by user
    app.get("/myToys", async (req, res) => {
      let query = {};
      if (req.query.sellerEmail) {
        query = { sellerEmail: req.query.sellerEmail };
      }
      const result = await toysCollection.find(query).toArray();
      res.send(result);
    });

    // update toy information
    app.patch("/updateToy/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = {
        $set: {
          price: body.price,
          availableQuantity: body.availableQuantity,
          details: body.details,
        },
      };
      const result = await toysCollection.updateOne(filter, updatedToy);
      res.send(result);
      console.log(updatedToy);
    });

    // delete operation
    app.delete("/myToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toysCollection.deleteOne(query);
      res.send(result);
    });

    // gallery pictures
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
