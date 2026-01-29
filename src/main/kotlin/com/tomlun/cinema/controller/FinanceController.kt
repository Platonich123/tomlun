package com.tomlun.cinema.controller

import com.tomlun.cinema.service.TicketService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/kotlin/finance")
@CrossOrigin(origins = ["http://localhost:5173"])
class FinanceController(
    private val ticketService: TicketService
) {
    
    @GetMapping
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
    
    @GetMapping("/revenue/daily")
    fun getDailyRevenue(): ResponseEntity<Map<String, Any>> {
        val tickets = ticketService.getAllTickets()
        val today = LocalDateTime.now().toLocalDate()
        
        val dailyRevenue = tickets
            .filter { 
                it.status.name in listOf("PAID", "USED") &&
                it.purchaseDate.toLocalDate() == today
            }
            .sumOf { it.price }
        
        val dailyTickets = tickets.count { 
            it.purchaseDate.toLocalDate() == today 
        }
        
        return ResponseEntity.ok(mapOf(
            "date" to today.toString(),
            "revenue" to dailyRevenue,
            "tickets" to dailyTickets
        ))
    }
    
    @GetMapping("/revenue/monthly")
    fun getMonthlyRevenue(): ResponseEntity<Map<String, Any>> {
        val tickets = ticketService.getAllTickets()
        val currentMonth = LocalDateTime.now().monthValue
        val currentYear = LocalDateTime.now().year
        
        val monthlyRevenue = tickets
            .filter { 
                it.status.name in listOf("PAID", "USED") &&
                it.purchaseDate.monthValue == currentMonth &&
                it.purchaseDate.year == currentYear
            }
            .sumOf { it.price }
        
        val monthlyTickets = tickets.count { 
            it.purchaseDate.monthValue == currentMonth &&
            it.purchaseDate.year == currentYear
        }
        
        return ResponseEntity.ok(mapOf(
            "month" to currentMonth,
            "year" to currentYear,
            "revenue" to monthlyRevenue,
            "tickets" to monthlyTickets
        ))
    }
} 