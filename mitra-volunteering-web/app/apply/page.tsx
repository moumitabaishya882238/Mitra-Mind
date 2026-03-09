"use client";

import { useMemo, useState } from 'react';
import { api } from '@/lib/api';

type FormData = {
  fullName: string;
  dateOfBirth: string;
  country: string;
  state: string;
  city: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  educationLevel: string;
  fieldOfStudy: string;
  occupation: string;
  role: string;
  motivation: string;
  priorSupportExperience: string;
    profileImage: string;
  identityDocument: {
    fileName: string;
    mimeType: string;
    size: number;
    storageUrl: string;
  };
  trainingCompleted: boolean;
  trainingQuizScore: number;
  acceptedCodeOfConduct: boolean;
};

const initialData: FormData = {
  fullName: '',
  dateOfBirth: '',
  country: '',
  state: '',
  city: '',
  email: '',
  phone: '',
  emailVerified: false,
  phoneVerified: false,
  educationLevel: '',
  fieldOfStudy: '',
  occupation: '',
  role: 'Psychology Student',
  motivation: '',
  priorSupportExperience: '',
    profileImage: '',
  identityDocument: {
    fileName: '',
    mimeType: '',
    size: 0,
    storageUrl: '',
  },
  trainingCompleted: false,
  trainingQuizScore: 0,
  acceptedCodeOfConduct: false,
};

const steps = [
  'Basic Info',
  'Background',
  'Identity',
  'Training',
  'Code of Conduct',
  'Review',
  'Activation',
];

export default function ApplyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialData);
  const [statusText, setStatusText] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canProceed = useMemo(() => {
    if (step === 1) {
      return Boolean(
        form.fullName && form.dateOfBirth && form.country && form.state && form.city && form.email && form.phone &&
          form.emailVerified && form.phoneVerified
      );
    }
    if (step === 2) {
      return Boolean(form.educationLevel && form.fieldOfStudy && form.occupation && form.role && form.motivation && form.priorSupportExperience);
    }
    if (step === 3) {
      return Boolean(
        form.identityDocument.fileName &&
          form.identityDocument.mimeType &&
          form.identityDocument.size > 0 &&
          form.identityDocument.size <= 8 * 1024 * 1024
      );
    }
    if (step === 4) {
      return Boolean(form.trainingCompleted && form.trainingQuizScore >= 70);
    }
    if (step === 5) {
      return Boolean(form.acceptedCodeOfConduct);
    }
    return true;
  }, [form, step]);

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      identityDocument: {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        storageUrl: '',
      },
    }));
  };

  const handleProfileImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        setStatusText('Profile image must be JPEG, PNG, or WebP');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setStatusText('Profile image must be less than 5MB');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('profileImage', file);

        const response = await api.post('/upload/profile-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          setForm(prev => ({ ...prev, profileImage: response.data.profileImage }));
          setStatusText('Profile image uploaded successfully!');
          setTimeout(() => setStatusText(''), 3000);
        }
      } catch (error: any) {
        setStatusText(error?.response?.data?.error || 'Failed to upload profile image');
      }
  };

  const submitApplication = async () => {
    setSubmitting(true);
    setStatusText('Submitting application...');

    try {
      const response = await api.post('/listener-application', form);
      setApplicationId(response.data.application.id);
      setStatusText('Application submitted. Status: Pending Review.');
      setStep(7);
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Failed to submit application.';
      setStatusText(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Listener Application</h2>
      <p>Multi-step onboarding, similar to Google Forms. Steps must be completed sequentially.</p>

      <div className="inline-row" style={{ marginBottom: 12 }}>
        {steps.map((item, index) => (
          <span key={item} className="badge" style={{ background: step === index + 1 ? '#d8f6f0' : '#fff' }}>
            {index + 1}. {item}
          </span>
        ))}
      </div>

      {step === 1 ? (
        <div className="card">
          <h3>Step 1 - Basic Information</h3>
          <div className="grid">
            <label>Full Name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></label>
            <label>Date of Birth<input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></label>
            <label>Country<input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></label>
            <label>State<input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></label>
            <label>City<input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Phone<input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>

                    <div style={{ marginTop: 15 }}>
                      <label style={{ display: 'block', marginBottom: 8 }}>
                        <strong>Profile Image (Optional)</strong>
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfileImage} style={{ display: 'block', marginTop: 5 }} />
                      </label>
                      {form.profileImage && (
                        <div style={{ marginTop: 10 }}>
                          <img src={form.profileImage} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
                          <p style={{ fontSize: '0.9em', color: '#666' }}>✓ Profile image uploaded</p>
                        </div>
                      )}
                    </div>
          </div>

          <div className="inline-row" style={{ marginTop: 10 }}>
            <button className="button-secondary" onClick={() => setForm({ ...form, emailVerified: true })}>Verify Email OTP</button>
            <button className="button-secondary" onClick={() => setForm({ ...form, phoneVerified: true })}>Verify Phone OTP</button>
            <span className="badge">Email: {form.emailVerified ? 'Verified' : 'Pending'}</span>
            <span className="badge">Phone: {form.phoneVerified ? 'Verified' : 'Pending'}</span>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="card">
          <h3>Step 2 - Background Information</h3>
          <div className="grid">
            <label>Education Level<input value={form.educationLevel} onChange={(e) => setForm({ ...form, educationLevel: e.target.value })} /></label>
            <label>Field of Study<input value={form.fieldOfStudy} onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })} /></label>
            <label>Current Occupation<input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} /></label>
            <label>
              Role
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option>Psychology Student</option>
                <option>Social Worker</option>
                <option>NGO Volunteer</option>
                <option>Peer Support Volunteer</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <label>
            Why do you want to become a listener?
            <textarea rows={4} value={form.motivation} onChange={(e) => setForm({ ...form, motivation: e.target.value })} />
          </label>
          <label>
            Have you supported someone emotionally before?
            <textarea rows={4} value={form.priorSupportExperience} onChange={(e) => setForm({ ...form, priorSupportExperience: e.target.value })} />
          </label>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="card">
          <h3>Step 3 - Identity Verification</h3>
          <label>
            Upload ID / Passport / Student Card
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} />
          </label>
          <p>Allowed types: JPG, PNG, PDF. Max size: 8 MB.</p>
          <p>Selected: {form.identityDocument.fileName || 'None'}</p>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="card">
          <h3>Step 4 - Training Module</h3>
          <ul>
            <li>Active listening</li>
            <li>Empathy in conversations</li>
            <li>Avoiding harmful advice</li>
            <li>Recognizing crisis situations</li>
            <li>Escalation procedures</li>
          </ul>

          <label>
            Quiz: What should you do if a user expresses suicidal thoughts?
            <select
              value={form.trainingQuizScore >= 70 ? 'correct' : 'none'}
              onChange={(e) => {
                const passed = e.target.value === 'correct';
                setForm({
                  ...form,
                  trainingCompleted: passed,
                  trainingQuizScore: passed ? 100 : 0,
                });
              }}
            >
              <option value="none">Select answer</option>
              <option value="wrong">Give motivational advice only</option>
              <option value="wrong2">Ignore and continue normal chat</option>
              <option value="correct">Escalate to professional support</option>
            </select>
          </label>

          <p>Quiz score: {form.trainingQuizScore}%</p>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="card">
          <h3>Step 5 - Code of Conduct Agreement</h3>
          <ul>
            <li>Do not provide medical advice.</li>
            <li>Respect user privacy.</li>
            <li>Maintain respectful communication.</li>
            <li>Escalate crisis situations when needed.</li>
          </ul>

          <label className="inline-row">
            <input
              type="checkbox"
              checked={form.acceptedCodeOfConduct}
              onChange={(e) => setForm({ ...form, acceptedCodeOfConduct: e.target.checked })}
            />
            I agree to the platform code of conduct.
          </label>
        </div>
      ) : null}

      {step === 6 ? (
        <div className="card">
          <h3>Step 6 - Admin Review</h3>
          <p>Your application will be marked as <strong>Pending Review</strong> after submission.</p>
          <div className="notice">
            Admins can approve, reject, or request additional information.
          </div>
        </div>
      ) : null}

      {step === 7 ? (
        <div className="card">
          <h3>Step 7 - Listener Activation</h3>
          <p>
            {applicationId
              ? `Approved applications create listener records. Application ID: ${applicationId}`
              : 'Activation occurs automatically when admins approve your application.'}
          </p>
        </div>
      ) : null}

      {statusText ? <p className="notice">{statusText}</p> : null}

      <div className="inline-row" style={{ marginTop: 10 }}>
        <button className="button-secondary" disabled={step === 1 || submitting} onClick={() => setStep((prev) => Math.max(1, prev - 1))}>
          Previous
        </button>

        {step < 6 ? (
          <button className="button-primary" disabled={!canProceed || submitting} onClick={() => setStep((prev) => prev + 1)}>
            Next Step
          </button>
        ) : null}

        {step === 6 ? (
          <button className="button-primary" disabled={submitting || !canProceed} onClick={submitApplication}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        ) : null}
      </div>
    </section>
  );
}
