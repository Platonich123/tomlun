package com.tomlun.cinema.dto

import com.tomlun.cinema.model.Session
import java.math.BigDecimal
import java.time.LocalDateTime

data class SessionDto(
    val id: Int?,
    val movieId: Int,
    val movieTitle: String,
    val hallNumber: Int,
    val startTime: LocalDateTime,
    val endTime: LocalDateTime,
    val price: BigDecimal,
    val totalSeats: Int,
    val availableSeats: Int,
    val isActive: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun fromSession(session: Session): SessionDto = SessionDto(
            id = session.id,
            movieId = session.movie.id!!,
            movieTitle = session.movie.title,
            hallNumber = session.hallNumber,
            startTime = session.startTime,
            endTime = session.endTime,
            price = session.price,
            totalSeats = session.totalSeats,
            availableSeats = session.availableSeats,
            isActive = session.isActive,
            createdAt = session.createdAt,
            updatedAt = session.updatedAt
        )
    }
}

data class CreateSessionRequest(
    val movieId: Int,
    val hallNumber: Int,
    val startTime: LocalDateTime,
    val price: BigDecimal,
    val totalSeats: Int
) 