import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { SHOP, PRICE_NOTE, wa } from './shop';
import { Header, Footer, MobileBar } from './Chrome';
import './site.css';

const load = async (id) => {
  try {
    const snap = await getDoc(doc(db, 'products', id));
    if (snap.exists()) return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('Error fetching product:', err);
  }
  const saved = JSON.parse(localStorage.getItem('rsanju_products') || '[]');
  return saved.find((p) => String(p.id) === id) || null;
};

export default function ProductPage() {
  const { id } = useParams();
  const [p, setP] = useState(undefined); // undefined = loading, null = missing
  const [img, setImg] = useState(0);

  useEffect(() => { setP(undefined); setImg(0); load(id).then(setP); }, [id]);

  let body;
  if (p === undefined) {
    body = <div className="wrap section"><div className="card skeleton tall" aria-busy="true" /></div>;
  } else if (p === null) {
    body = (
      <div className="wrap section empty-page">
        <title>Product not found – R Sanju Store</title>
        <meta name="robots" content="noindex" />
        <h1>We could not find that phone</h1>
        <p className="muted">It may have been sold.</p>
        <Link className="btn btn-accent" to="/#phones">See what is in stock</Link>
      </div>
    );
  } else {
    const images = p.images || [];
    const specs = p.specifications || [];
    const url = `${SHOP.origin}/product/${p.id}`;
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SHOP.origin}/` },
          { '@type': 'ListItem', position: 2, name: p.name, item: url }] },
        { '@type': 'Product', name: p.name, description: p.description,
          image: images.filter((i) => i.startsWith('http')),
          offers: { '@type': 'Offer', priceCurrency: 'INR', price: String(p.price).replace(/[^\d.]/g, ''),
            availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' } }
      ]
    };
    body = (
      <div className="wrap section">
        <title>{`${p.name} – ${p.price} | R Sanju Store Ahmedabad`}</title>
        <meta name="description" content={`${p.name}${p.description ? ': ' + p.description : ''}. Available at R Sanju Store, Gita Mandir Road, Ahmedabad.`} />
        <link rel="canonical" href={url} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
        <nav aria-label="Breadcrumb" className="crumbs">
          <Link to="/">Home</Link> <span aria-hidden="true">/</span> <Link to="/#phones">Phones</Link> <span aria-hidden="true">/</span> <span aria-current="page">{p.name}</span>
        </nav>
        <div className="pdp">
          <div>
            <div className="pdp-main" style={{ '--tint': p.color || '#E5400D' }}>
              {images[img]
                ? <img src={images[img]} alt={`${p.name} photo ${img + 1}`} width="640" height="480" decoding="async" />
                : <span className="ph">{p.name}</span>}
            </div>
            {images.length > 1 && (
              <div className="thumbs">
                {images.map((src, i) => (
                  <button key={i} onClick={() => setImg(i)} aria-label={`Show photo ${i + 1}`} aria-current={i === img}>
                    <img src={src} alt="" width="64" height="64" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <h1>{p.name}</h1>
            <p className="pdp-price">{p.price}</p>
            <p className="note">{PRICE_NOTE}</p>
            <p className={`status ${p.inStock ? 'on' : ''}`}>{p.inStock ? 'In stock' : 'Out of stock'}</p>
            {p.description && <p className="lede">{p.description}</p>}
            <div className="cta-row">
              <a className="btn btn-accent" href={wa(`Hi, I'm interested in the ${p.name} (${p.price}). Is it available?`)} target="_blank" rel="noopener noreferrer">Ask on WhatsApp</a>
              <a className="btn btn-ghost" href={`tel:+${SHOP.salesPhone}`}>Call {SHOP.salesPhoneLabel}</a>
            </div>
            {specs.length > 0 && (
              <>
                <h2 className="spec-title">Details</h2>
                <dl className="specs">
                  {specs.map((s, i) => <div key={i}><dt>{s.label}</dt><dd>{s.value}</dd></div>)}
                </dl>
              </>
            )}
            <p className="muted small">Visit us at {SHOP.address.join(', ')} to see it in person.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="site">
      <Header />
      <main>{body}</main>
      <Footer />
      <MobileBar />
    </div>
  );
}
