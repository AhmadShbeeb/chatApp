const errorHandler = (err, req, res, next) => {
  // to override default express error handler
  const statusCode = res.statusCode ? res.statusCode : 500 // server error

  res.status(statusCode)

  res.json({
    message: err.message,
    // stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    stack: err.stack,
  })
}

module.exports = {
  errorHandler,
}
