#!/bin/bash

echo "🚀 Запуск Kotlin Backend для Tomlun Cinema..."
echo "================================================"

# Проверяем, установлена ли Java
if ! command -v java &> /dev/null; then
    echo "❌ Java не установлена. Установите Java 17+ и попробуйте снова."
    exit 1
fi

# Проверяем версию Java
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ Требуется Java 17+. Текущая версия: $JAVA_VERSION"
    exit 1
fi

echo "✅ Java версия: $(java -version 2>&1 | head -n 1)"

# Переходим в папку Kotlin backend
cd kotlin-backend

# Проверяем, существует ли gradlew
if [ ! -f "./gradlew" ]; then
    echo "❌ Gradle wrapper не найден. Проверьте структуру проекта."
    exit 1
fi

echo "🔧 Запуск Spring Boot приложения..."
echo "📊 API будет доступен по адресу: http://localhost:8080"
echo "🎬 Endpoint для фильмов: http://localhost:8080/api/kotlin/movies"
echo ""
echo "💡 Для остановки нажмите Ctrl+C"
echo "================================================"

# Запускаем приложение
./gradlew bootRun 