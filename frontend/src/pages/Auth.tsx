
import { useState, type ReactNode, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  ShieldAlert,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserRound,
  Phone,
  Building2,
} from 'lucide-react';
import { api } from '../lib/mockApi';

type ShellProps = {
  img: string;
  children: ReactNode;
};

function Shell({ img, children }: ShellProps) {
  return (
    <main
      className="auth-page"
      style={{ backgroundImage: `url("${img}")` }}
    >
      <div className="auth-overlay" />

      <div className="auth-container">
        <Link to="/login" className="auth-brand">
          <span className="auth-brand-icon">
            <ShieldAlert size={28} />
          </span>
          <span>
            <span className="auth-brand-name">
              Rescue<span>Track</span>
            </span>
            <span className="auth-brand-tagline">
              Intelligent Accident Detection
            </span>
          </span>
        </Link>

        <section className="auth-panel">{children}</section>

        <p className="auth-footer">
          Emergency response coordination · RescueTrack
        </p>
      </div>
    </main>
  );
}

type FieldProps = {
  label: string;
  icon?: ReactNode;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  right?: ReactNode;
};

function Field({
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = true,
  minLength,
  autoComplete,
  right,
}: FieldProps) {
  return (
    <label className="auth-field">
      <span className="auth-label">{label}</span>
      <span className="auth-input-wrap">
        {icon && <span className="auth-input-icon">{icon}</span>}
        <input
          className="auth-input"
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
        />
        {right}
      </span>
    </label>
  );
}

const loginImage =
  'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1800&q=85';

const signupImage =
  'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1800&q=85';

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      await api.login(email.trim(), password);

      if (remember) {
        sessionStorage.setItem('rescuetrack-remember', 'true');
      }

      navigate('/dashboard');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please check your credentials.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell img={loginImage}>
      <div className="auth-heading">
        <span className="auth-eyebrow">SECURE ACCESS</span>
        <h1>Welcome back</h1>
        <p>Sign in to monitor incidents and coordinate emergency response.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Field
          label="Email address"
          icon={<Mail size={18} />}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="name@organization.com"
          autoComplete="username"
        />

        <Field
          label="Password"
          icon={<LockKeyhole size={18} />}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          minLength={8}
          autoComplete="current-password"
          right={
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <div className="auth-options">
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <button
            type="button"
            className="auth-text-button"
            onClick={() =>
              window.alert(
                'Please contact your system administrator to reset your password.',
              )
            }
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="auth-spinner" size={19} />
              Signing in...
            </>
          ) : (
            <>
              Sign in to dashboard
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </form>

      <div className="auth-divider">
        <span>AUTHORIZED PERSONNEL ONLY</span>
      </div>

      <p className="auth-switch">
        New to RescueTrack? <Link to="/signup">Create an account</Link>
      </p>
    </Shell>
  );
}

export function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('Emergency Services');
  const [role, setRole] = useState('Responder');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await api.signup({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        department,
        role,
      });

      window.alert(
        'Account registration submitted. Please sign in if your account has been authorized.',
      );
      navigate('/login');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create your account. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Shell img={signupImage}>
      <div className="auth-heading">
        <span className="auth-eyebrow">JOIN THE RESPONSE TEAM</span>
        <h1>Create your account</h1>
        <p>Register your details for authorized emergency-response access.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <Field
          label="Full name"
          icon={<UserRound size={18} />}
          value={name}
          onChange={setName}
          placeholder="Enter your full name"
          autoComplete="name"
        />

        <Field
          label="Email address"
          icon={<Mail size={18} />}
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="name@organization.com"
          autoComplete="email"
        />

        <Field
          label="Phone number"
          icon={<Phone size={18} />}
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="Enter your phone number"
          autoComplete="tel"
        />

        <div className="auth-form-grid">
          <label className="auth-field">
            <span className="auth-label">Department</span>
            <span className="auth-input-wrap">
              <span className="auth-input-icon">
                <Building2 size={18} />
              </span>
              <select
                className="auth-input auth-select"
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
              >
                <option>Emergency Services</option>
                <option>Medical Services</option>
                <option>Police Department</option>
                <option>Fire Department</option>
                <option>Administration</option>
              </select>
            </span>
          </label>

          <label className="auth-field">
            <span className="auth-label">Account role</span>
            <span className="auth-input-wrap">
              <select
                className="auth-input auth-select auth-select-no-icon"
                value={role}
                onChange={(event) => setRole(event.target.value)}
              >
                <option value="Responder">Responder</option>
                <option value="Admin">Administrator</option>
              </select>
            </span>
          </label>
        </div>

        <Field
          label="Password"
          icon={<LockKeyhole size={18} />}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={setPassword}
          placeholder="At least 8 characters"
          minLength={8}
          autoComplete="new-password"
          right={
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <Field
          label="Confirm password"
          icon={<LockKeyhole size={18} />}
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter your password"
          minLength={8}
          autoComplete="new-password"
        />

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? (
            <>
              <LoaderCircle className="auth-spinner" size={19} />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>

        <p className="auth-note">
          Registration does not automatically grant administrator privileges.
          Access should be approved by your system administrator.
        </p>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </Shell>
  );
}
