const ErrorMessage = function ({ message }) {
  return (
    <p className="error">
      <span>⛔️</span>
      {message}
    </p>
  );
};
export default ErrorMessage;
