import { useState, useEffect } from 'react';
import { Gamepad2, Search, X, Maximize2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const manifestResponse = await fetch('/games/manifest.json');
        const manifest = await manifestResponse.json();
        
        const gamePromises = manifest.map(async (filename) => {
          const res = await fetch(`/games/${filename}`);
          return res.json();
        });
        
        const gamesData = await Promise.all(gamePromises);
        setGames(gamesData);
        setFilteredGames(gamesData);
      } catch (error) {
        console.error('Error loading games:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    const filtered = games.filter(game => 
      game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredGames(filtered);
  }, [searchQuery, games]);

  const openGame = (game) => {
    setSelectedGame(game);
  };

  const closeGame = () => {
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSearchQuery('')}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Gamepad2 className="text-black w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">UNBLOCKED<span className="text-emerald-500">GAMES</span></h1>
          </div>

          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 transition-colors"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.map((game) => (
                  <motion.div
                    key={game.id}
                    layoutId={game.id}
                    onClick={() => openGame(game)}
                    className="group bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/10"
                    whileHover={{ y: -4 }}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={game.thumbnail}
                        alt={game.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <span className="text-xs font-medium bg-emerald-500 text-black px-2 py-1 rounded-md">PLAY NOW</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-emerald-400 transition-colors">{game.title}</h3>
                      <p className="text-white/50 text-sm line-clamp-2">{game.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-white/40 text-lg">No games found matching "{searchQuery}"</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-emerald-500 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Game Player Overlay */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-xl"
          >
            <motion.div
              layoutId={selectedGame.id}
              className="w-full max-w-6xl h-full flex flex-col bg-[#111] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img src={selectedGame.thumbnail} alt="" className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                  <h2 className="font-bold text-lg">{selectedGame.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={selectedGame.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={closeGame}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 bg-black relative group">
                <iframe
                  src={selectedGame.url}
                  className="w-full h-full border-none"
                  title={selectedGame.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; full-screen"
                  allowFullScreen
                />
              </div>

              <div className="p-4 bg-white/5 flex items-center justify-between text-sm text-white/40">
                <p>Playing {selectedGame.title}</p>
                <div className="flex items-center gap-4">
                  <span>Use keyboard to play</span>
                  <div className="w-px h-4 bg-white/10" />
                  <button className="hover:text-white transition-colors flex items-center gap-1">
                    <Maximize2 className="w-4 h-4" /> Fullscreen
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50 grayscale">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Gamepad2 className="text-black w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight">UNBLOCKEDGAMES</span>
          </div>
          <div className="flex gap-8 text-sm text-white/40">
            <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Contact Us</a>
          </div>
          <p className="text-sm text-white/20">© 2024 Unblocked Games Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
