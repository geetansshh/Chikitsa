
async function fetchAppointments() {
    try {
        const response = await fetch('http://localhost:3000/appointments');
        const data = await response.json();
        const appointmentList = document.getElementById('appointment-list');

        data.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('appointment-card');

            const doctorName = document.createElement('h2');
            doctorName.textContent = item.doctorName;

            const clinicAddress = document.createElement('p');
            clinicAddress.textContent = `Clinic Address: ${item.clinicAddress}`;

            let timeString = item.appointmentTime;
            if (timeString.length > 5) {
                timeString = timeString.substring(0, 5);
            }
            const appointmentTime = document.createElement('p');
            appointmentTime.textContent = `Appointment Time: ${timeString}`;

            const appointmentFee = document.createElement('p');
            appointmentFee.textContent = `Fee: ${item.appointmentFee}`;

            card.appendChild(doctorName);
            card.appendChild(clinicAddress);
            card.appendChild(appointmentTime);
            card.appendChild(appointmentFee);
            appointmentList.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

window.onload = fetchAppointments;
