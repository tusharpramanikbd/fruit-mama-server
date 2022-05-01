const express = require('express')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb')
const app = express()
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7rdtd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

//Api
async function run() {
  try {
    await client.connect()
    const fruitCollection = client.db('fruitWarehouse').collection('fruits')

    app.get('/', (req, res) => {
      res.send('Server running seccessfully')
    })

    app.get('/fruits', async (req, res) => {
      const query = {}
      const cursor = fruitCollection.find(query)
      const fruits = await cursor.toArray()
      res.send(fruits)
    })

    app.get('/fruits/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await fruitCollection.findOne(query)
      res.send(result)
    })

    app.put('/fruits/:id', async (req, res) => {
      const id = req.params.id
      const updatedFruit = req.body
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true }
      const updatedDoc = {
        $set: {
          quantity: updatedFruit.newQuantity,
        },
      }
      const result = await fruitCollection.updateOne(
        filter,
        updatedDoc,
        options
      )
      res.send(result)
    })

    app.delete('/fruits/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await fruitCollection.deleteOne(query)
      res.send(result)
    })
  } finally {
    // await client.close()
  }
}

run().catch(console.dir)

app.listen(port, () => {
  console.log('Listening to port', port)
})
