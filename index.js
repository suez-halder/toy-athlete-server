const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pufeqid.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    const toyCollection = client.db("toysDB").collection("toys");

    app.get('/allToys', async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      // console.log(limit)
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
        const result = await toyCollection.find(query).toArray();
        res.send(result);
      }
      else {
        const result = await toyCollection.find().limit(limit).toArray();
        res.send(result);

      }
    })


    app.get('/allToys/:text', async (req, res) => {
      const text = req.params.text;
      const query = { toyName: text };
      const result = await toyCollection.find(query).toArray();
      res.send(result);

    })


    // filter route
    app.get('/myToys/:filter', async (req, res) => {
      const filter = req.params.filter;
      const query = { email: req.query.email }
      if (filter === 'high') {
        const result = await toyCollection.find(query).sort({ price: 1 }).toArray();
        res.send(result);
      } else if (filter === 'low') {
        const result = await toyCollection.find(query).sort({ price: -1 }).toArray();
        res.send(result);
      }
    });


    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);
      res.send(result)
    })

    app.post('/addToy', async (req, res) => {
      const newToy = req.body;
      const result = await toyCollection.insertOne(newToy);
      res.send(result)
    })

    app.put('/editToy/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description
        }
      }

      res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin (replace '*' with the specific origin if needed)
      res.setHeader('Access-Control-Allow-Methods', 'PUT'); // Allow the PUT method
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow the 'Content-Type' header

      try {
        const result = await toyCollection.updateOne(filter, toy, options);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: 'An error occurred while updating the toy.' });
      }
    });


    app.delete('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result)
      // console.log(result);
    })







    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('What a wonderful world!');
})

app.listen(port, () => {
  console.log(`Toy Management Server is running on port: ${port}`);
})