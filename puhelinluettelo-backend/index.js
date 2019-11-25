require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan');
const cors = require('cors')
const bodyParser = require('body-parser')

morgan.token('body', function(req, res) {
	return JSON.stringify(req.body);
});

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

const Person = require('./models/person')

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  }).catch(e => next(e))
})

app.get('/info', (req, res) => {
  Person.find({}).then(persons => {
    const noOfPersons = persons.length
    const timeNow = new Date(Date.now()).toUTCString()
    const infoString = `Phonebook has info of ${noOfPersons} people \n ${timeNow}`
    res.send(infoString)
  }).catch(e => next(e))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if(person) {
      res.json(person.toJSON())
    } else {
      res.status(404).end()  
    }
  }).catch(e => next(e))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  Person.findByIdAndUpdate(req.params.id, {number: body.number}, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  if (!body.name) {
    return res.status(400).json({ 
      error: 'Name missing' 
    })
  }

  if (!body.number) {
    return res.status(400).json({ 
      error: 'Number missing' 
    })
  }

  // TODO:
  /*if (persons.map(p => p.name).includes(body.name)) {
    return response.status(400).json({ 
      error: 'Name must be unique' 
    })
  }*/

  const person = new Person({
    name: body.name,
    number: body.number,
  })
  
  person.save().then(response => {
    console.log('person saved!');
    res.json(response)
  }).catch(e => next(e))
  
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return res.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// virheellisten pyyntöjen käsittely
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
