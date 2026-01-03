export const FlagMap: { [key: string]: any } = {
    "India": require('@/assets/images/flags/india.webp'),
    "United States": require('@/assets/images/flags/us.webp'),
    "United Kingdom": require('@/assets/images/flags/uk.webp'),
    "Canada": require('@/assets/images/flags/canada.webp'),
    "Australia": require('@/assets/images/flags/australia.webp'),
    "Germany": require('@/assets/images/flags/germany.webp'),
    "France": require('@/assets/images/flags/france.webp'),
    "China": require('@/assets/images/flags/china.webp'),
    "Japan": require('@/assets/images/flags/japan.webp'),
    "Russia": require('@/assets/images/flags/russia.webp'),
};

interface CountryCode {
    name: string;
    code: string;
    format: string;
    pattern: RegExp;
    maxLength: number;
    example: string;
}

export const countryCodes: CountryCode[] = [
    { 
        name: "India",
        code: "+91",
        format: "XXXXX XXXXX",
        pattern: /^[6-9]\d{9}$/,  // Indian numbers start with 6-9
        maxLength: 10,
        example: "98765 43210"
    },
    { 
        name: "United States",
        code: "+1",
        format: "XXX XXX XXXX",
        pattern: /^[2-9]\d{9}$/,  // US numbers can't start with 0 or 1
        maxLength: 10,
        example: "234 567 8900"
    },
    { 
        name: "United Kingdom",
        code: "+44",
        format: "XXXX XXX XXXX",
        pattern: /^[1-9]\d{9,10}$/,  // UK numbers are typically 10-11 digits
        maxLength: 11,
        example: "7911 123 4567"
    },
    { 
        name: "Canada",
        code: "+1",
        format: "XXX XXX XXXX",
        pattern: /^[2-9]\d{9}$/,  // Same as US
        maxLength: 10,
        example: "234 567 8900"
    },
    { 
        name: "Australia",
        code: "+61",
        format: "XXX XXX XXX",
        pattern: /^[4-9]\d{8}$/,  // Australian mobile numbers start with 4
        maxLength: 9,
        example: "411 234 567"
    },
    { 
        name: "Germany",
        code: "+49",
        format: "XXXX XXXXXXX",
        pattern: /^[1-9]\d{10,11}$/,  // German numbers can be 11-12 digits
        maxLength: 11,
        example: "1512 3456789"
    },
    { 
        name: "France",
        code: "+33",
        format: "X XX XX XX XX",
        pattern: /^[1-9]\d{8}$/,  // French numbers are 9 digits
        maxLength: 9,
        example: "6 12 34 56 78"
    },
    { 
        name: "China",
        code: "+86",
        format: "XXX XXXX XXXX",
        pattern: /^[1][3-9]\d{9}$/,  // Chinese mobile numbers start with 1
        maxLength: 11,
        example: "139 1234 5678"
    },
    { 
        name: "Japan",
        code: "+81",
        format: "XXX XXXX XXXX",
        pattern: /^[0-9]\d{9}$/,  // Japanese mobile numbers are 10 digits
        maxLength: 10,
        example: "090 1234 5678"
    },
    { 
        name: "Russia",
        code: "+7",
        format: "XXX XXX XX XX",
        pattern: /^[9]\d{9}$/,  // Russian mobile numbers start with 9
        maxLength: 10,
        example: "999 123 45 67"
    }
];