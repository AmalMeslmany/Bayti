import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProperty } from "../api/properties";
import { useAuth } from "../context/useAuth";
import "./AddProperty.css";

const maxImageSize = 5 * 1024 * 1024;

const initialFormData = {
  title: "",
  location: "",
  price: "",
  bedrooms: "",
  bathrooms: "",
  area: "",
  description: "",
};

function AddProperty() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [propertyImage, setPropertyImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function handleImageChange(event) {
    const selectedFile = event.target.files[0];

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl("");
    }

    if (!selectedFile) {
      setPropertyImage(null);
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setPropertyImage(null);
      setErrors({
        ...errors,
        propertyImage: "Please select a valid image file.",
      });
      return;
    }

    if (selectedFile.size > maxImageSize) {
      setPropertyImage(null);
      setErrors({
        ...errors,
        propertyImage: "Image size must be 5 MB or less.",
      });
      return;
    }

    setPropertyImage(selectedFile);
    setImagePreviewUrl(URL.createObjectURL(selectedFile));
    setErrors({
      ...errors,
      propertyImage: "",
    });
  }

  function removeSelectedImage() {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setPropertyImage(null);
    setImagePreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function validateForm() {
    const nextErrors = {};

    Object.entries(formData).forEach(([fieldName, value]) => {
      if (!value.trim()) {
        nextErrors[fieldName] = "This field is required.";
      }
    });

    if (!propertyImage) {
      nextErrors.propertyImage = "Property image is required.";
    }

    return nextErrors;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Unable to read image file."));
      reader.readAsDataURL(file);
    });
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
      const image = await readFileAsDataUrl(propertyImage);

      await createProperty(
        {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          location: formData.location.trim(),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          area: Number(formData.area),
          image,
        },
        token,
      );

      setSuccessMessage("Property created successfully.");
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
      <section className="add-property-card" aria-labelledby="add-property-title">
        <header className="add-property-header">
          <p className="add-property-eyebrow">New Listing</p>
          <h1 id="add-property-title">Add Property</h1>
          <p>
            Create a clean property draft with the key details buyers need to
            understand the listing.
          </p>
        </header>

        <form className="add-property-form" onSubmit={handleSubmit} noValidate>
          <div className="add-property-field add-property-field-wide">
            <label htmlFor="property-title">Property Title</label>
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
            <label htmlFor="property-location">Location</label>
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
            <label htmlFor="property-price">Price</label>
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
            <label htmlFor="property-bedrooms">Bedrooms</label>
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
            <label htmlFor="property-bathrooms">Bathrooms</label>
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
            <label htmlFor="property-area">Area (m²)</label>
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
            <label htmlFor="property-description">Description</label>
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
            <label htmlFor="property-image">Property Image</label>
            <input
              id="property-image"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {propertyImage && (
              <p className="selected-file-name">
                Selected image: {propertyImage.name}
              </p>
            )}
            {imagePreviewUrl && (
              <div className="image-preview">
                <img src={imagePreviewUrl} alt="Selected property preview" />
                <button type="button" onClick={removeSelectedImage}>
                  Remove Image
                </button>
              </div>
            )}
            {errors.propertyImage && (
              <p className="add-property-error">{errors.propertyImage}</p>
            )}
          </div>

          <button className="add-property-button" type="submit">
            {isSubmitting ? "Publishing..." : "Publish Property"}
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
