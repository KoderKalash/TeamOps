import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    message: {
        message: 'Too many requests, please try again later'
    },
    standardHeaders: true, /* standardHeaders: true
Sends modern, standardized rate-limit response headers (the RateLimit... family), so clients can understand current limit/remaining/reset using standard semantics. */
    legacyHeaders: false /* legacyHeaders: false
Disables old X-RateLimit-* headers (X-RateLimit-Limit, X-RateLimit-Remaining, etc.), reducing header noise and avoiding duplicate formats. */
})

export default authLimiter