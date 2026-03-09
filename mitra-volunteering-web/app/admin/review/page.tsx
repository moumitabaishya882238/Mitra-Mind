"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

type ListenerApplication = {
  _id: string;
  fullName: string;
  dateOfBirth: string;
  country: string;
  state: string;
  city: string;
  email: string;
  phone: string;
  educationLevel: string;
  fieldOfStudy: string;
  occupation: string;
  role: string;
  motivation: string;
  priorSupportExperience: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityDocument?: {
    fileName: string;
    mimeType: string;
    size: number;
  };
  trainingCompleted: boolean;
  quizScore: number;
  conductAgreement: boolean;
  applicationStatus: 'pending-review' | 'approved' | 'rejected' | 'needs-info';
  createdAt: string;
  adminNotes?: string;
};

type Admin = {
  email: string;
  name: string;
  role: string;
};

export default function AdminReviewPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [applications, setApplications] = useState<ListenerApplication[]>([]);
  const [statusText, setStatusText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get('/auth/admin/me');
        if (res.data.success) {
          setAdmin(res.data.admin);
          loadApplications();
        } else {
          router.push('/admin/login');
        }
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const loadApplications = async () => {
    try {
      const response = await api.get('/listener-applications');
      setApplications(response.data.applications || []);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/admin/login');
      } else {
        setStatusText('Failed to load applications.');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/admin/logout');
      router.push('/admin/login');
    } catch {
      setStatusText('Logout failed');
    }
  };

  const review = async (id: string, status: 'approved' | 'rejected' | 'needs-info', notes: string = '') => {
    try {
      await api.patch(`/listener-applications/${id}/status`, {
        status,
        adminNotes: notes || `Updated by ${admin?.name || 'admin'}: ${status}`,
      });
      setStatusText(`Application ${id.slice(-6)} updated to ${status}.`);
      setSelectedApp(null);
      loadApplications();
    } catch {
      setStatusText('Failed to update application.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!admin) {
    return null;
  }

  const selectedApplication = applications.find(app => app._id === selectedApp);

  return (
    <section className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Admin Review Queue</h2>
          <p>Logged in as: <strong>{admin.email}</strong> ({admin.role})</p>
        </div>
        <button className="button-secondary" onClick={handleLogout}>Logout</button>
      </div>

      {statusText ? <p className="notice">{statusText}</p> : null}

      {selectedApplication ? (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button className="button-secondary" onClick={() => setSelectedApp(null)}>← Back to List</button>
          
          <h3 style={{ marginTop: '20px' }}>Application Details</h3>
          
          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            <div>
              <strong>Full Name:</strong> {selectedApplication.fullName}
            </div>
            <div>
              <strong>Email:</strong> {selectedApplication.email}
              {selectedApplication.emailVerified && <span style={{ color: 'green' }}> ✓ Verified</span>}
            </div>
            <div>
              <strong>Phone:</strong> {selectedApplication.phone}
              {selectedApplication.phoneVerified && <span style={{ color: 'green' }}> ✓ Verified</span>}
            </div>
            <div>
              <strong>Date of Birth:</strong> {new Date(selectedApplication.dateOfBirth).toLocaleDateString()}
            </div>
            <div>
              <strong>Location:</strong> {selectedApplication.city}, {selectedApplication.state}, {selectedApplication.country}
            </div>
            <div>
              <strong>Education:</strong> {selectedApplication.educationLevel} - {selectedApplication.fieldOfStudy}
            </div>
            <div>
              <strong>Occupation:</strong> {selectedApplication.occupation}
            </div>
            <div>
              <strong>Role Applied:</strong> {selectedApplication.role}
            </div>
            <div>
              <strong>Motivation:</strong>
              <p style={{ marginTop: '5px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                {selectedApplication.motivation}
              </p>
            </div>
            <div>
              <strong>Prior Experience:</strong>
              <p style={{ marginTop: '5px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                {selectedApplication.priorSupportExperience}
              </p>
            </div>
            {selectedApplication.identityDocument && (
              <div>
                <strong>Identity Document:</strong> {selectedApplication.identityDocument.fileName} 
                ({(selectedApplication.identityDocument.size / 1024 / 1024).toFixed(2)} MB)
              </div>
            )}
            <div>
              <strong>Training Completed:</strong> {selectedApplication.trainingCompleted ? 'Yes ✓' : 'No'}
            </div>
            <div>
              <strong>Quiz Score:</strong> {selectedApplication.quizScore}%
            </div>
            <div>
              <strong>Conduct Agreement:</strong> {selectedApplication.conductAgreement ? 'Accepted ✓' : 'Not Accepted'}
            </div>
            <div>
              <strong>Applied On:</strong> {new Date(selectedApplication.createdAt).toLocaleString()}
            </div>
            <div>
              <strong>Status:</strong> <span style={{ 
                padding: '4px 8px', 
                borderRadius: '4px',
                background: selectedApplication.applicationStatus === 'approved' ? '#d4edda' : 
                           selectedApplication.applicationStatus === 'rejected' ? '#f8d7da' : 
                           selectedApplication.applicationStatus === 'needs-info' ? '#fff3cd' : '#cce5ff'
              }}>
                {selectedApplication.applicationStatus}
              </span>
            </div>
            {selectedApplication.adminNotes && (
              <div>
                <strong>Admin Notes:</strong>
                <p style={{ marginTop: '5px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                  {selectedApplication.adminNotes}
                </p>
              </div>
            )}
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
            <button 
              className="button-primary" 
              onClick={() => review(selectedApplication._id, 'approved', 'Application approved after review')}
            >
              ✓ Approve Application
            </button>
            <button 
              className="button-secondary" 
              onClick={() => {
                const notes = prompt('Enter reason for requesting more info:');
                if (notes) review(selectedApplication._id, 'needs-info', notes);
              }}
            >
              ⚠ Request More Info
            </button>
            <button 
              className="button-secondary" 
              onClick={() => {
                const notes = prompt('Enter reason for rejection:');
                if (notes) review(selectedApplication._id, 'rejected', notes);
              }}
            >
              ✗ Reject Application
            </button>
          </div>
        </div>
      ) : (
        <div className="grid">
          {applications.length === 0 ? (
            <p>No applications to review.</p>
          ) : (
            applications.map((app) => (
              <div key={app._id} className="card" onClick={() => setSelectedApp(app._id)} style={{ cursor: 'pointer' }}>
                <h3>{app.fullName}</h3>
                <p><strong>Role:</strong> {app.role}</p>
                <p><strong>Email:</strong> {app.email}</p>
                <p><strong>Location:</strong> {app.city}, {app.state}</p>
                <p>
                  <strong>Status:</strong> <span style={{ 
                    padding: '2px 6px', 
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    background: app.applicationStatus === 'approved' ? '#d4edda' : 
                               app.applicationStatus === 'rejected' ? '#f8d7da' : 
                               app.applicationStatus === 'needs-info' ? '#fff3cd' : '#cce5ff'
                  }}>
                    {app.applicationStatus}
                  </span>
                </p>
                <p><strong>Applied:</strong> {new Date(app.createdAt).toLocaleDateString()}</p>
                <button className="button-primary" style={{ marginTop: '10px' }}>View Details →</button>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}
