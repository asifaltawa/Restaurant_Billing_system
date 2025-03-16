import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <NavLink to="/" className="text-xl font-bold text-gray-800">
            Restaurant Billing
          </NavLink>
          <div className="flex space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md ${
                  isActive ? 'bg-gray-100 text-gray-900' : ''
                }`
              }
            >
              Menu
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md ${
                  isActive ? 'bg-gray-100 text-gray-900' : ''
                }`
              }
            >
              Orders
            </NavLink>
            <NavLink
              to="/bills"
              className={({ isActive }) =>
                `text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md ${
                  isActive ? 'bg-gray-100 text-gray-900' : ''
                }`
              }
            >
              Bills
            </NavLink>
            <NavLink
              to="/reports"
              className={({ isActive }) =>
                `text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md ${
                  isActive ? 'bg-gray-100 text-gray-900' : ''
                }`
              }
            >
              Reports
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 