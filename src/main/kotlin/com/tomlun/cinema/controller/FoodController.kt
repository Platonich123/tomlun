package com.tomlun.cinema.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@RequestMapping("/api/kotlin/food")
@CrossOrigin(origins = ["http://localhost:5173"])
class FoodController {
    
    @GetMapping
    fun getAllFood(): ResponseEntity<List<Map<String, Any>>> {
        // Заглушка для еды
        val food = listOf(
            mapOf(
                "id" to 1,
                "name" to "Попкорн",
                "description" to "Свежий попкорн",
                "price" to BigDecimal("150.00"),
                "category" to "SNACKS",
                "available" to true
            ),
            mapOf(
                "id" to 2,
                "name" to "Кока-Кола",
                "description" to "Газированный напиток",
                "price" to BigDecimal("100.00"),
                "category" to "DRINKS",
                "available" to true
            ),
            mapOf(
                "id" to 3,
                "name" to "Хот-дог",
                "description" to "Классический хот-дог",
                "price" to BigDecimal("200.00"),
                "category" to "MEALS",
                "available" to true
            )
        )
        return ResponseEntity.ok(food)
    }
    
    @GetMapping("/{id}")
    fun getFoodById(@PathVariable id: Int): ResponseEntity<Map<String, Any>> {
        val food = mapOf(
            "id" to id,
            "name" to "Еда $id",
            "description" to "Описание еды $id",
            "price" to BigDecimal("150.00"),
            "category" to "SNACKS",
            "available" to true
        )
        return ResponseEntity.ok(food)
    }
} 