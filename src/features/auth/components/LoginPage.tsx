import { useState } from 'react';
import { Eye, EyeOff, FileText } from 'lucide-react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    setIsLoading(true);
    try {
      const success = await onLogin(username, password);

      if (!success) {
        setError('Invalid username or password');
        setPassword('');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-primary-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">IT Support System</h1>
            <p className="text-muted-foreground mt-2">Sign in to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-muted-foreground mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-placeholder hover:text-muted-foreground z-10"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-error-background border border-error-border rounded-lg">
                <p className="text-sm text-error-foreground">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-600 text-primary-foreground py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground font-medium mb-2">Demo Credentials:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Employee:</strong> employee / employee123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}