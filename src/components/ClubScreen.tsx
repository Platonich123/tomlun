import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Star, Clock, Play, Calendar, Music, Users, MapPin } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

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

interface ClubScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export function ClubScreen({ onBack, onNavigate }: ClubScreenProps) {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка мероприятий из базы данных
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/events');
        if (response.ok) {
          const eventsData = await response.json();
          setEvents(eventsData);
        } else {
          console.log('Ошибка загрузки мероприятий');
          setError('Ошибка загрузки мероприятий');
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Ошибка подключения к серверу');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventClick = (event: any) => {
    if (onNavigate) {
      onNavigate('club-event-detail', event);
    }
  };

  const handleBuyTicket = (event: any, e: any) => {
    e.stopPropagation();
    if (onNavigate) {
      onNavigate('club-booking', event);
    }
  };

  return (
    <div className="h-full bg-black text-white flex flex-col min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 pt-8 pb-6 flex-shrink-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="ml-2 text-xl font-medium">Все мероприятия и столы</h1>
        </div>
        
        <div className="text-purple-100 text-sm">
          <p>Ближайшие события • {events.length} мероприятий</p>
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide bg-black">
        <div className="p-4 space-y-4 pb-8 min-h-full">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-400">Загрузка мероприятий...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-400 mb-2">{error}</p>
              <p className="text-gray-400 text-sm">Проверьте подключение к серверу</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">Скоро здесь появится актуальный список мероприятий...</p>
            </div>
          ) : (
            events.map(event => (
            <Card 
              key={event.id} 
              className="overflow-hidden shadow-sm border border-gray-800 bg-gray-900 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleEventClick(event)}
            >
              <div className="flex">
                <div className="relative">
                  <ImageWithFallback
                    src={event.image_url}
                    alt={event.title}
                    className="w-24 h-36 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play size={20} className="text-white" />
                  </div>
                </div>
                
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">{event.title}</h3>
                      <p className="text-xs text-gray-400 mb-2">с {event.dj}</p>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-purple-100 text-purple-800 text-xs">{event.genre}</Badge>
                        <div className="flex items-center space-x-1 text-gray-400">
                          <Clock size={12} />
                          <span className="text-xs">{event.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right ml-2">
                      <p className="text-sm font-medium text-white">от {event.price} ₽</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">{event.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 text-xs text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar size={12} />
                        <span>{new Date(event.date).toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={(e) => handleBuyTicket(event, e)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm"
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