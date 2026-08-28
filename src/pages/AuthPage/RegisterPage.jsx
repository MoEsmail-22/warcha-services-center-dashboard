import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';

import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import FormHookInput from '../../components/ui/FormHookInput';

export default function RegisterPage() {
  const { register } = useAuth();
  const { dir } = useLanguage();
  const { t } = useAppTranslation('common');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setErrors] = useState('');
  const { lang = 'en' } = useParams();

  const {
    register: registerField,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (formData) => {
    setErrors('');
    clearErrors('root.server');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });
      navigate(`/${lang}/`, { replace: true });
    } catch (err) {
      const message = err.message || 'Registration failed';
      const normalizedMessage = message.toLowerCase();
      const field = ['name', 'email', 'phone', 'address', 'password'].find((fieldName) =>
        normalizedMessage.includes(fieldName)
      );

      if (field) {
        setError(field, { type: 'server', message });
      } else {
        setErrors(message);
      }
    }
  };

  return (
    <div dir={dir} className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {t('register.title', { defaultValue: 'Create your account' })}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('register.subtitle', { defaultValue: 'Get started with your dashboard' })}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormHookInput
            id="register-name"
            type="text"
            label={t('register.name', { defaultValue: 'Full name' })}
            autoComplete="name"
            error={errors.name?.message}
            register={registerField}
            name="name"
            rules={{ required: 'Name is required' }}
          />

          <FormHookInput
            id="register-email"
            type="email"
            label={t('register.email', { defaultValue: 'Email address' })}
            autoComplete="email"
            error={errors.email?.message}
            register={registerField}
            name="email"
            rules={{ required: 'Email is required' }}
          />

          <FormHookInput
            id="register-phone"
            type="tel"
            label="Phone"
            autoComplete="tel"
            error={errors.phone?.message}
            register={registerField}
            name="phone"
            rules={{ required: 'Phone is required' }}
          />

          <FormHookInput
            id="register-address"
            type="text"
            label="Address"
            autoComplete="street-address"
            error={errors.address?.message}
            register={registerField}
            name="address"
            rules={{ required: 'Address is required' }}
          />

          <div className="relative">
            <FormHookInput
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              label={t('register.password', { defaultValue: 'Password ' })}
              autoComplete="new-password"
              error={errors.password?.message}
              className="pe-16"
              register={registerField}
              name="password"
              rules={{
                required: 'Password is required',
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@&-]).{8,}$/,
                  message: '',
                },
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute end-2 top-8 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <p className="mt-1 text-xs text-gray-500">
              Use at least 8 characters, including one lowercase letter, one uppercase letter, one
              number, and one special character (@, -, or &).
            </p>
          </div>

          <div className="relative">
            <FormHookInput
              id="register-confirm-password"
              type={showPassword ? 'text' : 'password'}
              label={t('register.confirmPassword', { defaultValue: 'Confirm password' })}
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              className="pe-16"
              register={registerField}
              name="confirmPassword"
              rules={{
                required: 'Please confirm your password',
                validate: (value, formValues) =>
                  value === formValues.password || 'Passwords do not match',
                deps: ['password'],
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute end-2 top-8 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? t('register.loading', { defaultValue: 'Creating account…' })
              : t('register.submit', { defaultValue: 'Create account' })}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t('register.hasAccount', { defaultValue: 'Already have an account?' })}{' '}
          <Link to={`/${lang}/login`} className="font-semibold text-blue-600 hover:underline">
            {t('register.loginLink', { defaultValue: 'Sign in' })}
          </Link>
        </p>
      </div>
    </div>
  );
}
