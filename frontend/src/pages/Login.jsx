import { useState } from "react";
import { Link } from "react-router-dom";
import PasswordInput from "../components/PasswordInput";
import "./Auth.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    }

    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-heading">
        <header className="auth-header">
          <h1 id="login-heading">Login</h1>
          <p>Welcome back. Sign in to continue exploring Bayti.</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="auth-error">{errors.email}</p>}
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Password</label>
            <PasswordInput
              id="login-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isVisible={isPasswordVisible}
              onToggleVisibility={() =>
                setIsPasswordVisible(!isPasswordVisible)
              }
            />
            {errors.password && (
              <p className="auth-error">{errors.password}</p>
            )}
          </div>

          <button className="auth-button" type="submit">
            Login
          </button>
        </form>

        <p className="auth-switch">
          Do not have an account? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
