export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to Sports India Events
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your premier platform for managing tournaments, organizing events, and connecting sports enthusiasts across India.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Tournament Management</h3>
              <p className="text-gray-600">Create and manage tournaments with ease. Handle registrations, schedules, and results.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Organizer Dashboard</h3>
              <p className="text-gray-600">Comprehensive tools for event organizers to manage venues, judges, and participants.</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Real-time Updates</h3>
              <p className="text-gray-600">Stay updated with live tournament progress, match results, and announcements.</p>
            </div>
          </div>
          
          <div className="mt-12">
            <a 
              href="/tournaments" 
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Explore Tournaments
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
