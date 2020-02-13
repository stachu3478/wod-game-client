const rowMan = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [0, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

const patterns = [
  [
    0, 0, 0,
    0, 0, 0,
    0, 0, 0,
  ],
  [
    0, 1, 0,
    1, 1, 1,
    0, 1, 0,
  ],
  [
    1, 0, 1,
    0, 1, 0,
    1, 0, 1,
  ],
  [
    0, 0, 0,
    0, 1, 0,
    0, 0, 0,
  ],
];

/**
 * Checks if specified building can be built
 * on the specified position on the map
 */
export default (map) => (x, y, type) => {
  for (let i = 0; i < 9; i++) {
    const bi = map.getBlock(x + rowMan[i][0], y + rowMan[i][1]).i;
    if (bi && patterns[type][i]) return false;
  }
  return true;
};
