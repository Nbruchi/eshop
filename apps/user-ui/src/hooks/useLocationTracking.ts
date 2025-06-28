'use client';

import { useEffect, useState } from 'react';

const LOCATION_STORAGE_KEY = 'userLocation';
const LOCATION_EXPIRY_DAYS = 20;

const getStoredLocation = () => {
  const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
  if (!storedLocation) return null;

  const parsedData = JSON.parse(storedLocation);
  const isExpiryTime = LOCATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  const isExpired = Date.now() - parsedData.timestamp > isExpiryTime;

  return isExpired ? null : parsedData;
};

const useLocationTracking = () => {
  const [location, setLocation] = useState<{
    country: string;
    city: string;
  } | null>(getStoredLocation());

  useEffect(() => {
    if (location) return;

    fetch('https://ip-api.co/json/')
      .then((res) => res.json())
      .then((data) => {
        const newLocation = {
          country: data?.country,
          city: data?.city,
          timestamp: Date.now(),
        };
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
        setLocation(newLocation);
      })
      .catch((err) => {
        console.log(`Error fetching location: ${err}`);
      });
  }, [location]);

  return { location };
};

export default useLocationTracking;
