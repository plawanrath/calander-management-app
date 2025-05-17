import React, { useEffect, useState } from 'react';
import { getSpecialistAppointments } from './api';

function SpecialistDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const data = await getSpecialistAppointments(user.specialist.id);
    setAppointments(data);
  };

  return (
    <div>
      <h2>Specialist Dashboard</h2>
      <section>
        <h3>Appointments</h3>
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>{new Date(a.time).toLocaleString()}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default SpecialistDashboard;
