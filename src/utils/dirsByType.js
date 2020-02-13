/**
 * Converts 2 parameter direction to one parameter direction
 */
export default (x, y) => {
  switch (x) {
    case -1: return 3;
    case 1: return 1;
    default: {
      if (y === 1) return 2;
      return 0;
    }
  }
};
