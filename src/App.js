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
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import Autocomplete from 'react-google-autocomplete';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import BackButton from './BackButton';

// Loading Animation Component
const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sparkle-blue/90 to-sparkle-green/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center">
        {/* Spinning Logo */}
        <div className="relative">
          <img 
            src={logo} 
            alt="Loading" 
            className="h-24 w-24 animate-spin-slow"
          />
          <div className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        </div>
        {/* Loading Text */}
        <div className="mt-6 flex gap-2">
          <span className="text-white text-xl font-bold animate-bounce" style={{animationDelay: '0ms'}}>Loading</span>
          <span className="text-white text-xl font-bold animate-bounce" style={{animationDelay: '150ms'}}>.</span>
          <span className="text-white text-xl font-bold animate-bounce" style={{animationDelay: '300ms'}}>.</span>
          <span className="text-white text-xl font-bold animate-bounce" style={{animationDelay: '450ms'}}>.</span>
        </div>
      </div>
    </div>
  );
};

// WhatsApp Floating Widget Component
const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '18764716676';
  const defaultMessage = 'Hi Sparkles Auto Spa! I have a question.';

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Bubble (shows when clicked) */}
        {isOpen && (
          <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-4 w-80 max-w-[calc(100vw-3rem)] animate-fade-in-up border-2 border-green-500">
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-gray-800">Sparkles Auto Spa</div>
                  <div className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online now
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">
              👋 Hi there! How can we help you today?
            </p>
            
            <div className="space-y-2 mb-3">
              <button
                onClick={() => window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent('I want to book a service')}`)}
                className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                📅 Book a Service
              </button>
              <button
                onClick={() => window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent('What are your prices?')}`)}
                className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                💰 Ask About Pricing
              </button>
              <button
                onClick={() => window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent('Do you service my area?')}`)}
                className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                📍 Service Area
              </button>
            </div>
            
            <a
              href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-lg hover:from-green-500 hover:to-green-700 transition-all shadow-md"
            >
              Start Chat
            </a>
          </div>
        )}

        {/* Main WhatsApp Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform relative group"
          aria-label="Open WhatsApp Chat"
        >
          {/* Pulse animation */}
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>
          
          {/* WhatsApp Icon */}
          <svg className="w-8 h-8 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
          
          {/* Notification badge */}
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
            1
          </span>
        </button>
      </div>
    </>
  );
};

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
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [recentBookings, setRecentBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const profileRef = useRef();
  const continueButtonRef = useRef(null);
  const bookingFormRef = useRef(null);
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

  // Real-time listener for booked slots
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'bookings'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const slots = snapshot.docs.map(doc => ({
          id: doc.id,
          date: doc.data().date,
          time: doc.data().time,
          worker: doc.data().worker || 'Unknown',
          status: doc.data().status || 'pending',
        }));
        setBookedSlots(slots);
      },
      (error) => {
        console.error('Error listening to bookings:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const [showPromo, setShowPromo] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedVehicleSize, setSelectedVehicleSize] = useState('');
  const [bookingDetails, setBookingDetails] = useState({
    service: '',
    vehicleSize: '',
    location: '',
    lat: null,
    lng: null,
    date: '',
    time: '',
    name: '',
    email: '',
    phone: '',
    paymentMethod: '',
  });
  // Google Maps API loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyDcVN1C_ZFgn1smrKc5TyWQPraFZk4rJas',
  });
  const [showModal, setShowModal] = useState(false);
  const [manualLocation, setManualLocation] = useState(false);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const MAINTENANCE_MODE = false; // Set to true to enable maintenance page

  const navigate = useNavigate();
  const location = useLocation();

  // Enhanced navigation with loading animation
  const navigateTo = (page) => {
    setLoading(true);
    setTimeout(() => {
      if (page === 'admin') {
        navigate('/admin');
      } else if (page === 'customer-login') {
        navigate('/login');
      } else {
        setCurrentPage(page);
        // Only reset bookingStep to 1 if not on the book page
        if (page !== 'book') {
          setBookingStep(1);
        }
        navigate('/');
      }
      setLoading(false);
    }, 800);
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Save booking to Firestore with real-time sync
      const bookingData = {
        service: bookingDetails.service,
        vehicleSize: bookingDetails.vehicleSize,
        location: bookingDetails.location,
        lat: bookingDetails.lat,
        lng: bookingDetails.lng,
        date: bookingDetails.date,
        time: bookingDetails.time,
        name: bookingDetails.name,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        paymentMethod: bookingDetails.paymentMethod,
        userId: customer?.uid || null,
        status: 'pending',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

      // Prepare email parameters with Google Maps links
      const mapsUrl = bookingDetails.lat && bookingDetails.lng 
        ? `https://www.google.com/maps?q=${bookingDetails.lat},${bookingDetails.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bookingDetails.location)}`;
      
      const templateParams = {
        service: bookingDetails.service,
        vehicleSize: bookingDetails.vehicleSize,
        location: bookingDetails.location,
        lat: bookingDetails.lat || 'N/A',
        lng: bookingDetails.lng || 'N/A',
        mapsUrl: mapsUrl,
        date: bookingDetails.date,
        time: bookingDetails.time,
        name: bookingDetails.name,
        email: bookingDetails.email,
        phone: bookingDetails.phone,
        bookingId: docRef.id,
      };

      // Send business notification
      await emailjs.send(
        'service_wamhblr',
        'template_kvbn3sg',
        { ...templateParams, to_email: 'sparklesautospa01@gmail.com' },
        '45y0OsA7oxKrQg63X'
      );

      // Send customer confirmation
      await emailjs.send(
        'service_wamhblr',
        'template_4c7li4m',
        { ...templateParams, to_email: bookingDetails.email },
        '45y0OsA7oxKrQg63X'
      );

      setLoading(false);
      setShowModal(true);
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to complete booking. Please try again.');
      setLoading(false);
    }
  };

  // Close the modal and navigate to home
  const closeModalAndNavigateHome = () => {
    setShowModal(false);
    navigateTo('home');
  };

  // Cancel booking function
  const handleCancelBooking = async (bookingId, bookingDetails) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setLoading(true);
    try {
      // Update booking status to cancelled
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
      });

      // Send cancellation emails
      const templateParams = {
        service: bookingDetails.service,
        vehicleSize: bookingDetails.vehicleSize || 'N/A',
        date: bookingDetails.date,
        time: bookingDetails.time,
        name: bookingDetails.name || customer?.displayName,
        email: bookingDetails.email || customer?.email,
        bookingId: bookingId,
      };

    // Notify business
      await emailjs.send(
        'service_wamhblr',
        'template_kvbn3sg',
        { 
          ...templateParams, 
      to_email: 'sparklesautospa01@gmail.com',
          message: `CANCELLATION: ${templateParams.name} has cancelled their booking.`
        },
        '45y0OsA7oxKrQg63X'
      );

      alert('Booking cancelled successfully! A confirmation email has been sent.');
      setLoading(false);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again or contact us.');
      setLoading(false);
    }
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
    await emailjs.send(
        'service_wamhblr',
        'template_kvbn3sg', // Using existing business template
        {
          from_name: contactForm.name,
          from_email: contactForm.email,
          message: contactForm.message,
      to_email: 'sparklesautospa01@gmail.com',
          service: 'Contact Form Inquiry',
          actionMessage: `New message from ${contactForm.name} via contact form`,
          name: contactForm.name,
          email: contactForm.email,
          phone: 'Not provided',
          statusMessage: 'NEW CONTACT INQUIRY',
          statusColor: '#2196f3'
        },
        '45y0OsA7oxKrQg63X'
      );
      
      alert('Message sent successfully! We\'ll respond within 24 hours.');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please call us at 876-471-6676 or use WhatsApp.');
    }
    
    setFormSubmitting(false);
  };

  // Vehicle sizes with images
  const vehicleSizes = [
    {
      id: 'small-car',
      name: 'Small Car',
      examples: 'Vitz, Fit, March',
      image: require('./assets/small car.png'),
      services: ['Wash and Vac (Small Car)']
    },
    {
      id: 'sedan',
      name: 'Sedan',
      examples: 'Toyota Crown, Mark X',
      image: require('./assets/sedan.png'),
      services: ['Wash and Vac (Sedan)']
    },
    {
      id: 'small-suv',
      name: 'Small SUV',
      examples: 'HRV',
      image: require('./assets/small suv.png'),
      services: ['Wash and Vac (Small SUV)']
    },
    {
      id: 'medium-suv',
      name: 'Medium SUV',
      examples: 'CRV, RAV4',
      image: require('./assets/suv.png'),
      services: ['Wash and Vac (Medium SUV)']
    },
    {
      id: 'large-suv',
      name: 'Large SUV',
      examples: 'Prado, Land Cruiser',
      image: require('./assets/large suv.png'),
      services: ['Wash and Vac (Large SUV)']
    },
    {
      id: 'small-bus',
      name: 'Small Bus',
      examples: 'Voxy, Noah, Minivan',
      image: require('./assets/small bus.png'),
      services: ['Wash and Vac (Small Bus)']
    },
    {
      id: 'large-bus',
      name: 'Large Bus',
      examples: 'Hiace',
      image: require('./assets/large bus.png'),
      services: ['Wash and Vac (Large Bus)']
    },
    {
      id: 'pickup',
      name: 'Pickup',
      examples: 'Light & Large Pickup',
      image: require('./assets/pickup.png'),
      services: ['Wash and Vac (Pickup)']
    },
    {
      id: 'extra-large-bus',
      name: 'Extra Large Bus',
      examples: 'Coaster',
      image: require('./assets/extra large bus.png'),
      services: ['Wash and Vac (Extra Large Bus)']
    },
    {
      id: 'semi-truck',
      name: 'Trucks',
      examples: 'Small & Large Trucks',
      image: require('./assets/semi truck.png'),
      services: ['Wash and Vac (Small Truck)', 'Wash and Vac (Large Truck)', 'Wash and Vac (Trailer Head)', 'Wash and Vac (Trailer Front & Back)', 'Wash and Vac (Dumper Truck)']
    },
    {
      id: 'backhoe-tractor',
      name: 'Backhoe/Tractor',
      examples: 'Tracker & Backhoe',
      image: require('./assets/backhoe.png'),
      services: ['Wash and Vac (Tracker & Backhoe)']
    },
  ];

  // The comprehensive list of services provided by the user, categorized for clarity.
  const services = [
    {
      category: 'Wash and Vac',
      items: [
        { id: 1, name: 'Wash and Vac (Small Car)', price: '$2,000', details: ['Vehicles like Vitz & Fit'] },
        { id: 2, name: 'Wash and Vac (Sedan)', price: '$2,200', details: ['Vehicles like Toyota Crown & Mark X'] },
        { id: 3, name: 'Wash and Vac (Small SUV)', price: '$2,800', details: ['Vehicles like HRV'] },
        { id: 4, name: 'Wash and Vac (Medium SUV)', price: '$3,000', details: ['Vehicles like CRV, RAV4'] },
        { id: 5, name: 'Wash and Vac (Large SUV)', price: '$3,500', details: ['Vehicles like Prado, Land Cruiser'] },
        { id: 6, name: 'Wash and Vac (Small Bus)', price: '$3,500', details: ['Vehicles like Voxy, Minivan, Pick up'] },
        { id: 7, name: 'Wash and Vac (Large Bus)', price: '$4,500', details: ['Vehicles like Large Hiace, Large Pick up'] },
  { id: 31, name: 'Wash and Vac (Pickup)', price: 'Starts at $4,000', details: ['Price varies by pickup size'] },
        { id: 8, name: 'Wash and Vac (Extra Large Bus)', price: '$5,000', details: ['Vehicles like Coaster'] },
        { id: 9, name: 'Wash and Vac (Small Truck)', price: '$6,000', details: ['Vehicles like Elf, Isuzu'] },
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
    { id: 4, name: 'Radcliffe', bio: 'Dedicated to delivering top-notch service.', imageUrl: 'https://placehold.co/100x100/CCCCCC/666666?text=Radcliffe' },
  ];

  // Worker schedules data
  const workerSchedules = [
    {
      name: 'Nick',
  start: '06:30',
  end: '14:00',
      interval: 90, // minutes
      dayOff: 1, // Monday (0=Sunday, 1=Monday, ...)
      // Per-day overrides
      overrides: {
        // Sunday schedule: 7:00 AM – 2:30 PM
        0: { start: '07:00', end: '14:30', interval: 90 },
      },
    },
    {
      name: 'Ricardo',
      start: '06:30',
      end: '16:30',
      interval: 120,
  lastSlotInclusive: true, // include a 4:30 PM start
      dayOff: 3, // Wednesday
    },
    {
      name: 'Radcliffe',
  start: '06:30',
  end: '14:30',
  interval: 90,
  dayOff: 1, // Monday
  // Exact slots requested for remaining days
  customSlots: ['06:30', '08:30', '10:00', '11:30', '13:00', '14:30'],
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
  // Parse a YYYY-MM-DD date string in local time to avoid timezone shifts
  function getLocalDayOfWeek(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return new Date(dateStr).getDay(); // fallback
    const [y, m, d] = parts.map(Number);
    const localDate = new Date(y, (m || 1) - 1, d || 1);
    return localDate.getDay(); // 0=Sun ... 6=Sat in local timezone
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
    const dayOfWeek = getLocalDayOfWeek(dateStr); // 0=Sunday, 1=Monday, ...
    const slots = [];

    // Check if the selected service is a detailing service
    const detailingServices = [
      'Seat Only Detail',
      'Full Interior Detail',
      'Full Interior Detail (with seat removal)',
      'Headlight Restoration',
      'Plastic Restoration',
      'Buff and Polish',
      'Undercarriage Wash',
      'Engine Wash',
      'Leather Interior Detail',
      'Steam Cleaning Car Seat',
      'Steam Clean Sofa'
    ];
    const isDetailingService = detailingServices.includes(bookingDetails.service);

    workerSchedules.forEach(worker => {
      // Skip if day off or hard rule: Nick is off on Mondays (1)
      if (worker.dayOff === dayOfWeek || (worker.name === 'Nick' && dayOfWeek === 1)) return;
      
      // Only Nick can do detailing services
      if (isDetailingService && worker.name !== 'Nick') {
        return; // Skip workers who can't do detailing
      }

  // Apply per-day overrides if provided
  const override = worker.overrides ? worker.overrides[dayOfWeek] : undefined;
  const effectiveStart = override?.start || worker.start;
  const effectiveEnd = override?.end || worker.end;
  const effectiveInterval = override?.interval || worker.interval;

      const hasCustomSlots = Array.isArray(worker.customSlots) && worker.customSlots.length > 0;
      let start = toMinutes(effectiveStart);
      let end = toMinutes(effectiveEnd);

      const allowInclusiveEnd = !!worker.lastSlotInclusive;
      const pushSlot = (slotStartMinutes) => {
        const timeString = toTimeString(slotStartMinutes);
        const isBooked = bookedSlots.some(booking => {
          const isActiveStatus = !booking.status || booking.status === 'pending' || booking.status === 'confirmed';
          // Match exact time format: "10:00 AM (Nick)"
          const bookingTimeString = `${timeString} (${worker.name})`;
          return booking.date === dateStr && booking.time === bookingTimeString && isActiveStatus;
        });
        if (!isBooked) slots.push({ time: timeString, worker: worker.name });
      };

      if (hasCustomSlots) {
        // Use explicit slots within the working window
        worker.customSlots.forEach(ts => {
          const sm = toMinutes(ts);
          if (sm >= start && sm <= end) pushSlot(sm);
        });
      } else {
        while ((allowInclusiveEnd ? start <= end : start + effectiveInterval <= end)) {
        // Skip lunch if defined
        if (worker.lunch) {
          const lunchStart = toMinutes(worker.lunch.start);
          const lunchEnd = toMinutes(worker.lunch.end);
          if (start >= lunchStart && start < lunchEnd) {
            start = lunchEnd;
            continue;
          }
        }
          pushSlot(start);
          start += effectiveInterval;
          if (allowInclusiveEnd && start > end + effectiveInterval) break;
        }
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
                <div className="flex justify-center w-full z-40 px-4 md:px-0 mt-4">
                  <button
                    className="animate-wind rounded-2xl shadow-2xl px-3 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 font-bold text-sm sm:text-xl md:text-2xl text-white flex items-center justify-center promo-mobile hover:scale-105 transition-transform focus:outline-none focus:ring-4 focus:ring-sparkle-blue"
                    style={{
                      filter: 'drop-shadow(0 6px 0 #19c2ff)',
                      minWidth: '280px',
                      maxWidth: '90vw',
                      width: 'auto',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      background: 'linear-gradient(90deg, #3a8dde 0%, #bff7c5 60%, #19c2ff 100%)',
                      color: '#fff',
                      textShadow: '0 2px 8px rgba(0,0,0,0.10)',
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowPromo(true)}
                    aria-label="View Promotion"
                  >
                    <span role="img" aria-label="party" className="text-base sm:text-xl md:text-2xl">🎉</span>
                    <span className="ml-1 sm:ml-2 text-center flex-1">
                      <span className="text-yellow-300">New Promotion:</span>{' '}
                      <span className="font-extrabold">Refer &amp; Save Big!</span>
                    </span>
                    <span className="ml-1 sm:ml-2 text-base sm:text-xl md:text-2xl" role="img" aria-label="party">🎉</span>
                  </button>
                </div>
              )}
              {/* Hero Section */}
              <div className="w-full min-h-screen flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8">
                {/* Logo Image */}
                <img src={logo} alt="Logo" className="h-24 sm:h-20 md:h-24 mx-auto my-4 object-contain mt-16 sm:mt-4" style={{maxWidth: '260px', width: 'auto'}} />
                <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight px-4" style={{textShadow: '0 2px 8px rgba(0,0,0,0.12)'}}>Experience the Difference</h1>
                {/* Book Now Button */}
                <div className="flex flex-col items-center mb-4 sm:mb-6 w-full px-4 md:px-0">
                  <button
                    onClick={() => navigateTo('book')}
                    className="mb-4 sm:mb-6 px-8 sm:px-10 md:px-12 py-3 sm:py-4 bg-sparkle-blue text-white font-bold text-base sm:text-lg md:text-xl rounded-full shadow-lg hover:bg-sparkle-blue-dark transition-colors book-btn-mobile w-full sm:w-auto"
                    style={{maxWidth: '300px', minWidth: '200px'}}>
                    Book Now
                  </button>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
                    <button onClick={() => navigateTo('services')} className="px-6 sm:px-8 py-2 sm:py-3 bg-white bg-opacity-90 text-sparkle-blue font-semibold text-sm sm:text-base rounded-full shadow hover:bg-sparkle-blue hover:text-white transition-colors">Services</button>
                    <button onClick={() => navigateTo('team')} className="px-6 sm:px-8 py-2 sm:py-3 bg-white bg-opacity-90 text-sparkle-blue font-semibold text-sm sm:text-base rounded-full shadow hover:bg-sparkle-blue hover:text-white transition-colors">Team</button>
                    <button onClick={() => navigateTo('contact')} className="px-6 sm:px-8 py-2 sm:py-3 bg-white bg-opacity-90 text-sparkle-blue font-semibold text-sm sm:text-base rounded-full shadow hover:bg-sparkle-blue hover:text-white transition-colors">Contact</button>
                    <button onClick={() => navigateTo('about')} className="px-6 sm:px-8 py-2 sm:py-3 bg-white bg-opacity-90 text-sparkle-blue font-semibold text-sm sm:text-base rounded-full shadow hover:bg-sparkle-blue hover:text-white transition-colors">About Us</button>
                  </div>
                </div>
                {/* Welcome Section */}
                <div className="mt-4 md:mt-6 max-w-3xl mx-auto bg-white bg-opacity-80 rounded-3xl p-10 text-center shadow-lg">
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-sparkle-blue tracking-tight">Welcome!</h2>
                  <p className="text-base md:text-lg mb-4 text-black">
                    Welcome to Sparkles Auto Spa, Jamaica’s premier mobile car care service.<br />
                  </p>
                  <p className="text-base md:text-lg mb-4 text-black">
                    We bring professional detailing, cleaning, and shine right to your doorstep.
                  </p>
                  <p className="text-base md:text-lg font-bold text-black mt-6">
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
                        <video 
                          controls 
                          preload="metadata"
                          playsInline
                          muted
                          className="rounded-xl object-cover w-full h-44 mb-3 bg-gray-200" 
                          style={{maxWidth:'100%'}}
                          onLoadedMetadata={(e) => {
                            e.target.currentTime = 0.1;
                          }}
                        >
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
                    <button 
                      onClick={() => navigateTo('customer-login')}
                      className="mt-2 px-8 py-3 bg-sparkle-blue text-white font-bold text-lg rounded-full shadow hover:bg-sparkle-blue-dark transition-colors"
                    >
                      Become a Sparkles Client
                    </button>
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
                    {/* Replace first with a detailing service */}
                    {[services[1].items[0], ...services[0].items.slice(1, 3)].map(service => (
                      <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-gray-200" style={{minHeight:'200px'}}>
                        <h3 className="text-base md:text-lg font-bold text-sparkle-blue mb-1">{service.name}</h3>
                        <p className="text-gray-500 text-sm md:text-base mb-4">{service.details.length > 0 ? service.details.join(', ') : 'Details vary by vehicle.'}</p>
                        <button
                          onClick={() => {
                            // Map service to vehicle size (if a Wash & Vac sized service)
                            const match = vehicleSizes.find(v => Array.isArray(v.services) && v.services.includes(service.name));
                            if (match) {
                              // Preselect vehicle size and service, then skip to Step 2
                              setSelectedVehicleSize(match.id);
                              setBookingDetails(prev => ({ ...prev, service: service.name, vehicleSize: match.name }));
                            } else {
                              // Detailing / Specialty services don’t need vehicle size
                              setSelectedVehicleSize('');
                              setBookingDetails(prev => ({ ...prev, service: service.name, vehicleSize: 'N/A' }));
                            }
                            setBookingStep(2);
                            navigateTo('book');
                            // Scroll to top immediately for better UX
                            try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { /* noop */ }
                            setTimeout(() => {
                              if (bookingFormRef.current) {
                                bookingFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
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
        // Helper function to get vehicle image by service name
        const getVehicleImage = (serviceName) => {
          const imageMap = {
            // Wash and Vac Services
            'Wash and Vac (Small Car)': require('./assets/small car.png'),
            'Wash and Vac (Sedan)': require('./assets/sedan.png'),
            'Wash and Vac (Small SUV)': require('./assets/small suv.png'),
            'Wash and Vac (Medium SUV)': require('./assets/suv.png'),
            'Wash and Vac (Large SUV)': require('./assets/large suv.png'),
            'Wash and Vac (Small Bus)': require('./assets/small bus.png'),
            'Wash and Vac (Large Bus)': require('./assets/large bus.png'),
            'Wash and Vac (Extra Large Bus)': require('./assets/extra large bus.png'),
            'Wash and Vac (Pickup)': require('./assets/pickup.png'),
            'Wash and Vac (Small Truck)': require('./assets/small truck.png'),
            'Wash and Vac (Large Truck)': require('./assets/large truck.png'),
            'Wash and Vac (Trailer Head)': require('./assets/semi truck.png'),
            'Wash and Vac (Trailer Front & Back)': require('./assets/trailer-front-and-back.png'),
            'Wash and Vac (Dumper Truck)': require('./assets/dumper truck.png'),
            'Wash and Vac (Tracker & Backhoe)': require('./assets/backhoe.png'),
            // Detailing Services
            'Seat Only Detail': require('./assets/seat only detail.png'),
            'Full Interior Detail': require('./assets/full interior detail.png'),
            'Full Interior Detail (with seat removal)': require('./assets/full interior detail( with seat removal) .png'),
            'Headlight Restoration': require('./assets/headlight restoration.jpg'),
            'Plastic Restoration': require('./assets/plastic restoration.jpg'),
            'Buff and Polish': require('./assets/buff and polish.jpg'),
            'Undercarriage Wash': require('./assets/undercarriage wash.jpg'),
            'Engine Wash': require('./assets/engine wash.jpg'),
            'Leather Interior Detail': require('./assets/leather interior detail.png'),
            'Steam Cleaning Car Seat': require('./assets/steam cleaning car seat.png'),
            'Steam Clean Sofa': require('./assets/steam clean sofa.jpg'),
            // Specialty Cleaning Services
            'Wall Cleaning': require('./assets/wall-cleaning.jpg'),
            'Building Roof Cleaning': require('./assets/roof-cleaning.jpg'),
            'Driveway Cleaning': require('./assets/driveway cleaning.jpg'),
            'Carpet Cleaning': require('./assets/carpet cleaning.jpg'),
            'Sofa Cleaning': require('./assets/sofa cleaning.jpg'),
            'Mattress Cleaning': require('./assets/mattress cleaning.jpg'),
          };
          return imageMap[serviceName] || null;
        };

        return (
          <div className="container mx-auto px-2 sm:px-4 py-16 min-h-screen bg-gray-50 font-inter rounded-3xl">
            {backButton}
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 animate-fade-in-up">Our Full Services Menu</h2>
            {services.map((category, catIndex) => (
              <div key={catIndex} className="mb-12">
                <h3 className="text-3xl font-bold text-sparkle-blue mb-6 border-b-2 border-gray-300 pb-2">{category.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {category.items.map(service => {
                    const vehicleImage = getVehicleImage(service.name);
                    return (
                      <div key={service.id} className="bg-white rounded-3xl shadow-lg border border-gray-200 transform transition-transform hover:scale-105 hover:shadow-xl animate-card-fade-in overflow-hidden">
                        {vehicleImage ? (
                          // Card with vehicle image
                          <div className="flex flex-col h-full">
                            <div className="relative bg-gradient-to-br from-blue-50 to-gray-100 p-4 md:p-5 h-56 md:h-60 flex items-center justify-center overflow-hidden group">
                              <img 
                                src={vehicleImage} 
                                alt={service.name}
                                className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                style={
                                  service.name.includes('Bus') ? {transform: 'scale(2.3)'} : 
                                  service.name.includes('Seat Only Detail') ? {transform: 'scale(1.1)'} : 
                                  service.name.includes('Trailer') ? {transform: 'scale(1.0)'} : 
                                  {transform: 'scale(1.3)'}
                                }
                              />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                              <h4 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h4>
                              <p className="text-2xl font-extrabold text-sparkle-blue mb-3">{service.price}</p>
                              {service.details.length > 0 && (
                                <div className="mb-4 flex flex-wrap gap-2">
                                  {service.details.map((detail, index) => (
                                    <span key={index} className="inline-block px-3 py-1 bg-blue-50 text-sparkle-blue text-xs font-semibold rounded-full border border-blue-200">
                                      {detail}
                                    </span>
                                  ))}
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  const match = vehicleSizes.find(v => Array.isArray(v.services) && v.services.includes(service.name));
                                  if (match) {
                                    setSelectedVehicleSize(match.id);
                                    setBookingDetails(prev => ({ ...prev, service: service.name, vehicleSize: match.name }));
                                  } else {
                                    setSelectedVehicleSize('');
                                    setBookingDetails(prev => ({ ...prev, service: service.name, vehicleSize: 'N/A' }));
                                  }
                                  setBookingStep(2);
                                  navigateTo('book');
                                  try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { /* noop */ }
                                  setTimeout(() => {
                                    if (bookingFormRef.current) {
                                      bookingFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                  }, 100);
                                }}
                                className="mt-auto w-full px-6 py-3 bg-sparkle-blue text-white font-bold rounded-full hover:bg-sparkle-blue-dark hover:shadow-lg transition-all transform hover:scale-105"
                              >
                                Book Now
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Card without image (detailing & specialty services)
                          <div className="p-8 flex flex-col h-full">
                            <div className="mb-4">
                              {/* Service icon based on category */}
                              {category.category === 'Detailing' && (
                                <div className="w-16 h-16 bg-gradient-to-br from-sparkle-blue to-blue-400 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                                  </svg>
                                </div>
                              )}
                              {category.category === 'Specialty Cleaning' && (
                                <div className="w-16 h-16 bg-gradient-to-br from-sparkle-green to-green-400 rounded-full flex items-center justify-center mb-4 shadow-lg">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                                  </svg>
                                </div>
                              )}
                            </div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h4>
                            <p className="text-2xl font-extrabold text-sparkle-blue mb-4">{service.price}</p>
                            {service.details.length > 0 && (
                              <ul className="list-disc list-inside mb-4 text-gray-600 flex-1">
                                {service.details.map((detail, index) => <li key={index}>{detail}</li>)}
                              </ul>
                            )}
                            <button
                              onClick={() => {
                                const match = vehicleSizes.find(v => Array.isArray(v.services) && v.services.includes(service.name));
                                if (match) {
                                  setSelectedVehicleSize(match.id);
                                  setBookingDetails(prev => ({ ...prev, service: service.name, vehicleSize: match.name }));
                                } else {
                                  setSelectedVehicleSize('');
                                  setBookingDetails(prev => ({ ...prev, service: service.name, vehicleSize: 'N/A' }));
                                }
                                setBookingStep(2);
                                navigateTo('book');
                                try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (_) { /* noop */ }
                                setTimeout(() => {
                                  if (bookingFormRef.current) {
                                    bookingFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }, 100);
                              }}
                              className="mt-auto w-full px-6 py-3 bg-sparkle-blue text-white font-bold rounded-full hover:bg-sparkle-blue-dark hover:shadow-lg transition-all transform hover:scale-105"
                            >
                              Book Now
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
          <div ref={bookingFormRef} className="container mx-auto px-2 sm:px-4 py-16 min-h-screen bg-white rounded-xl shadow-lg border border-gray-200 font-inter" style={{maxWidth: '1280px'}}>
            {backButton}
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-12 animate-fade-in-up">Book Your Appointment</h2>
            <div className="bg-white p-4 sm:p-8 w-full mx-auto animate-fade-in">
              <form onSubmit={handleBookingSubmit}>
                {/* Step 1: Vehicle Size Selection */}
                {bookingStep === 1 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-6 text-center">1. Select Your Vehicle Size</h3>
                    <p className="text-gray-700 text-lg font-bold mb-4 text-center">Choose the category that best matches your vehicle</p>
                    
                    {/* Skip button for non-vehicle services */}
                    <div className="mb-6 text-center p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                      <p className="text-gray-800 text-lg font-bold mb-2">Looking for detailing or specialty cleaning services?</p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVehicleSize('');
                          setBookingDetails(prev => ({ ...prev, vehicleSize: 'N/A' }));
                          setBookingStep(2);
                        }}
                        className="px-6 py-2 bg-sparkle-blue text-white font-semibold rounded-full hover:bg-blue-600 transition-all transform hover:scale-105 shadow-md"
                      >
                        Skip to All Services →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-h-[60vh] overflow-y-scroll pr-16 pb-4" style={{scrollbarWidth: 'thin', scrollbarColor: '#19c2ff #e5e7eb'}}>
                      {vehicleSizes.map(size => (
                        <div
                          key={size.id}
                          className={`relative bg-white rounded-xl md:rounded-2xl shadow-lg border-2 cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${
                            selectedVehicleSize === size.id ? 'border-sparkle-blue ring-4 ring-sparkle-blue/20' : 'border-gray-200'
                          }`}
                          onClick={() => {
                            setSelectedVehicleSize(size.id);
                            setBookingDetails(prev => ({ ...prev, vehicleSize: size.name }));
                            // Auto-scroll to continue button
                            setTimeout(() => {
                              continueButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }, 100);
                          }}
                        >
                          <div className="relative overflow-hidden rounded-t-xl md:rounded-t-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                            <img
                              src={size.image}
                              alt={size.name}
                              className="w-full h-40 md:h-48 object-contain p-2 md:p-4 transition-transform hover:scale-110"
                              style={['small-bus', 'large-bus', 'extra-large-bus'].includes(size.id) ? {transform: 'scale(2.5)'} : {transform: 'scale(1.3)'}}
                            />
                            {selectedVehicleSize === size.id && (
                              <div className="absolute top-3 right-3 bg-sparkle-blue text-white rounded-full p-2 shadow-lg animate-bounce">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h4 className="text-lg font-bold text-sparkle-blue mb-2">{size.name}</h4>
                            <p className="text-gray-600 text-sm mb-2">
                              <span className="font-semibold">Examples:</span> {size.examples}
                            </p>
                            {selectedVehicleSize === size.id && (
                              <div className="mt-2 px-3 py-1 bg-sparkle-blue/10 text-sparkle-blue rounded-full text-xs font-bold inline-block">
                                ✓ Selected
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      ref={continueButtonRef}
                      type="button"
                      onClick={() => {
                        setBookingStep(2);
                        setTimeout(() => {
                          if (bookingFormRef.current) {
                            bookingFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 100);
                      }}
                      disabled={!selectedVehicleSize}
                      className="mt-8 w-full px-6 py-4 bg-sparkle-blue text-white font-bold text-lg rounded-full shadow-lg hover:bg-sparkle-blue-dark hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Service Selection
                    </button>
                  </div>
                )}

                {/* Step 2: Service Selection */}
                {bookingStep === 2 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">2. Choose a Service</h3>
                    {bookingDetails.vehicleSize && bookingDetails.vehicleSize !== 'N/A' && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <span className="font-bold">Selected Vehicle:</span> {bookingDetails.vehicleSize}
                        </p>
                      </div>
                    )}
                    {bookingDetails.vehicleSize === 'N/A' && bookingDetails.service && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-lg text-green-800">
                          <span className="font-bold">✓ Service Selected:</span> {bookingDetails.service}
                        </p>
                        <p className="text-sm text-green-700 mt-1">Click "Next" to continue with location</p>
                      </div>
                    )}
                    {bookingDetails.vehicleSize === 'N/A' && !bookingDetails.service && (
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          <span className="font-bold">📋 Viewing All Services</span> - You can select any detailing or specialty service below
                        </p>
                      </div>
                    )}
                    <select
                      name="service"
                      value={bookingDetails.service}
                      onChange={handleBookingChange}
                      className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green"
                    >
                      <option value="">-- Select a Service --</option>
                      
                      {/* Show vehicle-specific services if vehicle was selected */}
                      {selectedVehicleSize && bookingDetails.vehicleSize !== 'N/A' && (
                        <optgroup label={`🚗 Services for ${bookingDetails.vehicleSize}`}>
                          {vehicleSizes
                            .find(v => v.id === selectedVehicleSize)
                            ?.services.map(serviceName => {
                              const service = services.flatMap(cat => cat.items).find(s => s.name === serviceName);
                              return service ? (
                                <option key={service.id} value={service.name}>
                                  {service.name} - {service.price}
                                </option>
                              ) : null;
                            })}
                        </optgroup>
                      )}
                      
                      {/* Always show detailing services */}
                      <optgroup label="✨ Detailing Services">
                        {services[1].items.map(s => (
                          <option key={s.id} value={s.name}>{s.name} - {s.price}</option>
                        ))}
                      </optgroup>
                      
                      {/* Always show specialty cleaning */}
                      <optgroup label="🏠 Specialty Cleaning">
                        {services[2].items.map(s => (
                          <option key={s.id} value={s.name}>{s.name} - {s.price}</option>
                        ))}
                      </optgroup>
                    </select>
                    <div className="flex justify-between mt-6">
                      <button 
                        type="button" 
                        onClick={() => setBookingStep(1)} 
                        className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(3)}
                        disabled={!bookingDetails.service}
                        className="px-6 py-3 bg-sparkle-blue text-white font-semibold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Location Input */}
                {bookingStep === 3 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">3. Enter Location</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      💡 <strong>Tip:</strong> Start typing your address above, or click on the map below to pin your exact location
                    </p>
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
                      className={`w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green text-sm md:text-base min-h-[44px] ${manualLocation ? 'hidden' : ''}`}
                      placeholder="Start typing your address..."
                      style={{ width: '100%', maxWidth: '100%' }}
                    />
                    {/* Button to switch to manual location entry */}
                    {!manualLocation && (
                      <button
                        type="button"
                        onClick={() => setManualLocation(true)}
                        className="mt-2 mb-4 px-4 py-2 bg-sparkle-blue text-white font-semibold rounded-full hover:bg-blue-600 transition-colors"
                      >
                        Enter Location Manually
                      </button>
                    )}
                    {/* Only render the map if not in manual location mode */}
                    {!manualLocation && (
                      <div className="my-6">
                        <div className="mb-2 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                          <p className="text-sm text-blue-800">
                            <strong>📍 Click anywhere on the map below to pin your exact location</strong>
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            You can also drag the marker to adjust your location
                          </p>
                        </div>
                        {isLoaded && (
                          <GoogleMap
                            mapContainerStyle={{ width: '100%', height: window.innerWidth < 640 ? '200px' : '300px', borderRadius: '1rem' }}
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
                        className="mt-2 px-4 py-2 bg-sparkle-blue text-white font-semibold rounded-full hover:bg-blue-600 transition-colors"
                      >
                        Use Autocomplete
                      </button>
                    </div>
                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setBookingStep(2)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors">Back</button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(4)}
                        disabled={bookingDetails.location.trim() === ''}
                        className="px-6 py-3 bg-sparkle-blue text-white font-semibold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Step 4: Date & Time Selection */}
                {bookingStep === 4 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">4. Choose Date & Time</h3>
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
                      <button type="button" onClick={() => setBookingStep(3)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors">Back</button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(5)}
                        disabled={!bookingDetails.date || !bookingDetails.time}
                        className="px-6 py-3 bg-sparkle-blue text-white font-semibold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 5: Customer Details */}
                {bookingStep === 5 && (
                  <div>
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">5. Your Details</h3>
                    <input type="text" name="name" placeholder="Full Name" value={bookingDetails.name} onChange={handleBookingChange} className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green mb-4" />
                    <input type="email" name="email" placeholder="Email Address" value={bookingDetails.email} onChange={handleBookingChange} className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green mb-4" />
                    <input type="tel" name="phone" placeholder="Phone Number" value={bookingDetails.phone} onChange={handleBookingChange} className="w-full p-3 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-green mb-4" />
                    
                    {/* Payment Method Selection */}
                    <div className="mb-4">
                      <label className="block text-gray-700 font-semibold mb-2">Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setBookingDetails(prev => ({ ...prev, paymentMethod: 'Cash' }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            bookingDetails.paymentMethod === 'Cash'
                              ? 'border-sparkle-green bg-sparkle-green/10 text-sparkle-green'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-sparkle-green/50'
                          }`}
                        >
                          <div className="font-semibold">Cash</div>
                          <div className="text-xs mt-1">Pay on service</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBookingDetails(prev => ({ ...prev, paymentMethod: 'Bank Transfer' }))}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            bookingDetails.paymentMethod === 'Bank Transfer'
                              ? 'border-sparkle-green bg-sparkle-green/10 text-sparkle-green'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-sparkle-green/50'
                          }`}
                        >
                          <div className="font-semibold">Bank Transfer</div>
                          <div className="text-xs mt-1">Pay via transfer</div>
                        </button>
                      </div>
                    </div>

                    {/* Banking Information - Show only when Bank Transfer is selected */}
                    {bookingDetails.paymentMethod === 'Bank Transfer' && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Banking Information
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account Name:</span>
                            <span className="font-semibold text-gray-900">DM Auto Spa</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account Number:</span>
                            <span className="font-semibold text-gray-900">432 220 257</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Branch:</span>
                            <span className="font-semibold text-gray-900">St James</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Account Type:</span>
                            <span className="font-semibold text-gray-900">Business Savings</span>
                          </div>
                        </div>
                        <p className="text-xs text-blue-700 mt-3 italic">
                          Please use your name and booking reference as payment reference.
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between mt-6">
                      <button type="button" onClick={() => setBookingStep(4)} className="px-6 py-3 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition-colors">Back</button>
                      <button
                        type="button"
                        onClick={() => setBookingStep(6)}
                        disabled={!bookingDetails.name || !bookingDetails.email || !bookingDetails.phone || !bookingDetails.paymentMethod}
                        className="px-6 py-3 bg-sparkle-blue text-white font-semibold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        Submit Booking
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 6: Confirmation */}
                {bookingStep === 6 && (
                  <div className="text-center">
                    <h3 className="text-2xl font-semibold text-sparkle-blue mb-4">Booking Confirmation</h3>
                    <p className="text-gray-700 mb-6">
                      Thank you, {bookingDetails.name}! Your booking has been received.
                      <br />
                      We will contact you shortly to confirm the details.
                    </p>
                    <button
                      onClick={closeModalAndNavigateHome}
                      className="px-6 py-3 bg-sparkle-blue text-white font-semibold rounded-full hover:bg-sparkle-blue-dark transition-colors"
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
          <div className="min-h-screen font-inter py-16">
            {backButton}
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex justify-center mb-8">
                <h1 className="inline-block text-4xl md:text-5xl font-bold text-sparkle-blue px-12 py-4 bg-white bg-opacity-90 rounded-full shadow">
                  Contact Us
                </h1>
              </div>
              <p className="text-center text-gray-600 text-lg mb-12">We're here to help! Get in touch with us today.</p>
              
              {/* Quick Contact Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {/* Phone Card */}
                <a 
                  href="tel:876-471-6676"
                  className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all hover:scale-105 shadow-lg"
                >
                  <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Call Us</h3>
                  <p className="text-2xl font-bold text-sparkle-blue text-center">876-471-6676</p>
                  <p className="text-sm text-gray-600 text-center mt-2">Available during service hours</p>
                </a>

                {/* WhatsApp Card */}
                <a 
                  href="https://wa.me/18764716676"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-green-400 to-green-500 p-6 rounded-2xl border-2 border-green-600 hover:border-green-700 transition-all hover:scale-105 shadow-lg text-white"
                >
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-7 h-7 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">WhatsApp</h3>
                  <p className="text-lg text-center font-semibold">Chat with us instantly</p>
                  <p className="text-sm text-center mt-2 opacity-90">Fast replies guaranteed</p>
                </a>

                {/* Email Card */}
                <a 
                  href="mailto:sparklesautospa01@gmail.com"
                  className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all hover:scale-105 shadow-lg"
                >
                  <div className="w-14 h-14 bg-sparkle-blue rounded-full flex items-center justify-center mb-4 mx-auto">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Email Us</h3>
                  <p className="text-sm text-gray-700 text-center break-all">sparklesautospa01@gmail.com</p>
                  <p className="text-sm text-gray-600 text-center mt-2">24-48 hour response time</p>
                </a>
              </div>
              
              {/* Contact Form and Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-12">
                {/* Left Column - Contact Form */}
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Send us a Message</h2>
                  
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        required
                        className="w-full p-3 md:p-4 min-h-[44px] rounded-xl bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-blue focus:border-transparent transition-all text-base"
                      />
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        required
                        className="w-full p-3 md:p-4 min-h-[44px] rounded-xl bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-blue focus:border-transparent transition-all text-base"
                      />
                    </div>
                    
                    <textarea 
                      placeholder="Your Message" 
                      rows="6"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                      className="w-full p-3 md:p-4 min-h-[120px] rounded-xl bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sparkle-blue focus:border-transparent transition-all resize-none text-base"
                    ></textarea>
                    
                    <button 
                      type="submit"
                      disabled={formSubmitting}
                      className={`w-full px-8 py-4 bg-sparkle-green text-white font-bold text-lg rounded-full shadow-lg hover:bg-green-600 hover:scale-105 transition-all transform ${formSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {formSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
                
                {/* Right Column - Additional Info */}
                <div className="space-y-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Get in Touch</h2>
                  
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Have questions? We're here to help! Reach out through any of our contact methods and we'll get back to you as soon as possible.
                  </p>
                  
                  {/* Follow Us Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Follow Us</h3>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <a
                        href="https://wa.me/18764716676"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition-colors shadow-lg"
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                        </svg>
                        WhatsApp
                      </a>
                      
                      <a
                        href="https://www.instagram.com/sparkles_autospa/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full hover:from-purple-600 hover:to-pink-600 transition-colors shadow-lg"
                      >
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">
                  Frequently Asked Questions
                </h2>
                
                <div className="space-y-4 max-w-3xl mx-auto">
                  {[ 
                    {
                      q: "What areas do you service?",
                      a: "We service Montego Bay and surrounding areas within 15km. Contact us to confirm if we serve your location!"
                    },
                    {
                      q: "How do I book a service?",
                      a: "You can book directly through our website, call us at 876-471-6676, or message us on WhatsApp for instant booking."
                    },
                    {
                      q: "What payment methods do you accept?",
                      a: "We accept bank transfer and cash. Payment is due after service completion."
                    },
                    {
                      q: "How long does a typical wash take?",
                      a: "Most wash and vac services take 1-2 hours. Detailing services may take 3-5 hours depending on the service."
                    },
                    {
                      q: "Do I need to be present during the service?",
                      a: "While it's not strictly necessary for you to be present, we recommend that someone is available to provide access and discuss any specific requirements. If you can't be there, please let us know in advance so we can make suitable arrangements."
                    },
                    {
                      q: "Can I cancel or reschedule?",
                      a: "Yes! Please contact us at least 24 hours in advance to cancel or reschedule without any fees."
                    }
                  ].map((faq, index) => (
                    <details key={index} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-sparkle-blue transition-colors group">
                      <summary className="font-bold text-base md:text-lg text-sparkle-blue cursor-pointer flex items-start justify-between gap-2">
                        <span className="flex-1">{faq.q}</span>
                        <svg className="w-5 h-5 flex-shrink-0 transform group-open:rotate-180 transition-transform mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </summary>
                      <p className="mt-3 text-sm md:text-base text-gray-700 pl-2">{faq.a}</p>
                    </details>
                  ))}
                </div>
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
              <h1 className="text-5xl md:text-7xl font-extrabold text-[#2196f3] drop-shadow mb-4 tracking-tight" style={{letterSpacing:'-2px'}}>About <span className="text-[#2196f3]">Sparkles Auto Spa</span></h1>
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
                  <li className="flex items-center gap-3"><span className="inline-block w-4 h-4 bg-[#b3e0ff] rounded-full"></span> Meticulous attention to detail—every inch perfected</li>
                  <li className="flex items-center gap-3"><span className="inline-block w-4 h-4 bg-[#b3e0ff] rounded-full"></span> Friendly, professional staff who love what they do</li>
                  <li className="flex items-center gap-3"><span className="inline-block w-4 h-4 bg-[#b3e0ff] rounded-full"></span> 100% commitment to your satisfaction</li>
                </ul>
                <div className="w-full flex justify-center md:justify-start mt-8">
                  <div className="bg-gradient-to-r from-[#b3e0ff] via-[#d5f7db] to-[#d9f2ff] px-10 py-5 rounded-full shadow text-xl md:text-2xl font-bold text-[#2196f3] animate-wind border border-[#e0e7ef]" style={{background:'linear-gradient(90deg, #e3f0fa 0%, #eafbea 55%, #e6f7ff 100%)', color:'#2196f3'}}>Experience the Sparkle Difference Today!</div>
                </div>
              </div>
              {/* Right: Premium Image Grid */}
              <div className="flex-1 grid grid-cols-2 gap-3 md:gap-6 bg-gradient-to-br from-[#fafdff] via-[#e3f0fa] to-[#e6ffe6] p-2 md:p-4 rounded-2xl border border-[#e0e7ef] shadow-sm">
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
            @media (max-width: 640px) {
              .promo-mobile {
                min-width: 200px !important;
                max-width: 90vw !important;
                font-size: 0.85rem !important;
                padding: 0.6rem 0.5rem !important;
              }
              .promo-mobile span {
                font-size: 0.9em !important;
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
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .animate-spin-slow {
            animation: spin-slow 2s linear infinite;
          }
        `}
      </style>
      {loading && <LoadingAnimation />}
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
                background: 'linear-gradient(120deg, #19c2ff 0%, #bff7c5 55%, #0ea5ff 80%, #e6f7ff 100%)',
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
                            <div className="absolute right-0 md:right-0 left-0 md:left-auto mt-12 w-full md:w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-fade-in p-4 mx-4 md:mx-0">
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
                                      <button className="mt-1 text-xs text-sparkle-blue underline hover:text-sparkle-green text-left">Reschedule</button>
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
                background: 'linear-gradient(120deg, #19c2ff 0%, #bff7c5 55%, #0ea5ff 80%, #e6f7ff 100%)',
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
                        className="h-16 w-auto cursor-pointer ml-[-0.3rem] md:h-22 md:ml-[-1rem] lg:h-28 lg:ml-[-2rem] transition-all duration-300"
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
                                {recentBookings.slice(0, 5).map(booking => {
                                  const bookingStatus = booking.status || 'pending';
                                  const statusColors = {
                                    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                                    confirmed: 'bg-green-100 text-green-800 border-green-300',
                                    completed: 'bg-blue-100 text-blue-800 border-blue-300',
                                    cancelled: 'bg-red-100 text-red-800 border-red-300'
                                  };
                                  const isActive = bookingStatus === 'pending' || bookingStatus === 'confirmed';
                                  
                                  return (
                                    <li key={booking.id} className="bg-gray-50 rounded-lg p-2 border border-sparkle-blue/30 flex flex-col">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-sparkle-blue text-sm">{booking.service}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[bookingStatus]}`}>
                                          {bookingStatus.charAt(0).toUpperCase() + bookingStatus.slice(1)}
                                        </span>
                                      </div>
                                      <span className="text-xs text-gray-600">{booking.date || 'N/A'} at {booking.time || 'N/A'}</span>
                                      <span className="text-xs text-gray-500">{booking.vehicleSize || 'Vehicle size not specified'}</span>
                                      <div className="flex gap-2 mt-2">
                                        {isActive && (
                                          <button 
                                            onClick={() => handleCancelBooking(booking.id, booking)}
                                            className="text-xs text-red-600 underline hover:text-red-800 font-semibold"
                                          >
                                            Cancel
                                          </button>
                                        )}
                                        <button 
                                          onClick={() => {
                                            setBookingDetails(prev => ({ 
                                              ...prev, 
                                              service: booking.service,
                                              vehicleSize: booking.vehicleSize
                                            }));
                                            navigateTo('book');
                                          }}
                                          className="text-xs text-sparkle-blue underline hover:text-sparkle-green"
                                        >
                                          Reschedule
                                        </button>
                                      </div>
                                    </li>
                                  );
                                })}
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
                
                {/* WhatsApp Floating Widget */}
                <WhatsAppWidget />
                
                <footer className="bg-white bg-opacity-80 backdrop-blur-lg text-gray-600 py-8 text-center border-t border-gray-200 shadow-xl rounded-t-2xl">
                  <div className="container mx-auto px-4">
                    <p>
                      &copy; {new Date().getFullYear()} Sparkles Auto Spa. All rights reserved.
                    </p>
                    <p className="mt-2 text-sparkle-blue">
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
