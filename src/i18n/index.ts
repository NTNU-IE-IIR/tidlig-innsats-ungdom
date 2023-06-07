import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import no from './no.json';

/**
 * Module augmentation that allows for autocompletion when using the
 * t function from the useTranslation hook.
 */
declare module 'react-i18next' {
  interface Resources {
    translation: typeof no;
  }
}

const resources = {
  no: {
    translation: no,
  },
} as const;

i18n.use(initReactI18next).init({
  resources,
  lng: 'no',
  fallbackLng: 'no',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
