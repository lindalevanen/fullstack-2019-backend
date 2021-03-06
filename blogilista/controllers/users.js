const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs')
  res.json(users.map(u => u.toJSON()))
})

usersRouter.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id).populate('blogs')
  res.json(user)
})

usersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    if(!body.password) {
      return response.status(404).send({ error: 'Password required.' })
    }
    if(body.password.length < 3) {
      return response.status(404).send({ error: 'Password too short! It must be 3 or more characters.' })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })

    const savedUser = await user.save()

    response.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter