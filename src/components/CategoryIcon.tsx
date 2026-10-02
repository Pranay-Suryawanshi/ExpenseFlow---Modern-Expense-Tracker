import React from 'react';
import {
  Utensils,
  Car,
  Home,
  Zap,
  Film,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  Layers,
  LucideProps,
} from 'lucide-react';
import { CategoryId } from '../types';

interface CategoryIconProps extends LucideProps {
  categoryId: CategoryId;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ categoryId, className = 'w-4 h-4', ...props }) => {
  switch (categoryId) {
    case 'food':
      return <Utensils className={className} {...props} />;
    case 'transport':
      return <Car className={className} {...props} />;
    case 'housing':
      return <Home className={className} {...props} />;
    case 'utilities':
      return <Zap className={className} {...props} />;
    case 'entertainment':
      return <Film className={className} {...props} />;
    case 'health':
      return <HeartPulse className={className} {...props} />;
    case 'shopping':
      return <ShoppingBag className={className} {...props} />;
    case 'education':
      return <GraduationCap className={className} {...props} />;
    case 'other':
    default:
      return <Layers className={className} {...props} />;
  }
};
