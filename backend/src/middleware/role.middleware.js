import AppError from "../utils/AppError.js"

const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        if(!req.user || !allowedRoles.includes(req.user.role)) throw new AppError("Forbidden Request: Access Denied",403)
        next()
    }
}

export default restrictTo