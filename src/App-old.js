import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import logo from './assets/newlogo.png';
import CustomerLogin from './CustomerLogin';
import CustomerDashboard from './CustomerDashboard';
import PromoPage from './PromoPage';
import AdminPage from './AdminPage';
import { useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import BackButton from './BackButton';
import HomePage from './components/HomePage';
import ServicesPage from './components/ServicesPage';
import BookingForm from './components/BookingForm';

// A custom modal component to display confirmation messages
const ConfirmationModal = ({ title, message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform transition-all scale-100 ease-out duration-300">
        <h3 className="text-2xl font-bold text-sparkle-blue mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors transform hover:scale-105"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main App component
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [customer, setCustomer] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const profileRef = useRef();
  // Listen for customer login state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCustomer(user);
      if (user) {
        setBookingsLoading(true);
        const fetchBookings = async () => {
          try {
            const q = query(
              collection(db, 'bookings'),
              where('userId', '==', user.uid),
              orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            setRecentBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          } catch (e) {
            setRecentBookings([]);
          }
          setBookingsLoading(false);
        };
        fetchBookings();
      } else {
        setRecentBookings([]);
      }
    });
    // Close dropdown on outside click
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => {
      unsub();
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);
  const [showPromo, setShowPromo] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({
    service: '',
    location: '',
    lat: null,
    lng: null,
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
  });
  // Google Maps API loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDcVN1C_ZFgn1smrKc5TyWQPraFZk4rJas',
  });
  const [showModal, setShowModal] = useState(false);
  const [manualLocation, setManualLocation] = useState(false);

  const MAINTENANCE_MODE = false; // Set to true to enable maintenance page

  const navigate = useNavigate();
  const location = useLocation();

  // For legacy navigation (button clicks)
  const navigateTo = (page) => {
    if (page === 'admin') {
      navigate('/admin');
    } else if (page === 'customer-login') {
      navigate('/login');
    } else {
      setCurrentPage(page);
      setBookingStep(1);
      navigate('/');
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = (e) => {
    e.preventDefault();

    // Prepare email parameters
    const templateParams = {
      service: bookingDetails.service,
      location: bookingDetails.location,
      date: bookingDetails.date,
      time: bookingDetails.time,
      name: bookingDetails.name,
      email: bookingDetails.email,
      phone: bookingDetails.phone,
      to_email: 'jrcosroy.walker@gmail.com', // <-- add this line
    };

    // Send business notification
    emailjs.send(
      'service_wamhblr',
      'template_kvbn3sg',
      { ...templateParams, to_email: 'jrcosroy.walker@gmail.com' },
      '45y0OsA7oxKrQg63X'
    )
    .then((response) => {
      // Send customer confirmation
      emailjs.send(
        'service_wamhblr',
        'template_4c7li4m',
        { ...templateParams, to_email: bookingDetails.email },
        '45y0OsA7oxKrQg63X'
      ).then(() => {
        setShowModal(true);
      }, (error) => {
        alert('Failed to send confirmation email to customer.');
      });
    }, (error) => {
      alert('Failed to send booking email. Please try again.');
    });
  };

  // Close the modal and navigate to home
  const closeModalAndNavigateHome = () => {
    setShowModal(false);
    navigateTo('home');
  };

  // The comprehensive list of services provided by the user, categorized for clarity.
  const services = [
    {
      category: 'Wash and Vac',
      items: [
        { id: 1, name: 'Wash and Vac (Small Car)', price: '$2,000', details: ['Vehicles like Vitz & Fit'] },
        { id: 2, name: 'Wash and Vac (Sedan)', price: '$2,200', details: [] },
        { id: 3, name: 'Wash and Vac (Small SUV)', price: '$2,500', details: ['Vehicles like HRV'] },
        { id: 4, name: 'Wash and Vac (Large SUV)', price: '$3,000', details: ['Vehicles like CRV, Prado'] },
        { id: 5, name: 'Wash and Vac (Small Bus)', price: '$3,500', details: ['Vehicles like Voxy, minivan, pick up'] },
        { id: 6, name: 'Wash and Vac (Large Bus)', price: '$4,500', details: ['Vehicles like large Hiace, large pick up'] },
        { id: 7, name: 'Wash and Vac (Extra Large Bus)', price: '$5,000', details: ['Vehicles like Coaster'] },
        { id: 8, name: 'Wash and Vac (Small Truck)', price: '$6,000', details: ['Vehicles like Elf, Isuzu'] },
        { id: 9, name: 'Wash and Vac (Large Truck)', price: '$7,000', details: ['Vehicles like Isuzu'] },
        { id: 10, name: 'Wash and Vac (Trailer Head)', price: '$6,000', details: [] },
        { id: 11, name: 'Wash and Vac (Trailer Front & Back)', price: '$15,000', details: [] },
        { id: 12, name: 'Wash and Vac (Dumper Truck)', price: '$13,000', details: [] },
        { id: 13, name: 'Wash and Vac (Tracker & Backhoe)', price: '$15,000', details: [] },
      ],
    },
    {
      category: 'Detailing',
      items: [
        { id: 14, name: 'Seat Only Detail', price: 'Starts at $15,000', details: [] },
        { id: 15, name: 'Full Interior Detail', price: 'Starts at $25,000', details: ['Includes seats, roof, and doors'] },
        { id: 16, name: 'Full Interior Detail (with seat removal)', price: 'Starts at $35,000', details: [] },
        { id: 17, name: 'Headlight Restoration', price: 'Starts at $3,000', details: [] },
        { id: 18, name: 'Plastic Restoration', price: 'Starts at $3,000', details: [] },
        { id: 19, name: 'Buff and Polish', price: 'Starts at $30,000', details: [] },
        { id: 20, name: 'Undercarriage Wash', price: 'Starts at $3,000', details: [] },
        { id: 21, name: 'Engine Wash', price: 'Starts at $3,000', details: [] },
        { id: 22, name: 'Leather Interior Detail', price: 'Starts at $10,000', details: [] },
        { id: 23, name: 'Steam Cleaning Car Seat', price: 'Starts at $15,000', details: [] },
        { id: 24, name: 'Steam Clean Sofa', price: 'Starts at $15,000', details: [] },
      ],
    },
    {
      category: 'Specialty Cleaning',
      items: [
        { id: 25, name: 'Wall Cleaning', price: 'Please call for quote', details: [] },
        { id: 26, name: 'Building Roof Cleaning', price: 'Starts at $15,000', details: [] },
        { id: 27, name: 'Driveway Cleaning', price: 'Starts at $10,000', details: [] },
        { id: 28, name: 'Carpet Cleaning', price: 'Starts at $5,000', details: [] },
        { id: 29, name: 'Sofa Cleaning', price: 'Starts at $10,000', details: [] },
        { id: 30, name: 'Mattress Cleaning', price: 'Starts at $10,000', details: [] },
      ],
    },
  ];

  // Dummy data for workers
  const workers = [
    { id: 1, name: 'Nick', bio: 'Expert detailer with 5 years of experience.', imageUrl: 'https://placehold.co/100x100/CCCCCC/666666?text=Nick' },
    { id: 2, name: 'Ricardo', bio: 'Passionate about cars and making them shine.', imageUrl: 'https://placehold.co/100x100/CCCCCC/666666?text=Ricardo' },
    { id: 3, name: 'Antony', bio: 'Our fastest and most efficient team member.', imageUrl: 'https://placehold.co/100x100/CCCCCC/666666?text=Antony' },
    { id: 4, name: 'Radcliffe', bio: 'Dedicated to delivering top-notch service.', imageUrl: 'https://placehold.co/100x100/CCCCCC/666666?text=Radcliffe' },
  ];

  // Worker schedules data
  const workerSchedules = [
    {
      name: 'Nick',
      start: '06:00',
      end: '15:00',
      interval: 90, // minutes
      dayOff: 1, // Monday (0=Sunday, 1=Monday, ...)
    },
    {
      name: 'Antony',
      start: '07:30',
      end: '16:00',
      interval: 90,
      lunch: { start: '12:00', end: '13:00' },
      dayOff: 2, // Tuesday
    },
    {
      name: 'Ricardo',
      start: '06:30',
      end: '16:30',
      interval: 120,
      dayOff: 3, // Wednesday
    },
    {
      name: 'Radcliffe',
      start: '07:30',
      end: '16:30',
      interval: 90,
      dayOff: 4, // Thursday
    },
  ];

  // Dummy data for worker schedules (for demonstration)
  const schedules = {
    '2025-08-15': [
      { time: '09:00', worker: workers[0] },
      { time: '10:30', worker: workers[1] },
      { time: '12:00', worker: workers[2] },
    ],
    '2025-08-16': [
      { time: '09:00', worker: workers[1] },
      { time: '11:00', worker: workers[0] },
    ],
  };

  function toMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }
  function toTimeString(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
  function getAvailableSlots(dateStr) {
    if (!dateStr) return [];
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ...
    const slots = [];

    workerSchedules.forEach(worker => {
      if (worker.dayOff === dayOfWeek) return; // Skip if day off

      let start = toMinutes(worker.start);
      let end = toMinutes(worker.end);

      while (start + worker.interval <= end) {
        // Skip lunch for Antony
        if (worker.lunch) {
          const lunchStart = toMinutes(worker.lunch.start);
          const lunchEnd = toMinutes(worker.lunch.end);
          if (start >= lunchStart && start < lunchEnd) {
            start = lunchEnd;
            continue;
          }
        }
        slots.push({
          time: toTimeString(start),
          worker: worker.name,
        });
        start += worker.interval;
      }
    });

    return slots;
  }

  const renderContent = () => {
    const showBackButton = currentPage !== 'home';
    const backButton = showBackButton ? (
      <BackButton onClick={() => navigateTo('home')} />
    ) : null;
    if (showPromo) {
      return <PromoPage onBack={() => setShowPromo(false)} />;
    }
    switch (currentPage) {
      case 'customer-login':
        return <CustomerLogin onBack={() => navigateTo('home')} />;
      case 'home':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center font-inter relative">
            {backButton}
            <div className="relative z-10 w-full">
              {/* Promo Tag */}
              {currentPage === 'home' && (
                <div className="flex justify-center w-full z-40 relative" style={{marginTop: 0}}>
                  <button
                    className="animate-wind bg-gradient-to-r from-[#6fff3e] via-[#19c2ff] to-[#f6ff6b] rounded-2xl shadow-2xl px-8 py-4 font-bold text-2xl text-white flex items-center promo-mobile hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-sparkle-blue"
                    style={{
                      filter: 'drop-shadow(0 6px 0 #19c2ff)',
                      minWidth: '350px',
                      maxWidth: '700px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      marginTop: '-5.25rem',
                      background: 'linear-gradient(90deg, #6fff3e 0%, #19c2ff 60%, #f6ff6b 100%)',
                      color: '#fff',
                      textShadow: '0 2px 8px rgba(0,0,0,0.10)',
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowPromo(true)}
                    aria-label="View Promotion"
                  >
                    <span role="img" aria-label="party">🎉</span>
                    <span className="ml-2">
                      <span className="text-yellow-300">New Promotion:</span> <span className="font-extrabold">Refer &amp; Save Big!</span>
                    </span>
                    <span className="ml-2" role="img" aria-label="party">🎉</span>
                  </button>
                </div>
              )}
              {/* Hero Section */}
              <div className="w-full min-h-screen flex flex-col items-center justify-center text-center p-8">
                {/* Logo Image */}
                <img src={logo} alt="Logo" className="h-14 md:h-20 mx-auto my-4" style={{maxWidth: '200px', width: '100%'}} />
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight" style={{textShadow: '0 2px 8px rgba(0,0,0,0.12)'}}>Experience the Difference</h1>
                {/* Book Now Button */}
                <div className="flex flex-col items-center mb-6">
                  <button
                    onClick={() => navigateTo('book')}
                    className="mb-6 px-10 py-4 bg-sparkle-blue text-white font-bold text-lg md:text-xl rounded-full shadow-lg hover:bg-sparkle-blue-dark transition-colors book-btn-mobile"
                    style={{minWidth: '200px'}}>
                    Book Now
                  </button>
                  <div className="flex flex-row gap-6">
                    <button onClick={() => navigateTo('services')} className="px-8 py-3 bg-white bg-opacity-90 text-sparkle-blue font-semibold text-base rounded-full shadow hover:bg-sparkle-blue hover:text-white transition-colors">Services</button>
                    <button onClick={() => navigateTo('team')} className="px-8 py-3 bg-white bg-opacity-90 text-sparkle-blue font-semibold text-base rounded-full shadow hover:bg-sparkle-blue hover:text-white transition-colors">Team</button>
                    <button onClick={() => navigateTo('contact')} className="px-8 py-3 bg-white bg-opacity-90 text-sparkle-blue font-semibold text-base rounded-full shadow hover:bg-sparkle-blue hover:text-white transition-colors">Contact</button>
                    <button onClick={() => navigateTo('about')} className="px-8 py-3 bg-white bg-opacity-90 text-sparkle-blue font-semibold text-base rounded-full shadow hover:bg-sparkle-blue hover:text-white transition-colors">About Us</button>
                  </div>
                </div>
                {/* Welcome Section */}
                <div className="mt-4 md:mt-6 max-w-3xl mx-auto bg-white bg-opacity-80 rounded-3xl p-10 text-center shadow-lg">
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-sparkle-blue tracking-tight">Welcome!</h2>
                  <p className="text-base md:text-lg mb-4">
                    Welcome to <span className="font-bold text-sparkle-blue">Sparkles Auto Spa</span>, Jamaica’s premier mobile car care service.<br />
                  </p>
                  <p className="text-base md:text-lg mb-4">
                    We bring <span className="font-bold text-sparkle-blue">professional detailing</span>, <span className="font-bold text-sparkle-blue">cleaning</span>, and <span className="font-bold text-yellow-400">shine</span> right to your doorstep.
                  </p>
                  <p className="text-lg md:text-xl font-extrabold text-sparkle-blue mt-6">
                    Experience convenience, quality, and a sparkling finish every time!
                  </p>
                </div>
                {/* Our Clients Section - styled to match screenshot */}
                <div className="mt-12 flex justify-center">
                  <div className="w-full max-w-6xl bg-white bg-opacity-80 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl">
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-sparkle-blue tracking-tight">Our Clients</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      {/* Card 1: Image */}
                      <div className="bg-white rounded-2xl shadow-md border-4 border-white p-3 flex flex-col items-center">
                        <img src={require('./assets/client1.jpg')} alt="Client 1" className="rounded-xl object-cover w-full h-44 mb-3" style={{maxWidth:'100%'}} />
                        <div className="text-left w-full">
                          <p className="text-base font-semibold text-sparkle-blue mb-1">"Sparkles made my SUV look brand new!"</p>
                          <p className="text-gray-700 text-sm">— Satisfied Client</p>
                        </div>
                      </div>
                      {/* Card 2: Video */}
                      <div className="bg-white rounded-2xl shadow-md border-4 border-white p-3 flex flex-col items-center">
                        <video controls className="rounded-xl object-cover w-full h-44 mb-3" style={{maxWidth:'100%'}}>
                          <source src={require('./assets/client2.mp4')} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                        <div className="text-left w-full">
                          <p className="text-base font-semibold text-sparkle-blue mb-1">"Amazing detailing, highly recommend!"</p>
                          <p className="text-gray-700 text-sm">— Happy Customer</p>
                        </div>
                      </div>
                      {/* Card 3: Image with gold border */}
                      <div className="bg-white rounded-2xl shadow-md border-4 p-3 flex flex-col items-center" style={{borderColor:'#ffd600'}}>
                        <img src={require('./assets/client3.jpg')} alt="Client 3" className="rounded-xl object-cover w-full h-44 mb-3" style={{maxWidth:'100%'}} />
                        <div className="text-left w-full">
                          <p className="text-base font-semibold text-sparkle-blue mb-1">"The best car spa in Montego Bay!"</p>
                          <p className="text-gray-700 text-sm">— Loyal Patron</p>
                        </div>
                      </div>
                    </div>
                    <button className="mt-2 px-8 py-3 bg-sparkle-blue text-white font-bold text-lg rounded-full shadow hover:bg-sparkle-blue-dark transition-colors">Become a Sparkles Client</button>
                  </div>
                </div>

                {/* Why Choose Us Section */}
                <div className="mt-16 flex justify-center">
                  <div className="w-full max-w-6xl bg-white bg-opacity-90 rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.10)'}}>
                    <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-sparkle-blue tracking-tight" style={{letterSpacing:'-1px'}}>Why Choose Us?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                      {/* Card 1: Professional Team */}
                      <div className="flex flex-col items-center">
                        <div className="bg-white rounded-full shadow-lg flex items-center justify-center mb-4" style={{width:'90px',height:'90px',boxShadow:'0 4px 16px 0 rgba(31, 38, 135, 0.10)'}}>
                          {/* Premium User Icon SVG */}
                          <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
                            <circle cx="27" cy="27" r="25" fill="#fff" stroke="#19c2ff" strokeWidth="2"/>
                            <ellipse cx="27" cy="20" rx="8" ry="8" fill="#19c2ff" stroke="#19c2ff" strokeWidth="1.5"/>
                            <path d="M16 40c2-7 9-9 11-9s9 2 11 9" stroke="#19c2ff" strokeWidth="2" strokeLinecap="round" fill="none"/>
                          </svg>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-sparkle-blue mb-1">Professional Team</h3>
                        <p className="text-gray-700 text-sm md:text-base">Experienced detailers dedicated to making your car shine.</p>
                      </div>
                      {/* Card 2: Mobile Convenience */}
                      <div className="flex flex-col items-center">
                        <div className="bg-white rounded-full shadow-lg flex items-center justify-center mb-4" style={{width:'90px',height:'90px',boxShadow:'0 4px 16px 0 rgba(31, 38, 135, 0.10)'}}>
                          {/* Premium Mobile Icon SVG */}
                          <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
                            <rect x="12" y="10" width="30" height="34" rx="9" fill="#fff" stroke="#19c2ff" strokeWidth="2"/>
                            <rect x="18" y="17" width="18" height="20" rx="5" fill="#19c2ff"/>
                            <circle cx="27" cy="36" r="3" fill="#19c2ff" stroke="#19c2ff" strokeWidth="1.5"/>
                          </svg>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-sparkle-blue mb-1">Mobile Convenience</h3>
                        <p className="text-gray-700 text-sm md:text-base">We come to you—home, office, or anywhere in Montego Bay.</p>
                      </div>
                      {/* Card 3: Quality Guaranteed */}
                      <div className="flex flex-col items-center">
                        <div className="bg-white rounded-full shadow-lg flex items-center justify-center mb-4" style={{width:'90px',height:'90px',boxShadow:'0 4px 16px 0 rgba(31, 38, 135, 0.10)'}}>
                          {/* Premium Star Icon SVG */}
                          <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
                            <circle cx="27" cy="27" r="25" fill="#fff" stroke="#19c2ff" strokeWidth="2"/>
                            <path d="M27 16l3.6 7.3 8.1 1.2-5.9 5.7 1.4 8-7.2-3.8-7.2 3.8 1.4-8-5.9-5.7 8.1-1.2L27 16z" fill="#19c2ff" stroke="#19c2ff" strokeWidth="2"/>
                            <circle cx="27" cy="27" r="4" fill="#19c2ff" stroke="#19c2ff" strokeWidth="1.5"/>
                          </svg>
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-sparkle-blue mb-1">Quality Guaranteed</h3>
                        <p className="text-gray-700 text-sm md:text-base">Top products and attention to detail for a sparkling finish every time.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Services Preview Section */}
              <div className="py-16 flex justify-center">
                <div className="w-full max-w-6xl bg-white bg-opacity-80 rounded-full p-12 md:p-16 text-center shadow-2xl">
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-8 text-sparkle-blue tracking-tight" style={{letterSpacing:'-1px'}}>Our Popular Services</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services[0].items.slice(0, 3).map(service => (
                      <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-200" style={{minHeight:'200px'}}>
                        <h3 className="text-base md:text-lg font-bold text-sparkle-blue mb-1">{service.name}</h3>
                        <p className="text-gray-500 text-sm md:text-base mb-4">{service.details.length > 0 ? service.details.join(', ') : 'Details vary by vehicle.'}</p>
                        <button
                          onClick={() => {
                            setBookingDetails(prev => ({ ...prev, service: service.name }));
                            navigateTo('book');
                          }}
                          className="px-6 py-2 bg-sparkle-blue text-white font-bold text-base rounded-full shadow-lg hover:bg-sparkle-blue-dark transition-colors book-btn-mobile"
                          style={{minWidth: '110px', fontSize: '1rem'}}
                        >
                          Book Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="container mx-auto px-2 sm:px-4 py-16 min-h-screen bg-gray-50 font-inter rounded-3xl">
            {backButton}
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 animate-fade-in-up">Our Full Services Menu</h2>
            {services.map((category, catIndex) => (
              <div key={catIndex} className="mb-12">
                <h3 className="text-3xl font-bold text-sparkle-blue mb-6 border-b-2 border-gray-300 pb-2">{category.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.items.map(service => (
                    <div key={service.id} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-200 transform transition-transform hover:scale-105 hover:shadow-xl animate-card-fade-in">
                      <h4 className="text-2xl font-bold text-gray-900">{service.name}</h4>
                      <p className="text-lg text-sparkle-green mt-2"><strong>Price:</strong> {service.price}</p>
                      {service.details.length > 0 && (
                        <ul className="list-disc list-inside mt-4 text-gray-500">
                          {service.details.map((detail, index) => <li key={index}>{detail}</li>)}
                        </ul>
                      )}
                      <button
                        onClick={() => {
                          setBookingDetails(prev => ({ ...prev, service: service.name }));
                          navigateTo('book');
                        }}
                        className="mt-6 w-full px-6 py-3 bg-sparkle-blue text-white font-semibold rounded-full hover:bg-sparkle-blue-dark transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );

      case 'team':
        return (
          <div className="container mx-auto px-2 sm:px-4 py-16 min-h-screen bg-gray-50 font-inter rounded-3xl">
            {backButton}
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 animate-fade-in-up">Meet Our Expert Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {workers.map(worker => (
                <div key={worker.id} className="bg-white p-8 rounded-xl shadow-lg text-center border border-gray-200 transform transition-transform hover:scale-105 animate-card-fade-in">
                  <img src={worker.imageUrl} alt={worker.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-sparkle-green" />
                  <h3 className="text-2xl font-bold text-gray-900">{worker.name}</h3>
                  <p className="text-gray-500 mt-2">{worker.bio}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'book':
        return (
          <div className="container mx-auto px-2 sm:px-4 py-16 min-h-screen bg-gray-50 font-inter">
            {backButton}
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 animate-fade-in-up">Book Your Appointment</h2>
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto border border-gray-200 animate-fade-in">
              <form onSubmit={handleBookingSubmit}>
                {/* Step 1: Service Selection */}
                {bookingStep === 1 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">1. Choose a Service</h3>
                    <select
                      name="service"
                      value={bookingDetails.service}
                      onChange={handleBookingChange}
                      className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green"
                    >
                      <option value="">-- Select a Service --</option>
                      {services.flatMap(category => category.items).map(s => (
                        <option key={s.id} value={s.name}>{s.name} - {s.price}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setBookingStep(2)}
                      disabled={!bookingDetails.service}
                      className="mt-6 w-full px-6 py-3 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Step 2: Location Input */}
                {bookingStep === 2 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">2. Enter Location</h3>
                    <Autocomplete
                      apiKey="AIzaSyDcVN1C_ZFgn1smrKc5TyWQPraFZk4rJas"
                      options={{
                        types: ['address'],
                        componentRestrictions: { country: 'US' },
                      }}
                      onPlaceSelected={(place) => {
                        const lat = place.geometry?.location?.lat();
                        const lng = place.geometry?.location?.lng();
                        setBookingDetails(prev => ({ ...prev, location: place.formatted_address, lat, lng }));
                        setManualLocation(false);
                      }}
                      className={`w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green ${manualLocation ? 'hidden' : ''}`}
                      placeholder="Start typing your address..."
                    />
                    {/* Only render the map if not in manual location mode */}
                    {!manualLocation && (
                      <div className="my-6">
                        {isLoaded && (
                          <GoogleMap
                            mapContainerStyle={{ width: '100%', height: '300px', borderRadius: '1rem' }}
                            center={{
                              lat: bookingDetails.lat || 18.1096, // Default Jamaica
                              lng: bookingDetails.lng || -77.2975,
                            }}
                            zoom={bookingDetails.lat && bookingDetails.lng ? 15 : 8}
                            onClick={e => {
                              setBookingDetails(prev => ({
                                ...prev,
                                lat: e.latLng.lat(),
                                lng: e.latLng.lng(),
                                location: `Lat: ${e.latLng.lat().toFixed(5)}, Lng: ${e.latLng.lng().toFixed(5)}`
                              }));
                            }}
                          >
                            {bookingDetails.lat && bookingDetails.lng && (
                              <Marker
                                position={{ lat: bookingDetails.lat, lng: bookingDetails.lng }}
                                draggable={true}
                                onDragEnd={e => {
                                  setBookingDetails(prev => ({
                                    ...prev,
                                    lat: e.latLng.lat(),
                                    lng: e.latLng.lng(),
                                    location: `Lat: ${e.latLng.lat().toFixed(5)}, Lng: ${e.latLng.lng().toFixed(5)}`
                                  }));
                                }}
                              />
                            )}
                          </GoogleMap>
                        )}
                      </div>
                    )}
                    <div className={`mt-4 ${manualLocation ? '' : 'hidden'}`}> 
                      <input
                        type="text"
                        name="location"
                        value={bookingDetails.location}
                        onChange={handleBookingChange}
                        className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green"
                        placeholder="Enter your location manually"
                      />
                      <button
                        type="button"
                        onClick={() => setManualLocation(false)}
                        className="mt-2 px-4 py-2 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors"
                      >
                        Use Autocomplete
                      </button>
                    </div>
                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setBookingStep(1)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors">Back</button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(3)}
                        disabled={!bookingDetails.location && !(bookingDetails.lat && bookingDetails.lng)}
                        className="px-6 py-3 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Date & Time Selection */}
                {bookingStep === 3 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">3. Choose Date & Time</h3>
                    <input
                      type="date"
                      name="date"
                      value={bookingDetails.date}
                      onChange={handleBookingChange}
                      className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green mb-4"
                    />
                    <select
                      name="time"
                      value={bookingDetails.time}
                      onChange={handleBookingChange}
                      className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green"
                    >
                      <option value="">-- Select a Time Slot --</option>
                      {bookingDetails.date ? (
                        getAvailableSlots(bookingDetails.date).length > 0 ? (
                          getAvailableSlots(bookingDetails.date).map((slot, index) => (
                            <option key={index} value={`${slot.time} (${slot.worker})`}>
                              {slot.time} (Worker: {slot.worker})
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>No slots available</option>
                        )
                      ) : (
                        <option value="" disabled>Select a date first</option>
                      )}
                    </select>
                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setBookingStep(2)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors">Back</button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(4)}
                        disabled={!bookingDetails.date || !bookingDetails.time}
                        className="px-6 py-3 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Customer Details */}
                {bookingStep === 4 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">4. Your Details</h3>
                    <input type="text" name="name" placeholder="Full Name" value={bookingDetails.name} onChange={handleBookingChange} className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green mb-4" />
                    <input type="email" name="email" placeholder="Email Address" value={bookingDetails.email} onChange={handleBookingChange} className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green mb-4" />
                    <input type="tel" name="phone" placeholder="Phone Number" value={bookingDetails.phone} onChange={handleBookingChange} className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green mb-4" />
                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setBookingStep(3)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors">Back</button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(5)}
                        disabled={!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone}
                        className="px-6 py-3 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors disabled:opacity-50"
                      >
                        Submit Booking
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Confirmation */}
                {bookingStep === 5 && (
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">Booking Confirmation</h3>
                    <p className="text-gray-700 mb-6">
                      Thank you, {bookingDetails.name}! Your booking has been received.
                      <br />
                      We will contact you shortly to confirm the details.
                    </p>
                    <button
                      onClick={closeModalAndNavigateHome}
                      className="px-6 py-3 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors"
                    >
                      Back to Home
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div className="container mx-auto px-2 sm:px-4 py-16 min-h-screen bg-gray-50 font-inter rounded-3xl shadow-2xl border border-gray-100">
            {backButton}
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 animate-fade-in-up">Contact Us</h2>
            <div className="max-w-lg mx-auto bg-white p-10 rounded-3xl shadow-2xl border border-gray-200 animate-card-fade-in">
              <h3 className="text-2xl font-bold text-sparkle-blue mb-4">Get in Touch</h3>
              <p className="text-gray-600 mb-6 text-lg font-medium">
                We would love to hear from you! Whether you have a question, feedback, or need assistance, feel free to reach out to us.
              </p>
              <div className="mb-6 flex items-center gap-4">
                <span className="block text-gray-800 font-semibold">Phone:</span>
                <a href="tel:876-471-6676" className="text-2xl font-extrabold text-sparkle-green hover:underline tracking-wide">
                  876-471-6676
                </a>
              </div>
              <div className="mb-6 flex items-center gap-4">
                <span className="block text-gray-800 font-semibold">Email:</span>
                <a href="mailto:info@sparklesautospa.com" className="text-lg text-sparkle-blue hover:underline font-semibold">
                  info@sparklesautospa.com
                </a>
              </div>
              <div className="mb-6">
                <span className="block text-gray-800 font-semibold mb-2">Follow us:</span>
                <div className="flex space-x-4">
                  <a
                    href="https://wa.me/18764716676"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 transition-colors text-2xl"
                  >
                    <i className="fab fa-whatsapp"></i> WhatsApp
                  </a>
                  <a
                    href="https://www.instagram.com/sparkles_autospa/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-800 transition-colors text-2xl"
                  >
                    <i className="fab fa-instagram"></i> Instagram
                  </a>
                </div>
              </div>
              {/* Contact Form */}
              <div className="bg-gray-50 p-8 rounded-2xl shadow-lg border border-gray-100 animate-card-fade-in mt-8">
                <h3 className="text-xl font-bold text-sparkle-blue mb-4">Send us a Message</h3>
                <form className="space-y-4">
                  <input type="text" placeholder="Your Name" className="w-full p-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green text-base" />
                  <input type="email" placeholder="Your Email" className="w-full p-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green text-base" />
                  <textarea placeholder="Your Message" rows="4" className="w-full p-3 rounded-lg bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green text-base"></textarea>
                  <button type="submit" className="w-full px-6 py-3 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors text-lg shadow-md">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <section className="relative min-h-screen flex flex-col items-center justify-start py-0 px-0 font-inter overflow-x-hidden bg-gradient-to-br from-[#eaf6fb] via-[#e8fbe6] to-[#fafdff] rounded-3xl">
            {backButton}
            {/* Premium Gradient Header */}
            <div className="w-full max-w-6xl mx-auto bg-gradient-to-r from-[#e3f0fa] to-[#e6ffe6] py-16 px-4 flex flex-col items-center justify-center text-center shadow-lg rounded-[2.5rem] relative z-10 border-b border-[#e0e7ef]" style={{marginTop:'2.5rem', marginBottom:'2.5rem', boxSizing:'border-box'}}>
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#2196f3] drop-shadow mb-4 tracking-tight" style={{letterSpacing:'-2px'}}>About <span className="text-[#6ec6ff]">Sparkles Auto Spa</span></h1>
              <p className="text-xl md:text-2xl text-[#3a4a5a] font-medium max-w-2xl mx-auto mb-6 leading-relaxed" style={{textShadow:'0 1px 4px rgba(33,150,243,0.04)'}}>We’re passionate about making every car shine and every customer smile. Discover our story, our team, and what makes us Jamaica’s favorite auto spa.</p>
            </div>
            {/* Glassmorphism Card with Mission and Images */}
            <div className="relative z-20 w-full max-w-5xl mx-auto rounded-[3.5rem] shadow-xl border border-[#e0e7ef] bg-white/70 backdrop-blur-[6px] p-6 md:p-14 flex flex-col md:flex-row gap-10 items-center mt-[-3rem] animate-fade-in-up" style={{boxShadow:'0 8px 32px 0 rgba(31, 38, 135, 0.08)'}}>
              {/* Left: Mission Content */}
              <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-[#2196f3] mb-4 tracking-tight flex items-center gap-3">
                  <svg className="w-9 h-9 text-sparkle-green" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#52eb32"/><path d="M10 17.5l4 4 8-8" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Our Mission
                </h2>
                <p className="text-lg md:text-xl text-[#3a4a5a] font-medium mb-6 max-w-xl">To deliver exceptional auto care with a personal touch, using the best products, the latest techniques, and a team that truly cares about your vehicle.</p>
                <div className="flex flex-wrap gap-3 mb-8">
                  <span className="inline-block px-4 py-2 rounded-full bg-[#e3f0fa] text-[#2196f3] font-bold text-sm shadow-sm border border-[#d0e6f7]">Quality</span>
                  <span className="inline-block px-4 py-2 rounded-full bg-[#f2f8f2] text-[#2196f3] font-bold text-sm shadow-sm border border-[#d0e6f7]">Expertise</span>
                  <span className="inline-block px-4 py-2 rounded-full bg-[#f2f8f2] text-[#2196f3] font-bold text-sm shadow-sm border border-[#d0e6f7]">Passion</span>
                  <span className="inline-block px-4 py-2 rounded-full bg-white border border-[#b3e0ff] text-[#2196f3] font-bold text-sm shadow-sm">Customer Focus</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-semibold text-[#2196f3] mb-3 mt-6">Why Choose Us?</h3>
                <ul className="mb-4 text-base md:text-lg text-[#3a4a5a] list-none flex flex-col gap-3">
                  <li className="flex items-center gap-3"><span className="inline-block w-4 h-4 bg-[#b3e0ff] rounded-full"></span> Premium products to protect and enhance your vehicle</li>
                  <li className="flex items-center gap-3"><span className="inline-block w-4 h-4 bg-[#b3e0ff] rounded-full"></span> Meticulous attention to detail—no spot overlooked</li>
                  <li className="flex items-center gap-3"><span className="inline-block w-4 h-4 bg-[#b3e0ff] rounded-full"></span> Friendly, professional staff who love what they do</li>
                  <li className="flex items-center gap-3"><span className="inline-block w-4 h-4 bg-[#b3e0ff] rounded-full"></span> 100% commitment to your satisfaction</li>
                </ul>
                <div className="w-full flex justify-center md:justify-start mt-8">
                  <div className="bg-gradient-to-r from-[#b3e0ff] to-[#6fff3e] px-10 py-5 rounded-full shadow text-xl md:text-2xl font-bold text-[#2196f3] animate-wind border border-[#e0e7ef]" style={{background:'linear-gradient(90deg, #e3f0fa 0%, #e6ffe6 100%)', color:'#2196f3'}}>Experience the Sparkle Difference Today!</div>
                </div>
              </div>
              {/* Right: Premium Image Grid */}
              <div className="flex-1 grid grid-cols-2 gap-6 bg-gradient-to-br from-[#fafdff] via-[#e3f0fa] to-[#e6ffe6] p-4 rounded-2xl border border-[#e0e7ef] shadow-sm">
                <img src={require('./assets/WhatsApp Image 2025-08-25 at 12.28.31 (1).jpeg')} alt="About 1" className="rounded-3xl shadow-md border border-[#e0e7ef] object-cover aspect-square transition-transform duration-300 hover:scale-105" />
                <img src={require('./assets/WhatsApp Image 2025-08-25 at 12.28.32 (2).jpeg')} alt="About 2" className="rounded-3xl shadow-md border border-[#e0e7ef] object-cover aspect-square transition-transform duration-300 hover:scale-105" />
                <img src={require('./assets/WhatsApp Image 2025-08-25 at 12.28.32.jpeg')} alt="About 3" className="rounded-3xl shadow-md border border-[#e0e7ef] object-cover aspect-square transition-transform duration-300 hover:scale-105" />
                <img src={require('./assets/WhatsApp Image 2025-08-25 at 12.28.33.jpeg')} alt="About 4" className="rounded-3xl shadow-md border border-[#e0e7ef] object-cover aspect-square transition-transform duration-300 hover:scale-105" />
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  if (MAINTENANCE_MODE) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-inter">
        <div className="bg-white bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl text-center max-w-md mx-auto">
          <img src={logo} alt="Logo" className="h-20 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-sparkle-blue mb-4">Site Under Maintenance</h1>
          <p className="text-gray-700 mb-6">
            Sparkles Auto Spa is currently undergoing scheduled maintenance.<br />
            Please check back soon!
          </p>
        </div>
      </div>
    );
  }

  // React Router routes
  return (
    <>
      <style>
        {`
          @media (max-width: 640px) {
            .container, .max-w-6xl, .min-h-screen, .rounded-full, .rounded-2xl, .rounded-3xl, .rounded-xl {
              border-radius: 1.2rem !important;
            }
            .shadow-2xl, .shadow-lg {
              box-shadow: 0 2px 12px 0 rgba(31,38,135,0.10) !important;
            }
            .fixed.top-4.left-4 {
              top: 0.5rem !important;
              left: 0.5rem !important;
            }
            .px-5 {
              padding-left: 0.75rem !important;
              padding-right: 0.75rem !important;
            }
            .py-2 {
              padding-top: 0.4rem !important;
              padding-bottom: 0.4rem !important;
            }
            .text-base {
              font-size: 0.98rem !important;
            }
            .md\:text-lg {
              font-size: 1.05rem !important;
            }
            .text-2xl {
              font-size: 1.25rem !important;
            }
            .text-3xl {
              font-size: 1.45rem !important;
            }
            .text-4xl {
              font-size: 1.7rem !important;
            }
            .h-20, .md\:h-24 {
              height: 3.2rem !important;
              max-height: 3.2rem !important;
            }
            .p-8, .md\:p-12, .p-10, .p-12, .md\:p-16 {
              padding: 1.2rem !important;
            }
            .py-16 {
              padding-top: 1.5rem !important;
              padding-bottom: 1.5rem !important;
            }
            .mt-12, .mt-16, .mb-12, .mb-8, .mt-8 {
              margin-top: 1.2rem !important;
              margin-bottom: 1.2rem !important;
            }
            .gap-8, .gap-10, .gap-6 {
              gap: 0.8rem !important;
            }
            .px-8 {
              padding-left: 0.8rem !important;
              padding-right: 0.8rem !important;
            }
            .py-3 {
              padding-top: 0.5rem !important;
              padding-bottom: 0.5rem !important;
            }
            .rounded-2xl, .rounded-3xl, .rounded-full, .rounded-xl {
              border-radius: 1.1rem !important;
            }
            .max-w-6xl {
              max-width: 98vw !important;
            }
            .min-h-screen {
              min-height: 100vh !important;
            }
            .promo-mobile {
              min-width: 220px !important;
              max-width: 95vw !important;
              font-size: 1.05rem !important;
              padding: 0.7rem 0.8rem !important;
            }
            .promo-mobile span {
              font-size: 1.1em !important;
            }
            .back-btn-mobile {
              min-width: 70px !important;
              font-size: 0.95rem !important;
              padding: 0.4rem 0.7rem !important;
            }
            .book-btn-mobile {
              min-width: 120px !important;
              font-size: 1rem !important;
              padding: 0.6rem 0.8rem !important;
            }
          }
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          .font-inter { font-family: 'Inter', sans-serif; }
          .bg-sparkle-green { background-color: #52eb32; }
          .hover\\:bg-sparkle-green-dark:hover { background-color: #40c529; }
          .text-sparkle-green { color: #52eb32; }
          .bg-sparkle-blue { background-color: #2196f3; }
          .hover\\:bg-sparkle-blue-dark:hover { background-color: #1a7ec2; }
          .text-sparkle-blue { color: #2196f3; }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 1s ease-out;
          }
          .animate-fade-in-up {
            animation: fadeInUp 1s ease-out;
          }
          .animate-slide-in-up {
            animation: fadeInUp 1s ease-out 0.5s backwards;
          }
          .animate-slide-in-up-delay {
            animation: fadeInUp 1s ease-out 0.7s backwards;
          }
          .animate-card-fade-in {
            animation: fadeIn 0.8s ease-out;
          }
          @keyframes wind {
            0% { transform: translateX(0) skewX(0deg); }
            20% { transform: translateX(-4px) skewX(-2deg); }
            40% { transform: translateX(2px) skewX(1deg); }
            60% { transform: translateX(-2px) skewX(-1deg); }
            80% { transform: translateX(2px) skewX(2deg); }
            100% { transform: translateX(0) skewX(0deg); }
          }
          .animate-wind {
            animation: wind 2.5s infinite cubic-bezier(.4,0,.2,1);
          }
        `}
      </style>
  <Routes>
        <Route
          path="/dashboard"
          element={<CustomerDashboard />}
        />
        <Route
          path="/admin"
          element={<AdminPage />}
        />
        <Route
          path="/login"
          element={
            <div
              className="min-h-screen text-gray-900 font-inter antialiased bg-cover bg-center"
              style={{
                background: 'linear-gradient(120deg, #19c2ff 0%, #6fff3e 60%, #f6ff6b 100%)',
                minHeight: '100vh',
              }}
            >
              <div className="min-h-screen flex flex-col">
                <nav className="bg-white bg-opacity-80 backdrop-blur-lg text-gray-800 py-4 shadow-xl sticky top-0 z-50 rounded-b-2xl">
                  <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <img
                        src={logo}
                        alt="Sparkles Auto Spa Logo"
                        className="h-12 w-auto cursor-pointer ml-[-0.3rem] md:h-16 md:ml-[-1rem] lg:h-20 lg:ml-[-2rem] transition-all duration-300"
                        style={{objectFit: 'contain'}}
                        onClick={() => navigateTo('home')}
                      />
                    </div>
                    {/* Customer profile or login button */}
                    <div className="flex items-center gap-4">
                      {customer ? (
                        <div className="relative flex items-center gap-4" ref={profileRef}>
                          <button
                            className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-sparkle-blue rounded-full shadow hover:bg-sparkle-blue hover:text-white transition-colors font-bold relative"
                            onClick={() => setProfileDropdownOpen((v) => !v)}
                          >
                            {customer.photoURL ? (
                              <img src={customer.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-sparkle-blue" />
                            ) : (
                              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-sparkle-blue text-white font-bold text-lg">
                                {customer.displayName ? customer.displayName[0] : 'U'}
                              </span>
                            )}
                            <span className="hidden sm:inline">{customer.displayName || 'Profile'}</span>
                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                          </button>
                          {profileDropdownOpen && (
                            <div className="absolute right-0 mt-12 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in p-4">
                              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                                {customer.photoURL ? (
                                  <img src={customer.photoURL} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-sparkle-blue" />
                                ) : (
                                  <span className="w-10 h-10 flex items-center justify-center rounded-full bg-sparkle-blue text-white font-bold text-xl">
                                    {customer.displayName ? customer.displayName[0] : 'U'}
                                  </span>
                                )}
                                <div>
                                  <div className="font-bold text-sparkle-blue">{customer.displayName || 'User'}</div>
                                  <div className="text-xs text-gray-500">{customer.email}</div>
                                </div>
                              </div>
                              <div className="mb-2 font-bold text-sparkle-blue">Recent Bookings</div>
                              {bookingsLoading ? (
                                <div className="text-gray-400 text-sm py-2">Loading...</div>
                              ) : recentBookings.length === 0 ? (
                                <div className="text-gray-400 text-sm py-2">No bookings found.</div>
                              ) : (
                                <ul className="max-h-48 overflow-y-auto space-y-2 mb-2">
                                  {recentBookings.slice(0, 5).map(booking => (
                                    <li key={booking.id} className="bg-gray-50 rounded-lg p-2 border border-sparkle-blue/30 flex flex-col">
                                      <span className="font-semibold text-sparkle-blue text-sm">{booking.service}</span>
                                      <span className="text-xs text-gray-600">{booking.date || 'N/A'} | {booking.paymentMethod || 'N/A'}</span>
                                      <button className="mt-1 text-xs text-sparkle-blue underline hover:text-sparkle-green text-left">Rebook</button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                              <button
                                className="w-full text-left px-4 py-2 mt-2 hover:bg-sparkle-blue hover:text-white transition-colors rounded-lg"
                                onClick={async () => { setProfileDropdownOpen(false); await signOut(auth); navigate('/'); }}
                              >
                                Log Out
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          className="px-5 py-2 bg-sparkle-blue text-white font-bold rounded-full shadow hover:bg-sparkle-blue-dark transition-colors ml-4"
                          style={{ fontSize: '1rem' }}
                          onClick={() => navigateTo('customer-login')}
                        >
                          Login
                        </button>
                      )}
                    </div>
                  </div>
                </nav>
                <main className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-full max-w-6xl mx-auto p-6 md:p-12 mt-8 mb-8">
                    <CustomerLogin onBack={() => navigateTo('home')} />
                  </div>
                </main>
              </div>
            </div>
          }
        />
        <Route
          path="/*"
          element={
            <div
              className="min-h-screen text-gray-900 font-inter antialiased bg-cover bg-center"
              style={{
                background: 'linear-gradient(120deg, #19c2ff 0%, #6fff3e 60%, #f6ff6b 100%)',
                minHeight: '100vh',
              }}
            >
              <div className="min-h-screen flex flex-col">
                <nav className="bg-white bg-opacity-80 backdrop-blur-lg text-gray-800 py-4 shadow-xl sticky top-0 z-50 rounded-b-2xl">
                  <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <img
                        src={logo}
                        alt="Sparkles Auto Spa Logo"
                        className="h-12 w-auto cursor-pointer ml-[-0.3rem] md:h-16 md:ml-[-1rem] lg:h-20 lg:ml-[-2rem] transition-all duration-300"
                        style={{objectFit: 'contain'}}
                        onClick={() => navigateTo('home')}
                      />
                    </div>
                    {customer ? (
                      <div className="relative flex items-center gap-4" ref={profileRef}>
                        <button
                          className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-sparkle-blue rounded-full shadow hover:bg-sparkle-blue hover:text-white transition-colors font-bold relative"
                          onClick={() => setProfileDropdownOpen((v) => !v)}
                        >
                          {customer.photoURL ? (
                            <img src={customer.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-sparkle-blue" />
                          ) : (
                            <span className="w-8 h-8 flex items-center justify-center rounded-full bg-sparkle-blue text-white font-bold text-lg">
                              {customer.displayName ? customer.displayName[0] : 'U'}
                            </span>
                          )}
                          <span className="hidden sm:inline">{customer.displayName || 'Profile'}</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {profileDropdownOpen && (
                          <div className="absolute right-0 mt-12 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in p-4">
                            <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                              {customer.photoURL ? (
                                <img src={customer.photoURL} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-sparkle-blue" />
                              ) : (
                                <span className="w-10 h-10 flex items-center justify-center rounded-full bg-sparkle-blue text-white font-bold text-xl">
                                  {customer.displayName ? customer.displayName[0] : 'U'}
                                </span>
                              )}
                              <div>
                                <div className="font-bold text-sparkle-blue">{customer.displayName || 'User'}</div>
                                <div className="text-xs text-gray-500">{customer.email}</div>
                              </div>
                            </div>
                            <div className="mb-2 font-bold text-sparkle-blue">Recent Bookings</div>
                            {bookingsLoading ? (
                              <div className="text-gray-400 text-sm py-2">Loading...</div>
                            ) : recentBookings.length === 0 ? (
                              <div className="text-gray-400 text-sm py-2">No bookings found.</div>
                            ) : (
                              <ul className="max-h-48 overflow-y-auto space-y-2 mb-2">
                                {recentBookings.slice(0, 5).map(booking => (
                                  <li key={booking.id} className="bg-gray-50 rounded-lg p-2 border border-sparkle-blue/30 flex flex-col">
                                    <span className="font-semibold text-sparkle-blue text-sm">{booking.service}</span>
                                    <span className="text-xs text-gray-600">{booking.date || 'N/A'} | {booking.paymentMethod || 'N/A'}</span>
                                    <button className="mt-1 text-xs text-sparkle-blue underline hover:text-sparkle-green text-left">Rebook</button>
                                  </li>
                                ))}
                              </ul>
                            )}
                            <button
                              className="w-full text-left px-4 py-2 mt-2 hover:bg-sparkle-blue hover:text-white transition-colors rounded-lg"
                              onClick={async () => { setProfileDropdownOpen(false); await signOut(auth); navigate('/'); }}
                            >
                              Log Out
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        className="px-5 py-2 bg-sparkle-blue text-white font-bold rounded-full shadow hover:bg-sparkle-blue-dark transition-colors ml-4"
                        style={{ fontSize: '1rem' }}
                        onClick={() => navigateTo('customer-login')}
                      >
                        Login
                      </button>
                    )}
                  </div>
                </nav>
                <main className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-full max-w-6xl mx-auto p-6 md:p-12 mt-8 mb-8">
                    {renderContent()}
                  </div>
                </main>
                {showModal && (
                  <ConfirmationModal
                    title="Booking Confirmed!"
                    message="Thank you for your booking. A confirmation email has been sent to the business and customer."
                    onClose={closeModalAndNavigateHome}
                  />
                )}
                <footer className="bg-white bg-opacity-80 backdrop-blur-lg text-gray-600 py-8 text-center border-t border-gray-200 shadow-xl rounded-t-2xl">
                  <div className="container mx-auto px-4">
                    <p>
                      &copy; {new Date().getFullYear()} Sparkles Auto Spa. All rights reserved.
                    </p>
                    <p className="mt-2 text-sparkle-green">
                      Contact Us: 876-471-6676
                    </p>
                    <div className="mt-4 space-x-4 flex justify-center">
                      <a
                        href="https://wa.me/18764716676"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 shadow-lg hover:scale-105 transition-transform"
                      >
                        WhatsApp
                      </a>
                      <a
                        href="https://www.instagram.com/sparkles_autospa/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-400 shadow-lg hover:scale-105 transition-transform"
                      >
                        Instagram
                      </a>
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default App;
