const jwt = require('jsonwebtoken')
const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({}).populate('author')
  res.json(blogs.map(b => b.toJSON()))
})

blogsRouter.post('/', async (req, res, next) => {
  const token = req.token

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const blog = new Blog({ ...req.body, author: user._id })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    res.status(201).json(savedBlog)
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (req, res, next) => {
  const token = req.token
  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const blogToBeRemoved = await Blog.findById(req.params.id)

    if(user._id.toString() !== blogToBeRemoved.author.toString()) {
      return res.status(401).json({ error: 'User unauthorized to delete this item.' })
    }

    await Blog.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } catch(e) {
    next(e)
  }
})

blogsRouter.put('/:id', async (req, res, next) => {
  const body = req.body

  try {
    const updatedBlog =
      await Blog.findByIdAndUpdate(req.params.id,
        { likes: body.likes },
        { new: true })
    res.json(updatedBlog.toJSON())
  } catch(e) {
    next(e)
  }
})

module.exports = blogsRouter
