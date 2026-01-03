import React from 'react';
import { View, StyleSheet } from 'react-native';
import { getCategoryIcon } from '@/assets/icons/categories';

interface CategoryIconProps {
  categoryId: string | undefined | null;
  size?: number;
  className?: string;
  style?: any;
}

/**
 * Category Icon Component
 * Renders SVG icons for news categories
 * 
 * @example
 * <CategoryIcon categoryId="business" size={24} />
 */
export const CategoryIcon: React.FC<CategoryIconProps> = ({ 
  categoryId, 
  size = 24,
  className = '',
  style
}) => {
  // Handle null/undefined/empty categoryId with fallback
  const safeCategoryId = categoryId || 'all';
  
  try {
    const IconComponent = getCategoryIcon(safeCategoryId);
    
    if (!IconComponent) {
      // Fallback to a simple view if icon not found
      return (
        <View 
          className={className} 
          style={[
            { width: size, height: size, backgroundColor: '#E5E7EB', borderRadius: 4 },
            style
          ]} 
        />
      );
    }

    return (
      <View 
        className={className} 
        style={[
          { width: size, height: size, justifyContent: 'center', alignItems: 'center' },
          style
        ]}
      >
        <IconComponent width={size} height={size} />
      </View>
    );
  } catch (error) {
    // Fallback on any error
    console.warn('CategoryIcon error:', error);
    return (
      <View 
        className={className} 
        style={[
          { width: size, height: size, backgroundColor: '#E5E7EB', borderRadius: 4 },
          style
        ]} 
      />
    );
  }
};

export default CategoryIcon;
