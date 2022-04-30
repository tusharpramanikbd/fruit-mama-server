const express = require('express')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb')
const app = express()
const cors = require('cors')
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
    const usersCollection = client.db('fruitWarehouse').collection('fruits')

    app.get('/', (req, res) => {
      res.send('Server running seccessfully')
    })

    app.get('/fruits', async (req, res) => {
      const query = {}
      const cursor = usersCollection.find(query)
      const fruits = await cursor.toArray()
      res.send(fruits)
    })
  } finally {
    // await client.close()
  }
}

run().catch(console.dir)

app.listen(port, () => {
  console.log('Listening to port', port)
})
