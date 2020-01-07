const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

mongoose.set('useFindAndModify', false)

const MONGODB_URI = 'mongodb+srv://fullstack:t68ITR04wTTpdPpj@cluster0-xscvg.mongodb.net/dev?retryWrites=true'

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int,
    bookCount: Int
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
  }
  
  type Query {
    hello: String!,
    bookCount: Int!,
    authorCount: Int!,
    allBooks(author: String, genre: String): [Book!]!,
    allAuthors: [Author!]!,
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
      ): Book,
    editAuthor(
      name: String!,
      setBornTo: Int!
    ): Author,
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
  
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let resBooks = await Book.find({}).populate('author')
      /*if (args.author) {
        resBooks = resBooks.filter(book => book.author === args.author)
      }*/
      if(args.genre) {
        resBooks = await Book.find({ genres: args.genre }).populate('author')
      }

      return resBooks
    },
    allAuthors: () => Author.find({}),
    me: (root, args, context) => {
      if (!context.token) {
        throw new UserInputError('Token missing or invalid', {
          invalidArgs: context.token,
        })
      }
      return User.findById(context.token.id)
    } 
  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({}).populate('author')
      return books.reduce((sum, current) => current.author.name === root.name ? sum + 1 : sum , 0)
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.token) {
        throw new UserInputError('Token missing or invalid', {
          invalidArgs: context.token,
        })
      }
  
      if(!args.author) {
        throw new UserInputError('Author name required', {
          invalidArgs: args.author,
        })
      }
      if(!args.title) {
        throw new UserInputError('Book title required', {
          invalidArgs: args.title,
        })
      }
      if(args.title.length < 2) {
        throw new UserInputError('Book title must be longer than 2 characters', {
          invalidArgs: args.title,
        })
      }

      const author = await Author.findOne({ name: args.author })
      let savedBook

      if (author) {
        const book = new Book({ ...args, author: author._id })
        savedBook = await book.save()
        savedBook.author = author
      } else {
        if(args.author.length < 4) {
          throw new UserInputError('Author name must be longer than 4 characters', {
            invalidArgs: args.author,
          })
        }
        const newAuthor = new Author({ name: args.author })
        const savedAuthor = await newAuthor.save()
        const book = new Book({ ...args, author: savedAuthor._id })
        savedBook = await book.save()
        savedBook.author = savedAuthor
      }
      return savedBook.populate('author')
    },
    editAuthor: async (root, args, context) => {
      if (!context.token) {
        throw new UserInputError('Token missing or invalid', {
          invalidArgs: context.token,
        })
      }

      const author = await Author.findOne({ name: args.name })

      if (author) {
        author.born = args.setBornTo
        return author.save()
      } else {
        throw new UserInputError('Author not found', {
          invalidArgs: args.name,
        })
      }
    },
    createUser: async (root, args) => {
      if(!args.username) {
        throw new UserInputError('Username required', {
          invalidArgs: args.username
        })
      }
      if(!args.favoriteGenre) {
        throw new UserInputError('Favorite genre required', {
          invalidArgs: args.favoriteGenre
        })
      }
      if(args.username.length < 3) {
        throw new UserInputError('Username too short! It must be 3 or more characters.', {
          invalidArgs: args.password
        })
      }
  
      const saltRounds = 10
      const passwordHash = await bcrypt.hash("test", saltRounds)
  
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
        passwordHash
      })
      return user.save()
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      const passwordCorrect = user && await bcrypt.compare(args.password, user.passwordHash)

      if (!passwordCorrect) {
        throw new UserInputError('invalid username or password.', {
          invalidArgs: Object.keys(args)
        })
      }

      const userForToken = {
        ...user,
        id: user._id,
      }

      return ({value: jwt.sign(userForToken, "LOLLERO")})
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => {
    const tokenWithBearer = req.headers.authorization || '';
    const token = tokenWithBearer.split(' ')[1]
    try {
      return ({ token: jwt.verify(token, "LOLLERO") })
    } catch (e) {
      return ({ token: null });
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
