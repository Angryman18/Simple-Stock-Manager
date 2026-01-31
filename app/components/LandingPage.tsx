import { Package } from "lucide-react";

export function LandingPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4'>
      <div className='text-center max-w-md w-full'>
        <div className='mb-8 flex justify-center'>
          <div className='bg-blue-600 p-4 rounded-2xl shadow-lg'>
            <Package className='w-12 h-12 text-white' />
          </div>
        </div>
        <h1 className='text-4xl font-bold text-gray-900 mb-3'>Stock Manager</h1>
        <p className='text-gray-600 mb-8 text-lg'>Manage your inventory with ease</p>
        <a
          href='/sign-in'
          className='inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg'
        >
          Sign In
        </a>
      </div>
    </div>
  );
}
