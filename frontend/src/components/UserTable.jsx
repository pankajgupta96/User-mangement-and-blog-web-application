import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Button, Avatar } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Header from "./Header";
import HomeIcon from "@mui/icons-material/Home";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
  { id: "profile", numeric: false, disablePadding: true, label: "Profile" },
  { id: "phone", numeric: false, disablePadding: false, label: "Phone" },
  {
    id: "gender",
    numeric: false,
    disablePadding: false,
    label: "Gender (M/F/O)",
  },
  { id: "blogs", numeric: true, disablePadding: false, label: "Blogs" },
  {
    id: "personalDetails",
    numeric: false,
    disablePadding: false,
    label: "Personal Details",
  },
  { id: "edu", numeric: false, disablePadding: false, label: "Edu" },
];

function UserTableHead(props) {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              "aria-label": "select all desserts",
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

UserTableHead.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

function UserTableToolbar({ numSelected, selected, onDelete }) {
  const selectedUserId = selected.length > 0 ? selected[0] : null;

  const handleDelete = async () => {
    if (!selectedUserId) return;

    const confirm = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:3000/user/${selectedUserId}`);
      onDelete(selectedUserId);
      alert("User deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete user");
    }
  };
  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: "1 1 100%" }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          User Table
        </Typography>
      )}
      {numSelected > 0 && (
        <div className="flex gap-2">
          <Link to={`/users/view/${selectedUserId}`}>
            <Button variant="contained" color="info">
              View
            </Button>
          </Link>
          <Link to={`/users/edit/${selectedUserId}`}>
            <Button variant="contained">Edit</Button>
          </Link>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </Toolbar>
  );
}
UserTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

export default function UserTable() {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [selected, setSelected] = React.useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [timeFrame, setTimeFrame] = useState("hour");
  const [chartData, setChartData] = useState([]);
  const [selectedBar, setSelectedBar] = useState(null);
  const [analytics, setAnalytics] = useState([]);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:3000/");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
     try {
      const response = await axios.get("http://localhost:3000/users/analytics", {
        params: { timeframe: timeFrame }
      });

      // डीबगिंग के लिए लॉग जोड़ें
      console.log("Analytics raw data:", response.data);

  //     const processedData = response.data.map(item => {
      
  //       const hour = item._id.hour;
  //       const date = new Date(item.start);
        
  //       let name;
  //       switch(timeFrame) {
  //         case "hour":
  // name = date.toLocaleTimeString('en-US', { 
  //   hour: 'numeric',
  //   hour12: true,
  //   timeZone: 'Asia/Kolkata' 
  // });
  // break;
  //         case "day":
  //           name = date.getDate().toString();
  //           break;
  //         case "month":
  //           name = date.toLocaleString('default', { month: 'short' });
  //           break;
  //       }

  //       return {
  //         name,
  //         count: item.count,
  //         start: new Date(item.start),
  //         end: new Date(item.end)
  //       };
  //     });

  //       // Fill empty periods
  //       let fullData = [];
  //       if (timeFrame === "hour") {
  //         for (let i = 0; i < 24; i++) {
  //           const hour = i % 12 || 12;
  //           const ampm = i < 12 ? "AM" : "PM";
  //           const existing = processedData.find(d => d.name === `${hour}${ampm}`);
  //           fullData.push(existing || {
  //             name: `${hour}${ampm}`,
  //             count: 0,
  //             start: new Date(new Date().setHours(i, 0, 0, 0)),
  //             end: new Date(new Date().setHours(i + 1, 0, 0, 0))
  //           });
  //         }
  //       } 
  // 
  // 
  // 


               const processedData = response.data.map(item => {
  const date = new Date(item.start);
  let name;
  
  switch(timeFrame) {
    case "hour":
      // Format in 12-hour format with AM/PM
      name = date.toLocaleTimeString('en-US', { 
        hour: 'numeric',
        hour12: true,
        timeZone: 'Asia/Kolkata'
      });
      break;
    case "day":
      name = date.getDate().toString();
      break;
    case "month":
      name = date.toLocaleString('default', { month: 'short' });
      break;
  }

  return {
    name,
    count: item.count,
    start: new Date(item.start),
    end: new Date(item.end)
  };
});

// Replace your empty periods filling logic with:
let fullData = [];
if (timeFrame === "hour") {
  // Generate all 24 hours with proper timezone
  for (let i = 0; i < 24; i++) {
    const hourDate = new Date();
    hourDate.setHours(i, 0, 0, 0);
    
    const hourName = hourDate.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });

    // Find matching data point
    const existing = processedData.find(d => {
      const dHour = new Date(d.start).getHours();
      return dHour === i;
    });

    fullData.push(existing || {
      name: hourName,
      count: 0,
      start: new Date(hourDate),
      end: new Date(hourDate.getTime() + 60*60*1000)
    });
  }
}   
              else if (timeFrame === "day") {
          const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
          for (let i = 1; i <= daysInMonth; i++) {
            const existing = processedData.find(d => d.name === `${i}`);
            fullData.push(existing || {
              name: `${i}`,
              count: 0,
              start: new Date(new Date().getFullYear(), new Date().getMonth(), i),
              end: new Date(new Date().getFullYear(), new Date().getMonth(), i + 1)
            });
          }
        } else if (timeFrame === "month") {
          for (let i = 0; i < 12; i++) {
            const monthName = new Date(0, i).toLocaleString('default', { month: 'short' });
            const existing = processedData.find(d => d.name === monthName);
            fullData.push(existing || {
              name: monthName,
              count: 0,
              start: new Date(new Date().getFullYear(), i, 1),
              end: new Date(new Date().getFullYear(), i + 1, 1)
            });
          }
        }

        setChartData(fullData);
      } catch (error) {
      console.error("Failed to fetch analytics:", error);
      // उपयोगकर्ता को त्रुटि दिखाएं
      alert("Failed to load analytics: " + error.message);
    }
    };

    fetchAnalytics();
  }, [timeFrame]);

  // Handle bar click
//   const handleBarClick = async (data) => {
//   if (!data || !data.activePayload || !data.activePayload[0]) return;

//   const payload = data.activePayload[0].payload;
//   setSelectedBar(payload.name);

//   try {
//     const response = await axios.get("http://localhost:3000/users/filter", {
//       params: {
//         start: new Date(payload.start).toISOString(),
//         end: new Date(payload.end).toISOString()
//       }
//     });

//     setFilteredUsers(response.data);
//     setPage(0);
//   } catch (error) {
//     console.error("Error filtering users:", error);
//   }
// };


// const handleBarClick = (barData) => {
//  const start = barData?.start;
//   const endIndex = analytics.findIndex(a => a.start === start) + 1;
//   const end = analytics[endIndex]?.start || new Date().toISOString();
//   if (!start) {
//     console.error("Invalid start value");
//     return;
//   }

//   const startISO = new Date(start).toISOString();
//   const endISO = new Date(end).toISOString(); // only if end is valid

//  fetch(`http://localhost:3000/users/filter?start=${startISO}&end=${endISO}`)
//     .then((res) => res.json())
//     .then((data) => {
//       setFilteredUsers(data);
//     })
//     .catch((err) => {
//       console.error("Error filtering users:", err);
//     });
// };



// const handleBarClick = (barData) => {
//   if (!barData?.activePayload?.[0]?.payload) {
//     console.error("Invalid bar data");
//     return;
//   }

//   const payload = barData.activePayload[0].payload;
//   const start = new Date(payload.start);
//   const end = new Date(payload.end || start);

//   // Handle month/day ranges differently
//   if (payload.timeframe === 'month') {
//     end.setMonth(end.getMonth() + 1);
//   } else if (payload.timeframe === 'day') {
//     end.setDate(end.getDate() + 1);
//   } else {
//     // For hours, we already have correct end time
//     end.setHours(end.getHours() + 1);
//   }

//   const startISO = start.toISOString();
//   const endISO = end.toISOString();

//   console.log("Filtering between:", startISO, "and", endISO);

//   fetch(`http://localhost:3000/users/filter?start=${startISO}&end=${endISO}`)
//     .then((res) => res.json())
//     .then((data) => {
//       console.log("Filtered users:", data.length);
//       setFilteredUsers(data);
//     })
//     .catch((err) => {
//       console.error("Error filtering users:", err);
//     });
// };




// const handleBarClick = (barData) => {
//   if (!barData?.activePayload?.[0]?.payload) {
//     console.error("Invalid bar data");
//     return;
//   }

//   const payload = barData.activePayload[0].payload;
  
//   // Debug: Log the payload to see what we're working with
//   console.log("Payload received:", payload);

//   // Validate start date
//   if (!payload.start) {
//     console.error("Missing start date in payload");
//     return;
//   }

//   const start = new Date(payload.start);
//   if (isNaN(start.getTime())) {
//     console.error("Invalid start date:", payload.start);
//     return;
//   }

//   // Handle end date - provide a default if missing
//   let end;
//   if (payload.end) {
//     end = new Date(payload.end);
//     if (isNaN(end.getTime())) {
//       console.error("Invalid end date:", payload.end);
//       return;
//     }
//   } else {
//     // If no end date provided, create one based on timeframe
//     end = new Date(start);
    
//     if (payload.timeframe === 'month') {
//       end.setMonth(end.getMonth() + 1);
//     } else if (payload.timeframe === 'day') {
//       end.setDate(end.getDate() + 1);
//     } else {
//       // Default to 1 hour if no timeframe specified
//       end.setHours(end.getHours() + 1);
//     }
//   }

//   // Now safely convert to ISO strings
//   const startISO = start.toISOString();
//   const endISO = end.toISOString();

//   console.log("Filtering between:", startISO, "and", endISO);

//   fetch(`http://localhost:3000/users/filter?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`)
//     .then((res) => {
//       if (!res.ok) {
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }
//       return res.json();
//     })
//     .then((data) => {
//       console.log("Filtered users:", data.length);
//       setFilteredUsers(data);
//     })
//     .catch((err) => {
//       console.error("Error filtering users:", err);
//       // Optionally show error to user
//     });
// };


// const handleBarClick = (barData) => {
//   if (!barData?.activePayload?.[0]?.payload) {
//     console.error("Invalid bar data");
//     return;
//   }

//   const payload = barData.activePayload[0].payload;
//   console.log("Payload received:", payload);

//   // Validate start date
//   if (!payload.start) {
//     console.error("Missing start date in payload");
//     return;
//   }

//   const start = new Date(payload.start);
//   if (isNaN(start.getTime())) {
//     console.error("Invalid start date:", payload.start);
//     return;
//   }

//   // Handle end date - completely ignore if it's invalid
//   let end;
//   if (payload.end && payload.end.toString() !== "Invalid Date") {
//     end = new Date(payload.end);
//     if (isNaN(end.getTime())) {
//       console.log("Invalid end date provided, calculating default end date");
//       end = null;
//     }
//   }

//   // If no valid end date, calculate based on timeframe
//   if (!end) {
//     end = new Date(start);
    
//     // Check if payload has timeframe, otherwise default to 1 hour
//     if (payload.timeframe === 'month') {
//       end.setMonth(end.getMonth() + 1);
//     } else if (payload.timeframe === 'day') {
//       end.setDate(end.getDate() + 1);
//     } else {
//       // Default to 1 hour if no timeframe specified
//       end.setHours(end.getHours() + 1);
//     }
//   }

//   // Now safely convert to ISO strings
//   const startISO = start.toISOString();
//   const endISO = end.toISOString();

//   console.log("Filtering between:", startISO, "and", endISO);

//   fetch(`http://localhost:3000/users/filter?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`)
//     .then((res) => res.json())
//     .then((data) => {
//       console.log("Filtered users:", data.length);
//       setFilteredUsers(data);
//     })
//     .catch((err) => {
//       console.error("Error filtering users:", err);
//     });
// };

// const handleBarClick = (barData) => {
//   if (!barData?.activePayload?.[0]?.payload) {
//     console.error("Invalid bar data");
//     return;
//   }

//   const payload = barData.activePayload[0].payload;
//   console.log("Payload received:", payload);

//   if (!payload.start) {
//     console.error("Missing start date in payload");
//     return;
//   }

//   let start = new Date(payload.start);
//   if (isNaN(start.getTime())) {
//     console.error("Invalid start date:", payload.start);
//     return;
//   }

//   let end;
//   if (payload.end && payload.end.toString() !== "Invalid Date") {
//     end = new Date(payload.end);
//     if (isNaN(end.getTime())) {
//       console.log("Invalid end date provided, calculating default end date");
//       end = null;
//     }
//   }

//   if (!end) {
//     end = new Date(start);
//     if (payload.timeframe === 'month') {
//       end.setMonth(end.getMonth() + 1);
//     } else if (payload.timeframe === 'day') {
//       end.setDate(end.getDate() + 1);
//     } else {
//       end.setHours(end.getHours() + 1);
//     }
//   }

//   // ✅ Convert start and end to IST before sending
//   const toIST = (date) => new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
//   const startISO = toIST(start).toISOString();
//   const endISO = toIST(end).toISOString();

//   console.log("Filtering between:", startISO, "and", endISO);

//   fetch(`http://localhost:3000/users/filter?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`)
//     .then((res) => res.json())
//     .then((data) => {
//       console.log("Filtered users:", data.length);
//       setFilteredUsers(data);
//     })
//     .catch((err) => {
//       console.error("Error filtering users:", err);
//     });
// };


// const handleBarClick = (barData) => {
//   if (!barData?.activePayload?.[0]?.payload) {
//     console.error("Invalid bar data");
//     return;
//   }

//   const payload = barData.activePayload[0].payload;
//   console.log("Payload received:", payload);

//   // Validate and parse start date
//   const start = new Date(payload.start);
//   if (isNaN(start.getTime())) {
//     console.error("Invalid start date:", payload.start);
//     return;
//   }

//   // Validate and parse end date or calculate it
//   let end = null;
//   if (payload.end && payload.end.toString() !== "Invalid Date") {
//     const tempEnd = new Date(payload.end);
//     if (!isNaN(tempEnd.getTime())) {
//       end = tempEnd;
//     }
//   }

//   if (!end) {
//     end = new Date(start);
//     if (payload.timeframe === 'month') {
//       end.setMonth(end.getMonth() + 1);
//     } else if (payload.timeframe === 'day') {
//       end.setDate(end.getDate() + 1);
//     } else {
//       end.setHours(end.getHours() + 1);
//     }
//   }

//   const startISO = start.toISOString();
//   const endISO = end.toISOString();

//   console.log("Filtering between:", startISO, "and", endISO);

//   fetch(`http://localhost:3000/users/filter?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`)
//     .then((res) => res.json())
//     .then((data) => {
//       console.log("Raw filtered users from backend:", data);

//       // Double-check on frontend using timestamp (just in case of timezone mismatches)
//       const startTime = new Date(start).getTime();
//       const endTime = new Date(end).getTime();

//       const filteredUsers = data.filter((user) => {
//         const createdAt = new Date(user.createdAt).getTime();
//         return createdAt >= startTime && createdAt < endTime;
//       });

//       console.log("Filtered users (final after timestamp check):", filteredUsers.length);
//       setFilteredUsers(filteredUsers);
//     })
//     .catch((err) => {
//       console.error("Error filtering users:", err);
//     });
// };


const handleBarClick = (barData) => {
  const payload = barData?.activePayload?.[0]?.payload;
  if (!payload) return;

  const start = new Date(payload.start);
  let end = payload.end ? new Date(payload.end) : new Date(start);

  if (payload.timeframe === 'month') {
    end.setMonth(end.getMonth() + 1);
  } else if (payload.timeframe === 'day') {
    end.setDate(end.getDate() + 1);
  } else {
    end.setHours(end.getHours() + 1);
  }

  const startISO = start.toISOString();
  const endISO = end.toISOString();

  console.log("Filtering between:", startISO, "and", endISO);

  fetch(`http://localhost:3000/users/filter?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("Filtered users from backend:", data);
      setFilteredUsers(data); // ✅ No more filtering here!
    })
    .catch((err) => {
      console.error("Error fetching filtered users:", err);
    });
};





  // Reset filter
  const resetFilter = async () => {
    try {
      const response = await axios.get("http://localhost:3000/");
      setUsers(response.data);
      setFilteredUsers([]);
      setSelectedBar(null);
    } catch (error) {
      console.error("Error resetting filter:", error);
    }
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "N/A";
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const rows = (filteredUsers.length > 0 ? filteredUsers : users).map((user) => ({
    id: user._id,
    profile: {
      avatar:
        user.image ||
        "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      email: user.email || "N/A",
    },
    phone: user.phone || "N/A",
    gender: user.gender || "N/A",
    blogs: user.blogs?.length || 0,
    personalDetails: `DOB: ${formatDate(user.birthDate)}\nAge: ${
      user.age || "N/A"
    }\nAddress:\n${user.address?.address || "N/A"}, ${user.address?.city || "N/A"}`,
    edu: `University: ${user.university || "N/A"}`,
  }));

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    if (selected.length === 1 && selected[0] === id) {
      setSelected([]);
    } else {
      setSelected([id]);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;
  const filteredRows = rows.filter((row) =>
    row.profile.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleRows = React.useMemo(
    () =>
      [...filteredRows]
        .sort(getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [order, orderBy, page, rowsPerPage, filteredRows]
  );

  return (
    <div className="p-10">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title="User"
        path="/users/create"
        placeholder="Search Users..."
      />
      
      <div className="mb-4">
        <Button
          component={Link}
          to="/"
          variant="outlined"
          startIcon={<HomeIcon />}
          sx={{
            backgroundColor: 'white',
            color: 'text.primary',
            borderColor: 'grey.300',
            '&:hover': {
              backgroundColor: 'grey.50',
              borderColor: 'grey.400',
            },
            textTransform: 'none',
            fontWeight: 'normal',
          }}
        >
          Home
        </Button>
      </div>

      {/* Registration Analytics Chart */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">User Registration Analytics</Typography>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Group By</InputLabel>
            <Select
              value={timeFrame}
              label="Group By"
              onChange={(e) => {
                setTimeFrame(e.target.value);
                resetFilter();
              }}
            >
              <MenuItem value="hour">Hour</MenuItem>
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="month">Month</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              onClick={handleBarClick}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="count" 
                fill="#8884d8"
                fillOpacity={selectedBar ? 0.6 : 1}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {selectedBar && (
          <Box sx={{ mt: 2, textAlign: 'right' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Showing users registered in: <b>{selectedBar}</b>
              {timeFrame === "hour" && " (Today)"}
              {timeFrame === "day" && ` (${new Date().toLocaleString('default', { month: 'long' })})`}
              {timeFrame === "month" && ` (${new Date().getFullYear()})`}
            </Typography>
            <Button 
              variant="outlined" 
              size="small"
              onClick={resetFilter}
            >
              Show All Users
            </Button>
          </Box>
        )}
      </Paper>
      
      <Box sx={{ width: "100%" }}>
        <Paper sx={{ width: "100%", mb: 2 }}>
          <UserTableToolbar 
            numSelected={selected.length} 
            selected={selected} 
            onDelete={(id) => {
              setUsers(users.filter(user => user._id !== id));
              setFilteredUsers(filteredUsers.filter(user => user._id !== id));
            }} 
          />
          <TableContainer>
            <Table
              sx={{ minWidth: 750 }}
              aria-labelledby="tableTitle"
              size={"medium"}
            >
              <UserTableHead
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
              />
              <TableBody>
                {visibleRows.map((row, index) => {
                  const isItemSelected = selected.includes(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <img
                            src={row.profile.avatar}
                            alt={row.profile.name}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                            }}
                          />
                          <Box>
                            <Typography variant="body1">
                              {row.profile.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              {row.profile.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="left">{row.phone}</TableCell>
                      <TableCell align="left">{row.gender}</TableCell>
                      <TableCell align="right" sx={{ pr: 4 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          {row.blogs}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            width: "20vw",
                          }}
                        >
                          {row.personalDetails.split("\n").map((line, i) => (
                            <Typography key={i} variant="body2">
                              {line}
                            </Typography>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="left">{row.edu}</TableCell>
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={7} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Box>
    </div>
  );
}