package com.tomlun.cinema.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/kotlin/session-templates")
@CrossOrigin(origins = ["http://localhost:5173"])
class SessionTemplateController {
    
    @GetMapping
    fun getAllSessionTemplates(): ResponseEntity<List<Map<String, Any>>> {
        // Заглушка для шаблонов сеансов
        val templates = listOf(
            mapOf(
                "id" to 1,
                "name" to "Утренний сеанс",
                "startTime" to "10:00",
                "endTime" to "12:00",
                "price" to BigDecimal("300.00"),
                "hallNumber" to 1,
                "isActive" to true
            ),
            mapOf(
                "id" to 2,
                "name" to "Дневной сеанс",
                "startTime" to "14:00",
                "endTime" to "16:00",
                "price" to BigDecimal("400.00"),
                "hallNumber" to 2,
                "isActive" to true
            ),
            mapOf(
                "id" to 3,
                "name" to "Вечерний сеанс",
                "startTime" to "19:00",
                "endTime" to "21:00",
                "price" to BigDecimal("500.00"),
                "hallNumber" to 1,
                "isActive" to true
            )
        )
        return ResponseEntity.ok(templates)
    }
    
    @GetMapping("/{id}")
    fun getSessionTemplateById(@PathVariable id: Int): ResponseEntity<Map<String, Any>> {
        val template = mapOf(
            "id" to id,
            "name" to "Шаблон сеанса $id",
            "startTime" to "10:00",
            "endTime" to "12:00",
            "price" to BigDecimal("300.00"),
            "hallNumber" to 1,
            "isActive" to true
        )
        return ResponseEntity.ok(template)
    }
} 