const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://geetansh:geetansh@cluster0.zxxda.mongodb.net/appointments');
const appointmentSchema = new mongoose.Schema({
    doctorName: {
        type: String,
        required: true
    },
    clinicAddress: {
        type: String,
        required: true
    },
    appointmentTime: {
        type: String,
        required: true
    },
    appointmentFee: {
        type: String,
        required: true
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
