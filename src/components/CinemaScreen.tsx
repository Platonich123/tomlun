import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Star, Clock, Play, Calendar } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  rating: number;
  description?: string;
  poster_url?: string;
  created_at: string;
  updated_at: string;
}

interface CinemaScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function CinemaScreen({ onBack, onNavigate }: CinemaScreenProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных из базы данных
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/movies');
        if (response.ok) {
          const moviesData = await response.json();
          setMovies(moviesData);
        } else {
          console.log('Ошибка загрузки фильмов');
          setError('Ошибка загрузки фильмов');
        }
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Ошибка подключения к серверу');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Используем только данные из базы данных
  const displayMovies = movies;

  const handleMovieClick = (movie: any) => {
    if (onNavigate) {
      onNavigate('movie-detail', movie);
    }
  };

  const handleBuyTicket = (movie: any, event: any) => {
    event.stopPropagation();
    if (onNavigate) {
      onNavigate('cinema-booking', movie);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 pt-8 pb-6 flex-shrink-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="ml-2 text-xl font-medium">Все фильмы и сеансы</h1>
        </div>
        
        <div className="text-blue-100 text-sm">
          <p>Сегодня в кинотеатре • {displayMovies.length} фильмов</p>
        </div>
      </div>

      {/* Movies List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-4 pb-8">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Загрузка фильмов...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <p className="text-gray-500 text-sm mt-2">Проверьте подключение к серверу</p>
            </div>
          ) : displayMovies.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Скоро здесь появится актуальный список фильмов...</p>
            </div>
          ) : (
            displayMovies.map(movie => (
            <Card 
              key={movie.id} 
              className="overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="flex">
                <div className="relative">
                  <ImageWithFallback
                    src={movie.image}
                    alt={movie.title}
                    className="w-24 h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play size={20} className="text-white" />
                  </div>
                </div>
                
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{movie.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">{movie.originalTitle}</p>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-600 text-xs">{movie.genre.split(',')[0]}</Badge>
                        <Badge className="bg-gray-100 text-gray-700 text-xs">{movie.ageRating}</Badge>
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock size={12} />
                          <span className="text-xs">{movie.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      <Star size={14} className="text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{movie.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{movie.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {movie.times.slice(0, 3).map(time => (
                        <span key={time} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                          {time}
                        </span>
                      ))}
                      {movie.times.length > 3 && (
                        <span className="px-2 py-1 text-xs text-gray-500">
                          +{movie.times.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <Button 
                      onClick={(e) => handleBuyTicket(movie, e)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm"
                    >
                      Купить билет
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}