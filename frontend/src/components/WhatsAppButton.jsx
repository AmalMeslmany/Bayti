function isMobileDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
}

function getWhatsAppUrl(phoneNumber) {
  const whatsappNumber = phoneNumber.replace(/^\+/, "");

  if (isMobileDevice()) {
    return `https://wa.me/${whatsappNumber}`;
  }

  return `https://web.whatsapp.com/send?phone=${whatsappNumber}`;
}

function WhatsAppButton({ phoneNumber, className = "", children }) {
  if (!phoneNumber) {
    return null;
  }

  return (
    <a
      className={className}
      href={getWhatsAppUrl(phoneNumber)}
      rel="noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

export default WhatsAppButton;
