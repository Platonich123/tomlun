import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Film, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Eye,
  EyeOff,
  Calendar,
  Mail,
  Phone,
  MapPin,
  User,
  Star,
  Clock,
  Tag,
  DollarSign,
  ShoppingCart,
  Play,
  TrendingUp,
  Bell,
  CreditCard,
  XCircle,
  CheckCircle,
  Music,
  Utensils
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ImageUpload } from './ui/image-upload';
import { KotlinIntegration } from './KotlinIntegration';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { FinanceScreen } from './FinanceScreen';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  role_id: number;
  created_at: string;
  updated_at: string;
}

interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number | null;
  rating: number | null;
  description: string;
  posterUrl: string;
}

interface Stats {
  totalUsers: number;
  totalMovies: number;
  totalEvents: number;
  totalOrders: number;
  recentUsers: number;
}

interface Session {
  id: number;
  movie_id: number;
  movie_title: string;
  date: string;
  time: string;
  hall: string;
  price: number;
  capacity: number;
  booked_seats: number;
  status: string;
}

interface Order {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  order_type: string;
  total_price: number;
  status: string;
  created_at: string;
}

interface FinanceData {
  overview: {
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
  };
  daily: Array<{
    date: string;
    orders_count: number;
    daily_revenue: number;
  }>;
  byType: Array<{
    order_type: string;
    count: number;
    revenue: number;
  }>;
}

interface AdminPanelProps {
  onLogout: () => void;
  user: any;
}

interface SessionTemplate {
  id: number;
  name: string;
  description: string;
  default_hall: string;
  default_price: number;
  default_capacity: number;
  time_slots: string[];
  days_of_week: number[];
  is_active: boolean;
  created_at: string;
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

interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  image_url?: string;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminPanel({ onLogout, user }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState('movies');
  const [users, setUsers] = useState<User[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showMovieModal, setShowMovieModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingEvent, setEditingEvent] = useState<ClubEvent | null>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    role_id: 1
  });
  const [movieForm, setMovieForm] = useState({
    title: '',
    genre: '',
    duration: '',
    rating: '',
    description: '',
    posterUrl: ''
  });
  const [sessionForm, setSessionForm] = useState({
    movie_id: '',
    date: '',
    time: '',
    hall: '',
    price: '',
    capacity: ''
  });
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    dj_name: '',
    event_date: '',
    event_time: '',
    price: '',
    genre: '',
    image_url: ''
  });
  const [templates, setTemplates] = useState<SessionTemplate[]>([]);
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [eventsCount, setEventsCount] = useState<number>(0);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [foodLoadingError, setFoodLoadingError] = useState<string | null>(null);
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [foodForm, setFoodForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    is_available: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedMoviePosterFile, setSelectedMoviePosterFile] = useState<File | null>(null);
  const [selectedEventImageFile, setSelectedEventImageFile] = useState<File | null>(null);

  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Логируем токен и пользователя для диагностики
  console.log('🔑 Токен авторизации:', token ? `${token.substring(0, 20)}...` : 'отсутствует');
  console.log('👤 Пользователь:', currentUser);
  console.log('🔐 Роль пользователя:', currentUser.role_id);

  // Функция для загрузки мероприятий
  const loadEvents = async () => {
    try {
      console.log('🎉 Загружаем мероприятия...');
      
      if (!token) {
        console.error('❌ Токен авторизации отсутствует');
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/admin/events', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 секунд таймаут
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const eventsData = await response.json();
      console.log('🎉 Мероприятия загружены:', eventsData.length, 'записей');
      setEvents(eventsData);
      setEventsCount(eventsData.length);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          console.warn('⚠️ Запрос мероприятий отменен по таймауту');
        } else {
          console.error('💥 Критическая ошибка загрузки мероприятий:', error.message);
        }
      } else {
        console.error('💥 Неизвестная ошибка загрузки мероприятий:', error);
      }
    }
  };

  // Функция для получения названия категории
  const getCategoryName = (categoryId: number) => {
    switch (categoryId) {
      case 1:
        return 'Фаст-фуд';
      case 2:
        return 'Ресторан';
      default:
        return `Категория ${categoryId}`;
    }
  };

  // Функция для загрузки еды
  const loadFood = async () => {
    try {
      setFoodLoadingError(null); // Сбрасываем ошибку
      console.log('🍕 Загружаем еду...');
      
      if (!token) {
        console.error('❌ Токен авторизации отсутствует');
        setFoodLoadingError('Ошибка авторизации');
        return;
      }
      
      const response = await fetch('http://localhost:3001/api/admin/food', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 секунд таймаут
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const foodData = await response.json();
      console.log('🍕 Еда загружена:', foodData.length, 'записей');
      setFoodItems(foodData);
      setFoodLoadingError(null); // Успешная загрузка
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          console.warn('⚠️ Запрос еды отменен по таймауту');
          setFoodLoadingError('Таймаут загрузки еды');
        } else {
          console.error('💥 Критическая ошибка загрузки еды:', error.message);
          setFoodLoadingError('Ошибка загрузки еды: проблема с подключением к серверу');
        }
      } else {
        console.error('💥 Неизвестная ошибка загрузки еды:', error);
        setFoodLoadingError('Ошибка загрузки еды: проблема с подключением к серверу');
      }
    }
  };

  // Функция для загрузки изображения
  const uploadImage = async (file: File): Promise<string> => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/api/upload/image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка загрузки изображения');
      }

      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Загрузка данных
  const loadData = async () => {
    // Создаем AbortController для отмены запросов
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    // Устанавливаем таймаут для отмены запросов
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 10000); // 10 секунд таймаут
    
    try {
      setLoading(true);
      console.log('🔍 Начинаем загрузку данных админ панели...');
      
      // Проверяем авторизацию
      if (!token) {
        console.error('❌ Токен авторизации отсутствует');
        alert('Ошибка авторизации. Пожалуйста, войдите в систему заново.');
        return;
      }
      
      // Функция для безопасного fetch с обработкой ошибок
      const safeFetch = async (url: string, options: RequestInit = {}) => {
        try {
          const response = await fetch(url, {
            ...options,
            signal,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              ...options.headers
            }
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return await response.json();
        } catch (error) {
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              console.warn('⚠️ Запрос отменен по таймауту:', url);
              return null;
            }
            console.error('❌ Ошибка запроса:', url, error.message);
          } else {
            console.error('❌ Неизвестная ошибка запроса:', url, error);
          }
          return null;
        }
      };
      
      // Загружаем статистику
      console.log('📊 Загружаем статистику...');
      const statsData = await safeFetch('http://localhost:3001/api/admin/stats');
      if (statsData) {
        console.log('📊 Статистика загружена:', statsData);
        setStats(statsData);
      }

      // Загружаем пользователей
      console.log('👥 Загружаем пользователей...');
      const usersData = await safeFetch('http://localhost:3001/api/admin/users');
      if (usersData) {
        console.log('👥 Пользователи загружены:', usersData.length, 'записей');
        setUsers(usersData);
      }

      // Загружаем фильмы
      console.log('🎬 Загружаем фильмы...');
      const moviesData = await safeFetch('http://localhost:3001/api/admin/movies');
      if (moviesData) {
        console.log('🎬 Фильмы загружены:', moviesData.length, 'записей');
        console.log('🎬 Первый фильм:', moviesData[0]);
        setMovies(moviesData);
        console.log('🎬 Состояние movies обновлено, длина:', moviesData.length);
      }

      // Загружаем сеансы
      console.log('🎭 Загружаем сеансы...');
      const sessionsData = await safeFetch('http://localhost:3001/api/admin/sessions');
      if (sessionsData) {
        console.log('🎭 Сеансы загружены:', sessionsData.length, 'записей');
        setSessions(sessionsData);
      }

      // Загружаем заказы
      console.log('🛒 Загружаем заказы...');
      const ordersData = await safeFetch('http://localhost:3001/api/admin/orders');
      if (ordersData) {
        console.log('🛒 Заказы загружены:', ordersData.length, 'записей');
        setOrders(ordersData);
      }

      // Загружаем финансовые данные
      console.log('💰 Загружаем финансовые данные...');
      const financeData = await safeFetch('http://localhost:3001/api/admin/finance');
      if (financeData) {
        console.log('💰 Финансы загружены:', financeData);
        setFinanceData(financeData);
      }

      // Загружаем шаблоны
      console.log('📋 Загружаем шаблоны сеансов...');
      const templatesData = await safeFetch('http://localhost:3001/api/admin/session-templates');
      if (templatesData) {
        console.log('📋 Шаблоны загружены:', templatesData.length, 'записей');
        setTemplates(templatesData.map((template: any) => ({
          ...template,
          time_slots: (() => {
            try {
              return JSON.parse(template.time_slots || '[]');
            } catch (e) {
              console.warn('⚠️ Ошибка парсинга time_slots:', template.time_slots);
              return [];
            }
          })(),
          days_of_week: (() => {
            try {
              return JSON.parse(template.days_of_week || '[]');
            } catch (e) {
              console.warn('⚠️ Ошибка парсинга days_of_week:', template.days_of_week);
              return [];
            }
          })()
        })));
      }

      // Загружаем клубные события
      console.log('🎉 Загружаем клубные события...');
      const eventsData = await safeFetch('http://localhost:3001/api/admin/events');
      if (eventsData) {
        console.log('🎉 События загружены:', eventsData.length, 'записей');
        setEvents(eventsData);
        setEventsCount(eventsData.length);
      }

      // Загружаем еду
      console.log('🍕 Загружаем еду...');
      const foodData = await safeFetch('http://localhost:3001/api/admin/food');
      if (foodData) {
        console.log('🍕 Еда загружена:', foodData.length, 'записей');
        setFoodItems(foodData);
        setFoodLoadingError(null); // Успешная загрузка
      } else {
        setFoodLoadingError('Ошибка загрузки еды: проблема с подключением к серверу');
      }

      console.log('✅ Загрузка данных завершена');

    } catch (error) {
      console.error('💥 Критическая ошибка загрузки данных:', error);
      setFoodLoadingError('Ошибка загрузки еды: проблема с подключением к серверу');
    } finally {
      // Очищаем таймаут
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Загружаем мероприятия при переходе на вкладку мероприятий
  useEffect(() => {
    if (activeTab === 'events') {
      loadEvents();
    }
  }, [activeTab]);

  // Обновляем статистику при изменении количества мероприятий
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadData();
    }
  }, [activeTab]);

  // Обработчики для пользователей
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser 
        ? `http://localhost:3001/api/admin/users/${editingUser.id}`
        : 'http://localhost:3001/api/admin/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userForm)
      });

      if (response.ok) {
        setShowUserModal(false);
        setEditingUser(null);
        setUserForm({ name: '', email: '', phone: '', city: '', address: '', role_id: 1 });
        loadData();
      }
    } catch (error) {
      console.error('Ошибка сохранения пользователя:', error);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city || '',
      address: user.address || '',
      role_id: user.role_id
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
    }
  };

  // Обработчики для фильмов
  const handleMovieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let posterUrl = movieForm.posterUrl;

      // Если выбран файл для загрузки, сначала загружаем его
      if (selectedMoviePosterFile) {
        try {
          posterUrl = await uploadImage(selectedMoviePosterFile);
          console.log('Постер загружен:', posterUrl);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
          alert('Ошибка загрузки постера: ' + errorMessage);
          return;
        }
      }

      const url = editingMovie 
        ? `http://localhost:3001/api/admin/movies/${editingMovie.id}`
        : 'http://localhost:3001/api/admin/movies';
      
      const method = editingMovie ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...movieForm,
          posterUrl: posterUrl,
          duration: movieForm.duration ? parseInt(movieForm.duration) : null,
          rating: movieForm.rating ? parseFloat(movieForm.rating) : null
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (editingMovie) {
          // Обновляем существующий фильм
          setMovies(movies.map(movie => 
            movie.id === editingMovie.id ? result.movie : movie
          ));
        } else {
          // Добавляем новый фильм
          setMovies([result, ...movies]);
          setStats(prev => prev ? {
            ...prev,
            totalMovies: prev.totalMovies + 1
          } : null);
        }
        
        setShowMovieModal(false);
        setEditingMovie(null);
        setMovieForm({ title: '', genre: '', duration: '', rating: '', description: '', posterUrl: '' });
        setSelectedMoviePosterFile(null);
      }
    } catch (error) {
      console.error('Ошибка сохранения фильма:', error);
    }
  };

  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setMovieForm({
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration?.toString() || '',
      rating: movie.rating?.toString() || '',
      description: movie.description || '',
      posterUrl: movie.posterUrl || ''
    });
    setSelectedMoviePosterFile(null);
    setShowMovieModal(true);
  };

  const handleDeleteMovie = async (movieId: number) => {
    try {
      console.log('🎬 Удаляем фильм с ID:', movieId);
      
      if (!token) {
        console.error('❌ Токен авторизации отсутствует');
        alert('Ошибка авторизации. Пожалуйста, войдите в систему заново.');
        return;
      }
      
      console.log('🔑 Токен для удаления:', token ? `${token.substring(0, 20)}...` : 'отсутствует');
      
      // Сначала пробуем безопасный endpoint
      let response = await fetch(`http://localhost:3001/api/delete-movie-safe/${movieId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10 секунд таймаут
      });

      // Если безопасный endpoint недоступен (404), пробуем оригинальный
      if (!response.ok && response.status === 404) {
        console.log('⚠️ Безопасный endpoint недоступен, пробуем оригинальный...');
        response = await fetch(`http://localhost:3001/api/delete-movie/${movieId}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 секунд таймаут
        });
      }

      // Если оригинальный endpoint тоже не работает (500), пробуем принудительный
      if (!response.ok && response.status === 500) {
        console.log('⚠️ Оригинальный endpoint не работает, пробуем принудительный...');
        response = await fetch(`http://localhost:3001/api/force-delete-movie/${movieId}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 секунд таймаут
        });
      }

      console.log('📡 Статус ответа:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Фильм успешно удален:', result);
        
        // Показываем информацию о удаленных связанных записях
        if (result.deletedOrders > 0 || result.totalDeletedSessions > 0) {
          let message = `Фильм удален. Также удалено: ${result.deletedOrders} заказов`;
          if (result.deletedCinemaSessions > 0) {
            message += `, ${result.deletedCinemaSessions} сеансов из cinema_sessions`;
          }
          if (result.deletedMovieSessions > 0) {
            message += `, ${result.deletedMovieSessions} сеансов из movie_sessions`;
          }
          message += '.';
          alert(message);
        } else {
          alert('Фильм успешно удален.');
        }
        
        // Перезагружаем данные
        loadData();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
        console.error('❌ Ошибка удаления фильма:', response.status, errorData);
        alert(`Ошибка удаления фильма: ${response.status} - ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          console.warn('⚠️ Запрос удаления отменен по таймауту');
          alert('Таймаут удаления фильма. Попробуйте еще раз.');
        } else {
          console.error('💥 Критическая ошибка удаления фильма:', error.message);
          alert('Ошибка удаления фильма: проблема с подключением');
        }
      } else {
        console.error('💥 Неизвестная ошибка удаления фильма:', error);
        alert('Ошибка удаления фильма: неизвестная ошибка');
      }
    }
  };

  // Обработчики для заказов
  const handleEditOrder = (order: Order) => {
    // Пока просто показываем информацию о заказе
    alert(`Заказ #${order.id}\nТип: ${order.order_type}\nЦена: ${order.total_price} ₽\nСтатус: ${order.status}`);
  };

  const handleDeleteOrder = async (orderId: number) => {
    try {
      if (!token) {
        alert('Ошибка авторизации. Пожалуйста, войдите в систему заново.');
        return;
      }

      const response = await fetch(`http://localhost:3001/api/admin/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Заказ успешно удален.');
        loadData();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Неизвестная ошибка' }));
        alert(`Ошибка удаления заказа: ${response.status} - ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Ошибка удаления заказа:', error);
      alert('Ошибка удаления заказа: проблема с подключением');
    }
  };

  // Обработчики для сеансов
  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSession 
        ? `http://localhost:3001/api/admin/sessions/${editingSession.id}`
        : 'http://localhost:3001/api/admin/sessions';
      
      const method = editingSession ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...sessionForm,
          movie_id: parseInt(sessionForm.movie_id),
          price: parseFloat(sessionForm.price),
          capacity: sessionForm.capacity ? parseInt(sessionForm.capacity) : 100
        })
      });

      if (response.ok) {
        setShowSessionModal(false);
        setEditingSession(null);
        setSessionForm({ movie_id: '', date: '', time: '', hall: '', price: '', capacity: '' });
        loadData();
      }
    } catch (error) {
      console.error('Ошибка сохранения сеанса:', error);
    }
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setSessionForm({
      movie_id: session.movie_id.toString(),
      date: session.date,
      time: session.time,
      hall: session.hall,
      price: session.price.toString(),
      capacity: session.capacity.toString()
    });
    setShowSessionModal(true);
  };

  const handleDeleteSession = async (sessionId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Ошибка удаления сеанса:', error);
    }
  };

  // Обработчики для клубных событий
  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = eventForm.image_url;

      // Если выбран файл для загрузки, сначала загружаем его
      if (selectedEventImageFile) {
        try {
          imageUrl = await uploadImage(selectedEventImageFile);
          console.log('Изображение мероприятия загружено:', imageUrl);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
          alert('Ошибка загрузки изображения: ' + errorMessage);
          return;
        }
      }

      const url = editingEvent 
        ? `http://localhost:3001/api/admin/events/${editingEvent.id}`
        : 'http://localhost:3001/api/admin/events';
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...eventForm,
          image_url: imageUrl,
          price: parseFloat(eventForm.price)
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (editingEvent) {
          // Обновляем существующее событие
          setEvents(events.map(event => 
            event.id === editingEvent.id ? result.event : event
          ));
        } else {
          // Добавляем новое событие
          setEvents([result, ...events]);
        }
        
        setShowEventModal(false);
        setEditingEvent(null);
        setEventForm({ title: '', description: '', dj_name: '', event_date: '', event_time: '', price: '', genre: '', image_url: '' });
        setSelectedEventImageFile(null);
        
        // Обновляем статистику и список мероприятий
        loadData();
      }
    } catch (error) {
      console.error('Ошибка сохранения события:', error);
    }
  };

  const handleEditEvent = (event: ClubEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      dj_name: event.dj,
      event_date: event.date,
      event_time: event.time,
      price: event.price.toString(),
      genre: event.genre || '',
      image_url: event.image_url || ''
    });
    setSelectedEventImageFile(null);
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setEvents(events.filter(event => event.id !== eventId));
        // Обновляем статистику и список мероприятий
        loadData();
      }
    } catch (error) {
      console.error('Ошибка удаления события:', error);
    }
  };

  // Фильтрация
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const filteredMovies = movies.filter(movie =>
    (movie.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (movie.genre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    (event.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (event.dj?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (event.genre?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const filteredFood = foodItems.filter(food =>
    (food.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (food.category_id?.toString() || '').includes(searchTerm.toLowerCase()) ||
    (food.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getDaysOfWeekText = (days: number[]) => {
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days.map(day => dayNames[day - 1]).join(', ');
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/admin/session-templates/${templateId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setTemplates(templates.filter(template => template.id !== templateId));
        } else {
          const error = await response.json();
          alert(`Ошибка: ${error.error}`);
        }
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Ошибка при удалении шаблона');
      }
    }
  };

  const handleToggleTemplateStatus = async (templateId: number) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      const newStatus = !template.is_active;
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/admin/session-templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...template,
          is_active: newStatus
        })
      });

      if (response.ok) {
        setTemplates(templates.map(template => 
          template.id === templateId 
            ? { ...template, is_active: newStatus }
            : template
        ));
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Error toggling template status:', error);
      alert('Ошибка при изменении статуса шаблона');
    }
  };

  // Обработчики для еды
  const handleFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = foodForm.image_url;

      // Если выбран файл для загрузки, сначала загружаем его
      if (selectedImageFile) {
        try {
          imageUrl = await uploadImage(selectedImageFile);
          console.log('Изображение загружено:', imageUrl);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
          alert('Ошибка загрузки изображения: ' + errorMessage);
          return;
        }
      }

      const url = editingFood 
        ? `http://localhost:3001/api/admin/food/${editingFood.id}`
        : 'http://localhost:3001/api/admin/food';
      
      const method = editingFood ? 'PUT' : 'POST';
      
      console.log('Исходная категория из формы:', foodForm.category);
      
      // Убираем category_id полностью, чтобы избежать ошибки внешнего ключа
      const requestData = editingFood ? {
        // Для обновления - только основные поля без category_id
        name: foodForm.name,
        description: foodForm.description,
        price: parseFloat(foodForm.price),
        category: foodForm.category || 1,
        image_url: imageUrl || '',
        is_available: foodForm.is_available
      } : {
        // Для создания - только основные поля без category_id
        name: foodForm.name,
        description: foodForm.description,
        price: parseFloat(foodForm.price),
        category: foodForm.category || 1,
        image_url: imageUrl || '',
        is_available: foodForm.is_available
      };

      console.log(`${method} запрос к:`, url);
      console.log('Отправляемые данные:', requestData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('Статус ответа:', response.status);

      if (response.ok) {
        const savedFood = await response.json();
        
        if (editingFood) {
          // Обновляем существующее блюдо
          setFoodItems(foodItems.map(item => 
            item.id === editingFood.id ? savedFood : item
          ));
        } else {
          // Добавляем новое блюдо
          setFoodItems([savedFood, ...foodItems]);
        }
        
        // Закрываем модальное окно и сбрасываем форму
        setShowFoodModal(false);
        resetFoodForm();
      } else {
        // Получаем детали ошибки
        const errorText = await response.text();
        console.error(`Ошибка ${response.status}:`, errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          console.error('Детали ошибки:', errorJson);
        } catch {
          console.error('Текст ошибки:', errorText);
        }
        
        alert(`Ошибка сохранения: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Ошибка сохранения еды:', error);
      alert('Произошла ошибка при сохранении. Проверьте консоль для подробностей.');
    }
  };

  const handleEditFood = (food: FoodItem) => {
    setEditingFood(food);
    setFoodForm({
      name: food.name,
      description: food.description || '',
      price: food.price.toString(),
      category: food.category_id.toString(),
      image_url: food.image_url || '',
      is_available: food.available
    });
    setShowFoodModal(true);
  };

  const handleDeleteFood = async (foodId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/admin/food/${foodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setFoodItems(foodItems.filter(item => item.id !== foodId));
      }
    } catch (error) {
      console.error('Ошибка удаления еды:', error);
    }
  };

  // Функция для сброса формы еды
  const resetFoodForm = () => {
    setFoodForm({
      name: '',
      description: '',
      price: '',
      category: '',
      image_url: '',
      is_available: true
    });
    setEditingFood(null);
    setSelectedImageFile(null);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel-container min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-2 sm:p-4 pb-4">
      <div className="admin-panel-content max-w-full mx-auto pb-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <div className="flex-1">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Админ панель</h1>
            <p className="text-sm sm:text-base text-gray-600">Добро пожаловать, {user?.name || 'Admin'}</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={loadData} 
              variant="outline" 
              className="text-blue-600 border-blue-600 hover:bg-blue-50 text-sm px-3 py-2"
              title="Перезагрузить данные"
            >
              🔄 Обновить
            </Button>
            <Button onClick={onLogout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 text-sm px-3 py-2">
              <LogOut className="w-4 h-4 mr-1" />
              Выйти
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-1 sm:gap-2 mb-4">
          <Button
            variant={activeTab === 'dashboard' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-0"
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Статистика</span>
          </Button>
          <Button
            variant={activeTab === 'users' ? 'default' : 'outline'}
            onClick={() => setActiveTab('users')}
            className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-0"
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Пользователи</span>
          </Button>
          <Button
            variant={activeTab === 'movies' ? 'default' : 'outline'}
            onClick={() => setActiveTab('movies')}
            className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-0"
          >
            <Film className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Фильмы</span>
          </Button>
          <Button
            variant={activeTab === 'sessions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sessions')}
            className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-0"
          >
            <Play className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Сеансы</span>
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
            className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-0"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Заказы</span>
          </Button>
          <Button
            variant={activeTab === 'finance' ? 'default' : 'outline'}
            onClick={() => setActiveTab('finance')}
            className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-0"
          >
            <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Финансы</span>
          </Button>
          <Button
            variant={activeTab === 'templates' ? 'default' : 'outline'}
            onClick={() => setActiveTab('templates')}
            className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-0"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Шаблоны</span>
          </Button>
          <Button
            variant={activeTab === 'events' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('events');
              loadEvents(); // Загружаем мероприятия при переходе на вкладку
            }}
            className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-0"
          >
            <Music className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Мероприятия</span>
          </Button>
          <Button
            variant={activeTab === 'food' ? 'default' : 'outline'}
            onClick={() => {
              setActiveTab('food');
              loadFood(); // Загружаем еду при переходе на вкладку
            }}
            className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-0"
          >
            <Utensils className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Еда</span>
          </Button>
          <Button
            variant={activeTab === 'kotlin' ? 'default' : 'outline'}
            onClick={() => setActiveTab('kotlin')}
            className="flex items-center justify-center text-xs sm:text-sm px-2 sm:px-3 py-2 min-w-0"
          >
            <Settings className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
            <span className="hidden sm:inline ml-1">Kotlin API</span>
          </Button>
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Отладочная информация */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                📊 Статистика загружена: {stats ? 'Да' : 'Нет'} | 
                👥 Пользователи: {users.length} | 
                🎬 Фильмы: {movies.length} | 
                🎉 События: {events.length}
              </p>
              {!stats && (
                <p className="text-blue-600 text-sm mt-1">
                  ℹ️ Статистика загружается. Данные будут доступны после добавления контента.
                </p>
              )}
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Загрузка статистики...</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Film className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Всего фильмов</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalMovies || 0}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Новых за неделю</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.recentUsers || 0}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Music className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Всего мероприятий</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalEvents || 0}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Movies */}
        {activeTab === 'movies' && (
          <div>
            {/* Отладочная информация */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                🎬 Загружено фильмов: {movies.length} | 
                🔍 Поиск: "{searchTerm}" | 
                📝 Отфильтровано: {filteredMovies.length}
              </p>
              {movies.length === 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  ℹ️ Фильмы отсутствуют в базе данных. Добавьте новые фильмы для начала работы.
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск фильмов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Dialog open={showMovieModal} onOpenChange={setShowMovieModal}>
                <DialogTrigger asChild>
                  <Button className="flex items-center text-sm px-3 py-2 whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Добавить фильм</span>
                    <span className="sm:hidden">Добавить</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg sm:max-w-xl bg-white max-h-[90vh] flex flex-col">
                  <DialogHeader className="pb-4 flex-shrink-0">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {editingMovie ? 'Редактировать фильм' : 'Добавить фильм'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleMovieSubmit} className="space-y-5 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                        Название фильма
                      </Label>
                      <Input
                        id="title"
                        value={movieForm.title}
                        onChange={(e) => setMovieForm({...movieForm, title: e.target.value})}
                        required
                        className="w-full"
                        placeholder="Введите название фильма"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                        Описание
                      </Label>
                      <Input
                        id="description"
                        value={movieForm.description}
                        onChange={(e) => setMovieForm({...movieForm, description: e.target.value})}
                        className="w-full"
                        placeholder="Описание фильма"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="genre" className="text-sm font-medium text-gray-700">
                          Жанр
                        </Label>
                        <Input
                          id="genre"
                          value={movieForm.genre}
                          onChange={(e) => setMovieForm({...movieForm, genre: e.target.value})}
                          required
                          className="w-full"
                          placeholder="Драма, Комедия..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
                          Длительность (мин)
                        </Label>
                        <Input
                          id="duration"
                          type="number"
                          value={movieForm.duration}
                          onChange={(e) => setMovieForm({...movieForm, duration: e.target.value})}
                          className="w-full"
                          placeholder="120"
                          min="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rating" className="text-sm font-medium text-gray-700">
                          Рейтинг
                        </Label>
                        <Input
                          id="rating"
                          type="number"
                          value={movieForm.rating}
                          onChange={(e) => setMovieForm({...movieForm, rating: e.target.value})}
                          className="w-full"
                          placeholder="8.5"
                          min="0"
                          max="10"
                          step="0.1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Постер
                      </Label>
                      <ImageUpload
                        value={movieForm.posterUrl}
                        onChange={(value) => setMovieForm({...movieForm, posterUrl: value})}
                        onFileChange={(file) => setSelectedMoviePosterFile(file)}
                        placeholder="Загрузить постер фильма"
                        maxSize={5}
                        showPreview={true}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 flex-shrink-0">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowMovieModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Отмена
                      </Button>
                      <Button 
                        type="submit"
                        disabled={uploadingImage}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Загрузка...
                          </>
                        ) : (
                          editingMovie ? 'Сохранить изменения' : 'Добавить фильм'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка фильмов...</p>
                  </div>
                </div>
              ) : filteredMovies.length === 0 ? (
                <div className="text-center py-12">
                  <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'Фильмы не найдены по вашему запросу' : 'Фильмы отсутствуют в базе данных'}
                  </p>
                </div>
              ) : (
                filteredMovies.map((movie) => (
                  <Card key={movie.id} className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Постер */}
                        {movie.posterUrl && (
                          <div className="flex-shrink-0">
                            <ImageWithFallback
                              src={movie.posterUrl}
                              alt={movie.title}
                              className="w-16 h-20 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        )}
                        
                        <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                          <Film className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{movie.title}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
                            <span className="flex items-center truncate">
                              <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{movie.genre}</span>
                            </span>
                            {movie.duration && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                                {movie.duration} мин
                              </span>
                            )}
                            {movie.rating && (
                              <span className="flex items-center">
                                <Star className="w-3 h-3 mr-1 flex-shrink-0" />
                                {movie.rating}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMovie(movie)}
                            className="p-2"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 p-2">
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить фильм?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Фильм будет удален навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMovie(movie.id)}>
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Sessions */}
        {activeTab === 'sessions' && (
          <div>
            {/* Отладочная информация */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                🎭 Загружено сеансов: {sessions.length} | 
                🔍 Поиск: "{searchTerm}" | 
                📝 Отфильтровано: {sessions.filter(s => 
                  s.movie_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  s.date?.includes(searchTerm) ||
                  s.time?.includes(searchTerm)
                ).length}
              </p>
              {sessions.length === 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  ℹ️ Сеансы отсутствуют в базе данных. Добавьте новые сеансы для начала работы.
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск сеансов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
                <DialogTrigger asChild>
                  <Button className="flex items-center text-sm px-3 py-2 whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Добавить</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg sm:max-w-xl bg-white max-h-[90vh] flex flex-col">
                  <DialogHeader className="pb-4 flex-shrink-0">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {editingSession ? 'Редактировать сеанс' : 'Добавить сеанс'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSessionSubmit} className="space-y-5 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                    <div className="space-y-2">
                      <Label htmlFor="movie_id" className="text-sm font-medium text-gray-700">
                        Фильм
                      </Label>
                      <select
                        id="movie_id"
                        value={sessionForm.movie_id}
                        onChange={(e) => setSessionForm({...sessionForm, movie_id: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        required
                      >
                        <option value="">Выберите фильм</option>
                        {movies.map(movie => (
                          <option key={movie.id} value={movie.id}>
                            {movie.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                          Дата
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          value={sessionForm.date}
                          onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                          required
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time" className="text-sm font-medium text-gray-700">
                          Время
                        </Label>
                        <Input
                          id="time"
                          type="time"
                          value={sessionForm.time}
                          onChange={(e) => setSessionForm({...sessionForm, time: e.target.value})}
                          required
                          className="w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="hall" className="text-sm font-medium text-gray-700">
                          Зал
                        </Label>
                        <Input
                          id="hall"
                          value={sessionForm.hall}
                          onChange={(e) => setSessionForm({...sessionForm, hall: e.target.value})}
                          required
                          className="w-full"
                          placeholder="Например: Зал 1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                          Цена билета
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          value={sessionForm.price}
                          onChange={(e) => setSessionForm({...sessionForm, price: e.target.value})}
                          required
                          className="w-full"
                          placeholder="500"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-sm font-medium text-gray-700">
                        Вместимость
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={sessionForm.capacity}
                        onChange={(e) => setSessionForm({...sessionForm, capacity: e.target.value})}
                        className="w-full"
                        placeholder="100"
                        min="1"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 flex-shrink-0">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowSessionModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Отмена
                      </Button>
                      <Button 
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {editingSession ? 'Сохранить изменения' : 'Добавить сеанс'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка сеансов...</p>
                  </div>
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Сеансы отсутствуют в базе данных</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Добавьте новые сеансы для начала работы с системой
                  </p>
                </div>
              ) : (
                sessions.map((session) => (
                  <Card key={session.id} className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{session.movie_title}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                              {new Date(session.date).toLocaleDateString('ru-RU')}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                              {session.time}
                            </span>
                            <span className="truncate">Зал: {session.hall}</span>
                            <span className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1 flex-shrink-0" />
                              {session.price} ₽
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                        <Badge variant={session.status === 'active' ? "default" : "secondary"} className="text-xs px-2 py-1">
                          {session.status === 'active' ? 'Активен' : 'Неактивен'}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditSession(session)}
                            className="p-2"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 p-2">
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить сеанс?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Сеанс будет удален навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteSession(session.id)}>
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div>
            {/* Отладочная информация */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                👥 Загружено пользователей: {users.length} | 
                🔍 Поиск: "{searchTerm}" | 
                📝 Отфильтровано: {filteredUsers.length}
              </p>
              {users.length === 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  ℹ️ Пользователи отсутствуют в базе данных. Зарегистрируйте новых пользователей.
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск пользователей..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Dialog open={showUserModal} onOpenChange={setShowUserModal}>
                <DialogTrigger asChild>
                  <Button className="flex items-center text-sm px-3 py-2 whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Добавить</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>
                      {editingUser ? 'Редактировать пользователя' : 'Добавить пользователя'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUserSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                    <div>
                      <Label htmlFor="name">Имя</Label>
                      <Input
                        id="name"
                        value={userForm.name}
                        onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={userForm.email}
                        onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input
                        id="phone"
                        value={userForm.phone}
                        onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Город</Label>
                      <Input
                        id="city"
                        value={userForm.city}
                        onChange={(e) => setUserForm({...userForm, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Адрес</Label>
                      <Input
                        id="address"
                        value={userForm.address}
                        onChange={(e) => setUserForm({...userForm, address: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Роль</Label>
                      <select
                        id="role"
                        value={userForm.role_id}
                        onChange={(e) => setUserForm({...userForm, role_id: parseInt(e.target.value)})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value={1}>Пользователь</option>
                        <option value={2}>Администратор</option>
                      </select>
                    </div>
                    <div className="flex justify-end space-x-2 flex-shrink-0">
                      <Button type="button" variant="outline" onClick={() => setShowUserModal(false)}>
                        Отмена
                      </Button>
                      <Button type="submit">
                        {editingUser ? 'Сохранить' : 'Добавить'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка пользователей...</p>
                  </div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'Пользователи не найдены по вашему запросу' : 'Пользователи отсутствуют в базе данных'}
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.id} className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{user.name}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
                            <span className="flex items-center truncate">
                              <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </span>
                            <span className="flex items-center truncate">
                              <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{user.phone}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                        <Badge variant={user.role_id === 2 ? "default" : "secondary"} className="text-xs px-2 py-1">
                          {user.role_id === 2 ? 'Админ' : 'Пользователь'}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            className="p-2"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 p-2">
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить пользователя?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Пользователь будет удален навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <div>
            {/* Отладочная информация */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                🛒 Загружено заказов: {orders.length} | 
                🔍 Поиск: "{searchTerm}" | 
                📝 Отфильтровано: {orders.filter(o => 
                  o.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  o.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  o.order_type?.toLowerCase().includes(searchTerm.toLowerCase())
                ).length}
              </p>
              {orders.length === 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  ℹ️ Заказы отсутствуют в базе данных. Новые заказы появятся после регистрации пользователей.
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск заказов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка заказов...</p>
                  </div>
                </div>
              ) : orders.filter(o => 
                o.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                o.order_type?.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'Заказы не найдены по вашему запросу' : 'Заказы отсутствуют в базе данных'}
                  </p>
                </div>
              ) : (
                orders.filter(o => 
                  o.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  o.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  o.order_type?.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((order) => (
                  <Card key={order.id} className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                          <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">Заказ #{order.id}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
                            <span className="flex items-center truncate">
                              <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{order.order_type}</span>
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1 flex-shrink-0" />
                              {order.total_price} ₽
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditOrder(order)}
                            className="p-2"
                          >
                            <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 p-2">
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Удалить заказ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Это действие нельзя отменить. Заказ будет удален навсегда.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteOrder(order.id)}>
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Шаблоны сеансов */}
        {activeTab === 'templates' && (
          <div>
            {/* Отладочная информация */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                📋 Загружено шаблонов: {templates.length} | 
                🔍 Поиск: "{searchTerm}" | 
                📝 Отфильтровано: {templates.filter(t => 
                  t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  t.description?.toLowerCase().includes(searchTerm.toLowerCase())
                ).length}
              </p>
              {templates.length === 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  ℹ️ Шаблоны отсутствуют в базе данных. Добавьте новые шаблоны для начала работы.
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск шаблонов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
                <DialogTrigger asChild>
                  <Button className="flex items-center text-sm px-3 py-2 whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Добавить</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
                  <DialogHeader className="flex-shrink-0">
                    <DialogTitle>
                      {editingSession ? 'Редактировать шаблон' : 'Добавить шаблон'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSessionSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                    <div>
                      <Label htmlFor="template_name">Название шаблона</Label>
                      <Input
                        id="template_name"
                        value={sessionForm.movie_id}
                        onChange={(e) => setSessionForm({...sessionForm, movie_id: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="template_description">Описание</Label>
                      <Input
                        id="template_description"
                        value={sessionForm.date}
                        onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template_hall">Зал по умолчанию</Label>
                      <Input
                        id="template_hall"
                        value={sessionForm.hall}
                        onChange={(e) => setSessionForm({...sessionForm, hall: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="template_price">Цена билета по умолчанию</Label>
                      <Input
                        id="template_price"
                        type="number"
                        value={sessionForm.price}
                        onChange={(e) => setSessionForm({...sessionForm, price: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="template_capacity">Вместимость по умолчанию</Label>
                      <Input
                        id="template_capacity"
                        type="number"
                        value={sessionForm.capacity}
                        onChange={(e) => setSessionForm({...sessionForm, capacity: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="template_time_slots">Время сеансов</Label>
                      <Input
                        id="template_time_slots"
                        value={sessionForm.time}
                        onChange={(e) => setSessionForm({...sessionForm, time: e.target.value})}
                        placeholder="Например: 10:00, 12:30, 15:00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template_days_of_week">Дни недели</Label>
                      <Input
                        id="template_days_of_week"
                        value={sessionForm.date}
                        onChange={(e) => setSessionForm({...sessionForm, date: e.target.value})}
                        placeholder="Например: 1, 3, 5"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 flex-shrink-0">
                      <Button type="button" variant="outline" onClick={() => setShowSessionModal(false)}>
                        Отмена
                      </Button>
                      <Button type="submit">
                        {editingSession ? 'Сохранить' : 'Добавить'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка шаблонов...</p>
                  </div>
                </div>
              ) : templates.filter(t => 
                t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.description?.toLowerCase().includes(searchTerm.toLowerCase())
              ).length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'Шаблоны не найдены по вашему запросу' : 'Шаблоны отсутствуют в базе данных'}
                  </p>
                </div>
              ) : (
                templates.map((template) => (
                  <Card key={template.id} className="p-3 sm:p-4">
                    <div className="flex flex-col gap-4">
                      {/* Заголовок и статус */}
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full flex-shrink-0">
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base leading-tight mb-1">{template.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 leading-tight">{template.description}</p>
                        </div>
                        <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs px-2 py-1 flex-shrink-0">
                          {template.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </div>
                      
                      {/* Основная информация */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 mr-2">Зал:</span>
                            <span>{template.default_hall}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 mr-2">Цена:</span>
                            <span>{template.default_price} ₽</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium text-gray-700 mr-2">Вместимость:</span>
                            <span>{template.default_capacity}</span>
                          </div>
                        </div>
                        
                        {/* Время и дни в отдельных строках для лучшей читаемости */}
                        <div className="space-y-1 text-xs sm:text-sm text-gray-600">
                          <div className="flex flex-wrap items-center">
                            <span className="font-medium text-gray-700 mr-2 flex-shrink-0">Время:</span>
                            <span className="break-words">{template.time_slots.join(', ')}</span>
                          </div>
                          <div className="flex flex-wrap items-center">
                            <span className="font-medium text-gray-700 mr-2 flex-shrink-0">Дни:</span>
                            <span className="break-words">{getDaysOfWeekText(template.days_of_week)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Кнопки действий */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditSession(template as unknown as Session)}
                          className="p-2 hover:bg-gray-50"
                          title="Редактировать"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleTemplateStatus(template.id)}
                          className="p-2 hover:bg-gray-50"
                          title={template.is_active ? 'Деактивировать' : 'Активировать'}
                        >
                          {template.is_active ? <XCircle className="w-3 h-3 sm:w-4 sm:h-4" /> : <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 p-2 hover:bg-red-50" title="Удалить">
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить шаблон?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Это действие нельзя отменить. Шаблон будет удален навсегда.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTemplate(template.id)}>
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Мероприятия */}
        {activeTab === 'events' && (
          <div>
            {/* Отладочная информация */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                🎉 Загружено событий: {events.length} | 
                🔍 Поиск: "{searchTerm}" | 
                📝 Отфильтровано: {filteredEvents.length}
              </p>
              {events.length === 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  ℹ️ События отсутствуют в базе данных. Добавьте новые события для начала работы.
                </p>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск мероприятий..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
              <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить мероприятие
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg sm:max-w-xl bg-white max-h-[90vh] flex flex-col">
                  <DialogHeader className="pb-4 flex-shrink-0">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {editingEvent ? 'Редактировать мероприятие' : 'Добавить мероприятие'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEventSubmit} className="space-y-5 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                    <div className="space-y-2">
                      <Label htmlFor="event_title" className="text-sm font-medium text-gray-700">
                        Название мероприятия
                      </Label>
                      <Input
                        id="event_title"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_description" className="text-sm font-medium text-gray-700">
                        Описание
                      </Label>
                      <Input
                        id="event_description"
                        value={eventForm.description}
                        onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="event_dj" className="text-sm font-medium text-gray-700">
                        DJ
                      </Label>
                      <Input
                        id="event_dj"
                        value={eventForm.dj_name}
                        onChange={(e) => setEventForm({...eventForm, dj_name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event_date" className="text-sm font-medium text-gray-700">
                          Дата
                        </Label>
                        <Input
                          id="event_date"
                          type="date"
                          value={eventForm.event_date}
                          onChange={(e) => setEventForm({...eventForm, event_date: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event_time" className="text-sm font-medium text-gray-700">
                          Время
                        </Label>
                        <Input
                          id="event_time"
                          type="time"
                          value={eventForm.event_time}
                          onChange={(e) => setEventForm({...eventForm, event_time: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event_price" className="text-sm font-medium text-gray-700">
                          Цена билета
                        </Label>
                        <Input
                          id="event_price"
                          type="number"
                          value={eventForm.price}
                          onChange={(e) => setEventForm({...eventForm, price: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event_genre" className="text-sm font-medium text-gray-700">
                          Жанр музыки
                        </Label>
                        <Input
                          id="event_genre"
                          value={eventForm.genre}
                          onChange={(e) => setEventForm({...eventForm, genre: e.target.value})}
                          placeholder="Techno, House, Hip-Hop..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Изображение
                      </Label>
                      <ImageUpload
                        value={eventForm.image_url}
                        onChange={(value) => setEventForm({...eventForm, image_url: value})}
                        onFileChange={(file) => setSelectedEventImageFile(file)}
                        placeholder="Загрузить изображение мероприятия"
                        maxSize={5}
                        showPreview={true}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 flex-shrink-0 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowEventModal(false)}>
                        Отмена
                      </Button>
                      <Button type="submit">
                        {editingEvent ? 'Сохранить' : 'Добавить'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка событий...</p>
                  </div>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'События не найдены по вашему запросу' : 'События отсутствуют в базе данных'}
                  </p>
                </div>
              ) : (
                filteredEvents.map((event) => (
                  <Card key={event.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        {/* Изображение */}
                        {event.image_url && (
                          <div className="flex-shrink-0">
                            <img
                              src={event.image_url.startsWith('http') ? event.image_url : 
                                   event.image_url.startsWith('/upload/image') ? 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=200&fit=crop' :
                                   `http://localhost:3001/api${event.image_url}`}
                              alt={event.title}
                              className="w-16 h-20 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="p-2 bg-purple-100 rounded-full flex-shrink-0">
                          <Music className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{event.title}</h3>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-600 gap-1 sm:gap-0">
                            <span className="flex items-center truncate">
                              <Tag className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{event.genre}</span>
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                              {new Date(event.date).toLocaleDateString('ru')} {event.time.slice(0, 5)}
                            </span>
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1 flex-shrink-0" />
                              {event.price} ₽
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">DJ: {event.dj}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditEvent(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить мероприятие?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Это действие нельзя отменить. Мероприятие будет удалено навсегда.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Еда */}
        {activeTab === 'food' && (
          <div>
            {/* Отладочная информация */}
            <div className="mb-4 p-3 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">
                🍕 Загружено позиций еды: {foodItems.length} | 
                🔍 Поиск: "{searchTerm}" | 
                📝 Отфильтровано: {filteredFood.length}
              </p>
              {foodLoadingError ? (
                <p className="text-red-600 text-sm mt-1">
                  ❌ {foodLoadingError}
                </p>
              ) : foodItems.length === 0 ? (
                <p className="text-gray-600 text-sm mt-1">
                  📝 Еда не добавлена. Добавьте блюда через кнопку "Добавить блюдо".
                </p>
              ) : null}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск еды..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
              <Dialog open={showFoodModal} onOpenChange={setShowFoodModal}>
                <DialogTrigger asChild>
                  <Button className="flex items-center text-sm px-3 py-2 whitespace-nowrap">
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Добавить блюдо</span>
                    <span className="sm:hidden">Добавить</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg sm:max-w-xl bg-white max-h-[90vh] flex flex-col">
                  <DialogHeader className="pb-4 flex-shrink-0">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                      {editingFood ? 'Редактировать блюдо' : 'Добавить блюдо'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleFoodSubmit} className="space-y-5 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
                    <div className="space-y-2">
                      <Label htmlFor="food_name" className="text-sm font-medium text-gray-700">
                        Название блюда
                      </Label>
                      <Input
                        id="food_name"
                        value={foodForm.name}
                        onChange={(e) => setFoodForm({...foodForm, name: e.target.value})}
                        required
                        className="w-full"
                        placeholder="Введите название блюда"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="food_description" className="text-sm font-medium text-gray-700">
                        Описание
                      </Label>
                      <Input
                        id="food_description"
                        value={foodForm.description}
                        onChange={(e) => setFoodForm({...foodForm, description: e.target.value})}
                        className="w-full"
                        placeholder="Описание блюда"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="food_price" className="text-sm font-medium text-gray-700">
                          Цена
                        </Label>
                        <Input
                          id="food_price"
                          type="number"
                          value={foodForm.price}
                          onChange={(e) => setFoodForm({...foodForm, price: e.target.value})}
                          required
                          className="w-full"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="food_category" className="text-sm font-medium text-gray-700">
                          Категория
                        </Label>
                        <select
                          id="food_category"
                          value={foodForm.category}
                          onChange={(e) => setFoodForm({...foodForm, category: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          required
                        >
                          <option value="">Выберите категорию</option>
                          <option value="1">Фаст-фуд (бургер, пицца, картофель фри)</option>
                          <option value="2">Ресторан (стейк, паста, салат)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Изображение
                      </Label>
                      <ImageUpload
                        value={foodForm.image_url}
                        onChange={(value) => setFoodForm({...foodForm, image_url: value})}
                        onFileChange={(file) => setSelectedImageFile(file)}
                        placeholder="Загрузить изображение для блюда"
                        maxSize={5}
                        showPreview={true}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <input
                        type="checkbox"
                        id="food_available"
                        checked={foodForm.is_available}
                        onChange={(e) => setFoodForm({...foodForm, is_available: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <Label htmlFor="food_available" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Доступно для заказа
                      </Label>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 flex-shrink-0">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setShowFoodModal(false);
                          resetFoodForm();
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Отмена
                      </Button>
                      <Button 
                        type="submit"
                        disabled={uploadingImage}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingImage ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Загрузка...
                          </>
                        ) : (
                          editingFood ? 'Сохранить изменения' : 'Добавить блюдо'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка еды...</p>
                  </div>
                </div>
              ) : filteredFood.length === 0 ? (
                <div className="text-center py-12">
                  <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchTerm ? 'Блюда не найдены по вашему запросу' : 'Блюда отсутствуют в базе данных'}
                  </p>
                </div>
              ) : (
                filteredFood.map((food) => (
                  <Card key={food.id} className="p-3 sm:p-4">
                    <div className="flex flex-col gap-4">
                      {/* Заголовок и статус */}
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-orange-100 rounded-full flex-shrink-0">
                          <Utensils className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base leading-tight mb-1">{food.name}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 leading-tight">{food.description}</p>
                        </div>
                        <Badge 
                          variant={food.available ? "default" : "secondary"} 
                          className="text-xs px-2 py-1 flex-shrink-0"
                        >
                          {food.available ? 'Доступно' : 'Недоступно'}
                        </Badge>
                      </div>

                      {/* Изображение */}
                      {food.image_url && (
                        <div className="flex justify-center">
                          <img
                            src={food.image_url.startsWith('http') ? food.image_url : 
                                 food.image_url.startsWith('/upload/image') ? 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=150&fit=crop' :
                                 `http://localhost:3001/api${food.image_url}`}
                            alt={food.name}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Основная информация */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">Категория:</span>
                          <span>{getCategoryName(food.category_id)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-700 mr-2">Цена:</span>
                          <span>{food.price} ₽</span>
                        </div>
                      </div>
                      
                      {/* Кнопки действий */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-200">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditFood(food)}
                          className="p-2 hover:bg-gray-50"
                          title="Редактировать"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 p-2 hover:bg-red-50"
                              title="Удалить"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Удалить блюдо?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Это действие нельзя отменить. Блюдо будет удалено навсегда.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Отмена</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteFood(food.id)}>
                                Удалить
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {/* Финансы */}
        {activeTab === 'finance' && (
          <FinanceScreen onBack={() => setActiveTab('dashboard')} />
        )}
      </div>
    </div>
  );
} 