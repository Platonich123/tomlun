import { useState, useRef } from 'react';
import { Eye, EyeOff, Phone, Lock, User, X, Mail } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginScreenProps {
  onLogin?: () => void;
  onNavigate: (screen: string) => void;
  onClose?: () => void;
}

export function LoginScreen({ onLogin, onNavigate, onClose }: LoginScreenProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    // Если пользователь пытается удалить +7, возвращаем +7
    if (inputValue.length < 2) {
      setPhoneNumber('+7 ');
      setError('');
      setTimeout(() => {
        if (phoneInputRef.current) {
          phoneInputRef.current.setSelectionRange(3, 3);
        }
      }, 0);
      return;
    }
    
    const { formatted } = formatPhoneNumber(inputValue, cursorPosition);
    setPhoneNumber(formatted);
    setError('');
    
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
      const currentChar = phoneNumber[cursorPosition - 1];
      if (currentChar && /[\s-]/.test(currentChar)) {
        e.preventDefault();
        const newValue = phoneNumber.slice(0, cursorPosition - 2) + phoneNumber.slice(cursorPosition);
        const { formatted } = formatPhoneNumber(newValue);
        setPhoneNumber(formatted);
        
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
    try {
      const loginData = loginMethod === 'phone' 
        ? { phone: phoneNumber, password }
        : { email, password };
        
      const res = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка авторизации');
        setIsLoading(false);
        return;
      }
      // Сохраняем токен в localStorage
      localStorage.setItem('token', data.token);
      // Сохраняем пользователя с токеном
      const userWithToken = { ...data.user, token: data.token };
      localStorage.setItem('user', JSON.stringify(userWithToken));
      // Вызываем onLogin
      if (onLogin) onLogin();
    } catch (err) {
      setError('Ошибка сети или сервера');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    if (loginMethod === 'phone') {
      setPhoneNumber('+7 920 123-45-67');
      setPassword('123');
    } else {
      setEmail('admin@example.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-8">
        <div className="flex items-center">
          <User className="text-blue-600 mr-2" size={24} />
          <h1 className="text-xl font-semibold text-gray-900">Вход</h1>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-8">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Добро пожаловать!</h2>
              <p className="text-gray-600">Войдите в свой аккаунт</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Переключатель метода входа */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'phone'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  По телефону
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'email'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  По email
                </button>
              </div>

              {loginMethod === 'phone' ? (
                <div>
                  <Label htmlFor="phone" className="text-gray-700">Номер телефона</Label>
                  <div className="relative mt-1">
                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      ref={phoneInputRef}
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      onKeyDown={handlePhoneKeyDown}
                      placeholder="+7 (___) ___-__-__"
                      className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="email" className="text-gray-700">Email</Label>
                  <div className="relative mt-1">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@example.com"
                      className="pl-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="password" className="text-gray-700">Пароль</Label>
                <div className="relative mt-1">
                  <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    className="pl-10 pr-10 bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
            </div>

            <Button
              type="submit"
              disabled={isLoading || !phoneNumber || !password}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>

            <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={fillDemoCredentials}
                  variant="outline"
                  className="flex-1"
                >
                  Демо данные
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setEmail('admin@example.com');
                    setPassword('admin123');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Войти как админ
                </Button>
              </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-gray-600">
                Нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Зарегистрироваться
                </button>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}