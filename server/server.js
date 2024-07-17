require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.get('/',(req,res) => {
    res.send('Hello World!')
})

console.log(process.env.MONGO_URI);
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => console.log('MongoDB database connection established successfully'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});