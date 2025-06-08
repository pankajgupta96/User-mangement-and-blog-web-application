import { createBrowserRouter, RouterProvider } from "react-router";
import { LocalizationProvider } from "@mui/x-date-pickers";
// If you are using date-fns v3.x or v4.x, please import `AdapterDateFns`
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import UserForm from "./components/UserForm.jsx";
import BlogTable from "./components/BlogTable";
import BlogForm from "./components/BlogForm";
import UserTable from "./components/UserTable";
import CategoriesTable from "./components/CategoriesTable";
import TagsTable from "./components/TagsTable";
import TagForm from "./components/TagForm";
import CategoriesForm from "./components/CategoriesForm";

let router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/users",  
    element: <UserTable />,
  },
  {
    path: "/users/create",
    element: <UserForm mode="create" />,
  },
  {
    path: "/users/view/:userId",
    element: <UserForm mode="view" />,
  },
  {
    path: "/users/edit/:userId",
    element: <UserForm mode="edit" />,
  },
  {
    path: "/blogs",
    element: <BlogTable />,
  },
  {
    path: "/blogs/create",
    element: <BlogForm />,
  },
  {
    path: "/blogs/edit/:blogId",
    element: <BlogForm mode="edit" />,
  },
  {
    path: "/blogs/view/:blogId",
    element: <BlogForm mode="view" />,
  },
  
  {
    path:"/tags",
    element: <TagsTable />,
  },
  {
    path:"/tags/create",
    element : <TagForm />
  },
  {
    path: "/tags/view/:tagId",
    element: <TagForm mode="view" />,
  },
  {
    path: "/tags/edit/:tagId",
    element: <TagForm mode="edit" />,
  },
  {
    path: "/categories",
    element: <CategoriesTable />,
  },
  {
    path:"/category/create",
    element:<CategoriesForm  />
  },
  {
    path: "/category/view/:categoryId",
    element: <CategoriesForm mode="view" />,
  },
  {
    path: "/category/edit/:categoryId",
    element: <CategoriesForm mode="edit" />,
  },
  
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <RouterProvider router={router} />
    </LocalizationProvider>
  </StrictMode>
);
