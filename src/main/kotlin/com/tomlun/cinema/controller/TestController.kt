package com.tomlun.cinema.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest

@RestController
@RequestMapping("/api/kotlin/test")
@CrossOrigin(origins = ["http://localhost:5173"])
class TestController {
    
    @GetMapping("/auth")
    fun testAuth(request: HttpServletRequest): ResponseEntity<Map<String, Any>> {
        val authHeader = request.getHeader("Authorization")
        val userAgent = request.getHeader("User-Agent")
        val origin = request.getHeader("Origin")
        
        val response = mapOf(
            "message" to "Auth test endpoint",
            "hasAuthHeader" to (authHeader != null),
            "authHeader" to (authHeader ?: "null"),
            "userAgent" to (userAgent ?: "null"),
            "origin" to (origin ?: "null"),
            "method" to request.method,
            "url" to request.requestURL.toString()
        )
        
        return ResponseEntity.ok(response)
    }
    
    @GetMapping("/public")
    fun testPublic(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(mapOf(
            "message" to "Public endpoint works!",
            "timestamp" to System.currentTimeMillis()
        ))
    }
} 