import { useState, useRef } from 'react';
import { ArrowLeft, Eye, EyeOff, Phone, Lock, User, Mail, X } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface RegisterScreenProps {
  onBack: () => void;
  onClose?: () => void;
}

export function RegisterScreen({ onBack, onClose }: RegisterScreenProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const phoneInputRef = useRef<HTMLInputElement>(null);

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

  const validateEmail = (email: string) => {
    return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6 && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/.test(password);
  };

  const validatePhone = (phone: string) => {
    // Пример: +7 900 000-00-00 или +79000000000
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('7');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    // Если пользователь пытается удалить +7, возвращаем +7
    if (inputValue.length < 2) {
      setFormData(prev => ({ ...prev, phoneNumber: '+7 ' }));
      setTimeout(() => {
        if (phoneInputRef.current) {
          phoneInputRef.current.setSelectionRange(3, 3);
        }
      }, 0);
      return;
    }
    
    const { formatted } = formatPhoneNumber(inputValue, cursorPosition);
    setFormData(prev => ({ ...prev, phoneNumber: formatted }));
    
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
        setFormData(prev => ({ ...prev, phoneNumber: formatted }));
        
        setTimeout(() => {
          if (phoneInputRef.current) {
            phoneInputRef.current.setSelectionRange(cursorPosition - 2, cursorPosition - 2);
          }
        }, 0);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    if (!validateEmail(formData.email)) {
      setError('Введите корректный email');
      setIsLoading(false);
      return;
    }
    if (!validatePassword(formData.password)) {
      setError('Пароль должен быть не менее 6 символов и содержать хотя бы один специальный символ');
      setIsLoading(false);
      return;
    }
    if (!validatePhone(formData.phoneNumber)) {
      setError('Введите корректный номер телефона в формате +7XXXXXXXXXX');
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phoneNumber, // исправлено: phone вместо phone_number
          password: formData.password
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка регистрации');
        setIsLoading(false);
        return;
      }
      // Успех — переход на экран входа
      alert('Регистрация успешна! Теперь войдите в аккаунт.');
      onBack();
    } catch (err) {
      setError('Ошибка сети или сервера');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 pt-8 pb-8 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-white" />
          </div>
          <h1 className="text-xl mb-2">Регистрация</h1>
          <p className="text-purple-100">Создайте новый аккаунт</p>
        </div>
      </div>
      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4">
        <Card className="w-full max-w-sm mx-auto bg-white border-gray-100 shadow-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
            </div>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-gray-700">Имя</Label>
                <div className="relative mt-1">
                  <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Введите ваше имя"
                    className="pl-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <div className="relative mt-1">
                  <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="example@mail.com"
                    className="pl-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-700">Номер телефона</Label>
                <div className="relative mt-1">
                  <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    ref={phoneInputRef}
                    id="phone"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    onKeyDown={handlePhoneKeyDown}
                    placeholder="+7 (___) ___-__-__"
                    className="pl-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700">Пароль</Label>
                <div className="relative mt-1">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Введите пароль"
                    className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-gray-700">Подтвердите пароль</Label>
                <div className="relative mt-1">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Повторите пароль"
                    className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Регистрация...</span>
                </div>
              ) : (
                'Зарегистрироваться'
              )}
            </Button>
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={onBack}
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline block w-full"
              >
                Уже есть аккаунт? Войти
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm text-gray-500 hover:text-gray-700 hover:underline block w-full"
                >
                  Продолжить без входа
                </button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}