import React from 'react';
import { FaStar } from 'react-icons/fa';

const Ratings = ({ rating }: { rating: number }) => {
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < rating) {
      stars.push(<FaStar key={i} className="text-yellow-500 text-lg" />);
    } else {
      stars.push(<FaStar key={i} className="text-gray-500 text-lg" />);
    }
  }

  return <div className="flex items-center">{stars}</div>;
};

export default Ratings;
