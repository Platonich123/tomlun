package com.tomlun.cinema.model

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime

@Entity
@Table(name = "cinema_tickets")
data class Ticket(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int? = null,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    val session: Session,
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,
    
    @Column(name = "seat_number", nullable = false)
    val seatNumber: Int,
    
    @Column(name = "price", nullable = false)
    val price: BigDecimal,
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    val status: TicketStatus = TicketStatus.RESERVED,
    
    @Column(name = "purchase_date")
    val purchaseDate: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "created_at")
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(name = "updated_at")
    val updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class TicketStatus {
    RESERVED,    // Забронирован
    PAID,        // Оплачен
    CANCELLED,   // Отменен
    USED         // Использован
} 