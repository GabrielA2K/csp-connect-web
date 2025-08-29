
export const arrayHasDuplicates = (arr) => {
    const seen = new Set();
    for (const user of arr) {
        const name = user.username.trim();
        if (name === "") continue;
        if (seen.has(name)) {
        return true;
        }
        seen.add(name);
    }
    return false;
}