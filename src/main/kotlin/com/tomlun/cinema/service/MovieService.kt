package com.tomlun.cinema.service

import com.tomlun.cinema.model.Movie
import com.tomlun.cinema.repository.MovieRepository
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDateTime

@Service
class MovieService(
    private val movieRepository: MovieRepository
) {
    
    fun getAllMovies(): List<Movie> = movieRepository.findAll()
    
    fun getMovieById(id: Int): Movie? = movieRepository.findById(id).orElse(null)
    
    fun searchMovies(searchTerm: String): List<Movie> = 
        movieRepository.findByTitleOrGenreContainingIgnoreCase(searchTerm)
    
    fun getMoviesByGenre(genre: String): List<Movie> = 
        movieRepository.findByGenre(genre)
    
    fun getMoviesByRating(minRating: BigDecimal): List<Movie> = 
        movieRepository.findByRatingGreaterThanEqual(minRating)
    
    fun createMovie(movie: Movie): Movie {
        val now = LocalDateTime.now()
        val newMovie = movie.copy(
            createdAt = now,
            updatedAt = now
        )
        return movieRepository.save(newMovie)
    }
    
    fun updateMovie(id: Int, movie: Movie): Movie? {
        val existingMovie = movieRepository.findById(id).orElse(null) ?: return null
        
        val updatedMovie = existingMovie.copy(
            title = movie.title,
            genre = movie.genre,
            duration = movie.duration,
            rating = movie.rating,
            description = movie.description,
            posterUrl = movie.posterUrl,
            updatedAt = LocalDateTime.now()
        )
        
        return movieRepository.save(updatedMovie)
    }
    
    fun deleteMovie(id: Int): Boolean {
        return if (movieRepository.existsById(id)) {
            movieRepository.deleteById(id)
            true
        } else {
            false
        }
    }
    
    fun getTotalCount(): Long = movieRepository.countAll()
} 