import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Film, Music, Star, Clock, Calendar, Users, Play, MapPin, Phone, Lock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import React from 'react';

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

interface ClubEvent {
  id: number;
  title: string;
  description: string;
  dj: string;
  date: string;
  time: string;
  price: number;
  genre: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface ClubTable {
  id: number;
  table_number: number;
  capacity: number;
  location: string;
  price_per_hour: number;
  is_active: boolean;
  active_bookings: number;
}

interface TableStats {
  total_tables: number;
  active_tables: number;
  booked_tables_today: number;
}

interface HomeScreenProps {
  onNavigate: (section: string, data?: any) => void;
  homeTheme: 'cinema' | 'club';
  isAuthenticated: boolean;
  activeSection: 'cinema' | 'club';
  onSectionChange: (section: 'cinema' | 'club') => void;
}

export function HomeScreen({ onNavigate, homeTheme, isAuthenticated, activeSection, onSectionChange }: HomeScreenProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [tables, setTables] = useState<ClubTable[]>([]);
  const [tableStats, setTableStats] = useState<TableStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных из базы данных
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Загрузка фильмов
        const moviesResponse = await fetch('http://localhost:3001/api/movies');
        if (moviesResponse.ok) {
          const moviesData = await moviesResponse.json();
          setMovies(moviesData);
        } else {
          console.log('Ошибка загрузки фильмов, используем fallback');
          setError('Ошибка загрузки фильмов');
        }
        
        // Загрузка клубных событий
        const eventsResponse = await fetch('http://localhost:3001/api/events');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          setEvents(eventsData);
        } else {
          console.log('Ошибка загрузки событий, используем fallback');
        }
        
        // Загрузка сеансов
        const sessionsResponse = await fetch('http://localhost:3001/api/cinema-sessions');
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          setSessions(sessionsData);
        } else {
          console.log('Ошибка загрузки сеансов, используем fallback');
        }
        
        // Загрузка столов клуба
        const tablesResponse = await fetch('http://localhost:3001/api/club/tables');
        if (tablesResponse.ok) {
          const tablesData = await tablesResponse.json();
          setTables(tablesData);
        } else {
          console.log('Ошибка загрузки столов');
        }
        
        // Загрузка статистики столов
        const tableStatsResponse = await fetch('http://localhost:3001/api/club/tables/stats');
        if (tableStatsResponse.ok) {
          const tableStatsData = await tableStatsResponse.json();
          setTableStats(tableStatsData);
        } else {
          console.log('Ошибка загрузки статистики столов');
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Ошибка подключения к серверу');
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const handleSectionChange = (section: 'cinema' | 'club') => {
    onSectionChange(section);
  };

  const handleMovieClick = (movie: Movie) => {
    onNavigate('movie-detail', movie);
  };

  const handleMovieBook = (movie: Movie, event?: any) => {
    if (event) {
      event.stopPropagation();
    }
    onNavigate('cinema-booking', movie);
  };

  const handleOldMovieBook = (movie: Movie, event: any) => {
    event.stopPropagation();
    onNavigate('cinema-booking', movie);
  };

  const handleEventBook = (event: any) => {
    onNavigate('club-booking', event);
  };

  const handleEventClick = (event: any) => {
    onNavigate('club-event-detail', event);
  };

  const isClubMode = activeSection === 'club';

  // Генерируем временные слоты для фильма (можно заменить на реальные данные из БД)
  const generateTimeSlots = (movieId: number) => {
    const baseTimes = ['10:00', '13:30', '17:00', '20:30'];
    const variations = [
      ['11:00', '15:00', '19:00'],
      ['12:00', '16:30', '21:00'],
      ['14:00', '18:00', '22:30']
    ];
    return variations[movieId % variations.length] || baseTimes;
  };

  return (
    <div className={`flex flex-col ${isClubMode ? 'bg-black dark:bg-black min-h-screen' : 'bg-white dark:bg-gray-900'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 pt-8 pb-4 shadow-card">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold tracking-tight">ТРК "Томлун"</h1>
          {!isAuthenticated && (
            <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded-full">
              <Lock size={12} />
              <span className="text-xs">Гость</span>
            </div>
          )}
        </div>
        <p className="text-sm text-blue-100">Развлечения и отдых</p>
        <div className="flex mt-4 p-1 bg-white/10 gap-2">
          <Button
            onClick={() => handleSectionChange('cinema')}
            variant="ghost"
            size="sm"
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all
              ${activeSection === 'cinema'
                ? 'bg-white text-blue-600 shadow-lg scale-105 font-semibold border border-blue-200'
                : 'bg-gray-100 text-gray-400 hover:text-blue-600'}
            `}
          >
            <Film size={20} />
            <span className="text-sm font-medium">Кинотеатр</span>
          </Button>
          <Button
            onClick={() => handleSectionChange('club')}
            variant="ghost"
            size="sm"
            className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all
              ${activeSection === 'club'
                ? 'bg-gradient-to-r from-purple-700 to-pink-700 text-white shadow-lg scale-105 font-semibold border border-purple-400'
                : 'bg-gray-100 text-purple-400 hover:text-purple-600'}
            `}
          >
            <Music size={20} />
            <span className="text-sm font-medium">Клуб</span>
          </Button>
        </div>
        <div className="flex items-center justify-between mt-3 p-3 rounded-xl text-sm bg-white/10">
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{activeSection === 'cinema' ? '10:00 - 02:00' : '21:00 - 06:00'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin size={16} />
            <span>ул. 60 лет Октября, 8</span>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className={`px-4 pt-4 pb-4 space-y-4 ${isClubMode ? 'bg-black -mb-16' : 'bg-gray-50 dark:bg-black'}`}>
        {activeSection === 'cinema' ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl text-gray-900 dark:text-white">Сейчас в кино</h2>
              <Badge variant="secondary" className="text-sm">
                {new Date().toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
              </Badge>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Загрузка фильмов...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
                <p className="text-sm text-gray-500 mt-2">Показаны демо-фильмы</p>
              </div>
            ) : movies.length > 0 ? (
              <div className="space-y-3">
                {movies.map(movie => (
                  <Card key={movie.id} className="overflow-hidden shadow-card rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleMovieClick(movie)}>
                    <div className="flex">
                      <ImageWithFallback
                        src={movie.poster_url || 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=200&fit=crop'}
                        alt={movie.title}
                        className="w-32 h-32 object-cover rounded-2xl"
                      />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{movie.title}</h2>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className="bg-blue-100 text-blue-600 font-medium">{movie.genre}</Badge>
                              <span className="text-xs text-gray-500 dark:text-gray-300 flex items-center"><Clock size={12} className="mr-1" />{movie.duration} мин</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            <Star size={14} className="text-yellow-400" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{movie.rating}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {generateTimeSlots(movie.id).map(time => (
                            <span key={time} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-200">{time}</span>
                          ))}
                        </div>
                        <Button 
                          onClick={(e) => handleMovieBook(movie, e)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Купить билет
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Film size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Фильмы не найдены</p>
                <p className="text-sm mt-2">Добавьте фильмы через админ панель</p>
              </div>
            )}

            <Button 
              onClick={() => onNavigate('cinema')}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Play size={16} />
              <span>Все фильмы и сеансы</span>
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl text-white">Афиша мероприятий</h2>
              <Badge variant="secondary" className="bg-purple-600 text-white border-purple-500">
                Скоро
              </Badge>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-300">Загрузка мероприятий...</span>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-3">
                {events.map(event => (
                  <Card key={event.id} className="overflow-hidden shadow-card rounded-2xl bg-gray-900 border border-gray-800 hover:shadow-xl cursor-pointer" onClick={() => handleEventClick(event)}>
                    <ImageWithFallback
                      src={event.image_url || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=200&fit=crop'}
                      alt={event.title}
                      className="w-full h-28 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="flex-1 text-white font-medium">{event.title}</h3>
                        <Badge variant="outline" className="border-purple-500 text-purple-300 bg-purple-900/50">
                          {event.genre}
                        </Badge>
                      </div>
                      <p className="text-sm mb-3 text-gray-300">{event.description}</p>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Music size={14} />
                          <span className="text-sm">{event.dj}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Calendar size={14} />
                          <span className="text-sm">
                            {new Date(event.date).toLocaleDateString('ru')} в {event.time.slice(0, 5)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">от {event.price} ₽</span>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventBook(event);
                          }}
                          className="border-purple-500 text-purple-300 hover:bg-purple-900/50 bg-purple-900/30"
                        >
                          Купить билет
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Music size={48} className="mx-auto mb-4 text-gray-500" />
                <p className="text-lg font-medium text-gray-300">На данный момент мероприятия отсутствуют</p>
                <p className="text-sm mt-2 text-gray-500">Скоро здесь появятся новые события</p>
              </div>
            )}
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl shadow-lg"
              onClick={() => onNavigate('club')}
            >
              <Music size={16} className="mr-2" />
              Все мероприятия и столы
            </Button>
          </>
        )}
        {/* Quick Stats */}
        {(activeSection === 'cinema' || activeSection === 'club') && (
          <div className={`grid grid-cols-2 gap-3 ${isClubMode ? 'bg-black' : ''}`}>
            <Card className={`p-4 text-center border ${
              isClubMode 
                ? 'bg-gray-900 border-gray-800' 
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
            } shadow-sm`}>
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                activeSection === 'cinema' 
                  ? 'bg-blue-100' 
                  : 'bg-purple-900'
              }`}>
                {activeSection === 'cinema' ? (
                  <Film size={24} className="text-blue-600" />
                ) : (
                  <Users size={24} className="text-purple-300" />
                )}
              </div>
              <p className={`text-sm ${isClubMode ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                {activeSection === 'cinema' ? 'Фильмов' : 'Столов'}
              </p>
              <p className={`font-medium ${isClubMode ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {activeSection === 'cinema' ? movies.length : (tableStats?.active_tables || 0)}
              </p>
            </Card>
            <Card className={`p-4 text-center border ${
              isClubMode 
                ? 'bg-gray-900 border-gray-800' 
                : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'
            } shadow-sm`}>
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                activeSection === 'cinema' 
                  ? 'bg-green-100' 
                  : 'bg-pink-900'
              }`}>
                <Clock size={24} className={activeSection === 'cinema' ? 'text-green-600' : 'text-pink-300'} />
              </div>
              <p className={`text-sm ${isClubMode ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>
                {activeSection === 'cinema' ? 'Сеансов сегодня' : 'Часов работы'}
              </p>
              <p className={`font-medium ${isClubMode ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {activeSection === 'cinema' ? sessions.length : '9'}
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
