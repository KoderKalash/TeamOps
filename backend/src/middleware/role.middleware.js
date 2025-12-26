import AppError from "../utils/AppError.js"

const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        console.log("ROLE:", req.user.role);
        console.log("ALLOWED:", allowedRoles);
        if (!req.user || !allowedRoles.includes(req.user.role))
            throw new AppError("Forbidden Request: Access Denied", 403)
        next()
    }
}

export default restrictTo