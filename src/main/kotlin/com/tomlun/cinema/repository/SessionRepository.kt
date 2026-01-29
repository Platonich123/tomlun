package com.tomlun.cinema.repository

import com.tomlun.cinema.model.Session
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface SessionRepository : JpaRepository<Session, Int> {
    
    fun findByMovieId(movieId: Int): List<Session>
    
    fun findByStartTimeBetween(start: LocalDateTime, end: LocalDateTime): List<Session>
    
    fun findByIsActiveTrue(): List<Session>
    
    fun findByMovieIdAndStartTimeAfter(movieId: Int, startTime: LocalDateTime): List<Session>
    
    @Query("SELECT s FROM Session s WHERE s.movie.id = :movieId AND s.startTime >= :now AND s.isActive = true ORDER BY s.startTime")
    fun findUpcomingSessionsByMovie(movieId: Int, now: LocalDateTime): List<Session>
    
    @Query("SELECT s FROM Session s WHERE s.startTime >= :now AND s.isActive = true ORDER BY s.startTime")
    fun findUpcomingSessions(now: LocalDateTime): List<Session>
} 