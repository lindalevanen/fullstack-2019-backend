const mongoose = require('mongoose')

if ( process.argv.length<3 ) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0-xscvg.mongodb.net/test?retryWrites=true`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const possibleName = process.argv[3]
const possibleNumber = process.argv[4]

if(possibleName && possibleNumber) {
  const person = new Person({
    name: possibleName,
    number: possibleNumber
  })

  person.save().then(() => {
    console.log(`added ${possibleName} number ${possibleNumber} to phonebook`)
    mongoose.connection.close()
  })

} else {
  console.log('phonebook:')
  Person
    .find({})
    .then(persons => {
      for (const p of persons) {
        console.log(p.name, p.number)
      }
      mongoose.connection.close()
    })

}
