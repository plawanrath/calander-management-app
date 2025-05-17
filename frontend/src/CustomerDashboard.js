import React, { useEffect, useState } from 'react';
import {
  getCustomerAppointments,
  createAppointment,
  getCustomerPlans,
  getCustomerSpecialists,
  getSpecialistAppointments,
} from './api';

function CustomerDashboard({ user, onLogout }) {
  const [appointments, setAppointments] = useState([]);
  const [plans, setPlans] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpec, setSelectedSpec] = useState('');
  const [specAppointments, setSpecAppointments] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const appts = await getCustomerAppointments(user.customer.id);
    setAppointments(appts);
    const wp = await getCustomerPlans(user.customer.id);
    setPlans(wp);
    const specs = await getCustomerSpecialists(user.customer.id);
    setSpecialists(specs);
    if (specs.length === 1) {
      setSelectedSpec(specs[0].id);
    }
  };

  useEffect(() => {
    if (selectedSpec) {
      loadSpecAppointments(selectedSpec);
    }
  }, [selectedSpec]);

  const loadSpecAppointments = async (id) => {
    const data = await getSpecialistAppointments(id);
    setSpecAppointments(data);
  };

  const handleSlotSelect = async (dateTime) => {
    await createAppointment(user.customer.id, selectedSpec, dateTime);
    loadData();
    loadSpecAppointments(selectedSpec);
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
        <div className="space-y-2">
          <select
            className="w-full border border-gray-300 rounded p-2"
            value={selectedSpec}
            onChange={(e) => setSelectedSpec(e.target.value)}
          >
            <option value="">Select Specialist</option>
            {specialists.map((s) => (
              <option key={s.id} value={s.id}>{s.user.username}</option>
            ))}
          </select>
          {selectedSpec && (
            <MonthlyCalendar
              appointments={specAppointments}
              onSelect={handleSlotSelect}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default CustomerDashboard;

function MonthlyCalendar({ appointments, onSelect }) {
  const [current] = useState(new Date());

  const start = new Date(current.getFullYear(), current.getMonth(), 1);
  const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
  const startDay = start.getDay();

  const dates = [];
  for (let i = 0; i < startDay; i++) dates.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(new Date(current.getFullYear(), current.getMonth(), d));
  }
  while (dates.length % 7 !== 0) dates.push(null);

  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  const handleClick = (date) => {
    const time = prompt('Enter time (HH:MM)');
    if (!time) return;
    const dt = `${date.toISOString().slice(0, 10)}T${time}`;
    if (new Date(dt) < new Date()) {
      alert('Cannot book in the past');
      return;
    }
    const conflict = appointments.some((a) => a.time === dt);
    if (conflict) {
      alert('Slot already booked');
      return;
    }
    onSelect(dt);
  };

  return (
    <div>
      <div className="grid grid-cols-7 text-center font-semibold">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="border p-1">
            {d}
          </div>
        ))}
      </div>
      {weeks.map((week, i) => (
        <div key={i} className="grid grid-cols-7">
          {week.map((date, j) => {
            if (!date) return <div key={j} className="h-24 border" />;
            const dateStr = date.toISOString().slice(0, 10);
            const daily = appointments.filter((a) => a.time.startsWith(dateStr));
            return (
              <div key={j} className="h-24 border p-1 text-xs align-top">
                <div>{date.getDate()}</div>
                {daily.map((a) => (
                  <div key={a.id} className="mt-1 bg-blue-200 rounded px-1">booked</div>
                ))}
                <button
                  className="text-primary underline text-xs mt-1"
                  onClick={() => handleClick(date)}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
