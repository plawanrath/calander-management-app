import React, { useEffect, useState } from 'react';
import { getSpecialistAppointments } from './api';

function SpecialistDashboard({ user, onLogout }) {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const data = await getSpecialistAppointments(user.specialist.id);
    setAppointments(data);
  };

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="flex justify-end mb-4">
        <button className="text-primary underline" onClick={onLogout}>Logout</button>
      </div>
      <h2 className="text-2xl font-bold text-primary mb-4">Specialist Dashboard</h2>
      <section className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Appointments</h3>
        <ul className="space-y-1">
          {appointments.map((a) => (
            <li key={a.id}>{new Date(a.time).toLocaleString()}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default SpecialistDashboard;
