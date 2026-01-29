package com.tomlun.cinema.repository

import com.tomlun.cinema.model.Movie
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal

@Repository
interface MovieRepository : JpaRepository<Movie, Int> {
    
    @Query("SELECT m FROM Movie m WHERE m.title ILIKE %:searchTerm% OR m.genre ILIKE %:searchTerm%")
    fun findByTitleOrGenreContainingIgnoreCase(searchTerm: String): List<Movie>
    
    fun findByGenre(genre: String): List<Movie>
    
    fun findByRatingGreaterThanEqual(rating: BigDecimal): List<Movie>
    
    @Query("SELECT COUNT(m) FROM Movie m")
    fun countAll(): Long
} 