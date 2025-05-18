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

  const handleSlotSelect = async ({ start, end, title }) => {
    await createAppointment(
      user.customer.id,
      selectedSpec,
      start,
      end,
      title
    );
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
  const [current, setCurrent] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({ title: '', start: '09:00', end: '10:00' });

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

  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      timeOptions.push(`${hh}:${mm}`);
    }
  }

  const openModal = (date) => {
    setSelectedDate(date);
    setForm({ title: '', start: '09:00', end: '10:00' });
  };

  const create = () => {
    const day = selectedDate.toISOString().slice(0, 10);
    const startISO = `${day}T${form.start}`;
    const endISO = `${day}T${form.end}`;
    onSelect({ start: startISO, end: endISO, title: form.title });
    setSelectedDate(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <button className="px-2" onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))}>&lt;</button>
        <div className="font-semibold">{current.toLocaleString('default', { month: 'long', year: 'numeric' })}</div>
        <button className="px-2" onClick={() => setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))}>&gt;</button>
      </div>
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
                  <div key={a.id} className="mt-1 bg-blue-200 rounded px-1 truncate">
                    {a.title || 'booked'}
                  </div>
                ))}
                <button
                  className="text-primary underline text-xs mt-1"
                  onClick={() => openModal(date)}
                >
                  +
                </button>
              </div>
            );
          })}
        </div>
      ))}

      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded space-y-2 w-64">
            <div className="font-semibold mb-2">Create Event {selectedDate.toDateString()}</div>
            <input
              className="w-full border border-gray-300 rounded p-1"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div className="flex space-x-2">
              <select
                className="border border-gray-300 rounded p-1 flex-1"
                value={form.start}
                onChange={(e) => setForm({ ...form, start: e.target.value })}
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                className="border border-gray-300 rounded p-1 flex-1"
                value={form.end}
                onChange={(e) => setForm({ ...form, end: e.target.value })}
              >
                {timeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button className="px-2" onClick={() => setSelectedDate(null)}>Cancel</button>
              <button className="bg-primary text-white px-2 rounded" onClick={create}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
