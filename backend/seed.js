/**
 * seed.js — Populates Craze Vibe Trip with real sample content:
 * destinations, tour durations, pickup points, tours (with real
 * Northern-Pakistan-style photos from Unsplash — free to use, links verified),
 * itineraries, seats, gallery, FAQs, and website content.
 *
 * Run this AFTER `npm install` and AFTER filling in your .env file:
 *   node seed.js
 *
 * Safe to re-run: it checks for existing rows by name/key before inserting,
 * so it won't create duplicates if you run it twice.
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env — copy .env.example to .env and fill them in first.');
  process.exit(1);
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Unsplash direct image URL — free-to-use stock photos, verified working.
function unsplash(id, w = 1200) {
  return `https://images.unsplash.com/photo-${id}?q=80&w=${w}`;
}

const DESTINATIONS = [
  {
    title: 'Hunza Valley',
    description: 'A dramatic Karakoram valley of terraced orchards, glacial peaks, and centuries-old forts — one of the most iconic sights in Gilgit-Baltistan.',
    image_url: unsplash('1626621341517-bbf3d9990a23'),
    gallery: [],
  },
  {
    title: 'Skardu',
    description: 'Gateway to the Karakoram giants — cold deserts, turquoise lakes, and historic forts set against some of the world\'s highest peaks.',
    image_url: unsplash('1617854818583-09e7f077a156'),
    gallery: [],
  },
  {
    title: 'Naran Kaghan Valley',
    description: 'Alpine lakes, pine forests, and green hilltops in Khyber Pakhtunkhwa — a favourite easy-access escape from the plains.',
    image_url: unsplash('1589182373726-e4f658ab50f0'),
    gallery: [],
  },
  {
    title: 'Fairy Meadows',
    description: 'A grassy plateau facing Nanga Parbat, the ninth-highest mountain on Earth — one of the most photographed views in Pakistan.',
    image_url: unsplash('1590523277543-a94d2e4eb00b'),
    gallery: [],
  },
  {
    title: 'Swat Valley',
    description: 'Known as the "Switzerland of Pakistan" — river valleys, ski slopes at Malam Jabba, and lush green mountainsides.',
    image_url: unsplash('1624087267589-41ea77e28b1a'),
    gallery: [],
  },
  {
    title: 'Shogran',
    description: 'A quiet pine-forested hill station above the Kaghan Valley, and the trailhead for Siri Paye\'s alpine meadows.',
    image_url: unsplash('1548013146-72479768bada'),
    gallery: [],
  },
];

const DURATIONS = [
  { days: 1, label: '1 Day Tour' },
  { days: 2, label: '2 Days Tour' },
  { days: 3, label: '3 Days Tour' },
  { days: 6, label: '6 Days Tour' },
  { days: 8, label: '8 Days Tour' },
];

const PICKUP_POINTS = [
  { city_name: 'Lahore', address: 'Liberty Chowk, Gulberg', pickup_time: '06:00 AM', status: 'active' },
  { city_name: 'Gujranwala', address: 'GT Road, near Gujranwala Bypass', pickup_time: '08:00 AM', status: 'active' },
  { city_name: 'Wazirabad', address: 'GT Road Interchange', pickup_time: '08:30 AM', status: 'active' },
  { city_name: 'Sialkot', address: 'Daska Road Bus Stand', pickup_time: '09:00 AM', status: 'active' },
  { city_name: 'Jhelum', address: 'GT Road, near Jhelum Interchange', pickup_time: '10:00 AM', status: 'active' },
  { city_name: 'Islamabad', address: 'Faizabad Interchange', pickup_time: '11:30 AM', status: 'active' },
  { city_name: 'Faisalabad', address: 'Jhang Road Bus Terminal', pickup_time: '07:00 AM', status: 'active' },
];

// One sample tour per destination, matched to a sensible duration
const TOURS = [
  {
    destTitle: 'Hunza Valley', days: 6, price: 42500,
    title: 'Hunza Valley Explorer — 6 Days',
    short_description: 'Karimabad, Attabad Lake, Passu Cones, and Khunjerab Pass in one unforgettable week.',
    detailed_description: 'Travel the full length of the Karakoram Highway into Hunza, staying in Karimabad with day trips to Attabad Lake, Passu Cones, and (weather permitting) the Khunjerab Pass border with China.',
    included: ['AC Coaster Transport', 'Hotel Stay (5 nights)', 'Breakfast & Dinner', 'Tour Guide', 'All Toll Taxes'],
    excluded: ['Lunch', 'Personal Expenses', 'Entry Tickets to Optional Sites'],
    instructions: 'Carry warm clothing even in summer — nights in Hunza are cold. CNIC/ID required at security checkpoints.',
    itinerary: [
      ['Departure from pickup points, travel along the Karakoram Highway towards Chilas.'],
      ['Continue to Gilgit, then onward to Karimabad, Hunza. Evening free to explore Karimabad bazaar.'],
      ['Visit Attabad Lake and Passu Cones. Optional boating at Attabad Lake.'],
      ['Day trip towards Khunjerab Pass (Pak-China border), weather permitting.'],
      ['Visit Baltit Fort and Altit Fort. Leisure time in Karimabad.'],
      ['Return journey back towards Lahore/pickup cities.'],
    ],
  },
  {
    destTitle: 'Skardu', days: 8, price: 58000,
    title: 'Skardu & Deosai Grand Tour — 8 Days',
    short_description: 'Shigar Fort, Upper Kachura Lake, Deosai Plains, and the cold desert of Skardu.',
    detailed_description: 'A comprehensive 8-day journey covering Skardu city, the cold desert, Shigar Valley, Upper and Lower Kachura Lakes, and the high-altitude Deosai Plains.',
    included: ['4x4 & Coaster Transport', 'Hotel Stay (7 nights)', 'Breakfast & Dinner', 'Tour Guide'],
    excluded: ['Lunch', 'Deosai Jeep Rental (optional add-on)', 'Personal Expenses'],
    instructions: 'Deosai leg requires a full day and is weather dependent. Bring sunblock — UV is intense at altitude.',
    itinerary: [
      ['Departure and overnight travel towards Skardu via the Karakoram Highway.'],
      ['Arrival in Skardu, rest and evening city walk along the Indus.'],
      ['Visit the Cold Desert and Shigar Fort/Shigar Valley.'],
      ['Excursion to Upper and Lower Kachura (Shangrila) Lakes.'],
      ['Full-day trip to the Deosai National Park plains.'],
      ['Visit Khaplu Valley and Khaplu Palace.'],
      ['Leisure day in Skardu / optional add-on excursions.'],
      ['Return journey back towards pickup cities.'],
    ],
  },
  {
    destTitle: 'Naran Kaghan Valley', days: 3, price: 21000,
    title: 'Naran & Saif-ul-Malook — 3 Days',
    short_description: 'Lake Saif-ul-Malook, Naran bazaar, and the green hills of Kaghan in a quick 3-day escape.',
    detailed_description: 'A short getaway to Naran with a jeep excursion to the legendary Lake Saif-ul-Malook, plus free time to explore Naran town and the Kunhar River.',
    included: ['AC Coaster Transport', 'Hotel Stay (2 nights)', 'Breakfast', 'Tour Guide'],
    excluded: ['Jeep to Saif-ul-Malook (paid locally)', 'Lunch & Dinner', 'Personal Expenses'],
    instructions: 'The road to Saif-ul-Malook is jeep-only; shared jeep costs are paid on-site.',
    itinerary: [
      ['Departure from pickup points, travel to Naran via Abbottabad and Balakot.'],
      ['Jeep excursion to Lake Saif-ul-Malook. Evening free at Naran bazaar.'],
      ['Morning free time, then return journey to pickup cities.'],
    ],
  },
  {
    destTitle: 'Fairy Meadows', days: 3, price: 26500,
    title: 'Fairy Meadows Trek — 3 Days',
    short_description: 'Jeep to Tattu village, trek to Fairy Meadows, and face-to-face views of Nanga Parbat.',
    detailed_description: 'A short but memorable trip: jeep ride up the Raikot bridge track to Tattu village, then a scenic trek to the Fairy Meadows plateau facing Nanga Parbat.',
    included: ['Coaster to Raikot Bridge', 'Local Jeep up to Tattu', 'Guide for the Trek', 'Camping/Hut Stay (2 nights)'],
    excluded: ['Meals during the trek', 'Porter charges (optional)', 'Personal Expenses'],
    instructions: 'Moderate trek (~2-3 hours uphill) — comfortable hiking shoes required. Not recommended for those with mobility limitations.',
    itinerary: [
      ['Departure, travel to Raikot Bridge, jeep ride up to Tattu village.'],
      ['Trek to Fairy Meadows. Evening views of Nanga Parbat at sunset.'],
      ['Morning views, trek back down to Tattu, jeep + coaster back to pickup cities.'],
    ],
  },
  {
    destTitle: 'Swat Valley', days: 3, price: 19500,
    title: 'Swat Valley Getaway — 3 Days',
    short_description: 'Mingora, Malam Jabba, and the green riverbanks of the Swat River.',
    detailed_description: 'A relaxed 3-day trip through Mingora, the ski resort town of Malam Jabba, and riverside towns along the Swat River.',
    included: ['AC Coaster Transport', 'Hotel Stay (2 nights)', 'Breakfast', 'Tour Guide'],
    excluded: ['Chairlift tickets at Malam Jabba', 'Lunch & Dinner', 'Personal Expenses'],
    instructions: 'Chairlift at Malam Jabba operates weather-permitting; tickets purchased on-site.',
    itinerary: [
      ['Departure, travel to Mingora via the Swat Motorway.'],
      ['Day trip to Malam Jabba — optional chairlift ride.'],
      ['Riverside sightseeing, then return journey to pickup cities.'],
    ],
  },
  {
    destTitle: 'Shogran', days: 2, price: 15500,
    title: 'Shogran & Siri Paye — 2 Days',
    short_description: 'Pine forests, jeep tracks, and the alpine meadows of Siri Paye.',
    detailed_description: 'A quick weekend trip to Shogran with a jeep excursion up to the Siri Paye meadows — one of the most scenic short hikes in the region.',
    included: ['AC Coaster Transport', 'Hotel Stay (1 night)', 'Breakfast', 'Tour Guide'],
    excluded: ['Jeep to Siri Paye (paid locally)', 'Lunch & Dinner'],
    instructions: 'Siri Paye jeep track is rough — not recommended in heavy rain.',
    itinerary: [
      ['Departure, travel to Shogran via Balakot and Kaghan road.'],
      ['Jeep excursion to Siri Paye meadows, then return journey to pickup cities.'],
    ],
  },
];

const FAQS = [
  { category: 'Booking', question: 'How do I book a tour?', answer: 'Select a tour, choose your date and pickup point, pick your coaster seats, enter passenger details, and confirm — you\'ll get a unique Booking ID instantly.', order_index: 1 },
  { category: 'Booking', question: 'Can I change my pickup point after booking?', answer: 'Contact our support team as soon as possible before departure. Changes depend on seat/route availability.', order_index: 2 },
  { category: 'Payment', question: 'What payment methods are accepted?', answer: 'We currently confirm bookings on a pay-on-pickup / bank transfer basis. Online payment gateway integration is coming soon.', order_index: 3 },
  { category: 'Seats', question: 'How does seat selection work?', answer: 'Each coaster has a visual seat map. Green seats are available, red is your current selection, and grey seats are already booked and cannot be selected.', order_index: 4 },
  { category: 'Seats', question: 'Can two people book the same seat?', answer: 'No — our system locks a seat the moment a booking is confirmed, so a seat can never be double-booked.', order_index: 5 },
  { category: 'Pickup', question: 'Where are the pickup points located?', answer: 'We currently pick up from Lahore, Gujranwala, Wazirabad, Sialkot, Jhelum, Islamabad, and Faisalabad. Exact addresses are shown at booking.', order_index: 6 },
  { category: 'Cancellation', question: 'What is the cancellation policy?', answer: 'See our Cancellation & Refund Policy page for full details on timelines and refund percentages.', order_index: 7 },
  { category: 'General', question: 'Is travel insurance included?', answer: 'Travel insurance is not included by default but can be arranged separately on request.', order_index: 8 },
];

const SITE_CONTENT = {
  about: {
    heading: 'About Craze Vibes Trips',
    intro: 'Craze Vibes Trips was founded to make the breathtaking Northern Areas of Pakistan accessible to everyone — from first-time travelers to seasoned trekkers. We handle the transport, stays, and logistics so you can just enjoy the journey.',
    mission: 'To make exploring Northern Pakistan safe, affordable, and unforgettable for every traveler.',
    vision: 'To become the most trusted travel companion for adventure seekers across Pakistan.',
    team: [
      { name: 'Operations Team', role: 'Tour Planning & Logistics' },
      { name: 'Customer Support', role: 'Booking Assistance' },
      { name: 'Field Guides', role: 'On-Ground Tour Guides' },
    ],
  },
  contact: {
    phone: '+92 300 1234567',
    email: 'info@crazevibestrips.com',
    address: 'Wazirabad, Punjab, Pakistan',
    map_embed: '',
  },
  terms: {
    content: 'By booking a tour with Craze Vibes Trips, you agree to arrive at your selected pickup point on time, follow the tour guide\'s safety instructions, and accept that itineraries may change due to weather or road conditions. Full terms are provided at the time of booking confirmation.',
  },
  privacy: {
    content: 'Craze Vibes Trips collects only the information needed to process your booking (name, phone, email, CNIC where required). We do not sell or share your personal data with third parties except as needed to deliver your tour (e.g. hotel reservations).',
  },
  cancellation_refund: {
    content: 'Cancellations made 7+ days before departure: 80% refund. Cancellations made 3-6 days before: 50% refund. Cancellations within 48 hours of departure: non-refundable. No-shows are non-refundable. Refunds are processed within 7-10 working days.',
  },
};

async function upsertByMatch(table, match, payload) {
  const { data: existing } = await supabase.from(table).select('id').match(match).maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await supabase.from(table).insert(payload).select('id').single();
  if (error) throw new Error(`${table}: ${error.message}`);
  return data.id;
}

function generateSeatNumbers(total = 32) {
  const rows = ['A', 'B', 'C', 'D'];
  const numRows = Math.ceil(total / rows.length);
  const seats = [];
  for (let r = 1; r <= numRows; r++) {
    for (const letter of rows) {
      if (seats.length >= total) break;
      seats.push(`${letter}${r}`);
    }
  }
  return seats;
}

async function main() {
  console.log('Seeding Craze Vibe Trip sample content...\n');

  // 1. Durations
  const durationIds = {};
  for (const d of DURATIONS) {
    const id = await upsertByMatch('tour_durations', { days: d.days }, d);
    durationIds[d.days] = id;
  }
  console.log(`✓ Tour durations ready (${DURATIONS.length})`);

  // 2. Pickup points
  for (const p of PICKUP_POINTS) {
    await upsertByMatch('pickup_points', { city_name: p.city_name }, p);
  }
  console.log(`✓ Pickup points ready (${PICKUP_POINTS.length})`);

  // 3. Destinations
  const destIds = {};
  for (const d of DESTINATIONS) {
    const id = await upsertByMatch('destinations', { title: d.title }, {
      title: d.title, description: d.description, image_url: d.image_url,
    });
    destIds[d.title] = id;
  }
  console.log(`✓ Destinations ready (${DESTINATIONS.length})`);

  // 4. Gallery (destination cover + extra shots)
  let galleryCount = 0;
  for (const d of DESTINATIONS) {
    const images = [d.image_url, ...d.gallery];
    for (const image_url of images) {
      const { data: existing } = await supabase.from('gallery').select('id').match({ image_url }).maybeSingle();
      if (!existing) {
        await supabase.from('gallery').insert({ title: d.title, category: d.title, image_url });
        galleryCount++;
      }
    }
  }
  console.log(`✓ Gallery images ready (${galleryCount} new)`);

  // 5. A default vehicle/coaster, so seeded tours have something to assign
  const { data: existingVehicle } = await supabase.from('vehicles').select('id').match({ name: 'Coaster C1' }).maybeSingle();
  let defaultVehicleId = existingVehicle?.id;
  if (!defaultVehicleId) {
    const { data, error } = await supabase.from('vehicles').insert({
      name: 'Coaster C1', vehicle_number: 'LEA-1001', total_seats: 32, layout: '2-2', status: 'active',
    }).select('id').single();
    if (error) throw new Error(`vehicles: ${error.message}`);
    defaultVehicleId = data.id;
  }
  console.log('✓ Default vehicle ready (Coaster C1, 32 seats)');

  // 6. Tours + itineraries + a departure date (with seats) for each
  let tourCount = 0;
  let dateCounter = 0;
  for (const t of TOURS) {
    const destination_id = destIds[t.destTitle];
    const duration_id = durationIds[t.days];
    const destImage = DESTINATIONS.find((d) => d.title === t.destTitle).image_url;

    // Stagger departure dates 30, 37, 44... days from now so they're all upcoming
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + 30 + dateCounter * 7);
    dateCounter++;
    const start_date = departureDate.toISOString().slice(0, 10);

    const { data: existingTour } = await supabase.from('tours').select('id').match({ title: t.title }).maybeSingle();
    let tourId = existingTour?.id;

    if (!tourId) {
      const { data, error } = await supabase.from('tours').insert({
        title: t.title,
        destination_id,
        duration_id,
        price: t.price,
        cover_image: destImage,
        short_description: t.short_description,
        detailed_description: t.detailed_description,
        start_date,
        available_seats: 32,
        included_services: t.included,
        excluded_services: t.excluded,
        instructions: t.instructions,
        terms_and_conditions: 'Standard Craze Vibes Trips terms apply — see the Terms & Conditions page.',
        transport_info: '32-seat AC coaster, 2+2 seating arrangement.',
        status: 'active',
      }).select('id').single();
      if (error) throw new Error(`tours: ${error.message}`);
      tourId = data.id;
      tourCount++;

      // Itinerary
      for (let i = 0; i < t.itinerary.length; i++) {
        await supabase.from('tour_itineraries').insert({
          tour_id: tourId,
          day_number: i + 1,
          title: `Day ${i + 1}`,
          description: t.itinerary[i][0],
        });
      }

      // One departure date, with the default vehicle assigned, and its seats generated
      const { data: tourDate, error: tdErr } = await supabase.from('tour_dates').insert({
        tour_id: tourId, start_date, vehicle_id: defaultVehicleId, status: 'scheduled',
      }).select('id').single();
      if (tdErr) throw new Error(`tour_dates: ${tdErr.message}`);

      const seatRows = generateSeatNumbers(32).map((seat_number) => ({
        tour_date_id: tourDate.id, seat_number, status: 'available',
      }));
      await supabase.from('seats').insert(seatRows);
    }
  }
  console.log(`✓ Tours ready (${tourCount} new, each with itineraries + 1 departure date + 32 seats)`);

  // 6. FAQs
  let faqCount = 0;
  for (const f of FAQS) {
    const { data: existing } = await supabase.from('faqs').select('id').match({ question: f.question }).maybeSingle();
    if (!existing) {
      await supabase.from('faqs').insert(f);
      faqCount++;
    }
  }
  console.log(`✓ FAQs ready (${faqCount} new)`);

  // 7. Site content
  for (const [key, content] of Object.entries(SITE_CONTENT)) {
    const { data: existing } = await supabase.from('site_content').select('key').eq('key', key).maybeSingle();
    if (existing) {
      await supabase.from('site_content').update({ content, updated_at: new Date().toISOString() }).eq('key', key);
    } else {
      await supabase.from('site_content').insert({ key, content });
    }
  }
  console.log(`✓ Site content ready (about, contact, terms, privacy, cancellation_refund)`);

  console.log('\nDone! Restart your frontend and browse /tours, /destinations, /gallery, /faq to see the real content.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  console.error('Tip: double check your table column names match what this script expects (see backend/README.md).');
  process.exit(1);
});
