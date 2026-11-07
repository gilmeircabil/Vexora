import { UIComponentItem, UIComponentCategory } from './types.js';
import { NAVIGATION_COMPONENTS } from './categories/navigation.js';
import { BUTTON_COMPONENTS } from './categories/buttons.js';
import { CARD_COMPONENTS } from './categories/cards.js';
import { FORM_COMPONENTS } from './categories/forms.js';
import { DATA_DISPLAY_COMPONENTS } from './categories/dataDisplay.js';
import { FEEDBACK_COMPONENTS } from './categories/feedback.js';
import { ADVANCED_COMPONENTS } from './categories/advanced.js';

export const ALL_COMPONENTS: UIComponentItem[] = [
  ...NAVIGATION_COMPONENTS,
  ...BUTTON_COMPONENTS,
  ...CARD_COMPONENTS,
  ...FORM_COMPONENTS,
  ...DATA_DISPLAY_COMPONENTS,
  ...FEEDBACK_COMPONENTS,
  ...ADVANCED_COMPONENTS,
];

export const getComponentById = (id: string): UIComponentItem | undefined => {
  return ALL_COMPONENTS.find((item) => item.id.toLowerCase() === id.toLowerCase());
};

export const getComponentsByCategory = (category: UIComponentCategory): UIComponentItem[] => {
  return ALL_COMPONENTS.filter((item) => item.category === category);
};
