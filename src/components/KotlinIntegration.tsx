import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Film, Plus, Edit, Trash2, Search, Star, Clock, Tag } from 'lucide-react';

interface KotlinMovie {
  id: number;
  title: string;
  genre: string;
  duration: number | null;
  rating: number | null;
  description: string | null;
  posterUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export function KotlinIntegration() {
  const [movies, setMovies] = useState<KotlinMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState<KotlinMovie | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    duration: '',
    rating: '',
    description: ''
  });

  // Загрузка фильмов с Kotlin API
  const loadMovies = async () => {
    setLoading(true);
    try {
      console.log('🎬 Загружаем фильмы с Kotlin API...');
      const response = await fetch('http://localhost:8080/api/kotlin/movies');
      console.log('🎬 Kotlin API - статус:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🎬 Фильмы загружены с Kotlin:', data.length, 'записей');
        setMovies(data);
      } else {
        const errorText = await response.text();
        console.error('❌ Ошибка загрузки с Kotlin API:', response.status, errorText);
      }
    } catch (error) {
      console.error('💥 Критическая ошибка загрузки с Kotlin:', error);
    } finally {
      setLoading(false);
    }
  };

  // Поиск фильмов через Kotlin API
  const searchMovies = async () => {
    if (!searchTerm.trim()) {
      loadMovies();
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 Ищем фильмы через Kotlin API:', searchTerm);
      const response = await fetch(`http://localhost:8080/api/kotlin/movies/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Результаты поиска:', data.length, 'записей');
        setMovies(data);
      } else {
        console.error('❌ Ошибка поиска:', response.status);
      }
    } catch (error) {
      console.error('💥 Ошибка поиска:', error);
    } finally {
      setLoading(false);
    }
  };

  // Создание/обновление фильма через Kotlin API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const movieData = {
      title: formData.title,
      genre: formData.genre,
      duration: formData.duration ? parseInt(formData.duration) : null,
      rating: formData.rating ? parseFloat(formData.rating) : null,
      description: formData.description || null
    };

    try {
      const url = editingMovie 
        ? `http://localhost:8080/api/kotlin/movies/${editingMovie.id}`
        : 'http://localhost:8080/api/kotlin/movies';
      
      const method = editingMovie ? 'PUT' : 'POST';
      
      console.log(`${method} запрос к Kotlin API:`, url);
      console.log('Данные фильма:', movieData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Фильм сохранен через Kotlin API:', result);
        
        if (editingMovie) {
          setMovies(movies.map(movie => 
            movie.id === editingMovie.id ? result : movie
          ));
        } else {
          setMovies([result, ...movies]);
        }
        
        setShowForm(false);
        setEditingMovie(null);
        setFormData({ title: '', genre: '', duration: '', rating: '', description: '' });
      } else {
        const errorText = await response.text();
        console.error('❌ Ошибка сохранения через Kotlin API:', response.status, errorText);
        alert(`Ошибка сохранения: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('💥 Ошибка сохранения:', error);
      alert('Произошла ошибка при сохранении');
    }
  };

  // Удаление фильма через Kotlin API
  const handleDelete = async (movieId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот фильм?')) return;
    
    try {
      console.log('🗑️ Удаляем фильм через Kotlin API:', movieId);
      const response = await fetch(`http://localhost:8080/api/kotlin/movies/${movieId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        console.log('✅ Фильм удален через Kotlin API');
        setMovies(movies.filter(movie => movie.id !== movieId));
      } else {
        console.error('❌ Ошибка удаления:', response.status);
        alert('Ошибка при удалении фильма');
      }
    } catch (error) {
      console.error('💥 Ошибка удаления:', error);
      alert('Произошла ошибка при удалении');
    }
  };

  // Редактирование фильма
  const handleEdit = (movie: KotlinMovie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration?.toString() || '',
      rating: movie.rating?.toString() || '',
      description: movie.description || ''
    });
    setShowForm(true);
  };

  // Сброс формы
  const resetForm = () => {
    setFormData({ title: '', genre: '', duration: '', rating: '', description: '' });
    setEditingMovie(null);
    setShowForm(false);
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Интеграция с Kotlin Backend
        </h1>
        <p className="text-gray-600">
          Этот раздел демонстрирует работу с новым Kotlin API (порт 8080) 
          параллельно с существующим Node.js API (порт 3001)
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего фильмов</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{movies.length}</div>
            <p className="text-xs text-muted-foreground">
              Загружено с Kotlin API
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Поиск</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{searchTerm ? 'Активен' : 'Неактивен'}</div>
            <p className="text-xs text-muted-foreground">
              {searchTerm ? `Поиск: "${searchTerm}"` : 'Введите поисковый запрос'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отфильтровано</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredMovies.length}</div>
            <p className="text-xs text-muted-foreground">
              Результатов поиска
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Поиск и добавление */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск фильмов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMovies()}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={searchMovies} variant="outline">
            🔍 Поиск
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить фильм
          </Button>
          <Button onClick={loadMovies} variant="outline">
            🔄 Обновить
          </Button>
        </div>
      </div>

      {/* Форма добавления/редактирования */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {editingMovie ? 'Редактировать фильм' : 'Добавить новый фильм'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Название *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="genre">Жанр *</Label>
                  <Input
                    id="genre"
                    value={formData.genre}
                    onChange={(e) => setFormData({...formData, genre: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Длительность (мин)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="rating">Рейтинг</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Описание</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
                <Button type="submit">
                  {editingMovie ? 'Сохранить изменения' : 'Добавить фильм'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Список фильмов */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка фильмов с Kotlin API...</p>
            </div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <Card className="p-12 text-center">
            <Film className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Фильмы не найдены по вашему запросу' : 'Фильмы не загружены'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-gray-500 mt-2">
                Проверьте, запущен ли Kotlin backend на порту 8080
              </p>
            )}
          </Card>
        ) : (
          filteredMovies.map((movie) => (
            <Card key={movie.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                    <Film className="w-6 h-6 text-blue-600" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-lg truncate">{movie.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        {movie.genre}
                      </span>
                      {movie.duration && (
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {movie.duration} мин
                        </span>
                      )}
                      {movie.rating && (
                        <span className="flex items-center">
                          <Star className="w-4 h-4 mr-1" />
                          {movie.rating}
                        </span>
                      )}
                    </div>
                    {movie.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {movie.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(movie)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600"
                    onClick={() => handleDelete(movie.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Информация об API */}
      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Информация об интеграции</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Kotlin API:</strong> http://localhost:8080/api/kotlin/movies</p>
            <p><strong>Node.js API:</strong> http://localhost:3001/api/admin/movies</p>
            <p><strong>Статус:</strong> {movies.length > 0 ? '✅ Подключено' : '❌ Не подключено'}</p>
            <p><strong>База данных:</strong> PostgreSQL (порт 1024)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 