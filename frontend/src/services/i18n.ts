import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../data/translations/en.json';
import hi from '../data/translations/hi.json';
import as from '../data/translations/as.json';

const LANGUAGE_KEY = 'user-language';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    as: { translation: as },
};

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    if (!savedLanguage) {
        savedLanguage = 'en';
    }

    i18n
        .use(initReactI18next)
        .init({
            resources,
            lng: savedLanguage,
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
        });
};

initI18n();

export default i18n;
