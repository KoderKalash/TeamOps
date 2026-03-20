import rateLimit from "express-rate-limit"

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, //15 min
    max: 100, //limit each IP
    message: {
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
})

export default limiter