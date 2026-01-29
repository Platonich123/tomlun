package com.tomlun.cinema.service

import com.tomlun.cinema.model.User
import com.tomlun.cinema.repository.UserRepository
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class UserService(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder
) : UserDetailsService {
    
    fun getAllUsers(): List<User> = userRepository.findAll()
    
    fun getUserById(id: Int): User? = userRepository.findById(id).orElse(null)
    
    fun getUserByEmail(email: String): User? = userRepository.findByEmail(email)
    
    fun createUser(user: User): User {
        val hashedPassword = passwordEncoder.encode(user.passwordHash)
        val newUser = user.copy(
            passwordHash = hashedPassword,
            createdAt = LocalDateTime.now(),
            updatedAt = LocalDateTime.now()
        )
        return userRepository.save(newUser)
    }
    
    fun updateUser(id: Int, user: User): User? {
        val existingUser = userRepository.findById(id).orElse(null) ?: return null
        
        val updatedUser = existingUser.copy(
            name = user.name,
            email = user.email,
            phone = user.phone,
            roleId = user.roleId,
            updatedAt = LocalDateTime.now()
        )
        
        return userRepository.save(updatedUser)
    }
    
    fun deleteUser(id: Int): Boolean {
        return if (userRepository.existsById(id)) {
            userRepository.deleteById(id)
            true
        } else {
            false
        }
    }
    
    fun authenticateUser(email: String, password: String): User? {
        val user = userRepository.findByEmail(email) ?: return null
        
        return if (passwordEncoder.matches(password, user.passwordHash)) {
            user
        } else {
            null
        }
    }
    
    override fun loadUserByUsername(username: String): UserDetails {
        val user = userRepository.findByEmail(username) 
            ?: throw UsernameNotFoundException("User not found with email: $username")
        
        val authorities = when (user.roleId) {
            1 -> listOf(SimpleGrantedAuthority("ROLE_USER"))
            2 -> listOf(SimpleGrantedAuthority("ROLE_ADMIN"))
            else -> listOf(SimpleGrantedAuthority("ROLE_USER"))
        }
        
        return org.springframework.security.core.userdetails.User.builder()
            .username(user.email)
            .password(user.passwordHash)
            .authorities(authorities)
            .build()
    }
} 