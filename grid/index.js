document.addEventListener("DOMContentLoaded", onReady);

// VARIABLES AND CONSTANTS

// CHESS RULESET
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
    diagonal: ["B", "Q", "K", "P"],
    jump: ["N"],
  },
  moveLimit: {
    forward: {
      P: 1,
      K: 1,
      R: 7,
      Q: 7,
    },
    backward: {
      K: 1,
      Q: 7,
      R: 7,
    },
    sideward: {
      K: 1,
      R: 7,
      Q: 7,
    },

    diagonal: {
      K: 1,
      B: 7,
      Q: 7,
    },
    jump: {
      N: 1,
    },
  },
  attackLimit: {
    forward: {
      K: 1,
      Q: 7,
      R: 7,
    },
    backward: {
      K: 1,
      Q: 7,
      R: 7,
    },
    diagonal: {
      K: 1,
      B: 7,
      P: 1,
      Q: 7,
    },
    sideward: {
      K: 1,
      Q: 7,
      R: 7,
    },
    jump: {
      N: 1,
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

// GAME HELPERS
let currentPlayer = "w";
let pieceChosen = false;
let piecesHighlighted = [];
let piecesState = [];
let whiteGraveyard = [];
let blackGraveyard = [];
let moveCount = 1;
let colLetters = "abcdefgh";
let gameStarted = false;
let chessPieces = {
  wK: "♔",
  wQ: "♕",
  wR: "♖",
  wB: "♗",
  wN: "♘",
  wP: "♙",
  bK: "♚",
  bQ: "♛",
  bR: "♜",
  bB: "♝",
  bN: "♞",
  bP: "♟",
};

// Game utility
const pattern = new RegExp("[a-zA-Z]{2}(?=.svg)"); // to extract the piece from image url

// UI HELPERS
let currentMoveNode;
let moveParentDiv;
let currentBoard; // holds the board values
const pieceHighLight = "#f6f686";

// END VARIABLES AND CONSTANTS

// EVENT LISTENERS

// STARTING POINT OF THE SCRIPT
function onReady(e) {
  document
    .getElementById("start-game-button")
    .addEventListener("click", onGameStart);
  currentBoard = document.querySelectorAll(".tile");
  let i = 64;
  currentBoard.forEach((box) => {
    box.setAttribute("id", i);
    i = i - 1;
    box.addEventListener("click", onBoxClick);
  });
}

// EVENT HANDLER FOR TILE CLICKS
function onBoxClick(event) {
  if (gameStarted) {
    pieceChosen ? validateMove(event) : processMove(event);
  }
}

// EVENT HANDLER FOR START BUTTON CLICK
function onGameStart(event) {
  if (!gameStarted) {
    gameStarted = true;
    event.target.innerHTML = "Quit";
  } else {
    document.location.reload();
    gameStarted = true;
  }
}

// GAME FLOW

/*
 * CHECKS IF THE USER CLICKS A VALID TILE
 * GETS ALL THE DATA NEEDED TO CALCULATE POSSIBLE MOVES
 */
function processMove(box) {
  try {
    const data = getBoxData(box.target);

    if (data !== -1) {
      if (data.piece[0] === currentPlayer) {
        const availableMoves = findMoves(data.piece, data.currentPosition);

        if (availableMoves.length > 0) {
          pieceChosen = true;
          highlightChosenPieces(box, availableMoves);
        }
      }
    }
  } catch (ex) {
    // print error or something
    console.log(ex);
  }
}

/*
 * VALIDATES A USER'S MOVE
 */

function validateMove(box) {
  const boxId = box.target.id;

  let isValid = false;
  let pieceBox;
  piecesState.forEach((tile) => {
    if (boxId === tile.tileID && !tile.isPiece) {
      isValid = true;
    }

    if (tile.isPiece) {
      pieceBox = document.getElementById(tile.tileID);
    }
  });

  if (isValid) {
    switchPlayer();
    const boxTarget = document.getElementById(boxId);

    addMoveToHistory(pieceBox, boxTarget);

    boxTarget.style.backgroundImage = getBackgroundImgUrl(pieceBox);
    pieceBox.style.backgroundImage = "none";
  }

  pieceChosen = false;
  revertState();
}

/*
 * UI HELPER FUNCTION TO ADD ANOTHER ELEMENT TO THE HISTORY LIST DIV
 */

function addMoveToHistory(fromTile, toTile) {
  addFromMovementDataToHistory(fromTile);
  addToMovementDataToHistory(toTile);
  getHistoryList().scrollLeft = getHistoryList().scrollWidth;
  getHistoryList().scrollTop = getHistoryList().scrollHeight;
  moveCount++;
}

/*
 * Sub method of addMoveToHistory - gets the origin tile data
 */

function addFromMovementDataToHistory(fromTile) {
  const fromTileData = getBoxData(fromTile);
  const fromCol = col(parseInt(fromTileData.currentPosition), 8);
  const fromRow = row(parseInt(fromTileData.currentPosition), 8);
  const fromTileColLetter = colLetters.charAt(fromCol);
  const fromTilePiece = chessPieces[fromTileData.piece];
  const pieceText = fromTilePiece + fromTileColLetter + fromRow;

  // CREATE NEW DIV
  currentMoveNode = document.createElement("div");
  currentMoveNode.classList.add("history-item");

  // CREATE 2 P TAGS

  // MOVE #
  const moveCountTag = document.createElement("p");
  const moveCountText = document.createTextNode(moveCount + ".");
  moveCountTag.appendChild(moveCountText);

  // ACTUAL MOVE TAG
  const pieceTag = document.createElement("p");
  const pieceTagText = document.createTextNode(pieceText);
  pieceTag.appendChild(pieceTagText);

  //  APPEND TO CURRENT NODE
  currentMoveNode.appendChild(moveCountTag);
  currentMoveNode.appendChild(pieceTag);

  getHistoryList().appendChild(currentMoveNode);
}

/*
 * Returns the movement history list div via lazy intialization
 */
function getHistoryList() {
  if (!moveParentDiv) {
    moveParentDiv = document.getElementById("history-list-div");
  }
  return moveParentDiv;
}

/*
 * SUB METHOD OF addMoveToHistory - gets the target tile data
 */

function addToMovementDataToHistory(toTile) {
  const toTileData = getBoxData(toTile);
  const toCol = col(parseInt(toTile.id), 8);
  const toRow = row(parseInt(toTile.id), 8);
  const toTileColLetter = colLetters.charAt(toCol);
  let toTilePiece;
  let pieceText;

  if (toTileData !== -1) {
    toTilePiece = chessPieces[toTileData.piece];
    pieceText = toTilePiece + toTileColLetter + toRow;
  } else {
    pieceText = toTileColLetter + toRow;
  }

  const toPieceTag = document.createElement("p");
  const toPieceTagText = document.createTextNode(pieceText);
  toPieceTag.appendChild(toPieceTagText);

  currentMoveNode.appendChild(toPieceTag);
}

// GAME FUNCTIONS


/*
 * Switches players turn
 */
function switchPlayer() {
  currentPlayer = currentPlayer === "w" ? "b" : "w";
}

/*
 * GET ALL AVAILABLE MOVES TO BE USED FOR HIGHLIGHTING THE TILE
 * AND OTHER CALCULATIONS
 */

function findMoves(piece, currentLocation) {
  const side = piece.charAt(0);
  const type = piece.charAt(1);
  const loc = parseInt(currentLocation);

  // NORMAL MOVES

  const forwardMoves = findMovesForDirection(
    side,
    type,
    loc,
    "forward",
    "forwardMove",
    1,
    0
  );
  const backwardMoves = findMovesForDirection(
    side,
    type,
    loc,
    "backward",
    "backwardMove",
    1,
    0
  );
  const diagonalLeftMoves = findMovesForDirection(
    side,
    type,
    loc,
    "diagonal",
    "diagonalLeftMove",
    1,
    1
  );
  const diagonalRightMoves = findMovesForDirection(
    side,
    type,
    loc,
    "diagonal",
    "diagonalRightMove",
    1,
    1
  );

  const diagonalBackLeftMoves = findMovesForDirection(
    side,
    type,
    loc,
    "diagonal",
    "diagonalBackLeftMove",
    1,
    1
  );

  const diagonalBackRightMoves = findMovesForDirection(
    side,
    type,
    loc,
    "diagonal",
    "diagonalBackRightMove",
    1,
    1
  );

  const sidewardRightMoves = findMovesForDirection(
    side,
    type,
    loc,
    "sideward",
    "sidewardRightMove",
    0,
    1
  );
  const sidewardLeftMoves = findMovesForDirection(
    side,
    type,
    loc,
    "sideward",
    "sidewardLeftMove",
    0,
    1
  );

  const jumpLeftBackFarMoves = findMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpLeftBackFarMove",
    2,
    1
  );
  const jumpRightBackFarMoves = findMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpRightBackFarMove",
    2,
    1
  );
  const jumpLeftBackNearMoves = findMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpLeftBackNearMove",
    1,
    2
  );
  const jumpRightBackNearMoves = findMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpRightBackNearMove",
    1,
    2
  );
  const jumpRightForwardFarMoves = findMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpRightForwardFarMove",
    2,
    1
  );
  const jumpRightForwardNearMoves = findMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpRightForwardNearMove",
    1,
    2
  );
  const jumpLeftForwardFarMoves = findMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpLeftForwardFarMove",
    2,
    1
  );
  const jumpLeftForwardNearMoves = findMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpLeftForwardNearMove",
    1,
    2
  );

  // ATTACK MOVES

  const forwardMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "forward",
    "forwardMove",
    1,
    0
  );
  const backwardMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "backward",
    "backwardMove",
    1,
    0
  );
  const diagonalLeftMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "diagonal",
    "diagonalLeftMove",
    1,
    1
  );
  const diagonalRightMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "diagonal",
    "diagonalRightMove",
    1,
    1
  );

  const diagonalBackLeftMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "diagonal",
    "diagonalBackLeftMove",
    1,
    1
  );

  const diagonalBackRightMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "diagonal",
    "diagonalBackRightMove",
    1,
    1
  );

  const sidewardRightMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "sideward",
    "sidewardRightMove",
    0,
    1
  );
  const sidewardLeftMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "sideward",
    "sidewardLeftMove",
    0,
    1
  );

  const jumpLeftBackFarMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpLeftBackFarMove",
    2,
    1
  );
  const jumpRightBackFarMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpRightBackFarMove",
    2,
    1
  );
  const jumpLeftBackNearMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpLeftBackNearMove",
    1,
    2
  );
  const jumpRightBackNearMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpRightBackNearMove",
    1,
    2
  );
  const jumpRightForwardFarMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpRightForwardFarMove",
    2,
    1
  );
  const jumpRightForwardNearMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpRightForwardNearMove",
    1,
    2
  );
  const jumpLeftForwardFarMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpLeftForwardFarMove",
    2,
    1
  );
  const jumpLeftForwardNearMovesAttack = findAttackMovesForDirection(
    side,
    type,
    loc,
    "jump",
    "jumpLeftForwardNearMove",
    1,
    2
  );

  const moves = forwardMoves
    .concat(backwardMoves)
    .concat(sidewardRightMoves)
    .concat(sidewardLeftMoves)
    .concat(diagonalLeftMoves)
    .concat(diagonalRightMoves)
    .concat(diagonalBackLeftMoves)
    .concat(diagonalBackRightMoves)
    .concat(jumpLeftBackFarMoves)
    .concat(jumpRightBackFarMoves)
    .concat(jumpLeftBackNearMoves)
    .concat(jumpRightBackNearMoves)
    .concat(jumpRightForwardFarMoves)
    .concat(jumpRightForwardNearMoves)
    .concat(jumpLeftForwardFarMoves)
    .concat(jumpLeftForwardNearMoves)
    .concat(forwardMovesAttack)
    .concat(backwardMovesAttack)
    .concat(sidewardRightMovesAttack)
    .concat(sidewardLeftMovesAttack)
    .concat(diagonalLeftMovesAttack)
    .concat(diagonalRightMovesAttack)
    .concat(diagonalBackLeftMovesAttack)
    .concat(diagonalBackRightMovesAttack)
    .concat(jumpLeftBackFarMovesAttack)
    .concat(jumpRightBackFarMovesAttack)
    .concat(jumpLeftBackNearMovesAttack)
    .concat(jumpRightBackNearMovesAttack)
    .concat(jumpRightForwardFarMovesAttack)
    .concat(jumpRightForwardNearMovesAttack)
    .concat(jumpLeftForwardFarMovesAttack)
    .concat(jumpLeftForwardNearMovesAttack);

  return moves;
}

/*
 * Finds all the availble tiles to move to for a specific chess piece
 */

function findMovesForDirection(
  side,
  type,
  currentLocation,
  moveDirection,
  moveStep,
  customRowDifference,
  customColumnDifference
) {
  // HOLDS ALL THE POSSIBLE MOVE TILES
  let boxes = [];
  const canMove = ruleSet.moveSet[moveDirection].includes(type);

  // IF CAN MOVE, GET ALL THE POSSIBLE MOVE TILES
  if (canMove) {
    let moveLimit =
      ruleSet.moveLimit[moveDirection][type] === undefined
        ? 7
        : ruleSet.moveLimit[moveDirection][type];
    const moveStepCount = parseInt(ruleSet[moveStep]);

    if (type === "P") {
      const pRow = row(currentLocation, 8);
      if (side === "w" && pRow === 2) {
        moveLimit++;
      }

      if (side === "b" && pRow === 7) {
        moveLimit++;
      }
    }

    for (let i = 1; i <= moveLimit; i++) {
      // GET THE TILE TO CHECK
      const nextTile = getNextTileMove(
        moveStep,
        moveStepCount,
        currentLocation,
        side
      );

      if (nextTile >= 1 && nextTile <= 64) {
        let isMoveValid = true;

        isMoveValid = isValidDirection(
          currentLocation,
          8,
          8,
          nextTile,
          8,
          8,
          moveDirection,
          customRowDifference,
          customColumnDifference
        );

        if (isMoveValid) {
          const tile = document.getElementById(nextTile);
          let boxData = getBoxData(tile);

          if (boxData === -1) {
            boxes.push(nextTile);
            currentLocation = nextTile;
          } else {
            return boxes;
          }
        } else {
          return boxes;
        }
      }
    }
  }
  return boxes;
}

/*
 * Finds all available tiles to attack for a specific chess piece
 */

function findAttackMovesForDirection(
  side,
  type,
  currentLocation,
  moveDirection,
  moveStep,
  customRowDifference,
  customColumnDifference
) {
  let boxes = [];
  let canAttack = ruleSet.attackSet[moveDirection].includes(type);

  if (type === "P") {
    if (
      moveStep === "diagonalBackLeftMove" ||
      moveStep === "diagonalBackRightMove"
    ) {
      canAttack = false;
    }
  }

  if (canAttack) {
    let attackLimit = ruleSet.attackLimit[moveDirection][type];
    const moveStepCount = parseInt(ruleSet[moveStep]);

    for (let i = 1; i <= attackLimit; i++) {
      // GET THE TILE TO CHECK
      const nextTile = getNextTileMove(
        moveStep,
        moveStepCount,
        currentLocation,
        side
      );

      if (nextTile >= 1 && nextTile <= 64) {
        let isMoveValid = true;

        isMoveValid = isValidDirection(
          currentLocation,
          8,
          8,
          nextTile,
          8,
          8,
          moveDirection,
          customRowDifference,
          customColumnDifference
        );

        if (isMoveValid) {
          const tile = document.getElementById(nextTile);
          let boxData = getBoxData(tile);

          if (boxData !== -1) {
            if (boxData.piece[0] !== side) {
              boxes.push(nextTile);
            }

            return boxes;
          } else {
            currentLocation = nextTile;
          }
        } else {
          return boxes;
        }
      }
    }
  }

  return boxes;
}

// Other Game and UI Helpers

/*
 * Highlights the chosen piece tile together with all the available move tiles
 */

function highlightChosenPieces(box, availableMoves) {
  piecesState.push({
    tileID: box.target.id,
    originalColor: window.getComputedStyle(box.target).backgroundColor,
    isPiece: true,
  });
  piecesHighlighted.push(box.target);
  availableMoves.forEach((id) => {
    const tile = document.getElementById(id);
    const originalColor = window.getComputedStyle(tile).backgroundColor;

    piecesHighlighted.push(tile);
    piecesState.push({
      tileID: tile.id,
      originalColor: originalColor,
      isPiece: false,
    });
  });

  piecesHighlighted.forEach((piece) => {
    piece.style.backgroundColor = pieceHighLight;
    piece.style.borderRadius = "5px";
    if (piece !== box.target) {
      piece.style.opacity = 0.6;
    }
  });
}

/*
 * Reverts highlighted tiles to previous state
 */

function revertState() {
  piecesState.forEach((piece) => {
    const box = document.getElementById(piece.tileID);
    const bgColor = piece.originalColor;

    box.style.backgroundColor = bgColor;
    box.style.borderStyle = "none";
    box.style.opacity = 1;
  });
  piecesState = [];
  piecesHighlighted = [];
}

/*
 * Returns the background image url of an element
 */

function getBackgroundImgUrl(element) {
  try {
    const imgUrl = window.getComputedStyle(element).backgroundImage;
    return imgUrl;
  } catch (ex) {
    return -1;
  }
}

/*
 * Game helper to extract chess piece from a URL
 */

function getPieceFromURL(url) {
  const result = pattern.exec(url)[0];
  return result;
}

/*
 * Game helper to extract chess piece type and current location on the board 
 */

function getBoxData(box) {
  const imgUrl = getBackgroundImgUrl(box);

  if (imgUrl !== "none") {
    const piece = getPieceFromURL(imgUrl);
    const id = box.id;

    const data = {
      piece: piece,
      currentPosition: id,
    };
    return data;
  }

  return -1;
}

/*
 * Finds the next avaialble tile depending on the currentlocation and the movement direction
 */

function getNextTileMove(moveStep, moveStepCount, currentLocation, side) {
  let nextLoc;

  switch (moveStep) {
    case "forwardMove":
      nextLoc =
        side === "w"
          ? currentLocation + moveStepCount
          : currentLocation - moveStepCount;
      return nextLoc;
    case "backwardMove":
      nextLoc =
        side === "w"
          ? currentLocation - moveStepCount
          : currentLocation + moveStepCount;
      return nextLoc;
    case "sidewardLeftMove":
      return currentLocation - 1;
    case "sidewardRightMove":
      return currentLocation + 1;
    case "diagonalLeftMove":
    case "diagonalRightMove":
      nextLoc =
        side === "w"
          ? currentLocation + moveStepCount
          : currentLocation - moveStepCount;
      return nextLoc;

    case "diagonalBackLeftMove":
    case "diagonalBackRightMove":
      nextLoc =
        side === "w"
          ? currentLocation - moveStepCount
          : currentLocation + moveStepCount;
      return nextLoc;

    case "jumpRightForwardNearMove":
    case "jumpRightForwardFarMove":
    case "jumpLeftForwardNearMove":
    case "jumpLeftForwardFarMove":
      return currentLocation + moveStepCount;
    case "jumpRightBackNearMove":
    case "jumpRightBackFarMove":
    case "jumpLeftBackNearMove":
    case "jumpLeftBackFarMove":
      return currentLocation - moveStepCount;
  }
}

// DIRECTION UTILITIES

/*
 * Checks if the next tile is a valid movement path for a specific direction
 */

function isValidDirection(
  originIndex,
  originRowCount,
  originColCount,
  targetIndex,
  targetIndexRowCount,
  targetIndexColCount,
  direction,
  customRowDifference,
  customColumnDifference
) {
  const originCoordinates = getCoordinates(
    originIndex,
    originRowCount,
    originColCount
  );
  const targetCoordinates = getCoordinates(
    targetIndex,
    targetIndexRowCount,
    targetIndexColCount
  );

  const rowDifference = Math.abs(originCoordinates.row - targetCoordinates.row);
  const colDifference = Math.abs(originCoordinates.col - targetCoordinates.col);

  return (
    rowDifference === customRowDifference &&
    colDifference === customColumnDifference
  );
}

/*
 * Grid function to return row number from the grid
 */

function row(index, rowCount) {
  return Math.ceil(index / rowCount);
}

/*
 * Grid function to return column number from the grid
 */

function col(index, maxCol) {
  const col = index % maxCol;
  return col === 0 ? maxCol : col;
}

/*
 * Grid function to return row and column numbers from the grid
 */

function getCoordinates(index, rowCount, colCount) {
  return { row: row(index, rowCount), col: col(index, colCount) };
}

// END DIRECTION AND GRID UTILITIES
