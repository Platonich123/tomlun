package com.tomlun.cinema.repository

import com.tomlun.cinema.model.User
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, Int> {
    
    fun findByEmail(email: String): User?
    
    fun findByPhone(phone: String): User?
    
    fun existsByEmail(email: String): Boolean
    
    fun existsByPhone(phone: String): Boolean
} 