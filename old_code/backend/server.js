const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
// Connect to MongoDB
mongoose.connect('http://localhost:3000/appointments', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define a schema and model
const DataSchema = new mongoose.Schema({
  name: String,
  value: String,
});

const DataModel = mongoose.model('Data', DataSchema);

// API route to fetch data
app.get('/api/data', async (req, res) => {
  try {
    const data = await DataModel.find();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
