const express = require('express')
const port = process.env.PORT || 4000
const app = express()
app.use(express.static('src'))

app.listen(port, () => console.log(`example app listening on port ${port}!`))
