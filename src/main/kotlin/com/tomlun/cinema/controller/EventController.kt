package com.tomlun.cinema.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/kotlin/events")
@CrossOrigin(origins = ["http://localhost:5173"])
class EventController {
    
    @GetMapping
    fun getAllEvents(): ResponseEntity<List<Map<String, Any>>> {
        // Заглушка для событий
        val events = listOf(
            mapOf(
                "id" to 1,
                "name" to "Премьера фильма",
                "description" to "Премьера нового блокбастера",
                "date" to "2024-01-15T19:00:00",
                "type" to "PREMIERE"
            ),
            mapOf(
                "id" to 2,
                "name" to "Кинофестиваль",
                "description" to "Ежегодный кинофестиваль",
                "date" to "2024-02-20T18:00:00",
                "type" to "FESTIVAL"
            )
        )
        return ResponseEntity.ok(events)
    }
    
    @GetMapping("/{id}")
    fun getEventById(@PathVariable id: Int): ResponseEntity<Map<String, Any>> {
        val event = mapOf(
            "id" to id,
            "name" to "Событие $id",
            "description" to "Описание события $id",
            "date" to "2024-01-15T19:00:00",
            "type" to "EVENT"
        )
        return ResponseEntity.ok(event)
    }
} 