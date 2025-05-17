import React, { useEffect, useState } from 'react';
import { getCustomerAppointments, createAppointment, getCustomerPlans } from './api';

function CustomerDashboard({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({ specialistId: '', time: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const appts = await getCustomerAppointments(user.customer.id);
    setAppointments(appts);
    const wp = await getCustomerPlans(user.customer.id);
    setPlans(wp);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    await createAppointment(user.customer.id, form.specialistId, form.time);
    loadData();
  };

  return (
    <div>
      <h2>Customer Dashboard</h2>
      <section>
        <h3>Weekly Plans</h3>
        <ul>
          {plans.map((p) => (
            <li key={p.id}>{p.description}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Appointments</h3>
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>{new Date(a.time).toLocaleString()}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Create Appointment</h3>
        <form onSubmit={handleCreate}>
          <input value={form.specialistId} onChange={(e) => setForm({ ...form, specialistId: e.target.value })} placeholder="Specialist ID" />
          <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="YYYY-MM-DDTHH:MM" />
          <button type="submit">Create</button>
        </form>
      </section>
    </div>
  );
}

export default CustomerDashboard;
