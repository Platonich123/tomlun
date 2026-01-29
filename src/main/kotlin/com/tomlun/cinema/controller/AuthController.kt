package com.tomlun.cinema.controller

import com.tomlun.cinema.dto.LoginRequest
import com.tomlun.cinema.dto.LoginResponse
import com.tomlun.cinema.dto.RegisterRequest
import com.tomlun.cinema.model.User
import com.tomlun.cinema.security.JwtUtils
import com.tomlun.cinema.service.UserService
import org.springframework.http.ResponseEntity
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/kotlin/auth")
@CrossOrigin(origins = ["http://localhost:5173"])
class AuthController(
    private val userService: UserService,
    private val jwtUtils: JwtUtils,
    private val passwordEncoder: PasswordEncoder
) {
    
    @PostMapping("/login")
    fun login(@RequestBody loginRequest: LoginRequest): ResponseEntity<LoginResponse> {
        val user = userService.authenticateUser(loginRequest.email, loginRequest.password)
        
        return if (user != null) {
            val token = jwtUtils.generateToken(user.email)
            val response = LoginResponse(
                token = token,
                user = user,
                message = "Успешная авторизация"
            )
            ResponseEntity.ok(response)
        } else {
            ResponseEntity.badRequest().body(
                LoginResponse(
                    token = null,
                    user = null,
                    message = "Неверный email или пароль"
                )
            )
        }
    }
    
    @PostMapping("/register")
    fun register(@RequestBody registerRequest: RegisterRequest): ResponseEntity<LoginResponse> {
        // Проверяем, не существует ли уже пользователь с таким email
        val existingUser = userService.getUserByEmail(registerRequest.email)
        if (existingUser != null) {
            return ResponseEntity.badRequest().body(
                LoginResponse(
                    token = null,
                    user = null,
                    message = "Пользователь с таким email уже существует"
                )
            )
        }
        
        val user = User(
            name = registerRequest.name,
            email = registerRequest.email,
            phone = registerRequest.phone,
            passwordHash = registerRequest.password,
            roleId = 1 // По умолчанию обычный пользователь
        )
        
        val savedUser = userService.createUser(user)
        val token = jwtUtils.generateToken(savedUser.email)
        
        val response = LoginResponse(
            token = token,
            user = savedUser,
            message = "Пользователь успешно зарегистрирован"
        )
        
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/validate")
    fun validateToken(@RequestHeader("Authorization") authHeader: String): ResponseEntity<Map<String, Any?>> {
        val token = authHeader.removePrefix("Bearer ")
        
        return if (jwtUtils.validateToken(token)) {
            val username = jwtUtils.getUsernameFromToken(token)
            val user = userService.getUserByEmail(username!!)
            
            ResponseEntity.ok(mapOf(
                "valid" to true,
                "user" to user,
                "message" to "Токен действителен"
            ))
        } else {
            ResponseEntity.badRequest().body(mapOf(
                "valid" to false,
                "error" to "Недействительный токен"
            ))
        }
    }
} 