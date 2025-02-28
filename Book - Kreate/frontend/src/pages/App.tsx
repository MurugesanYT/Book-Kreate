import React from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import { SUBSCRIPTION_TIERS, FEATURES, SAMPLE_EXCERPTS } from "../utils/constants";

export default function App() {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-indigo-700">Book Kreate</span>
          </div>
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="animate-pulse h-8 w-32 bg-gray-200 rounded"></div>
            ) : user ? (
              <>
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate("/logout")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => navigate("/anonymous-login")}
                  className="px-4 py-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Quick Start
                </button>
                <button 
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 leading-tight">
                Create Beautiful Books with <span className="text-indigo-600">AI</span>
              </h1>
              <p className="text-lg text-gray-600">
                Book Kreate helps you transform your ideas into professionally crafted books. 
                From fiction to non-fiction, children's stories to poetry — generate complete books with just a few clicks.
              </p>
              <div className="flex space-x-4 pt-4">
                <button 
                  onClick={() => navigate("/signup")}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium"
                >
                  Start Creating
                </button>
                <button 
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    featuresSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
                >
                  Learn More
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-full h-full bg-indigo-200 rounded-lg transform rotate-2"></div>
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-indigo-300 rounded-lg transform -rotate-2"></div>
              <div className="relative bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="flex justify-between mb-6">
                  <div className="w-16 h-1 bg-indigo-500 rounded"></div>
                  <div className="w-8 h-1 bg-indigo-300 rounded"></div>
                </div>
                <h2 className="font-serif text-2xl font-bold mb-2">The Midnight Oracle</h2>
                <p className="text-gray-500 text-sm mb-4">Fantasy | 12 Chapters</p>
                <p className="text-gray-600 mb-4 line-clamp-4">
                  The moonlight cascaded through the stained-glass windows, painting the ancient library floor in a kaleidoscope of colors. Elara traced her fingers along the spines of forgotten tomes...
                </p>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-sm text-gray-600">Cover Page</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs">✓</div>
                  <span className="text-sm text-gray-600">Chapter Plan</span>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">...</div>
                  <span className="text-sm text-gray-600">Generating Chapter 3/12</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Craft Your Book with Powerful Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Novelsmith AI provides all the tools you need to go from idea to finished book in record time.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {FEATURES.map((feature, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Creating your book with Novelsmith AI is a straightforward process designed to bring your ideas to life.</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4">1</div>
                <h3 className="font-serif text-xl font-semibold mb-2">Enter Details</h3>
                <p className="text-gray-600">Provide your book title, type, category, and other details.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4">2</div>
                <h3 className="font-serif text-xl font-semibold mb-2">Generate Plan</h3>
                <p className="text-gray-600">AI creates a comprehensive book plan with chapters and structure.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4">3</div>
                <h3 className="font-serif text-xl font-semibold mb-2">Generate Content</h3>
                <p className="text-gray-600">Generate and edit content for each chapter using AI.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl mx-auto mb-4">4</div>
                <h3 className="font-serif text-xl font-semibold mb-2">Export Book</h3>
                <p className="text-gray-600">Export your finished book as a professionally formatted PDF.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Excerpts Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Sample Book Excerpts</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Experience the quality of AI-generated content across different book types.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {SAMPLE_EXCERPTS.map((excerpt, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-xl font-semibold mb-1">{excerpt.title}</h3>
                      <p className="text-gray-500 text-sm">{excerpt.type}</p>
                    </div>
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-sm">AI</div>
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{excerpt.excerpt}"</p>
                  <p className="text-gray-500 text-sm">By {excerpt.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Choose Your Plan</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Select the subscription that fits your needs and start creating amazing books today.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {SUBSCRIPTION_TIERS.map((tier, index) => (
                <div 
                  key={index} 
                  className={`bg-white p-6 rounded-lg border ${tier.highlighted ? 'border-indigo-500 shadow-lg transform scale-105' : 'border-gray-200'} flex flex-col`}
                >
                  <h3 className="font-serif text-xl font-semibold mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold mb-4">{tier.price}<span className="text-gray-500 text-sm font-normal ml-1">{tier.price !== 'Free' ? '/month' : ''}</span></div>
                  <ul className="mb-6 flex-grow">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start mb-3">
                        <svg className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => navigate("/signup")} 
                    className={`w-full py-3 rounded-md transition-colors ${tier.highlighted ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                  >
                    {tier.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-indigo-600">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-serif font-bold text-white mb-4">Ready to Start Your Writing Journey?</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">Join thousands of authors who are creating amazing books with Novelsmith AI.</p>
            <button 
              onClick={() => navigate("/signup")} 
              className="px-8 py-4 bg-white text-indigo-600 rounded-md hover:bg-gray-100 transition-colors font-medium text-lg"
            >
              Create Your First Book
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-serif font-bold text-white text-lg mb-4">Book Kreate</h3>
              <p className="text-gray-400">Transform your ideas into beautifully crafted books with the power of AI.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Novelsmith AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}