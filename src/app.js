const express = require("express")
const connectDB = require("./config/database")
const app = express()
const cookieParser = require("cookie-parser")
const cors = require("cors")

const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/user")
const requestRoutes = require("./routes/request")
const profileRoutes = require("./routes/profile")
const uploadRoutes = require("./routes/upload")

app.use(
	cors({
		origin: process.env.ORIGIN_URL,
		credentials: true,
	}),
)
app.use(express.json())
app.use(cookieParser())

// Routes
app.use("/auth", authRoutes)
app.use("/user", userRoutes)
app.use("/request", requestRoutes)
app.use("/profile", profileRoutes)
app.use("/upload", uploadRoutes)

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
