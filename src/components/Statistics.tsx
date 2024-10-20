import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

const Statistics: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // נתונים לדוגמה - בפרויקט אמיתי, אלה יגיעו מהשרת
  const appointmentData = [
    { name: 'ינואר', appointments: 65 },
    { name: 'פברואר', appointments: 59 },
    { name: 'מרץ', appointments: 80 },
    { name: 'אפריל', appointments: 81 },
    { name: 'מאי', appointments: 56 },
  ];

  const serviceData = [
    { name: 'תספורת', count: 120 },
    { name: 'צביעה', count: 86 },
    { name: 'מניקור', count: 57 },
    { name: 'פדיקור', count: 45 },
    { name: 'טיפול פנים', count: 30 },
  ];

  const handleFilter = () => {
    // כאן תהיה הלוגיקה לסינון הנתונים לפי התאריכים שנבחרו
    console.log('Filtering data from', startDate, 'to', endDate);
    // בפרויקט אמיתי, כאן היית מבצע קריאת API עם הפרמטרים החדשים
  };

  return (
    <div className="space-y-8">
      <h3 className="text-xl font-semibold mb-4">סטטיסטיקות</h3>
      
      <div className="flex space-x-4 space-x-reverse">
        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="pr-10 p-2 border border-gray-300 rounded-lg focus:ring-green-400 focus:border-green-400"
            placeholder="תאריך התחלה"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="pr-10 p-2 border border-gray-300 rounded-lg focus:ring-green-400 focus:border-green-400"
            placeholder="תאריך סיום"
          />
        </div>
        <button
          onClick={handleFilter}
          className="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition duration-300"
        >
          סנן
        </button>
      </div>

      <div>
        <h4 className="text-lg font-medium mb-2">תורים לפי חודש</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={appointmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="appointments" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 className="text-lg font-medium mb-2">שירותים פופולריים</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={serviceData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h4 className="text-lg font-medium mb-2">סה"כ תורים בטווח הנבחר</h4>
          <p className="text-3xl font-bold">81</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h4 className="text-lg font-medium mb-2">הכנסות בטווח הנבחר</h4>
          <p className="text-3xl font-bold">₪ 8,100</p>
        </div>
      </div>
    </div>
  );
};

export default Statistics;