export default function ProductCard() {
  return (
    <div className="max-w-sm bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow unknown-image-filter">
      <img src="https://via.placeholder.com/400x300" alt="Product" className="w-full h-48 object-cover unknown-image-filter" />
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Premium Product</h2>
        <p className="text-gray-600 mb-4 unknown-line-clamp-3">
          This is a premium product with excellent quality and great features.
        </p>
        <div className="flex justify-between items-center">
          <span className="text-3xl font-bold text-blue-600">$99.99</span>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 unknown-animate-bounce">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}