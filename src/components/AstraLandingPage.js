import React, { useEffect, useRef, useState } from 'react';

const AstraLandingPage = () => {
  const headingRef = useRef(null);
  const calendarRef = useRef(null);
  const containerRef = useRef(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    // Animate heading on mount
    if (headingRef.current) {
      const letters = headingRef.current.querySelectorAll('.letter');
      letters.forEach((letter, index) => {
        setTimeout(() => {
          letter.style.opacity = '1';
          letter.style.transform = 'translateY(0) scale(1)';
        }, index * 100);
      });
    }

    // Animate calendar on mount
    if (calendarRef.current) {
      setTimeout(() => {
        calendarRef.current.style.opacity = '1';
        calendarRef.current.style.transform = 'translateY(0) scale(1)';
      }, 800);
    }

    // Container fade in
    if (containerRef.current) {
      containerRef.current.style.opacity = '1';
    }
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentDate.getMonth() && 
                          today.getFullYear() === currentDate.getFullYear();

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="calendar-day empty"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const isSelected = selectedDate === day;
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDate(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const splitTextIntoLetters = (text) => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        className="letter"
        style={{
          opacity: 0,
          transform: 'translateY(50px) scale(0.8)',
          transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
          display: char === ' ' ? 'inline' : 'inline-block'
        }}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <div ref={containerRef} style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      opacity: 0,
      transition: 'opacity 1s ease-in-out',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      
      {/* Animated Heading */}
      <div style={{
        textAlign: 'center',
        marginBottom: '60px',
        maxWidth: '800px'
      }}>
        <h1 ref={headingRef} style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #109fd8 0%, #056dfe 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '20px',
          lineHeight: '1.2',
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          {splitTextIntoLetters('Welcome to Astra Pre-School')}
        </h1>
        
        <div style={{
          fontSize: '1.2rem',
          color: '#666',
          fontWeight: '400',
          opacity: 0,
          animation: 'fadeInUp 1s ease-out 1.5s forwards'
        }}>
          Where Learning Begins with Love and Care
        </div>
      </div>

      {/* Animated Calendar */}
      <div ref={calendarRef} style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        opacity: 0,
        transform: 'translateY(50px) scale(0.9)',
        transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid rgba(16, 159, 216, 0.1)'
      }}>
        
        {/* Calendar Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          padding: '0 10px'
        }}>
          <button
            onClick={() => navigateMonth(-1)}
            style={{
              background: 'linear-gradient(135deg, #109fd8 0%, #056dfe 100%)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(16, 159, 216, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 20px rgba(16, 159, 216, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 159, 216, 0.3)';
            }}
          >
            ‹
          </button>
          
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: '600',
            color: '#333',
            margin: 0,
            background: 'linear-gradient(135deg, #109fd8 0%, #056dfe 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {formatDate(currentDate)}
          </h2>
          
          <button
            onClick={() => navigateMonth(1)}
            style={{
              background: 'linear-gradient(135deg, #109fd8 0%, #056dfe 100%)',
              border: 'none',
              color: 'white',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(16, 159, 216, 0.3)'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 20px rgba(16, 159, 216, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 159, 216, 0.3)';
            }}
          >
            ›
          </button>
        </div>

        {/* Days of Week Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '5px',
          marginBottom: '15px'
        }}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} style={{
              textAlign: 'center',
              fontWeight: '600',
              color: '#666',
              fontSize: '0.9rem',
              padding: '8px 0'
            }}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '5px'
        }}>
          {renderCalendarDays()}
        </div>
      </div>

      {/* Floating Elements for Extra Animation */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '60px',
        height: '60px',
        background: 'linear-gradient(135deg, #109fd8 0%, #056dfe 100%)',
        borderRadius: '50%',
        opacity: 0.1,
        animation: 'float 6s ease-in-out infinite'
      }}></div>
      
      <div style={{
        position: 'absolute',
        top: '70%',
        right: '15%',
        width: '40px',
        height: '40px',
        background: 'linear-gradient(135deg, #056dfe 0%, #109fd8 100%)',
        borderRadius: '50%',
        opacity: 0.1,
        animation: 'float 4s ease-in-out infinite reverse'
      }}></div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
          color: #333;
          font-size: 0.9rem;
        }

        .calendar-day:not(.empty):hover {
          background: linear-gradient(135deg, #109fd8 0%, #056dfe 100%);
          color: white;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(16, 159, 216, 0.3);
        }

        .calendar-day.today {
          background: linear-gradient(135deg, #109fd8 0%, #056dfe 100%);
          color: white;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(16, 159, 216, 0.3);
        }

        .calendar-day.selected {
          background: linear-gradient(135deg, #056dfe 0%, #109fd8 100%);
          color: white;
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(5, 109, 254, 0.4);
        }

        .calendar-day.empty {
          cursor: default;
        }

        @media (max-width: 768px) {
          .calendar-day {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AstraLandingPage;