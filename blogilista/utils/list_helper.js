var _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((likeSum, current) => {
    return likeSum + current.likes
  }, 0)
}

const favoriteBlog = (blogs) => {
  return blogs.reduce((mostLiked, current) => (
    (mostLiked && mostLiked.likes > current.likes) ? mostLiked : current
  ), null)
}

const mostBlogs = blogs => {
  const grouped = _.groupBy(blogs, blog => blog.author)
  return Object.keys(grouped).reduce((biggest, currentAuthor) => (
    (biggest && grouped[biggest.author].length > grouped[currentAuthor].length)
      ? biggest
      : ({ author: currentAuthor, blogs: grouped[currentAuthor].length })
  ), null)
}

const mostLikes = blogs => {
  const grouped = _.groupBy(blogs, blog => blog.author)
  return (
    Object.keys(grouped).map(author => (
      grouped[author]
        .reduce((authorWithLikes, current) => (
          { ...authorWithLikes, likes: authorWithLikes.likes + current.likes }),
        { author: author, likes: 0 }
        )
    )).reduce((mostLiked, current) => (
      (mostLiked && mostLiked.likes > current.likes) ? mostLiked : current
    ), null)
  )
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
