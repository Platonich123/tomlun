import { ArrowLeft, User, Bell, CreditCard, Settings, LogOut, Gift, Star, Clock, MapPin, Phone, Mail, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

interface User {
  phoneNumber: string;
  name: string;
  email: string;
  city: string;
  address: string;
  totalClubHours?: number;
}

interface Order {
  id: string;
  type: 'cinema' | 'club' | 'food';
  status: 'active' | 'completed' | 'cancelled';
  title: string;
  subtitle: string;
  price: number;
  date: string;
  time: string;
  details?: any;
}

interface ProfileScreenProps {
  onBack: () => void;
  user: User | null;
  onLogout: () => void;
  orders: Order[];
  onNavigateToSettings: () => void;
}

export function ProfileScreen({ onBack, user, onLogout, orders, onNavigateToSettings }: ProfileScreenProps) {
  // Подсчитываем статистику на основе реальных заказов
  const completedOrders = orders.filter(order => order.status === 'completed');
  const cinemaOrders = completedOrders.filter(order => order.type === 'cinema').length;
  const foodOrders = completedOrders.filter(order => order.type === 'food').length;
  const totalClubHours = user?.totalClubHours || 0;

  const userStats = [
    { label: 'Фильмов просмотрено', value: cinemaOrders.toString(), icon: Star },
    { label: 'Заказов еды', value: foodOrders.toString(), icon: Gift },
    { label: 'Часов в клубе', value: totalClubHours.toString(), icon: Clock },
  ];

  const menuItems = [
    { 
      id: 'notifications', 
      icon: Bell, 
      label: 'Уведомления', 
      hasSwitch: true, 
      enabled: true 
    },
    { 
      id: 'payment', 
      icon: CreditCard, 
      label: 'Способы оплаты', 
      hasSwitch: false 
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Настройки', 
      hasSwitch: false 
    },
    { 
      id: 'support', 
      icon: Phone, 
      label: 'Поддержка', 
      hasSwitch: false 
    },
  ];

  const handleLogout = () => {
    if (window.confirm('Вы уверены, что хотите выйти из аккаунта?')) {
      onLogout();
    }
  };

  // Последние 3 завершенных заказа для отображения в "Последней активности"
  const recentActivity = completedOrders.slice(0, 3);

  const getActivityIcon = (orderType: string) => {
    switch (orderType) {
      case 'cinema': return { icon: Star, bgColor: 'bg-green-100', iconColor: 'text-green-600' };
      case 'food': return { icon: Gift, bgColor: 'bg-orange-100', iconColor: 'text-orange-600' };
      case 'club': return { icon: Clock, bgColor: 'bg-purple-100', iconColor: 'text-purple-600' };
      default: return { icon: Star, bgColor: 'bg-gray-100', iconColor: 'text-gray-600' };
    }
  };

  const formatActivityDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr.split('.').reverse().join('-')); // Конвертируем DD.MM.YYYY в YYYY-MM-DD
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Сегодня в ${timeStr}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера в ${timeStr}`;
    } else {
      return `${dateStr} в ${timeStr}`;
    }
  };

  const getActivityDescription = (order: Order) => {
    if (order.type === 'club' && order.details?.duration) {
      const duration = order.details.duration;
      const timeRange = order.details.startTime && order.details.endTime 
        ? `${order.details.startTime} - ${order.details.endTime}` 
        : '';
      return `${formatActivityDate(order.date, timeRange || order.time)} • ${duration} ч.`;
    }
    return formatActivityDate(order.date, order.time);
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 pt-8 pb-6 flex-shrink-0">
        <div className="flex items-center mb-6">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="ml-2 text-xl">Профиль</h1>
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-medium">{user?.name || 'Пользователь'}</h2>
            <p className="text-blue-100">{user?.email || 'email@example.com'}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-4 pb-24">
          {/* Stats */}
          {userStats.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {userStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="p-3 text-center bg-white border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <Icon size={20} className="text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-900 text-lg">{stat.value}</p>
                    <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <Card className="p-4 bg-white border-gray-100 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-3">Последняя активность</h3>
              <div className="space-y-3">
                {recentActivity.map(order => {
                  const { icon: ActivityIcon, bgColor, iconColor } = getActivityIcon(order.type);
                  return (
                    <div key={order.id} className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center`}>
                        <ActivityIcon size={16} className={iconColor} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{order.title}</p>
                        <p className="text-xs text-gray-600">{getActivityDescription(order)}</p>
                      </div>
                      <span className="text-sm text-gray-500">{order.price} ₽</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Personal Info */}
          {user && (
            <Card className="p-4 bg-white border-gray-100 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-3">Личная информация</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{user.email || 'email@example.com'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{user.phoneNumber || '+7 (xxx) xxx-xx-xx'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">Дата рождения: 15.03.1990</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-900">{user.city || 'Город не указан'}</span>
                </div>
                {user.address && (
                  <div className="flex items-center space-x-3">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{user.address}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Club Hours Breakdown */}
          {totalClubHours > 0 && (
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Clock size={16} className="text-purple-600 mr-2" />
                Время в клубе
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Всего часов:</span>
                  <span className="font-medium text-purple-600">{totalClubHours} ч.</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Активных бронирований:</span>
                  <span className="text-gray-900">
                    {orders.filter(o => o.type === 'club' && o.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Завершенных посещений:</span>
                  <span className="text-gray-900">
                    {orders.filter(o => o.type === 'club' && o.status === 'completed').length}
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Menu Items */}
          {menuItems.length > 0 && (
            <div className="space-y-2">
              {menuItems.map(item => {
                const Icon = item.icon;
                return (
                  <Card key={item.id} className="bg-white border-gray-100 shadow-sm">
                    <div 
                      className={`flex items-center justify-between p-4 ${!item.hasSwitch ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                      onClick={() => {
                        if (item.id === 'settings') {
                          console.log('Settings clicked!'); // Для отладки
                          onNavigateToSettings();
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Icon size={20} className="text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>
                      {item.hasSwitch ? (
                        <Switch defaultChecked={item.enabled} />
                      ) : (
                        <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Logout */}
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="w-full border-red-200 text-red-600 hover:bg-red-50 py-3"
          >
            <LogOut size={16} className="mr-2" />
            Выйти из аккаунта
          </Button>
        </div>
      </div>
    </div>
  );
}