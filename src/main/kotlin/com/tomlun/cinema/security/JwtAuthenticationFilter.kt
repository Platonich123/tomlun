package com.tomlun.cinema.security

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtUtils: JwtUtils,
    private val userDetailsService: UserDetailsService
) : OncePerRequestFilter() {
    
    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            // Пропускаем JWT проверку для публичных endpoints
            if (isPublicEndpoint(request.requestURI)) {
                filterChain.doFilter(request, response)
                return
            }
            
            val jwt = parseJwt(request)
            if (jwt != null && jwtUtils.validateToken(jwt)) {
                val username = jwtUtils.getUsernameFromToken(jwt)
                
                if (username != null && SecurityContextHolder.getContext().authentication == null) {
                    val userDetails = userDetailsService.loadUserByUsername(username)
                    val authentication = UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.authorities
                    )
                    authentication.details = WebAuthenticationDetailsSource().buildDetails(request)
                    
                    SecurityContextHolder.getContext().authentication = authentication
                }
            }
        } catch (e: Exception) {
            logger.error("Cannot set user authentication: ${e.message}")
        }
        
        filterChain.doFilter(request, response)
    }
    
    private fun isPublicEndpoint(uri: String): Boolean {
        val publicEndpoints = listOf(
            "/api/kotlin/auth/login",
            "/api/kotlin/auth/register",
            "/api/kotlin/auth/validate",
            "/api/kotlin/movies",
            "/api/kotlin/sessions",
            "/api/kotlin/tickets",
            "/api/kotlin/stats",
            "/api/kotlin/users",
            "/api/kotlin/orders",
            "/api/kotlin/finance",
            "/api/kotlin/events",
            "/api/kotlin/food",
            "/api/kotlin/session-templates",
            "/api/kotlin/test",
            "/api/kotlin/public",
            "/stats",
            "/users",
            "/movies",
            "/sessions",
            "/orders",
            "/finance",
            "/events",
            "/food",
            "/session-templates",
            "/test"
        )
        
        return publicEndpoints.any { uri.startsWith(it) }
    }
    
    private fun parseJwt(request: HttpServletRequest): String? {
        val headerAuth = request.getHeader("Authorization")
        
        return if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            headerAuth.substring(7)
        } else null
    }
} 