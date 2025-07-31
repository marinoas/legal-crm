const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Η διαδρομή ${req.originalUrl} δεν βρέθηκε`,
      statusCode: 404,
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = { notFound };