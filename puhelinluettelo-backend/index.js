const express = require('express')
const app = express()
const morgan = require('morgan');

const cors = require('cors')

const bodyParser = require('body-parser')

morgan.token('body', function(req, res) {
	return JSON.stringify(req.body);
});

app.use(bodyParser.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())

let persons = [
  {
    id: 1,
    name: "Arto Hallas",
    number: "040-2345665",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "050-3456414",
  },
  {
    id: 3,
    name: "Matti Meikäläinen",
    number: "040-3406905",
  }
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
  const noOfPersons = persons.length
  const timeNow = new Date(Date.now()).toUTCString()
  const infoString = `Phonebook has info of ${noOfPersons} people \n ${timeNow}`
  res.send(infoString)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const generateId = () => {
  return parseInt(Math.random() * 10000000000)
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name) {
    return response.status(400).json({ 
      error: 'Name missing' 
    })
  }

  if (!body.number) {
    return response.status(400).json({ 
      error: 'Number missing' 
    })
  }

  if (persons.map(p => p.name).includes(body.name)) {
    return response.status(400).json({ 
      error: 'Name must be unique' 
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
