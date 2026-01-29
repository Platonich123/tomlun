package com.tomlun.cinema.controller

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.io.File
import java.nio.file.Files
import java.nio.file.Paths
import java.util.UUID
import org.slf4j.LoggerFactory

@RestController
@RequestMapping("/upload")
@CrossOrigin(origins = ["http://localhost:*", "http://127.0.0.1:*"], allowCredentials = "true")
class UploadController {
    
    private val logger = LoggerFactory.getLogger(UploadController::class.java)
    
    @PostMapping("/image")
    fun uploadImage(@RequestParam("image") file: MultipartFile): ResponseEntity<Map<String, String>> {
        try {
            logger.info("Получен запрос на загрузку изображения: ${file.originalFilename}")
            
            // Проверяем, что файл не пустой
            if (file.isEmpty) {
                return ResponseEntity.badRequest().body(mapOf("error" to "Файл пустой"))
            }
            
            // Проверяем тип файла
            val contentType = file.contentType
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(mapOf("error" to "Файл должен быть изображением"))
            }
            
            // Создаем директорию для загрузок, если её нет
            val uploadDir = "uploads"
            val uploadPath = Paths.get(uploadDir)
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath)
            }
            
            // Генерируем уникальное имя файла
            val originalFilename = file.originalFilename ?: "image"
            val extension = originalFilename.substringAfterLast('.', "jpg")
            val filename = "${UUID.randomUUID()}.$extension"
            val filePath = uploadPath.resolve(filename)
            
            // Сохраняем файл
            Files.copy(file.inputStream, filePath)
            
            // Возвращаем URL изображения (используем полный URL)
            val imageUrl = "http://localhost:8080/uploads/$filename"
            logger.info("Изображение успешно загружено: $imageUrl")
            
            return ResponseEntity.ok(mapOf("imageUrl" to imageUrl))
            
        } catch (e: Exception) {
            logger.error("Ошибка при загрузке изображения", e)
            return ResponseEntity.internalServerError().body(mapOf("error" to "Ошибка при загрузке изображения: ${e.message}"))
        }
    }
    
    @GetMapping("/uploads/{filename:.+}")
    fun serveImage(@PathVariable filename: String): ResponseEntity<ByteArray> {
        try {
            logger.info("Запрос изображения: $filename")
            val filePath = Paths.get("uploads", filename)
            
            if (!Files.exists(filePath)) {
                logger.warn("Файл не найден: $filename")
                return ResponseEntity.notFound().build()
            }
            
            val bytes = Files.readAllBytes(filePath)
            logger.info("Изображение отправлено: $filename, размер: ${bytes.size} байт")
            
            return ResponseEntity.ok()
                .header("Content-Type", "image/jpeg")
                .header("Cache-Control", "public, max-age=31536000")
                .body(bytes)
                
        } catch (e: Exception) {
            logger.error("Ошибка при получении изображения: $filename", e)
            return ResponseEntity.internalServerError().build()
        }
    }
} 