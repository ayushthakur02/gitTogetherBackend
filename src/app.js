const express = require("express")
const app = express()

app.use((req, res) => {
	res.send("Hello World")
})

app.listen(3069, () => {
	console.log("Server is running...")
})
