package com.tomlun.cinema.controller

import com.tomlun.cinema.model.Session
import com.tomlun.cinema.service.SessionService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import java.time.LocalDateTime

@RestController
@RequestMapping("/api/kotlin/sessions")
@CrossOrigin(origins = ["http://localhost:5173"])
class SessionController(
    private val sessionService: SessionService
) {
    
    @GetMapping
    fun getAllSessions(): ResponseEntity<List<Session>> {
        val sessions = sessionService.getAllSessions()
        return ResponseEntity.ok(sessions)
    }
    
    @GetMapping("/{id}")
    fun getSessionById(@PathVariable id: Int): ResponseEntity<Session> {
        val session = sessionService.getSessionById(id)
        return if (session != null) {
            ResponseEntity.ok(session)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping("/movie/{movieId}")
    fun getSessionsByMovie(@PathVariable movieId: Int): ResponseEntity<List<Session>> {
        val sessions = sessionService.getSessionsByMovie(movieId)
        return ResponseEntity.ok(sessions)
    }
    
    @GetMapping("/upcoming")
    fun getUpcomingSessions(): ResponseEntity<List<Session>> {
        val sessions = sessionService.getUpcomingSessions()
        return ResponseEntity.ok(sessions)
    }
    
    @GetMapping("/upcoming/movie/{movieId}")
    fun getUpcomingSessionsByMovie(@PathVariable movieId: Int): ResponseEntity<List<Session>> {
        val sessions = sessionService.getUpcomingSessionsByMovie(movieId)
        return ResponseEntity.ok(sessions)
    }
    
    @GetMapping("/active")
    fun getActiveSessions(): ResponseEntity<List<Session>> {
        val sessions = sessionService.getActiveSessions()
        return ResponseEntity.ok(sessions)
    }
    
    @PostMapping
    fun createSession(
        @RequestParam movieId: Int,
        @RequestParam hallNumber: Int,
        @RequestParam startTime: String,
        @RequestParam price: BigDecimal,
        @RequestParam totalSeats: Int
    ): ResponseEntity<Session> {
        val parsedStartTime = LocalDateTime.parse(startTime)
        val session = sessionService.createSession(movieId, hallNumber, parsedStartTime, price, totalSeats)
        return if (session != null) {
            ResponseEntity.ok(session)
        } else {
            ResponseEntity.badRequest().build()
        }
    }
    
    @PutMapping("/{id}")
    fun updateSession(@PathVariable id: Int, @RequestBody session: Session): ResponseEntity<Session> {
        val updatedSession = sessionService.updateSession(id, session)
        return if (updatedSession != null) {
            ResponseEntity.ok(updatedSession)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @DeleteMapping("/{id}")
    fun deleteSession(@PathVariable id: Int): ResponseEntity<Unit> {
        val deleted = sessionService.deleteSession(id)
        return if (deleted) {
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @PutMapping("/{id}/deactivate")
    fun deactivateSession(@PathVariable id: Int): ResponseEntity<Session> {
        val session = sessionService.deactivateSession(id)
        return if (session != null) {
            ResponseEntity.ok(session)
        } else {
            ResponseEntity.notFound().build()
        }
    }
} 