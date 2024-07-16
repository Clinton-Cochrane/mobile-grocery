const express = require('express');
const bodyParser = require ('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.port || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/',(req,res) => {
    res.send('Hello World!')
})

// const uri = "mongodb connection string";
// mongoose.connect(uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true });

// const connection = mongoose.connection;
// connection.once('open', () => {
//     console.log('MongoDB database connection established successfully');
// });

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});