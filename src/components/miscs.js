/**
 *  Temporary function to generate background screen
 *  Tt should be identical as on the server
 *  It is also used for static randomness of other category
 *  such generating unique quest number from its id
 *  returns values from -32 to 32
 */
export const binToGr = (num, max, depth) => {
  const part = num / max;
  let gr = '';
  if (depth > 0) gr += part > 0.5 ? '0' : '1';
  if (depth > 1) gr += part > 0.25 && part < 0.75 ? '1' : '0';
  for (let mov = 0.125, div = 0.25, dep = 2; dep < depth; dep++, div /= 2, mov /= 2) {
    gr += (part + mov / 2) % div < mov ? '1' : '0';
  }
  return parseInt(gr, 2);
};

export const getXY = (x, y) => Math.cos(x / (7 + 3 * Math.cos(x / 17)))
  * (11 + 5 * Math.cos((x > 0 ? x : 0.5 - x) / 13))
  + Math.sin(y / (7 + 3 * Math.sin(y / 17))) * (11 + 5 * Math.cos(y / 13));
