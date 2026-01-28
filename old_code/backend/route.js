const express = require('express');
const cors = require('cors'); // Include CORS
const app=new express();
const Appointment = require('./db'); // Import the Appointment model
const port=3000;
// Enable CORS middleware
app.use(cors());
app.use(express.json());

// GET route - Fetch all appointments
app.get('/appointments', async (req, res) => {
    try {
        const appointments = await Appointment.find();
        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving appointments', error });
    }
});

// POST route - Add a new appointment
app.post('/appointments', async (req, res) => {
    const { doctorName, clinicAddress, appointmentTime, appointmentFee } = req.body;

    try {
        const newAppointment = new Appointment({
            doctorName,
            clinicAddress,
            appointmentTime,
            appointmentFee
        });
        await newAppointment.save();
        res.status(201).json({ message: 'Appointment added successfully', newAppointment });
    } catch (error) {
        res.status(500).json({ message: 'Error adding appointment', error });
    }
});
app.listen(port,()=>{
    console.log("the app is listening on"+port);
})