const doctors = [
    { id: 1, name: "Dr. John Smith", specialty: "General Practitioner", rating: 4.8, clinicAddress: "123 Health St, Medical City", appointmentFee: "$100" },
    { id: 2, name: "Dr. Sarah Johnson", specialty: "General Practitioner", rating: 4.9, clinicAddress: "456 Wellness Ave, Care Center", appointmentFee: "$110" },
    { id: 3, name: "Dr. Michael Brown", specialty: "General Practitioner", rating: 4.7, clinicAddress: "789 Healing Lane, Family Clinic", appointmentFee: "$95" },
    { id: 4, name: "Dr. Emily Davis", specialty: "General Practitioner", rating: 4.9, clinicAddress: "321 Vitality Rd, Community Health", appointmentFee: "$105" }
];

function generateTimeSlots() {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
        slots.push(`${hour}:00`);
        slots.push(`${hour}:30`);
    }
    return slots;
}

function renderDoctorList(doctors) {
    const doctorList = document.getElementById('doctor-list');
    doctorList.innerHTML = '';
    doctors.forEach(doctor => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'doctor-card';
        doctorCard.innerHTML = `
            <h2>${doctor.name}</h2>
            <p>Rating: ${doctor.rating}/5</p>
            <p>Clinic: ${doctor.clinicAddress}</p>
            <p>Appointment Fee: ${doctor.appointmentFee}</p>
            <button class="btn" onclick="openModal(${doctor.id})">Schedule Appointment</button>
        `;
        doctorList.appendChild(doctorCard);
    });
}

const modal = document.getElementById('appointmentModal');
const closeBtn = document.getElementsByClassName('close')[0];
let selectedDoctor = null;
let selectedTimeSlot = null;

function openModal(doctorId) {
    selectedDoctor = doctors.find(doctor => doctor.id === doctorId);
    modal.style.display = 'block';
    document.getElementById('modalDoctorName').textContent = `Doctor: ${selectedDoctor.name}`;
    document.getElementById('modalClinicAddress').textContent = `Clinic: ${selectedDoctor.clinicAddress}`;
    document.getElementById('modalAppointmentFee').textContent = `Fee: ${selectedDoctor.appointmentFee}`;
    renderTimeSlots();
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

function renderTimeSlots() {
    const timeSlotsContainer = document.getElementById('timeSlots');
    timeSlotsContainer.innerHTML = '';
    generateTimeSlots().forEach(slot => {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'time-slot';
        slotDiv.textContent = slot;
        slotDiv.onclick = () => selectTimeSlot(slot, slotDiv);
        timeSlotsContainer.appendChild(slotDiv);
    });
}

function selectTimeSlot(slot, slotDiv) {
    const previousSelected = document.querySelector('.time-slot.selected');
    if (previousSelected) previousSelected.classList.remove('selected');
    selectedTimeSlot = slot;
    slotDiv.classList.add('selected'); // Set the color for the selected time slot
}

document.getElementById('confirmAppointment').onclick = function() {
    if (selectedTimeSlot) {
        const appointmentData = {
            doctorName: selectedDoctor.name,
            clinicAddress: selectedDoctor.clinicAddress,
            appointmentFee: selectedDoctor.appointmentFee,
            appointmentTime: selectedTimeSlot,
        };

        fetch('http://localhost:3000/appointments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(appointmentData),
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            alert(`Appointment confirmed with ${selectedDoctor.name} at ${selectedTimeSlot}`);
            modal.style.display = 'none';
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
            alert('There was a problem confirming your appointment. Please try again.');
        });
    } else {
        alert('Please select a time slot.');
    }
}

document.getElementById('doctor-search').addEventListener('input', function() {
    const query = this.value.toLowerCase();
    const filteredDoctors = doctors.filter(doctor => doctor.name.toLowerCase().includes(query));
    renderDoctorList(filteredDoctors);
});

renderDoctorList(doctors);
