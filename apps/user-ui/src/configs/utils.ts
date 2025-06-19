export const startResendTimer = () => {
  const interval = setInterval(() => {
    setTimer((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        setCanResend(true);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
};
