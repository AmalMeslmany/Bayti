import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProperty,
  fetchPropertyById,
  updateProperty,
} from "../api/properties";
import { useAuth } from "../context/useAuth";
import "./AddProperty.css";

const maxImageSize = 10 * 1024 * 1024;
const maxImageCount = 5;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

const initialFormData = {
  title: "",
  location: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  phoneNumber: "",
  description: "",
};

function AddProperty({ mode = "create" }) {
  const { t } = useTranslation();
  const isEditMode = mode === "edit";
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [selectedImages, setSelectedImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImagePaths, setRemovedImagePaths] = useState([]);
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProperty, setIsLoadingProperty] = useState(isEditMode);
  const fileInputRef = useRef(null);
  const selectedImagesRef = useRef([]);

  const totalImageCount = existingImages.length + selectedImages.length;

  useEffect(() => {
    let isActive = true;

    async function loadProperty() {
      if (!isEditMode) {
        return;
      }

      try {
        const property = await fetchPropertyById(id);
        const ownerId = property.owner?._id || property.owner?.id;
        const isOwner = ownerId === user.id;

        if (!isOwner) {
          setBackendError(t("validation.unauthorizedEdit"));
          return;
        }

        if (isActive) {
          setFormData({
            title: property.title || "",
            location: property.location || "",
            price: String(property.priceValue ?? ""),
            bedrooms: String(property.bedrooms ?? ""),
            bathrooms: String(property.bathrooms ?? ""),
            area: String(property.area ?? ""),
            phoneNumber: property.phoneNumber || "",
            description: property.description || "",
          });
          setExistingImages(property.images || []);
        }
      } catch (error) {
        if (isActive) {
          setBackendError(error.message);
        }
      } finally {
        if (isActive) {
          setIsLoadingProperty(false);
        }
      }
    }

    loadProperty();

    return () => {
      isActive = false;
    };
  }, [id, isEditMode, t, user.id]);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) =>
        URL.revokeObjectURL(image.previewUrl),
      );
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
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    const nextErrors = {};

    if (totalImageCount + files.length > maxImageCount) {
      nextErrors.propertyImage = t("validation.maxImages");
    }

    const invalidTypeFile = files.find(
      (file) => !allowedImageTypes.includes(file.type),
    );

    if (invalidTypeFile) {
      nextErrors.propertyImage = t("validation.imageTypes");
    }

    const oversizedFile = files.find((file) => file.size > maxImageSize);

    if (oversizedFile) {
      nextErrors.propertyImage = t("validation.imageSize");
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors({
        ...errors,
        ...nextErrors,
      });
      return;
    }

    setSelectedImages([
      ...selectedImages,
      ...files.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
      })),
    ]);
    setErrors({
      ...errors,
      propertyImage: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeSelectedImage(indexToRemove) {
    const imageToRemove = selectedImages[indexToRemove];
    URL.revokeObjectURL(imageToRemove.previewUrl);
    setSelectedImages(
      selectedImages.filter((image, index) => index !== indexToRemove),
    );
  }

  function removeExistingImage(imageToRemove) {
    setExistingImages(
      existingImages.filter((image) => image.path !== imageToRemove.path),
    );

    if (imageToRemove.path) {
      setRemovedImagePaths([...removedImagePaths, imageToRemove.path]);
    }
  }

  function validateForm() {
    const nextErrors = {};

    Object.entries(formData).forEach(([fieldName, value]) => {
      if (!value.trim()) {
        nextErrors[fieldName] = t("validation.required");
      }
    });

    if (totalImageCount === 0) {
      nextErrors.propertyImage = t("validation.imageRequired");
    }

    if (totalImageCount > maxImageCount) {
      nextErrors.propertyImage = t("validation.maxImages");
    }

    const normalizedPhoneNumber = formData.phoneNumber.replace(/[\s\-()]/g, "");

    if (!normalizedPhoneNumber) {
      nextErrors.phoneNumber = t("validation.phoneRequired");
    } else if (!normalizedPhoneNumber.startsWith("+")) {
      nextErrors.phoneNumber = t("validation.phoneCountryCode");
    } else if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhoneNumber)) {
      nextErrors.phoneNumber = t("validation.invalidPhone");
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

    setBackendError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const propertyFormData = new FormData();

      propertyFormData.append("title", formData.title.trim());
      propertyFormData.append("description", formData.description.trim());
      propertyFormData.append("price", Number(formData.price));
      propertyFormData.append("location", formData.location.trim());
      propertyFormData.append("bedrooms", Number(formData.bedrooms));
      propertyFormData.append("bathrooms", Number(formData.bathrooms));
      propertyFormData.append("area", Number(formData.area));
      propertyFormData.append("phoneNumber", formData.phoneNumber.trim());

      selectedImages.forEach((image) => {
        propertyFormData.append("images", image.file);
      });

      if (isEditMode) {
        propertyFormData.append(
          "removeImagePaths",
          JSON.stringify(removedImagePaths),
        );
        await updateProperty(id, propertyFormData, token);
      } else {
        await createProperty(propertyFormData, token);
      }

      setSuccessMessage(
        isEditMode
          ? t("addProperty.updateSuccess")
          : t("addProperty.createSuccess"),
      );
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      setBackendError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="add-property-page">
      {isLoadingProperty && (
        <p className="add-property-status">{t("addProperty.loading")}</p>
      )}
      <section className="add-property-card" aria-labelledby="add-property-title">
        <header className="add-property-header">
          <p className="add-property-eyebrow">
            {isEditMode
              ? t("addProperty.editListing")
              : t("addProperty.newListing")}
          </p>
          <h1 id="add-property-title">
            {isEditMode ? t("addProperty.editTitle") : t("addProperty.addTitle")}
          </h1>
          <p>
            {t("addProperty.subtitle")}
          </p>
        </header>

        <form className="add-property-form" onSubmit={handleSubmit} noValidate>
          <div className="add-property-field add-property-field-wide">
            <label htmlFor="property-title">{t("addProperty.propertyTitle")}</label>
            <input
              id="property-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <p className="add-property-error">{errors.title}</p>}
          </div>

          <div className="add-property-field add-property-field-wide">
            <label htmlFor="property-location">{t("addProperty.location")}</label>
            <input
              id="property-location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
            {errors.location && (
              <p className="add-property-error">{errors.location}</p>
            )}
          </div>

          <div className="add-property-field">
            <label htmlFor="property-price">{t("addProperty.price")}</label>
            <input
              id="property-price"
              type="number"
              min="0"
              name="price"
              value={formData.price}
              onChange={handleChange}
            />
            {errors.price && <p className="add-property-error">{errors.price}</p>}
          </div>

          <div className="add-property-field">
            <label htmlFor="property-bedrooms">{t("addProperty.bedrooms")}</label>
            <input
              id="property-bedrooms"
              type="number"
              min="0"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
            />
            {errors.bedrooms && (
              <p className="add-property-error">{errors.bedrooms}</p>
            )}
          </div>

          <div className="add-property-field">
            <label htmlFor="property-bathrooms">{t("addProperty.bathrooms")}</label>
            <input
              id="property-bathrooms"
              type="number"
              min="0"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
            />
            {errors.bathrooms && (
              <p className="add-property-error">{errors.bathrooms}</p>
            )}
          </div>

          <div className="add-property-field">
            <label htmlFor="property-area">{t("addProperty.area")}</label>
            <input
              id="property-area"
              type="number"
              min="0"
              name="area"
              value={formData.area}
              onChange={handleChange}
            />
            {errors.area && <p className="add-property-error">{errors.area}</p>}
          </div>

          <div className="add-property-field add-property-field-wide">
            <label htmlFor="property-description">{t("addProperty.description")}</label>
            <textarea
              id="property-description"
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && (
              <p className="add-property-error">{errors.description}</p>
            )}
          </div>

          <div className="add-property-field add-property-field-wide">
            <label htmlFor="property-phone">{t("addProperty.phoneNumber")}</label>
            <input
              id="property-phone"
              type="tel"
              name="phoneNumber"
              placeholder={t("addProperty.phonePlaceholder")}
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <p className="add-property-error">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="add-property-field add-property-field-wide">
            <label htmlFor="property-image">{t("addProperty.images")}</label>
            <p className="selected-file-name">
              {t("addProperty.imageCounter", { count: totalImageCount })}
            </p>

            {existingImages.length > 0 && (
              <div className="image-preview-grid">
                {existingImages.map((image) => (
                  <div className="image-preview" key={image.path || image.url}>
                    <img src={image.url} alt={t("addProperty.currentImage")} />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image)}
                    >
                      {t("addProperty.remove")}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input
              id="property-image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />

            {selectedImages.length > 0 && (
              <div className="image-preview-grid">
                {selectedImages.map((image, index) => (
                  <div className="image-preview" key={image.previewUrl}>
                    <img
                      src={image.previewUrl}
                      alt={t("addProperty.selectedImage")}
                    />
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                    >
                      {t("addProperty.remove")}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.propertyImage && (
              <p className="add-property-error">{errors.propertyImage}</p>
            )}
          </div>

          <button className="add-property-button" type="submit">
            {isSubmitting
              ? isEditMode
                ? t("addProperty.saving")
                : t("addProperty.publishing")
              : isEditMode
                ? t("addProperty.save")
                : t("addProperty.publish")}
          </button>
        </form>

        {successMessage && (
          <p className="add-property-success">{successMessage}</p>
        )}
        {backendError && <p className="add-property-error">{backendError}</p>}
      </section>
    </main>
  );
}

export default AddProperty;

