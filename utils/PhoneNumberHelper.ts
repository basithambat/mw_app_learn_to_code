import { countryCodes } from "@/constants/Flags";

export const formatPhoneNumber = (phoneNumber: string, countryCode: string): string => {
    const country = countryCodes.find(c => c.code === countryCode);
    if (!country) return phoneNumber;

    const cleaned = phoneNumber.replace(/\D/g, '');
    let formatted = '';
    let digitIndex = 0;

    for (let i = 0; i < country.format.length && digitIndex < cleaned.length; i++) {
        if (country.format[i] === 'X') {
            formatted += cleaned[digitIndex];
            digitIndex++;
        } else {
            formatted += country.format[i];
        }
    }

    return formatted;
};

export const validatePhoneNumber = (phoneNumber: string, countryCode: string): boolean => {
    const country = countryCodes.find(c => c.code === countryCode);
    if (!country) return false;

    const cleaned = phoneNumber.replace(/\D/g, '');
    return country.pattern.test(cleaned);
};

export const getMaxLength = (countryCode: string): number => {
    const country = countryCodes.find(c => c.code === countryCode);
    return country ? country.maxLength + (country.format.match(/\s/g) || []).length : 15;
};

// Masking Mobile Number
export const maskMobileNumber = (number:string) => {
    // Convert the number to a string, in case it's a number type
    const numberString = number.toString();
    const length = numberString.length;
  
    // Replace all but the last three digits with asterisks
    return '*'.repeat(length - 3) + numberString.slice(-3);
  };