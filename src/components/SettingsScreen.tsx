import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User, Mail, Phone, MapPin, Save, Eye, EyeOff } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface User {
  id?: number;
  phoneNumber: string;
  name: string;
  email: string;
  city: string;
  address: string;
  totalClubHours?: number;
}

interface SettingsScreenProps {
  onBack: () => void;
  user: User | null;
  onUserUpdate: (updatedUser: User) => void;
}

export function SettingsScreen({ onBack, user, onUserUpdate }: SettingsScreenProps) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    city: user?.city || '',
    address: user?.address || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [activeTab, setActiveTab] = useState<'personal' | 'password'>('personal');
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        city: user.city || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const formatPhoneNumber = (value: string, cursorPosition: number = 0) => {
    // Получаем только цифры
    const digits = value.replace(/\D/g, '');
    
    // Если пустая строка
    if (digits.length === 0) {
      return { formatted: '', cursorPos: 0 };
    }
    
    // Всегда начинаем с +7
    let formatted = '+7';
    let newCursorPos = cursorPosition;
    
    // Добавляем цифры с форматированием
    if (digits.length > 1) {
      const phoneDigits = digits.startsWith('7') ? digits.slice(1) : digits;
      
      if (phoneDigits.length > 0) {
        formatted += ' ';
        if (phoneDigits.length <= 3) {
          formatted += phoneDigits;
        } else if (phoneDigits.length <= 6) {
          formatted += phoneDigits.slice(0, 3) + ' ' + phoneDigits.slice(3);
        } else if (phoneDigits.length <= 8) {
          formatted += phoneDigits.slice(0, 3) + ' ' + phoneDigits.slice(3, 6) + '-' + phoneDigits.slice(6);
        } else if (phoneDigits.length <= 10) {
          formatted += phoneDigits.slice(0, 3) + ' ' + phoneDigits.slice(3, 6) + '-' + phoneDigits.slice(6, 8) + '-' + phoneDigits.slice(8, 10);
        } else {
          // Ограничиваем до 10 цифр после +7
          formatted += phoneDigits.slice(0, 3) + ' ' + phoneDigits.slice(3, 6) + '-' + phoneDigits.slice(6, 8) + '-' + phoneDigits.slice(8, 10);
        }
      }
    }
    
    // Корректируем позицию курсора
    if (cursorPosition > value.length) {
      newCursorPos = formatted.length;
    }
    
    return { formatted, cursorPos: newCursorPos };
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    // Если пользователь пытается удалить +7, возвращаем +7
    if (inputValue.length < 2) {
      handleInputChange('phoneNumber', '+7 ');
      setTimeout(() => {
        if (phoneInputRef.current) {
          phoneInputRef.current.setSelectionRange(3, 3);
        }
      }, 0);
      return;
    }
    
    const { formatted } = formatPhoneNumber(inputValue, cursorPosition);
    handleInputChange('phoneNumber', formatted);
    
    // Устанавливаем курсор в правильную позицию после форматирования
    setTimeout(() => {
      if (phoneInputRef.current) {
        let newPos = cursorPosition;
        
        // Если курсор был в конце, ставим в конец отформатированной строки
        if (cursorPosition >= inputValue.length) {
          newPos = formatted.length;
        }
        // Если курсор был на символе форматирования, сдвигаем его
        else if (formatted[cursorPosition] && /[\s-]/.test(formatted[cursorPosition])) {
          newPos = cursorPosition + 1;
        }
        
        phoneInputRef.current.setSelectionRange(newPos, newPos);
      }
    }, 0);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const cursorPosition = (e.target as HTMLInputElement).selectionStart || 0;
    
    // Запрещаем удаление +7
    if ((e.key === 'Backspace' || e.key === 'Delete') && cursorPosition <= 3) {
      e.preventDefault();
      return;
    }
    
    // При Backspace на символе форматирования, удаляем предыдущую цифру
    if (e.key === 'Backspace' && cursorPosition > 3) {
      const currentChar = formData.phoneNumber[cursorPosition - 1];
      if (currentChar && /[\s-]/.test(currentChar)) {
        e.preventDefault();
        const newValue = formData.phoneNumber.slice(0, cursorPosition - 2) + formData.phoneNumber.slice(cursorPosition);
        const { formatted } = formatPhoneNumber(newValue);
        handleInputChange('phoneNumber', formatted);
        
        setTimeout(() => {
          if (phoneInputRef.current) {
            phoneInputRef.current.setSelectionRange(cursorPosition - 2, cursorPosition - 2);
          }
        }, 0);
      }
    }
  };

  const validatePersonalData = () => {
    if (!formData.name.trim()) {
      setError('Имя обязательно для заполнения');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email обязателен для заполнения');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Введите корректный email');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      setError('Номер телефона обязателен для заполнения');
      return false;
    }
    return true;
  };

  const validatePasswordData = () => {
    if (!formData.currentPassword) {
      setError('Введите текущий пароль');
      return false;
    }
    if (!formData.newPassword) {
      setError('Введите новый пароль');
      return false;
    }
    if (formData.newPassword.length < 6) {
      setError('Новый пароль должен содержать минимум 6 символов');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    return true;
  };

  const handleSavePersonalData = async () => {
    if (!validatePersonalData()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phoneNumber,
          city: formData.city,
          address: formData.address
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Ошибка при сохранении данных');
        return;
      }

      // Обновляем данные пользователя в localStorage и состоянии
      const updatedUser = { ...user, ...data.user };
      
      // Сохраняем токен, если он есть
      if (token && !updatedUser.token) {
        updatedUser.token = token;
      }
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUserUpdate(updatedUser);
      
      setSuccess('Личные данные успешно обновлены');
    } catch (err) {
      setError('Ошибка сети или сервера');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!validatePasswordData()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Ошибка при смене пароля');
        return;
      }

      setSuccess('Пароль успешно изменен');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err) {
      setError('Ошибка сети или сервера');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 pt-8 pb-6 flex-shrink-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="ml-2 text-xl font-medium">Настройки</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="p-4 space-y-4 pb-8">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'personal'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Личные данные
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Смена пароля
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          {/* Personal Data Tab */}
          {activeTab === 'personal' && (
            <Card className="p-4 bg-white border-gray-100 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Имя *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                      placeholder="Введите ваше имя"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Номер телефона *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      ref={phoneInputRef}
                      id="phone"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                      className="pl-10"
                      placeholder="+7 (xxx) xxx-xx-xx"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                    Город
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      id="city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="pl-10"
                      placeholder="Введите ваш город"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Адрес доставки
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="pl-10"
                      placeholder="Введите адрес доставки"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSavePersonalData}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  <Save size={16} className="mr-2" />
                  {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
              </div>
            </Card>
          )}

          {/* Password Change Tab */}
          {activeTab === 'password' && (
            <Card className="p-4 bg-white border-gray-100 shadow-sm">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
                    Текущий пароль *
                  </Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      className="pr-10"
                      placeholder="Введите текущий пароль"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                    Новый пароль *
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className="pr-10"
                      placeholder="Введите новый пароль (минимум 6 символов)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Подтвердите новый пароль *
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pr-10"
                      placeholder="Повторите новый пароль"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button 
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                >
                  <Save size={16} className="mr-2" />
                  {isLoading ? 'Изменение...' : 'Изменить пароль'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 