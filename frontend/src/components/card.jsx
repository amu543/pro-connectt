import React from 'react';

const Card = ({ title, description, imageUrl }) => (
  <div className="bg-white shadow-lg rounded-lg overflow-hidden transform transition-transform hover:scale-105">
    <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
    <div className="p-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

export default Card;
