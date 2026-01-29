package com.tomlun.cinema.dto

import com.tomlun.cinema.model.Ticket
import com.tomlun.cinema.model.TicketStatus
import java.math.BigDecimal
import java.time.LocalDateTime

data class TicketDto(
    val id: Int?,
    val sessionId: Int,
    val movieTitle: String,
    val hallNumber: Int,
    val startTime: LocalDateTime,
    val userId: Int,
    val userName: String,
    val seatNumber: Int,
    val price: BigDecimal,
    val status: TicketStatus,
    val purchaseDate: LocalDateTime,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun fromTicket(ticket: Ticket): TicketDto = TicketDto(
            id = ticket.id,
            sessionId = ticket.session.id!!,
            movieTitle = ticket.session.movie.title,
            hallNumber = ticket.session.hallNumber,
            startTime = ticket.session.startTime,
            userId = ticket.user.id!!,
            userName = ticket.user.name,
            seatNumber = ticket.seatNumber,
            price = ticket.price,
            status = ticket.status,
            purchaseDate = ticket.purchaseDate,
            createdAt = ticket.createdAt,
            updatedAt = ticket.updatedAt
        )
    }
}

data class ReserveTicketRequest(
    val sessionId: Int,
    val userId: Int,
    val seatNumber: Int
) 