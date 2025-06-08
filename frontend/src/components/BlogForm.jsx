import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Paper,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { ArrowBack, PhotoCamera, Send } from "@mui/icons-material";
import { Link, useParams } from "react-router";

export default function BlogForm({ mode = "create" }) {
  const { blogId } = useParams();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm();

  const [users, setUsers] = useState([]);
  const [preview, setPreview] = useState(null);
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const isReadOnly = mode === "view";

  useEffect(() => {
    axios.get("http://localhost:3000/").then((res) => setUsers(res.data));
    axios.get("http://localhost:3000/tags").then((res) => setTags(res.data));
    axios
      .get("http://localhost:3000/categories")
      .then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    if ((mode === "edit" || mode === "view") && blogId) {
      // Fetch blog data first
      axios.get(`http://localhost:3000/blogs/${blogId}`).then((blogRes) => {
        // Then fetch all dependent data
        Promise.all([
          axios.get("http://localhost:3000/"),
          axios.get("http://localhost:3000/tags"),
          axios.get("http://localhost:3000/categories"),
        ]).then(([usersRes, tagsRes, categoriesRes]) => {
          const blogData = blogRes.data;
          const allUsers = usersRes.data;
          const allTags = tagsRes.data;
          const allCategories = categoriesRes.data;

          

          console.log("Blog Author ID:", blogData.author);
          console.log("All Users:", allUsers);

          // Find author details
          const authorUser = allUsers.find((u) => u._id === blogData.author);
          const authorName = authorUser ? 
          `${authorUser.firstName} ${authorUser.lastName}` : 'Unknown Author';

          console.log('Author Match:', {
            blogAuthorId: blogData.author,
            users: allUsers.map(u => ({ id: u._id, name: `${u.firstName} ${u.lastName}` })),
            foundAuthor: authorUser
          });


          // Map tags to tagNames
          let blogTags = [];
          try {
            // Handle both stringified array and proper array formats
            const rawTags = typeof blogData.tags === 'string' 
              ? JSON.parse(blogData.tags) 
              : blogData.tags;
            
            blogTags = rawTags.map(tag => 
              allTags.find(t => t.tagName === tag)?.tagName || tag
            );
          } catch(e) {
            blogTags = [];
          }

          // Set form values
          reset({
            title: blogData.title,
            description: blogData.description,
            author: authorName,
            category: blogData.category,
            tags: blogTags || [],
            image: blogData.image,
          });

          setPreview(blogData.image);
        });
      });
    }
  }, [mode, blogId, reset]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    const selectedUser = users.find(
      (u) => `${u.firstName} ${u.lastName}` === data.author
    );

    // Add user ID to form data
    if (selectedUser) {
      formData.append("userId", selectedUser._id);
    }
    formData.append("title", data.title);
    formData.append("author", data.author);
    formData.append("description", data.description);
    formData.append("category", data.category);
    let tagsArray = data.tags;
    if (typeof tagsArray === "string") {
      try {
        tagsArray = JSON.parse(tagsArray);
      } catch {
        tagsArray = [];
      }
    }
    formData.append("tags", JSON.stringify(tagsArray));
    if (data.image && data.image[0]) formData.append("image", data.image[0]);

    try {
      if (mode === "edit") {
        await axios.put(`http://localhost:3000/blogs/${blogId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Blog updated successfully!");
      } else {
        await axios.post("http://localhost:3000/blogs", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Blog created successfully!");
      }
      reset();
      setPreview(null);
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue("image", [file]);
      setPreview(URL.createObjectURL(file));
    }
  };

  return (
    <Paper
      sx={{
        p: 6,
        maxWidth: 800,
        mx: "auto",
        mt: 8,
        borderRadius: 4,
        boxShadow: "0px 15px 35px rgba(0,0,0,0.1)",
        background:
          "linear-gradient(to bottom right, #f9fafb 0%, #f3f4f6 100%)",
        position: "relative",
      }}
    >
      {/* Back Button */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1,
        }}
      >
        <Button
          component={Link}
          to="/blogs"
          startIcon={<ArrowBack />}
          sx={{
            textTransform: "none",
            color: "text.secondary",
            "&:hover": {
              color: "primary.main",
              bgcolor: "rgba(63,81,181,0.08)",
            },
            transition: "all 0.2s ease",
            borderRadius: 2,
            px: 2,
            py: 1,
          }}
        >
          Back to Blogs
        </Button>
      </Box>

      <Typography
        variant="h4"
        mb={5}
        fontWeight={600}
        textAlign="center"
        sx={{
          color: "text.primary",
          letterSpacing: 1,
          "&:after": {
            content: '""',
            display: "block",
            width: "60px",
            height: "4px",
            background: "#3f51b5",
            margin: "16px auto 0",
            borderRadius: 2,
          },
        }}
      >
        {mode === "edit"
          ? "Edit Blog"
          : mode === "view"
          ? "View Blog"
          : "Create New Blog"}
      </Typography>
      <Box
        component="form"
        onSubmit={!isReadOnly ? handleSubmit(onSubmit) : undefined}
        noValidate
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        {!isReadOnly && (
          <Button
            variant="contained"
            component="label"
            startIcon={<PhotoCamera />}
            sx={{
              py: 1.5,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              fontSize: 16,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: 2,
            }}
          >
            Upload Featured Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />
          </Button>
        )}
        {preview && (
          <div className="w-full flex items-center justify-center">
            <Box
              sx={{
                position: "relative",
                width: "15vw",
                height: "15vw",
                borderRadius: "100%",
                overflow: "hidden",
                boxShadow: 3,
                mt: 1,
                mb: 2,
              }}
            >
              <img
                src={preview}
                alt="Preview"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
          </div>
        )}
        {!isReadOnly && <input type="hidden" {...register("userId")} />}

        <TextField
          label="Blog Title"
          variant="outlined"
          fullWidth
          {...register("title", { required: "Title is required" })}
          error={!!errors.title}
          helperText={errors.title?.message}
          disabled={isReadOnly}
          InputLabelProps={{
            shrink: !!watch("title") || isReadOnly, // This ensures label shrinks when field has a value or in view mode
          }}
          placeholder={!isReadOnly ? "Enter the blog title" : ""}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "&.Mui-focused fieldset": {
                borderColor: "primary.main",
              },
            },
          }}
          InputProps={{
            style: { fontSize: 18 },
          }}
        />
        <TextField
          label="Blog Content"
          multiline
          rows={6}
          variant="outlined"
          {...register("description", { required: "Description is required" })}
          error={!!errors.description}
          helperText={errors.description?.message}
          disabled={isReadOnly}
          InputLabelProps={{
            shrink: !!watch("description") || isReadOnly,
          }}
          placeholder={!isReadOnly ? "Enter blog content" : ""}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "& textarea": { fontSize: 16 },
            },
          }}
        />
       
       <Controller
  name="author"
  control={control}
  rules={{ required: "Author is required" }}
  render={({ field }) => (
    <TextField
      select
      label="Select Author"
      fullWidth
      value={field.value || ""}
      onChange={field.onChange}
      error={!!errors.author}
      helperText={errors.author?.message}
      disabled={isReadOnly || mode === "edit"}
      InputLabelProps={{ shrink: true }}
    >
      {users.map((user) => (
        <MenuItem
          key={user._id}
          value={`${user.firstName} ${user.lastName}`} // Must match reset value
        >
          {user.firstName} {user.lastName}
        </MenuItem>
      ))}
    </TextField>
  )}
/>

        {/* Category - Single Select */}
        <Controller
          name="category"
          control={control}
          rules={{ required: "Category is required" }}
          render={({ field }) => (
            <TextField
              select
              label="Select Category"
              fullWidth
              value={field.value || ""}
              onChange={field.onChange}
              error={!!errors.category}
              helperText={errors.category?.message}
              disabled={isReadOnly}
              InputLabelProps={{
                shrink: true,
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat.categoryName}>
                  {cat.categoryName}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        {/* Tags - Multi Select */}
        <Controller
          name="tags"
          control={control}
          rules={{ required: "At least one tag is required" }}
          render={({ field }) => (
            <TextField
              select
              label="Select Tags"
              value={Array.isArray(field.value) ? field.value : []}
              onChange={field.onChange}
              fullWidth
              SelectProps={{ multiple: true }}
              error={!!errors.tags}
              helperText={errors.tags?.message}
              disabled={isReadOnly}
              InputLabelProps={{ shrink: true }}
            >
              {tags.map((tag) => (
                <MenuItem key={tag._id} value={tag.tagName}>
                  {tag.tagName}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        {!isReadOnly && (
          <Button
            variant="contained"
            type="submit"
            endIcon={<Send />}
            sx={{
              mt: 3,
              py: 1.5,
              fontSize: 17,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              bgcolor: mode === "edit" ? "warning.main" : "success.main",
              "&:hover": {
                bgcolor: mode === "edit" ? "warning.dark" : "success.dark",
                transform: "translateY(-2px)",
                boxShadow: 3,
              },
              transition: "all 0.2s ease",
            }}
          >
            {mode === "edit" ? "Update Blog" : "Publish Blog"}
          </Button>
        )}
        {isReadOnly && (
          <Typography
            variant="body1"
            sx={{
              mt: 3,
              fontSize: 16,
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            This is a read-only view of the blog.
          </Typography>
        )}
      </Box>
    </Paper>
  );
}


