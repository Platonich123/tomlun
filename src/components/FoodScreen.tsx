import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Plus, Minus } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FoodScreenProps {
  onBack: () => void;
  onNavigate: (screen: string, data?: any) => void;
  isAuthenticated: boolean;
  cart: any[];
  setCart: (cart: any[]) => void;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  addons: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  basePrice: number;
  totalPrice: number;
}

export function FoodScreen({ onBack, onNavigate, isAuthenticated, cart, setCart }: FoodScreenProps) {
  const [activeCategory, setActiveCategory] = useState('fastfood');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [foodItems, setFoodItems] = useState<any>({
    fastfood: [],
    restaurant: []
  });
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'fastfood', name: 'Фаст-фуд' },
    { id: 'restaurant', name: 'Ресторан' }
  ];

  // Загрузка данных еды из API
  const loadFoodItems = async () => {
    try {
      console.log('🍕 Загружаем еду из API...');
      // Используем API для получения только доступных блюд
      const response = await fetch('http://localhost:3001/api/food');
      console.log('🍕 Статус ответа:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('🍕 Получено блюд:', data.length);
        console.log('🍕 Данные еды:', data);
        
        // Группируем еду по категориям (используем category_id из базы данных)
        const categorizedFood = {
          fastfood: data.filter((item: any) => 
            item.category_id === 1 || // Фаст-фуд
            item.name.toLowerCase().includes('бургер') || 
            item.name.toLowerCase().includes('фри') || 
            item.name.toLowerCase().includes('картофель') ||
            item.name.toLowerCase().includes('пицца')
          ),
          restaurant: data.filter((item: any) => 
            item.category_id === 2 || // Ресторан
            item.name.toLowerCase().includes('стейк') || 
            item.name.toLowerCase().includes('паста') || 
            item.name.toLowerCase().includes('салат')
          )
        };
        
        console.log('🍕 Категоризированная еда:', categorizedFood);
        
        // Если есть блюда, которые не попали ни в одну категорию, добавляем их в фаст-фуд
        const allCategorized = [...categorizedFood.fastfood, ...categorizedFood.restaurant];
        const uncategorized = data.filter(item => !allCategorized.includes(item));
        
        if (uncategorized.length > 0) {
          console.log('🍕 Некатегоризированные блюда, добавляем в фаст-фуд:', uncategorized);
          categorizedFood.fastfood = [...categorizedFood.fastfood, ...uncategorized];
        }
        
        setFoodItems(categorizedFood);
      } else {
        console.error('❌ Ошибка загрузки еды:', response.status, response.statusText);
        // Если API недоступно, используем статические данные
        setFoodItems({
          fastfood: [
            {
              id: '1',
              name: 'Биг Бургер',
              description: 'Сочная котлета, свежие овощи, фирменный соус',
              price: 299,
              image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
              available: true
            },
            {
              id: '2',
              name: 'Картофель фри',
              description: 'Хрустящий картофель с морской солью',
              price: 149,
              image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop',
              available: true
            },
            {
              id: '3',
              name: 'Чизбургер',
              description: 'Классический бургер с сыром чеддер',
              price: 249,
              image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=200&fit=crop',
              available: false
            },
            {
              id: '6',
              name: 'Пицца Маргарита',
              description: 'Классическая итальянская пицца с томатами и моцареллой',
              price: 450,
              image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
              available: true
            }
          ],
          restaurant: [
            {
              id: '4',
              name: 'Стейк рибай',
              description: 'Мраморная говядина на гриле с овощами',
              price: 890,
              image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
              available: true
            },
            {
              id: '5',
              name: 'Паста карбонара',
              description: 'Классическая итальянская паста с беконом',
              price: 450,
              image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop',
              available: true
            }
          ]
        });
      }
    } catch (error) {
      console.error('💥 Критическая ошибка загрузки еды:', error);
      // Используем статические данные при ошибке
      setFoodItems({
        fastfood: [
          {
            id: '1',
            name: 'Биг Бургер',
            description: 'Сочная котлета, свежие овощи, фирменный соус',
            price: 299,
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
            available: true
          },
          {
            id: '2',
            name: 'Картофель фри',
            description: 'Хрустящий картофель с морской солью',
            price: 149,
            image_url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop',
            available: true
          },
          {
            id: '3',
            name: 'Чизбургер',
            description: 'Классический бургер с сыром чеддер',
            price: 249,
            image_url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=200&fit=crop',
            available: false
          },
          {
            id: '6',
            name: 'Пицца Маргарита',
            description: 'Классическая итальянская пицца с томатами и моцареллой',
            price: 450,
            image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop',
            available: true
          }
        ],
        restaurant: [
          {
            id: '4',
            name: 'Стейк рибай',
            description: 'Мраморная говядина на гриле с овощами',
            price: 890,
            image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop',
            available: true
          },
          {
            id: '5',
            name: 'Паста карбонара',
            description: 'Классическая итальянская паста с беконом',
            price: 450,
            image_url: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop',
            available: true
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoodItems();
  }, []);

  // Обновление данных при возвращении на экран
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadFoodItems();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleItemClick = (item: any) => {
    onNavigate('food-item-detail', item);
  };

  const addToCartWithAddons = (item: any, quantity: number, addons: any[]) => {
    const addonsPrice = addons.reduce((sum, addon) => sum + addon.price, 0);
    const totalPrice = (item.price + addonsPrice) * quantity;
    
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`, // Уникальный ID для каждого варианта с дополнениями
      name: item.name,
      price: item.price,
      quantity,
      addons,
      basePrice: item.price,
      totalPrice
    };

    setCart(prev => [...prev, cartItem]);
  };

  const quickAddToCart = (item: any) => {
    // Быстрое добавление без дополнений
    addToCartWithAddons(item, 1, []);
  };

  const updateCartItemQuantity = (cartItemId: string, change: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === cartItemId) {
        const newQuantity = Math.max(0, item.quantity + change);
        if (newQuantity === 0) {
          return null; // Will be filtered out
        }
        const addonsPrice = item.addons.reduce((sum, addon) => sum + addon.price, 0);
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: (item.basePrice + addonsPrice) * newQuantity
        };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const getItemQuantityInCart = (itemId: string) => {
    return cart
      .filter(cartItem => cartItem.name === findItemById(itemId)?.name)
      .reduce((sum, cartItem) => sum + cartItem.quantity, 0);
  };

  const findItemById = (itemId: string) => {
    const allItems = [...foodItems.fastfood, ...foodItems.restaurant];
    return allItems.find(item => item.id === itemId);
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const handleCheckout = () => {
    const checkoutData = {
      type: 'food',
      items: cart,
      totalPrice: getTotalPrice(),
      deliveryType,
      itemCount: getTotalItems()
    };

    onNavigate('food-checkout', checkoutData);
  };

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
          <h1 className="ml-2 text-xl text-gray-900">Еда и напитки</h1>
        </div>

        {/* Delivery Options */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setDeliveryType('pickup')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-colors ${
              deliveryType === 'pickup'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MapPin size={16} />
            <span>Самовывоз</span>
          </button>
          <button
            onClick={() => setDeliveryType('delivery')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-colors ${
              deliveryType === 'delivery'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Clock size={16} />
            <span>Доставка</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${
                activeCategory === category.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Food Items */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-3 pb-24">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Загрузка...</div>
            </div>
          ) : (
            foodItems[activeCategory as keyof typeof foodItems].map(item => {
              const itemInCart = getItemQuantityInCart(item.id);
              
              return (
                <Card 
                  key={item.id} 
                  className={`overflow-hidden shadow-sm transition-all duration-200 ${
                    item.available 
                      ? 'bg-white border-gray-100 cursor-pointer hover:shadow-md' 
                      : 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => item.available && handleItemClick(item)}
                >
                  <div className="flex">
                    <div className="relative">
                      <ImageWithFallback
                        src={item.image_url || item.image}
                        alt={item.name}
                        className={`w-24 h-24 object-cover transition-all duration-200 ${
                          !item.available ? 'grayscale opacity-50' : ''
                        }`}
                      />
                      {!item.available && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <Badge variant="destructive" className="text-xs">Стоп</Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className={`font-medium mb-1 ${
                            item.available ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {item.name}
                          </h3>
                          <p className={`text-sm mb-2 ${
                            item.available ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {item.description}
                          </p>
                          <p className={`font-medium ${
                            item.available ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {item.price} ₽
                          </p>
                          {itemInCart > 0 && (
                            <p className="text-xs text-blue-600 mt-1">В корзине: {itemInCart} шт.</p>
                          )}
                          {!item.available && (
                            <p className="text-xs text-red-500 mt-1 font-medium">Временно недоступно</p>
                          )}
                        </div>
                        
                        {item.available && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              quickAddToCart(item);
                            }}
                            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 ml-2 transition-colors"
                          >
                            <Plus size={20} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
          }))}
        </div>
      </div>

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <div className="absolute bottom-16 left-4 right-4">
          <Card className="bg-blue-600 text-white shadow-lg border-blue-600">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-medium">{getTotalItems()} товаров</span>
                  <p className="text-blue-100">{getTotalPrice()} ₽</p>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  size="sm"
                >
                  Оформить заказ
                </Button>
              </div>
              
              {/* Cart Items Preview */}
              {cart.length > 0 && (
                <div className="border-t border-blue-500 pt-2 space-y-2">
                  {cart.slice(0, 2).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex-1">
                        <span className="text-white">{item.name}</span>
                        {item.addons.length > 0 && (
                          <span className="text-blue-200 text-xs block">
                            + {item.addons.map(addon => addon.name).join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartItemQuantity(item.id, -1);
                          }}
                          className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-400"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-white w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCartItemQuantity(item.id, 1);
                          }}
                          className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-400"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cart.length > 2 && (
                    <p className="text-xs text-blue-200">и ещё {cart.length - 2} товаров...</p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}