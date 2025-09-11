export default function TournamentsPage() {
  const tournaments = [
    {
      id: 1,
      name: "Badminton Championship 2024",
      date: "2024-02-15",
      sport: "Badminton",
      participants: 32,
      status: "Active"
    },
    {
      id: 2,
      name: "Tennis Open Tournament",
      date: "2024-02-20",
      sport: "Tennis", 
      participants: 16,
      status: "Upcoming"
    },
    {
      id: 3,
      name: "Cricket League Finals",
      date: "2024-02-25",
      sport: "Cricket",
      participants: 8,
      status: "Completed"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Tournaments</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <div key={tournament.id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {tournament.name}
              </h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>Sport:</strong> {tournament.sport}</p>
                <p><strong>Date:</strong> {tournament.date}</p>
                <p><strong>Participants:</strong> {tournament.participants}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-sm ${
                    tournament.status === 'Active' ? 'bg-green-100 text-green-800' :
                    tournament.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {tournament.status}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
