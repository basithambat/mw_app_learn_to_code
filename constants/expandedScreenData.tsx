import { Dimensions, Platform } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type ColorScheme = {
    background: string;
    text: string;
    border: string;
  };
  
export const SCREEN_DIMENSIONS = {
  width: screenWidth,
  height: screenHeight
};

export const IMAGE_WRAPPER_STYLE = {
  height: Platform.OS === 'ios' ? screenHeight * 0.42 : screenHeight * 0.46,
  borderTopRightRadius: 20,
  borderTopLeftRadius: 20,
  alignSelf: 'center',
  overflow: 'hidden',
  shadowColor: "green",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.4,
  shadowRadius: 5.84,
  zIndex: 50,
  pointerEvents: "none",
} as const;

export const IMAGE_STYLE = {
  width: '100%',
  height: '100%',
} as const;

export const GRADIENT_STYLE = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  height: '100%',
} as const;

// Instead of storing the full class names, store just the color values
export type CategoryStyleConfig = {
  backgroundColor: string;
  textColor: string;
  borderColor: string;
};

export const CATEGORY_STYLES: { [key: string]: CategoryStyleConfig } = {
  'Automobile': {
    backgroundColor: '#EEF3FA',
    textColor: '#5584CB',
    borderColor: '#CFDDF1'
  },
  'Breaking news': {
    backgroundColor: '#FAEEF0',
    textColor: '#CB556D',
    borderColor: '#F1CFD6'
  },
  'Business': {
    backgroundColor: '#F3EEFA',
    textColor: '#8655CB',
    borderColor: '#DDCFF1'
  },
  'Curated for you': {
    backgroundColor: '#FAEEF9',
    textColor: '#CB55BF',
    borderColor: '#F1CFED'
  },
  'Entertainment': {
    backgroundColor: '#FAF4EE',
    textColor: '#CB9455',
    borderColor: '#F1E1CF'
  },
  'Health': {
    backgroundColor: '#EEFAF6',
    textColor: '#55CBA4',
    borderColor: '#CFF1E6'
  },
  'International News': {
    backgroundColor: '#EFEEFA',
    textColor: '#6155CB',
    borderColor: '#D2CFF1'
  },
  'Lifestyle': {
    backgroundColor: '#FAF1EE',
    textColor: '#CB7155',
    borderColor: '#F1D7CF'
  },
  'Opinions': {
    backgroundColor: '#F4EEFA',
    textColor: '#8E55CB',
    borderColor: '#DFCFF1'
  },
  'Politics': {
    backgroundColor: '#EEF1FA',
    textColor: '#5573CB',
    borderColor: '#CFD7F1'
  },
  'Science': {
    backgroundColor: '#EEF3FA',
    textColor: '#5584CB',
    borderColor: '#CFDDF1'
  },
  'Sports': {
    backgroundColor: '#EEFAF3',
    textColor: '#55CB84',
    borderColor: '#CFF1DD'
  },
  'Technology': {
    backgroundColor: '#F4EEFA',
    textColor: '#8C55CB',
    borderColor: '#DFCFF1'
  },
  'World': {
    backgroundColor: '#FAEEF5',
    textColor: '#CB559C',
    borderColor: '#F1CFE3'
  },
  'Travel': {
    backgroundColor: '#EEF7FA',
    textColor: '#55ACCB',
    borderColor: '#CFE8F1'
  },
  'Startup': {
    backgroundColor: '#EEEEFA',
    textColor: '#5557CB',
    borderColor: '#CFD0F1'
  },
  'Finance': {
    backgroundColor: '#FAF4EE',
    textColor: '#CBA455',
    borderColor: '#F1E6CF'
  }
};

export const DEFAULT_CATEGORY_STYLE: CategoryStyleConfig = {
  backgroundColor: '#F3F4F6',
  textColor: '#4B5563',
  borderColor: '#D1D5DB'
};