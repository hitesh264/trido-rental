import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    tripDestination: '',
    arrivalDate: '',
    returnDate: '',
    arrivalTime: '',
    returnTime: '',
    vehicles: {}
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showRegister || showBookingConfirmation) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRegister, showBookingConfirmation]);

  const pickupLocations = ['Roorkee', 'Haridwar', 'Dehradun', 'Rishikesh'];
  const vehicles = [
    { name: 'Activa 125', emoji: '🛵', type: 'Scooter' },
    { name: 'Access 125', emoji: '🛵', type: 'Scooter' },
    { name: 'Ntorq', emoji: '🛵', type: 'Scooter' },
    { name: 'RE Classic 350', emoji: '🏍️', type: 'Royal Enfield' },
    { name: 'RE Himalayan', emoji: '🏍️', type: 'Adventure Bike' },
    { name: 'RE Meteor', emoji: '🏍️', type: 'Royal Enfield' },
    { name: 'RE Hunter', emoji: '🏍️', type: 'Royal Enfield' }
  ];

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVehicleCountChange = (vehicleName, change) => {
    setFormData(prev => {
      const currentCount = prev.vehicles[vehicleName] || 0;
      const newCount = Math.max(0, currentCount + change);
      
      const updatedVehicles = { ...prev.vehicles };
      if (newCount === 0) {
        delete updatedVehicles[vehicleName];
      } else {
        updatedVehicles[vehicleName] = newCount;
      }
      
      return { ...prev, vehicles: updatedVehicles };
    });
  };

  const handleRegisterChange = (field, value) => {
    setRegisterData(prev => ({ ...prev, [field]: value }));
  };

  const formatDateForSheet = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
  };

  const formatTimeForSheet = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getSelectedVehiclesString = () => {
    const vehicleEntries = Object.entries(formData.vehicles);
    if (vehicleEntries.length === 0) return '';
    return vehicleEntries.map(([name, count]) => `${count} x ${name}`).join(', ');
  };

  const getTotalVehicles = () => {
    return Object.values(formData.vehicles).reduce((sum, count) => sum + count, 0);
  };

  const handleBookRide = async () => {
    const { pickupLocation, tripDestination, arrivalDate, returnDate, arrivalTime, returnTime, vehicles } = formData;
    
    // Check if all required fields are filled
    const isFormValid = pickupLocation && 
                       tripDestination &&
                       arrivalDate && 
                       returnDate && 
                       arrivalTime && 
                       returnTime && 
                       getTotalVehicles() > 0;
    
    if (!isFormValid) {
      alert('Please fill in all fields and select at least one vehicle');
      return;
    }

    if (new Date(arrivalDate) > new Date(returnDate)) {
      alert('Return date cannot be before arrival date');
      return;
    }

    if (isRegistered) {
      setIsLoading(true);
      try {
        await axios.post('https://sheetdb.io/api/v1/767du28gefx9c', {
          data: [{
            name: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            pickupLocation,
            tripDestination,
            arrivalDate: formatDateForSheet(arrivalDate),
            returnDate: formatDateForSheet(returnDate),
            arrivalTime: formatTimeForSheet(arrivalTime),
            returnTime: formatTimeForSheet(returnTime),
            vehicles: getSelectedVehiclesString(),
            totalVehicles: getTotalVehicles()
          }]
        });
        setIsLoading(false);
        setShowBookingConfirmation(true);
      } catch (error) {
        setIsLoading(false);
        console.error(error);
        alert('There was an error saving your booking.');
      }
    } else {
      setShowRegister(true);
    }
  };

  const handleRegister = async () => {
    const { name, email, phone } = registerData;
    const { pickupLocation, tripDestination, arrivalDate, returnDate, arrivalTime, returnTime, vehicles } = formData;

    if (!name || !email || !phone) {
      alert('Please fill in all registration fields');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post('https://sheetdb.io/api/v1/767du28gefx9c', {
        data: [{
          name,
          email,
          phone,
          pickupLocation,
          tripDestination,
          arrivalDate: formatDateForSheet(arrivalDate),
          returnDate: formatDateForSheet(returnDate),
          arrivalTime: formatTimeForSheet(arrivalTime),
          returnTime: formatTimeForSheet(returnTime),
          vehicles: getSelectedVehiclesString(),
          totalVehicles: getTotalVehicles()
        }]
      });
      setIsLoading(false);
      setIsRegistered(true);
      setShowRegister(false);
      setShowBookingConfirmation(true);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      alert('There was an error saving your registration.');
    }
  };

  const scrollToAbout = () => {
    document.getElementById('about-section').scrollIntoView({ behavior: 'smooth' });
  };

  if (showBookingConfirmation) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-content">
          <div className="confirmation-icon">✓</div>
          <h1>Booking Received!</h1>
          <p>Our team will get back to you soon with great offers</p>
          <button 
            className="btn-primary" 
            onClick={() => {
              setShowBookingConfirmation(false);
              setFormData({
                pickupLocation: '',
                tripDestination: '',
                arrivalDate: '',
                returnDate: '',
                arrivalTime: '',
                returnTime: '',
                vehicles: {}
              });
            }}
          >
            Book Another Ride
          </button>
        </div>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="register-page">
        <div className="register-content">
          <h1>Register to Continue</h1>
          <div className="register-form">
            <input
              type="text"
              placeholder="Full Name"
              value={registerData.name}
              onChange={(e) => handleRegisterChange('name', e.target.value)}
              className="form-input"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={registerData.email}
              onChange={(e) => handleRegisterChange('email', e.target.value)}
              className="form-input"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={registerData.phone}
              onChange={(e) => handleRegisterChange('phone', e.target.value)}
              className="form-input"
            />
            <button 
              className="btn-primary" 
              onClick={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Registering...
                </>
              ) : (
                'Register & Book Ride'
              )}
            </button>
            <button 
              className="btn-secondary" 
              onClick={() => setShowRegister(false)}
              disabled={isLoading}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header">
        <div className="container">
          <div className="logo">
            <h1>trido.in</h1>
          </div>
          <nav className="nav">
            <button 
              className="nav-link" 
              onClick={scrollToAbout}
            >
              About Us
            </button>
          </nav>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="booking-section">
            <h2 className="section-title">Book Your Ride Now 🗺️📍</h2>
            
            <div className="form-group">
              <label className="form-label">Pick-up Location</label>
              <div className="destination-grid">
                {pickupLocations.map((location) => (
                  <button
                    key={location}
                    className={`destination-card ${formData.pickupLocation === location ? 'selected' : ''}`}
                    onClick={() => handleFormChange('pickupLocation', location)}
                  >
                    {location}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Trip Destination (e.g. Dehradun, Mussoorie etc.)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your trip destination"
                value={formData.tripDestination}
                onChange={(e) => handleFormChange('tripDestination', e.target.value)}
              />
            </div>

            <div className="date-time-section">
              <div className="date-section">
                <div className="form-group">
                  <label className="form-label">Pick-up Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.arrivalDate}
                    onChange={(e) => handleFormChange('arrivalDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Return Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.returnDate}
                    onChange={(e) => handleFormChange('returnDate', e.target.value)}
                    min={formData.arrivalDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="time-section">
                <div className="form-group">
                  <label className="form-label">Pick-up Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.arrivalTime}
                    onChange={(e) => handleFormChange('arrivalTime', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Return Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.returnTime}
                    onChange={(e) => handleFormChange('returnTime', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Vehicles</label>
              <div className="vehicle-grid">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.name} className="vehicle-card">
                    <div className="vehicle-emoji">
                      {vehicle.emoji}
                    </div>
                    <div className="vehicle-info">
                      <h3>{vehicle.name}</h3>
                      <p>{vehicle.type}</p>
                    </div>
                    <div className="vehicle-counter">
                      <button 
                        className="counter-btn"
                        onClick={() => handleVehicleCountChange(vehicle.name, -1)}
                        disabled={!formData.vehicles[vehicle.name]}
                      >
                        −
                      </button>
                      <span className="counter-display">
                        {formData.vehicles[vehicle.name] || 0}
                      </span>
                      <button 
                        className="counter-btn"
                        onClick={() => handleVehicleCountChange(vehicle.name, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {getTotalVehicles() > 0 && (
                <div className="selected-vehicles-display">
                  <h4>Selected Vehicles:</h4>
                  <p>{getSelectedVehiclesString()}</p>
                </div>
              )}
            </div>

            <button 
              className="btn-book" 
              onClick={handleBookRide}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Processing...
                </>
              ) : (
                `Book the Ride (${getTotalVehicles()} vehicle${getTotalVehicles() !== 1 ? 's' : ''})`
              )}
            </button>
          </div>
        </div>
      </main>

      <footer id="about-section" className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>About Us</h3>
              <p>Welcome to Trido.in - your premier bike rental service across Uttarakhand. We provide high-quality bikes and scooters for your travel adventures at affordable prices. <br/>
              Made with 💗 by students at IIT Roorkee.</p>
            </div>
            <div className="footer-section">
              <h3>Contact Us</h3>
              <p>Email: tridorentals@gmail.com<br/>Phone: +91 75974 64179<br/>Address: Roorkee, Uttarakhand, India</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;