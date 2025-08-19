import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Settings, UserPlus } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import backend from '~backend/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface RegisterForm {
  nik: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>();

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterForm, 'confirmPassword'>) => {
      return await backend.auth.register(data);
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful",
        description: data.message,
      });
      navigate('/login');
    },
    onError: (error: any) => {
      console.error('Registration error:', error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Settings className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Register using your employee information
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <Label htmlFor="nik">NIK (Employee ID Number)</Label>
              <Input
                id="nik"
                type="text"
                {...register('nik', { 
                  required: 'NIK is required',
                  minLength: { value: 16, message: 'NIK must be 16 digits' },
                  maxLength: { value: 16, message: 'NIK must be 16 digits' },
                  pattern: { value: /^\d+$/, message: 'NIK must contain only numbers' }
                })}
                placeholder="Enter your 16-digit NIK"
                className="mt-1"
              />
              {errors.nik && (
                <p className="mt-1 text-sm text-red-600">{errors.nik.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
                placeholder="Choose a username"
                className="mt-1"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { 
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="Enter your email address"
                className="mt-1"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                placeholder="Create a password"
                className="mt-1"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: (value) => value === watch('password') || 'Passwords do not match'
                })}
                placeholder="Confirm your password"
                className="mt-1"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>
            <div className="mt-3 text-center">
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">Registration Requirements</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Your NIK must be registered in the employee database</li>
                <li>• Email must match your employee record (if available)</li>
                <li>• Username must be unique</li>
                <li>• Password must be at least 6 characters</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
