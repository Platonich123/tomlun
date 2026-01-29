import { useState } from 'react';
import { ArrowLeft, Play, Star, Calendar, Clock, Users, Heart, Share2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MovieDetailScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
  movieData: any;
}

export function MovieDetailScreen({ onBack, onNavigate, movieData }: MovieDetailScreenProps) {
  const [activeTab, setActiveTab] = useState('about');
  const [isFavorite, setIsFavorite] = useState(false);

  // Создаем полный объект фильма с значениями по умолчанию
  const movie = {
    id: movieData?.id || 1,
    title: movieData?.title || 'Дюна: Часть вторая',
    originalTitle: movieData?.originalTitle || 'Dune: Part Two',
    genre: movieData?.genre || 'Фантастика, Драма',
    duration: movieData?.duration || '166 мин',
    rating: movieData?.rating || 8.7,
    year: movieData?.year || 2024,
    director: movieData?.director || 'Дени Вильнёв',
    cast: movieData?.cast || ['Тимоти Шаламе', 'Зендея', 'Оскар Айзек', 'Джош Бролин'],
    description: movieData?.description || 'Пол Атрейдес объединяется с Чани и фрименами, пока пытается отомстить заговорщикам, которые уничтожили его семью. Стоя перед выбором между любовью к своей жизни и судьбой известной вселенной, он пытается предотвратить ужасное будущее, которое только он может предвидеть.',
    poster: movieData?.image || movieData?.poster || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop',
    trailer: movieData?.trailer || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    ageRating: movieData?.ageRating || '12+',
    times: movieData?.times || ['10:00', '13:30', '16:45', '20:15', '23:30'],
    showtimes: movieData?.showtimes || [
      { time: '10:00', price: 250, hall: 'Зал 1' },
      { time: '13:30', price: 300, hall: 'Зал 2' },
      { time: '16:45', price: 350, hall: 'Зал 1' },
      { time: '20:15', price: 400, hall: 'Зал 2' },
      { time: '23:30', price: 300, hall: 'Зал 3' }
    ]
  };

  const tabs = [
    { id: 'about', label: 'О фильме' },
    { id: 'showtimes', label: 'Сеансы' }
  ];

  const handleBooking = (showtime: any) => {
    const bookingData = {
      movieId: movie.id,
      movieTitle: movie.title,
      time: showtime.time,
      price: showtime.price,
      hall: showtime.hall,
      date: new Date().toLocaleDateString('ru-RU'),
      poster: movie.poster
    };
    onNavigate('cinema-booking', bookingData);
  };



  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      {/* Header with backdrop */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10 pointer-events-none"></div>
        <ImageWithFallback
          src={movie.poster}
          alt={movie.title}
          className="w-full h-64 object-cover"
        />
        
        {/* Header Controls */}
        <div className="absolute top-8 left-4 right-4 z-30 flex items-center justify-between">
          <button 
            onClick={() => {
              console.log('Back button clicked');
              onBack();
            }}
            className="p-2 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors cursor-pointer"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 bg-black/50 text-white rounded-full backdrop-blur-sm"
            >
              <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
            </button>
            <button className="p-2 bg-black/50 text-white rounded-full backdrop-blur-sm">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Play Button */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <button className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-colors">
            <Play size={24} className="text-white ml-1" />
          </button>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-1">{movie.title}</h1>
          <p className="text-muted-foreground text-sm mb-2">{movie.originalTitle}</p>
          
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex items-center space-x-1">
              <Star size={16} className="text-yellow-500 fill-current" />
              <span className="font-medium text-foreground">{movie.rating}</span>
            </div>
            <Badge className="bg-blue-100 text-blue-800 text-xs">{movie.ageRating}</Badge>
            <span className="text-muted-foreground text-sm">{movie.year}</span>
            <span className="text-muted-foreground text-sm">{movie.duration}</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {movie.genre.split(', ').map((g: string, index: number) => (
              <Badge key={index} className="bg-gray-100 text-gray-800 text-xs">
                {g}
              </Badge>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4">
        {activeTab === 'about' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-foreground mb-2">Описание</h3>
              <p className="text-muted-foreground leading-6">{movie.description}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-foreground mb-2">Режиссер</h3>
              <p className="text-muted-foreground">{movie.director}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-foreground mb-2">В ролях</h3>
              <p className="text-muted-foreground">
                {Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast || 'Информация не доступна'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'showtimes' && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-4">
              <Calendar size={16} className="text-blue-600" />
              <h3 className="font-medium text-foreground">Сегодня, {new Date().toLocaleDateString('ru-RU')}</h3>
            </div>
            
            {movie.showtimes.map((showtime: any, index: number) => (
              <Card key={index} className="bg-card border-border">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-medium text-foreground">{showtime.time}</div>
                      <div className="text-xs text-muted-foreground">{showtime.hall}</div>
                    </div>
                    <div className="h-8 w-px bg-border"></div>
                    <div>
                      <div className="font-medium text-foreground">{showtime.price} ₽</div>
                      <div className="text-xs text-muted-foreground">за билет</div>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleBooking(showtime)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  >
                    Билеты
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}


      </div>
    </div>
  );
}