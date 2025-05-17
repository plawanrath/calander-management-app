import React, { useEffect, useState } from 'react';
import { getCustomerAppointments, createAppointment, getCustomerPlans } from './api';

function CustomerDashboard({ user, onLogout }) {
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
    <div className="min-h-screen bg-secondary p-6">
      <div className="flex justify-end mb-4">
        <button className="text-primary underline" onClick={onLogout}>Logout</button>
      </div>
      <h2 className="text-2xl font-bold text-primary mb-4">Customer Dashboard</h2>

      <section className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Weekly Plans</h3>
        <ul className="list-disc pl-5 space-y-1">
          {plans.map((p) => (
            <li key={p.id}>{p.description}</li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Appointments</h3>
        <ul className="space-y-1">
          {appointments.map((a) => (
            <li key={a.id}>{new Date(a.time).toLocaleString()}</li>
          ))}
        </ul>
      </section>

      <section className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">Create Appointment</h3>
        <form onSubmit={handleCreate} className="space-y-2">
          <input
            className="w-full border border-gray-300 rounded p-2"
            value={form.specialistId}
            onChange={(e) => setForm({ ...form, specialistId: e.target.value })}
            placeholder="Specialist ID"
          />
          <input
            className="w-full border border-gray-300 rounded p-2"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            placeholder="YYYY-MM-DDTHH:MM"
          />
          <button className="bg-primary text-white px-4 py-2 rounded" type="submit">Create</button>
        </form>
      </section>
    </div>
  );
}

export default CustomerDashboard;
