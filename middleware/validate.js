export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
        details: error.details.map((d) => d.message),
      });
    }
    next();
  };
};
