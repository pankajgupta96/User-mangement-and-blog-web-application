import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  TextField,
  Button,
  Grid,
  Container,
  Typography,
  Avatar,
  CircularProgress,
  FormHelperText,
  IconButton,
  Paper,
  Box
} from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import ArrowBack from "@mui/icons-material/ArrowBack";
import axios from "axios";
import { useEffect, useState } from "react";

// Validation Schema (unchanged from original)
const schema = yup.object().shape({
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  maidenName: yup.string().required("Maiden Name is required"),
  age: yup.number().positive().integer().required("Age is required"),
  gender: yup.string().required("Gender is required"),
  email: yup.string().email().required("Email is required"),
  phone: yup.string().required("Phone is required"),
  username: yup.string().required("Username is required"),
  password: yup.string().min(6).required("Password is required"),
  birthDate: yup.string().required("Birth Date is required"),
  bloodGroup: yup.string().required("Blood Group is required"),
  height: yup.number().positive().required("Height is required"),
  weight: yup.number().positive().required("Weight is required"),
  eyeColor: yup.string().required("Eye Color is required"),
  hair: yup.object().shape({
    color: yup.string().required("Hair Color is required"),
    type: yup.string().required("Hair Type is required"),
  }),
  domain: yup.string().required("Domain is required"),
  ip: yup.string().required("IP Address is required"),
  macAddress: yup.string().required("MAC Address is required"),
  university: yup.string().required("University is required"),
  address: yup.object().shape({
    address: yup.string().required("Address is required"),
    city: yup.string().required("City is required"),
    state: yup.string().required("State is required"),
    postalCode: yup.string().required("Postal Code is required"),
    coordinates: yup.object().shape({
      lat: yup.number().required("Latitude is required"),
      lng: yup.number().required("Longitude is required"),
    }),
  }),
  bank: yup.object().shape({
    cardExpire: yup.string().required("Card Expiry Date is required"),
    cardNumber: yup.string().required("Card Number is required"),
    cardType: yup.string().required("Card Type is required"),
    currency: yup.string().required("Currency is required"),
    iban: yup.string().required("IBAN is required"),
  }),
  company: yup.object().shape({
    department: yup.string().required("Department is required"),
    name: yup.string().required("Company Name is required"),
    title: yup.string().required("Job Title is required"),
    address: yup.object().shape({
      address: yup.string().required("Company Address is required"),
      city: yup.string().required("Company City is required"),
      state: yup.string().required("Company State is required"),
      postalCode: yup.string().required("Company Postal Code is required"),
      coordinates: yup.object().shape({
        lat: yup.number().required("Company Latitude is required"),
        lng: yup.number().required("Company Longitude is required"),
      }),
    }),
  }),
  ein: yup.string().required("EIN is required"),
  ssn: yup.string().required("SSN is required"),
  userAgent: yup.string().required("User Agent is required"),
  crypto: yup.object().shape({
    coin: yup.string().required("Crypto Coin is required"),
    wallet: yup.string().required("Crypto Wallet is required"),
    network: yup.string().required("Crypto Network is required"),
  }),
  role: yup.string().required("Role is required"),
});

export default function UserForm({ mode = "create" }) {
  const { userId } = useParams();
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      hair: { color: "", type: "" },
      address: {
        address: "",
        city: "",
        state: "",
        postalCode: "",
        coordinates: { lat: 0, lng: 0 },
      },
      bank: {
        cardExpire: "",
        cardNumber: "",
        cardType: "",
        currency: "",
        iban: "",
      },
      company: {
        department: "",
        name: "",
        title: "",
        address: {
          address: "",
          city: "",
          state: "",
          postalCode: "",
          coordinates: { lat: 0, lng: 0 },
        },
      },
      crypto: { coin: "", wallet: "", network: "" },
    },
  });

  const getNestedError = (name) => {
    return name.split(".").reduce((obj, key) => obj?.[key], errors)?.message;
  };

  useEffect(() => {
    if (mode !== "create") {
      const fetchUser = async () => {
        setIsLoading(true);
        try {
          const res = await axios.get(`http://localhost:3000/user/${userId}`);
          reset(res.data);
          if (res.data.image) setExistingImage(res.data.image);
        } catch (err) {
          console.error("Failed to fetch user:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    }
  }, [userId, mode, reset]);

  const onSubmit = async (data) => {
    if (mode === "view") return;
  
    try {
      const formData = new FormData();
      if (image) formData.append("image", image);
      formData.append("data", JSON.stringify(data));
  
      if (mode === "create") {
        await axios.post("http://localhost:3000/create", formData);
        alert("User created successfully!");
        navigate("/users"); 
        await axios.put(`http://localhost:3000/user/${userId}`, formData);
        alert("User updated successfully!");
      }
    } catch (err) {
      console.error("Operation failed:", err);
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const inputs = [
    { label: "First Name", name: "firstName", type: "text" },
    { label: "Last Name", name: "lastName", type: "text" },
    { label: "Maiden Name", name: "maidenName", type: "text" },
    { label: "Age", name: "age", type: "number" },
    { label: "Gender", name: "gender", type: "text" },
    { label: "Email", name: "email", type: "email" },
    { label: "Phone", name: "phone", type: "text" },
    { label: "Username", name: "username", type: "text" },
    { label: "Password", name: "password", type: "password", disabled: mode === "edit" },
    { label: "Birth Date", name: "birthDate", type: "date", InputLabelProps: { shrink: true } },
    { label: "Blood Group", name: "bloodGroup", type: "text" },
    { label: "Height", name: "height", type: "number" },
    { label: "Weight", name: "weight", type: "number" },
    { label: "Eye Color", name: "eyeColor", type: "text" },
    { label: "Hair Color", name: "hair.color", type: "text" },
    { label: "Hair Type", name: "hair.type", type: "text" },
    { label: "Domain", name: "domain", type: "text" },
    { label: "IP", name: "ip", type: "text" },
    { label: "MAC Address", name: "macAddress", type: "text" },
    { label: "University", name: "university", type: "text" },
    { label: "SSN", name: "ssn", type: "text" },
    { label: "EIN", name: "ein", type: "text" },
    { label: "User Agent", name: "userAgent", type: "text" },
    { label: "Role", name: "role", type: "text" },
    // Address fields
    { label: "Address", name: "address.address", type: "text" },
    { label: "City", name: "address.city", type: "text" },
    { label: "State", name: "address.state", type: "text" },
    { label: "Postal Code", name: "address.postalCode", type: "text" },
    { label: "Latitude", name: "address.coordinates.lat", type: "number" },
    { label: "Longitude", name: "address.coordinates.lng", type: "number" },
    // Bank fields
    { label: "Bank Card Expire", name: "bank.cardExpire", type: "text" },
    { label: "Bank Card Number", name: "bank.cardNumber", type: "text" },
    { label: "Bank Card Type", name: "bank.cardType", type: "text" },
    { label: "Bank Currency", name: "bank.currency", type: "text" },
    { label: "Bank IBAN", name: "bank.iban", type: "text" },
    // Company fields
    { label: "Company Name", name: "company.name", type: "text" },
    { label: "Company Department", name: "company.department", type: "text" },
    { label: "Company Title", name: "company.title", type: "text" },
    { label: "Company Address", name: "company.address.address", type: "text" },
    { label: "Company City", name: "company.address.city", type: "text" },
    { label: "Company State", name: "company.address.state", type: "text" },
    { label: "Company Postal Code", name: "company.address.postalCode", type: "text" },
    { label: "Company Latitude", name: "company.address.coordinates.lat", type: "number" },
    { label: "Company Longitude", name: "company.address.coordinates.lng", type: "number" },
    // Crypto fields
    { label: "Crypto Coin", name: "crypto.coin", type: "text" },
    { label: "Crypto Wallet", name: "crypto.wallet", type: "text" },
    { label: "Crypto Network", name: "crypto.network", type: "text" },
  ];

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          background: 'linear-gradient(to right, #ebf4ff, #c3dafe)'
        }}
      >
        <Box textAlign="center">
          <CircularProgress size={60} />
          <Typography variant="h6" mt={2}>
            {mode === "view" ? "Loading user details..." : 
             mode === "edit" ? "Loading user data for editing..." : 
             "Preparing registration form..."}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{
        minHeight: '100vh',
        py: 4,
        background: 'linear-gradient(to right, #ebf4ff, #c3dafe)'
      }}
    >
      <IconButton
        component={Link}
        to={mode === "create" ? "/" : "/users"}
        sx={{
          position: 'fixed',
          left: 40,
          top: 40,
          backgroundColor: 'primary.main',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark'
          }
        }}
      >
        <ArrowBack />
      </IconButton>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          align="center"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 4
          }}
        >
          {mode === "view" ? "User Details" :
           mode === "edit" ? "Edit User" : "User Registration"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3} sx={{ maxHeight: '75vh', overflow: 'auto', p: 2 }}>
            <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={image ? URL.createObjectURL(image) : existingImage}
                sx={{
                  width: 150,
                  height: 150,
                  mb: 2,
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}
              />
              {mode !== "view" && (
                <Button
                  variant="contained"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleChange}
                  />
                </Button>
              )}
            </Grid>

            {inputs.map((field) => (
              <Grid item xs={12} sm={6} key={field.name}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label={field.label}
                  type={field.type}
                  disabled={mode === "view" || field.disabled}
                  error={!!getNestedError(field.name)}
                  helperText={getNestedError(field.name)}
                  {...register(field.name)}
                  InputLabelProps={field.InputLabelProps || {}}
                  InputProps={{
                    readOnly: mode === "view",
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1,
                      backgroundColor: mode === "view" ? 'action.disabledBackground' : 'background.paper'
                    }
                  }}
                />
              </Grid>
            ))}

            <Grid item xs={12} sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
              {mode !== "view" && (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    px: 6,
                    py: 1.5,
                    borderRadius: 1,
                    fontSize: '1rem'
                  }}
                >
                  {mode === "edit" ? "Update User" : "Register User"}
                </Button>
              )}
              <Button
                component={Link}
                to={mode === "create" ? "/" : "/users"}
                variant="outlined"
                size="large"
                sx={{
                  px: 6,
                  py: 1.5,
                  borderRadius: 1,
                  fontSize: '1rem'
                }}
              >
                {mode === "view" ? "Back to List" : "Cancel"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}


