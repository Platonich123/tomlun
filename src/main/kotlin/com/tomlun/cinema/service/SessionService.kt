package com.tomlun.cinema.service

import com.tomlun.cinema.model.Movie
import com.tomlun.cinema.model.Session
import com.tomlun.cinema.repository.MovieRepository
import com.tomlun.cinema.repository.SessionRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
class SessionService(
    private val sessionRepository: SessionRepository,
    private val movieRepository: MovieRepository
) {
    
    fun getAllSessions(): List<Session> = sessionRepository.findAll()
    
    fun getSessionById(id: Int): Session? = sessionRepository.findById(id).orElse(null)
    
    fun getSessionsByMovie(movieId: Int): List<Session> = sessionRepository.findByMovieId(movieId)
    
    fun getUpcomingSessions(): List<Session> = sessionRepository.findUpcomingSessions(LocalDateTime.now())
    
    fun getUpcomingSessionsByMovie(movieId: Int): List<Session> = 
        sessionRepository.findUpcomingSessionsByMovie(movieId, LocalDateTime.now())
    
    fun getActiveSessions(): List<Session> = sessionRepository.findByIsActiveTrue()
    
    fun createSession(
        movieId: Int,
        hallNumber: Int,
        startTime: LocalDateTime,
        price: BigDecimal,
        totalSeats: Int
    ): Session? {
        val movie = movieRepository.findById(movieId).orElse(null) ?: return null
        
        // Рассчитываем время окончания (предполагаем, что фильм длится 2 часа)
        val endTime = startTime.plusHours(2)
        
        val session = Session(
            movie = movie,
            hallNumber = hallNumber,
            startTime = startTime,
            endTime = endTime,
            price = price,
            totalSeats = totalSeats,
            availableSeats = totalSeats
        )
        
        return sessionRepository.save(session)
    }
    
    fun updateSession(id: Int, session: Session): Session? {
        val existingSession = sessionRepository.findById(id).orElse(null) ?: return null
        
        val updatedSession = existingSession.copy(
            hallNumber = session.hallNumber,
            startTime = session.startTime,
            endTime = session.endTime,
            price = session.price,
            totalSeats = session.totalSeats,
            isActive = session.isActive,
            updatedAt = LocalDateTime.now()
        )
        
        return sessionRepository.save(updatedSession)
    }
    
    fun deleteSession(id: Int): Boolean {
        return if (sessionRepository.existsById(id)) {
            sessionRepository.deleteById(id)
            true
        } else {
            false
        }
    }
    
    fun deactivateSession(id: Int): Session? {
        val session = sessionRepository.findById(id).orElse(null) ?: return null
        val updatedSession = session.copy(isActive = false, updatedAt = LocalDateTime.now())
        return sessionRepository.save(updatedSession)
    }
} 