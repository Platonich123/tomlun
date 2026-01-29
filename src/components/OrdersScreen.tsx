import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, XCircle, MapPin, Calendar, Users, Utensils, Film, Music, ShoppingCart } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Order {
  id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  order_type: string;
  total_price: number;
  status: string;
  payment_method?: string;
  delivery_address?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

interface OrdersScreenProps {
  onBack: () => void;
  onCancelOrder: (orderId: string) => void;
  user?: any; // Для авторизации
}

export function OrdersScreen({ onBack, onCancelOrder, user }: OrdersScreenProps) {
  const [activeTab, setActiveTab] = useState('current');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка заказов из базы данных
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        if (!user || !user.token) {
          console.log('❌ Пользователь не авторизован:', { user: !!user, token: !!user?.token });
          setError('Пользователь не авторизован');
          return;
        }
        
        console.log('🔐 Попытка загрузки заказов для пользователя:', user.id, 'с токеном:', user.token ? 'есть' : 'нет');

        const response = await fetch('http://localhost:3001/api/user/orders', {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const ordersData = await response.json();
          console.log('📦 Загружены заказы из базы данных:', ordersData);
          console.log('📦 Количество заказов:', ordersData.length);
          
          // Преобразуем заказы из базы данных в формат локальных заказов
          const formattedOrders = ordersData.map((dbOrder: any) => {
            console.log('🔄 Обрабатываем заказ:', dbOrder);
            return {
              id: dbOrder.id.toString(),
              type: dbOrder.order_type,
              status: dbOrder.status,
              title: dbOrder.order_type === 'cinema' ? 'Билет в кино' : 
                     dbOrder.order_type === 'club' ? 'Билет в клуб' : 
                     dbOrder.order_type === 'food' ? 'Заказ еды' : 'Заказ',
              subtitle: dbOrder.order_type === 'cinema' ? 'Кинотеатр' : 
                       dbOrder.order_type === 'club' ? 'Клуб' : 
                       dbOrder.order_type === 'food' ? 'Еда' : '',
              price: dbOrder.total_price,
              date: new Date(dbOrder.created_at).toLocaleDateString('ru-RU'),
              time: new Date(dbOrder.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
              details: dbOrder.details ? JSON.parse(dbOrder.details) : {}
            };
          });
          
          console.log('🔄 Форматированные заказы:', formattedOrders);
          setOrders(formattedOrders);
        } else {
          const errorText = await response.text();
          console.log('❌ Ошибка загрузки заказов, статус:', response.status);
          console.log('❌ Ответ сервера:', errorText);
          setError('Ошибка загрузки заказов');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Ошибка подключения к серверу');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const currentOrders = orders.filter(order => order.status === 'pending' || order.status === 'active');
  const historyOrders = orders.filter(order => order.status === 'completed' || order.status === 'cancelled');
  
  // Временно показываем все заказы как текущие для отладки
  const debugCurrentOrders = orders.length > 0 && currentOrders.length === 0 ? orders : currentOrders;
  
  console.log('🔍 Все заказы:', orders);
  console.log('📋 Текущие заказы:', currentOrders);
  console.log('📚 История заказов:', historyOrders);
  console.log('🔍 Активная вкладка:', activeTab);

  const getOrderIcon = (type: string) => {
    switch (type) {
      case 'cinema':
        return <Film size={20} className="text-blue-600" />;
      case 'club':
        return <Music size={20} className="text-purple-600" />;
      case 'food':
        return <Utensils size={20} className="text-orange-600" />;
      default:
        return <ShoppingCart size={20} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'В обработке';
      case 'active':
        return 'Активный';
      case 'completed':
        return 'Завершен';
      case 'paid':
        return 'Оплачен';
      case 'cancelled':
        return 'Отменен';
      default:
        return status;
    }
  };


  const getTypeText = (type: string) => {
    switch (type) {
      case 'cinema':
        return 'Кино';
      case 'club':
        return 'Клуб';
      case 'food':
        return 'Еда';
      default:
        return type;
    }
  };

  const canCancelOrder = (order: Order) => {
    if (order.status !== 'pending' && order.status !== 'active') return false;
    
    // Используем created_at для определения времени заказа
    const orderDateTime = new Date(order.created_at);
    const now = new Date();
    const hoursSinceOrder = (now.getTime() - orderDateTime.getTime()) / (1000 * 60 * 60);
    
    // Можно отменить в течение 24 часов после заказа
    return hoursSinceOrder < 24;
  };

  const renderOrderCard = (order: Order, showCancelButton: boolean = false) => (
    <Card key={order.id} className="bg-white border-gray-100 shadow-sm">
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            {getOrderIcon(order.order_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Заказ #{order.id}</h3>
                <p className="text-sm text-gray-600 mt-1">{getTypeText(order.order_type)}</p>
              </div>
              <div className="text-right ml-4">
                <p className="font-medium text-gray-900">{order.total_price} ₽</p>
                <Badge className={`text-xs mt-1 ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={12} />
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock size={12} />
                  <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getTypeText(order.order_type)}
                </Badge>
              </div>
              
              {showCancelButton && canCancelOrder(order) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCancelOrder(order.id.toString())}
                  className="text-red-600 border-red-200 hover:bg-red-50 text-xs px-3 py-1"
                >
                  Отменить
                </Button>
              )}
            </div>

            {/* Дополнительные детали заказа */}
            {order.details && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {order.type === 'food' && order.details.items && (
                  <div className="text-xs text-gray-600">
                    <p className="font-medium mb-2">Состав заказа:</p>
                    <div className="space-y-2">
                      {order.details.items.map((item: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-2 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800">• {item.name}</span>
                            <span className="text-gray-600">x{item.quantity}</span>
                          </div>
                          {item.addons && item.addons.length > 0 && (
                            <div className="ml-3 space-y-1">
                              <p className="text-xs text-gray-500">Дополнительно:</p>
                              {item.addons.map((addon: any, addonIndex: number) => (
                                <div key={addonIndex} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600">+ {addon.name}</span>
                                  <span className="text-gray-500">{addon.price} ₽</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-gray-200">
                            <span className="text-xs text-gray-500">Стоимость позиции:</span>
                            <span className="text-xs font-medium text-gray-700">{item.totalPrice} ₽</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {order.details.deliveryType === 'delivery' && order.details.address && (
                      <div className="flex items-center space-x-1 mt-3 pt-2 border-t border-gray-100">
                        <MapPin size={12} />
                        <span>Доставка: {order.details.address.street}</span>
                      </div>
                    )}
                    {order.details.deliveryType === 'pickup' && (
                      <div className="flex items-center space-x-1 mt-3 pt-2 border-t border-gray-100">
                        <MapPin size={12} />
                        <span>Самовывоз</span>
                      </div>
                    )}
                  </div>
                )}
                
                {order.type === 'cinema' && order.details.seats && (
                  <div className="text-xs text-gray-600">
                    <p><span className="font-medium">Места:</span> {order.details.seats.join(', ')}</p>
                    <p><span className="font-medium">Зал:</span> {order.details.hall || '1'}</p>
                  </div>
                )}
                
                {order.type === 'club' && order.details.tables && (
                  <div className="text-xs text-gray-600">
                    <p><span className="font-medium">Столики:</span> {order.details.tables.join(', ')}</p>
                    <p><span className="font-medium">Гостей:</span> {order.details.guests || 2}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="ml-2 text-xl text-gray-900">Мои заказы</h1>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="current" className="flex items-center space-x-2">
              <Clock size={16} />
              <span>Текущие</span>
              {currentOrders.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {currentOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <CheckCircle size={16} />
              <span>История</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Загрузка заказов...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <p className="text-gray-500 text-sm">Проверьте подключение к серверу</p>
            </div>
          </div>
        ) : (
          <Tabs value={activeTab} className="h-full">
            <TabsContent value="current" className="h-full">
              <div className="p-4 space-y-3 pb-8">
                {debugCurrentOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <ShoppingCart size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">Заказы отсутствуют</h3>
                  <p className="text-gray-600 text-sm">
                    Скоро здесь появится актуальный список заказов...
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Всего заказов: {orders.length}</p>
                </div>
              ) : (
                debugCurrentOrders.map(order => renderOrderCard(order, true))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="h-full">
            <div className="p-4 space-y-3 pb-8">
              {historyOrders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle size={32} className="text-gray-400" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">История заказов пуста</h3>
                  <p className="text-gray-600 text-sm">
                    Скоро здесь появится актуальная история заказов...
                  </p>
                </div>
              ) : (
                historyOrders.map(order => renderOrderCard(order, false))
              )}
            </div>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}