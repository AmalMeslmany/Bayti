import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import PasswordInput from "../components/PasswordInput";
import "./Auth.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({
    password: false,
    confirmPassword: false,
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    return nextErrors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const [firstName, ...lastNameParts] = formData.fullName.trim().split(/\s+/);

    setBackendError("");
    setIsSubmitting(true);

    try {
      await registerUser({
        firstName,
        lastName: lastNameParts.join(" ") || firstName,
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate("/login");
    } catch (error) {
      setBackendError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function togglePasswordVisibility(fieldName) {
    setVisiblePasswords({
      ...visiblePasswords,
      [fieldName]: !visiblePasswords[fieldName],
    });
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="register-heading">
        <header className="auth-header">
          <h1 id="register-heading">Register</h1>
          <p>Create your Bayti account to save and manage properties.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="register-full-name">Full Name</label>
            <input
              id="register-full-name"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <p className="auth-error">{errors.fullName}</p>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          <div className="auth-field">
            <label htmlFor="register-password">Password</label>
            <PasswordInput
              id="register-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isVisible={visiblePasswords.password}
              onToggleVisibility={() => togglePasswordVisibility("password")}
            />
            {errors.password && (
              <p className="auth-error">{errors.password}</p>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm-password">Confirm Password</label>
            <PasswordInput
              id="register-confirm-password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              isVisible={visiblePasswords.confirmPassword}
              onToggleVisibility={() =>
                togglePasswordVisibility("confirmPassword")
              }
            />
            {errors.confirmPassword && (
              <p className="auth-error">{errors.confirmPassword}</p>
            )}
          </div>

          <button className="auth-button" type="submit">
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        {backendError && <p className="auth-error">{backendError}</p>}

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
