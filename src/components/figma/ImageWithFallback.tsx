import React, { useState } from 'react'

// Fallback изображение - иконка фильма
const ERROR_IMG_SRC = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

// Default placeholder для фильмов
const DEFAULT_MOVIE_IMAGE = 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=450&fit=crop'

// Список недоступных изображений
const BROKEN_IMAGES = [
  'https://images.unsplash.com/photo-1489599732536-6f4f95012b8c',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176'
]

// Список несуществующих файлов
const MISSING_FILES = [
  'image-1754835949157-152114034.jpg'
]

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const handleError = () => {
    console.warn(`Ошибка загрузки изображения: ${props.src}`)
    setDidError(true)
  }

  const handleRetry = () => {
    setDidError(false)
    setRetryCount(prev => prev + 1)
  }

  const { src, alt, style, className, ...rest } = props

  // Если изображение не загрузилось, показываем fallback
  if (didError) {
    return (
      <div
        className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
        style={style}
        onClick={handleRetry}
        title="Нажмите для повторной попытки"
      >
        <div className="flex items-center justify-center w-full h-full">
          <img 
            src={ERROR_IMG_SRC} 
            alt={alt || "Ошибка загрузки изображения"} 
            {...rest} 
            data-original-url={src}
            className="opacity-50"
          />
        </div>
      </div>
    )
  }

  // Обработка URL изображения
  let imageSrc = src || ''

  // Если URL пустой, недействительный или содержит недоступные изображения
  if (!imageSrc || imageSrc === '' || 
      imageSrc.includes('example.com') || 
      BROKEN_IMAGES.some(broken => imageSrc.includes(broken)) ||
      MISSING_FILES.some(missing => imageSrc.includes(missing))) {
    imageSrc = DEFAULT_MOVIE_IMAGE
  }
  
  // Если это локальный путь (начинается с /), добавляем базовый URL сервера
  if (imageSrc.startsWith('/uploads/')) {
    imageSrc = `http://localhost:8080${imageSrc}`
  }

  return (
    <img 
      src={imageSrc} 
      alt={alt} 
      className={className} 
      style={style} 
      {...rest} 
      onError={handleError}
      key={`${imageSrc}-${retryCount}`} // Добавляем key для принудительной перезагрузки
    />
  )
}
