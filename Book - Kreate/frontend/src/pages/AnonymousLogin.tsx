import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInAnonymously } from "firebase/auth";
import { firebaseApp } from "app";

export default function AnonymousLogin() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const auth = getAuth(firebaseApp);
      await signInAnonymously(auth);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Anonymous login error:', error);
      setError(error.message || 'Failed to sign in anonymously');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-gray-900">Book Kreate - Quick Start</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Get started immediately without creating an account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              onClick={handleAnonymousLogin}
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
            >
              {isLoading ? "Loading..." : "Continue as Guest"}
            </button>
            
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <div className="px-4 text-sm text-gray-500">or</div>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Up
              </button>
            </div>
            
            <p className="mt-2 text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}