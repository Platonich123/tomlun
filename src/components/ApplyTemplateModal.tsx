import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon, Play } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface SessionTemplate {
  id: number;
  name: string;
  description: string;
  default_hall: string;
  default_price: number;
  default_capacity: number;
  time_slots: string[];
  days_of_week: number[];
  is_active: boolean;
}

interface ApplyTemplateModalProps {
  movieId: number;
  movieTitle: string;
  templates: SessionTemplate[];
  onApply: (templateId: number, startDate: string, endDate: string) => Promise<void>;
}

export default function ApplyTemplateModal({ movieId, movieTitle, templates, onApply }: ApplyTemplateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!selectedTemplate || !startDate || !endDate) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await onApply(
        selectedTemplate,
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
      );
      setIsOpen(false);
      setSelectedTemplate(null);
      setStartDate(null);
      setEndDate(null);
    } catch (error) {
      console.error('Error applying template:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysOfWeekText = (days: number[]) => {
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    return days.map(day => dayNames[day - 1]).join(', ');
  };

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="flex items-center gap-2">
          <Play className="w-4 h-4" />
          Применить шаблон
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Применить шаблон к фильму "{movieTitle}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {/* Выбор шаблона */}
          <div>
            <Label htmlFor="template">Выберите шаблон</Label>
            <Select value={selectedTemplate?.toString() || ''} onValueChange={(value) => setSelectedTemplate(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите шаблон" />
              </SelectTrigger>
              <SelectContent>
                {templates.filter(t => t.is_active).map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Информация о выбранном шаблоне */}
          {selectedTemplateData && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">{selectedTemplateData.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedTemplateData.description}</p>
              <div className="text-sm space-y-1">
                <div>Зал: {selectedTemplateData.default_hall}</div>
                <div>Цена: {selectedTemplateData.default_price} ₽</div>
                <div>Время: {selectedTemplateData.time_slots.join(', ')}</div>
                <div>Дни: {getDaysOfWeekText(selectedTemplateData.days_of_week)}</div>
              </div>
            </div>
          )}

          {/* Выбор периода */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Дата начала</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd.MM.yyyy', { locale: ru }) : 'Выберите дату'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Дата окончания</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd.MM.yyyy', { locale: ru }) : 'Выберите дату'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Предварительный расчет */}
          {selectedTemplateData && startDate && endDate && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Предварительный расчет:</h4>
              <div className="text-sm space-y-1">
                <div>Количество дней: {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1}</div>
                <div>Сеансов в день: {selectedTemplateData.time_slots.length}</div>
                <div>Всего сеансов: {selectedTemplateData.time_slots.length * selectedTemplateData.days_of_week.length * Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1}</div>
              </div>
            </div>
          )}

          {/* Кнопки */}
          <div className="flex justify-end space-x-2 flex-shrink-0">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={!selectedTemplate || !startDate || !endDate || loading}
            >
              {loading ? 'Применение...' : 'Применить шаблон'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 