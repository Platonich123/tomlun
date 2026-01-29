import { useState } from 'react';
import { ArrowLeft, Plus, Minus, Check } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Addon {
  id: string;
  name: string;
  price: number;
  description?: string;
}

interface FoodItemDetailScreenProps {
  onBack: () => void;
  onAddToCart: (item: any, quantity: number, addons: Addon[]) => void;
  itemData: any;
}

export function FoodItemDetailScreen({ onBack, onAddToCart, itemData }: FoodItemDetailScreenProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Доступные дополнительные ингредиенты
  const availableAddons: Addon[] = [
    { id: 'bacon', name: 'Бекон', price: 25, description: 'Хрустящие полоски бекона' },
    { id: 'cheese', name: 'Сыр чеддер', price: 20, description: 'Дополнительный ломтик сыра' },
    { id: 'mushrooms', name: 'Грибы', price: 15, description: 'Жареные шампиньоны' },
    { id: 'tomato', name: 'Томаты', price: 10, description: 'Свежие помидоры' },
    { id: 'onion', name: 'Красный лук', price: 8, description: 'Маринованный красный лук' },
    { id: 'pickle', name: 'Маринованные огурцы', price: 12, description: 'Хрустящие маринованные огурчики' },
    { id: 'lettuce', name: 'Салат айсберг', price: 5, description: 'Свежие листья салата' },
    { id: 'sauce', name: 'Особый соус', price: 18, description: 'Фирменный соус шеф-повара' },
    { id: 'avocado', name: 'Авокадо', price: 35, description: 'Спелые ломтики авокадо' },
    { id: 'jalapeno', name: 'Халапеньо', price: 15, description: 'Острый перец халапеньо' }
  ];

  // Фильтруем дополнения в зависимости от типа блюда
  const getRelevantAddons = () => {
    const item = itemData;
    if (!item) return [];

    // Для бургеров - все дополнения
    if (item.name.toLowerCase().includes('бургер')) {
      return availableAddons;
    }
    
    // Для картофеля фри - только соусы и приправы
    if (item.name.toLowerCase().includes('картофель') || item.name.toLowerCase().includes('фри')) {
      return availableAddons.filter(addon => 
        ['sauce', 'cheese', 'bacon'].includes(addon.id)
      );
    }
    
    // Для стейка - грибы, лук, соусы
    if (item.name.toLowerCase().includes('стейк')) {
      return availableAddons.filter(addon => 
        ['mushrooms', 'onion', 'sauce', 'cheese'].includes(addon.id)
      );
    }
    
    // Для пасты - сыр, бекон, грибы
    if (item.name.toLowerCase().includes('паста')) {
      return availableAddons.filter(addon => 
        ['cheese', 'bacon', 'mushrooms', 'tomato', 'sauce'].includes(addon.id)
      );
    }
    
    // По умолчанию базовые дополнения
    return availableAddons.filter(addon => 
      ['cheese', 'sauce', 'bacon', 'mushrooms'].includes(addon.id)
    );
  };

  const relevantAddons = getRelevantAddons();

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const getSelectedAddonsData = () => {
    return relevantAddons.filter(addon => selectedAddons.includes(addon.id));
  };

  const getAddonsTotalPrice = () => {
    return getSelectedAddonsData().reduce((sum, addon) => sum + addon.price, 0);
  };

  const getTotalPrice = () => {
    const basePrice = itemData?.price || 0;
    const addonsPrice = getAddonsTotalPrice();
    return (basePrice + addonsPrice) * quantity;
  };

  const handleAddToCart = () => {
    const selectedAddonsData = getSelectedAddonsData();
    onAddToCart(itemData, quantity, selectedAddonsData);
    onBack();
  };

  if (!itemData) {
    return null;
  }

  return (
    <div className="h-full bg-background text-foreground flex flex-col">
      {/* Header */}
      <div className="bg-background px-4 pt-8 pb-4 border-b border-border flex-shrink-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-foreground" />
          </button>
          <h1 className="ml-2 text-xl text-foreground">{itemData.name}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-6 pb-32">
          {/* Item Image and Info */}
          <div className="px-4">
            <Card className="overflow-hidden bg-card border-border">
              <ImageWithFallback
                src={itemData.image_url || itemData.image}
                alt={itemData.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h2 className="text-xl font-medium text-card-foreground mb-2">{itemData.name}</h2>
                    <p className="text-muted-foreground mb-3">{itemData.description}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-medium text-card-foreground">{itemData.price} ₽</span>
                      {!itemData.available && (
                        <Badge variant="destructive">Стоп</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Additional Ingredients */}
          {relevantAddons.length > 0 && (
            <div className="px-4">
              <h3 className="text-lg font-medium text-foreground mb-4">Дополнительные ингредиенты</h3>
              <div className="space-y-3">
                {relevantAddons.map(addon => (
                  <Card 
                    key={addon.id}
                    className={`cursor-pointer transition-colors border ${
                      selectedAddons.includes(addon.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                        : 'border-border bg-card hover:border-blue-500/50'
                    }`}
                    onClick={() => toggleAddon(addon.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              selectedAddons.includes(addon.id)
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-border'
                            }`}>
                              {selectedAddons.includes(addon.id) && (
                                <Check size={12} className="text-white" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-card-foreground">{addon.name}</h4>
                              {addon.description && (
                                <p className="text-sm text-muted-foreground">{addon.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="font-medium text-card-foreground">+{addon.price} ₽</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Selected Addons Summary */}
          {selectedAddons.length > 0 && (
            <div className="px-4">
              <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                <div className="p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Выбранные дополнения:</h4>
                  <div className="space-y-1">
                    {getSelectedAddonsData().map(addon => (
                      <div key={addon.id} className="flex justify-between text-sm text-blue-700 dark:text-blue-300">
                        <span>{addon.name}</span>
                        <span>+{addon.price} ₽</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-blue-200 dark:border-blue-800 mt-2 pt-2">
                    <div className="flex justify-between font-medium text-blue-900 dark:text-blue-100">
                      <span>Дополнения итого:</span>
                      <span>+{getAddonsTotalPrice()} ₽</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="px-4">
            <h3 className="text-lg font-medium text-foreground mb-4">Количество</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent text-foreground"
              >
                <Minus size={20} />
              </button>
              <span className="text-2xl font-medium text-foreground w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent text-foreground"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="px-4">
            <Card className="bg-card border-border">
              <div className="p-4">
                <h4 className="font-medium text-card-foreground mb-3">Итого</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{itemData.name} × {quantity}</span>
                    <span className="text-foreground">{itemData.price * quantity} ₽</span>
                  </div>
                  {getAddonsTotalPrice() > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Дополнения × {quantity}</span>
                      <span className="text-foreground">{getAddonsTotalPrice() * quantity} ₽</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between font-medium">
                    <span className="text-foreground">Общая стоимость</span>
                    <span className="text-foreground">{getTotalPrice()} ₽</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom Add to Cart Button */}
      <div className="bg-background border-t border-border p-4 flex-shrink-0">
        <Button 
          onClick={handleAddToCart}
          disabled={!itemData.available}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
        >
          {itemData.available 
            ? `Добавить в корзину • ${getTotalPrice()} ₽`
            : 'Товар недоступен'
          }
        </Button>
      </div>
    </div>
  );
}