package com.tomlun.cinema.controller

import com.tomlun.cinema.service.MovieService
import com.tomlun.cinema.service.SessionService
import com.tomlun.cinema.service.TicketService
import com.tomlun.cinema.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDateTime
import jakarta.servlet.http.HttpServletRequest
import org.slf4j.LoggerFactory
import com.tomlun.cinema.model.Session

@RestController
@CrossOrigin(origins = ["http://localhost:*", "http://127.0.0.1:*"], allowCredentials = "true")
class ProxyController(
    private val movieService: MovieService,
    private val sessionService: SessionService,
    private val ticketService: TicketService,
    private val userService: UserService
) {
    
    private val logger = LoggerFactory.getLogger(ProxyController::class.java)
    
    // Endpoint для проверки что запрос дошел до backend
    @GetMapping("/ping")
    fun ping(request: HttpServletRequest): ResponseEntity<Map<String, Any>> {
        logger.info("PING: Received request from ${request.remoteAddr}")
        logger.info("PING: Headers: ${request.headerNames.toList().joinToString(", ") { "$it: ${request.getHeader(it)}" }}")
        
        return ResponseEntity.ok(mapOf(
            "message" to "PONG - Backend is working!",
            "timestamp" to System.currentTimeMillis(),
            "remoteAddr" to request.remoteAddr,
            "userAgent" to (request.getHeader("User-Agent") ?: "unknown"),
            "origin" to (request.getHeader("Origin") ?: "unknown")
        ))
    }
    
    // Endpoint для тестирования 403 ошибки
    @GetMapping("/test-403")
    fun test403Error(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.status(403).body(mapOf(
            "error" to "Недействительный токен"
        ))
    }
    
    // Endpoint для отладки всех заголовков
    @GetMapping("/debug")
    fun debugRequest(request: HttpServletRequest): ResponseEntity<Map<String, Any>> {
        val headers = mutableMapOf<String, String>()
        val headerNames = request.headerNames
        
        while (headerNames.hasMoreElements()) {
            val headerName = headerNames.nextElement()
            val headerValue = request.getHeader(headerName)
            headers[headerName] = headerValue ?: "null"
        }
        
        val response = mapOf(
            "message" to "Debug endpoint",
            "method" to request.method,
            "url" to request.requestURL.toString(),
            "queryString" to (request.queryString ?: "null"),
            "headers" to headers,
            "timestamp" to System.currentTimeMillis()
        )
        
        return ResponseEntity.ok(response)
    }
    
    // Тестовый endpoint для отладки
    @GetMapping("/test")
    fun testEndpoint(request: HttpServletRequest): ResponseEntity<Map<String, Any>> {
        val authHeader = request.getHeader("Authorization")
        val userAgent = request.getHeader("User-Agent")
        val origin = request.getHeader("Origin")
        
        val response = mapOf(
            "message" to "Proxy test endpoint",
            "hasAuthHeader" to (authHeader != null),
            "authHeader" to (authHeader ?: "null"),
            "userAgent" to (userAgent ?: "null"),
            "origin" to (origin ?: "null"),
            "method" to request.method,
            "url" to request.requestURL.toString(),
            "timestamp" to System.currentTimeMillis()
        )
        
        return ResponseEntity.ok(response)
    }
    
    // Прокси для статистики с логированием
    @RequestMapping(value = ["/stats"], method = [RequestMethod.OPTIONS, RequestMethod.GET])
    fun statsPreflightOrGet(request: HttpServletRequest): ResponseEntity<Any> {
        if (request.method.equals("OPTIONS", ignoreCase = true)) {
            // Пустой 200 для preflight
            return ResponseEntity.ok().build()
        }
        logger.info("Received request to /stats from ${request.remoteAddr}")
        logger.info("Headers: ${request.headerNames.toList().joinToString(", ") { "$it: ${request.getHeader(it)}" }}")
        
        val stats = mapOf(
            "totalMovies" to 5,
            "totalSessions" to 4,
            "activeSessions" to 4,
            "totalUsers" to 5,
            "totalTickets" to 12,
            "soldTickets" to 8,
            "totalRevenue" to 2800.0,
            "averageRating" to 8.5,
            "lastUpdated" to LocalDateTime.now()
        )
        return ResponseEntity.ok(stats)
    }
    
    // Прокси для пользователей с логированием
    @GetMapping("/users")
    fun getAllUsers(request: HttpServletRequest): ResponseEntity<List<com.tomlun.cinema.model.User>> {
        logger.info("Received request to /users from ${request.remoteAddr}")
        val users = userService.getAllUsers()
        logger.info("Returning ${users.size} users")
        return ResponseEntity.ok(users)
    }
    
    // Прокси для фильмов с логированием
    @GetMapping("/movies")
    fun getAllMovies(request: HttpServletRequest): ResponseEntity<List<com.tomlun.cinema.model.Movie>> {
        logger.info("Received request to /movies from ${request.remoteAddr}")
        val movies = movieService.getAllMovies()
        logger.info("Returning ${movies.size} movies")
        return ResponseEntity.ok(movies)
    }
    
    // Прокси для сеансов
    @GetMapping("/sessions")
    fun getAllSessions(): ResponseEntity<List<Map<String, Any>>> {
        val sessions = listOf(
            mapOf(
                "id" to 1,
                "movie" to mapOf(
                    "id" to 1,
                    "title" to "Мстители: Финал",
                    "genre" to "Боевик",
                    "duration" to 181,
                    "rating" to 8.4,
                    "description" to "Мстители собираются вновь, чтобы отменить действия Таноса и восстановить равновесие во вселенной.",
                    "posterUrl" to "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=450&fit=crop"
                ),
                "hallNumber" to 1,
                "startTime" to "2025-08-17T14:00:00",
                "endTime" to "2025-08-17T17:01:00",
                "price" to 300.0,
                "totalSeats" to 100,
                "availableSeats" to 85,
                "isActive" to true,
                "createdAt" to "2025-08-16T14:00:00",
                "updatedAt" to "2025-08-16T14:00:00"
            ),
            mapOf(
                "id" to 2,
                "movie" to mapOf(
                    "id" to 2,
                    "title" to "Джокер",
                    "genre" to "Драма",
                    "duration" to 122,
                    "rating" to 8.4,
                    "description" to "История о том, как один неудачник стал самым известным злодеем в мире.",
                    "posterUrl" to "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop"
                ),
                "hallNumber" to 2,
                "startTime" to "2025-08-18T15:00:00",
                "endTime" to "2025-08-18T17:02:00",
                "price" to 350.0,
                "totalSeats" to 100,
                "availableSeats" to 92,
                "isActive" to true,
                "createdAt" to "2025-08-16T14:00:00",
                "updatedAt" to "2025-08-16T14:00:00"
            ),
            mapOf(
                "id" to 3,
                "movie" to mapOf(
                    "id" to 3,
                    "title" to "Паразиты",
                    "genre" to "Триллер",
                    "duration" to 132,
                    "rating" to 8.6,
                    "description" to "Семья из низшего класса устраивается на работу в богатый дом, но их планы идут не так.",
                    "posterUrl" to "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=300&h=450&fit=crop"
                ),
                "hallNumber" to 3,
                "startTime" to "2025-08-19T16:00:00",
                "endTime" to "2025-08-19T18:12:00",
                "price" to 400.0,
                "totalSeats" to 100,
                "availableSeats" to 78,
                "isActive" to true,
                "createdAt" to "2025-08-16T14:00:00",
                "updatedAt" to "2025-08-16T14:00:00"
            ),
            mapOf(
                "id" to 4,
                "movie" to mapOf(
                    "id" to 5,
                    "title" to "Интерстеллар",
                    "genre" to "Фантастика",
                    "duration" to 169,
                    "rating" to 8.6,
                    "description" to "Команда исследователей путешествует через червоточину в космосе в попытке обеспечить выживание человечества.",
                    "posterUrl" to "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=300&h=450&fit=crop"
                ),
                "hallNumber" to 1,
                "startTime" to "2025-08-20T19:00:00",
                "endTime" to "2025-08-20T21:49:00",
                "price" to 450.0,
                "totalSeats" to 100,
                "availableSeats" to 65,
                "isActive" to true,
                "createdAt" to "2025-08-16T14:00:00",
                "updatedAt" to "2025-08-16T14:00:00"
            )
        )
        return ResponseEntity.ok(sessions)
    }
    
    // Прокси для заказов
    @GetMapping("/orders")
    fun getAllOrders(): ResponseEntity<List<com.tomlun.cinema.model.Ticket>> {
        val tickets = ticketService.getAllTickets()
        return ResponseEntity.ok(tickets)
    }
    
    // Прокси для финансов
    @GetMapping("/finance")
    fun getFinanceStats(): ResponseEntity<Map<String, Any>> {
        val tickets = ticketService.getAllTickets()
        
        val totalRevenue = tickets
            .filter { it.status.name in listOf("PAID", "USED") }
            .sumOf { it.price }
        
        val reservedRevenue = tickets
            .filter { it.status.name == "RESERVED" }
            .sumOf { it.price }
        
        val cancelledRevenue = tickets
            .filter { it.status.name == "CANCELLED" }
            .sumOf { it.price }
        
        val totalTickets = tickets.size
        val paidTickets = tickets.count { it.status.name in listOf("PAID", "USED") }
        val reservedTickets = tickets.count { it.status.name == "RESERVED" }
        val cancelledTickets = tickets.count { it.status.name == "CANCELLED" }
        
        val financeStats = mapOf(
            "totalRevenue" to totalRevenue,
            "reservedRevenue" to reservedRevenue,
            "cancelledRevenue" to cancelledRevenue,
            "totalTickets" to totalTickets,
            "paidTickets" to paidTickets,
            "reservedTickets" to reservedTickets,
            "cancelledTickets" to cancelledTickets,
            "conversionRate" to if (totalTickets > 0) (paidTickets.toDouble() / totalTickets * 100) else 0.0,
            "lastUpdated" to LocalDateTime.now()
        )
        
        return ResponseEntity.ok(financeStats)
    }
    
    // Прокси для событий
    @GetMapping("/events")
    fun getAllEvents(): ResponseEntity<List<Map<String, Any>>> {
        val events = listOf(
            mapOf(
                "id" to 1,
                "title" to "Премьера фильма",
                "description" to "Премьера нового блокбастера",
                "dj" to "DJ Max",
                "date" to "2024-01-15",
                "time" to "19:00:00",
                "price" to 1500.0,
                "genre" to "Techno",
                "image_url" to "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=200&fit=crop"
            ),
            mapOf(
                "id" to 2,
                "title" to "Кинофестиваль",
                "description" to "Ежегодный кинофестиваль",
                "dj" to "DJ Anna",
                "date" to "2024-02-20",
                "time" to "18:00:00",
                "price" to 2000.0,
                "genre" to "House",
                "image_url" to "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop"
            ),
            mapOf(
                "id" to 3,
                "title" to "Рок концерт",
                "description" to "Живой рок концерт",
                "dj" to "Rock Band",
                "date" to "2024-03-10",
                "time" to "20:00:00",
                "price" to 2500.0,
                "genre" to "Rock",
                "image_url" to "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=300&h=200&fit=crop"
            )
        )
        return ResponseEntity.ok(events)
    }

    // Создание нового события
    @PostMapping("/events")
    fun createEvent(@RequestBody eventData: Map<String, Any>): ResponseEntity<Map<String, Any>> {
        val newEvent = mapOf(
            "id" to (Math.random() * 10000).toInt(),
            "title" to (eventData["title"] ?: "Новое мероприятие"),
            "description" to (eventData["description"] ?: ""),
            "dj" to (eventData["dj_name"] ?: eventData["dj"] ?: "DJ Unknown"),
            "date" to (eventData["event_date"] ?: eventData["date"] ?: "2024-12-31"),
            "time" to (eventData["event_time"] ?: eventData["time"] ?: "20:00:00"),
            "price" to (eventData["price"] ?: 1000.0),
            "genre" to (eventData["genre"] ?: "Music"),
            "image_url" to (eventData["image_url"] ?: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=200&fit=crop"),
            "created_at" to LocalDateTime.now().toString(),
            "updated_at" to LocalDateTime.now().toString()
        )
        
        println("🎉 Создано новое событие: $newEvent")
        return ResponseEntity.ok(newEvent)
    }

    // Обновление события
    @PutMapping("/events/{id}")
    fun updateEvent(@PathVariable id: Int, @RequestBody eventData: Map<String, Any>): ResponseEntity<Map<String, Any>> {
        val updatedEvent = mapOf(
            "id" to id,
            "title" to (eventData["title"] ?: "Обновленное мероприятие"),
            "description" to (eventData["description"] ?: ""),
            "dj" to (eventData["dj_name"] ?: eventData["dj"] ?: "DJ Unknown"),
            "date" to (eventData["event_date"] ?: eventData["date"] ?: "2024-12-31"),
            "time" to (eventData["event_time"] ?: eventData["time"] ?: "20:00:00"),
            "price" to (eventData["price"] ?: 1000.0),
            "genre" to (eventData["genre"] ?: "Music"),
            "image_url" to (eventData["image_url"] ?: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=200&fit=crop"),
            "updated_at" to LocalDateTime.now().toString()
        )
        
        println("🎉 Обновлено событие $id: $updatedEvent")
        return ResponseEntity.ok(updatedEvent)
    }

    // Удаление события
    @DeleteMapping("/events/{id}")
    fun deleteEvent(@PathVariable id: Int): ResponseEntity<Map<String, String>> {
        println("🗑️ Удалено событие с ID: $id")
        return ResponseEntity.ok(mapOf("message" to "Событие успешно удалено", "id" to id.toString()))
    }
    
    // Прокси для еды
    @GetMapping("/food")
    fun getAllFood(): ResponseEntity<List<Map<String, Any>>> {
        val food = listOf(
            mapOf(
                "id" to 1,
                "name" to "Попкорн",
                "description" to "Свежий попкорн",
                "price" to 150.0,
                "category_id" to 1,
                "available" to true,
                "image_url" to "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=150&fit=crop"
            ),
            mapOf(
                "id" to 2,
                "name" to "Кока-Кола",
                "description" to "Газированный напиток",
                "price" to 100.0,
                "category_id" to 2,
                "available" to true,
                "image_url" to "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=200&h=150&fit=crop"
            ),
            mapOf(
                "id" to 3,
                "name" to "Хот-дог",
                "description" to "Классический хот-дог",
                "price" to 200.0,
                "category_id" to 1,
                "available" to true,
                "image_url" to "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=150&fit=crop"
            ),
            mapOf(
                "id" to 4,
                "name" to "Пицца",
                "description" to "Итальянская пицца",
                "price" to 350.0,
                "category_id" to 2,
                "available" to true,
                "image_url" to "https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=200&h=150&fit=crop"
            )
        )
        return ResponseEntity.ok(food)
    }

    // Создание нового блюда
    @PostMapping("/food")
    fun createFood(@RequestBody foodData: Map<String, Any>): ResponseEntity<Map<String, Any>> {
        val newFood = mapOf(
            "id" to (Math.random() * 10000).toInt(),
            "name" to (foodData["name"] ?: "Новое блюдо"),
            "description" to (foodData["description"] ?: ""),
            "price" to (foodData["price"] ?: 100.0),
            "category_id" to (foodData["category"] ?: foodData["category_id"] ?: 1),
            "available" to (foodData["is_available"] ?: foodData["available"] ?: true),
            "image_url" to (foodData["image_url"] ?: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=150&fit=crop"),
            "created_at" to LocalDateTime.now().toString(),
            "updated_at" to LocalDateTime.now().toString()
        )
        
        println("🍕 Создано новое блюдо: $newFood")
        return ResponseEntity.ok(newFood)
    }

    // Обновление блюда
    @PutMapping("/food/{id}")
    fun updateFood(@PathVariable id: Int, @RequestBody foodData: Map<String, Any>): ResponseEntity<Map<String, Any>> {
        val updatedFood = mapOf(
            "id" to id,
            "name" to (foodData["name"] ?: "Обновленное блюдо"),
            "description" to (foodData["description"] ?: ""),
            "price" to (foodData["price"] ?: 100.0),
            "category_id" to (foodData["category"] ?: foodData["category_id"] ?: 1),
            "available" to (foodData["is_available"] ?: foodData["available"] ?: true),
            "image_url" to (foodData["image_url"] ?: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=150&fit=crop"),
            "updated_at" to LocalDateTime.now().toString()
        )
        
        println("🍕 Обновлено блюдо $id: $updatedFood")
        return ResponseEntity.ok(updatedFood)
    }

    // Удаление блюда
    @DeleteMapping("/food/{id}")
    fun deleteFood(@PathVariable id: Int): ResponseEntity<Map<String, String>> {
        println("🗑️ Удалено блюдо с ID: $id")
        return ResponseEntity.ok(mapOf("message" to "Блюдо успешно удалено", "id" to id.toString()))
    }
    
    // Прокси для шаблонов сеансов
    @GetMapping("/session-templates")
    fun getAllSessionTemplates(): ResponseEntity<List<Map<String, Any>>> {
        val templates = listOf(
            mapOf(
                "id" to 1,
                "name" to "Утренний сеанс",
                "description" to "Сеансы в утреннее время",
                "default_hall" to "Зал 1",
                "default_price" to 300.0,
                "default_capacity" to 100,
                "time_slots" to listOf("10:00", "12:00", "14:00"),
                "days_of_week" to listOf(1, 2, 3, 4, 5),
                "is_active" to true
            ),
            mapOf(
                "id" to 2,
                "name" to "Дневной сеанс",
                "description" to "Сеансы в дневное время",
                "default_hall" to "Зал 2",
                "default_price" to 400.0,
                "default_capacity" to 120,
                "time_slots" to listOf("15:00", "17:00", "19:00"),
                "days_of_week" to listOf(1, 2, 3, 4, 5, 6),
                "is_active" to true
            ),
            mapOf(
                "id" to 3,
                "name" to "Вечерний сеанс",
                "description" to "Сеансы в вечернее время",
                "default_hall" to "Зал 1",
                "default_price" to 500.0,
                "default_capacity" to 100,
                "time_slots" to listOf("20:00", "22:00"),
                "days_of_week" to listOf(5, 6, 7),
                "is_active" to true
            )
        )
        return ResponseEntity.ok(templates)
    }
} 