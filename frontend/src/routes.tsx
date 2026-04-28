import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import PlanComparison from './components/PlanComparison';
import Analytics from './components/Analytics';
import Profile from './components/Profile';

function LandingPageRoute() {
  const navigate = useNavigate();

  const handleSignIn = () => navigate('/signin');
  const handleSignUp = () => navigate('/signup');

  return <LandingPage onStart={() => navigate('/app/dashboard')} onSignIn={handleSignIn} onSignUp={handleSignUp} />;
}

function SignInRoute() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAppContext();

  const handleSignIn = () => {
    setIsAuthenticated(true);
    navigate('/app/dashboard');
  };

  return <SignIn onSignIn={handleSignIn} onBack={() => navigate('/')} onSwitchToSignIn={() => navigate('/signup')} />;
}

function SignUpRoute() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAppContext();

  const handleSignUp = () => {
    setIsAuthenticated(true);
    navigate('/app/dashboard');
  };

  return <SignUp onSignUp={handleSignUp} onBack={() => navigate('/signin')} onSwitchToSignIn={() => navigate('/signin')} />;
}

function DashboardRoute() {
  const { language } = useAppContext();
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    // Trigger notification for plan-related actions
    if (action === 'why-data' || action === 'cheaper' || action === 'compare') {
      // Will be handled in ChatAssistant
      navigate('/app/chat');
    } else if (action === 'plans') {
      navigate('/app/plans');
    } else if (action === 'profile') {
      navigate('/app/profile');
    }
  };

  return <Dashboard language={language} onAction={handleAction} />;
}

function ChatRoute() {
  const { language } = useAppContext();
  const navigate = useNavigate();
  return <ChatAssistant language={language} onBack={() => navigate('/app/dashboard')} />;
}

function PlansRoute() {
  return (
    <PlanComparison
      currentPlanId="pulse-flexi"
      recommendedPlanId="pulse-plus"
      onSwitch={() => alert('Switching plan successful! USSD: *312# sent.')}
    />
  );
}

function InsightsRoute() {
  return <Analytics />;
}

function ProfileRoute() {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAppContext();

  const handleSignOut = () => {
    setIsAuthenticated(false);
    navigate('/signin');
  };

  return <Profile onSignOut={handleSignOut} />;
}

function AppLayout() {
  const location = useLocation();
  const pathParts = location.pathname.split('/');
  const activeTab = pathParts[2] || 'dashboard';
  const navigate = useNavigate();
  const { isAuthenticated } = useAppContext();

  const handleProfileClick = () => {
    navigate('/app/profile');
  };

  const handleTabChange = (tabId: string) => {
    if (tabId === 'profile') {
      handleProfileClick();
    } else {
      navigate(`/app/${tabId}`);
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      showNav={true}
      isAuthenticated={isAuthenticated}
      onProfileClick={handleProfileClick}
    />
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppProviderWrapper />,
    children: [
      { index: true, element: <LandingPageRoute /> },
      { path: 'signin', element: <SignInRoute /> },
      { path: 'signup', element: <SignUpRoute /> },
      {
        path: 'app',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: 'dashboard', element: <DashboardRoute /> },
          { path: 'chat', element: <ChatRoute /> },
          { path: 'plans', element: <PlansRoute /> },
          { path: 'insights', element: <InsightsRoute /> },
          { path: 'profile', element: <ProfileRoute /> },
        ],
      },
    ],
  },
]);

function AppProviderWrapper() {
  const navigate = useNavigate();
  return (
    <AppProvider navigate={navigate}>
      <Outlet />
    </AppProvider>
  );
}
