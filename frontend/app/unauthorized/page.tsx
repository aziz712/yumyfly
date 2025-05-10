// app/unauthorized/page.tsx
export default function Unauthorized() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-md shadow-md">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          Unauthorized Access
        </h1>
        <p className="text-gray-600">
          You don't have permission to access this area.
        </p>
        <a href="/" className="mt-4 inline-block text-blue-500 hover:underline">
          Return to Home
        </a>
      </div>
    </div>
  );
}
