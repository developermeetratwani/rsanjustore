import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { SHOP } from './shop';

const empty = { customerName: '', customerPhone: '', deviceModel: '', issueDescription: '', preferredDate: '', preferredTime: '' };

// Writes the same `appointments` document shape the admin panel reads.
export default function BookingDialog({ service, onClose }) {
  const ref = useRef(null);
  const [form, setForm] = useState(empty);
  const [state, setState] = useState('idle'); // idle | saving | done | error

  useEffect(() => { ref.current?.showModal(); }, []);

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState('saving');
    try {
      await addDoc(collection(db, 'appointments'), {
        ...form,
        service: service.title,
        serviceIcon: service.icon,
        estimatedPrice: `From ₹${service.price}`,
        bookingTime: new Date().toISOString(),
        status: 'pending'
      });
      setState('done');
    } catch (err) {
      console.error('Error saving appointment:', err);
      setState('error');
    }
  };

  return (
    <dialog ref={ref} className="dialog" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()}>
      {state === 'done' ? (
        <div className="dialog-body">
          <h2>Booked. We'll call you.</h2>
          <p>We'll confirm your {service.title.toLowerCase()} slot on {form.customerPhone} shortly.</p>
          <button className="btn btn-ink" onClick={onClose}>Close</button>
        </div>
      ) : (
        <form className="dialog-body" onSubmit={submit}>
          <div className="dialog-head">
            <div>
              <h2>Book: {service.title}</h2>
              <p className="muted">From ₹{service.price}. The final price is decided in person at the store after we check your phone.</p>
            </div>
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
          </div>
          <label>Your name<input name="customerName" value={form.customerName} onChange={set} required autoComplete="name" /></label>
          <label>Mobile number
            <input name="customerPhone" value={form.customerPhone} onChange={set} required inputMode="numeric" autoComplete="tel-national" pattern="[6-9][0-9]{9}" maxLength="10" title="10-digit Indian mobile number" placeholder="10 digits" />
          </label>
          <label>Phone model<input name="deviceModel" value={form.deviceModel} onChange={set} required placeholder="e.g. iPhone 13" /></label>
          <label>What's wrong?<textarea name="issueDescription" value={form.issueDescription} onChange={set} required rows="3" /></label>
          <div className="row2">
            <label>Date<input type="date" name="preferredDate" value={form.preferredDate} onChange={set} required min={new Date().toISOString().split('T')[0]} /></label>
            <label>Time<input type="time" name="preferredTime" value={form.preferredTime} onChange={set} required /></label>
          </div>
          {state === 'error' && <p className="error" role="alert">Couldn't save the booking. Check your connection or call us on {SHOP.repairPhoneLabel}.</p>}
          <button className="btn btn-accent" disabled={state === 'saving'}>{state === 'saving' ? 'Booking…' : 'Book repair'}</button>
        </form>
      )}
    </dialog>
  );
}
