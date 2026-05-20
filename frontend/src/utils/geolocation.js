export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: parseFloat(position.coords.latitude.toFixed(4)),
          lng: parseFloat(position.coords.longitude.toFixed(4)),
        });
      },
      (error) => {
        reject(error);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
};
