import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from './utils';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onFileChange?: (file: File) => void;
  className?: string;
  placeholder?: string;
  accept?: string;
  maxSize?: number; // в МБ
  showPreview?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onFileChange,
  className,
  placeholder = "Загрузить изображение",
  accept = "image/*",
  maxSize = 5, // 5 МБ по умолчанию
  showPreview = true
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Файл должен быть изображением');
      return false;
    }
    
    // Проверка размера файла
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Размер файла не должен превышать ${maxSize} МБ`);
      return false;
    }
    
    return true;
  };

  const handleFile = (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    // Создаем preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    
    // Вызываем callback для файла
    if (onFileChange) {
      onFileChange(file);
    }
    
    // Очищаем URL поле (будет заменено на путь к загруженному файлу)
    onChange('');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    setPreviewUrl(url || null);
    setError(null);
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* URL поле */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          URL изображения
        </label>
        <input
          type="url"
          value={value || ''}
          onChange={handleUrlChange}
          placeholder="https://example.com/image.jpg"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Разделитель */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">или</span>
        </div>
      </div>

      {/* Загрузка файла */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Загрузить с компьютера
        </label>
        
        {/* Drag & Drop область */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
            dragActive 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50",
            previewUrl && "border-green-500 bg-green-50"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileInput}
            className="hidden"
          />
          
          {!previewUrl ? (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-600">
                <span className="font-medium text-blue-600 hover:text-blue-500">
                  Нажмите для выбора файла
                </span>{" "}
                или перетащите сюда
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF до {maxSize} МБ
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <ImageIcon className="mx-auto h-8 w-8 text-green-500" />
              <p className="text-sm text-green-600 font-medium">
                Файл выбран
              </p>
              <p className="text-xs text-gray-500">
                Нажмите для выбора другого файла
              </p>
            </div>
          )}
        </div>

        {/* Ошибка */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {/* Кнопка удаления */}
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-2" />
            Убрать файл
          </Button>
        )}
      </div>

      {/* Preview */}
      {showPreview && previewUrl && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Предварительный просмотр
          </label>
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg border border-gray-200"
            />
          </div>
        </div>
      )}
    </div>
  );
}
