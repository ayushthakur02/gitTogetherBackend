const express = require("express")
const connectDB = require("./config/database")
const cookieParser = require("cookie-parser")

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")

const app = express()

app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/", authRoutes)
app.use("/user", userRoutes)

connectDB()
	.then(() => {
		console.log("Database connected successfully")
		app.listen(3069, () => {
			console.log("Server is running...")
		})
	})
	.catch((err) => {
		console.log(err)
	})
