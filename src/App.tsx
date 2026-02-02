import { LoginPage } from './components/LoginPage';

// Test Step 1: Add LoginPage
export default function App() {
  const handleLogin = async (username: string, password: string) => {
    console.log('Login attempt:', username);
    return false; // Mock login
  };

  return <LoginPage onLogin={handleLogin} />;
}
