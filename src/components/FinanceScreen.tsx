import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Filter, 
  ChevronLeft, 
  ChevronRight,
  Receipt,
  User,
  Clock,
  CreditCard
} from 'lucide-react';

interface Transaction {
  id: number;
  order_type: string;
  total_price: number;
  status: string;
  created_at: string;
  user_name: string;
  user_email: string;
  item_name: string;
}

interface FinanceData {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalOrders: number;
    totalRevenue: number;
  };
}

interface FinanceScreenProps {
  onBack: () => void;
}

export function FinanceScreen({ onBack }: FinanceScreenProps) {
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const periods = [
    { key: 'all', label: 'Все время', icon: Calendar },
    { key: 'today', label: 'Сегодня', icon: Clock },
    { key: 'week', label: 'Неделя', icon: TrendingUp },
    { key: 'month', label: 'Месяц', icon: Calendar }
  ];

  const fetchFinanceData = async (period: string, page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/admin/finance/transactions?period=${period}&page=${page}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка загрузки финансовых данных');
      }

      const data = await response.json();
      setFinanceData(data);
    } catch (err) {
      console.error('Ошибка загрузки финансовых данных:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData(selectedPeriod, currentPage);
  }, [selectedPeriod, currentPage]);

  const handlePeriodChange = (period: 'all' | 'today' | 'week' | 'month') => {
    setSelectedPeriod(period);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderTypeIcon = (orderType: string) => {
    switch (orderType) {
      case 'cinema':
        return '🎬';
      case 'food':
        return '🍕';
      case 'club':
        return '🎵';
      default:
        return '📦';
    }
  };

  const getOrderTypeColor = (orderType: string) => {
    switch (orderType) {
      case 'cinema':
        return 'bg-blue-100 text-blue-600';
      case 'food':
        return 'bg-orange-100 text-orange-600';
      case 'club':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <ChevronLeft size={20} />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <DollarSign size={24} className="text-green-600" />
                  <span>Финансы</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Управление доходами</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Summary Card */}
        {financeData && (
          <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Общая выручка</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatPrice(financeData.summary.totalRevenue)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-300">Заказов</p>
                <p className="text-xl font-semibold text-gray-900 dark:text-white">
                  {financeData.summary.totalOrders}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Period Filters */}
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Период</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {periods.map((period) => {
              const IconComponent = period.icon;
              return (
                <Button
                  key={period.key}
                  onClick={() => handlePeriodChange(period.key as any)}
                  variant={selectedPeriod === period.key ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    selectedPeriod === period.key 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-800'
                  }`}
                >
                  <IconComponent size={14} />
                  <span className="text-xs">{period.label}</span>
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Transactions List */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <Receipt size={20} />
              <span>Транзакции</span>
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Загрузка транзакций...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              <p>{error}</p>
              <Button 
                onClick={() => fetchFinanceData(selectedPeriod, currentPage)}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Попробовать снова
              </Button>
            </div>
          ) : financeData && financeData.transactions.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {financeData.transactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">{getOrderTypeIcon(transaction.order_type)}</span>
                          <Badge className={`text-xs ${getOrderTypeColor(transaction.order_type)}`}>
                            {transaction.order_type}
                          </Badge>
                          <span className="text-xs text-gray-500">#{transaction.id}</span>
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {transaction.item_name || transaction.order_type}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <User size={12} />
                            <span>{transaction.user_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{formatDate(transaction.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 dark:text-green-400">
                          {formatPrice(transaction.total_price)}
                        </p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {financeData.pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Страница {financeData.pagination.page} из {financeData.pagination.totalPages}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === financeData.pagination.totalPages}
                        variant="outline"
                        size="sm"
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-300">Нет транзакций</p>
              <p className="text-sm mt-2">В выбранном периоде транзакции отсутствуют</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
