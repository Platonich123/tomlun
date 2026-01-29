import { useState, useEffect } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { FoodScreen } from './components/FoodScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { MovieDetailScreen } from './components/MovieDetailScreen';
import { CinemaBookingScreen } from './components/CinemaBookingScreen';
import { CinemaScreen } from './components/CinemaScreen';
import { PaymentScreen } from './components/PaymentScreen';
import { FoodItemDetailScreen } from './components/FoodItemDetailScreen';
import { FoodCheckoutScreen } from './components/FoodCheckoutScreen';
import { ClubBookingScreen } from './components/ClubBookingScreen';
import { ClubScreen } from './components/ClubScreen';
import { ClubEventDetailScreen } from './components/ClubEventDetailScreen';
import AdminPanel from './components/AdminPanel';
import { SettingsScreen } from './components/SettingsScreen';

// Временные заглушки для пользователя и заказов
const mockUser = {
  phoneNumber: '+7 900 000-00-00',
  name: 'Иван Иванов',
  email: 'ivan@example.com',
  city: 'Томлун',
  address: 'ул. 60 лет Октября, 8',
  totalClubHours: 12,
};
// Удаляем mockOrders, так как теперь заказы создаются динамически

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [activeSection, setActiveSection] = useState<'cinema' | 'club'>('cinema');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const userData = u ? JSON.parse(u) : null;
    
    // Добавляем токен к пользователю, если он есть
    if (userData && token && !userData.token) {
      userData.token = token;
    }
    
    console.log('🔍 DEBUG: Инициализация пользователя:', userData);
    console.log('🔍 DEBUG: role_id при инициализации =', userData?.role_id);
    console.log('🔍 DEBUG: токен при инициализации =', userData?.token ? 'есть' : 'нет');
    return userData;
  });
  const [showLogin, setShowLogin] = useState(!isAuthenticated);
  const [showRegister, setShowRegister] = useState(false);
  const [pendingAction, setPendingAction] = useState<{screen: string, data?: any} | null>(null);
  const [movieDetailData, setMovieDetailData] = useState<any>(null);
  const [cinemaBookingData, setCinemaBookingData] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [foodItemDetailData, setFoodItemDetailData] = useState<any>(null);
  const [cart, setCart] = useState<any[]>([]);
  const [foodCheckoutData, setFoodCheckoutData] = useState<any>(null);
  const [clubBookingData, setClubBookingData] = useState<any>(null);
  const [clubEventDetailData, setClubEventDetailData] = useState<any>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<{[key: string]: string[]}>({});

  // Загрузка занятых мест из базы данных при инициализации
  useEffect(() => {
    const loadOccupiedSeats = async () => {
      try {
        console.log('🎫 Загрузка занятых мест из БД...');
        
        // Получаем все активные билеты
        const response = await fetch('http://localhost:3001/api/cinema/sessions/1/occupied-seats');
        if (response.ok) {
          const occupiedTickets = await response.json();
          console.log('🎫 Загружены занятые билеты:', occupiedTickets);
          
          // Преобразуем в формат для локального состояния
          const seatsMap: {[key: string]: string[]} = {};
          
          // Для простоты используем фиксированный сеанс
          // В реальном приложении нужно получать данные по всем сеансам
          const sessionKey = 'Дюна: Часть вторая-28.09.2025-20:30';
          const seatNumbers = occupiedTickets.map((ticket: any) => {
            // Преобразуем номер места в формат A1, B2, etc.
            const row = String.fromCharCode(65 + Math.floor((ticket.seat_number - 1) / 12));
            const seat = ((ticket.seat_number - 1) % 12) + 1;
            return `${row}${seat}`;
          });
          
          seatsMap[sessionKey] = seatNumbers;
          setOccupiedSeats(seatsMap);
          
          console.log('🎫 Занятые места обновлены:', seatsMap);
        }
      } catch (error) {
        console.error('❌ Ошибка загрузки занятых мест:', error);
      }
    };

    loadOccupiedSeats();
  }, []);

  // Функция для обновления данных пользователя
  const handleUserUpdate = (updatedUser: any) => {
    console.log('Updating user data:', updatedUser); // Для отладки
    
    // Сохраняем токен, если он есть
    const token = localStorage.getItem('token');
    if (token && !updatedUser.token) {
      updatedUser.token = token;
    }
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Функция для обновления занятых мест из базы данных
  const refreshOccupiedSeats = async () => {
    try {
      console.log('🔄 Обновление занятых мест...');
      
      const response = await fetch('http://localhost:3001/api/cinema/sessions/1/occupied-seats');
      if (response.ok) {
        const occupiedTickets = await response.json();
        console.log('🎫 Обновлены занятые билеты:', occupiedTickets);
        
        // Преобразуем в формат для локального состояния
        const seatsMap: {[key: string]: string[]} = {};
        const sessionKey = 'Дюна: Часть вторая-28.09.2025-20:30';
        const seatNumbers = occupiedTickets.map((ticket: any) => {
          const row = String.fromCharCode(65 + Math.floor((ticket.seat_number - 1) / 12));
          const seat = ((ticket.seat_number - 1) % 12) + 1;
          return `${row}${seat}`;
        });
        
        seatsMap[sessionKey] = seatNumbers;
        setOccupiedSeats(seatsMap);
        
        console.log('🎫 Занятые места обновлены:', seatsMap);
      }
    } catch (error) {
      console.error('❌ Ошибка обновления занятых мест:', error);
    }
  };

  // Тёмная тема для клубной секции и всех связанных экранов
  const isDarkTheme = (activeTab === 'home' && activeSection === 'club') || 
                     activeTab === 'club' || 
                     activeTab === 'club-event-detail' || 
                     activeTab === 'club-booking';

  // Управление переходами между экранами (можно расширять)
  const handleNavigate = (tab: string, data?: any) => {
    if (tab === 'movie-detail') {
      setMovieDetailData(data);
      setActiveTab('movie-detail');
      return;
    }
    if (tab === 'cinema-booking') {
      setCinemaBookingData(data);
      setActiveTab('cinema-booking');
      return;
    }
    if (tab === 'club-booking') {
      setClubBookingData(data);
      setActiveTab('club-booking');
      return;
    }
    if (tab === 'club-event-detail') {
      setClubEventDetailData(data);
      setActiveTab('club-event-detail');
      return;
    }
    if (tab === 'payment') {
      setPaymentData(data);
      setActiveTab('payment');
      return;
    }
    if (tab === 'food-item-detail') {
      setFoodItemDetailData(data);
      setActiveTab('food-item-detail');
      return;
    }
    if (tab === 'food-checkout') {
      setFoodCheckoutData(data);
      setActiveTab('food-checkout');
      return;
    }
    if (tab === 'settings') {
      console.log('Navigating to settings...'); // Для отладки
      setActiveTab('settings');
      return;
    }
    setActiveTab(tab);
    // Можно добавить обработку data, если потребуется
  };

  // Для возврата назад (например, из FoodScreen)
  const handleBack = () => {
    console.log('handleBack called, setting activeTab to home');
    setActiveTab('home');
  };

  // Централизованный показ логина с возвратом к действию
  const showLoginWithReturn = (screen: string, data?: any) => {
    setPendingAction({ screen, data });
    setShowLogin(true);
    setShowRegister(false);
  };

  // handleLogin теперь возвращает к действию, если оно было
  const handleLogin = () => {
    setIsAuthenticated(true);
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    console.log('🔍 DEBUG: Данные пользователя из localStorage:', userData);
    console.log('🔍 DEBUG: role_id из localStorage =', userData?.role_id);
    setUser(userData);
    setShowLogin(false);
    setShowRegister(false);
    if (pendingAction) {
      setTimeout(() => {
        handleNavigate(pendingAction.screen, pendingAction.data);
        setPendingAction(null);
      }, 0);
    }
  };

  // Логаут
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    setShowLogin(true);
    setActiveTab('home');
  };

  // Показать регистрацию
  const handleShowRegister = () => {
    setShowRegister(true);
    setShowLogin(false);
  };
  // Показать логин
  const handleShowLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  // Добавляем заказ в историю после успешной оплаты
  const handlePaymentSuccess = async (orderData: any) => {
    const now = new Date();
    
    // Определяем заголовок заказа
    let title = 'Заказ';
    if (orderData.type === 'food') {
      title = orderData.items && orderData.items.length > 0 
        ? orderData.items[0].name + (orderData.items.length > 1 ? ` и еще ${orderData.items.length - 1}` : '')
        : 'Заказ еды';
    } else if (orderData.type === 'cinema') {
      title = orderData.movieTitle || 'Билет в кино';
    } else if (orderData.type === 'club') {
      title = orderData.eventTitle || 'Билет в клуб';
    }
    
    // Обрабатываем данные о местах для кино
    let processedOrderData = { ...orderData };
    if (orderData.type === 'cinema' && orderData.seats) {
      processedOrderData.details = {
        ...orderData,
        seats: orderData.seats, // Сохраняем массив мест
        hall: orderData.hall || '1'
      };
    }
    
    // Обрабатываем данные о столиках для клуба
    if (orderData.type === 'club' && orderData.tables) {
      processedOrderData.details = {
        ...orderData,
        tables: orderData.tables,
        guests: orderData.guests || 2
      };
    }
    
    const newOrder = {
      id: `${Date.now()}`,
      type: orderData.type || 'food',
      status: 'active', // Заказы создаются как активные
      title,
      subtitle: orderData.type === 'food' ? (orderData.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз') : 
               orderData.type === 'cinema' ? 'Кинотеатр' : 
               orderData.type === 'club' ? 'Клуб' : '',
      price: orderData.totalPrice,
      date: orderData.date || now.toLocaleDateString('ru-RU'),
      time: orderData.time || now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      details: processedOrderData
    };
    
    // Если это заказ кино, добавляем места в список занятых
    if (orderData.type === 'cinema' && orderData.seats) {
      const sessionKey = `${orderData.movieTitle}-${orderData.date}-${orderData.time}`;
      setOccupiedSeats(prev => ({
        ...prev,
        [sessionKey]: [...(prev[sessionKey] || []), ...orderData.seats]
      }));
    }
    
    // Сохраняем заказ в базе данных
    try {
      if (user && user.token) {
        const response = await fetch('http://localhost:3001/api/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_type: orderData.type || 'food',
            total_price: parseFloat(orderData.totalPrice),
            status: 'active',
            details: processedOrderData
          })
        });
        
        if (response.ok) {
          const savedOrder = await response.json();
          console.log('✅ Заказ сохранен в базе данных:', savedOrder);
          
          // Если это заказ кино, создаем билеты в базе данных
          if (orderData.type === 'cinema' && orderData.seats) {
            console.log('🎫 Создание билетов для заказа кино...');
            console.log('⚠️ Временно отключено создание билетов - нет активных сеансов');
            
            // TODO: Восстановить создание билетов когда будут активные сеансы
            // for (const seat of orderData.seats) {
            //   // Создание билетов
            // }
            
            // Обновляем занятые места после создания всех билетов
            // await refreshOccupiedSeats();
          }
        } else {
          const errorData = await response.json();
          console.error('❌ Ошибка сохранения заказа в базе данных:', errorData);
        }
      }
    } catch (error) {
      console.error('❌ Ошибка при сохранении заказа:', error);
    }
    
    setOrders(prev => {
      const updatedOrders = [newOrder, ...prev];
      console.log('📦 Локальные заказы обновлены:', updatedOrders);
      return updatedOrders;
    });
    
    // Очищаем корзину после успешного заказа еды
    if (orderData.type === 'food') {
      setCart([]);
    }
    
    setActiveTab('orders');
    return newOrder.id;
  };

  // Функция отмены заказа
  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        // Если отменяем заказ кино, освобождаем места
        if (order.type === 'cinema' && order.details?.seats) {
          const sessionKey = `${order.details.movieTitle}-${order.date}-${order.time}`;
          setOccupiedSeats(prevSeats => {
            const newSeats = { ...prevSeats };
            if (newSeats[sessionKey]) {
              newSeats[sessionKey] = newSeats[sessionKey].filter(
                seat => !order.details.seats.includes(seat)
              );
              if (newSeats[sessionKey].length === 0) {
                delete newSeats[sessionKey];
              }
            }
            return newSeats;
          });
        }
        return { ...order, status: 'cancelled' };
      }
      return order;
    }));
  };

  // Функция для автоматического обновления статусов заказов
  const updateOrderStatuses = () => {
    const now = new Date();
    
    setOrders(prev => prev.map(order => {
      if (order.status !== 'active') return order;
      
      // Для заказов еды - помечаем как завершенные через 30 минут
      if (order.type === 'food') {
        const orderDateTime = new Date(`${order.date} ${order.time}`);
        const minutesSinceOrder = (now.getTime() - orderDateTime.getTime()) / (1000 * 60);
        
        if (minutesSinceOrder > 30) {
          return { ...order, status: 'completed' };
        }
      }
      
      // Для кино - помечаем как завершенные после окончания сеанса (сеанс длится ~2.5 часа)
      if (order.type === 'cinema') {
        // Парсим дату в формате DD.MM.YYYY
        let orderDateTime;
        if (order.date.includes('.')) {
          const [day, month, year] = order.date.split('.');
          orderDateTime = new Date(`${year}-${month}-${day} ${order.time}`);
        } else {
          orderDateTime = new Date(`${order.date} ${order.time}`);
        }
        
        const hoursAfterEvent = (now.getTime() - orderDateTime.getTime()) / (1000 * 60 * 60);
        
        // Помечаем как завершенный только после окончания сеанса (2.5 часа после начала)
        if (hoursAfterEvent > 2.5) {
          // Освобождаем места при завершении сеанса
          if (order.details?.seats) {
            const sessionKey = `${order.details.movieTitle}-${order.date}-${order.time}`;
            setOccupiedSeats(prevSeats => {
              const newSeats = { ...prevSeats };
              if (newSeats[sessionKey]) {
                newSeats[sessionKey] = newSeats[sessionKey].filter(
                  seat => !order.details.seats.includes(seat)
                );
                if (newSeats[sessionKey].length === 0) {
                  delete newSeats[sessionKey];
                }
              }
              return newSeats;
            });
          }
          return { ...order, status: 'completed' };
        }
      }
      
      // Для клуба - помечаем как завершенные после окончания мероприятия
      if (order.type === 'club') {
        // Парсим дату в формате DD.MM.YYYY
        let orderDateTime;
        if (order.date.includes('.')) {
          const [day, month, year] = order.date.split('.');
          orderDateTime = new Date(`${year}-${month}-${day} ${order.time}`);
        } else {
          orderDateTime = new Date(`${order.date} ${order.time}`);
        }
        
        const hoursAfterEvent = (now.getTime() - orderDateTime.getTime()) / (1000 * 60 * 60);
        
        // Мероприятия в клубе обычно длятся дольше
        if (hoursAfterEvent > 4) {
          return { ...order, status: 'completed' };
        }
      }
      
      return order;
    }));
  };

  // Проверяем статусы заказов каждую минуту
  useEffect(() => {
    const interval = setInterval(updateOrderStatuses, 60000); // каждую минуту
    updateOrderStatuses(); // и сразу при загрузке
    
    return () => clearInterval(interval);
  }, []);

  // Добавить товар в корзину
  const addToCart = (item: any, quantity: number, addons: any[]) => {
    const addonsPrice = addons.reduce((sum: number, addon: any) => sum + addon.price, 0);
    const totalPrice = (item.price + addonsPrice) * quantity;
    const cartItem = {
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      price: item.price,
      quantity,
      addons,
      basePrice: item.price,
      totalPrice,
      image: item.image,
      description: item.description
    };
    setCart(prev => [...prev, cartItem]);
  };

  let content = null;
  // Основной контент всегда доступен
  if (activeTab === 'home') {
    content = (
      <HomeScreen 
        onNavigate={(screen, data) => {
          if ((screen === 'cinema-booking' || screen === 'club-booking') && !isAuthenticated) {
            showLoginWithReturn(screen, data);
          } else {
            handleNavigate(screen, data);
          }
        }} 
        homeTheme={activeSection} 
        isAuthenticated={isAuthenticated}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
    );
  } else if (activeTab === 'movie-detail') {
    content = (
      <MovieDetailScreen
        onBack={handleBack}
        onNavigate={handleNavigate}
        movieData={movieDetailData}
      />
    );
  } else if (activeTab === 'cinema') {
    content = (
      <CinemaScreen
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    );
  } else if (activeTab === 'club') {
    content = (
      <ClubScreen
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
    );
  } else if (activeTab === 'club-event-detail') {
    content = (
      <ClubEventDetailScreen
        onBack={handleBack}
        onNavigate={handleNavigate}
        eventData={clubEventDetailData}
      />
    );
  } else if (activeTab === 'cinema-booking') {
    content = (
      <CinemaBookingScreen
        onBack={handleBack}
        onNavigate={handleNavigate}
        movieData={cinemaBookingData}
        occupiedSeats={occupiedSeats}
      />
    );
  } else if (activeTab === 'club-booking') {
    content = (
      <ClubBookingScreen
        onBack={handleBack}
        onNavigate={handleNavigate}
        eventData={clubBookingData}
      />
    );
  } else if (activeTab === 'payment') {
    content = (
      <PaymentScreen
        onBack={handleBack}
        onNavigate={handleNavigate}
        bookingData={paymentData}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  } else if (activeTab === 'food') {
    content = (
      <FoodScreen 
        onBack={handleBack} 
        onNavigate={(screen, data) => {
          if (screen === 'food-checkout' && !isAuthenticated) {
            showLoginWithReturn(screen, data);
          } else {
            handleNavigate(screen, data);
          }
        }} 
        isAuthenticated={isAuthenticated} 
        cart={cart}
        setCart={setCart}
      />
    );
  } else if (activeTab === 'orders') {
    console.log('📋 Переход на вкладку заказов, пользователь:', user);
    content = (
      <OrdersScreen onBack={handleBack} onCancelOrder={handleCancelOrder} user={user} />
    );
  } else if (activeTab === 'profile') {
    if (!isAuthenticated) {
      if (showRegister) {
        content = <RegisterScreen onBack={handleShowLogin} onClose={() => setShowRegister(false)} />;
      } else {
        content = <LoginScreen onLogin={handleLogin} onNavigate={(screen) => {
          if (screen === 'register') handleShowRegister();
        }} onClose={() => {}} />;
      }
    } else {
      // Проверяем роль пользователя
      console.log('🔍 DEBUG: Проверяем пользователя:', user);
      console.log('🔍 DEBUG: role_id =', user?.role_id);
      console.log('🔍 DEBUG: user.role_id === 2 =', user?.role_id === 2);
      
      if (user && user.role_id === 2) {
        console.log('✅ Показываем админ панель');
        content = <AdminPanel onLogout={handleLogout} user={user} />;
      } else {
        console.log('❌ Показываем обычный профиль');
        content = (
          <ProfileScreen 
            onBack={handleBack} 
            user={user} 
            onLogout={handleLogout} 
            orders={orders}
            onNavigateToSettings={() => handleNavigate('settings')}
          />
        );
      }
    }
  } else if (activeTab === 'food-item-detail') {
    content = (
      <FoodItemDetailScreen
        onBack={() => setActiveTab('food')}
        onAddToCart={(item, quantity, addons) => {
          addToCart(item, quantity, addons);
          setActiveTab('food');
        }}
        itemData={foodItemDetailData}
      />
    );
  } else if (activeTab === 'food-checkout') {
    content = (
      <FoodCheckoutScreen
        onBack={() => setActiveTab('food')}
        onNavigate={(screen, data) => {
          if (screen === 'payment') {
            handleNavigate('payment', data);
          } else {
            handleNavigate(screen, data);
          }
        }}
        cartData={foodCheckoutData}
      />
    );
  } else if (activeTab === 'settings') {
    content = (
      <SettingsScreen
        onBack={handleBack}
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    );
  }

  return (
    <div className="phone-frame">
      <div className="notch" />
      <div className={`mobile-container flex flex-col${isDarkTheme ? ' dark' : ''}` }>
        <div className="flex flex-col overflow-y-auto" style={{ minHeight: 'calc(100vh - 56px)' }}>
          {content}
        </div>
        {activeTab !== 'payment' && (
          <div className="fixed bottom-0 left-0 w-full z-50">
            <BottomNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isDarkTheme={isDarkTheme}
              isAuthenticated={isAuthenticated}
            />
          </div>
        )}
      </div>
    </div>
  );
}
