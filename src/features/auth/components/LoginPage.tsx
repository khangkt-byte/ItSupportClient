import { useState } from 'react';
import { Eye, EyeOff, FileText } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FieldError } from '@/components/common/FieldError';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { LoginResponse } from '@/features/auth/types/auth';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<LoginResponse>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username: string[]; password: string[] }>({
    username: [],
    password: [],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ username: [], password: [] });

    const nextFieldErrors = {
      username: username ? [] : ['Please enter a username.'],
      password: password ? [] : ['Please enter a password.'],
    };

    if (nextFieldErrors.username.length > 0 || nextFieldErrors.password.length > 0) {
      setFieldErrors(nextFieldErrors);
      setError('Please correct the highlighted fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await onLogin(username, password);

      if (!response.success) {
        setError(response.error || 'Invalid username or password');
        setPassword('');
      }
    } catch (err) {
      setError('Unable to sign in. Please try again.');
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
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setUsername(nextValue);
                  if (nextValue && fieldErrors.username.length > 0) {
                    setFieldErrors((prev) => ({ ...prev, username: [] }));
                  }
                }}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                  fieldErrors.username.length > 0
                    ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                    : 'border-input focus:ring-primary-500 focus:border-transparent'
                }`}
                placeholder="Enter your username"
              />
              <FieldError messages={fieldErrors.username} />
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
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setPassword(nextValue);
                    if (nextValue && fieldErrors.password.length > 0) {
                      setFieldErrors((prev) => ({ ...prev, password: [] }));
                    }
                  }}
                  required
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 ${
                    fieldErrors.password.length > 0
                      ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                      : 'border-input focus:ring-primary-500 focus:border-transparent'
                  }`}
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
              <FieldError messages={fieldErrors.password} />
            </div>

            {error && <ErrorAlert message={error} />}

            <button
              type="submit"
              className="w-full bg-primary-600 text-primary-foreground py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" tone="current" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
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