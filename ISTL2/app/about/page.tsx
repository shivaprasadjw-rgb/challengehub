export const metadata = {
  title: "About & Rules",
  description: "Tournament rules, formats, and general information.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Sports India Events
          </h1>
          <p className="text-xl text-gray-600">
            A modern tournament management platform for sports communities across India
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Our Mission
              </h2>
              <p className="text-gray-600 mb-6">
                To provide a comprehensive, user-friendly platform that empowers sports organizers 
                to create, manage, and track tournaments efficiently while providing players with 
                seamless registration and real-time tournament progression updates.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Key Features
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Complete tournament lifecycle management</li>
                <li>• Real-time tournament progression tracking</li>
                <li>• Multi-sport support (Badminton, Tennis, etc.)</li>
                <li>• Integrated venue management</li>
                <li>• Automated registration and capacity management</li>
                <li>• Mobile-responsive design</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Technology Stack
              </h2>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Frontend</h4>
                  <p className="text-gray-600">Next.js 14, TypeScript, Tailwind CSS</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Backend</h4>
                  <p className="text-gray-600">Next.js API Routes, Prisma ORM</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Database</h4>
                  <p className="text-gray-600">PostgreSQL</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Authentication</h4>
                  <p className="text-gray-600">NextAuth.js</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Deployment</h4>
                  <p className="text-gray-600">Vercel</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Production Ready</h4>
                <p className="text-blue-700 text-sm">
                  This application is production-ready and optimized for deployment on Vercel 
                  with a repository size under 25MB.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact & Support
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">GitHub</h4>
                <p className="text-gray-600">
                  <a href="https://github.com/your-username/sports-india-events" 
                     className="text-blue-600 hover:text-blue-800">
                    View Source Code
                  </a>
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Documentation</h4>
                <p className="text-gray-600">
                  <a href="/DEPLOYMENT.md" className="text-blue-600 hover:text-blue-800">
                    Deployment Guide
                  </a>
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Support</h4>
                <p className="text-gray-600">
                  support@sportsindiaevents.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
