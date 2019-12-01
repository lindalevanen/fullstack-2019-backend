const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const api = supertest(app)

const dummyBlogs = [
  {
    title: 'Bad blog',
    author: 'Matti',
    url: 'lol@blog.com',
    likes: 12
  },
  {
    title: 'Greatest blog',
    author: 'Maija',
    url: 'loller@blog.com',
    likes: 43
  },
]

beforeEach(async () => {
  await Blog.deleteMany({})

  let blogObject = new Blog(dummyBlogs[0])
  await blogObject.save()

  blogObject = new Blog(dummyBlogs[1])
  await blogObject.save()
})


test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('blog identifier should be id', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body[0].id).toBeDefined()
})

test('a blog can be added', async () => {
  const newBlog = {
    title: 'Test blog',
    author: 'Blob',
    url: 'blob@blog.com',
    likes: 0
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const titles = response.body.map(r => r.title)

  expect(response.body.length).toBe(dummyBlogs.length + 1)
  expect(titles).toContain('Test blog')
})

test('a blog without a likes-value can be added, and likes is defauled to 0', async () => {
  const newBlog = {
    title: 'No likes blog',
    author: 'Blob',
    url: 'blob@blog.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const response = await api.get('/api/blogs')
  const addedBlog = response.body.find(b => b.title === 'No likes blog')
  expect(addedBlog).toBeDefined()
  expect(addedBlog.likes).toBe(0)
})

test('a blog without title or url cannot be added', async () => {
  const invalidBlog = {
    author: 'Blob'
  }

  await api
    .post('/api/blogs')
    .send(invalidBlog)
    .expect(400)
    .expect('Content-Type', /application\/json/)
})

test('a blog can be deleted, and bloglist length is reduced by one', async () => {
  const res = await api.get('/api/blogs')
  const blogtoBeRemoved = res.body[1]

  await api
    .delete('/api/blogs/' + blogtoBeRemoved.id)
    .expect(204)

  const resAfterRemoval = await api.get('/api/blogs')

  expect(resAfterRemoval.body.length).toBe(dummyBlogs.length - 1)
})

test('a blog´s likes can be modified', async () => {
  const res = await api.get('/api/blogs')
  const blog = res.body[0]

  await api
    .put('/api/blogs/' + blog.id)
    .send({ likes: 30 })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const resAfterUpdate = await api.get('/api/blogs')

  const updatedBlog = resAfterUpdate.body[0]
  expect(updatedBlog.likes).toBe(30)
})

afterAll(() => {
  mongoose.connection.close()
})
