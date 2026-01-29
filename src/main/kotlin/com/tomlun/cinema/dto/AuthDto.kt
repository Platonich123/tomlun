package com.tomlun.cinema.dto

import com.tomlun.cinema.model.User

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val phone: String,
    val password: String
)

data class LoginResponse(
    val token: String?,
    val user: User?,
    val message: String
) 