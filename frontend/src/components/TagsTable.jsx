import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Select, MenuItem, Button, IconButton } from '@mui/material';
import axios from 'axios';
import Header from './Header';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const TagsTable = () => {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    axios.get('http://localhost:3000/tags')
      .then(res => setTags(res.data))
      .catch(err => console.error('Error:', err));
  }, []);

  const handleDelete = (tagId) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      axios.delete(`http://localhost:3000/tags/${tagId}`)
        .then(() => {
          setTags(tags.filter(tag => tag._id !== tagId));
        })
        .catch(err => console.error('Error deleting tag:', err));
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.tagName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTags.length / itemsPerPage);
  const paginatedTags = filteredTags.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Header
        title="Tag Management"
        path="/tags/create"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder="Search tags..."
      />

      <div className="max-w-6xl mx-auto">
        {/* Home Button */}
        <div className="mb-4">
          <Button
            component={Link}
            to="/"
            variant="outlined"
            startIcon={<HomeIcon />}
            className="bg-white hover:bg-gray-50 text-gray-700 border-gray-300"
          >
            Home
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-left font-semibold uppercase tracking-wider">Tag Name</th>
                  <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedTags.length > 0 ? (
                  paginatedTags.map((tag, index) => (
                    <tr key={tag._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                          {tag.tagName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <IconButton
                          component={Link}
                          to={`/tags/view/${tag._id}`}
                          className="text-blue-500 hover:bg-blue-50"
                          size="small"
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          component={Link}
                          to={`/tags/edit/${tag._id}`}
                          className="text-green-500 hover:bg-green-50"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(tag._id)}
                          className="text-red-500 hover:bg-red-50"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-lg">No tags found</span>
                        {searchQuery && (
                          <span className="text-sm mt-1">Try adjusting your search query</span>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                size="small"
                variant="outlined"
                sx={{
                  minWidth: 80,
                  '& .MuiSelect-select': {
                    py: 1
                  }
                }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <IconButton
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                size="small"
                className={currentPage === 1 ? 'opacity-50' : 'hover:bg-gray-100'}
              >
                <FirstPageIcon />
              </IconButton>
              <IconButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                size="small"
                className={currentPage === 1 ? 'opacity-50' : 'hover:bg-gray-100'}
              >
                <PrevIcon />
              </IconButton>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? 'contained' : 'text'}
                    size="small"
                    onClick={() => handlePageChange(i + 1)}
                    sx={{
                      minWidth: 32,
                      height: 32,
                      ...(currentPage === i + 1 && {
                        backgroundColor: 'rgb(59, 130, 246)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgb(37, 99, 235)'
                        }
                      })
                    }}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>

              <IconButton
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                size="small"
                className={currentPage === totalPages ? 'opacity-50' : 'hover:bg-gray-100'}
              >
                <NextIcon />
              </IconButton>
              <IconButton
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                size="small"
                className={currentPage === totalPages ? 'opacity-50' : 'hover:bg-gray-100'}
              >
                <LastPageIcon />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagsTable;