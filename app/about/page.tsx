export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">About Sports India Events</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              Sports India Events is dedicated to revolutionizing the way tournaments are organized and managed across India. 
              We provide a comprehensive platform that connects organizers, participants, and sports enthusiasts in one unified ecosystem.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Features</h2>
            <ul className="text-gray-600 space-y-2">
              <li>• Tournament creation and management</li>
              <li>• Participant registration and management</li>
              <li>• Venue and judge assignment</li>
              <li>• Real-time tournament progression</li>
              <li>• Comprehensive analytics and reporting</li>
              <li>• Multi-organizer support</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Technology Stack</h2>
            <p className="text-gray-600 leading-relaxed">
              Built with modern web technologies including Next.js, React, TypeScript, and Prisma. 
              Our platform ensures scalability, security, and an excellent user experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
