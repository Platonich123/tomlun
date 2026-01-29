package com.tomlun.cinema.controller

import com.tomlun.cinema.model.Ticket
import com.tomlun.cinema.service.TicketService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/kotlin/orders")
@CrossOrigin(origins = ["http://localhost:5173"])
class OrderController(
    private val ticketService: TicketService
) {
    
    @GetMapping
    fun getAllOrders(): ResponseEntity<List<Ticket>> {
        val tickets = ticketService.getAllTickets()
        return ResponseEntity.ok(tickets)
    }
    
    @GetMapping("/{id}")
    fun getOrderById(@PathVariable id: Int): ResponseEntity<Ticket> {
        val ticket = ticketService.getTicketById(id)
        return if (ticket != null) {
            ResponseEntity.ok(ticket)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping("/user/{userId}")
    fun getOrdersByUser(@PathVariable userId: Int): ResponseEntity<List<Ticket>> {
        val tickets = ticketService.getTicketsByUser(userId)
        return ResponseEntity.ok(tickets)
    }
    
    @GetMapping("/session/{sessionId}")
    fun getOrdersBySession(@PathVariable sessionId: Int): ResponseEntity<List<Ticket>> {
        val tickets = ticketService.getTicketsBySession(sessionId)
        return ResponseEntity.ok(tickets)
    }
    
    @GetMapping("/status/{status}")
    fun getOrdersByStatus(@PathVariable status: String): ResponseEntity<List<Ticket>> {
        val ticketStatus = when (status.uppercase()) {
            "RESERVED" -> com.tomlun.cinema.model.TicketStatus.RESERVED
            "PAID" -> com.tomlun.cinema.model.TicketStatus.PAID
            "CANCELLED" -> com.tomlun.cinema.model.TicketStatus.CANCELLED
            "USED" -> com.tomlun.cinema.model.TicketStatus.USED
            else -> return ResponseEntity.badRequest().build()
        }
        
        val tickets = ticketService.getTicketsByStatus(ticketStatus)
        return ResponseEntity.ok(tickets)
    }
    
    @PutMapping("/{id}/cancel")
    fun cancelOrder(@PathVariable id: Int): ResponseEntity<Ticket> {
        val ticket = ticketService.cancelTicket(id)
        return if (ticket != null) {
            ResponseEntity.ok(ticket)
        } else {
            ResponseEntity.badRequest().build()
        }
    }
    
    @PutMapping("/{id}/pay")
    fun payOrder(@PathVariable id: Int): ResponseEntity<Ticket> {
        val ticket = ticketService.payTicket(id)
        return if (ticket != null) {
            ResponseEntity.ok(ticket)
        } else {
            ResponseEntity.badRequest().build()
        }
    }
} 