import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SHOP, PRICE_NOTE, isOpenNow } from './shop';

export const useOpen = () => {
  const [open, setOpen] = useState(isOpenNow);
  useEffect(() => {
    const t = setInterval(() => setOpen(isOpenNow()), 60000);
    return () => clearInterval(t);
  }, []);
  return open;
};

export const Header = () => {
  const open = useOpen();
  return (
    <header className="header">
      <div className="wrap header-in">
        <Link to="/" className="brand" aria-label="R Sanju Store home">
          <img src="/logo.svg" alt="" width="44" height="44" />
          <span>R Sanju Store</span>
        </Link>
        <nav className="nav" aria-label="Main">
          <a href="/#phones">Phones</a>
          <a href="/#repairs">Repairs</a>
          <a href="/#offers">Offers</a>
          <a href="/#faq">FAQ</a>
          <a href="/#visit">Visit</a>
        </nav>
        <span className={`status ${open ? 'on' : ''}`}>{open ? 'Open now' : 'Closed now'}</span>
        <a className="btn btn-accent header-call" href={`tel:+${SHOP.salesPhone}`}>Call</a>
      </div>
    </header>
  );
};

export const MobileBar = () => (
  <div className="mobilebar">
    <a href={`tel:+${SHOP.repairPhone}`}>Call</a>
    <a href={`https://wa.me/${SHOP.salesPhone}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
    <a href={SHOP.maps} target="_blank" rel="noopener noreferrer">Directions</a>
  </div>
);

export const Footer = () => (
  <footer className="footer">
    <div className="wrap footer-in">
      <div>
        <strong className="footer-brand">R Sanju Store</strong>
        <p>Mobile phones, accessories and repairs in Ahmedabad.</p>
      </div>
      <p>
        {SHOP.address.join(', ')}<br />
        <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a> · <a href={SHOP.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
      </p>
      <p className="muted-d">© {new Date().getFullYear()} R Sanju Store</p>
      <p className="muted-d disclaimer">{PRICE_NOTE}</p>
    </div>
  </footer>
);
