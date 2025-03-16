import React, { startTransition } from 'react';
import { createBrowserRouter, RouterProvider, createRoutesFromElements, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Menu from './pages/Menu';
import Orders from './pages/Orders';
import Bills from './pages/Bills';
import Reports from './pages/Reports';

const Layout = () => (
  <div className="min-h-screen bg-gray-100">
    <Navbar />
    <main className="container mx-auto px-4 py-8">
      <Outlet />
    </main>
  </div>
);

const routes = createRoutesFromElements(
  <Route element={<Layout />}>
    <Route path="/" element={<Menu />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/bills" element={<Bills />} />
    <Route path="/reports" element={<Reports />} />
  </Route>
);

const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return (
    <React.StrictMode>
      <RouterProvider 
        router={router}
        future={{
          v7_startTransition: true
        }}
      />
    </React.StrictMode>
  );
}

export default App;
