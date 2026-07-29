import { useState } from "react";
import { useTranslation } from "react-i18next";
import { sendContactMessage } from "../api/contact";
import "./Contact.css";

const initialFormData = {
  name: "",
  email: "",
  message: "",
};

function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isSending, setIsSending] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
    setStatusMessage("");
    setStatusType("");
  }

  function validateForm() {
    const nextErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      nextErrors.name = t("validation.required");
    }

    if (!formData.email.trim()) {
      nextErrors.email = t("validation.emailRequired");
    } else if (!emailPattern.test(formData.email.trim())) {
      nextErrors.email = t("validation.invalidEmail");
    }

    if (!formData.message.trim()) {
      nextErrors.message = t("validation.required");
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatusMessage("");
    setStatusType("");

    if (!validateForm()) {
      return;
    }

    setIsSending(true);

    try {
      await sendContactMessage({
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
      });
      setFormData(initialFormData);
      setStatusType("success");
      setStatusMessage(t("contact.sendSuccess"));
    } catch (error) {
      setStatusType("error");
      setStatusMessage(error.message || t("contact.sendFailure"));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="contact-page">
      <section className="contact-header">
        <h1>{t("contact.title")}</h1>
        <p>{t("contact.subtitle")}</p>
      </section>

      <section className="contact-layout">
        <aside className="contact-info">
          <h2>{t("contact.infoTitle")}</h2>
          <p>
            <strong>{t("contact.ownerNameLabel")}</strong>
            {t("contact.ownerName")}
          </p>
          <p>
            <strong>{t("contact.roleLabel")}</strong>
            {t("contact.role")}
          </p>
          <p>
            <strong>{t("contact.emailLabel")}</strong>
            <a href={`mailto:${t("contact.emailAddress")}`}>
              {t("contact.emailAddress")}
            </a>
          </p>
          <p>
            <strong>{t("contact.officeLabel")}</strong>
            {t("contact.officeLocation")}
          </p>
          <p className="contact-credit">{t("contact.developerCredit")}</p>
        </aside>

        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="contact-field">
            <label htmlFor="contact-name">{t("contact.name")}</label>
            <input
              id="contact-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={updateField}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
            />
            {errors.name ? (
              <p className="contact-error" id="contact-name-error">
                {errors.name}
              </p>
            ) : null}
          </div>
          <div className="contact-field">
            <label htmlFor="contact-email">{t("contact.formEmail")}</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={updateField}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
            />
            {errors.email ? (
              <p className="contact-error" id="contact-email-error">
                {errors.email}
              </p>
            ) : null}
          </div>
          <div className="contact-field">
            <label htmlFor="contact-message">{t("contact.message")}</label>
            <textarea
              id="contact-message"
              name="message"
              rows="6"
              value={formData.message}
              onChange={updateField}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={
                errors.message ? "contact-message-error" : undefined
              }
            />
            {errors.message ? (
              <p className="contact-error" id="contact-message-error">
                {errors.message}
              </p>
            ) : null}
          </div>
          {statusMessage ? (
            <p className={`contact-status contact-status-${statusType}`}>
              {statusMessage}
            </p>
          ) : null}
          <button className="contact-button" type="submit" disabled={isSending}>
            {isSending ? t("contact.sending") : t("contact.send")}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Contact;
