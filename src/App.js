import React, { useState, useEffect } from 'react';
import logo from './assets/logo.jpeg';
import emailjs from 'emailjs-com';
import Autocomplete from 'react-google-autocomplete';

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
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingDetails, setBookingDetails] = useState({
    service: '',
    location: '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
  });
  const [showModal, setShowModal] = useState(false);
  const [manualLocation, setManualLocation] = useState(false);

  const navigateTo = (page) => {
    setCurrentPage(page);
    setBookingStep(1); // Reset booking form when navigating
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
    };

    emailjs.send(
      'service_wamhblr',      // from EmailJS dashboard
      'template_kvbn3sg',     // from EmailJS dashboard
      templateParams,
      '45y0OsA7oxKrQg63X'          // from EmailJS dashboard
    )
    .then((response) => {
      setShowModal(true);
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
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
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
    switch (currentPage) {
      case 'home':
        return (
          <div className="min-h-screen flex flex-col items-center justify-center font-inter relative">
            {/* Glass effect overlay as the background */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <div className="w-full h-full rounded-3xl bg-white bg-opacity-10 backdrop-blur-xl border border-gray-200 shadow-2xl" />
            </div>
            <div className="relative z-10 w-full">
              {/* Hero Section */}
              <div className="w-full min-h-screen flex flex-col items-center justify-center text-center p-8">
                {/* Logo Image */}
                <img src={logo} alt="Logo" className="h-20 sm:h-32 mx-auto my-4" />
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-sparkle-blue mb-4">
                  Experience the Ultimate Shine
                </h1>
                <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                  At Sparkles Auto Spa, we bring the ultimate professional car care to your doorstep. Our team of experts ensures your vehicle sparkles like new.
                </p>
                <button
                  onClick={() => navigateTo('services')}
                  className="mt-8 md:mt-10 px-4 py-2 sm:px-6 sm:py-3 bg-sparkle-blue text-white font-bold rounded-full shadow hover:bg-sparkle-blue-dark transition-colors"
                >
                  Book Now
                </button>
              </div>
              {/* Services Preview Section */}
              <div className="py-16 bg-transparent">
                <div className="container mx-auto px-2 sm:px-4 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 animate-fade-in-up">Our Popular Services</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-12">
                    {services[0].items.slice(0, 3).map(service => (
                      <div key={service.id} className="bg-white bg-opacity-60 backdrop-blur-lg p-6 rounded-xl shadow-md transform transition-transform hover:scale-105 hover:shadow-xl border border-gray-200 animate-card-fade-in">
                        <h3 className="text-xl font-semibold text-sparkle-blue">{service.name}</h3>
                        <p className="mt-2 text-gray-500">{service.details.length > 0 ? service.details.join(', ') : 'Details vary by vehicle.'}</p>
                        <button
                          onClick={() => {
                            setBookingDetails(prev => ({ ...prev, service: service.name }));
                            navigateTo('book');
                          }}
                          className="mt-4 px-6 py-2 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors"
                        >
                          Book
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
          <div className="container mx-auto px-2 sm:px-4 py-16 min-h-screen bg-gray-50 font-inter">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 animate-fade-in-up">Our Full Services Menu</h2>
            {services.map((category, catIndex) => (
              <div key={catIndex} className="mb-12">
                <h3 className="text-3xl font-bold text-sparkle-blue mb-6 border-b-2 border-gray-300 pb-2">{category.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.items.map(service => (
                    <div key={service.id} className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 transform transition-transform hover:scale-105 hover:shadow-xl animate-card-fade-in">
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
          <div className="container mx-auto px-2 sm:px-4 py-16 min-h-screen bg-gray-50 font-inter">
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
                    {!manualLocation ? (
                      <>
                        <Autocomplete
                          apiKey="AIzaSyDpmGqY14Fcg01G3x9Nwtw9CUFClVUb-GI"
                          onPlaceSelected={(place) => {
                            setBookingDetails(prev => ({
                              ...prev,
                              location: place.formatted_address || ''
                            }));
                          }}
                          options={{
                            componentRestrictions: { country: 'jm' }, // Restrict to Jamaica
                            types: ['geocode'], // Only show address results
                          }}
                          className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green"
                          placeholder="Enter your address or location"
                        />
                        <button
                          type="button"
                          className="mt-4 text-sparkle-blue underline"
                          onClick={() => setManualLocation(true)}
                        >
                          Can't find your location? Enter it manually
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          name="location"
                          placeholder="Type your address or location"
                          value={bookingDetails.location}
                          onChange={handleBookingChange}
                          className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green"
                        />
                        <button
                          type="button"
                          className="mt-4 text-sparkle-blue underline"
                          onClick={() => setManualLocation(false)}
                        >
                          Use Google suggestions instead
                        </button>
                      </>
                    )}
                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setBookingStep(1)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors">Back</button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(3)}
                        disabled={!bookingDetails.location}
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
                        Review Booking
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 5: Confirmation */}
                {bookingStep === 5 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">5. Confirm Booking</h3>
                    <div className="bg-gray-100 p-6 rounded-lg text-gray-800 border border-gray-300">
                      <p className="mb-2"><strong>Service:</strong> {bookingDetails.service}</p>
                      <p className="mb-2"><strong>Location:</strong> {bookingDetails.location}</p>
                      <p className="mb-2"><strong>Date & Time:</strong> {bookingDetails.date} at {bookingDetails.time}</p>
                      <p className="mb-2"><strong>Name:</strong> {bookingDetails.name}</p>
                      <p className="mb-2"><strong>Email:</strong> {bookingDetails.email}</p>
                      <p className="mb-2"><strong>Phone:</strong> {bookingDetails.phone}</p>
                    </div>
                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setBookingStep(4)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors">Back</button>
                      <button type="submit" className="px-6 py-3 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors">
                        Confirm & Book
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="container mx-auto px-2 sm:px-4 py-16 min-h-screen bg-gray-50 font-inter">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 animate-fade-in-up">Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-card-fade-in">
                <h3 className="text-2xl font-bold text-sparkle-blue mb-4">Get in Touch</h3>
                <p className="text-gray-600 mb-4">
                  For immediate assistance or to book a service, you can reach us at:
                </p>
                <a href="tel:876-471-6676" className="text-4xl font-extrabold text-sparkle-green block mb-6 hover:underline">
                  876-471-6676
                </a>
                <p className="text-gray-600">
                  Follow us on social media for updates and special offers.
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
              {/* Contact Form */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-card-fade-in">
                <h3 className="text-2xl font-bold text-sparkle-blue mb-4">Send us a Message</h3>
                <form className="space-y-4">
                  <input type="text" placeholder="Your Name" className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green" />
                  <input type="email" placeholder="Your Email" className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green" />
                  <textarea placeholder="Your Message" rows="4" className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green"></textarea>
                  <button type="submit" className="w-full px-6 py-3 bg-sparkle-green text-white font-semibold rounded-full hover:bg-sparkle-green-dark transition-colors">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <style>
        {`
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
        `}
      </style>
      <div
        className="min-h-screen text-gray-900 font-inter antialiased bg-cover bg-center"
        style={{
          backgroundImage: `url(${logo})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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
                  className="h-16 cursor-pointer"
                  onClick={() => navigateTo('home')}
                />
              </div>
              <div className="space-x-4">
                <button onClick={() => navigateTo('home')} className="hover:text-sparkle-green transition-colors font-medium">Home</button>
                <button onClick={() => navigateTo('services')} className="hover:text-sparkle-green transition-colors font-medium">Services</button>
                <button onClick={() => navigateTo('team')} className="hover:text-sparkle-green transition-colors font-medium">Team</button>
                <button onClick={() => navigateTo('contact')} className="hover:text-sparkle-green transition-colors font-medium">Contact</button>
                <button onClick={() => navigateTo('book')} className="bg-sparkle-blue px-4 py-2 rounded-full text-white font-bold hover:bg-sparkle-blue-dark transition-colors">Book Now</button>
              </div>
            </div>
          </nav>
          <main className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-6xl mx-auto p-6 md:p-12 rounded-3xl shadow-2xl bg-white bg-opacity-70 backdrop-blur-lg border border-gray-200 mt-8 mb-8">
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
    </>
  );
};

export default App;
