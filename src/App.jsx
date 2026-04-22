import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const STORAGE_KEY = 'cnsnss_responses';

const loadResponsesFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveResponsesToStorage = (responses) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
};

export default function App() {
  useEffect(() => {
    const existing = document.getElementById('cnsnss-fonts');
    if (!existing) {
      const link = document.createElement('link');
      link.id = 'cnsnss-fonts';
      link.href =
        'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    document.body.style.fontFamily =
      "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  }, []);

  const [userId, setUserId] = useState('');
  const [hasStarted, setHasStarted] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [ratings, setRatings] = useState({});
  const [selectedTags, setSelectedTags] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVectorInput, setShowVectorInput] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [vizSong, setVizSong] = useState(0);
  const [vizVector, setVizVector] = useState('wonder');
  const [highlightUser, setHighlightUser] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const vectors = [
    { id: 'wonder', label: 'Wonder ↔ Mundane', low: 'Mundane', high: 'Wonder' },
    { id: 'joy', label: 'Joy ↔ Sadness', low: 'Sadness', high: 'Joy' },
    { id: 'power', label: 'Power ↔ Tenderness', low: 'Tenderness', high: 'Power' },
    { id: 'peace', label: 'Peace ↔ Tension', low: 'Tension', high: 'Peace' },
    { id: 'temporal', label: 'Past ↔ Future', low: 'Past', high: 'Future' }
  ];

  const tags = [
    'Gym',
    'Chill',
    'Focus',
    'Party',
    'Drive',
    'Nostalgic',
    'Energizing',
    'Emotional',
    'Uplifting',
    'Relaxing'
  ];

  const songs = [
    { id: 0, title: 'Song 1', artist: 'Artist 1', album: 'Album Name', year: '2024' },
    { id: 1, title: 'Song 2', artist: 'Artist 2', album: 'Album Name', year: '2024' },
    { id: 2, title: 'Song 3', artist: 'Artist 3', album: 'Album Name', year: '2024' },
    { id: 3, title: 'Song 4', artist: 'Artist 4', album: 'Album Name', year: '2024' },
    { id: 4, title: 'Song 5', artist: 'Artist 5', album: 'Album Name', year: '2024' },
    { id: 5, title: 'Song 6', artist: 'Artist 6', album: 'Album Name', year: '2024' },
    { id: 6, title: 'Song 7', artist: 'Artist 7', album: 'Album Name', year: '2024' },
    { id: 7, title: 'Song 8', artist: 'Artist 8', album: 'Album Name', year: '2024' },
    { id: 8, title: 'Song 9', artist: 'Artist 9', album: 'Album Name', year: '2024' },
    { id: 9, title: 'Song 10', artist: 'Artist 10', album: 'Album Name', year: '2024' },
    { id: 10, title: 'Song 11', artist: 'Artist 11', album: 'Album Name', year: '2024' },
    { id: 11, title: 'Song 12', artist: 'Artist 12', album: 'Album Name', year: '2024' }
  ];

  useEffect(() => {
    const initialRatings = {};
    vectors.forEach((v) => {
      initialRatings[v.id] = 5;
    });
    setRatings(initialRatings);
  }, []);

  useEffect(() => {
    loadAllResponses();
  }, []);

  const loadAllResponses = async () => {
    setLoading(true);
    try {
      const loaded = loadResponsesFromStorage();
      setAllResponses(loaded);
    } catch {
      setAllResponses([]);
    }
    setLoading(false);
  };

  const getContextData = () => {
    const now = new Date();
    const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')} ${now.getFullYear()}.${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}.${String(now.getDate()).padStart(2, '0')}`;

    return {
      timestamp,
      location: 'Boston, MA',
      weather: '52°F | Partly Cloudy'
    };
  };

  const handleSubmit = async () => {
    const hasChangedVectors = Object.entries(ratings).some(([, val]) => val !== 5);
    const hasTags = selectedTags.length > 0;

    if (!hasChangedVectors && !hasTags) {
      alert('Please move at least one slider OR select at least one tag before submitting');
      return;
    }

    const context = getContextData();
    const response = {
      id: `${userId}-${currentSongIndex}-${Date.now()}`,
      userId,
      songId: currentSongIndex,
      ...context,
      vectors: hasChangedVectors ? ratings : null,
      tags: hasTags ? selectedTags : []
    };

    try {
      const existing = loadResponsesFromStorage();
      const updated = [...existing, response];
      saveResponsesToStorage(updated);
      await loadAllResponses();

      if (currentSongIndex < songs.length - 1) {
        setCurrentSongIndex(currentSongIndex + 1);
        setSelectedTags([]);
        const resetRatings = {};
        vectors.forEach((v) => (resetRatings[v.id] = 5));
        setRatings(resetRatings);
      } else {
        alert('All songs rated! Thank you.');
      }
    } catch (error) {
      console.error('Error saving response:', error);
      alert(`Error saving: ${error.message}. Please try again.`);
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const generateHistogramData = (songId, vectorId) => {
    const bins = Array.from({ length: 11 }, (_, i) => ({
      range: String(i),
      value: i,
      count: 0
    }));

    const relevantResponses = allResponses.filter(
      (r) => r.songId === songId && r.vectors && r.vectors[vectorId] != null
    );

    relevantResponses.forEach((response) => {
      const value = Math.round(response.vectors[vectorId]);
      const bin = bins.find((b) => b.value === value);
      if (bin) bin.count++;
    });

    return { bins, total: relevantResponses.length };
  };

  const calculateStats = (songId, vectorId) => {
    const values = allResponses
      .filter((r) => r.songId === songId && r.vectors && r.vectors[vectorId] != null)
      .map((r) => r.vectors[vectorId]);

    if (values.length === 0) return null;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = [...values].sort((a, b) => a - b);
    const modeCounts = sorted.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    const modeValue = Object.keys(modeCounts).reduce((a, b) =>
      modeCounts[a] > modeCounts[b] ? a : b
    );
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      count: values.length,
      mean: mean.toFixed(1),
      mode: parseFloat(modeValue).toFixed(1),
      stdDev: stdDev.toFixed(1)
    };
  };

  const getTagDistribution = (songId) => {
    const tagCounts = {};
    allResponses
      .filter((r) => r.songId === songId && r.tags && r.tags.length > 0)
      .forEach((response) => {
        response.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-400 via-gray-500 to-gray-400 flex items-center justify-center p-6">
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800 max-w-md w-full">
          <h1 className="text-4xl font-extralight tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-100 to-white mb-2">
            CNSNSS
          </h1>
          <p className="text-slate-400 text-sm font-light mb-8">
            Context adds depth to a soundtrack
          </p>

          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value.slice(0, 3).toUpperCase())}
            placeholder="Initials"
            maxLength={3}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-light mb-6 text-center text-2xl tracking-widest"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          />

          <button
            onClick={() => userId.trim() && setHasStarted(true)}
            disabled={!userId.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-white text-slate-900 px-6 py-3 rounded-xl hover:from-cyan-400 hover:to-gray-100 transition font-medium shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ENTER
          </button>
        </div>
      </div>
    );
  }

  const context = getContextData();
  const currentSong = songs[currentSongIndex];
  const stats = calculateStats(vizSong, vizVector);
  const { bins } = generateHistogramData(vizSong, vizVector);
  const tagDist = getTagDistribution(vizSong);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-400 via-gray-500 to-gray-400 p-4 md:p-8">
      <button
        onClick={() => setShowAdminPanel(!showAdminPanel)}
        className="fixed top-4 left-4 w-8 h-8 opacity-10 hover:opacity-100 transition-opacity z-50 bg-slate-900 rounded-lg border border-cyan-500/50"
        title="Admin Panel"
      />

      {showAdminPanel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-auto p-4">
          <div className="max-w-7xl mx-auto mt-16">
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-light text-slate-200 tracking-wide">
                  Admin: All Response Data
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (
                        window.confirm(
                          `Delete ALL ${allResponses.length} responses? This cannot be undone.`
                        )
                      ) {
                        localStorage.removeItem(STORAGE_KEY);
                        await loadAllResponses();
                        alert('All responses cleared!');
                      }
                    }}
                    className="px-4 py-2 bg-red-900/50 border border-red-700 text-red-300 rounded-lg hover:bg-red-900 transition text-sm font-light"
                  >
                    Clear All Data
                  </button>
                  <button
                    onClick={() => setShowAdminPanel(false)}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition text-sm font-light"
                  >
                    Close
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-3 text-slate-400 font-light">User</th>
                      <th className="text-left p-3 text-slate-400 font-light">Song</th>
                      <th className="text-left p-3 text-slate-400 font-light">Time</th>
                      <th className="text-left p-3 text-slate-400 font-light">Wonder</th>
                      <th className="text-left p-3 text-slate-400 font-light">Joy</th>
                      <th className="text-left p-3 text-slate-400 font-light">Power</th>
                      <th className="text-left p-3 text-slate-400 font-light">Peace</th>
                      <th className="text-left p-3 text-slate-400 font-light">Temporal</th>
                      <th className="text-left p-3 text-slate-400 font-light">Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allResponses.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center p-8 text-slate-500 font-light">
                          No responses yet
                        </td>
                      </tr>
                    ) : (
                      allResponses.map((r, i) => (
                        <tr key={i} className="border-b border-slate-800 hover:bg-slate-900/50">
                          <td className="p-3 text-cyan-300 font-light">{r.userId}</td>
                          <td className="p-3 text-slate-300 font-light">
                            {songs[r.songId]?.title}
                          </td>
                          <td className="p-3 text-slate-400 font-light">{r.timestamp}</td>
                          <td className="p-3 text-cyan-300 font-light">
                            {r.vectors?.wonder?.toFixed(1) || '-'}
                          </td>
                          <td className="p-3 text-cyan-300 font-light">
                            {r.vectors?.joy?.toFixed(1) || '-'}
                          </td>
                          <td className="p-3 text-cyan-300 font-light">
                            {r.vectors?.power?.toFixed(1) || '-'}
                          </td>
                          <td className="p-3 text-cyan-300 font-light">
                            {r.vectors?.peace?.toFixed(1) || '-'}
                          </td>
                          <td className="p-3 text-cyan-300 font-light">
                            {r.vectors?.temporal?.toFixed(1) || '-'}
                          </td>
                          <td className="p-3 text-slate-400 font-light text-xs">
                            {r.tags?.join(', ') || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-right text-sm text-slate-500 font-light">
                Total: {allResponses.length}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 mb-6 border border-slate-800">
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl md:text-3xl font-light text-slate-100 tracking-wide">
                {currentSong.title}
              </h2>
              <span className="text-slate-600 text-sm font-light">
                {String(
                  allResponses.filter((r) => r.songId === currentSongIndex).length + 1
                ).padStart(6, '0')}
              </span>
            </div>
            <p className="text-slate-400 font-light text-sm md:text-base mt-1">
              {currentSong.artist}
            </p>
            <p className="text-slate-500 text-xs md:text-sm font-light mt-2">
              {currentSong.album} • {currentSong.year}
            </p>
            <div className="flex flex-wrap gap-2 mt-3 text-xs text-slate-600 font-light">
              <span>{context.timestamp}</span>
              <span>·</span>
              <span>{context.location}</span>
              <span>·</span>
              <span>{context.weather}</span>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowVectorInput(!showVectorInput)}
              className="w-full flex items-center justify-between group mb-4"
            >
              <h3 className="text-lg font-light text-cyan-300">Vector Input</h3>
              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform ${
                  showVectorInput ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showVectorInput && (
              <div className="space-y-4">
                {vectors.map((vector) => (
                  <div key={vector.id} className="space-y-2">
                    <div className="flex justify-between text-sm font-normal text-slate-500">
                      <span>{vector.low}</span>
                      <span>{vector.high}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={ratings[vector.id] || 5}
                      onChange={(e) =>
                        setRatings({
                          ...ratings,
                          [vector.id]: parseFloat(e.target.value)
                        })
                      }
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-center">
                      <span className="text-sm text-slate-500 font-light">
                        {ratings[vector.id]?.toFixed(1) || '5.0'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowTags(!showTags)}
              className="w-full flex items-center justify-between group mb-4"
            >
              <h3 className="text-lg font-light text-cyan-300">Tags (Optional, Multi-Select)</h3>
              <ChevronDown
                className={`w-5 h-5 text-cyan-300 transition-transform ${
                  showTags ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showTags && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-lg text-sm font-light transition ${
                      selectedTags.includes(tag)
                        ? 'bg-gradient-to-r from-cyan-500 to-white text-slate-900'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <button className="w-full flex items-center justify-between group cursor-not-allowed">
              <h3 className="text-lg font-light text-slate-500">Scenes (coming soon)</h3>
              <ChevronDown className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="mb-6">
            <button className="w-full flex items-center justify-between group cursor-not-allowed">
              <h3 className="text-lg font-light text-slate-500">Journal (locked)</h3>
              <ChevronDown className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentSongIndex(Math.max(0, currentSongIndex - 1))}
              disabled={currentSongIndex === 0}
              className="px-6 py-3 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition font-light disabled:opacity-30"
            >
              ← Previous
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-white text-slate-900 px-6 py-3 rounded-xl hover:from-cyan-400 hover:to-gray-100 transition font-medium shadow-xl"
            >
              {currentSongIndex === songs.length - 1 ? 'End' : 'Submit'}
            </button>
            <button
              onClick={() => {
                if (currentSongIndex < songs.length - 1) {
                  setCurrentSongIndex(currentSongIndex + 1);
                  setSelectedTags([]);
                  const resetRatings = {};
                  vectors.forEach((v) => (resetRatings[v.id] = 5));
                  setRatings(resetRatings);
                }
              }}
              disabled={currentSongIndex === songs.length - 1}
              className="px-6 py-3 bg-slate-900 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition font-light disabled:opacity-30"
            >
              Skip →
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl shadow-2xl p-6 md:p-8 border border-slate-800">
          <button
            onClick={() => setShowResults(!showResults)}
            className="w-full flex items-center justify-between group mb-2"
          >
            <h2 className="text-2xl font-light text-slate-200 tracking-wide">Displays</h2>
            <ChevronDown
              className={`w-5 h-5 text-cyan-300 transition-transform ${
                showResults ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showResults && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-4">
                <div>
                  <label className="text-sm font-light text-slate-400 block mb-2">Song</label>
                  <select
                    value={vizSong}
                    onChange={(e) => setVizSong(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm font-light"
                  >
                    {songs.map((song) => (
                      <option key={song.id} value={song.id}>
                        Song {song.id + 1}: {song.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-light text-slate-400 block mb-2">Vector</label>
                  <select
                    value={vizVector}
                    onChange={(e) => setVizVector(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm font-light"
                  >
                    {vectors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-light text-slate-400 block mb-2">
                  Highlight User
                </label>
                <input
                  type="text"
                  value={highlightUser}
                  onChange={(e) => setHighlightUser(e.target.value.toUpperCase())}
                  maxLength={3}
                  className="w-24 px-3 py-2 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-sm font-light text-center"
                />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-light text-cyan-300 mb-4">Distribution</h3>
                {stats ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-slate-900/50 rounded-xl p-6 border border-slate-800 relative">
                      <div className="absolute top-4 right-4 text-xs text-slate-500 font-light">
                        {stats.count} vector entries
                      </div>

                      <div className="h-64 flex items-end justify-around gap-1 relative">
                        {bins.map((bin, i) => {
                          const max = Math.max(...bins.map((b) => b.count), 1);
                          const height = (bin.count / max) * 100;
                          const showLabel = bin.value % 2 === 0;

                          const userResponse = highlightUser
                            ? allResponses.find(
                                (r) =>
                                  r.userId === highlightUser &&
                                  r.songId === vizSong &&
                                  r.vectors &&
                                  Math.round(r.vectors[vizVector]) === bin.value
                              )
                            : null;

                          return (
                            <div key={i} className="flex-1 flex flex-col items-center relative">
                              <div
                                className="w-full flex flex-col justify-end items-center"
                                style={{ height: '200px' }}
                              >
                                {userResponse && (
                                  <div
                                    className="absolute top-0 w-3 h-3 bg-white rounded-full border-2 border-slate-900 shadow-lg"
                                    style={{ marginTop: '-16px' }}
                                  />
                                )}
                                <div
                                  className="w-full bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-t-lg"
                                  style={{ height: `${height}%` }}
                                />
                              </div>
                              <div className="mt-3 text-center" style={{ minHeight: '36px' }}>
                                {showLabel && (
                                  <div className="text-xs text-slate-500 font-light mt-1">
                                    {bin.range}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between text-sm font-normal text-slate-500 -mt-1 px-2">
                        <span>{vectors.find((v) => v.id === vizVector)?.low}</span>
                        <span>{vectors.find((v) => v.id === vizVector)?.high}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                        <p className="text-xs text-slate-500 font-light mb-1">Responses</p>
                        <p className="text-3xl text-cyan-300 font-light">{stats.count}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                        <p className="text-xs text-slate-500 font-light mb-1">Mean</p>
                        <p className="text-3xl text-cyan-300 font-light">{stats.mean}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                        <p className="text-xs text-slate-500 font-light mb-1">Mode</p>
                        <p className="text-3xl text-cyan-300 font-light">{stats.mode}</p>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                        <p className="text-xs text-slate-500 font-light mb-1">Std Dev</p>
                        <p className="text-3xl text-cyan-300 font-light">{stats.stdDev}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
                    <p className="text-slate-500 font-light">No data yet</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-light text-cyan-300 mb-4">Tags</h3>
                {tagDist.length > 0 ? (
                  <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                    <div className="flex flex-wrap gap-2">
                      {tagDist.map(({ tag, count }) => (
                        <div
                          key={tag}
                          className="px-3 py-2 bg-slate-800 border border-cyan-500/30 rounded-lg"
                        >
                          <span className="text-sm text-cyan-300 font-light">{tag}</span>
                          {count > 1 && (
                            <span className="ml-2 text-xs text-slate-500">×{count}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-slate-800">
                    <p className="text-slate-500 font-light">No tags yet</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {loading && (
          <div className="text-center py-6 text-slate-200 font-light">Loading…</div>
        )}
      </div>
    </div>
  );
}
