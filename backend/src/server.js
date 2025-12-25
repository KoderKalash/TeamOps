import dbConnect from "./config/db.js"
import app from "./app.js"
import dotenv from "dotenv"

dotenv.config()

const PORT = process.env.PORT //why undefined but server still runs on 8000?

const server = async () => {
    await dbConnect()

    app.listen(PORT,() => {
        console.log(`Server is running on ${PORT}`)
    })
}

server()