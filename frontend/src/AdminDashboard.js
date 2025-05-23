import React, { useEffect, useState } from 'react';
import { createUser, assignSpecialist, createWeeklyPlan, getAllAppointments, getAllCustomers, getAllSpecialists } from './api';

function AdminDashboard({ onLogout }) {
  const [userForm, setUserForm] = useState({ username: '', password: '', type: 'customer' });
  const [assignForm, setAssignForm] = useState({ customerId: '', specialistIds: [] });
  const [planForm, setPlanForm] = useState({ customerId: '', description: '' });
  const [appointments, setAppointments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [specialists, setSpecialists] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await getAllAppointments();
    setAppointments(data);
    const custs = await getAllCustomers();
    setCustomers(custs);
    const specs = await getAllSpecialists();
    setSpecialists(specs);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    await createUser(userForm);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    for (const id of assignForm.specialistIds) {
      await assignSpecialist(assignForm.customerId, id);
    }
  };

  const handlePlan = async (e) => {
    e.preventDefault();
    await createWeeklyPlan(planForm.customerId, planForm.description);
  };

  return (
    <div className="min-h-screen bg-secondary p-6">
      <div className="flex justify-end mb-4">
        <button className="text-primary underline" onClick={onLogout}>Logout</button>
      </div>
      <h2 className="text-2xl font-bold text-primary mb-4">Admin Dashboard</h2>

      <section className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Create User</h3>
        <form onSubmit={handleCreateUser} className="space-y-2">
          <input
            className="w-full border border-gray-300 rounded p-2"
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
            placeholder="Username"
          />
          <input
            className="w-full border border-gray-300 rounded p-2"
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
            placeholder="Password"
          />
          <select
            className="w-full border border-gray-300 rounded p-2"
            value={userForm.type}
            onChange={(e) => setUserForm({ ...userForm, type: e.target.value })}
          >
            <option value="customer">Customer</option>
            <option value="specialist">Specialist</option>
            <option value="admin">Admin</option>
          </select>
          <button className="bg-primary text-white px-4 py-2 rounded" type="submit">Create</button>
        </form>
      </section>

      <section className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Assign Specialist</h3>
        <form onSubmit={handleAssign} className="space-y-2">
          <select
            className="w-full border border-gray-300 rounded p-2"
            value={assignForm.customerId}
            onChange={(e) => setAssignForm({ ...assignForm, customerId: e.target.value })}
          >
            <option value="">Select Customer</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.user.username}</option>
            ))}
          </select>
          <select
            multiple
            className="w-full border border-gray-300 rounded p-2 h-32"
            value={assignForm.specialistIds}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions, (o) => o.value);
              setAssignForm({ ...assignForm, specialistIds: selected });
            }}
          >
            {specialists.map((s) => (
              <option key={s.id} value={s.id}>{s.user.username}</option>
            ))}
          </select>
          <button className="bg-primary text-white px-4 py-2 rounded" type="submit">Assign</button>
        </form>
      </section>

      <section className="bg-white rounded shadow p-4 mb-6">
        <h3 className="font-semibold mb-2">Create Weekly Plan</h3>
        <form onSubmit={handlePlan} className="space-y-2">
          <input
            className="w-full border border-gray-300 rounded p-2"
            value={planForm.customerId}
            onChange={(e) => setPlanForm({ ...planForm, customerId: e.target.value })}
            placeholder="Customer ID"
          />
          <input
            className="w-full border border-gray-300 rounded p-2"
            value={planForm.description}
            onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
            placeholder="Description"
          />
          <button className="bg-primary text-white px-4 py-2 rounded" type="submit">Create Plan</button>
        </form>
      </section>

      <section className="bg-white rounded shadow p-4">
        <h3 className="font-semibold mb-2">All Specialist Appointments</h3>
        <ul className="space-y-1">
          {appointments.map((a) => (
            <li key={a.id}>{a.specialist_id} - {new Date(a.time).toLocaleString()}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;
