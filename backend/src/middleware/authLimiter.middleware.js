import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    // Keep rate limiting in real environments, but avoid cross-test throttling.
    skip: () => process.env.NODE_ENV === "test",
    message: {
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true, 
    legacyHeaders: false
})

export default authLimiter
