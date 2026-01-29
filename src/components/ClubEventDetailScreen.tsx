import { useState } from 'react';
import { ArrowLeft, Play, Star, Calendar, Clock, Users, Heart, Share2, MapPin, Music, Shirt } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ClubEventDetailScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
  eventData: any;
}

export function ClubEventDetailScreen({ onBack, onNavigate, eventData }: ClubEventDetailScreenProps) {
  const [activeTab, setActiveTab] = useState('about');
  const [isFavorite, setIsFavorite] = useState(false);

  // Создаем полный объект события с значениями по умолчанию
  const event = {
    id: eventData?.id || 1,
    title: eventData?.title || 'Techno Night',
    dj: eventData?.dj || 'DJ Armin',
    genre: eventData?.genre || 'Techno',
    date: eventData?.date || '2025-07-19',
    time: eventData?.time || '22:00',
    endTime: eventData?.endTime || '06:00',
    price: eventData?.price || 1500,
    description: eventData?.description || 'Лучшие техно-треки всю ночь напролет',
    fullDescription: eventData?.fullDescription || 'Погрузитесь в мир электронной музыки на самой зажигательной техно-вечеринке города! DJ Armin представит эксклюзивный сет из лучших треков современной техно-сцены. Профессиональное световое шоу, мощная звуковая система и незабываемая атмосфера гарантированы.',
    venue: eventData?.venue || 'Главный зал',
    capacity: eventData?.capacity || 300,
    ageLimit: eventData?.ageLimit || '18+',
    dressCode: eventData?.dressCode || 'Smart Casual / Клубный стиль',
    image: eventData?.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
    poster: eventData?.poster || eventData?.image || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
    lineup: eventData?.lineup || ['DJ Armin', 'MC Voltage'],
    features: eventData?.features || ['Лазерное шоу', 'Дым-машина', 'LED экраны', 'VIP зона'],
    tickets: eventData?.tickets || [
      { type: 'Обычный', price: 1500, description: 'Вход в основную зону' },
      { type: 'VIP', price: 3000, description: 'VIP зона + комплимент' },
      { type: 'Столик (4 чел.)', price: 8000, description: 'Столик на 4 человека' }
    ]
  };

  const tabs = [
    { id: 'about', label: 'О событии' },
    { id: 'tickets', label: 'Билеты' }
  ];

  const handleBooking = (ticketType: any) => {
    const bookingData = {
      eventId: event.id,
      eventTitle: event.title,
      ticketType: ticketType.type,
      price: ticketType.price,
      date: event.date,
      time: event.time,
      poster: event.poster,
      dj: event.dj,
      venue: event.venue
    };
    onNavigate('club-booking', bookingData);
  };

  return (
    <div className="h-full bg-gray-900 text-white flex flex-col">
      {/* Header with backdrop */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent z-10 pointer-events-none"></div>
        <ImageWithFallback
          src={event.poster}
          alt={event.title}
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

      {/* Event Info */}
      <div className="p-4 space-y-4">
        <div>
          <h1 className="text-2xl font-medium text-white mb-1">{event.title}</h1>
          <p className="text-gray-400 text-sm mb-2">с {event.dj}</p>
          
          <div className="flex items-center space-x-3 mb-3">
            <Badge className="bg-purple-900/50 border-purple-500 text-purple-300 text-xs">{event.genre}</Badge>
            <Badge className="bg-red-900/50 border-red-500 text-red-300 text-xs">{event.ageLimit}</Badge>
            <span className="text-gray-400 text-sm">от {event.price} ₽</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-gray-400">
              <Calendar size={16} />
              <span>{new Date(event.date).toLocaleDateString('ru-RU')} в {event.time}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <MapPin size={16} />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Users size={16} />
              <span>До {event.capacity} человек</span>
            </div>
            {event.dressCode && (
              <div className="flex items-center space-x-2 text-gray-400">
                <Shirt size={16} />
                <span>{event.dressCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
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
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-white mb-3">Описание</h3>
              <p className="text-gray-300 leading-relaxed">{event.fullDescription}</p>
            </div>

            <div>
              <h3 className="font-medium text-white mb-3">Лайнап</h3>
              <div className="space-y-2">
                {event.lineup.map((artist: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Music size={16} className="text-purple-400" />
                    <span className="text-white">{artist}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-white mb-3">Особенности</h3>
              <div className="grid grid-cols-2 gap-2">
                {event.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-4">
            {event.tickets.map((ticket: any, index: number) => (
              <Card key={index} className="bg-gray-800 border border-gray-700">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-white">{ticket.type}</h4>
                      <p className="text-sm text-gray-400">{ticket.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-white">{ticket.price} ₽</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => handleBooking(ticket)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Купить билет
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