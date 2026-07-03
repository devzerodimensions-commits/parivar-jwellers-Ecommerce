import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Shared building blocks so every admin auth page has an identical card,
 * typography, spacing, inputs and buttons.
 */

// White card shell with the gold accent bar + centered title/subtitle.
export const AuthCard = ({ title, subtitle, children }) => (
  <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
    <div className="h-1.5 bg-gradient-to-r from-gold-400 via-gold-600 to-gold-400" />
    <div className="p-8">
      <h1 className="text-center font-serif text-2xl font-bold text-slate-800">{title}</h1>
      {subtitle && <p className="mt-1 text-center text-sm text-slate-500">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  </div>
);

// Labeled input with an optional leading icon and an optional inline action
// (e.g. a "Forgot password?" link beside the Password label). Password fields
// automatically get a show/hide (eye) toggle.
export const AuthField = ({ id, label, icon, action, type = 'text', ...props }) => {
  const isPassword = type === 'password';
  const [reveal, setReveal] = useState(false);
  const inputType = isPassword ? (reveal ? 'text' : 'password') : type;

  return (
    <div>
      {(label || action) && (
        <div className="mb-1 flex items-center justify-between">
          {label ? (
            <label htmlFor={id} className="block text-sm font-medium text-slate-700">
              {label}
            </label>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={inputType}
          className={`w-full rounded-lg border border-slate-300 bg-slate-50 py-2.5 ${
            icon ? 'pl-10' : 'pl-3'
          } ${isPassword ? 'pr-10' : 'pr-3'} text-sm outline-none transition-colors focus:border-gold-500 focus:bg-white focus:ring-2 focus:ring-gold-500/30`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {reveal ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
    </div>
  );
};

// Full-width gold gradient submit button.
export const AuthSubmit = ({ children, ...props }) => (
  <button
    type="submit"
    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:from-gold-600 hover:to-gold-700 disabled:opacity-60"
    {...props}
  >
    {children}
  </button>
);

// "← Back to login" link, used at the bottom of secondary auth pages.
export const AuthBackLink = ({ to = '/admin/login', children = 'Back to login' }) => (
  <p className="mt-6 text-center text-sm">
    <Link to={to} className="inline-flex items-center gap-1.5 font-medium text-gold-700 hover:underline">
      <FaArrowLeft className="text-xs" /> {children}
    </Link>
  </p>
);
