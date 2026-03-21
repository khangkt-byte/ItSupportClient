import { useState, useEffect } from 'react';
import { Eye, EyeOff, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { ErrorAlert } from '@/components/common/ErrorAlert';
import { FieldError } from '@/components/common/FieldError';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { authApi } from '@/services/api/auth';
import { parseApiError } from '@/utils/apiErrors';
import { validatePasswordComplexity, validatePasswordsMatch } from '@/utils/validation/passwordValidation';
import type { ResetPasswordDto } from '@/features/auth/types/auth';

interface ResetPasswordPageProps {
  onResetSuccess?: () => void;
}

/**
 * Password reset page
 * Pattern: Secure password reset (OWASP)
 * Accessed via: https://localhost:3000/reset-password?token=<secure-token>
 */
export function ResetPasswordPage({ onResetSuccess }: ResetPasswordPageProps) {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    newPassword: string[];
    confirmPassword: string[];
  }>({
    newPassword: [],
    confirmPassword: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);

  // Extract token from URL query parameter
  // Safely decode token: handle Base64 special chars (+, /, =) that may be URL-encoded
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let tokenFromUrl = params.get('token');

    if (!tokenFromUrl) {
      setIsTokenInvalid(true);
      setError('Invalid or missing reset token. Please check your email for the reset link.');
    } else {
      // Decode URL-encoded token and restore Base64 special chars
      // URLSearchParams converts + to space, so we need to normalize
      try {
        const decodedToken = decodeURIComponent(tokenFromUrl).replace(/ /g, '+');
        setToken(decodedToken);
      } catch (e) {
        // Fallback: use token as-is and replace spaces with + (common URL encoding issue)
        const normalizedToken = tokenFromUrl.replace(/ /g, '+');
        setToken(normalizedToken);
      }
    }
  }, []);

  const validatePasswords = (): boolean => {
    const complexityResult = validatePasswordComplexity(newPassword);
    const matchResult = validatePasswordsMatch(newPassword, confirmPassword);

    const errors = {
      newPassword: complexityResult.errors,
      confirmPassword: matchResult.error ? [matchResult.error] : [],
    };

    setFieldErrors(errors);
    return complexityResult.isValid && matchResult.isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({ newPassword: [], confirmPassword: [] });

    if (!validatePasswords()) {
      setError('Please correct the highlighted fields.');
      return;
    }

    setIsLoading(true);
    try {
      const resetDto: ResetPasswordDto = {
        token,
        newPassword,
        confirmPassword,
      };

      await authApi.resetPassword(resetDto);
      setIsSuccess(true);

      // Clear form
      setNewPassword('');
      setConfirmPassword('');

      // Call success callback after 2 seconds
      setTimeout(() => {
        if (onResetSuccess) {
          onResetSuccess();
        } else {
          // Redirect to login
          window.location.href = '/login';
        }
      }, 2000);
    } catch (err: any) {
      const parsedError = parseApiError(err);

      if (parsedError.isAuthenticationError || err.status === 401) {
        setIsTokenInvalid(true);
        setError('Reset token has expired or is invalid. Please request a new password reset link.');
      } else if (parsedError.isValidationError && parsedError.fieldErrors) {
        // Set field-specific errors from API
        const errors = {
          newPassword: parsedError.fieldErrors.NewPassword || [],
          confirmPassword: parsedError.fieldErrors.ConfirmPassword || [],
        };
        setFieldErrors(errors);
        setError('Please correct the highlighted fields.');
      } else {
        setError(parsedError.message || 'Failed to reset password. Please try again.');
      }

      // Clear a field on input when it had error
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-error-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Invalid Reset Link</h1>
              <p className="text-muted-foreground mt-2">The password reset link is invalid or has expired.</p>
            </div>

            <div className="space-y-4">
              <ErrorAlert message={error} />

              <div className="p-4 bg-accent border border-border rounded-lg">
                <p className="text-sm text-foreground font-medium mb-2">What to do?</p>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Request a new password reset link from the login page</li>
                  <li>• Check your email for the reset link (check spam folder too)</li>
                  <li>• Contact your administrator if you need help</li>
                </ul>
              </div>

              <a
                href="/login"
                className="block w-full text-center bg-primary-600 text-primary-foreground py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Return to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-success-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Password Reset Successful</h1>
              <p className="text-muted-foreground mt-2">Your password has been updated successfully.</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-success-background border border-success-border rounded-lg">
                <p className="text-success-foreground text-sm">
                  You can now sign in with your new password. Redirecting to login page...
                </p>
              </div>

              <a
                href="/login"
                className="block w-full text-center bg-primary-600 text-primary-foreground py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Reset Your Password</h1>
            <p className="text-muted-foreground mt-2">Enter a new password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-muted-foreground mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setNewPassword(nextValue);
                    if (nextValue && fieldErrors.newPassword.length > 0) {
                      setFieldErrors((prev) => ({ ...prev, newPassword: [] }));
                    }
                  }}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 bg-card text-foreground placeholder-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.newPassword.length > 0
                      ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                      : 'border-border focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldError messages={fieldErrors.newPassword} />

              {/* Password Requirements */}
              <div className="mt-2 p-3 bg-accent border border-border rounded-lg">
                <p className="text-xs font-medium text-foreground mb-2">Password requirements:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {(() => {
                    const checks = validatePasswordComplexity(newPassword).checks;
                    return (
                      <>
                        <li className={checks.minLength ? 'text-success-foreground' : ''}>
                          • At least 8 characters {checks.minLength && '✓'}
                        </li>
                        <li className={checks.uppercase ? 'text-success-foreground' : ''}>
                          • One uppercase letter {checks.uppercase && '✓'}
                        </li>
                        <li className={checks.lowercase ? 'text-success-foreground' : ''}>
                          • One lowercase letter {checks.lowercase && '✓'}
                        </li>
                        <li className={checks.number ? 'text-success-foreground' : ''}>
                          • One number {checks.number && '✓'}
                        </li>
                        <li className={checks.specialChar ? 'text-success-foreground' : ''}>
                          • One special character (!@#$%^&*, etc) {checks.specialChar && '✓'}
                        </li>
                      </>
                    );
                  })()}
                </ul>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-muted-foreground mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    const nextValue = e.target.value;
                    setConfirmPassword(nextValue);
                    if (nextValue && fieldErrors.confirmPassword.length > 0) {
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: [] }));
                    }
                  }}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 bg-card text-foreground placeholder-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed ${
                    fieldErrors.confirmPassword.length > 0
                      ? 'border-error-border focus:ring-error-border/30 focus:border-error-border'
                      : 'border-border focus:ring-primary-500 focus:border-primary-500'
                  }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground z-10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <FieldError messages={fieldErrors.confirmPassword} />
            </div>

            {error && <ErrorAlert message={error} />}

            <button
              type="submit"
              className="w-full bg-primary-600 text-primary-foreground py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading || !token}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" tone="current" />
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <a href="/login" className="text-primary-600 hover:text-primary-700 transition-colors font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
