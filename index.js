const express = require('express')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb')
const jwt = require('jsonwebtoken')
const app = express()
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
const port = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// JWT token verification function
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).send({ message: 'Unauthorized Access' })
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' })
    }
    req.decoded = decoded
  })
  next()
}

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
    const salesCollection = client.db('fruitWarehouse').collection('sales')
    const contactsCollection = client
      .db('fruitWarehouse')
      .collection('contacts')

    // Signin Auth
    app.post('/signin', (req, res) => {
      const user = req.body
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1d',
      })
      res.send({ accessToken })
    })

    app.get('/', (req, res) => {
      res.send('Server running seccessfully')
    })

    // Get all the fruits
    app.get('/fruits', async (req, res) => {
      let query = {}
      const cursor = fruitCollection.find(query)
      const fruits = await cursor.toArray()
      res.send(fruits)
    })

    // Get all the fruits by email
    // Authentication is needed
    app.get('/fruitsbyemail', verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email
      const email = req.query.email.toLowerCase()
      if (decodedEmail === email) {
        const query = { email: email }
        const cursor = fruitCollection.find(query)
        const fruits = await cursor.toArray()
        res.send(fruits)
      } else {
        return res.status(403).send({ message: 'Forbidden Access' })
      }
    })

    // Get the list the sales
    app.get('/sales', async (req, res) => {
      let query = {}
      const cursor = salesCollection.find(query)
      const sales = await cursor.toArray()
      res.send(sales)
    })

    // get the fruit item by id
    app.get('/fruits/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: ObjectId(id) }
      const result = await fruitCollection.findOne(query)
      res.send(result)
    })

    // Add new fruit item to database
    app.post('/fruits', async (req, res) => {
      const newFruitItem = req.body
      const result = await fruitCollection.insertOne(newFruitItem)
      res.send(result)
    })

    // Add new contact item to database
    app.post('/contact', async (req, res) => {
      const newContact = req.body
      const result = await contactsCollection.insertOne(newContact)
      res.send(result)
    })

    // Update fruit item quantity by id
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

    // Delete single fruit item by id
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
