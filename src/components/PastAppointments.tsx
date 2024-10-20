import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Scissors, DollarSign } from 'lucide-react';
import { DataService } from '../services/DataService';

interface Appointment {
  date: string;
  time: string;
  service: string;
  price: number;
}

interface PastAppointmentsProps {
  tenantId: string;
}

const PastAppointments: React.FC<PastAppointmentsProps> = ({ tenantId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadAppointments();
  }, [tenantId]);

  const loadAppointments = async () => {
    try {
      // כאן תוכל להוסיף קריאה לשרת להביא את התורים של העסק הספציפי
      // לדוגמה: const loadedAppointments = await DataService.getTenantAppointments(tenantId);
      // setAppointments(loadedAppointments);
      
      // בינתיים, נשתמש בנתונים מקומיים
      const storedAppointments = JSON.parse(localStorage.getItem(`appointments_${tenantId}`) || '[]');
      setAppointments(storedAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">תורים שנקבעו</h2>
      {appointments.length > 0 ? (
        <ul className="space-y-4">
          {appointments.map((appointment, index) => (
            <li key={index} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <Calendar className="text-blue-400" size={24} />
                <div>
                  <p className="font-semibold">{appointment.date}</p>
                  <p className="text-sm text-gray-600">{appointment.service}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="flex items-center">
                  <Clock className="text-gray-400 ml-1" size={18} />
                  <span className="text-sm text-gray-600">{appointment.time}</span>
                </div>
                <div className="flex items-center">
                  <DollarSign className="text-green-400 ml-1" size={18} />
                  <span className="text-sm font-semibold">₪{appointment.price}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600">לא נמצאו תורים קודמים.</p>
      )}
    </div>
  );
};

export default PastAppointments;