const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors());
app.use(express.json());
// app.use(cookieParser());

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dtzgzoe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const conn = await client.connect();
    // DB Collections
    const foodsCollection = conn
      .db("foodie-biteDB")
      .collection("foodsCollection");

    const orderCollection = conn
      .db("foodie-biteDB")
      .collection("ordersCollection");

    app.get("/api/foods", async (req, res) => {
      try {
        const query = req.query.search;
        let products;

        if (query) {
          products = await foodsCollection
            .find({
              $or: [
                { FoodName: { $regex: query, $options: "i" } },
                { RestaurantName: { $regex: query, $options: "i" } },
              ],
            })
            .toArray();
        } else {
          products = await foodsCollection.find().toArray();
        }
        res.send(products);
      } catch (error) {
        console.error("Error occurred during search:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    // app.get("/api/foods", async (req, res) => {
    //   const query = req.query.search;
    //   const products = await foodsCollection.find(query).toArray();
    //   if (query) {
    //     const filteredProducts = products.filter((product) =>
    //       product.FoodName.includes(query)
    //     );
    //     res.send(filteredProducts);
    //     return;
    //   }

    //   setTimeout(() => {
    //     res.send(products);
    //   }, 3000);
    // });

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

app.get("/", async (req, res) => {
  res.send("Server started and running");
});

app.listen(port);
