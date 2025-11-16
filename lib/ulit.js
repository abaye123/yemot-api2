module.exports = { ini_from_obj };

/**
 * Convert an object to INI file format string
 * @param {object} obj - Object with key-value pairs
 * @returns {string} INI formatted string
 */
function ini_from_obj(obj) {

    let arr = [];

    for (const i of Object.entries(obj)) {
        arr.push(i.join("="));
    }

    return arr.join("\n");
}
