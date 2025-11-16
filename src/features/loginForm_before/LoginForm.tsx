export default function LoginForm() {
  return (
    <div className="flex items-center justify-center bg-gray-100 p-8 unknown-backdrop-blur">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Login</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 unknown-input-glow"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
          <button className="w-full bg-blue-500 text-white py-3 rounded font-semibold hover:bg-blue-600 unknown-pulse">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}