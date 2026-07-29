import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { updateProfile } from "../api/auth";
import { useAuth } from "../context/useAuth";
import "./Profile.css";

const maxProfileImageSize = 10 * 1024 * 1024;
const allowedProfileImageTypes = ["image/jpeg", "image/png", "image/webp"];

function EditProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token, updateCurrentUser, user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(user.profileImage || "");
  const [shouldRemovePhoto, setShouldRemovePhoto] = useState(false);
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previewObjectUrlRef = useRef("");

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const nextErrors = { ...errors };
    delete nextErrors.profileImage;

    if (!allowedProfileImageTypes.includes(file.type)) {
      nextErrors.profileImage = t("profile.invalidImageType");
      setErrors(nextErrors);
      event.target.value = "";
      return;
    }

    if (file.size > maxProfileImageSize) {
      nextErrors.profileImage = t("profile.imageTooLarge");
      setErrors(nextErrors);
      event.target.value = "";
      return;
    }

    setErrors(nextErrors);
    setBackendError("");
    setSelectedImage(file);
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }
    previewObjectUrlRef.current = URL.createObjectURL(file);
    setPreviewImage(previewObjectUrlRef.current);
    setShouldRemovePhoto(false);
  }

  function handleRemovePhoto() {
    setSelectedImage(null);
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = "";
    }
    setPreviewImage("");
    setShouldRemovePhoto(true);
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors.profileImage;
      return nextErrors;
    });
  }

  function validateForm() {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = t("validation.fullNameRequired");
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
      const profileFormData = new FormData();
      profileFormData.append("firstName", firstName);
      profileFormData.append("lastName", lastNameParts.join(" ") || firstName);
      profileFormData.append(
        "removeProfileImage",
        shouldRemovePhoto ? "true" : "false",
      );

      if (selectedImage) {
        profileFormData.append("profileImage", selectedImage);
      }

      const data = await updateProfile(profileFormData, token);

      updateCurrentUser(data.user);
      navigate("/profile", {
        replace: true,
        state: { message: t("profile.updateSuccess") },
      });
    } catch (error) {
      setBackendError(error.message || t("profile.updateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="profile-page">
      <section className="profile-card" aria-labelledby="edit-profile-heading">
        <header className="profile-edit-header">
          <h1 id="edit-profile-heading">{t("profile.editTitle")}</h1>
          <p>{t("profile.editSubtitle")}</p>
        </header>

        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <div className="profile-field">
            <label htmlFor="profile-full-name">{t("profile.fullName")}</label>
            <input
              id="profile-full-name"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <p className="profile-error">{errors.fullName}</p>
            )}
          </div>

          <div className="profile-field">
            <label htmlFor="profile-email">{t("profile.email")}</label>
            <input
              id="profile-email"
              name="email"
              type="email"
              value={formData.email}
              disabled
              readOnly
            />
          </div>

          <div className="profile-field">
            <label htmlFor="profile-image">{t("profile.uploadProfilePicture")}</label>
            {previewImage ? (
              <img
                className="profile-image-preview"
                src={previewImage}
                alt={t("profile.imagePreview")}
              />
            ) : (
              <div className="profile-image-preview profile-image-preview-empty">
                {user.firstName?.charAt(0).toUpperCase() || "B"}
              </div>
            )}
            <input
              id="profile-image"
              name="profileImageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSubmitting}
            />
            <span className="profile-file-hint">
              {previewImage ? t("profile.changePhoto") : t("profile.chooseImage")}
            </span>
            {errors.profileImage && (
              <p className="profile-error">{errors.profileImage}</p>
            )}
            <button
              className="profile-button"
              type="button"
              onClick={handleRemovePhoto}
              disabled={isSubmitting || (!previewImage && !user.profileImage)}
            >
              {t("profile.removePhoto")}
            </button>
          </div>

          {backendError && <p className="profile-error">{backendError}</p>}

          <div className="profile-actions">
            <button className="profile-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("profile.uploading") : t("profile.saveChanges")}
            </button>
            <Link className="profile-button" to="/profile">
              {t("profile.cancel")}
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default EditProfile;
