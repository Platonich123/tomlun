package com.tomlun.cinema.controller

import com.tomlun.cinema.model.Movie
import com.tomlun.cinema.service.MovieService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/kotlin/movies")
@CrossOrigin(origins = ["http://localhost:5173"])
class MovieController(
    private val movieService: MovieService
) {
    
    @GetMapping
    fun getAllMovies(): ResponseEntity<List<Movie>> {
        val movies = movieService.getAllMovies()
        return ResponseEntity.ok(movies)
    }
    
    @GetMapping("/{id}")
    fun getMovieById(@PathVariable id: Int): ResponseEntity<Movie> {
        val movie = movieService.getMovieById(id)
        return if (movie != null) {
            ResponseEntity.ok(movie)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping("/search")
    fun searchMovies(@RequestParam q: String): ResponseEntity<List<Movie>> {
        val movies = movieService.searchMovies(q)
        return ResponseEntity.ok(movies)
    }
    
    @GetMapping("/genre/{genre}")
    fun getMoviesByGenre(@PathVariable genre: String): ResponseEntity<List<Movie>> {
        val movies = movieService.getMoviesByGenre(genre)
        return ResponseEntity.ok(movies)
    }
    
    @GetMapping("/rating/{minRating}")
    fun getMoviesByRating(@PathVariable minRating: BigDecimal): ResponseEntity<List<Movie>> {
        val movies = movieService.getMoviesByRating(minRating)
        return ResponseEntity.ok(movies)
    }
    
    @PostMapping
    fun createMovie(@RequestBody movie: Movie): ResponseEntity<Movie> {
        val createdMovie = movieService.createMovie(movie)
        return ResponseEntity.ok(createdMovie)
    }
    
    @PutMapping("/{id}")
    fun updateMovie(@PathVariable id: Int, @RequestBody movie: Movie): ResponseEntity<Movie> {
        val updatedMovie = movieService.updateMovie(id, movie)
        return if (updatedMovie != null) {
            ResponseEntity.ok(updatedMovie)
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @DeleteMapping("/{id}")
    fun deleteMovie(@PathVariable id: Int): ResponseEntity<Unit> {
        val deleted = movieService.deleteMovie(id)
        return if (deleted) {
            ResponseEntity.ok().build()
        } else {
            ResponseEntity.notFound().build()
        }
    }
    
    @GetMapping("/count")
    fun getTotalCount(): ResponseEntity<Long> {
        val count = movieService.getTotalCount()
        return ResponseEntity.ok(count)
    }
} 