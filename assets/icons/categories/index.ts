/**
 * Category Icons
 * SVG icons for news categories
 */

// Import all category SVG icons
import AutomobileIcon from './automobile.svg';
import BreakingNewsIcon from './breakingNews.svg';
import BusinessIcon from './business.svg';
import CuratedForYouIcon from './curatedForYou.svg';
import EntertainmentIcon from './entertainment.svg';
import FinanceIcon from './finance.svg';
import HealthIcon from './health.svg';
import InternationalNewsIcon from './internationalNews.svg';
import LifestyleIcon from './lifestyle.svg';
import OpinionsIcon from './opinions.svg';
import PoliticsIcon from './politics.svg';
import ScienceIcon from './science.svg';
import SportsIcon from './sports.svg';
import StartupIcon from './startup.svg';
import TechnologyIcon from './technology.svg';
import TravelIcon from './travel.svg';
import WorldIcon from './world.svg';

// Re-export for direct imports
export {
  AutomobileIcon,
  BreakingNewsIcon,
  BusinessIcon,
  CuratedForYouIcon,
  EntertainmentIcon,
  FinanceIcon,
  HealthIcon,
  InternationalNewsIcon,
  LifestyleIcon,
  OpinionsIcon,
  PoliticsIcon,
  ScienceIcon,
  SportsIcon,
  StartupIcon,
  TechnologyIcon,
  TravelIcon,
  WorldIcon,
};

/**
 * Category Icon Registry
 * Maps category IDs to their corresponding icon components
 */
export const CATEGORY_ICONS = {
  'all': CuratedForYouIcon,
  'curated': CuratedForYouIcon,
  'curated-for-you': CuratedForYouIcon,
  'automobile': AutomobileIcon,
  'breaking-news': BreakingNewsIcon,
  'breaking': BreakingNewsIcon,
  'business': BusinessIcon,
  'entertainment': EntertainmentIcon,
  'finance': FinanceIcon,
  'health': HealthIcon,
  'international': InternationalNewsIcon,
  'international-news': InternationalNewsIcon,
  'world': WorldIcon,
  'lifestyle': LifestyleIcon,
  'opinions': OpinionsIcon,
  'politics': PoliticsIcon,
  'science': ScienceIcon,
  'sports': SportsIcon,
  'startup': StartupIcon,
  'technology': TechnologyIcon,
  'tech': TechnologyIcon,
  'travel': TravelIcon,
} as const;

/**
 * Get category icon component by category ID
 * @param categoryId - The category identifier
 * @returns The corresponding icon component or default curated icon
 */
export const getCategoryIcon = (categoryId: string | undefined | null) => {
  if (!categoryId) return CuratedForYouIcon;
  
  // Normalize category ID (lowercase, replace spaces with hyphens)
  const normalizedId = categoryId.toLowerCase().replace(/\s+/g, '-');
  
  return CATEGORY_ICONS[normalizedId as keyof typeof CATEGORY_ICONS] || 
         CATEGORY_ICONS[categoryId as keyof typeof CATEGORY_ICONS] || 
         CuratedForYouIcon;
};

/**
 * Type for category icon names
 */
export type CategoryIconName = keyof typeof CATEGORY_ICONS;
