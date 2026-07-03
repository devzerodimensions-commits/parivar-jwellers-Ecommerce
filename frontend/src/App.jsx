import { Routes, Route, Navigate } from 'react-router-dom';

import StoreLayout from './components/layout/StoreLayout.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import FaviconManager from './components/FaviconManager.jsx';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards.jsx';

// Storefront pages
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import Wishlist from './pages/Wishlist.jsx';
import TrackOrder from './pages/TrackOrder.jsx';
import CmsPage from './pages/CmsPage.jsx';
import Policy from './pages/Policy.jsx';
import NotFound from './pages/NotFound.jsx';

// Auth
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

// Account
import AccountLayout from './pages/account/AccountLayout.jsx';
import Profile from './pages/account/Profile.jsx';
import Orders from './pages/account/Orders.jsx';
import OrderDetail from './pages/account/OrderDetail.jsx';
import Addresses from './pages/account/Addresses.jsx';

// Admin auth (standalone AuthLayout)
import AuthLayout from './components/auth/AuthLayout.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminForgotPassword from './pages/admin/AdminForgotPassword.jsx';
import AdminResetPassword from './pages/admin/AdminResetPassword.jsx';

// Admin
import AdminLayout from './pages/admin/AdminLayout.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import AdminProducts from './pages/admin/Products.jsx';
import ProductForm from './pages/admin/ProductForm.jsx';
import AdminCategories from './pages/admin/Categories.jsx';
import AdminBrands from './pages/admin/Brands.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminOrderDetail from './pages/admin/OrderDetail.jsx';
import AdminCustomers from './pages/admin/Customers.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminUserForm from './pages/admin/UserForm.jsx';
import AdminCoupons from './pages/admin/Coupons.jsx';
import AdminBanners from './pages/admin/Banners.jsx';
import AdminBlogs from './pages/admin/Blogs.jsx';
import BlogForm from './pages/admin/BlogForm.jsx';
import AdminReviews from './pages/admin/Reviews.jsx';
import AdminMedia from './pages/admin/Media.jsx';
import AdminEnquiries from './pages/admin/Enquiries.jsx';
import AdminSettings from './pages/admin/Settings.jsx';

const App = () => (
  <>
    <FaviconManager />
    <ScrollToTop />
    <Routes>
      {/* ---- Storefront ---- */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/category/:slug" element={<Shop />} />
        <Route path="/search" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/page/:slug" element={<CmsPage />} />
        <Route path="/policy" element={<Policy />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success/:id"
          element={
            <ProtectedRoute>
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        {/* Account */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Profile />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="addresses" element={<Addresses />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* ---- Admin authentication (shared standalone AuthLayout) ---- */}
      <Route element={<AuthLayout />}>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />
      </Route>

      {/* ---- Admin (protected, AdminLayout chrome) ---- */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/:id/edit" element={<ProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/new" element={<AdminUserForm />} />
        <Route path="users/:id/edit" element={<AdminUserForm />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="blog" element={<AdminBlogs />} />
        <Route path="blog/new" element={<BlogForm />} />
        <Route path="blog/:id/edit" element={<BlogForm />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="enquiries" element={<AdminEnquiries />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  </>
);

export default App;
