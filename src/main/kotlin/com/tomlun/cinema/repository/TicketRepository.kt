package com.tomlun.cinema.repository

import com.tomlun.cinema.model.Ticket
import com.tomlun.cinema.model.TicketStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface TicketRepository : JpaRepository<Ticket, Int> {
    
    fun findByUserId(userId: Int): List<Ticket>
    
    fun findBySessionId(sessionId: Int): List<Ticket>
    
    fun findByStatus(status: TicketStatus): List<Ticket>
    
    fun findByUserIdAndStatus(userId: Int, status: TicketStatus): List<Ticket>
    
    @Query("SELECT t FROM Ticket t WHERE t.session.id = :sessionId AND t.seatNumber = :seatNumber AND t.status IN ('RESERVED', 'PAID')")
    fun findOccupiedSeats(sessionId: Int, seatNumber: Int): List<Ticket>
    
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.session.id = :sessionId AND t.status IN ('RESERVED', 'PAID')")
    fun countSoldTicketsBySession(sessionId: Int): Long
} 