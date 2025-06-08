import React from "react";
import { IoIosSearch, IoMdAdd } from "react-icons/io";
import { Link } from "react-router";

const Header = ({ searchQuery, setSearchQuery, title, path, placeholder = "search" }) => {
  const handleSearch = (e) => {
    const searchTerm = e.target.value;
    setSearchQuery(searchTerm);
  };

  return (
    <div className="upper mb-4 flex gap-3 items-center justify-between">
      <div className="relative search w-full shadow-md bg-white text-md rounded-lg">
        <input
          className="w-full outline-none p-3 px-6 rounded-lg active:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition duration-200 ease-in-out"
          type="search"
          placeholder={placeholder}
          onChange={handleSearch}
          value={searchQuery}
        />
        {!searchQuery && (
          <IoIosSearch className="w-7 h-7 absolute right-2 top-3 text-gray-400" />
        )}
      </div>
      
      <Link
        to={path}
        className="flex items-center gap-2 px-5 py-3 whitespace-nowrap font-semibold tracking-tight rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:scale-105 hover:shadow-lg transition-all duration-300"
      >
        <IoMdAdd className="text-lg" />
        Add {title}
      </Link>
    </div>
  );
};

export default Header;
