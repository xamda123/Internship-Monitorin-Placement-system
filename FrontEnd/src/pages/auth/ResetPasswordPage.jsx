import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, LayoutDashboard, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-premium mb-4">
            <LayoutDashboard className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 text-center">Set New Password</h1>
        </div>

        <Card className="shadow-premium border-none">
          {!isSuccess ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Create New Password</h2>
                <p className="text-sm text-gray-500 mt-1">Your new password must be different from previous used passwords.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  required
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  required
                />
                
                <Button type="submit" className="w-full h-12 text-base" isLoading={isLoading}>
                  Reset Password
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Password Updated!</h2>
              <p className="text-sm text-gray-500 mt-2 mb-6">
                Your password has been successfully reset. You can now log in with your new credentials.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Back to Login
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
