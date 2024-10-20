import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, Scissors, AlertCircle } from 'lucide-react';
import { DataService, Service, AvailabilitySlot } from '../services/DataService';

interface BookAppointmentProps {
  contactId: string | null;
  tenantId: string;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({ contactId, tenantId }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [service, setService] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);

  useEffect(() => {
    loadServices();
    loadBookingMessage();
    loadAvailabilitySlots();
  }, [tenantId]);

  const loadServices = async () => {
    try {
      const tenantServices = await DataService.getTenantServices(tenantId);
      setServices(tenantServices);
    } catch (error) {
      console.error('Error loading services:', error);
      setError('שגיאה בטעינת השירותים');
    }
  };

  const loadBookingMessage = async () => {
    try {
      const tenant = await DataService.getTenantById(tenantId);
      if (tenant && tenant.bookingMessage) {
        setBookingMessage(tenant.bookingMessage);
      }
    } catch (error) {
      console.error('Error loading booking message:', error);
    }
  };

  const loadAvailabilitySlots = async () => {
    try {
      const slots = await DataService.getTenantAvailabilitySlots(tenantId);
      setAvailabilitySlots(slots);
    } catch (error) {
      console.error('Error loading availability slots:', error);
    }
  };

  const fetchAvailableTimes = useCallback(async (selectedDate: string) => {
    try {
      const tenant = await DataService.getTenantById(tenantId);
      if (!tenant) {
        throw new Error('לא נמצאו נתוני עסק');
      }
      const { apiToken, calendarId } = tenant;

      if (!apiToken || !calendarId) {
        setError('חסרים פרטי הגדרה (טוקן או מזהה לוח שנה)');
        return;
      }

      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const startTimestamp = startDate.getTime();
      const endTimestamp = endDate.getTime();

      setIsLoading(true);
      const response = await fetch(`https://services.leadconnectorhq.com/calendars/${calendarId}/free-slots?startDate=${startTimestamp}&endDate=${endTimestamp}&timezone=Asia/Jerusalem`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
          'Version': '2021-04-15'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Available times:', data);

      if (data && data[selectedDate] && Array.isArray(data[selectedDate].slots)) {
        const times = data[selectedDate].slots.map((slot: string) => {
          const date = new Date(slot);
          return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
        });

        // סינון השעות לפי הזמינות של המנהל
        const managerSlot = availabilitySlots.find(slot => slot.date === selectedDate);
        if (managerSlot) {
          const filteredTimes = times.filter(time => {
            return time >= managerSlot.startTime && time < managerSlot.endTime &&
                   (!managerSlot.breakStart || !managerSlot.breakEnd || 
                    (time < managerSlot.breakStart || time >= managerSlot.breakEnd));
          });
          setAvailableTimes(filteredTimes);
          if (filteredTimes.length === 0) {
            setError('לא נמצאו שעות פנויות לתאריך זה.');
          } else {
            setError(null);
          }
        } else {
          setAvailableTimes([]);
          setError('לא נמצאו שעות פנויות לתאריך זה.');
        }
      } else {
        setAvailableTimes([]);
        setError('לא נמצאו שעות פנויות לתאריך זה.');
      }
    } catch (error) {
      console.error('Error fetching available times:', error);
      setError(`אירעה שגיאה בטעינת השעות הזמינות: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setAvailableTimes([]);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, availabilitySlots]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactId) {
      setError('מידע הלקוח חסר. אנא ודא שהנך מחובר כראוי.');
      return;
    }

    try {
      const tenant = await DataService.getTenantById(tenantId);
      if (!tenant) {
        throw new Error('לא נמצאו נתוני עסק');
      }
      const { apiToken, calendarId, locationId } = tenant;

      if (!apiToken || !calendarId || !locationId) {
        setError('חסרים פרטי הגדרה או פרטי לקוח');
        return;
      }

      const startTime = new Date(`${date}T${time}`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // שעה אחת אחרי

      setIsLoading(true);
      const response = await fetch('https://services.leadconnectorhq.com/calendars/events/appointments', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          'Version': '2021-04-15'
        },
        body: JSON.stringify({
          calendarId: calendarId,
          locationId: locationId,
          contactId: contactId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          title: service,
          meetingLocationType: "default",
          appointmentStatus: "new",
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Appointment booked:', data);

      // שמירת התור במערכת המקומית
      const customerName = localStorage.getItem(`userName_${tenantId}`);
      const customerPhone = localStorage.getItem(`userPhone_${tenantId}`);
      const newAppointment = {
        id: data.id || Date.now().toString(),
        date,
        time,
        service,
        customerName: customerName || 'לא ידוע',
        customerPhone: customerPhone || 'לא ידוע'
      };
      await DataService.addTenantAppointment(tenantId, newAppointment);

      alert('התור נקבע בהצלחה!');
      // Reset form
      setDate('');
      setTime('');
      setService('');
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError(`אירעה שגיאה בקביעת התור: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (date) {
      fetchAvailableTimes(date);
    }
  }, [date, fetchAvailableTimes]);

  if (!contactId) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">שים לב! </strong>
        <span className="block sm:inline">נא למלא את פרטי הפרופיל לפני קביעת תור.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">קביעת תור חדש</h2>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <AlertCircle className="inline-block mr-2" size={18} />
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      {bookingMessage && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4">
          <p>{bookingMessage}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
          <div className="relative">
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pr-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-green-400 focus:border-green-400"
              required
            />
          </div>
        </div>
        {availableTimes.length > 0 && (
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">שעה</label>
            <div className="relative">
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <select
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pr-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-green-400 focus:border-green-400"
                required
              >
                <option value="">בחר שעה</option>
                {availableTimes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">שירות</label>
          <div className="relative">
            <Scissors className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <select
              id="service"
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="pr-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-green-400 focus:border-green-400"
              required
            >
              <option value="">בחר שירות</option>
              {services.map((s) => (
                <option key={s.id} value={s.name}>{s.name} - ₪{s.price}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-green-400 text-white py-2 px-4 rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          disabled={isLoading}
        >
          {isLoading ? 'טוען...' : 'קבע תור'}
        </button>
      </form>
    </div>
  );
};

export default BookAppointment;