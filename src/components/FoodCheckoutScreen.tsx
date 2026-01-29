import { useState } from 'react';
import { ArrowLeft, MapPin, Clock, User, Phone, CreditCard, Plus, Minus, Home, Building, Navigation } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FoodCheckoutScreenProps {
  onBack: (screen?: string) => void;
  onNavigate: (screen: string, data?: any) => void;
  cartData?: any;
}

export function FoodCheckoutScreen({ onBack, onNavigate, cartData }: FoodCheckoutScreenProps) {
  const [currentStep, setCurrentStep] = useState<'delivery' | 'contact' | 'payment'>('delivery');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>(cartData?.deliveryType || 'pickup');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [entrance, setEntrance] = useState('');
  const [floor, setFloor] = useState('');
  const [comment, setComment] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('asap');
  const [selectedTime, setSelectedTime] = useState('');
  const [contactName, setContactName] = useState('Иван Петров');
  const [contactPhone, setContactPhone] = useState('+7 (920) 123-45-67');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const deliveryTimeOptions = [
    { id: 'asap', label: 'Как можно скорее', time: '30-40 мин' },
    { id: 'schedule', label: 'Ко времени', time: 'Выберите время' }
  ];

  const timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Наличными', description: 'Оплата курьеру или в заведении' },
    { id: 'card', name: 'Картой', description: 'Онлайн оплата' },
    { id: 'sbp', name: 'СБП', description: 'Быстрые платежи' }
  ];

  const handleNext = () => {
    if (currentStep === 'delivery') {
      setCurrentStep('contact');
    } else if (currentStep === 'contact') {
      setCurrentStep('payment');
    } else {
      handlePlaceOrder();
    }
  };

  const handleBackStep = () => {
    if (currentStep === 'contact') {
      setCurrentStep('delivery');
    } else if (currentStep === 'payment') {
      setCurrentStep('contact');
    } else {
      onBack('food');
    }
  };

  const handlePlaceOrder = () => {
    const orderData = {
      type: 'food',
      items: cartData?.items || [],
      totalPrice: (cartData?.totalPrice || 0) + (deliveryType === 'delivery' ? 150 : 0),
      deliveryType,
      address: deliveryType === 'delivery' ? {
        street: address,
        apartment,
        entrance,
        floor,
        comment
      } : null,
      deliveryTime: deliveryTime === 'asap' ? 'Как можно скорее' : selectedTime,
      contact: {
        name: contactName,
        phone: contactPhone
      },
      paymentMethod,
      itemCount: getItemCount()
    };

    onNavigate('payment', orderData);
  };

  const getDeliveryFee = () => {
    return deliveryType === 'delivery' ? 150 : 0;
  };

  const getTotalWithDelivery = () => {
    return (cartData?.totalPrice || 0) + getDeliveryFee();
  };

  const getItemCount = () => {
    if (Array.isArray(cartData?.items)) {
      return cartData.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
    }
    return cartData?.itemCount || 0;
  };

  const canProceed = () => {
    if (currentStep === 'delivery') {
      return deliveryType === 'pickup' || (address.length > 0);
    }
    if (currentStep === 'contact') {
      return contactName.length > 0 && contactPhone.length > 0;
    }
    if (currentStep === 'payment') {
      return deliveryTime === 'asap' || selectedTime.length > 0;
    }
    return false;
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {['delivery', 'contact', 'payment'].map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            currentStep === step
              ? 'bg-blue-600 text-white'
              : index < ['delivery', 'contact', 'payment'].indexOf(currentStep)
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-600'
          }`}>
            {index + 1}
          </div>
          {index < 2 && (
            <div className={`w-8 h-0.5 mx-1 ${
              index < ['delivery', 'contact', 'payment'].indexOf(currentStep)
                ? 'bg-green-600'
                : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderOrderItems = () => {
    if (!cartData?.items || !Array.isArray(cartData.items)) {
      return null;
    }

    return (
      <Card className="p-4 mb-4">
        <h3 className="font-medium text-gray-900 mb-3">Ваш заказ</h3>
        <div className="space-y-3">
          {cartData.items.map((item: any, index: number) => (
            <div key={item.id || index} className="flex items-start space-x-3">
              {item.image && (
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    {item.addons && item.addons.length > 0 && (
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">Дополнения:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.addons.map((addon: any, addonIndex: number) => (
                            <Badge 
                              key={addon.id || addonIndex} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {addon.name} (+{addon.price}₽)
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mt-1">
                      {item.quantity || 1} × {item.basePrice || item.price}₽
                      {item.addons && item.addons.length > 0 && (
                        <span> + {item.addons.reduce((sum: number, addon: any) => sum + addon.price, 0)}₽</span>
                      )}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900">{item.totalPrice || (item.price * (item.quantity || 1))}₽</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderDeliveryStep = () => (
    <div className="space-y-4">
      {renderOrderItems()}
      
      {/* Delivery Type */}
      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-3">Способ получения</h3>
        <div className="space-y-2">
          <button
            onClick={() => setDeliveryType('pickup')}
            className={`w-full p-3 rounded-lg border text-left transition-colors ${
              deliveryType === 'pickup'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Building size={20} className={deliveryType === 'pickup' ? 'text-blue-600' : 'text-gray-600'} />
              <div>
                <p className={`font-medium ${deliveryType === 'pickup' ? 'text-blue-900' : 'text-gray-900'}`}>
                  Самовывоз
                </p>
                <p className={`text-sm ${deliveryType === 'pickup' ? 'text-blue-700' : 'text-gray-600'}`}>
                  ТРК "Томлун", ул. 60 лет Октября, 8
                </p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setDeliveryType('delivery')}
            className={`w-full p-3 rounded-lg border text-left transition-colors ${
              deliveryType === 'delivery'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Navigation size={20} className={deliveryType === 'delivery' ? 'text-blue-600' : 'text-gray-600'} />
                <div>
                  <p className={`font-medium ${deliveryType === 'delivery' ? 'text-blue-900' : 'text-gray-900'}`}>
                    Доставка
                  </p>
                  <p className={`text-sm ${deliveryType === 'delivery' ? 'text-blue-700' : 'text-gray-600'}`}>
                    30-60 минут
                  </p>
                </div>
              </div>
              <span className={`text-sm font-medium ${deliveryType === 'delivery' ? 'text-blue-900' : 'text-gray-900'}`}>
                150 ₽
              </span>
            </div>
          </button>
        </div>
      </Card>

      {/* Delivery Address */}
      {deliveryType === 'delivery' && (
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin size={16} className="text-blue-600" />
            <h3 className="font-medium text-gray-900">Адрес доставки</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Улица, дом</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Например: ул. Ленина, 15"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="apartment">Квартира</Label>
                <Input
                  id="apartment"
                  value={apartment}
                  onChange={(e) => setApartment(e.target.value)}
                  placeholder="12"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="entrance">Подъезд</Label>
                <Input
                  id="entrance"
                  value={entrance}
                  onChange={(e) => setEntrance(e.target.value)}
                  placeholder="1"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="floor">Этаж</Label>
                <Input
                  id="floor"
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  placeholder="3"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Комментарий к заказу</Label>
              <Input
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Домофон не работает, звонить в дверь"
                className="mt-1"
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderContactStep = () => (
    <div className="space-y-4">
      {renderOrderItems()}
      
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <User size={16} className="text-blue-600" />
          <h3 className="font-medium text-gray-900">Контактные данные</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="contactName">Имя получателя</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="contactPhone">Номер телефона</Label>
            <Input
              id="contactPhone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </Card>

      {/* Delivery Time */}
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <Clock size={16} className="text-blue-600" />
          <h3 className="font-medium text-gray-900">Время {deliveryType === 'delivery' ? 'доставки' : 'получения'}</h3>
        </div>
        <div className="space-y-3">
          {deliveryTimeOptions.map(option => (
            <button
              key={option.id}
              onClick={() => setDeliveryTime(option.id)}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                deliveryTime === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`font-medium ${deliveryTime === option.id ? 'text-blue-900' : 'text-gray-900'}`}>
                  {option.label}
                </p>
                <p className={`text-sm ${deliveryTime === option.id ? 'text-blue-700' : 'text-gray-600'}`}>
                  {option.time}
                </p>
              </div>
            </button>
          ))}
        </div>

        {deliveryTime === 'schedule' && (
          <div className="mt-4">
            <Label>Выберите время</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {timeSlots.map(time => (
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
          </div>
        )}
      </Card>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-4">
      {renderOrderItems()}
      
      <Card className="p-4">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard size={16} className="text-blue-600" />
          <h3 className="font-medium text-gray-900">Способ оплаты</h3>
        </div>
        <div className="space-y-2">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                paymentMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className={`font-medium ${paymentMethod === method.id ? 'text-blue-900' : 'text-gray-900'}`}>
                {method.name}
              </p>
              <p className={`text-sm ${paymentMethod === method.id ? 'text-blue-700' : 'text-gray-600'}`}>
                {method.description}
              </p>
            </button>
          ))}
        </div>
      </Card>

      {/* Final Summary */}
      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-3">Детали заказа</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Товары ({getItemCount()})</span>
            <span>{cartData?.totalPrice} ₽</span>
          </div>
          {deliveryType === 'delivery' && (
            <div className="flex justify-between">
              <span className="text-gray-600">Доставка</span>
              <span>{getDeliveryFee()} ₽</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between font-medium">
            <span>Итого</span>
            <span>{getTotalWithDelivery()} ₽</span>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 pt-8 pb-4 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={handleBackStep}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="ml-2 text-xl text-gray-900">Оформление заказа</h1>
        </div>

        {renderStepIndicator()}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 pb-48">
          {currentStep === 'delivery' && renderDeliveryStep()}
          {currentStep === 'contact' && renderContactStep()}
          {currentStep === 'payment' && renderPaymentStep()}
        </div>
      </div>

      {/* Bottom Bar - Fixed Payment Button (above navigation) */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-[100]">
        <Button 
          onClick={handleNext}
          disabled={!canProceed()}
          className={`w-full py-3 text-lg font-semibold ${
            canProceed() 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentStep === 'payment' ? (
            <>
              <CreditCard size={20} className="mr-2" />
              Заказать • {getTotalWithDelivery()} ₽
            </>
          ) : (
            'Продолжить'
          )}
        </Button>
      </div>
    </div>
  );
}