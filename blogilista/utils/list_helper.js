const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((likeSum, current) => {
    return likeSum + current.likes
  }, 0)
}

module.exports = {
  dummy,
  totalLikes
}
