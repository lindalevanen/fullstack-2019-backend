const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response, next) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    }).catch(e => next(e))
})

blogsRouter.post('/', (request, response, next) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    }).catch(e => next(e))
})

blogsRouter.delete('/:id', async (req, res, next) => {
  Blog.findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

blogsRouter.put('/:id', async (req, res, next) => {
  const body = req.body

  Blog.findByIdAndUpdate(req.params.id,
    { likes: body.likes },
    { new: true })
    .then(updatedBlog => {
      res.json(updatedBlog.toJSON())
    })
    .catch(error => next(error))
})

module.exports = blogsRouter
