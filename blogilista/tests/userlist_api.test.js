const mongoose = require('mongoose')
const supertest = require('supertest')
const User = require('../models/user')
const app = require('../app')
const helpers = require('../utils/test_helpers.js')
const api = supertest(app)

describe('user tests - initially one user', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'root', password: 'passu' })
    await user.save()
  })

  test('new user added succeessfully', async () => {
    const users = await helpers.usersInDb()

    const newUser = {
      username: 'loller',
      name: 'Lollero Pallero',
      password: 'passu',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfterAdd = await helpers.usersInDb()
    expect(usersAfterAdd.length).toBe(users.length + 1)

    const usernames = usersAfterAdd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('user creation fails if password is missing', async () => {
    const users = await helpers.usersInDb()

    const newUser = {
      username: 'useri',
      name: 'uus passuton user'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password required.')

    const usersAtEnd = await helpers.usersInDb()
    expect(usersAtEnd.length).toBe(users.length)
  })

  test('user creation fails if password is less than 3 characters', async () => {
    const users = await helpers.usersInDb()

    const newUser = {
      username: 'shortpassuser',
      name: 'Short Pa User',
      password: 'pa',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(404)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('Password too short! It must be 3 or more characters.')

    const usersAtEnd = await helpers.usersInDb()
    expect(usersAtEnd.length).toBe(users.length)
  })

  test('user creation fails if the username already exists', async () => {
    const users = await helpers.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Uus rootti',
      password: 'passu',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helpers.usersInDb()
    expect(usersAtEnd.length).toBe(users.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
