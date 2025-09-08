import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500">404</h1>
        <p className="text-xl mt-4">Oops! The page you're looking for doesn't exist.</p>
        <Link href="/" className="mt-6 inline-block text-blue-600 hover:underline">
          Go back to the homepage
        </Link>
      </div>
    </div>
  );
}
