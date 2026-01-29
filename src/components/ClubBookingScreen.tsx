import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, Users, MapPin, Music, Star, Ticket, Table } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ClubBookingScreenProps {
  onBack: (screen?: string) => void;
  onNavigate: (screen: string, data?: any) => void;
  eventData?: any;
}

export function ClubBookingScreen({ onBack, onNavigate, eventData }: ClubBookingScreenProps) {
  const [bookingType, setBookingType] = useState<'dancefloor' | 'table'>('dancefloor');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  const availableDates = [
    { date: '2025-07-19', label: 'Сегодня' },
    { date: '2025-07-20', label: 'Завтра' },
    { date: '2025-07-21', label: 'Вс 21 июля' },
    { date: '2025-07-26', label: 'Пт 26 июля' },
    { date: '2025-07-27', label: 'Сб 27 июля' }
  ];

  const startTimeSlots = [
    { time: '20:00', available: true, price: 1500 },
    { time: '21:00', available: true, price: 2000 },
    { time: '22:00', available: true, price: 2500 },
    { time: '23:00', available: false, price: 3000 },
    { time: '00:00', available: true, price: 3500 }
  ];

  const endTimeSlots = [
    { time: '22:00', available: true },
    { time: '23:00', available: true },
    { time: '00:00', available: true },
    { time: '01:00', available: true },
    { time: '02:00', available: true },
    { time: '03:00', available: true },
    { time: '04:00', available: true },
    { time: '05:00', available: true },
    { time: '06:00', available: true }
  ];

  const tables = [
    { id: 1, capacity: 4, type: 'VIP', price: 5000, available: true, position: 'У сцены' },
    { id: 2, capacity: 2, type: 'Стандарт', price: 2000, available: true, position: 'У бара' },
    { id: 3, capacity: 6, type: 'VIP', price: 8000, available: false, position: 'У сцены' },
    { id: 4, capacity: 4, type: 'Стандарт', price: 3000, available: true, position: 'В центре' },
    { id: 5, capacity: 2, type: 'VIP', price: 3500, available: true, position: 'У окна' },
    { id: 6, capacity: 8, type: 'Премиум', price: 12000, available: true, position: 'Приватная зона' }
  ];

  const dancefloorPrice = 800; // Фиксированная цена за танцпол
  const dancefloorDuration = 5; // Стандартная продолжительность для танцпола в часах

  const toggleTable = (tableId: number) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const calculateHours = () => {
    if (bookingType === 'dancefloor') {
      return dancefloorDuration; // Фиксированное время для танцпола
    }
    
    if (!selectedStartTime || !selectedEndTime) return 0;
    
    const parseTime = (timeStr: string) => {
      const [hours] = timeStr.split(':').map(Number);
      return hours;
    };
    
    let startHour = parseTime(selectedStartTime);
    let endHour = parseTime(selectedEndTime);
    
    // Если время окончания меньше времени начала, значит переходим на следующий день
    if (endHour <= startHour) {
      endHour += 24;
    }
    
    return endHour - startHour;
  };

  const getFilteredEndTimes = () => {
    if (!selectedStartTime) return [];
    
    const startHour = parseInt(selectedStartTime.split(':')[0]);
    
    return endTimeSlots.filter(slot => {
      const endHour = parseInt(slot.time.split(':')[0]);
      // Показываем времена, которые больше времени начала или это следующий день (раннее утро)
      return endHour > startHour || endHour <= 6;
    });
  };

  const getTotalPrice = () => {
    if (bookingType === 'dancefloor') {
      return dancefloorPrice * guestCount; // Цена за каждого гостя на танцполе
    }

    const tablePrice = selectedTables.reduce((sum, tableId) => {
      const table = tables.find(t => t.id === tableId);
      return sum + (table ? table.price : 0);
    }, 0);

    const startTimeSlot = startTimeSlots.find(slot => slot.time === selectedStartTime);
    const timePrice = startTimeSlot ? startTimeSlot.price : 0;
    
    // Добавляем стоимость за каждый дополнительный час
    const hours = calculateHours();
    const additionalHourPrice = Math.max(0, hours - 1) * 500; // 500₽ за каждый час сверх первого

    return tablePrice + timePrice + additionalHourPrice;
  };

  const canProceed = () => {
    if (bookingType === 'dancefloor') {
      return selectedDate && guestCount > 0;
    }
    return selectedDate && selectedStartTime && selectedEndTime && selectedTables.length > 0;
  };

  const handleContinue = () => {
    const hours = calculateHours();
    
    if (bookingType === 'dancefloor') {
      const bookingData = {
        type: 'club',
        subType: 'dancefloor',
        eventTitle: eventData?.title || 'Билет на танцпол',
        date: selectedDate,
        time: 'Вход до 23:00',
        duration: hours,
        guests: guestCount,
        totalPrice: getTotalPrice(),
        specialRequests
      };
      onNavigate('payment', bookingData);
    } else {
      const bookingData = {
        type: 'club',
        subType: 'table',
        eventTitle: eventData?.title || 'Бронирование столика',
        date: selectedDate,
        startTime: selectedStartTime,
        endTime: selectedEndTime,
        duration: hours,
        time: `${selectedStartTime} - ${selectedEndTime}`,
        tables: selectedTables,
        guests: guestCount,
        totalPrice: getTotalPrice(),
        specialRequests,
        tableDetails: selectedTables.map(id => tables.find(t => t.id === id)).filter(Boolean)
      };
      onNavigate('payment', bookingData);
    }
  };

  const handleBookingTypeChange = (type: 'dancefloor' | 'table') => {
    setBookingType(type);
    // Сбрасываем связанные состояния при смене типа
    setSelectedStartTime('');
    setSelectedEndTime('');
    setSelectedTables([]);
    if (type === 'dancefloor') {
      setGuestCount(1);
    } else {
      setGuestCount(2);
    }
  };

  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="bg-background px-4 pt-8 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => onBack('home')}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="ml-2 text-xl text-foreground">
            {bookingType === 'dancefloor' ? 'Билет на танцпол' : 'Бронирование столика'}
          </h1>
        </div>

        {eventData && (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Music size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-card-foreground">{eventData.title}</h3>
                <p className="text-sm text-muted-foreground">{eventData.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className="bg-purple-600 text-white text-xs">
                    {eventData.genre}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star size={12} className="text-yellow-500" />
                    <span className="text-xs text-muted-foreground">DJ {eventData.dj}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-6 pb-48">
          {/* Booking Type Selection */}
          <div>
            <h3 className="font-medium text-foreground mb-3">Тип посещения</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-colors border ${
                  bookingType === 'dancefloor'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-border bg-card hover:border-purple-500/50'
                }`}
                onClick={() => handleBookingTypeChange('dancefloor')}
              >
                <div className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    bookingType === 'dancefloor' ? 'bg-purple-600' : 'bg-purple-100'
                  }`}>
                    <Ticket size={24} className={bookingType === 'dancefloor' ? 'text-white' : 'text-purple-600'} />
                  </div>
                  <h4 className="font-medium text-card-foreground">Танцпол</h4>
                  <p className="text-xs text-muted-foreground mt-1">от {dancefloorPrice} ₽</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Вход до 23:00</p>
                </div>
              </Card>
              
              <Card 
                className={`cursor-pointer transition-colors border ${
                  bookingType === 'table'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-border bg-card hover:border-purple-500/50'
                }`}
                onClick={() => handleBookingTypeChange('table')}
              >
                <div className="p-4 text-center">
                  <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    bookingType === 'table' ? 'bg-purple-600' : 'bg-purple-100'
                  }`}>
                    <Table size={24} className={bookingType === 'table' ? 'text-white' : 'text-purple-600'} />
                  </div>
                  <h4 className="font-medium text-card-foreground">Столик</h4>
                  <p className="text-xs text-muted-foreground mt-1">от 2000 ₽</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Выбор времени</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Calendar size={16} className="text-purple-400" />
              <h3 className="font-medium text-foreground">Выберите дату</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availableDates.map(dateOption => (
                <button
                  key={dateOption.date}
                  onClick={() => setSelectedDate(dateOption.date)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedDate === dateOption.date
                      ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                      : 'border-border bg-card text-card-foreground hover:border-purple-500/50'
                  }`}
                >
                  <p className="font-medium">{dateOption.label}</p>
                  <p className="text-xs text-muted-foreground">{dateOption.date}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Dancefloor Options */}
          {bookingType === 'dancefloor' && selectedDate && (
            <div className="space-y-6">
              {/* Guest Count */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Users size={16} className="text-purple-400" />
                  <h3 className="font-medium text-foreground">Количество билетов</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                    className="w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent text-foreground"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">{guestCount}</span>
                  <button
                    onClick={() => setGuestCount(guestCount + 1)}
                    className="w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent text-foreground"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {dancefloorPrice} ₽ × {guestCount} = {getTotalPrice()} ₽
                </p>
              </div>

              {/* Special Requests */}
              <div>
                <Label htmlFor="specialRequests" className="text-foreground">Особые пожелания</Label>
                <Input
                  id="specialRequests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Например: поздравление с днем рождения..."
                  className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/* Dancefloor Info */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <div className="p-4">
                  <h3 className="font-medium text-purple-900 dark:text-purple-100 mb-2 flex items-center">
                    <Ticket size={16} className="mr-2" />
                    Билет на танцпол
                  </h3>
                  <div className="space-y-1 text-sm text-purple-700 dark:text-purple-300">
                    <p>• Вход в клуб до 23:00</p>
                    <p>• Доступ к танцполу и бару</p>
                    <p>• Без ограничения времени</p>
                    <p>• Дресс-код: smart casual</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Table Booking Options */}
          {bookingType === 'table' && selectedDate && (
            <>
              {/* Start Time Selection */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Clock size={16} className="text-purple-400" />
                  <h3 className="font-medium text-foreground">Время начала</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {startTimeSlots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => {
                        if (slot.available) {
                          setSelectedStartTime(slot.time);
                          setSelectedEndTime(''); // Сбрасываем время окончания
                        }
                      }}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedStartTime === slot.time
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                          : slot.available
                            ? 'border-border bg-card text-card-foreground hover:border-purple-500/50'
                            : 'border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <p className="font-medium">{slot.time}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.available ? `${slot.price} ₽` : 'Занято'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* End Time Selection */}
              {selectedStartTime && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Clock size={16} className="text-purple-400" />
                    <h3 className="font-medium text-foreground">Время окончания</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {getFilteredEndTimes().map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedEndTime(slot.time)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg border text-center transition-colors ${
                          selectedEndTime === slot.time
                            ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                            : slot.available
                              ? 'border-border bg-card text-card-foreground hover:border-purple-500/50'
                              : 'border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <p className="font-medium">{slot.time}</p>
                        {selectedEndTime === slot.time && calculateHours() > 0 && (
                          <p className="text-xs text-purple-400">
                            {calculateHours()} ч.
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {selectedEndTime && (
                    <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-purple-700 dark:text-purple-300">
                        <Clock size={14} className="inline mr-1" />
                        Продолжительность: {calculateHours()} {calculateHours() === 1 ? 'час' : calculateHours() < 5 ? 'часа' : 'часов'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Table Selection */}
              {selectedEndTime && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <MapPin size={16} className="text-purple-400" />
                    <h3 className="font-medium text-foreground">Выберите столик</h3>
                  </div>
                  <div className="space-y-3">
                    {tables.map(table => (
                      <Card 
                        key={table.id}
                        className={`cursor-pointer transition-colors border ${
                          selectedTables.includes(table.id)
                            ? 'border-purple-500 bg-purple-500/10'
                            : table.available
                              ? 'border-border bg-card hover:border-purple-500/50'
                              : 'border-border bg-muted opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => table.available && toggleTable(table.id)}
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-card-foreground">Столик #{table.id}</h4>
                                <Badge 
                                  className={`text-xs ${
                                    table.type === 'VIP' 
                                      ? 'bg-purple-600 text-white' 
                                      : table.type === 'Премиум'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-600 text-white'
                                  }`}
                                >
                                  {table.type}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Users size={12} />
                                  <span>до {table.capacity} гостей</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin size={12} />
                                  <span>{table.position}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-foreground">{table.price} ₽</p>
                              <p className="text-xs text-muted-foreground">
                                {table.available ? 'Доступен' : 'Занят'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Guest Count and Special Requests for Tables */}
              {selectedTables.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <Users size={16} className="text-purple-400" />
                      <h3 className="font-medium text-foreground">Количество гостей</h3>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                        className="w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent text-foreground"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium text-foreground">{guestCount}</span>
                      <button
                        onClick={() => setGuestCount(guestCount + 1)}
                        className="w-10 h-10 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent text-foreground"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialRequests" className="text-foreground">Особые пожелания</Label>
                    <Input
                      id="specialRequests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Например: бутылка шампанского, торт..."
                      className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Summary */}
          {canProceed() && (
            <Card className="bg-card border-border">
              <div className="p-4">
                <h3 className="font-medium text-card-foreground mb-3">Итого</h3>
                <div className="space-y-2 text-sm">
                  {bookingType === 'dancefloor' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Билеты на танцпол ({guestCount})</span>
                        <span className="text-foreground">{getTotalPrice()} ₽</span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between font-medium">
                        <span className="text-foreground">Общая стоимость</span>
                        <span className="text-foreground">{getTotalPrice()} ₽</span>
                      </div>
                      <div className="flex justify-between text-purple-600 dark:text-purple-400">
                        <span className="text-sm">Вход до 23:00 • {calculateHours()} ч.</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Столики ({selectedTables.length})</span>
                        <span className="text-foreground">
                          {selectedTables.reduce((sum, tableId) => {
                            const table = tables.find(t => t.id === tableId);
                            return sum + (table ? table.price : 0);
                          }, 0)} ₽
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Время входа</span>
                        <span className="text-foreground">
                          {startTimeSlots.find(slot => slot.time === selectedStartTime)?.price || 0} ₽
                        </span>
                      </div>
                      {calculateHours() > 1 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Доп. часы ({calculateHours() - 1})</span>
                          <span className="text-foreground">
                            {(calculateHours() - 1) * 500} ₽
                          </span>
                        </div>
                      )}
                      <div className="border-t border-border pt-2 flex justify-between font-medium">
                        <span className="text-foreground">Общая стоимость</span>
                        <span className="text-foreground">{getTotalPrice()} ₽</span>
                      </div>
                      <div className="flex justify-between text-purple-600 dark:text-purple-400">
                        <span className="text-sm">Бронь на {calculateHours()} ч. ({selectedStartTime} - {selectedEndTime})</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Bottom Bar - Fixed Payment Button (above navigation) */}
      {canProceed() && (
        <div className="fixed bottom-20 left-0 right-0 bg-background border-t border-border p-4 shadow-lg z-[100]">
          <Button 
            onClick={handleContinue}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg font-semibold"
          >
            <CreditCard size={20} className="mr-2" />
            Продолжить • {getTotalPrice()} ₽ • {calculateHours()} ч.
          </Button>
        </div>
      )}
    </div>
  );
}