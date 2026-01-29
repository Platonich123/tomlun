package com.tomlun.cinema.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "cinema_movies")
data class Movie(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,
    
    @Column(nullable = false)
    val title: String,
    
    @Column(nullable = false)
    val genre: String,
    
    @Column
    val duration: Int? = null,
    
    @Column
    val rating: BigDecimal? = null,
    
    @Column(columnDefinition = "TEXT")
    val description: String? = null,
    
    @Column(name = "poster_url")
    val posterUrl: String? = null,
    
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
) 