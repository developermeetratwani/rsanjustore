import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { SHOP, REPAIRS, OFFERS, FAQS, PRICE_NOTE, wa } from './shop';
import { Header, Footer, MobileBar, useOpen } from './Chrome';
import BookingDialog from './BookingDialog';
import './site.css';

const Hero = () => (
  <section className="hero wrap">
    <div className="hero-copy">
      <img className="hero-logo" src="/logo.svg" alt="R Sanju Store, Ahmedabad" width="112" height="112" />
      <p className="eyebrow">Gita Mandir Road · Ahmedabad</p>
      <h1>Phones and phone repairs you can trust.</h1>
      <p className="lede">Second-hand and new mobile phones, accessories and same-day mobile repair in Ahmedabad. Screen, battery, camera and charging-port repairs for iPhone, Samsung, OnePlus, Vivo, Oppo and more.</p>
      <div className="cta-row">
        <a href="#phones" className="btn btn-accent">Browse phones</a>
        <a href="#repairs" className="btn btn-ghost">Book a repair</a>
      </div>
    </div>
    <aside className="board" aria-label="Repair prices and hours">
      <h2>Repair price board</h2>
      <ul>
        {REPAIRS.slice(0, 4).map((r) => (
          <li key={r.title}><span>{r.title}</span><b>from ₹{r.price}</b></li>
        ))}
      </ul>
      <p className="board-foot">Starting prices. Final price is fixed in store after we check your phone.</p>
    </aside>
  </section>
);

const useProducts = () => {
  const [products, setProducts] = useState(null);
  useEffect(() => {
    const q = query(collection(db, 'products'), where('inStock', '==', true));
    return onSnapshot(
      q,
      (snap) => setProducts(snap.docs.map((d) => ({ id: d.id, ...d.data(), images: d.data().images || [] }))),
      (err) => {
        console.error('Error fetching products:', err);
        const saved = JSON.parse(localStorage.getItem('rsanju_products') || '[]');
        setProducts(saved.filter((p) => p.inStock).map((p) => ({ ...p, images: p.images || [] })));
      }
    );
  }, []);
  return products;
};

const ProductCard = ({ p }) => (
  <article className="card product">
    <Link to={`/product/${p.id}`} className="product-media" style={{ '--tint': p.color || '#E5400D' }} aria-label={p.name}>
      {p.images[0]
        ? <img src={p.images[0]} alt={p.name} loading="lazy" decoding="async" width="320" height="240" />
        : <span className="ph">{p.name}</span>}
    </Link>
    <div className="product-info">
      <h3><Link to={`/product/${p.id}`}>{p.name}</Link></h3>
      {p.description && <p className="muted clamp">{p.description}</p>}
      <div className="product-foot">
        <span className="price">{p.price}</span>
        <a className="link" href={wa(`Hi, I'm interested in the ${p.name} (${p.price}). Is it available?`)} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
      </div>
    </div>
  </article>
);

const Phones = () => {
  const products = useProducts();
  return (
    <section id="phones" className="section wrap">
      <div className="section-head">
        <h2>Phones in stock</h2>
        <p className="muted">Live from our shelf. Tap a phone for specs, battery health and condition.</p>
        <p className="note">{PRICE_NOTE}</p>
      </div>
      {products === null && <div className="grid" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="card skeleton" />)}</div>}
      {products && products.length === 0 && (
        <p className="empty">New stock arrives daily. <a className="link" href={wa('Hi, what phones do you have in stock today?')}>Ask what is in on WhatsApp</a>.</p>
      )}
      {products && products.length > 0 && <div className="grid">{products.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
    </section>
  );
};

const Repairs = ({ onBook }) => (
  <section id="repairs" className="section tint">
    <div className="wrap">
      <div className="section-head">
        <h2>Repairs, usually done the same day</h2>
        <p className="note">{PRICE_NOTE}</p>
      </div>
      <ul className="repairs">
        {REPAIRS.map((r) => (
          <li key={r.title}>
            <div><h3>{r.title}</h3><p className="muted">{r.note}</p></div>
            <span className="price">from ₹{r.price}</span>
            <button className="btn btn-ink" onClick={() => onBook(r)}>Book<span className="sr"> {r.title}</span></button>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const Offers = () => (
  <section id="offers" className="section wrap">
    <div className="section-head"><h2>Ways to save</h2></div>
    <ul className="offers">
      {OFFERS.map((o) => <li key={o.title}><h3>{o.title}</h3><p className="muted">{o.text}</p></li>)}
    </ul>
  </section>
);

const Faq = () => (
  <section id="faq" className="section wrap">
    <div className="section-head"><h2>Common questions</h2></div>
    <div className="faq">
      {FAQS.map((f) => (
        <details key={f.q}>
          <summary>{f.q}</summary>
          <p className="muted">{f.a}</p>
        </details>
      ))}
    </div>
  </section>
);

const Visit = () => {
  const open = useOpen();
  return (
    <section id="visit" className="section visit">
      <div className="wrap visit-in">
        <div>
          <h2>Visit the store</h2>
          <p className={`status ${open ? 'on' : ''}`}>{open ? 'Open now' : 'Closed right now'}</p>
          <address>{SHOP.address.map((l) => <span key={l}>{l}</span>)}</address>
          <dl className="hours">
            <div><dt>Mon – Sat</dt><dd>9:00 AM – 9:00 PM</dd></div>
            <div><dt>Sunday</dt><dd>10:00 AM – 8:00 PM</dd></div>
          </dl>
          <a className="btn btn-accent" href={SHOP.maps} target="_blank" rel="noopener noreferrer">Get directions</a>
        </div>
        <div className="contact-list">
          <a href={`tel:+${SHOP.salesPhone}`}><small>Phones &amp; accessories</small><b>{SHOP.salesPhoneLabel}</b></a>
          <a href={`tel:+${SHOP.repairPhone}`}><small>Repair queries</small><b>{SHOP.repairPhoneLabel}</b></a>
          <a href={`https://wa.me/${SHOP.salesPhone}`} target="_blank" rel="noopener noreferrer"><small>WhatsApp</small><b>Message us</b></a>
          <a href={SHOP.instagram} target="_blank" rel="noopener noreferrer"><small>Instagram</small><b>@rsanju_phone_hub</b></a>
        </div>
      </div>
    </section>
  );
};

export default function Home() {
  const [booking, setBooking] = useState(null);
  return (
    <div className="site">
      <Header />
      <main>
        <Hero />
        <Phones />
        <Repairs onBook={setBooking} />
        <Offers />
        <Faq />
        <Visit />
      </main>
      <Footer />
      <MobileBar />
      {booking && <BookingDialog service={booking} onClose={() => setBooking(null)} />}
    </div>
  );
}
