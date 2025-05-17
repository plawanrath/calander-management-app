import React, { useEffect, useState } from 'react';
import { createUser, assignSpecialist, createWeeklyPlan, getAllAppointments } from './api';

function AdminDashboard({ onLogout }) {
  const [userForm, setUserForm] = useState({ username: '', password: '', type: 'customer' });
  const [assignForm, setAssignForm] = useState({ customerId: '', specialistId: '' });
  const [planForm, setPlanForm] = useState({ customerId: '', description: '' });
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    const data = await getAllAppointments();
    setAppointments(data);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    await createUser(userForm);
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    await assignSpecialist(assignForm.customerId, assignForm.specialistId);
  };

  const handlePlan = async (e) => {
    e.preventDefault();
    await createWeeklyPlan(planForm.customerId, planForm.description);
  };

  return (
    <div>
      <button onClick={onLogout}>Logout</button>
      <h2>Admin Dashboard</h2>
      <section>
        <h3>Create User</h3>
        <form onSubmit={handleCreateUser}>
          <input value={userForm.username} onChange={(e) => setUserForm({ ...userForm, username: e.target.value })} placeholder="Username" />
          <input value={userForm.password} onChange={(e) => setUserForm({ ...userForm, password: e.target.value })} placeholder="Password" />
          <select value={userForm.type} onChange={(e) => setUserForm({ ...userForm, type: e.target.value })}>
            <option value="customer">Customer</option>
            <option value="specialist">Specialist</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Create</button>
        </form>
      </section>
      <section>
        <h3>Assign Specialist</h3>
        <form onSubmit={handleAssign}>
          <input value={assignForm.customerId} onChange={(e) => setAssignForm({ ...assignForm, customerId: e.target.value })} placeholder="Customer ID" />
          <input value={assignForm.specialistId} onChange={(e) => setAssignForm({ ...assignForm, specialistId: e.target.value })} placeholder="Specialist ID" />
          <button type="submit">Assign</button>
        </form>
      </section>
      <section>
        <h3>Create Weekly Plan</h3>
        <form onSubmit={handlePlan}>
          <input value={planForm.customerId} onChange={(e) => setPlanForm({ ...planForm, customerId: e.target.value })} placeholder="Customer ID" />
          <input value={planForm.description} onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })} placeholder="Description" />
          <button type="submit">Create Plan</button>
        </form>
      </section>
      <section>
        <h3>All Specialist Appointments</h3>
        <ul>
          {appointments.map((a) => (
            <li key={a.id}>{a.specialist_id} - {new Date(a.time).toLocaleString()}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default AdminDashboard;
