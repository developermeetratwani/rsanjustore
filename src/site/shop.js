export const SHOP = {
  name: 'R Sanju Store',
  salesPhone: '918140087845',
  salesPhoneLabel: '+91 81400 87845',
  repairPhone: '918511282930',
  repairPhoneLabel: '+91 85112 82930',
  email: 'rsanjustore41@gmail.com',
  instagram: 'https://www.instagram.com/rsanju_phone_hub',
  maps: 'https://maps.app.goo.gl/jf9DvPm4ByUyWSdd7',
  address: ['Gita Mandir Road, Raipur Gate', 'Ahmedabad – 380002, Gujarat'],
  origin: 'https://r-sanju.web.app'
};

export const PRICE_NOTE = 'Prices shown are a guide only. The original and final price of every phone and repair is decided in person at the store, after we check the device.';

export const REPAIRS = [
  { icon: '📱', title: 'Display replacement', note: 'Screens for all models', price: 899 },
  { icon: '🔋', title: 'Battery replacement', note: 'Original-quality cells', price: 599 },
  { icon: '📷', title: 'Camera repair', note: 'Front and back cameras', price: 799 },
  { icon: '💧', title: 'Water damage', note: 'Cleaning and restoration', price: 999 },
  { icon: '⚙️', title: 'Software & updates', note: 'OS updates, unlocking, cleanup', price: 299 },
  { icon: '🔧', title: 'Other repairs', note: 'Charging port, speaker, mic and more', price: 499 }
];

export const OFFERS = [
  { title: 'Exchange your old phone', text: 'Trade in and pay only the difference.' },
  { title: 'Second-hand at wholesale rates', text: 'Checked phones, priced to move.' },
  { title: 'Accessories up to 70% off', text: 'Cases, chargers, earphones and more.' },
  { title: 'Free gifts on select purchases', text: 'Ask in store which phones qualify.' }
];

// Mon–Sat 9–21, Sun 10–20 (Asia/Kolkata)
export const isOpenNow = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', weekday: 'short', hour: 'numeric', hourCycle: 'h23'
  }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const hour = Number(get('hour'));
  return get('weekday') === 'Sun' ? hour >= 10 && hour < 20 : hour >= 9 && hour < 21;
};

export const FAQS = [
  { q: 'Where is R Sanju Store in Ahmedabad?', a: 'We are on Gita Mandir Road near Raipur Gate, Ahmedabad 380002, close to the Gita Mandir ST bus stand. Tap Directions to open us in Google Maps.' },
  { q: 'How much does a mobile screen replacement cost?', a: 'Display replacement starts from ₹899 and battery replacement from ₹599. The final price depends on your phone model and is decided in person at the store after we check the device.' },
  { q: 'Do you repair phones the same day?', a: 'Most screen, battery, charging port and software repairs are done the same day. Water-damaged phones can take longer.' },
  { q: 'Do you sell second-hand phones?', a: 'Yes. We sell checked second-hand iPhone, Samsung, OnePlus and other Android phones at wholesale-style prices, plus new accessories.' },
  { q: 'Can I exchange my old phone?', a: 'Yes. Bring your old phone and we will value it in store, then you pay only the difference on your next phone.' },
  { q: 'What are your opening hours?', a: 'Monday to Saturday 9 AM to 9 PM, and Sunday 10 AM to 8 PM.' }
];

export const wa = (text) => `https://wa.me/${SHOP.salesPhone}?text=${encodeURIComponent(text)}`;
