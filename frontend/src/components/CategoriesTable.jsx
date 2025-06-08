import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Button,
  Select,
  MenuItem,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@mui/material";
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon
} from "@mui/icons-material";
import axios from "axios";
import Header from "./Header";

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) =>
    cat.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title="Category Management"
        path="/category/create"
        placeholder="Search categories..."
      />

      <Paper className="max-w-6xl mx-auto rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
            <div className="flex space-x-2">
              <Button
                component={Link}
                to="/"
                variant="outlined"
                startIcon={<HomeIcon />}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Home
              </Button>
              <Button
                component={Link}
                to="/" // Or whatever your back route should be
                variant="outlined"
                startIcon={<span>←</span>}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back
              </Button>
            </div>
          </div>

          <TableContainer>
            <Table className="min-w-full">
              <TableHead className="bg-gradient-to-r from-blue-500 to-blue-600">
                <TableRow>
                  <TableCell className="text-white font-semibold">#</TableCell>
                  <TableCell className="text-white font-semibold">Category Name</TableCell>
                  <TableCell className="text-white font-semibold text-right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((cat, index) => (
                    <TableRow 
                      key={cat._id} 
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="text-gray-600">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
                      <TableCell className="capitalize font-medium">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {cat.categoryName}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <IconButton
                            component={Link}
                            to={`/category/view/${cat._id}`}
                            className="text-blue-500 hover:bg-blue-50"
                            size="small"
                          >
                            <ViewIcon />
                          </IconButton>
                          <IconButton
                            component={Link}
                            to={`/category/edit/${cat._id}`}
                            className="text-green-500 hover:bg-green-50"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(cat._id)}
                            className="text-red-500 hover:bg-red-50"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <span className="text-lg">No categories found</span>
                        {searchQuery && (
                          <span className="text-sm mt-1">Try adjusting your search query</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="text-sm text-gray-600 mr-2">Rows per page:</span>
              <Select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                size="small"
                className="bg-white"
                sx={{ minWidth: 80 }}
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
              </Select>
            </div>

            <div className="flex items-center space-x-1">
              <IconButton
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                size="small"
                className={currentPage === 1 ? "opacity-50" : ""}
              >
                <FirstPageIcon />
              </IconButton>
              <IconButton
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                size="small"
                className={currentPage === 1 ? "opacity-50" : ""}
              >
                <PrevIcon />
              </IconButton>

              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    variant={currentPage === i + 1 ? "contained" : "text"}
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
                className={currentPage === totalPages ? "opacity-50" : ""}
              >
                <NextIcon />
              </IconButton>
              <IconButton
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                size="small"
                className={currentPage === totalPages ? "opacity-50" : ""}
              >
                <LastPageIcon />
              </IconButton>
            </div>
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default CategoriesTable;