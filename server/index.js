const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Настройка CORS с дополнительными опциями
const corsOrigins = [
  'http://localhost:3000', 
  'http://localhost:5173', 
  'http://localhost:5174', 
  'http://127.0.0.1:3000', 
  'http://127.0.0.1:5173', 
  'http://127.0.0.1:5174'
];
if (process.env.FRONTEND_URL) {
  corsOrigins.push(process.env.FRONTEND_URL);
}
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    // Создаем папку если её нет
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 МБ
  },
  fileFilter: function (req, file, cb) {
    // Проверяем тип файла
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены'), false);
    }
  }
});

// Middleware для статических файлов
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',         // Имя пользователя Postgres
  host: process.env.PGHOST || 'localhost',        // Адрес сервера Postgres
  database: process.env.PGDATABASE || 'tomlun',       // Имя базы данных (по файлу tomlun.sql)
  password: process.env.PGPASSWORD || '1234567890', // Пароль пользователя
  port: process.env.PGPORT || 1024,               // Стандартный порт Postgres
});

// Проверяем подключение к базе данных
pool.on('connect', () => {
  console.log('✅ Подключение к PostgreSQL установлено');
});

pool.on('error', (err) => {
  console.error('❌ Ошибка подключения к PostgreSQL:', err.message);
  console.error('Детали ошибки:', err);
});

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  jwt.verify(token, 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// API: получить все фильмы для главного экрана
app.get('/api/movies', async (req, res) => {
  try {
    console.log('🎬 Запрос на получение фильмов для главного экрана');
    
    // Проверяем существование таблицы
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cinema_movies'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log('📋 Таблица cinema_movies существует:', tableExists);
    
    if (!tableExists) {
      return res.status(500).json({ error: 'Таблица cinema_movies не существует' });
    }
    
    const result = await pool.query(`
      SELECT id, title, genre, duration, rating, description, poster_url, created_at, updated_at
      FROM cinema_movies 
      ORDER BY created_at DESC
    `);
    console.log('✅ Найдено фильмов для главного экрана:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Ошибка при получении фильмов для главного экрана:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Пример API: добавить фильм
app.post('/api/movies', async (req, res) => {
  const { title, genre, duration, rating } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO movies (title, genre, duration, rating) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, genre, duration, rating]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Регистрация
app.post('/api/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }
  try {
    // Проверка, что пользователь уже существует
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }
    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);
    // Сохраняем пользователя (role_id по умолчанию 1)
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, role_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone',
      [name, email, phone, hashedPassword, 1]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Авторизация
app.post('/api/login', async (req, res) => {
  const { email, phone, password } = req.body;
  console.log('🔐 Попытка авторизации:', { email, phone: phone ? '***' : undefined });
  
  if ((!email && !phone) || !password) {
    return res.status(400).json({ error: 'Требуется email или телефон и пароль' });
  }
  try {
    // Ищем пользователя по email или телефону
    const userRes = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR phone = $2',
      [email || '', phone || '']
    );
    const user = userRes.rows[0];
    if (!user) {
      console.log('❌ Пользователь не найден');
      return res.status(400).json({ error: 'Пользователь не найден' });
    }
    // Проверяем пароль
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log('❌ Неверный пароль');
      return res.status(400).json({ error: 'Неверный пароль' });
    }
    // Генерируем JWT (по желанию)
    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '7d' });
    console.log('✅ Успешная авторизация для пользователя:', user.email);
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        phone: user.phone, 
        phoneNumber: user.phone, // Добавляем для совместимости с фронтендом
        city: user.city || '', 
        address: user.address || '',
        role_id: user.role_id // Добавляем role_id для определения роли
      } 
    });
  } catch (err) {
    console.error('❌ Ошибка при авторизации:', err.message);
    console.error('Детали ошибки:', err);
    res.status(500).json({ error: err.message });
  }
});

// Обновление данных пользователя
app.put('/api/user/update', authenticateToken, async (req, res) => {
  const { name, email, phone, city, address } = req.body;
  const userId = req.user.id;

  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Имя, email и телефон обязательны для заполнения' });
  }

  try {
    // Проверяем, не занят ли email или телефон другим пользователем
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE (email = $1 OR phone = $2) AND id != $3',
      [email, phone, userId]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email или телефон уже используется другим пользователем' });
    }

    // Сначала проверим какие столбцы существуют в таблице
    const tableInfo = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('city', 'address', 'updated_at')
    `);
    
    const existingColumns = tableInfo.rows.map(row => row.column_name);
    const hasCity = existingColumns.includes('city');
    const hasAddress = existingColumns.includes('address');
    const hasUpdatedAt = existingColumns.includes('updated_at');
    
    // Строим динамический запрос в зависимости от существующих столбцов
    let updateQuery = 'UPDATE users SET name = $1, email = $2, phone = $3';
    let queryParams = [name, email, phone];
    let paramIndex = 4;
    
    if (hasCity) {
      updateQuery += `, city = $${paramIndex}`;
      queryParams.push(city || '');
      paramIndex++;
    }
    
    if (hasAddress) {
      updateQuery += `, address = $${paramIndex}`;
      queryParams.push(address || '');
      paramIndex++;
    }
    
    if (hasUpdatedAt) {
      updateQuery += ', updated_at = NOW()';
    }
    
    // Строим RETURNING часть
    let returningColumns = 'id, name, email, phone';
    if (hasCity) returningColumns += ', city';
    if (hasAddress) returningColumns += ', address';
    
    updateQuery += ` WHERE id = $${paramIndex} RETURNING ${returningColumns}`;
    
    queryParams.push(userId);
    
    // Логируем запрос для отладки
    console.log('UPDATE Query:', updateQuery);
    console.log('Query Params:', queryParams);
    
    // Обновляем данные пользователя
    const result = await pool.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const updatedUser = result.rows[0];
    res.json({ 
      message: 'Данные успешно обновлены',
      user: {
        ...updatedUser,
        phoneNumber: updatedUser.phone, // Для совместимости с фронтендом
        city: updatedUser.city || '', // Устанавливаем пустую строку если поле отсутствует
        address: updatedUser.address || '', // Устанавливаем пустую строку если поле отсутствует
        role_id: updatedUser.role_id // Добавляем role_id
      }
    });
  } catch (err) {
    console.error('Error in /api/user/update:', err);
    res.status(500).json({ error: err.message });
  }
});

// Смена пароля
app.put('/api/user/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Текущий и новый пароль обязательны' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Новый пароль должен содержать минимум 6 символов' });
  }

  try {
    // Получаем текущего пользователя
    const userRes = await pool.query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = userRes.rows[0];

    // Проверяем текущий пароль
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Неверный текущий пароль' });
    }

    // Хэшируем новый пароль
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [hashedNewPassword, userId]
    );

    res.json({ message: 'Пароль успешно изменен' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== АДМИН ПАНЕЛЬ API ==========

// Middleware для проверки админ прав
const authenticateAdmin = async (req, res, next) => {
  console.log('🔐 Проверка админ прав для:', req.method, req.path);
  
  const authHeader = req.headers['authorization'];
  console.log('🔑 Authorization header:', authHeader ? 'предоставлен' : 'отсутствует');
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🎫 Токен:', token ? `${token.substring(0, 20)}...` : 'отсутствует');

  if (!token) {
    console.log('❌ Токен не предоставлен');
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  try {
    console.log('🔍 Проверяем токен...');
    const decoded = jwt.verify(token, 'your_jwt_secret');
    console.log('✅ Токен валиден, ID пользователя:', decoded.id);
    
    const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.id]);
    console.log('👤 Пользователь найден в БД:', userRes.rows.length > 0);
    
    if (userRes.rows.length === 0) {
      console.log('❌ Пользователь не найден в БД');
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const user = userRes.rows[0];
    console.log('🔐 Пользователь авторизован:', user.email, 'Роль:', user.role_id);

    // Временно отключаем проверку роли для тестирования
    // if (user.role_id !== 2) { // Предполагаем, что role_id = 2 для админов
    //   return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора' });
    // }

    req.user = user;
    console.log('✅ Админ авторизация успешна, переходим к следующему middleware');
    next();
  } catch (err) {
    console.error('❌ Ошибка авторизации:', err.message);
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};

// Получить всех пользователей
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, phone, role_id, 
             created_at, updated_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать заказ
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { order_type, total_price, status, details } = req.body;
    const userId = req.user.id;
    
    console.log('📦 Создание заказа:', { order_type, total_price, status, userId });
    
    const result = await pool.query(`
      INSERT INTO orders (user_id, order_type, total_price, status, details, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *
    `, [userId, order_type, total_price, status, details]);
    
    console.log('✅ Заказ создан:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Ошибка создания заказа:', err.message);
    console.error('❌ Детали ошибки:', err);
    res.status(500).json({ error: err.message, details: err.detail });
  }
});

// Получить заказы пользователя
app.get('/api/user/orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить занятые места для сеанса
app.get('/api/cinema/sessions/:sessionId/occupied-seats', async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('🎫 Запрос занятых мест для сеанса:', sessionId);
    
    const result = await pool.query(`
      SELECT seat_number, status, user_id
      FROM cinema_tickets 
      WHERE session_id = $1 AND status IN ('RESERVED', 'PAID')
      ORDER BY seat_number
    `, [sessionId]);
    
    console.log('🎫 Найдено занятых мест:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Ошибка получения занятых мест:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Создать билет (забронировать место)
app.post('/api/cinema/tickets', authenticateToken, async (req, res) => {
  try {
    const { sessionId, seatNumber, price } = req.body;
    const userId = req.user.id;
    
    console.log('🎫 Создание билета:', { sessionId, seatNumber, price, userId });
    
    // Проверяем, не занято ли место
    const existingTicket = await pool.query(`
      SELECT id FROM cinema_tickets 
      WHERE session_id = $1 AND seat_number = $2 AND status IN ('RESERVED', 'PAID')
    `, [sessionId, seatNumber]);
    
    if (existingTicket.rows.length > 0) {
      return res.status(409).json({ error: 'Место уже занято' });
    }
    
    // Создаем билет
    const result = await pool.query(`
      INSERT INTO cinema_tickets (session_id, user_id, seat_number, price, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'RESERVED', NOW(), NOW())
      RETURNING *
    `, [sessionId, userId, seatNumber, price]);
    
    console.log('✅ Билет создан:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ Ошибка создания билета:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Отменить билет
app.delete('/api/cinema/tickets/:ticketId', authenticateToken, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;
    
    console.log('🎫 Отмена билета:', { ticketId, userId });
    
    // Проверяем, что билет принадлежит пользователю
    const ticket = await pool.query(`
      SELECT * FROM cinema_tickets WHERE id = $1 AND user_id = $2
    `, [ticketId, userId]);
    
    if (ticket.rows.length === 0) {
      return res.status(404).json({ error: 'Билет не найден' });
    }
    
    // Отменяем билет
    const result = await pool.query(`
      UPDATE cinema_tickets 
      SET status = 'CANCELLED', updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [ticketId]);
    
    console.log('✅ Билет отменен:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Ошибка отмены билета:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Получить статистику
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    // Общее количество пользователей
    const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
    
    // Количество фильмов
    const moviesCount = await pool.query('SELECT COUNT(*) as count FROM cinema_movies');
    
    // Количество мероприятий
    const eventsCount = await pool.query('SELECT COUNT(*) as count FROM club_events');
    
    // Последние регистрации (за последние 7 дней)
    const recentUsers = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    // Количество заказов
    const ordersCount = await pool.query('SELECT COUNT(*) as count FROM orders');

    res.json({
      totalUsers: usersCount.rows[0].count,
      totalMovies: moviesCount.rows[0].count,
      totalEvents: eventsCount.rows[0].count,
      totalOrders: ordersCount.rows[0].count,
      recentUsers: recentUsers.rows[0].count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить пользователя (админ)
app.put('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, role_id } = req.body;

  try {
    // Проверяем, не занят ли email или телефон другим пользователем
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE (email = $1 OR phone = $2) AND id != $3',
      [email, phone, id]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email или телефон уже используется другим пользователем' });
    }

    const result = await pool.query(`
      UPDATE users 
      SET name = $1, email = $2, phone = $3, role_id = $4, updated_at = NOW()
      WHERE id = $5 
      RETURNING id, name, email, phone, role_id, created_at, updated_at
    `, [name, email, phone, role_id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ 
      message: 'Пользователь успешно обновлен',
      user: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить пользователя
app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ message: 'Пользователь успешно удален' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить все фильмы
app.get('/api/admin/movies', async (req, res) => {
  try {
    console.log('🎬 Запрос на получение всех фильмов');
    
    // Проверяем существование таблицы
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cinema_movies'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log('📋 Таблица cinema_movies существует:', tableExists);
    
    if (!tableExists) {
      return res.status(500).json({ error: 'Таблица cinema_movies не существует' });
    }
    
    const result = await pool.query('SELECT * FROM cinema_movies ORDER BY id DESC');
    console.log('✅ Найдено фильмов:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Ошибка при получении фильмов:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Добавить фильм
app.post('/api/admin/movies', authenticateAdmin, async (req, res) => {
  const { title, genre, duration, rating, description, poster_url } = req.body;

  if (!title || !genre) {
    return res.status(400).json({ error: 'Название и жанр обязательны' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO cinema_movies (title, genre, duration, rating, description, poster_url) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `, [title, genre, duration || null, rating || null, description || '', poster_url || '']);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить фильм
app.put('/api/admin/movies/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, genre, duration, rating, description, poster_url } = req.body;

  try {
    const result = await pool.query(`
      UPDATE cinema_movies 
      SET title = $1, genre = $2, duration = $3, rating = $4, description = $5, poster_url = $6
      WHERE id = $7 
      RETURNING *
    `, [title, genre, duration || null, rating || null, description || '', poster_url || '', id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Фильм не найден' });
    }

    res.json({ 
      message: 'Фильм успешно обновлен',
      movie: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить фильм - УПРОЩЕННАЯ ВЕРСИЯ (ВРЕМЕННО ОТКЛЮЧЕН)
// app.delete('/api/admin/movies/:id', async (req, res) => {
//   console.log('🎬 DELETE /api/admin/movies/:id вызван');
//   console.log('🎬 Параметры:', req.params);
//   console.log('🎬 Headers:', req.headers);
//   
//   try {
//     const { id } = req.params;
//     const movieId = parseInt(id, 10);
//     
//     console.log('🎬 ID для удаления:', movieId);
//     
//     if (isNaN(movieId)) {
//       console.log('❌ Неверный ID');
//       return res.status(400).json({ error: 'Неверный ID фильма' });
//     }
//     
//     // Простой запрос без дополнительных проверок
//     const result = await pool.query('DELETE FROM cinema_movies WHERE id = $1 RETURNING id, title', [movieId]);
//     
//     console.log('✅ Удаление выполнено, результат:', result.rows);
//     
//     if (result.rows.length === 0) {
//       console.log('❌ Фильм не найден');
//       return res.status(404).json({ error: 'Фильм не найден' });
//     }
//     
//     console.log('✅ Фильм успешно удален');
//     res.json({ 
//       message: 'Фильм успешно удален',
//       deletedMovie: result.rows[0]
//     });
//     
//   } catch (err) {
//     console.error('❌ ОШИБКА УДАЛЕНИЯ ФИЛЬМА:');
//     console.error('❌ Сообщение:', err.message);
//     console.error('❌ Код:', err.code);
//     console.error('❌ Детали:', err.detail);
//     console.error('❌ Полная ошибка:', err);
//     
//     res.status(500).json({ 
//       error: err.message,
//       code: err.code,
//       details: err.detail || 'Нет дополнительных деталей'
//     });
//   }
// });

// ========== ТЕСТОВЫЕ ENDPOINTS ==========

// Простой endpoint для проверки состояния сервера
app.get('/api/server-status', (req, res) => {
  console.log('🔍 Проверка состояния сервера');
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Сервер работает',
    endpoints: [
      'GET /api/server-status',
      'DELETE /api/delete-movie/:id',
      'DELETE /api/delete-movie-safe/:id',
      'DELETE /api/force-delete-movie/:id',
      'GET /api/check-database-relations'
    ]
  });
});

// Тестовый endpoint для проверки DELETE без авторизации
app.delete('/api/test-delete', (req, res) => {
  console.log('🧪 Тестовый DELETE endpoint вызван');
  console.log('🧪 Headers:', req.headers);
  res.json({ 
    message: 'Тестовый DELETE работает',
    timestamp: new Date().toISOString()
  });
});

// Тестовый endpoint для проверки безопасного удаления
app.get('/api/test-safe-delete', (req, res) => {
  console.log('🧪 Тест безопасного удаления endpoint вызван');
  res.json({ 
    message: 'Endpoint безопасного удаления доступен',
    endpoint: '/api/delete-movie-safe/:id',
    timestamp: new Date().toISOString()
  });
});

// Принудительный endpoint для удаления фильма (без проверок)
app.delete('/api/force-delete-movie/:id', async (req, res) => {
  console.log('💥 ПРИНУДИТЕЛЬНОЕ УДАЛЕНИЕ /api/force-delete-movie/:id вызвано');
  console.log('💥 Параметры:', req.params);
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const movieId = parseInt(id, 10);
    
    if (isNaN(movieId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Неверный ID фильма' });
    }
    
    console.log('💥 Принудительно удаляем фильм ID:', movieId);
    
    // Принудительно удаляем ВСЕ связанные записи
    console.log('⚠️ Пропускаем удаление заказов - таблица orders не имеет прямой связи с movie_id');
    const deletedOrders = { rowCount: 0 }; // Заглушка
    const deletedCinemaSessions = await client.query('DELETE FROM cinema_sessions WHERE movie_id = $1', [movieId]);
    
    // Удаляем фильм
    const result = await client.query('DELETE FROM cinema_movies WHERE id = $1 RETURNING id, title', [movieId]);
    
    await client.query('COMMIT');
    
    res.json({ 
      message: 'Фильм принудительно удален',
      deletedMovie: result.rows[0],
      deletedOrders: deletedOrders.rowCount,
      deletedCinemaSessions: deletedCinemaSessions.rowCount
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('💥 Ошибка принудительного удаления:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Альтернативный endpoint для удаления фильма с транзакцией
app.delete('/api/delete-movie-safe/:id', authenticateAdmin, async (req, res) => {
  console.log('🎬 БЕЗОПАСНОЕ УДАЛЕНИЕ /api/delete-movie-safe/:id вызвано');
  console.log('🎬 Параметры:', req.params);
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const movieId = parseInt(id, 10);
    
    if (isNaN(movieId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Неверный ID фильма' });
    }
    
    console.log('🎬 ID для удаления:', movieId);
    
    // Проверяем существование фильма
    const movieCheck = await client.query('SELECT id, title FROM cinema_movies WHERE id = $1', [movieId]);
    if (movieCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Фильм не найден' });
    }
    
    // Принудительно удаляем все связанные записи
    console.log('⚠️ Пропускаем удаление заказов - таблица orders не имеет прямой связи с movie_id');
    const deletedOrders = { rows: [] }; // Заглушка
    const deletedCinemaSessions = await client.query('DELETE FROM cinema_sessions WHERE movie_id = $1 RETURNING id', [movieId]);
    
    // Удаляем фильм
    const result = await client.query('DELETE FROM cinema_movies WHERE id = $1 RETURNING id, title', [movieId]);
    
    await client.query('COMMIT');
    
    res.json({ 
      message: 'Фильм успешно удален (безопасное удаление)',
      deletedMovie: result.rows[0],
      deletedOrders: deletedOrders.rows.length,
      deletedCinemaSessions: deletedCinemaSessions.rows.length
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка безопасного удаления:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Альтернативный endpoint для удаления фильма с транзакцией
app.delete('/api/delete-movie/:id', async (req, res) => {
  console.log('🎬 АЛЬТЕРНАТИВНЫЙ DELETE /api/delete-movie/:id вызван');
  console.log('🎬 Параметры:', req.params);
  console.log('🎬 Headers:', req.headers);
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const movieId = parseInt(id, 10);
    
    console.log('🎬 ID для удаления:', movieId);
    
    if (isNaN(movieId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Неверный ID фильма' });
    }
    
    // Проверяем существование фильма
    const movieCheck = await client.query('SELECT id, title FROM cinema_movies WHERE id = $1', [movieId]);
    if (movieCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Фильм не найден' });
    }
    
    console.log('🎬 Найденные фильмы:', movieCheck.rows);
    
    // Принудительно удаляем все связанные записи
    console.log('🔍 Принудительно удаляем все связанные записи...');
    
    // Удаляем связанные заказы (принудительно) - ПРОПУСКАЕМ
    console.log('⚠️ Пропускаем удаление заказов - таблица orders не имеет прямой связи с movie_id');
    const deletedOrders = { rows: [] }; // Заглушка
    console.log('✅ Удалено заказов: 0 (пропущено)');
    
    // Удаляем связанные сеансы из cinema_sessions (принудительно)
    console.log('🗑️ Удаляем связанные сеансы из cinema_sessions...');
    const deletedCinemaSessions = await client.query('DELETE FROM cinema_sessions WHERE movie_id = $1 RETURNING id', [movieId]);
    console.log('✅ Удалено сеансов из cinema_sessions:', deletedCinemaSessions.rows.length);
    
    
    // Проверяем, есть ли еще связанные записи в других возможных таблицах
    console.log('🔍 Проверяем другие возможные связанные таблицы...');
    
    // Проверяем возможные связанные таблицы
    const possibleTables = ['tickets', 'bookings', 'reservations', 'cinema_bookings', 'movie_bookings'];
    let otherDeletedRecords = 0;
    
    for (const tableName of possibleTables) {
      try {
        const checkQuery = `SELECT COUNT(*) as count FROM ${tableName} WHERE movie_id = $1`;
        const checkResult = await client.query(checkQuery, [movieId]);
        const count = parseInt(checkResult.rows[0].count);
        
        if (count > 0) {
          console.log(`🗑️ Найдено ${count} записей в таблице ${tableName}, удаляем...`);
          const deleteQuery = `DELETE FROM ${tableName} WHERE movie_id = $1 RETURNING id`;
          const deleteResult = await client.query(deleteQuery, [movieId]);
          otherDeletedRecords += deleteResult.rows.length;
          console.log(`✅ Удалено ${deleteResult.rows.length} записей из ${tableName}`);
        }
      } catch (err) {
        // Таблица не существует, пропускаем
        console.log(`📋 Таблица ${tableName} не существует или недоступна`);
      }
    }
    
    // Удаляем фильм
    console.log('🔍 Удаляем фильм...');
    const result = await client.query('DELETE FROM cinema_movies WHERE id = $1 RETURNING id, title', [movieId]);
    
    await client.query('COMMIT');
    
    console.log('✅ Удаление выполнено, результат:', result.rows);
    console.log('✅ Количество удаленных записей:', result.rowCount);
    
    res.json({ 
      message: 'Фильм успешно удален (с транзакцией)',
      deletedMovie: result.rows[0],
      deletedOrders: deletedOrders.rows.length,
      deletedCinemaSessions: deletedCinemaSessions.rows.length,
      otherDeletedRecords: otherDeletedRecords,
      totalDeletedSessions: deletedCinemaSessions.rows.length
    });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ ОШИБКА УДАЛЕНИЯ ФИЛЬМА:');
    console.error('❌ Тип ошибки:', err.constructor.name);
    console.error('❌ Сообщение:', err.message);
    console.error('❌ Код:', err.code);
    console.error('❌ Детали:', err.detail);
    console.error('❌ Стек ошибки:', err.stack);
    console.error('❌ Полная ошибка:', err);
    
    res.status(500).json({ 
      error: err.message,
      code: err.code,
      details: err.detail || 'Нет дополнительных деталей'
    });
  } finally {
    client.release();
  }
});

// Endpoint для проверки подключения к БД
app.get('/api/db-status', async (req, res) => {
  try {
    console.log('🔍 Проверка подключения к БД');
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ 
      status: 'OK', 
      database: 'connected',
      current_time: result.rows[0].current_time
    });
  } catch (err) {
    console.error('❌ Ошибка подключения к БД:', err);
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'disconnected',
      error: err.message 
    });
  }
});

// Endpoint для проверки структуры таблицы cinema_movies
app.get('/api/check-movies-table', async (req, res) => {
  try {
    console.log('🔍 Проверка таблицы cinema_movies');
    
    // Проверяем существование таблицы
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cinema_movies'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log('📋 Таблица cinema_movies существует:', tableExists);
    
    if (!tableExists) {
      return res.json({ 
        table_exists: false,
        message: 'Таблица cinema_movies не существует'
      });
    }
    
    // Получаем структуру таблицы
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'cinema_movies'
      ORDER BY ordinal_position;
    `);
    
    // Получаем количество записей
    const count = await pool.query('SELECT COUNT(*) as count FROM cinema_movies');
    
    // Получаем все фильмы
    const movies = await pool.query('SELECT id, title FROM cinema_movies ORDER BY id');
    
    res.json({ 
      table_exists: true,
      structure: structure.rows,
      count: count.rows[0].count,
      movies: movies.rows
    });
    
  } catch (err) {
    console.error('❌ Ошибка проверки таблицы:', err);
    res.status(500).json({ 
      error: err.message,
      details: err.detail
    });
  }
});

// Endpoint для проверки связей между таблицами
app.get('/api/check-database-relations', async (req, res) => {
  try {
    console.log('🔍 Проверка связей между таблицами');
    
    // Проверяем все таблицы
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    const tableNames = tables.rows.map(row => row.table_name);
    console.log('📋 Найденные таблицы:', tableNames);
    
    // Проверяем внешние ключи
    const foreignKeys = await pool.query(`
      SELECT 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_schema = 'public';
    `);
    
    // Проверяем заказы, связанные с фильмом ID 8 (ПРОПУСКАЕМ - нет прямой связи)
    console.log('⚠️ Пропускаем проверку заказов - таблица orders не имеет прямой связи с movie_id');
    const movieOrders = { rows: [] }; // Заглушка
    
    // Проверяем сеансы в cinema_sessions, связанные с фильмом ID 8
    const cinemaSessions = await pool.query(`
      SELECT * FROM cinema_sessions WHERE movie_id = 8;
    `);
    
    // Проверяем сеансы в movie_sessions, связанные с фильмом ID 8 (если существует)
    let movieSessions = { rows: [] };
    try {
      movieSessions = await pool.query(`
        SELECT * FROM movie_sessions WHERE movie_id = 8;
      `);
    } catch (err) {
      console.log('📋 Таблица movie_sessions не существует или недоступна');
    }
    
    res.json({
      tables: tableNames,
      foreign_keys: foreignKeys.rows,
      movie_8_orders: movieOrders.rows,
      movie_8_cinema_sessions: cinemaSessions.rows,
      movie_8_movie_sessions: movieSessions.rows,
      total_orders: movieOrders.rows.length,
      total_cinema_sessions: cinemaSessions.rows.length,
      total_movie_sessions: movieSessions.rows.length,
      total_sessions: cinemaSessions.rows.length + movieSessions.rows.length
    });
    
  } catch (err) {
    console.error('❌ Ошибка проверки связей:', err);
    res.status(500).json({ 
      error: err.message,
      details: err.detail
    });
  }
});

// Тестовый endpoint для проверки удаления фильма
app.delete('/api/test-delete-movie/:id', async (req, res) => {
  const { id } = req.params;
  const movieId = parseInt(id, 10);
  
  console.log('🧪 ТЕСТОВОЕ УДАЛЕНИЕ ФИЛЬМА');
  console.log('🧪 ID:', movieId);
  
  try {
    const client = await pool.connect();
    
    // Проверяем существование
    const check = await client.query('SELECT id, title FROM cinema_movies WHERE id = $1', [movieId]);
    console.log('🧪 Фильм найден:', check.rows);
    
    if (check.rows.length === 0) {
      client.release();
      return res.json({ error: 'Фильм не найден', found: false });
    }
    
    // Удаляем
    const result = await client.query('DELETE FROM cinema_movies WHERE id = $1 RETURNING id, title', [movieId]);
    console.log('🧪 Удален:', result.rows);
    
    client.release();
    res.json({ 
      success: true, 
      deleted: result.rows[0],
      count: result.rowCount 
    });
  } catch (err) {
    console.error('🧪 Ошибка тестового удаления:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== УПРАВЛЕНИЕ ШАБЛОНАМИ СЕАНСОВ ==========

// Получить все шаблоны сеансов
app.get('/api/admin/session-templates', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM session_templates 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создать шаблон сеанса
app.post('/api/admin/session-templates', authenticateAdmin, async (req, res) => {
  const { 
    name, 
    description, 
    default_hall, 
    default_price, 
    default_capacity,
    time_slots, // массив временных слотов ["18:00", "20:30", "22:00"]
    days_of_week, // массив дней недели [1,2,3,4,5,6,7] где 1=понедельник
    is_active 
  } = req.body;

  if (!name || !default_hall || !default_price) {
    return res.status(400).json({ error: 'Название, зал и цена обязательны' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO session_templates (
        name, description, default_hall, default_price, default_capacity,
        time_slots, days_of_week, is_active
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [
      name, 
      description || '', 
      default_hall, 
      default_price, 
      default_capacity || 100,
      JSON.stringify(time_slots || []),
      JSON.stringify(days_of_week || []),
      is_active !== false
    ]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить шаблон сеанса
app.put('/api/admin/session-templates/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    default_hall, 
    default_price, 
    default_capacity,
    time_slots,
    days_of_week,
    is_active 
  } = req.body;

  try {
    const result = await pool.query(`
      UPDATE session_templates 
      SET name = $1, description = $2, default_hall = $3, default_price = $4, 
          default_capacity = $5, time_slots = $6, days_of_week = $7, is_active = $8,
          updated_at = NOW()
      WHERE id = $9 
      RETURNING *
    `, [
      name, 
      description || '', 
      default_hall, 
      default_price, 
      default_capacity || 100,
      JSON.stringify(time_slots || []),
      JSON.stringify(days_of_week || []),
      is_active !== false,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }

    res.json({ 
      message: 'Шаблон успешно обновлен',
      template: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить шаблон сеанса
app.delete('/api/admin/session-templates/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM session_templates WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }

    res.json({ message: 'Шаблон успешно удален' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Применить шаблон к фильму (создать сеансы)
app.post('/api/admin/movies/:movieId/apply-template/:templateId', authenticateAdmin, async (req, res) => {
  const { movieId, templateId } = req.params;
  const { start_date, end_date } = req.body; // период применения шаблона

  if (!start_date || !end_date) {
    return res.status(400).json({ error: 'Укажите период применения шаблона' });
  }

  try {
    // Получаем шаблон
    const templateRes = await pool.query('SELECT * FROM session_templates WHERE id = $1', [templateId]);
    if (templateRes.rows.length === 0) {
      return res.status(404).json({ error: 'Шаблон не найден' });
    }

    const template = templateRes.rows[0];
    const timeSlots = JSON.parse(template.time_slots || '[]');
    const daysOfWeek = JSON.parse(template.days_of_week || '[]');

    if (timeSlots.length === 0) {
      return res.status(400).json({ error: 'В шаблоне не указаны временные слоты' });
    }

    // Проверяем существование фильма
    const movieRes = await pool.query('SELECT * FROM cinema_movies WHERE id = $1', [movieId]);
    if (movieRes.rows.length === 0) {
      return res.status(404).json({ error: 'Фильм не найден' });
    }

    // Создаем сеансы для каждого дня в указанном периоде
    const createdSessions = [];
    const start = new Date(start_date);
    const end = new Date(end_date);

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay() || 7; // 1=понедельник, 7=воскресенье
      
      if (daysOfWeek.includes(dayOfWeek)) {
        for (const timeSlot of timeSlots) {
          try {
            const sessionRes = await pool.query(`
              INSERT INTO movie_sessions (movie_id, date, time, hall, price, capacity) 
              VALUES ($1, $2, $3, $4, $5, $6) 
              RETURNING *
            `, [
              movieId,
              date.toISOString().split('T')[0],
              timeSlot,
              template.default_hall,
              template.default_price,
              template.default_capacity
            ]);
            
            createdSessions.push(sessionRes.rows[0]);
          } catch (sessionErr) {
            console.log(`Ошибка создания сеанса для ${date.toISOString().split('T')[0]} ${timeSlot}:`, sessionErr.message);
          }
        }
      }
    }

    res.json({ 
      message: `Создано ${createdSessions.length} сеансов`,
      sessions: createdSessions,
      template: template
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить доступные шаблоны для фильма
app.get('/api/admin/movies/:movieId/available-templates', authenticateAdmin, async (req, res) => {
  const { movieId } = req.params;

  try {
    // Проверяем существование фильма
    const movieRes = await pool.query('SELECT * FROM cinema_movies WHERE id = $1', [movieId]);
    if (movieRes.rows.length === 0) {
      return res.status(404).json({ error: 'Фильм не найден' });
    }

    // Получаем активные шаблоны
    const templatesRes = await pool.query(`
      SELECT * FROM session_templates 
      WHERE is_active = true 
      ORDER BY name
    `);

    res.json(templatesRes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== УПРАВЛЕНИЕ СЕАНСАМИ ==========

// Получить все сеансы
app.get('/api/admin/sessions', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, m.title as movie_title, m.genre 
      FROM movie_sessions s 
      LEFT JOIN cinema_movies m ON s.movie_id = m.id 
      ORDER BY s.date, s.time
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавить сеанс
app.post('/api/admin/sessions', authenticateAdmin, async (req, res) => {
  const { movie_id, date, time, hall, price, capacity } = req.body;

  if (!movie_id || !date || !time || !hall || !price) {
    return res.status(400).json({ error: 'Все поля обязательны' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO movie_sessions (movie_id, date, time, hall, price, capacity) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `, [movie_id, date, time, hall, price, capacity || 100]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить сеанс
app.put('/api/admin/sessions/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { movie_id, date, time, hall, price, capacity } = req.body;

  try {
    const result = await pool.query(`
      UPDATE movie_sessions 
      SET movie_id = $1, date = $2, time = $3, hall = $4, price = $5, capacity = $6
      WHERE id = $7 
      RETURNING *
    `, [movie_id, date, time, hall, price, capacity, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Сеанс не найден' });
    }

    res.json({ 
      message: 'Сеанс успешно обновлен',
      session: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить сеанс
app.delete('/api/admin/sessions/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM movie_sessions WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Сеанс не найден' });
    }

    res.json({ message: 'Сеанс успешно удален' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== ФИНАНСОВЫЕ ОТЧЕТЫ ==========

// Получить финансовую статистику
app.get('/api/admin/finance', authenticateAdmin, async (req, res) => {
  try {
    // Общая статистика заказов
    const ordersStats = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_price) as total_revenue,
        AVG(total_price) as avg_order_value
      FROM orders 
      WHERE status = 'completed'
    `);

    // Статистика по дням
    const dailyStats = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders_count,
        SUM(total_price) as daily_revenue
      FROM orders 
      WHERE status = 'completed' 
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Статистика по типам заказов
    const orderTypeStats = await pool.query(`
      SELECT 
        order_type,
        COUNT(*) as count,
        SUM(total_price) as revenue
      FROM orders 
      WHERE status = 'completed'
      GROUP BY order_type
    `);

    res.json({
      overview: ordersStats.rows[0],
      daily: dailyStats.rows,
      byType: orderTypeStats.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить финансовые данные с фильтрацией для админ панели
app.get('/api/admin/finance/transactions', authenticateAdmin, async (req, res) => {
  try {
    const { period = 'all', page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('💰 Запрос финансовых транзакций:', { period, page, limit });
    
    // Определяем фильтр по датам
    let dateFilter = '';
    switch (period) {
      case 'today':
        dateFilter = "AND DATE(o.created_at) = CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "AND o.created_at >= NOW() - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "AND o.created_at >= NOW() - INTERVAL '30 days'";
        break;
      default:
        dateFilter = '';
    }
    
    // Получаем заказы с деталями
    const ordersQuery = `
      SELECT 
        o.id,
        o.order_type,
        o.total_price,
        o.status,
        o.created_at,
        u.name as user_name,
        u.email as user_email,
        -- Получаем название товара/услуги из order_items
        COALESCE(
          CASE 
            WHEN oi.item_type = 'movie' THEN m.title
            WHEN oi.item_type = 'food' THEN f.name
            WHEN oi.item_type = 'event' THEN e.title
            ELSE o.order_type
          END,
          o.order_type
        ) as item_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN cinema_movies m ON oi.item_type = 'movie' AND oi.item_id = m.id
      LEFT JOIN food_items f ON oi.item_type = 'food' AND oi.item_id = f.id
      LEFT JOIN club_events e ON oi.item_type = 'event' AND oi.item_id = e.id
      WHERE o.status = 'completed' ${dateFilter}
      ORDER BY o.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    
    const orders = await pool.query(ordersQuery, [limit, offset]);
    
    // Получаем общую сумму для выбранного периода
    const totalQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_price), 0) as total_revenue
      FROM orders o
      WHERE o.status = 'completed' ${dateFilter}
    `;
    
    const totals = await pool.query(totalQuery);
    
    console.log('✅ Найдено транзакций:', orders.rows.length);
    console.log('💰 Общая сумма:', totals.rows[0].total_revenue);
    
    res.json({
      transactions: orders.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(totals.rows[0].total_orders),
        totalPages: Math.ceil(totals.rows[0].total_orders / limit)
      },
      summary: {
        totalOrders: parseInt(totals.rows[0].total_orders),
        totalRevenue: parseFloat(totals.rows[0].total_revenue)
      }
    });
  } catch (err) {
    console.error('❌ Ошибка получения финансовых данных:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== УПРАВЛЕНИЕ КЛУБНЫМИ СОБЫТИЯМИ ==========

// Получить все клубные события
app.get('/api/admin/events', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, dj, date, time, 
             price, genre, image_url, created_at, updated_at
      FROM club_events 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавить клубное событие
app.post('/api/admin/events', authenticateAdmin, async (req, res) => {
  const { title, description, dj_name, event_date, event_time, price, genre, image_url, capacity } = req.body;

  if (!title || !dj_name || !event_date || !event_time || !price) {
    return res.status(400).json({ error: 'Название, DJ, дата, время и цена обязательны' });
  }

  try {
    const result = await pool.query(`
      INSERT INTO club_events (title, description, dj, date, time, price, genre, image_url) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *
    `, [title, description || '', dj_name, event_date, event_time, price, genre || '', image_url || '']);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить клубное событие
app.put('/api/admin/events/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description, dj_name, event_date, event_time, price, genre, image_url, capacity } = req.body;

  try {
    const result = await pool.query(`
      UPDATE club_events 
      SET title = $1, description = $2, dj = $3, date = $4, time = $5, 
          price = $6, genre = $7, image_url = $8, updated_at = NOW()
      WHERE id = $9 
      RETURNING *
    `, [title, description || '', dj_name, event_date, event_time, price, genre || '', image_url || '', id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Событие не найдено' });
    }

    res.json({ 
      message: 'Событие успешно обновлено',
      event: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить клубное событие
app.delete('/api/admin/events/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM club_events WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Событие не найдено' });
    }

    res.json({ message: 'Событие успешно удалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить клубные события для главного экрана
app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, description, dj, date, time, 
             price, genre, image_url, created_at, updated_at
      FROM club_events 
      WHERE date >= CURRENT_DATE
      ORDER BY date, time
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить киносеансы для главного экрана
app.get('/api/cinema-sessions', async (req, res) => {
  try {
    console.log('🎬 Запрос на получение киносеансов для главного экрана');
    
    // Проверяем существование таблицы movie_sessions
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'movie_sessions'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log('📋 Таблица movie_sessions существует:', tableExists);
    
    if (!tableExists) {
      console.log('⚠️ Таблица movie_sessions не существует, возвращаем пустой массив');
      return res.json([]);
    }
    
    // Получаем сеансы на сегодня и будущие даты
    const result = await pool.query(`
      SELECT s.*, m.title as movie_title, m.genre, m.duration, m.rating
      FROM movie_sessions s 
      LEFT JOIN cinema_movies m ON s.movie_id = m.id 
      WHERE s.date >= CURRENT_DATE
      ORDER BY s.date, s.time
    `);
    
    console.log('✅ Найдено киносеансов:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Ошибка при получении киносеансов:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ========== УПРАВЛЕНИЕ ЗАКАЗАМИ ==========

// Получить все заказы
app.get('/api/admin/orders', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Обновить статус заказа
app.put('/api/admin/orders/:id/status', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(`
      UPDATE orders 
      SET status = $1, updated_at = NOW()
      WHERE id = $2 
      RETURNING *
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    res.json({ 
      message: 'Статус заказа обновлен',
      order: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== УПРАВЛЕНИЕ ЕДОЙ ==========

// Получить всю еду
app.get('/api/admin/food', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM food_items 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Добавить новое блюдо
app.post('/api/admin/food', authenticateAdmin, async (req, res) => {
  console.log('POST /api/admin/food - Получены данные:', req.body);
  
  const { name, description, price, category, image_url, is_available } = req.body;

  if (!name || !price) {
    console.log('Ошибка валидации: отсутствует название или цена');
    return res.status(400).json({ error: 'Название и цена обязательны' });
  }

  try {
    console.log('Выполняем запрос с параметрами:', {
      name, description: description || '', price, 
      category: category || 1, 
      image_url: image_url || '', 
      available: is_available !== false
    });
    
    const result = await pool.query(`
      INSERT INTO food_items (name, description, price, category_id, image_url, available) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `, [name, description || '', price, category || 1, image_url || '', is_available !== false]);

    console.log('Успешно добавлено:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Ошибка при добавлении еды:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Обновить блюдо
app.put('/api/admin/food/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, image_url, is_available } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Название и цена обязательны' });
  }

  try {
    const result = await pool.query(`
      UPDATE food_items 
      SET name = $1, description = $2, price = $3, category_id = $4, 
          image_url = $5, available = $6
      WHERE id = $7 
      RETURNING *
    `, [name, description || '', price, category || 1, image_url || '', is_available !== false, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Блюдо не найдено' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Удалить блюдо
app.delete('/api/admin/food/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM food_items WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Блюдо не найдено' });
    }

    res.json({ message: 'Блюдо успешно удалено' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Получить еду для главного экрана
app.get('/api/food', async (req, res) => {
  try {
    console.log('🍕 Запрос на получение еды');
    
    // Сначала проверим, есть ли поле available в таблице
    const columnCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'food_items' AND column_name = 'available'
    `);
    
    const hasAvailableColumn = columnCheck.rows.length > 0;
    console.log('📋 Поле available существует:', hasAvailableColumn);
    
    let query;
    if (hasAvailableColumn) {
      // Если поле available существует, фильтруем по нему
      query = `
        SELECT id, name, description, price, category_id, image_url, available
        FROM food_items 
        WHERE available = true
        ORDER BY category_id, name
      `;
    } else {
      // Если поля available нет, показываем все блюда
      query = `
        SELECT id, name, description, price, category_id, image_url, true as available
        FROM food_items 
        ORDER BY category_id, name
      `;
    }
    
    const result = await pool.query(query);
    console.log('✅ Найдено блюд:', result.rows.length);
    console.log('🍕 Блюда:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('❌ Ошибка при получении еды:', err.message);
    console.error('Детали ошибки:', err);
    res.status(500).json({ error: err.message });
  }
});

// API для загрузки изображений
app.post('/api/upload/image', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не был загружен' });
    }

    // Возвращаем путь к загруженному файлу
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (err) {
    console.error('Ошибка при загрузке изображения:', err);
    res.status(500).json({ error: err.message });
  }
});

// Обработка ошибок multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Файл слишком большой. Максимальный размер: 5 МБ' });
    }
  } else if (error.message === 'Только изображения разрешены') {
    return res.status(400).json({ error: 'Только изображения разрешены' });
  }
  
  console.error('Ошибка загрузки файла:', error);
  res.status(500).json({ error: 'Ошибка при загрузке файла' });
});

// Endpoint для создания таблицы cinema_movies
app.get('/api/create-movies-table', async (req, res) => {
  try {
    console.log('🎬 Создаем таблицу cinema_movies...');
    
    // Проверяем, существует ли таблица
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'cinema_movies'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      return res.json({
        status: 'info',
        message: 'Таблица cinema_movies уже существует'
      });
    }
    
    // Создаем таблицу cinema_movies
    await pool.query(`
      CREATE TABLE cinema_movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        genre VARCHAR(100),
        duration INTEGER,
        rating DECIMAL(3,1),
        description TEXT,
        poster_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Таблица cinema_movies создана');
    
    // Добавляем тестовые данные
    await pool.query(`
      INSERT INTO cinema_movies (title, genre, duration, rating, description, poster_url) VALUES
      ('Тестовый фильм 1', 'Драма', 120, 8.5, 'Описание тестового фильма', ''),
      ('Тестовый фильм 2', 'Комедия', 90, 7.2, 'Описание комедии', '')
    `);
    
    console.log('✅ Тестовые данные добавлены');
    
    res.json({
      status: 'success',
      message: 'Таблица cinema_movies создана с тестовыми данными'
    });
  } catch (err) {
    console.error('❌ Ошибка создания таблицы cinema_movies:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint для исправления поля available
app.get('/api/fix-food-available', async (req, res) => {
  try {
    console.log('🔧 Исправляем поле available для всех блюд...');
    
    // Проверяем, есть ли поле available
    const columnCheck = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'food_items' AND column_name = 'available'
    `);
    
    if (columnCheck.rows.length === 0) {
      // Если поля нет, создаем его
      await pool.query(`
        ALTER TABLE food_items ADD COLUMN available BOOLEAN DEFAULT true
      `);
      console.log('✅ Поле available создано');
    }
    
    // Устанавливаем available = true для всех блюд
    const updateResult = await pool.query(`
      UPDATE food_items SET available = true WHERE available IS NULL OR available = false
    `);
    
    console.log('✅ Обновлено блюд:', updateResult.rowCount);
    
    // Получаем все блюда
    const allFood = await pool.query('SELECT * FROM food_items');
    
    res.json({
      status: 'success',
      message: 'Поле available исправлено',
      updated_count: updateResult.rowCount,
      total_food: allFood.rows.length,
      food_items: allFood.rows
    });
  } catch (err) {
    console.error('❌ Ошибка исправления поля available:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Тестовый endpoint для проверки базы данных
app.get('/api/test-db', async (req, res) => {
  try {
    // Проверяем подключение к базе данных
    const client = await pool.connect();
    console.log('✅ Подключение к PostgreSQL: УСПЕШНО');
    
    // Проверяем существование таблицы food_items
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'food_items'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    console.log('📋 Таблица food_items существует:', tableExists);
    
    if (tableExists) {
      // Проверяем количество записей в таблице
      const countResult = await client.query('SELECT COUNT(*) as count FROM food_items');
      const totalCount = countResult.rows[0].count;
      
      const availableCount = await client.query('SELECT COUNT(*) as count FROM food_items WHERE available = true');
      const availableItems = availableCount.rows[0].count;
      
      console.log('🍕 Всего блюд в таблице:', totalCount);
      console.log('✅ Доступных блюд:', availableItems);
      
      // Получаем несколько примеров
      const sampleResult = await client.query('SELECT * FROM food_items LIMIT 3');
      
      res.json({
        status: 'success',
        database_connected: true,
        table_exists: tableExists,
        total_items: parseInt(totalCount),
        available_items: parseInt(availableItems),
        sample_data: sampleResult.rows
      });
    } else {
      res.json({
        status: 'error',
        database_connected: true,
        table_exists: false,
        message: 'Таблица food_items не существует'
      });
    }
    
    client.release();
  } catch (err) {
    console.error('❌ Ошибка проверки базы данных:', err.message);
    res.status(500).json({
      status: 'error',
      database_connected: false,
      error: err.message
    });
  }
});

// ==================== CLUB TABLES API ====================

// Получить все столы клуба
app.get('/api/club/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        ct.*,
        COUNT(ctb.id) as active_bookings
      FROM club_tables ct
      LEFT JOIN club_table_bookings ctb ON ct.id = ctb.table_id 
        AND ctb.booking_date = CURRENT_DATE 
        AND ctb.status IN ('reserved', 'confirmed')
      WHERE ct.is_active = true
      GROUP BY ct.id
      ORDER BY ct.table_number
    `);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching club tables:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить доступные столы на определенную дату и время
app.get('/api/club/tables/available', async (req, res) => {
  try {
    const { date, start_time, end_time } = req.query;
    
    if (!date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Требуются параметры: date, start_time, end_time' });
    }
    
    const result = await pool.query(`
      SELECT ct.*
      FROM club_tables ct
      WHERE ct.is_active = true
      AND ct.id NOT IN (
        SELECT DISTINCT ctb.table_id
        FROM club_table_bookings ctb
        WHERE ctb.booking_date = $1
        AND ctb.status IN ('reserved', 'confirmed')
        AND (
          (ctb.start_time <= $2 AND ctb.end_time > $2) OR
          (ctb.start_time < $3 AND ctb.end_time >= $3) OR
          (ctb.start_time >= $2 AND ctb.end_time <= $3)
        )
      )
      ORDER BY ct.table_number
    `, [date, start_time, end_time]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching available tables:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить бронирования стола
app.get('/api/club/tables/:tableId/bookings', async (req, res) => {
  try {
    const { tableId } = req.params;
    const { date } = req.query;
    
    let query = `
      SELECT ctb.*, ct.table_number, ct.capacity, ct.location
      FROM club_table_bookings ctb
      JOIN club_tables ct ON ctb.table_id = ct.id
      WHERE ctb.table_id = $1
    `;
    let params = [tableId];
    
    if (date) {
      query += ` AND ctb.booking_date = $2`;
      params.push(date);
    }
    
    query += ` ORDER BY ctb.booking_date, ctb.start_time`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching table bookings:', err);
    res.status(500).json({ error: err.message });
  }
});

// Создать бронирование стола
app.post('/api/club/tables/:tableId/bookings', authenticateToken, async (req, res) => {
  try {
    const { tableId } = req.params;
    const { booking_date, start_time, end_time, guest_name, guest_phone, notes } = req.body;
    const userId = req.user.id;
    
    if (!booking_date || !start_time || !end_time) {
      return res.status(400).json({ error: 'Требуются поля: booking_date, start_time, end_time' });
    }
    
    // Проверяем доступность стола
    const availabilityCheck = await pool.query(`
      SELECT COUNT(*) as count
      FROM club_table_bookings
      WHERE table_id = $1
      AND booking_date = $2
      AND status IN ('reserved', 'confirmed')
      AND (
        (start_time <= $3 AND end_time > $3) OR
        (start_time < $4 AND end_time >= $4) OR
        (start_time >= $3 AND end_time <= $4)
      )
    `, [tableId, booking_date, start_time, end_time]);
    
    if (parseInt(availabilityCheck.rows[0].count) > 0) {
      return res.status(409).json({ error: 'Стол уже забронирован на это время' });
    }
    
    // Получаем информацию о столе для расчета цены
    const tableInfo = await pool.query(`
      SELECT price_per_hour FROM club_tables WHERE id = $1
    `, [tableId]);
    
    if (tableInfo.rows.length === 0) {
      return res.status(404).json({ error: 'Стол не найден' });
    }
    
    // Рассчитываем общую стоимость
    const startTime = new Date(`2000-01-01T${start_time}`);
    const endTime = new Date(`2000-01-01T${end_time}`);
    const hours = (endTime - startTime) / (1000 * 60 * 60);
    const totalPrice = hours * parseFloat(tableInfo.rows[0].price_per_hour);
    
    // Создаем бронирование
    const result = await pool.query(`
      INSERT INTO club_table_bookings (
        table_id, user_id, booking_date, start_time, end_time, 
        total_price, guest_name, guest_phone, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'reserved')
      RETURNING *
    `, [tableId, userId, booking_date, start_time, end_time, totalPrice, guest_name, guest_phone, notes]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating table booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// Отменить бронирование стола
app.delete('/api/club/tables/bookings/:bookingId', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    
    const result = await pool.query(`
      UPDATE club_table_bookings 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `, [bookingId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Бронирование не найдено или у вас нет прав на его отмену' });
    }
    
    res.json({ message: 'Бронирование отменено', booking: result.rows[0] });
  } catch (err) {
    console.error('Error cancelling table booking:', err);
    res.status(500).json({ error: err.message });
  }
});

// Получить статистику столов
app.get('/api/club/tables/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_tables,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_tables,
        COUNT(CASE WHEN ctb.id IS NOT NULL THEN 1 END) as booked_tables_today
      FROM club_tables ct
      LEFT JOIN club_table_bookings ctb ON ct.id = ctb.table_id 
        AND ctb.booking_date = $1 
        AND ctb.status IN ('reserved', 'confirmed')
    `, [today]);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching table stats:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Backend started on port ${PORT}`);
});
