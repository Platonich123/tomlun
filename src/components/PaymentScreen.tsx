import { useState } from 'react';
import { ArrowLeft, CreditCard, Smartphone, Shield } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface PaymentScreenProps {
  onBack: (screen?: string) => void;
  onNavigate: (screen: string, data?: any) => void;
  bookingData: any;
  onPaymentSuccess: (orderData: any) => string;
}

export function PaymentScreen({ onBack, onNavigate, bookingData, onPaymentSuccess }: PaymentScreenProps) {
  const [selectedMethod, setSelectedMethod] = useState('sbp');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Банковская карта',
      description: 'Visa, MasterCard, МИР',
      icon: CreditCard
    },
    {
      id: 'sbp',
      name: 'СБП',
      description: 'Система быстрых платежей',
      icon: Smartphone
    }
  ];

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Имитация процесса оплаты
    setTimeout(() => {
      const orderId = onPaymentSuccess(bookingData);
      setIsProcessing(false);
      
      // После успешной оплаты остаемся на странице заказов
      // Убираем автоматический переход на главную
    }, 2000);
  };

  const getPaymentTitle = () => {
    switch (bookingData?.type) {
      case 'cinema':
        return 'Оплата билетов в кино';
      case 'club':
        return 'Оплата билетов в клуб';
      case 'food':
        return 'Оплата заказа';
      default:
        return 'Оплата';
    }
  };

  const formatCardNumber = (value: string) => {
    // Удаляем все нецифровые символы
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    // Добавляем пробелы каждые 4 цифры
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  if (isProcessing) {
    return (
      <div className="h-full bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl text-foreground mb-2">Обработка платежа...</h2>
          <p className="text-muted-foreground">Пожалуйста, подождите</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="bg-background px-4 pt-8 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => onBack()}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="ml-2 text-xl text-foreground">{getPaymentTitle()}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-6">
          {/* Order Details */}
          <Card className="bg-card border-border">
            <div className="p-4">
              <h3 className="font-medium text-card-foreground mb-3">Детали заказа</h3>
              <div className="space-y-2 text-sm">
                {bookingData?.type === 'cinema' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Фильм</span>
                      <span className="text-foreground">{bookingData.movieTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Дата и время</span>
                      <span className="text-foreground">{bookingData.date} {bookingData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Места</span>
                      <span className="text-foreground">
                        {bookingData.seats?.map((seat: any) => `${seat.row}${seat.seat}`).join(', ')}
                      </span>
                    </div>
                  </>
                )}
                
                {bookingData?.type === 'club' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Мероприятие</span>
                      <span className="text-foreground">{bookingData.eventTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Дата и время</span>
                      <span className="text-foreground">{bookingData.date} {bookingData.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Столики</span>
                      <span className="text-foreground">{bookingData.tables?.length}</span>
                    </div>
                  </>
                )}

                {bookingData?.type === 'food' && (
                  <>
                    {bookingData.items && bookingData.items.length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Состав заказа</span>
                          <span className="text-foreground">{bookingData.items.length} позиций</span>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {bookingData.items.map((item: any, index: number) => (
                            <div key={index} className="bg-muted/50 p-2 rounded text-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium">{item.name}</span>
                                <span>x{item.quantity}</span>
                              </div>
                              {item.addons && item.addons.length > 0 && (
                                <div className="ml-2 space-y-1">
                                  {item.addons.map((addon: any, addonIndex: number) => (
                                    <div key={addonIndex} className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>+ {addon.name}</span>
                                      <span>{addon.price} ₽</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <div className="flex items-center justify-between mt-1 pt-1 border-t border-border/50">
                                <span className="text-muted-foreground">Стоимость:</span>
                                <span className="font-medium">{item.totalPrice} ₽</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Доставка</span>
                          <span className="text-foreground">
                            {bookingData.deliveryType === 'delivery' ? 'Доставка (+150 ₽)' : 'Самовывоз'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Товаров</span>
                          <span className="text-foreground">{bookingData.itemCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Доставка</span>
                          <span className="text-foreground">
                            {bookingData.deliveryType === 'delivery' ? 'Доставка' : 'Самовывоз'}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}

                <div className="border-t border-border pt-2 flex justify-between font-medium">
                  <span className="text-foreground">Итого</span>
                  <span className="text-foreground">{bookingData?.totalPrice} ₽</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <div>
            <h3 className="font-medium text-foreground mb-3">Способ оплаты</h3>
            <div className="space-y-3">
              {paymentMethods.map(method => {
                const Icon = method.icon;
                return (
                  <Card
                    key={method.id}
                    className={`cursor-pointer transition-colors border ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-border bg-card hover:border-blue-500/50'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="p-4 flex items-center space-x-3">
                      <Icon size={24} className={
                        selectedMethod === method.id ? 'text-blue-600' : 'text-muted-foreground'
                      } />
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground">{method.name}</h4>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedMethod === method.id
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedMethod === method.id && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Payment Form */}
          {selectedMethod === 'card' && (
            <Card className="bg-card border-border">
              <div className="p-4 space-y-4">
                <div>
                  <Label htmlFor="cardNumber" className="text-foreground">Номер карты</Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiryDate" className="text-foreground">Срок действия</Label>
                    <Input
                      id="expiryDate"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cvv" className="text-foreground">CVV</Label>
                    <Input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="123"
                      maxLength={3}
                      className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="cardholderName" className="text-foreground">Имя держателя карты</Label>
                  <Input
                    id="cardholderName"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    placeholder="IVAN PETROV"
                    className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </Card>
          )}

          {selectedMethod === 'sbp' && (
            <Card className="bg-card border-border">
              <div className="p-4 space-y-4">
                <div>
                  <Label htmlFor="phoneNumber" className="text-foreground">Номер телефона</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                    className="mt-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    После нажатия кнопки "Оплатить" вы будете перенаправлены в приложение вашего банка для подтверждения платежа.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Security Info */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Shield size={16} className="text-green-600" />
            <span>Все платежи защищены SSL-шифрованием</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-background border-t border-border p-6 flex-shrink-0">
        <Button 
          onClick={handlePayment}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold"
          disabled={
            (selectedMethod === 'card' && (!cardNumber || !expiryDate || !cvv || !cardholderName)) ||
            (selectedMethod === 'sbp' && !phoneNumber)
          }
        >
          Оплатить {bookingData?.totalPrice} ₽
        </Button>
      </div>
    </div>
  );
}