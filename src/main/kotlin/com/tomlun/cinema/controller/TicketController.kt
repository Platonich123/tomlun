package com.tomlun.cinema.controller

import com.tomlun.cinema.model.Ticket
import com.tomlun.cinema.model.TicketStatus
import com.tomlun.cinema.service.TicketService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/kotlin/tickets")
@CrossOrigin(origins = ["http://localhost:5173"])
class TicketController(
    private val ticketService: TicketService
) {
    
    @GetMapping
    fun getAllTickets(): ResponseEntity<List<Ticket>> {
        val tickets = ticketService.getAllTickets()
        return ResponseEntity.ok(tickets)
    }
    
    @GetMapping("/{id}")
    fun getTicketById(@PathVariable id: Int): ResponseEntity<Ticket> {
        val ticket = ticketService.getTicketById(id)
        return if (ticket != null) {
            ResponseEntity.ok(ticket)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping("/user/{userId}")
    fun getTicketsByUser(@PathVariable userId: Int): ResponseEntity<List<Ticket>> {
        val tickets = ticketService.getTicketsByUser(userId)
        return ResponseEntity.ok(tickets)
    }
    
    @GetMapping("/session/{sessionId}")
    fun getTicketsBySession(@PathVariable sessionId: Int): ResponseEntity<List<Ticket>> {
        val tickets = ticketService.getTicketsBySession(sessionId)
        return ResponseEntity.ok(tickets)
    }
    
    @GetMapping("/status/{status}")
    fun getTicketsByStatus(@PathVariable status: TicketStatus): ResponseEntity<List<Ticket>> {
        val tickets = ticketService.getTicketsByStatus(status)
        return ResponseEntity.ok(tickets)
    }
    
    @GetMapping("/user/{userId}/status/{status}")
    fun getUserTicketsByStatus(
        @PathVariable userId: Int,
        @PathVariable status: TicketStatus
    ): ResponseEntity<List<Ticket>> {
        val tickets = ticketService.getUserTicketsByStatus(userId, status)
        return ResponseEntity.ok(tickets)
    }
    
    @PostMapping("/reserve")
    fun reserveTicket(
        @RequestParam sessionId: Int,
        @RequestParam userId: Int,
        @RequestParam seatNumber: Int
    ): ResponseEntity<Ticket> {
        val ticket = ticketService.reserveTicket(sessionId, userId, seatNumber)
        return if (ticket != null) {
            ResponseEntity.ok(ticket)
        } else {
            ResponseEntity.badRequest().build()
        }
    }
    
    @PutMapping("/{id}/pay")
    fun payTicket(@PathVariable id: Int): ResponseEntity<Ticket> {
        val ticket = ticketService.payTicket(id)
        return if (ticket != null) {
            ResponseEntity.ok(ticket)
        } else {
            ResponseEntity.badRequest().build()
        }
    }
    
    @PutMapping("/{id}/cancel")
    fun cancelTicket(@PathVariable id: Int): ResponseEntity<Ticket> {
        val ticket = ticketService.cancelTicket(id)
        return if (ticket != null) {
            ResponseEntity.ok(ticket)
        } else {
            ResponseEntity.badRequest().build()
        }
    }
    
    @PutMapping("/{id}/use")
    fun useTicket(@PathVariable id: Int): ResponseEntity<Ticket> {
        val ticket = ticketService.useTicket(id)
        return if (ticket != null) {
            ResponseEntity.ok(ticket)
        } else {
            ResponseEntity.badRequest().build()
        }
    }
    
    @GetMapping("/session/{sessionId}/available-seats")
    fun getAvailableSeats(@PathVariable sessionId: Int): ResponseEntity<List<Int>> {
        val seats = ticketService.getAvailableSeats(sessionId)
        return ResponseEntity.ok(seats)
    }
} 