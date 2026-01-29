import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, Users, CreditCard, MapPin } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface CinemaBookingScreenProps {
  onBack: (screen?: string) => void;
  onNavigate: (screen: string, data?: any) => void;
  movieData?: any;
  occupiedSeats?: {[key: string]: string[]};
}

export function CinemaBookingScreen({ onBack, onNavigate, movieData, occupiedSeats = {} }: CinemaBookingScreenProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState('20:30');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0]; // Формат YYYY-MM-DD
  });

  // Генерация схемы зала с автоматическим обновлением при изменении времени/даты
  const seats = useMemo(() => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 12;
    const seats = [];
    
    // Получаем занятые места для текущего сеанса
    const movieTitle = movieData?.title || 'Дюна: Часть вторая';
    const formattedDate = new Date(selectedDate).toLocaleDateString('ru-RU');
    const sessionKey = `${movieTitle}-${formattedDate}-${selectedTime}`;
    const currentOccupiedSeats = occupiedSeats[sessionKey] || [];
    
    for (let i = 0; i < rows.length; i++) {
      const row = [];
      for (let j = 1; j <= seatsPerRow; j++) {
        const seatId = `${rows[i]}${j}`;
        const isOccupied = currentOccupiedSeats.includes(seatId);
        const isSelected = selectedSeats.includes(seatId);
        
        row.push({
          id: seatId,
          row: rows[i],
          number: j,
          isOccupied,
          isSelected,
          price: i < 3 ? 500 : i < 6 ? 400 : 300 // VIP, Стандарт, Эконом
        });
      }
      seats.push(row);
    }
    
    return seats;
  }, [selectedDate, selectedTime, occupiedSeats, movieData?.title, selectedSeats]);

  // Очищаем выбранные места при изменении времени или даты
  useEffect(() => {
    setSelectedSeats([]);
  }, [selectedDate, selectedTime]);

  const handleSeatClick = (seatId: string, isOccupied: boolean) => {
    if (isOccupied) return;
    
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seatId) => {
      const row = seatId.charAt(0);
      const rowIndex = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].indexOf(row);
      const price = rowIndex < 3 ? 500 : rowIndex < 6 ? 400 : 300;
      return total + price;
    }, 0);
  };

  const getSeatTypeColor = (rowIndex: number) => {
    if (rowIndex < 3) return 'bg-yellow-500'; // VIP
    if (rowIndex < 6) return 'bg-blue-500'; // Стандарт
    return 'bg-green-500'; // Эконом
  };

  const times = ['10:00', '13:30', '17:00', '20:30', '23:00'];

  const handleBooking = () => {
    // Форматируем дату для отображения в заказе
    const formattedDate = new Date(selectedDate).toLocaleDateString('ru-RU');
    
    const bookingData = {
      type: 'cinema',
      movieTitle: movieData?.title || 'Дюна: Часть вторая',
      date: formattedDate, // Используем отформатированную дату
      time: selectedTime,
      seats: selectedSeats,
      totalPrice: getTotalPrice(),
      hall: '1'
    };
    
    onNavigate('payment', bookingData);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 pt-8 pb-4 flex-shrink-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => onBack('home')}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="ml-2 text-xl">Выбор мест</h1>
        </div>

        <div className="mb-4">
          <h2 className="font-medium">{movieData?.title || 'Дюна: Часть вторая'}</h2>
          <p className="text-blue-100 text-sm">Зал №1 • 2D</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-4 pb-48">
          {/* Time Selection */}
          <Card className="p-4 bg-white border-gray-100 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Clock size={16} className="text-blue-600" />
              <h3 className="font-medium text-gray-900">Время сеанса</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {times.map(time => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className={selectedTime === time ? "bg-blue-600 text-white" : ""}
                >
                  {time}
                </Button>
              ))}
            </div>
          </Card>

          {/* Screen */}
          <div className="text-center mb-4">
            <div className="mx-auto w-48 h-2 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full mb-2"></div>
            <p className="text-sm text-gray-600">ЭКРАН</p>
          </div>

          {/* Seat Map */}
          <Card className="p-4 bg-white border-gray-100 shadow-sm">
            <div className="space-y-2">
              {seats.map((row, rowIndex) => (
                <div key={rowIndex} className="flex items-center justify-center space-x-1">
                  <span className="w-6 text-center text-sm font-medium text-gray-600">
                    {row[0].row}
                  </span>
                  <div className="flex space-x-1">
                    {row.slice(0, 5).map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat.id, seat.isOccupied)}
                        className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                          seat.isOccupied
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : seat.isSelected
                              ? 'bg-blue-600 text-white'
                              : `${getSeatTypeColor(rowIndex)} text-white hover:opacity-80`
                        }`}
                        disabled={seat.isOccupied}
                      >
                        {seat.number}
                      </button>
                    ))}
                    <div className="w-4"></div>
                    {row.slice(5).map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat.id, seat.isOccupied)}
                        className={`w-6 h-6 rounded text-xs font-medium transition-colors ${
                          seat.isOccupied
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : seat.isSelected
                              ? 'bg-blue-600 text-white'
                              : `${getSeatTypeColor(rowIndex)} text-white hover:opacity-80`
                        }`}
                        disabled={seat.isOccupied}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Legend */}
          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">VIP 500₽</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Стандарт 400₽</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Эконом 300₽</span>
            </div>
          </div>

          <div className="flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <span className="text-sm text-gray-600">Выбрано</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-600">Занято</span>
            </div>
          </div>

          {/* Selected Seats Info */}
          {selectedSeats.length > 0 && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-900">Выбранные места</span>
                </div>
                <span className="font-medium text-blue-900">{getTotalPrice()} ₽</span>
              </div>
              <p className="text-sm text-blue-700">
                Места: {selectedSeats.join(', ')}
              </p>
              <p className="text-sm text-blue-700">
                {selectedDate} в {selectedTime}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Bar - Fixed Payment Button (above navigation) */}
      {selectedSeats.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-[100]">
          <Button 
            onClick={handleBooking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
          >
            <CreditCard size={20} className="mr-2" />
            Перейти к оплате • {getTotalPrice()} ₽
          </Button>
        </div>
      )}
    </div>
  );
}