import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataService, Tenant } from '../services/DataService';
import { AlertCircle, Plus, Trash, Edit, ArrowLeft } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

const TeamManagement: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'employee' });

  useEffect(() => {
    const loadData = async () => {
      if (!tenantId) {
        setError('מזהה עסק חסר');
        setIsLoading(false);
        return;
      }
      try {
        const tenantData = await DataService.getTenantById(tenantId);
        setTenant(tenantData);
        // כאן תוכל להוסיף קריאה לשרת להביא את רשימת חברי הצוות
        // לדוגמה: const members = await DataService.getTeamMembers(tenantId);
        // setTeamMembers(members);
        setTeamMembers([]); // כרגע נשאיר ריק
      } catch (err) {
        setError('נכשלה טעינת נתוני הצוות. אנא נסה שוב מאוחר יותר.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [tenantId]);

  const handleAddMember = () => {
    // כאן תוכל להוסיף קריאה לשרת להוספת חבר צוות חדש
    // לדוגמה: await DataService.addTeamMember(tenantId, newMember);
    const newTeamMember: TeamMember = {
      id: Date.now().toString(),
      ...newMember
    };
    setTeamMembers([...teamMembers, newTeamMember]);
    setNewMember({ name: '', email: '', role: 'employee' });
  };

  const handleDeleteMember = (memberId: string) => {
    // כאן תוכל להוסיף קריאה לשרת למחיקת חבר צוות
    // לדוגמה: await DataService.deleteTeamMember(tenantId, memberId);
    setTeamMembers(teamMembers.filter(member => member.id !== memberId));
  };

  if (isLoading) {
    return <div className="text-center mt-10">טוען נתוני צוות...</div>;
  }

  if (!tenant) {
    return <div className="text-center mt-10 text-red-600">לא נמצאו נתוני עסק</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <ArrowLeft className="mr-2" size={20} />
          חזרה לדף הראשי
        </button>
        <h2 className="text-2xl font-bold text-center">ניהול צוות: {tenant.name}</h2>
        <div className="w-24"></div> {/* Spacer for alignment */}
      </div>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">הוסף חבר צוות חדש</h3>
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMember.name}
            onChange={(e) => setNewMember({...newMember, name: e.target.value})}
            placeholder="שם"
            className="flex-grow p-2 border rounded"
          />
          <input
            type="email"
            value={newMember.email}
            onChange={(e) => setNewMember({...newMember, email: e.target.value})}
            placeholder="אימייל"
            className="flex-grow p-2 border rounded"
          />
          <select
            value={newMember.role}
            onChange={(e) => setNewMember({...newMember, role: e.target.value})}
            className="p-2 border rounded"
          >
            <option value="employee">עובד</option>
            <option value="manager">מנהל</option>
          </select>
          <button
            onClick={handleAddMember}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition duration-300"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
      <ul className="divide-y divide-gray-200">
        {teamMembers.map(member => (
          <li key={member.id} className="py-4 flex justify-between items-center">
            <div>
              <p className="text-lg font-medium">{member.name}</p>
              <p className="text-sm text-gray-500">{member.email}</p>
              <p className="text-sm text-gray-500">{member.role === 'manager' ? 'מנהל' : 'עובד'}</p>
            </div>
            <div className="flex space-x-2">
              <button className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition duration-300">
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDeleteMember(member.id)}
                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition duration-300"
              >
                <Trash size={20} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {teamMembers.length === 0 && (
        <p className="text-center text-gray-500 py-4">אין חברי צוות כרגע.</p>
      )}
    </div>
  );
};

export default TeamManagement;