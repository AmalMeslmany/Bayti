import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./CallOwnerButton.css";

function isMobileDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

function copyWithFallback(value) {
  const input = document.createElement("textarea");
  input.value = value;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  const didCopy = document.execCommand("copy");
  document.body.removeChild(input);
  return didCopy;
}

function CallOwnerButton({ phoneNumber, className = "", label, compact = false }) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  async function handleCopyNumber() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(phoneNumber);
      } else if (!copyWithFallback(phoneNumber)) {
        throw new Error("Copy failed");
      }

      setCopyMessage(t("callModal.copied"));
    } catch {
      setCopyMessage(t("callModal.copyFailed"));
    }
  }

  function handleCallClick() {
    setCopyMessage("");

    if (isMobileDevice()) {
      window.location.href = `tel:${phoneNumber}`;
      return;
    }

    setIsModalOpen(true);
  }

  if (!phoneNumber) {
    return null;
  }

  return (
    <>
      <button
        className={className}
        type="button"
        onClick={handleCallClick}
        aria-label={label || t("details.callOwner")}
      >
        {compact ? (
          <>
            <span aria-hidden="true">📞</span>
            {t("properties.call")}
          </>
        ) : (
          label || t("details.callOwner")
        )}
      </button>

      {isModalOpen && (
        <div className="call-modal-backdrop" role="presentation">
          <section
            className="call-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="call-modal-title"
          >
            <h2 id="call-modal-title">{t("callModal.title")}</h2>
            <p>{t("callModal.text")}</p>
            <strong dir="ltr">{phoneNumber}</strong>
            {copyMessage && <p className="call-modal-status">{copyMessage}</p>}
            <div className="call-modal-actions">
              <button type="button" onClick={handleCopyNumber}>
                {t("callModal.copy")}
              </button>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                {t("callModal.close")}
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

export default CallOwnerButton;
