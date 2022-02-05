const ruleSet = {
  moveSet: {
    forward: ["P", "R", "Q", "K"],
    backward: ["R", "Q", "K"],
    sideward: ["K", "R", "Q"],
    diagonal: ["B", "Q", "K"],
    jump: ["N"],
  },
  attackSet: {
    forward: ["R", "Q", "K"],
    backward: ["R", "Q", "K"],
    sideward: ["R", "Q", "K"],
    diagonal: ["B", "Q", "K"],
    jump: ["N"],
  },
  moveLimit: {
    forward: {
      P: 2,
      K: 1,
    },
    backward: {
      K: 1,
    },
    sideward: {
      K: 1,
    },

    diagonal: {
      K: 1,
    },
    jump: {
      N: 1,
    },
  },
  attackLimit: {
    forward: {
      K: 1,
    },
    sideward: {
      K: 1,
    },
    diagonal: {
      K: 1,
      B: 1,
    },
    sideward: {
      K: 1,
    },
  },
  forwardMove: 8,
  backwardMove: 8,
  diagonalLeftMove: 7,
  diagonalRightMove: 9,
  diagonalBackLeftMove: 9,
  diagonalBackRightMove: 7,
  sidewardRightMove: 1,
  sidewardLeftMove: 1,
  jumpLeftBackFarMove: 17,
  jumpRightBackFarMove: 15,
  jumpLeftBackNearMove: 10,
  jumpRightBackNearMove: 6,
  jumpRightForwardFarMove: 17,
  jumpRightForwardNearMove: 10,
  jumpLeftForwardFarMove: 15,
  jumpLeftForwardNearMove: 6,
};
