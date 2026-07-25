import { Routes, Route } from 'react-router-dom';
import Welcome from './pages/auth/Welcome.jsx';
import Login from './pages/auth/Login.jsx';
import PatientDashboard from './pages/patient/Dashboard.jsx';
import DoctorDashboard from './pages/doctor/Dashboard.jsx';
import PatientDetail from './pages/doctor/PatientDetail.jsx';
import ChooseAccountType from './pages/auth/ChooseAccountType.jsx';
import RegisterPatient from './pages/patient/RegisterPatient.jsx';
import RegisterDoctor from './pages/doctor/RegisterDoctor.jsx';
import PendingVerification from './pages/auth/PendingVerification.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';
import VerifyOTP from './pages/auth/VerifyOTP.jsx';
import AccountReady from './pages/auth/AccountReady.jsx';
import LogReading from './pages/patient/LogReading.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/choose-account-type" element={<ChooseAccountType />} />
      <Route path="/register/patient" element={<RegisterPatient />} />
      <Route path="/register/doctor" element={<RegisterDoctor />} />
      <Route path="/pending-verification" element={<PendingVerification />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/account-ready" element={<AccountReady />} />

      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/patient/:patientId"
        element={
          <ProtectedRoute allowedRoles={['doctor']}>
            <PatientDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/log-reading"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <LogReading />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;