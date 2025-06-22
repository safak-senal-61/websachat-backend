// src/utils/jsonHelper.js
/**
 * Parses a JSON array field from a string or returns an empty array if null/undefined/invalid.
 * @param {string | null | undefined | any[]} field - The field to parse.
 * @returns {any[]} The parsed array or an empty array.
 */
const parseJsonArrayField = (field) => {
    if (!field) return [];
    if (Array.isArray(field)) return field; // Zaten bir array ise direkt döndür
    try {
        const parsed = JSON.parse(field);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        return [];
    }
};

module.exports = {
    parseJsonArrayField,
};