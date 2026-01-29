package com.tomlun.cinema.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "cinema_sessions")
data class Session(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    val movie: Movie,
    
    @Column(name = "hall_number", nullable = false)
    val hallNumber: Int,
    
    @Column(name = "start_time", nullable = false)
    val startTime: LocalDateTime,
    
    @Column(name = "end_time", nullable = false)
    val endTime: LocalDateTime,
    
    @Column(name = "price", nullable = false)
    val price: BigDecimal,
    
    @Column(name = "total_seats", nullable = false)
    val totalSeats: Int,
    
    @Column(name = "available_seats", nullable = false)
    val availableSeats: Int,
    
    @Column(name = "is_active", nullable = false)
    val isActive: Boolean = true,
    
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 