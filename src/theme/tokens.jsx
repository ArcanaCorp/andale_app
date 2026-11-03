const amaranth = {
    '50': '#ffeff2',
    '100': '#ffe0e5',
    '200': '#ffc6d3',
    '300': '#ff97ae',
    '400': '#ff5d85',
    '500': '#ff2460',
    '600': '#f90050',
    '700': '#d7004a',
    '800': '#b40044',
    '900': '#990240',
    '950': '#570021',
}

const woodsmoke = {
    '50': '#fafafa',
    '100': '#f5f5f5',
    '200': '#e6e6e6',
    '300': '#d6d6d6',
    '400': '#a5a5a5',
    '500': '#767676',
    '600': '#575757',
    '700': '#434343',
    '800': '#292929',
    '900': '#181818',
    '950': '#0a0a0a',
}

export const tokens = {

    colors: {
        primary: amaranth[600],
        white: woodsmoke[50],
        black: woodsmoke[900],
        gray: woodsmoke[500],
        muted: woodsmoke[400],
        border: woodsmoke[200],
        primarySoft: amaranth[50],
    },

    font: {
        light: "Outfit-Light",
        regular: "Outfit-Regular",
        medium: "Outfit-Medium",
        semibold: "Outfit-SemiBold",
        bold: "Outfit-Bold",
    },

    fontSize: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        "2xl": 20,
        "3xl": 24,
        "4xl": 28,
        "5xl": 32,
        "6xl": 40,
    },

    spacing: {
        0: 0,
        1: 4,
        2: 8,
        3: 12,
        4: 16,
        5: 20,
        6: 24,
        8: 32,
        10: 40,
        12: 48,
        16: 64,
        20: 80,
    },

    radius: {
        none: 0,
        xs: 4,
        sm: 6,
        md: 10,
        lg: 14,
        xl: 20,
        "2xl": 24,
        "3xl": 32,
        full: 999,
    },

    borderWidth: {
        none: 0,
        hairline: 0.5,
        thin: 1,
        medium: 1.5,
        thick: 2,
    },

    iconSize: {
        xs: 14,
        sm: 16,
        md: 20,
        lg: 24,
        xl: 28,
        "2xl": 32,
        "3xl": 40,
    },

    size: {
        inputSm: 40,
        inputMd: 48,
        inputLg: 56,

        buttonSm: 36,
        buttonMd: 46,
        buttonLg: 56,

        touch: 44,

        header: 60,
        tabBar: 64,

        avatarSm: 32,
        avatarMd: 40,
        avatarLg: 56,

        placeCardImage: 116,
    },

    opacity: {
        disabled: 0.5,
        pressed: 0.75,
        muted: 0.6,
        overlay: 0.45,
    },
}