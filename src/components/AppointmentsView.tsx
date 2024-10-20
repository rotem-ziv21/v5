import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Scissors } from 'lucide-react';
import { DataService } from '../services/DataService';

interface Appointment {
  id: string;
  date: string;
  time: string;
  service: string;
  customerName: string;
  customerPhone: string;
}

interface AppointmentsViewProps {
  tenantId: string;
}

const AppointmentsView: React.FC<AppointmentsViewProps> = ({ tenantId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    loadAppointments();
  }, [tenantId]);

  const loadAppointments = async () => {
    try {
      const appointmentsData = await DataService.getTenantAppointments(tenantId);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">תורים שנקבעו</h3>
      {appointments.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 text-right">תאריך</th>
                <th className="py-2 px-4 text-right">שעה</th>
                <th className="py-2 px-4 text-right">שירות</th>
                <th className="py-2 px-4 text-right">שם הלקוח</th>
                <th className="py-2 px-4 text-right">טלפון</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id} className="border-b">
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <Calendar className="text-blue-400 ml-2" size={18} />
                      {appointment.date}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <Clock className="text-gray-400 ml-2" size={18} />
                      {appointment.time}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <Scissors className="text-purple-400 ml-2" size={18} />
                      {appointment.service}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <User className="text-green-400 ml-2" size={18} />
                      {appointment.customerName}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center">
                      <Phone className="text-red-400 ml-2" size={18} />
                      {appointment.customerPhone}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-600">לא נמצאו תורים.</p>
      )}
    </div>
  );
};

export default AppointmentsView;