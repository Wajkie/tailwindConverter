export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Logout
        </button>
      </header>
      
      <main className="max-w-7xl mx-auto p-6 space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded shadow border border-gray-200">
            <h3 className="text-sm text-gray-500 uppercase">Total Users</h3>
            <p className="text-3xl font-bold text-gray-800">1,234</p>
          </div>
          <div className="bg-white p-6 rounded shadow border border-gray-200">
            <h3 className="text-sm text-gray-500 uppercase">Active Now</h3>
            <p className="text-3xl font-bold text-green-500">89</p>
          </div>
          <div className="bg-white p-6 rounded shadow border border-gray-200">
            <h3 className="text-sm text-gray-500 uppercase">New Today</h3>
            <p className="text-3xl font-bold text-orange-500">23</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul className="space-y-2">
            <li className="p-3 hover:bg-gray-50 rounded cursor-pointer text-gray-800">
              John joined the platform
            </li>
            <li className="p-3 hover:bg-gray-50 rounded cursor-pointer text-gray-800">
              Sarah updated her profile
            </li>
            <li className="p-3 hover:bg-gray-50 rounded cursor-pointer text-gray-800">
              Mike posted a new comment
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}