/*  Temporary function to generate background screen
*   Tt should be identical as on the server
*   It is also used for static randomness of other category
*   such generating unique quest number from its id
*   returns values from -32 to 32
*/

export const getXY = (x, y) => {
    return Math.cos(x / (7 + 3 * Math.cos(x / 17))) * (11 + 5 * Math.cos((x > 0 ? x : 0.5 - x) / 13)) + Math.sin(y / (7 + 3 * Math.sin(y / 17))) * (11 + 5 * Math.cos(y / 13));
}