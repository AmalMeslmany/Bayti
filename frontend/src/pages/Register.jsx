import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/auth";
import PasswordInput from "../components/PasswordInput";
import "./Auth.css";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const { t } = useTranslation();
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
      nextErrors.fullName = t("validation.fullNameRequired");
    }

    if (!formData.email.trim()) {
      nextErrors.email = t("validation.emailRequired");
    } else if (!emailPattern.test(formData.email)) {
      nextErrors.email = t("validation.invalidEmail");
    }

    if (!formData.password) {
      nextErrors.password = t("validation.passwordRequired");
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = t("validation.confirmPassword");
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = t("validation.passwordsMismatch");
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
          <h1 id="register-heading">{t("auth.registerTitle")}</h1>
          <p>{t("auth.registerSubtitle")}</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="auth-field">
            <label htmlFor="register-full-name">{t("auth.fullName")}</label>
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
            <label htmlFor="register-email">{t("auth.email")}</label>
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
            <label htmlFor="register-password">{t("auth.password")}</label>
            <PasswordInput
              id="register-password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              isVisible={visiblePasswords.password}
              onToggleVisibility={() => togglePasswordVisibility("password")}
              hideLabel={t("auth.hidePassword")}
              showLabel={t("auth.showPassword")}
            />
            {errors.password && (
              <p className="auth-error">{errors.password}</p>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm-password">
              {t("auth.confirmPassword")}
            </label>
            <PasswordInput
              id="register-confirm-password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              isVisible={visiblePasswords.confirmPassword}
              onToggleVisibility={() =>
                togglePasswordVisibility("confirmPassword")
              }
              hideLabel={t("auth.hidePassword")}
              showLabel={t("auth.showPassword")}
            />
            {errors.confirmPassword && (
              <p className="auth-error">{errors.confirmPassword}</p>
            )}
          </div>

          <button className="auth-button" type="submit">
            {isSubmitting ? t("auth.creatingAccount") : t("auth.register")}
          </button>
        </form>

        {backendError && <p className="auth-error">{backendError}</p>}

        <p className="auth-switch">
          {t("auth.haveAccount")} <Link to="/login">{t("auth.login")}</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
