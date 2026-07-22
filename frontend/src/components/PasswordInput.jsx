function PasswordInput({
  id,
  name,
  value,
  onChange,
  isVisible,
  onToggleVisibility,
}) {
  return (
    <div className="password-input-wrapper">
      <input
        id={id}
        type={isVisible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
      />
      <button
        className="password-toggle"
        type="button"
        onClick={onToggleVisibility}
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        <svg
          aria-hidden="true"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

export default PasswordInput;
