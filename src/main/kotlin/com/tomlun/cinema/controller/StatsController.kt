package com.tomlun.cinema.controller

import com.tomlun.cinema.service.MovieService
import com.tomlun.cinema.service.SessionService
import com.tomlun.cinema.service.TicketService
import com.tomlun.cinema.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/kotlin/stats")
@CrossOrigin(origins = ["http://localhost:*", "http://127.0.0.1:*"], allowCredentials = "true")
class StatsController(
    private val movieService: MovieService,
    private val sessionService: SessionService,
    private val ticketService: TicketService,
    private val userService: UserService
) {
    
    @GetMapping
    fun getStats(): ResponseEntity<Map<String, Any>> {
        val movies = movieService.getAllMovies()
        val sessions = sessionService.getAllSessions()
        val tickets = ticketService.getAllTickets()
        val users = userService.getAllUsers()
        
        val totalRevenue = tickets
            .filter { it.status.name in listOf("PAID", "USED") }
            .sumOf { it.price }
        
        val activeSessions = sessions.count { it.isActive }
        val totalTickets = tickets.size
        val soldTickets = tickets.count { it.status.name in listOf("RESERVED", "PAID", "USED") }
        
        val averageRating = movies.mapNotNull { it.rating?.toDouble() }.let { ratings ->
            if (ratings.isNotEmpty()) ratings.average() else 0.0
        }
        
        val stats = mapOf(
            "totalMovies" to movies.size,
            "totalSessions" to sessions.size,
            "activeSessions" to activeSessions,
            "totalUsers" to users.size,
            "totalTickets" to totalTickets,
            "soldTickets" to soldTickets,
            "totalRevenue" to totalRevenue,
            "averageRating" to averageRating,
            "lastUpdated" to LocalDateTime.now()
        )
        
        return ResponseEntity.ok(stats)
    }
    
    @GetMapping("/revenue")
    fun getRevenueStats(): ResponseEntity<Map<String, Any>> {
        val tickets = ticketService.getAllTickets()
        
        val totalRevenue = tickets
            .filter { it.status.name in listOf("PAID", "USED") }
            .sumOf { it.price }
        
        val monthlyRevenue = tickets
            .filter { 
                it.status.name in listOf("PAID", "USED") &&
                it.purchaseDate.month == LocalDateTime.now().month
            }
            .sumOf { it.price }
        
        val weeklyRevenue = tickets
            .filter { 
                it.status.name in listOf("PAID", "USED") &&
                it.purchaseDate.isAfter(LocalDateTime.now().minusWeeks(1))
            }
            .sumOf { it.price }
        
        val revenueStats = mapOf(
            "totalRevenue" to totalRevenue,
            "monthlyRevenue" to monthlyRevenue,
            "weeklyRevenue" to weeklyRevenue,
            "currency" to "RUB"
        )
        
        return ResponseEntity.ok(revenueStats)
    }
} 