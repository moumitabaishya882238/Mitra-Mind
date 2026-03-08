export type ThemeName = 'mitra-night' | 'mitra-light' | 'aurora' | 'matrix-dark' | 'matrix-white';

export type AppTheme = {
    id: ThemeName;
    label: string;
    statusBarStyle: 'light-content' | 'dark-content';
    gradients: {
        main: string[];
        veil: string[];
    };
    colors: {
        screenBase: string;
        textPrimary: string;
        textSecondary: string;
        cardBg: string;
        borderSoft: string;
        accent: string;
        tabBg: string;
        tabActive: string;
        tabInactive: string;
        tabBorder: string;
        danger: string;
    };
};

export const APP_THEMES: Record<ThemeName, AppTheme> = {
    'mitra-night': {
        id: 'mitra-night',
        label: 'Mitra Night',
        statusBarStyle: 'light-content',
        gradients: {
            main: ['#050A22', '#0E0D30', '#1B1240', '#2C1554'],
            veil: ['rgba(95, 129, 255, 0.10)', 'transparent', 'rgba(154, 89, 255, 0.12)'],
        },
        colors: {
            screenBase: '#070D2B',
            textPrimary: '#FFFFFF',
            textSecondary: 'rgba(226, 233, 255, 0.86)',
            cardBg: 'rgba(255,255,255,0.10)',
            borderSoft: 'rgba(223, 214, 255, 0.20)',
            accent: '#8B5CF6',
            tabBg: '#1F2937',
            tabActive: '#8B5CF6',
            tabInactive: '#9CA3AF',
            tabBorder: 'rgba(139, 92, 246, 0.2)',
            danger: '#EF4444',
        },
    },
    'mitra-light': {
        id: 'mitra-light',
        label: 'Mitra Light',
        statusBarStyle: 'light-content',
        gradients: {
            main: ['#1E3058', '#29467A', '#355795', '#486AA9'],
            veil: ['rgba(171, 197, 255, 0.20)', 'transparent', 'rgba(214, 232, 255, 0.10)'],
        },
        colors: {
            screenBase: '#223764',
            textPrimary: '#F5FAFF',
            textSecondary: 'rgba(226, 238, 255, 0.86)',
            cardBg: 'rgba(255,255,255,0.12)',
            borderSoft: 'rgba(179, 203, 255, 0.35)',
            accent: '#8FB1FF',
            tabBg: '#2A4475',
            tabActive: '#A8C3FF',
            tabInactive: '#C6D4F3',
            tabBorder: 'rgba(184, 206, 255, 0.28)',
            danger: '#F06B6B',
        },
    },
    aurora: {
        id: 'aurora',
        label: 'Aurora Bloom',
        statusBarStyle: 'light-content',
        gradients: {
            main: ['#071B19', '#0E2A2A', '#1D2A4C', '#3A235A'],
            veil: ['rgba(89, 236, 200, 0.12)', 'transparent', 'rgba(146, 109, 255, 0.14)'],
        },
        colors: {
            screenBase: '#0B1D27',
            textPrimary: '#F2FFFB',
            textSecondary: 'rgba(221, 245, 255, 0.86)',
            cardBg: 'rgba(163, 255, 237, 0.08)',
            borderSoft: 'rgba(159, 231, 255, 0.24)',
            accent: '#5AE9CB',
            tabBg: '#142433',
            tabActive: '#5AE9CB',
            tabInactive: '#90A5BB',
            tabBorder: 'rgba(90, 233, 203, 0.24)',
            danger: '#FF6B7D',
        },
    },
    'matrix-dark': {
        id: 'matrix-dark',
        label: 'Matrix Dark',
        statusBarStyle: 'light-content',
        gradients: {
            main: ['#0D0D0D', '#0D0D0D', '#0D0D0D', '#0D0D0D'],
            veil: ['transparent', 'transparent', 'transparent'],
        },
        colors: {
            screenBase: '#0D0D0D',
            textPrimary: '#ECECEC',
            textSecondary: 'rgba(189, 189, 189, 0.86)',
            cardBg: 'rgba(255,255,255,0.06)',
            borderSoft: 'rgba(189, 189, 189, 0.15)',
            accent: '#E0E0E0',
            tabBg: '#1A1A1A',
            tabActive: '#E0E0E0',
            tabInactive: '#8B8B8B',
            tabBorder: 'rgba(224, 224, 224, 0.10)',
            danger: '#FF6B6B',
        },
    },
    'matrix-white': {
        id: 'matrix-white',
        label: 'Matrix White',
        statusBarStyle: 'dark-content',
        gradients: {
            main: ['#F8F8F8', '#F8F8F8', '#F8F8F8', '#F8F8F8'],
            veil: ['transparent', 'transparent', 'transparent'],
        },
        colors: {
            screenBase: '#F8F8F8',
            textPrimary: '#000000',
            textSecondary: 'rgba(0, 0, 0, 0.65)',
            cardBg: 'rgba(241, 241, 241, 0.8)',
            borderSoft: 'rgba(218, 220, 224, 0.6)',
            accent: '#1F7FFF',
            tabBg: '#FFFFFF',
            tabActive: '#1F7FFF',
            tabInactive: '#9AA0A6',
            tabBorder: 'rgba(31, 127, 255, 0.12)',
            danger: '#D33B27',
        },
    },
};

export const DEFAULT_THEME: ThemeName = 'mitra-night';
