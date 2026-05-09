import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, LayoutDashboard, Send } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-premium mb-4">
            <LayoutDashboard className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-center">Reset Password</h1>
        </div>

        <Card className="shadow-premium border-none">
          {!isSent ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Forgot Password?</h2>
                <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you a link to reset your password.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="admin@example.com"
                  icon={Mail}
                  required
                />
                
                <Button type="submit" className="w-full h-12 text-base" isLoading={isLoading}>
                  <Send size={18} className="mr-2" />
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Check Your Email</h2>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                We've sent a password reset link to your email address. Please follow the instructions to reset your password.
              </p>
              <Link to="/login">
                <Button variant="secondary" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
