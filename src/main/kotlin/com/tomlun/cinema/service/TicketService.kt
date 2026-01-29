package com.tomlun.cinema.service

import com.tomlun.cinema.model.Session
import com.tomlun.cinema.model.Ticket
import com.tomlun.cinema.model.TicketStatus
import com.tomlun.cinema.model.User
import com.tomlun.cinema.repository.SessionRepository
import com.tomlun.cinema.repository.TicketRepository
import com.tomlun.cinema.repository.UserRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class TicketService(
    private val ticketRepository: TicketRepository,
    private val sessionRepository: SessionRepository,
    private val userRepository: UserRepository
) {
    
    fun getAllTickets(): List<Ticket> = ticketRepository.findAll()
    
    fun getTicketById(id: Int): Ticket? = ticketRepository.findById(id).orElse(null)
    
    fun getTicketsByUser(userId: Int): List<Ticket> = ticketRepository.findByUserId(userId)
    
    fun getTicketsBySession(sessionId: Int): List<Ticket> = ticketRepository.findBySessionId(sessionId)
    
    fun getTicketsByStatus(status: TicketStatus): List<Ticket> = ticketRepository.findByStatus(status)
    
    fun getUserTicketsByStatus(userId: Int, status: TicketStatus): List<Ticket> = 
        ticketRepository.findByUserIdAndStatus(userId, status)
    
    fun reserveTicket(sessionId: Int, userId: Int, seatNumber: Int): Ticket? {
        val session = sessionRepository.findById(sessionId).orElse(null) ?: return null
        val user = userRepository.findById(userId).orElse(null) ?: return null
        
        // Проверяем, не занято ли место
        val occupiedSeats = ticketRepository.findOccupiedSeats(sessionId, seatNumber)
        if (occupiedSeats.isNotEmpty()) {
            return null // Место уже занято
        }
        
        // Проверяем, есть ли свободные места
        if (session.availableSeats <= 0) {
            return null // Нет свободных мест
        }
        
        val ticket = Ticket(
            session = session,
            user = user,
            seatNumber = seatNumber,
            price = session.price,
            status = TicketStatus.RESERVED
        )
        
        val savedTicket = ticketRepository.save(ticket)
        
        // Обновляем количество доступных мест
        val soldTickets = ticketRepository.countSoldTicketsBySession(sessionId)
        val updatedSession = session.copy(
            availableSeats = session.totalSeats - soldTickets.toInt(),
            updatedAt = LocalDateTime.now()
        )
        sessionRepository.save(updatedSession)
        
        return savedTicket
    }
    
    fun payTicket(ticketId: Int): Ticket? {
        val ticket = ticketRepository.findById(ticketId).orElse(null) ?: return null
        
        if (ticket.status != TicketStatus.RESERVED) {
            return null // Билет уже оплачен или отменен
        }
        
        val updatedTicket = ticket.copy(
            status = TicketStatus.PAID,
            updatedAt = LocalDateTime.now()
        )
        
        return ticketRepository.save(updatedTicket)
    }
    
    fun cancelTicket(ticketId: Int): Ticket? {
        val ticket = ticketRepository.findById(ticketId).orElse(null) ?: return null
        
        if (ticket.status == TicketStatus.USED) {
            return null // Нельзя отменить использованный билет
        }
        
        val updatedTicket = ticket.copy(
            status = TicketStatus.CANCELLED,
            updatedAt = LocalDateTime.now()
        )
        
        val savedTicket = ticketRepository.save(updatedTicket)
        
        // Обновляем количество доступных мест
        val session = ticket.session
        val soldTickets = ticketRepository.countSoldTicketsBySession(session.id!!)
        val updatedSession = session.copy(
            availableSeats = session.totalSeats - soldTickets.toInt(),
            updatedAt = LocalDateTime.now()
        )
        sessionRepository.save(updatedSession)
        
        return savedTicket
    }
    
    fun useTicket(ticketId: Int): Ticket? {
        val ticket = ticketRepository.findById(ticketId).orElse(null) ?: return null
        
        if (ticket.status != TicketStatus.PAID) {
            return null // Можно использовать только оплаченный билет
        }
        
        val updatedTicket = ticket.copy(
            status = TicketStatus.USED,
            updatedAt = LocalDateTime.now()
        )
        
        return ticketRepository.save(updatedTicket)
    }
    
    fun getAvailableSeats(sessionId: Int): List<Int> {
        val session = sessionRepository.findById(sessionId).orElse(null) ?: return emptyList()
        val occupiedSeats = ticketRepository.findBySessionId(sessionId)
            .filter { it.status in listOf(TicketStatus.RESERVED, TicketStatus.PAID) }
            .map { it.seatNumber }
        
        return (1..session.totalSeats).filter { it !in occupiedSeats }
    }
} 