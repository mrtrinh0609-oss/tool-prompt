import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="p-4 sm:p-6 text-center border-b border-gray-700/50">
      <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-500">
        Tạo Kịch bản & Prompt cho Veo
      </h1>
      <p className="mt-2 text-md text-gray-400">
        Phát triển bởi Gemini - Tạo kịch bản và prompt có cấu trúc cho AI video.
      </p>
    </header>
  );
};

export default Header;