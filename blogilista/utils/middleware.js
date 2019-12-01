const morgan = require('morgan')
const logger = require('./logger')

morgan.token('body', function(req) {
  return JSON.stringify(req.body)
})

const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  skip: (req, res) => ( res.statusCode < 400 && process.env.NODE_ENV === 'test' )
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
  logger.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') { // eslint-disable-line
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler
}