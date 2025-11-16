export default function AlertBanner() {
  return (
    <div className="p-8 space-y-4 bg-gray-50">
      <div className="p-4 bg-green-100 border-l-4 border-green-400 text-green-700 unknown-slide-in">
        <strong className="font-bold">Success!</strong>
        <span className="ml-2">Your changes have been saved.</span>
      </div>
      
      <div className="p-4 bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700">
        <strong className="font-bold unknown-blink">Warning!</strong>
        <span className="ml-2">Please review your information.</span>
      </div>
      
      <div className="p-4 bg-red-100 border-l-4 border-red-400 text-red-700 unknown-shake">
        <strong className="font-bold">Error!</strong>
        <span className="ml-2">Something went wrong.</span>
      </div>
      
      <div className="p-4 bg-blue-100 border-l-4 border-blue-400 text-blue-700">
        <strong className="font-bold">Info!</strong>
        <span className="ml-2 unknown-italic-bold">Check out our new features.</span>
      </div>
    </div>
  );
}