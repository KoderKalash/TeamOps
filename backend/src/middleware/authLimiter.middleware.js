import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true, 
    legacyHeaders: false
})

export default authLimiter