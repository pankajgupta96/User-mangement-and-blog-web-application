import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const App = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [counts, setCounts] = useState({
    users: 0,
    blogs: 0,
    tags: 0,
    categories: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [users, blogs, tags, categories] = await Promise.all([
        axios.get('http://localhost:3000/api/users/count'),
        axios.get('http://localhost:3000/api/blogs/count'),
        axios.get('http://localhost:3000/api/tags/count'),
        axios.get('http://localhost:3000/api/categories/count')
      ]);
      
      setCounts({
        users: users.data.count,
        blogs: blogs.data.count,
        tags: tags.data.count,
        categories: categories.data.count
      });
    } catch (error) {
      console.log("Error fetching counts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Users",
      description: "Manage all user accounts",
      icon: "👥",
      color: "from-blue-500 to-blue-600",
      path: "/users"
    },
    {
      title: "Blogs",
      description: "Manage all blog posts",
      icon: "✍️",
      color: "from-purple-500 to-purple-600",
      path: "/blogs"
    },
    {
      title: "Tags",
      description: "Manage blog tags",
      icon: "🏷️",
      color: "from-pink-500 to-pink-600",
      path: "/tags"
    },
    {
      title: "Categories",
      description: "Manage blog categories",
      icon: "🗂️",
      color: "from-yellow-500 to-yellow-600",
      path: "/categories"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
            Data Management
          </h1>
          <p className="text-lg text-gray-600">
            Manage your application content and users
          </p>
        </header>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cards.map((card, index) => (
                <Link
                  to={card.path}
                  key={index}
                  className={`relative group overflow-hidden rounded-2xl shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl ${
                    hoveredCard === index ? 'ring-4 ring-opacity-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className={`bg-gradient-to-br ${card.color} p-6 h-full flex flex-col`}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-4xl">{card.icon}</span>
                      <span className="text-white opacity-70 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                    <p className="text-white opacity-90 text-sm">{card.description}</p>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500 shadow-sm">
                  <h3 className="font-medium text-gray-700 mb-1">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-800">{counts.users}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border-l-4 border-purple-500 shadow-sm">
                  <h3 className="font-medium text-gray-700 mb-1">Total Blogs</h3>
                  <p className="text-3xl font-bold text-gray-800">{counts.blogs}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border-l-4 border-pink-500 shadow-sm">
                  <h3 className="font-medium text-gray-700 mb-1">Total Tags</h3>
                  <p className="text-3xl font-bold text-gray-800">{counts.tags}</p>
                </div>
                <div className="bg-white rounded-xl p-6 border-l-4 border-yellow-500 shadow-sm">
                  <h3 className="font-medium text-gray-700 mb-1">Total Categories</h3>
                  <p className="text-3xl font-bold text-gray-800">{counts.categories}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;