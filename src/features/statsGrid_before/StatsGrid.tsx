export default function StatsGrid() {
  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 unknown-shimmer">Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow text-center unknown-hover-lift">
          <div className="text-4xl font-bold text-blue-600">12.5K</div>
          <div className="text-gray-600 mt-2">Users</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-4xl font-bold text-green-600 unknown-counter">350</div>
          <div className="text-gray-600 mt-2">Projects</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-4xl font-bold text-purple-600">98%</div>
          <div className="text-gray-600 mt-2 unknown-small-caps">Success Rate</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center unknown-glow-border">
          <div className="text-4xl font-bold text-orange-600">24/7</div>
          <div className="text-gray-600 mt-2">Support</div>
        </div>
      </div>
    </div>
  );
}