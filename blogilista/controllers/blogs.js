const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('author')
  response.json(blogs.map(b => b.toJSON()))
})

blogsRouter.post('/', async (request, response, next) => {
  const user = await User.findById(request.body.userId)

  const blog = new Blog({ ...request.body, author: user._id })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    response.status(201).json(savedBlog)
  } catch(exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
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
