// ------------------------------------------------------------------------
// How To Make A Match-3 Game With HTML5 Canvas
// Copyright (c) 2015 Rembound.com
// 
// This program is free software: you can redistribute it and/or modify  
// it under the terms of the GNU General Public License as published by  
// the Free Software Foundation, either version 3 of the License, or  
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,  
// but WITHOUT ANY WARRANTY; without even the implied warranty of  
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the  
// GNU General Public License for more details.  
// 
// You should have received a copy of the GNU General Public License  
// along with this program.  If not, see http://www.gnu.org/licenses/.
//
// http://rembound.com/articles/how-to-make-a-match3-game-with-html5-canvas
// ------------------------------------------------------------------------

// The function gets called when the window is fully loaded
window.onload = function () {
    const EMPTY = 0
    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    // Timing and frames per second
    var lastframe = 0;
    var fpstime = 0;
    var framecount = 0;
    var fps = 0;

    // Mouse dragging
    var drag = false;


    // Level object
    var level = {
        x: 250,         // X position
        y: 113,         // Y position
        columns: 8,     // Number of tile columns
        rows: 8,        // Number of tile rows
        tilewidth: 40,  // Visual width of a tile
        tileheight: 40, // Visual height of a tile
        tiles: [],      // The two-dimensional tile array
        selectedtile: { selected: false, column: 0, row: 0 },
        tileTypes: 7
    };

    // All of the different tile colors in RGB
    var tilecolors = [
        'rgba(0,0,0,0)',
        'rgba(255, 128, 128,1)',
        'rgba(128, 255, 128,1)',
        'rgba(128, 128, 255,1)',
        'rgba(255, 255, 128,1)',
        'rgba(255, 128, 255,1)',
        'rgba(128, 255, 255,1)',
        'rgba(255, 255, 255,1)',
        'rgba(128, 128, 128,1)']
    // Clusters and moves that were found
    var clusters = [];  // { column, row, length, horizontal }
    var moves = [];     // { column1, row1, column2, row2 }

    // Current move
    var currentmove = { column1: 0, row1: 0, column2: 0, row2: 0 };

    // Game states
    var gamestates = { init: 0, ready: 1, resolve: 2 };
    var gamestate = gamestates.init;

    // Score
    var score = 0;

    // Animation variables
    var animationstate = 0;
    var animationtime = 0;
    var animationtimetotal = 0.3;

    // Show available moves
    var showmoves = false;

    // The AI bot
    var aibot = false;

    // Game Over
    var gameover = false;

    // Gui buttons
    var buttons = [{ x: 30, y: 240, width: 150, height: 50, text: "New Game" },
    { x: 30, y: 300, width: 150, height: 50, text: "Show Moves" },
    { x: 30, y: 360, width: 150, height: 50, text: "Enable AI Bot" }];

    // Initialize the game
    function init() {
        // Add mouse events
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mousedown", onMouseDown);
        canvas.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("mouseout", onMouseOut);

        // Initialize the two-dimensional tile array
        for (var i = 0; i < level.columns; i++) {
            level.tiles[i] = [];
            for (var j = 0; j < level.rows; j++) {
                // Define a tile type and a shift parameter for animation
                level.tiles[i][j] = { type: 0, shift: 0 }
            }
        }

        // New game
        newGame();

        // Enter main loop
        main(0);
    }

    // Main loop
    function main(tframe) {
        // Request animation frames

        // Update and render the game
        update(tframe);
        render();
        window.requestAnimationFrame(main);

    }

    // Update the game state
    function update(tframe) {
        var dt = (tframe - lastframe) / 1000;
        lastframe = tframe;

        // Update the fps counter
        updateFps(dt);

        if (gamestate == gamestates.ready) {
            // Game is ready for player input

            // Check for game over
            if (moves.length <= 0) {
                gameover = true;
            }

            // Let the AI bot make a move, if enabled
            if (aibot) {
                animationtime += dt;
                if (animationtime > animationtimetotal) {
                    // Check if there are moves available
                    // findMoves();
                    // if (moves.length > 0) {
                    //     // Get a random valid move
                    //     var move = moves[Math.floor(Math.random() * moves.length)];

                    //     // Simulate a player using the mouse to swap two tiles
                    //     mouseSwap(move.column1, move.row1, move.column2, move.row2);
                    // } else {
                    //     // No moves left, Game Over. We could start a new game.
                    //     // newGame();
                    // }
                    if (g_bestSwaps.length == 0) {
                        let t = level.tiles.map(
                            row => row.map(tile => tile.type)
                        )
                        let row = t.length;
                        let col = t[0].length;
                        let tiles = new Array(col);
                        for (let i = 0; i < col; i++) {
                            tiles[i] = new Array(row);
                        }
                        for (let i = 0; i < col; i++) {
                            for (let j = 0; j < row; j++) {
                                tiles[i][j] = t[j][i];
                            }
                        }
                        // print(tiles);
                        let t_begin = new Date().getTime();

                        g_highest = 0;
                        g_states.clear();
                        g_score = 0;
                        g_swaps = [];
                        let highest = search(tiles);

                        let t_end = new Date().getTime();
                        let t_duration = t_end - t_begin;

                        tt = copy(tiles);
                        // for (let e of g_bestSwaps) {
                        //     console.log(`\n${e.r1},${e.c1} - ${e.r2},${e.c2}`);
                        //     result = trySwap(tt, e.r1, e.c1, e.r2, e.c2);
                        //     tt = result.tiles;
                        //     print(tt);
                        // }
                        if (highest != 0) {
                            console.log(`===highest-${highest} time-${t_duration}===`);
                            console.log(`===g_times-${g_times} ===`);
                            g_bestSwaps = g_bestSwaps.reverse();
                        }
                    }

                    if (g_bestSwaps.length > 0) {
                        moves = [];
                        let aSwap = g_bestSwaps.pop();
                        let e = aSwap;
                        // console.log(`\n${e.r1},${e.c1} - ${e.r2},${e.c2}`);
                        // result = trySwap(tt, e.c1, e.r1, e.c2, e.r2);
                        // tt = result.tiles;
                        // print(tt);
                        mouseSwap(aSwap.c1, aSwap.r1, aSwap.c2, aSwap.r2);
                        moves.push({ column1: aSwap.x1, row1: aSwap.r1, column2: aSwap.c2, row2: aSwap.r2 });
                        animationtime = 0;

                    }
                }
            }
        } else if (gamestate == gamestates.resolve) {
            // Game is busy resolving and animating clusters
            animationtime += dt;

            if (animationstate == 0) {
                // Clusters need to be found and removed
                if (animationtime > animationtimetotal) {
                    // Find clusters
                    findClusters();

                    if (clusters.length > 0) {
                        // Add points to the score
                        for (var i = 0; i < clusters.length; i++) {
                            // Add extra points for longer clusters
                            score += 1 * (SCORES[clusters[i].length]);;
                        }

                        // Clusters found, remove them
                        removeClusters();

                        // Tiles need to be shifted
                        animationstate = 1;
                    } else {
                        // No clusters found, animation complete
                        gamestate = gamestates.ready;
                    }
                    animationtime = 0;
                }
            } else if (animationstate == 1) {
                // Tiles need to be shifted
                if (animationtime > animationtimetotal) {
                    // Shift tiles
                    shiftTiles();

                    // New clusters need to be found
                    animationstate = 0;
                    animationtime = 0;

                    // Check if there are new clusters
                    findClusters();
                    if (clusters.length <= 0) {
                        // Animation complete
                        gamestate = gamestates.ready;
                    }
                }
            } else if (animationstate == 2) {
                // Swapping tiles animation
                if (animationtime > animationtimetotal) {
                    // Swap the tiles
                    swap(currentmove.column1, currentmove.row1, currentmove.column2, currentmove.row2);

                    // Check if the swap made a cluster
                    findClusters();
                    if (clusters.length > 0) {
                        // Valid swap, found one or more clusters
                        // Prepare animation states
                        animationstate = 0;
                        animationtime = 0;
                        gamestate = gamestates.resolve;
                    } else {
                        // Invalid swap, Rewind swapping animation
                        animationstate = 3;
                        animationtime = 0;
                    }

                    // Update moves and clusters
                    findMoves();
                    findClusters();
                }
            } else if (animationstate == 3) {
                // Rewind swapping animation
                if (animationtime > animationtimetotal) {
                    // Invalid swap, swap back
                    swap(currentmove.column1, currentmove.row1, currentmove.column2, currentmove.row2);

                    // Animation complete
                    gamestate = gamestates.ready;
                }
            }

            // Update moves and clusters
            //findMoves();
            //findClusters();
        }
    }

    function updateFps(dt) {
        if (fpstime > 0.25) {
            // Calculate fps
            fps = Math.round(framecount / fpstime);

            // Reset time and framecount
            fpstime = 0;
            framecount = 0;
        }

        // Increase time and framecount
        fpstime += dt;
        framecount++;
    }

    // Draw text that is centered
    function drawCenterText(text, x, y, width) {
        var textdim = context.measureText(text);
        context.fillText(text, x + (width - textdim.width) / 2, y);
    }

    // Render the game
    function render() {
        // Draw the frame
        drawFrame();

        // Draw score
        context.fillStyle = "#000000";
        context.font = "24px Verdana";
        drawCenterText("Score:", 30, level.y + 40, 150);
        drawCenterText(score, 30, level.y + 70, 150);

        // Draw buttons
        drawButtons();

        // Draw level background
        var levelwidth = level.columns * level.tilewidth;
        var levelheight = level.rows * level.tileheight;
        context.fillStyle = "#000";
        context.fillRect(level.x - 4, level.y - 4, levelwidth + 8, levelheight + 8);


        // Render tiles
        renderTiles();

        // Render clusters
        renderClusters();

        // Render moves, when there are no clusters
        if (showmoves && clusters.length <= 0 && gamestate == gamestates.ready) {
            renderMoves();
        }

        // Game Over overlay
        if (gameover) {
            context.fillStyle = "rgba(0, 0, 0, 0.8)";
            context.fillRect(level.x, level.y, levelwidth, levelheight);

            context.fillStyle = "#ffffff";
            context.font = "24px Verdana";
            drawCenterText("Game Over!", level.x, level.y + levelheight / 2 + 10, levelwidth);
        }
    }

    // Draw a frame with a border
    function drawFrame() {
        // Draw background and a border
        context.fillStyle = "#d0d0d0";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#e8eaec";
        context.fillRect(1, 1, canvas.width - 2, canvas.height - 2);

        // Draw header
        context.fillStyle = "#303030";
        context.fillRect(0, 0, canvas.width, 65);

        // Draw title
        context.fillStyle = "#ffffff";
        context.font = "24px Verdana";
        context.fillText("Match3 Example - Rembound.com", 10, 30);

        // Display fps
        context.fillStyle = "#ffffff";
        context.font = "12px Verdana";
        context.fillText("Fps: " + fps, 13, 50);
    }

    // Draw buttons
    function drawButtons() {
        for (var i = 0; i < buttons.length; i++) {
            // Draw button shape
            context.fillStyle = "#000000";
            context.fillRect(buttons[i].x, buttons[i].y, buttons[i].width, buttons[i].height);

            // Draw button text
            context.fillStyle = "#ffffff";
            context.font = "18px Verdana";
            var textdim = context.measureText(buttons[i].text);
            context.fillText(buttons[i].text, buttons[i].x + (buttons[i].width - textdim.width) / 2, buttons[i].y + 30);
        }
    }

    // Render tiles
    function renderTiles() {
        for (var i = 0; i < level.columns; i++) {
            for (var j = 0; j < level.rows; j++) {
                // Get the shift of the tile for animation
                var shift = level.tiles[i][j].shift;

                // Calculate the tile coordinates
                var coord = getTileCoordinate(i, j, 0, (animationtime / animationtimetotal) * shift);

                // Check if there is a tile present
                if (level.tiles[i][j].type !== EMPTY) {
                    // Get the color of the tile
                    var col = tilecolors[level.tiles[i][j].type];

                    // Draw the tile using the color
                    drawTile(coord.tilex, coord.tiley, col);
                }

                // Draw the selected tile
                if (level.selectedtile.selected) {
                    if (level.selectedtile.column == i && level.selectedtile.row == j) {
                        // Draw a red tile
                        drawTile(coord.tilex, coord.tiley, 255, 0, 0);
                    }
                }
            }
        }

        // Render the swap animation
        if (gamestate == gamestates.resolve && (animationstate == 2 || animationstate == 3)) {
            // Calculate the x and y shift
            var shiftx = currentmove.column2 - currentmove.column1;
            var shifty = currentmove.row2 - currentmove.row1;

            // First tile
            var coord1 = getTileCoordinate(currentmove.column1, currentmove.row1, 0, 0);
            var coord1shift = getTileCoordinate(currentmove.column1, currentmove.row1, (animationtime / animationtimetotal) * shiftx, (animationtime / animationtimetotal) * shifty);
            var col1 = tilecolors[level.tiles[currentmove.column1][currentmove.row1].type];

            // Second tile
            var coord2 = getTileCoordinate(currentmove.column2, currentmove.row2, 0, 0);
            var coord2shift = getTileCoordinate(currentmove.column2, currentmove.row2, (animationtime / animationtimetotal) * -shiftx, (animationtime / animationtimetotal) * -shifty);
            var col2 = tilecolors[level.tiles[currentmove.column2][currentmove.row2].type];


            // Draw a black background
            drawTile(coord1.tilex, coord1.tiley, 'rgb(0,0,0)');
            drawTile(coord2.tilex, coord2.tiley, 'rgb(0,0,0)');

            try {
                // Change the order, depending on the animation state
                if (animationstate == 2) {
                    // Draw the tiles
                    drawTile(coord1shift.tilex, coord1shift.tiley, col1);
                    drawTile(coord2shift.tilex, coord2shift.tiley, col2);
                } else {
                    // Draw the tiles
                    drawTile(coord2shift.tilex, coord2shift.tiley, col2);
                    drawTile(coord1shift.tilex, coord1shift.tiley, col1);
                }
            } catch (err) {
                txt = "There was an error on this page.\n\n";
                txt += "Error description: " + err.message + "\n\n";
                txt += "Click OK to continue.\n\n";
                alert(txt);
            }
        }
    }

    // Get the tile coordinate
    function getTileCoordinate(column, row, columnoffset, rowoffset) {
        var tilex = level.x + (column + columnoffset) * level.tilewidth;
        var tiley = level.y + (row + rowoffset) * level.tileheight;
        return { tilex: tilex, tiley: tiley };
    }

    // Draw a tile with a color
    function drawTile(x, y, style) {
        context.fillStyle = style;
        context.fillRect(x + 2, y + 2, level.tilewidth - 4, level.tileheight - 4);
    }

    // Render clusters
    function renderClusters() {
        for (var i = 0; i < clusters.length; i++) {
            // Calculate the tile coordinates
            var coord = getTileCoordinate(clusters[i].column, clusters[i].row, 0, 0);

            if (clusters[i].horizontal) {
                // Draw a horizontal line
                context.fillStyle = "#00ff00";
                context.fillRect(coord.tilex + level.tilewidth / 2, coord.tiley + level.tileheight / 2 - 4, (clusters[i].length - 1) * level.tilewidth, 8);
            } else {
                // Draw a vertical line
                context.fillStyle = "#0000ff";
                context.fillRect(coord.tilex + level.tilewidth / 2 - 4, coord.tiley + level.tileheight / 2, 8, (clusters[i].length - 1) * level.tileheight);
            }
        }
    }

    // Render moves
    function renderMoves() {
        for (var i = 0; i < moves.length; i++) {
            // Calculate coordinates of tile 1 and 2
            var coord1 = getTileCoordinate(moves[i].column1, moves[i].row1, 0, 0);
            var coord2 = getTileCoordinate(moves[i].column2, moves[i].row2, 0, 0);

            // Draw a line from tile 1 to tile 2
            context.strokeStyle = "#ff0000";
            context.beginPath();
            context.moveTo(coord1.tilex + level.tilewidth / 2, coord1.tiley + level.tileheight / 2);
            context.lineTo(coord2.tilex + level.tilewidth / 2, coord2.tiley + level.tileheight / 2);
            context.stroke();
        }
    }

    // Start a new game
    function newGame() {
        // Reset score
        score = 0;

        // Set the gamestate to ready
        gamestate = gamestates.ready;

        // Reset game over
        gameover = false;

        // Create the level
        createLevel();

        // Create a level with random tiles
        for (var i = 0; i < level.columns; i++) {
            var s = ''
            for (var j = 0; j < level.rows; j++) {
                s += level.tiles[i][j].type + ' '
            }
            console.log(s)
        }



        // Find initial clusters and moves
        findMoves();
        findClusters();
    }

    // Create a random level
    function createLevel() {
        var done = false;

        // Keep generating levels until it is correct
        while (!done) {
            // const map = `
            //             2 1 2 2 4 5 5 1
            // 			1 5 1 3 1 5 4 4
            // 			7 1 1 3 4 4 3 6
            // 			1 2 3 4 5 6 7 8
            // 			5 1 7 4 2 5 6 5
            //             3 2 6 1 3 4 2 6
            //             5 1 7 4 2 5 6 5
            //             5 1 7 4 2 5 6 5
            //             `.trim();
            // const s = map.split('\n')
            // for (let i in s) {
            //     s[i] = s[i].trim()
            //     let tiles = s[i].split(' ')
            //     for (let j in tiles)
            //         level.tiles[j][i].type = parseInt(tiles[j])
            // }

            // Create a level with random tiles
            let tiles = new Array(level.columns);
            for (let i = 0; i < level.columns; i++)
                tiles[i] = Array.from(new Array(level.rows),_=>EMPTY);
            for (let i = 0; i < level.columns; i++) {
                for (let j = 0; j < level.rows; j++) {
                    do {
                        tiles[i][j] = getRandomTile();
                    } while (findClusterFromTile(tiles, { row:i, col:j }).length != 0);
                }
            }
            for (let i = 0; i < level.columns; i++) {
                for (let j = 0; j < level.rows; j++) {
                    level.tiles[i][j].type = tiles[i][j];
                }
            }

            // Resolve the clusters
            resolveClusters();

            // Check if there are valid moves
            findMoves();

            // Done when there is a valid move
            if (moves.length > 0) {
                done = true;
            }
        }

    }

    // Get a random tile
    function getRandomTile() {
        return Math.floor(Math.random() * level.tileTypes) + 1;
    }

    // Remove clusters and insert tiles
    function resolveClusters() {
        // Check for clusters
        findClusters();

        // While there are clusters left
        while (clusters.length > 0) {

            // Remove clusters
            removeClusters();

            // Shift tiles
            shiftTiles();

            // Check if there are clusters left
            findClusters();
        }
    }


    // Find a cluster containing the  specified tile
    function _findClusters(tiles, tile) {
        let left = tile.col, right = tile.col
        let top = tile.row, bottom = tile.row
        while (left - 1 >= 0 && tiles[tile.row][left - 1].type == tile.type) {
            left--
        }
        while (right + 1 < level.rows && tiles[tile.row][right + 1].type == tile.type) {
            right++
        }
        while (top - 1 >= 0 && tiles[top][tile.col].type == tile.type) {
            top--
        }
        while (bottom + 1 < level.columns && tiles[bottom][tile.col].type == tile.type) {
            bottom++
        }
        if (right - left >= 2)
            clusters.push({
                column: left, row: tile.row,
                length: right - left + 1, horizontal: true
            });
        if (top - bottom >= 2)
            clusters.push({
                column: tile.col, row: top,
                length: top - bottom + 1, horizontal: false
            });
    }


    // Find clusters in the level
    function findClusters() {
        // Reset clusters
        clusters = []

        // Find horizontal clusters
        for (var j = 0; j < level.rows; j++) {
            // Start with a single tile, cluster of 1
            var matchlength = 1;
            for (var i = 0; i < level.columns; i++) {
                var checkcluster = false;

                if (i == level.columns - 1) {
                    // Last tile
                    checkcluster = true;
                } else {
                    // Check the type of the next tile
                    if (level.tiles[i][j].type == level.tiles[i + 1][j].type &&
                        level.tiles[i][j].type != EMPTY) {
                        // Same type as the previous tile, increase matchlength
                        matchlength += 1;
                    } else {
                        // Different type
                        checkcluster = true;
                    }
                }

                // Check if there was a cluster
                if (checkcluster) {
                    if (matchlength >= 3) {
                        // Found a horizontal cluster
                        clusters.push({
                            column: i + 1 - matchlength, row: j,
                            length: matchlength, horizontal: true
                        });
                    }

                    matchlength = 1;
                }
            }
        }

        // Find vertical clusters
        for (var i = 0; i < level.columns; i++) {
            // Start with a single tile, cluster of 1
            var matchlength = 1;
            for (var j = 0; j < level.rows; j++) {
                var checkcluster = false;

                if (j == level.rows - 1) {
                    // Last tile
                    checkcluster = true;
                } else {
                    // Check the type of the next tile
                    if (level.tiles[i][j].type == level.tiles[i][j + 1].type &&
                        level.tiles[i][j].type != EMPTY) {
                        // Same type as the previous tile, increase matchlength
                        matchlength += 1;
                    } else {
                        // Different type
                        checkcluster = true;
                    }
                }

                // Check if there was a cluster
                if (checkcluster) {
                    if (matchlength >= 3) {
                        // Found a vertical cluster
                        clusters.push({
                            column: i, row: j + 1 - matchlength,
                            length: matchlength, horizontal: false
                        });
                    }

                    matchlength = 1;
                }
            }
        }
    }

    // Find available moves
    function findMoves() {
        // Reset moves
        moves = []

        // Check horizontal swaps
        for (var j = 0; j < level.rows; j++) {
            for (var i = 0; i < level.columns - 1; i++) {
                if (level.tiles[i][j].type == EMPTY
                    || level.tiles[i + 1][j].type == EMPTY
                    || level.tiles[i][j].type == level.tiles[i + 1][j].type)
                    continue;
                // Swap, find clusters and swap back
                swap(i, j, i + 1, j);
                findClusters()
                // _findClusters(level.tiles,{ row: i, col: j, type: level.tiles[i][j].type });
                // _findClusters(level.tiles,{ row: i + 1, col: j, type: level.tiles[i + 1][j].type });
                swap(i, j, i + 1, j);

                // Check if the swap made a cluster
                if (clusters.length > 0) {
                    // Found a move
                    moves.push({ column1: i, row1: j, column2: i + 1, row2: j });
                }
            }
        }

        // Check vertical swaps
        for (var i = 0; i < level.columns; i++) {
            for (var j = 0; j < level.rows - 1; j++) {
                if (level.tiles[i][j].type == EMPTY
                    || level.tiles[i][j + 1].type == EMPTY
                    || level.tiles[i][j].type == level.tiles[i][j + 1].type)
                    continue;
                // Swap, find clusters and swap back
                swap(i, j, i, j + 1);
                findClusters()
                // _findClusters(level.tiles,{ row: i, col: j, type: level.tiles[i][j].type });
                // _findClusters(level.tiles,{ row: i, col: j + 1, type: level.tiles[i][j + 1].type });
                swap(i, j, i, j + 1);

                // Check if the swap made a cluster
                if (clusters.length > 0) {
                    // Found a move
                    moves.push({ column1: i, row1: j, column2: i, row2: j + 1 });
                }
            }
        }

        // Reset clusters
        clusters = []
    }

    // Loop over the cluster tiles and execute a function
    function loopClusters(func) {
        for (var i = 0; i < clusters.length; i++) {
            //  { column, row, length, horizontal }
            var cluster = clusters[i];
            var coffset = 0;
            var roffset = 0;
            for (var j = 0; j < cluster.length; j++) {
                func(i, cluster.column + coffset, cluster.row + roffset, cluster);

                if (cluster.horizontal) {
                    coffset++;
                } else {
                    roffset++;
                }
            }
        }
    }

    // Remove the clusters
    function removeClusters() {
        // Change the type of the tiles to -1, indicating a removed tile
        loopClusters(function (index, column, row, cluster) { level.tiles[column][row].type = EMPTY; });

        // Calculate how much a tile should be shifted downwards
        for (var i = 0; i < level.columns; i++) {
            var shift = 0;
            for (var j = level.rows - 1; j >= 0; j--) {
                // Loop from bottom to top
                if (level.tiles[i][j].type == EMPTY) {
                    // Tile is removed, increase shift
                    shift++;
                    level.tiles[i][j].shift = 0;
                } else {
                    // Set the shift
                    level.tiles[i][j].shift = shift;
                }
            }
        }
    }

    // Shift tiles and insert new tiles
    function shiftTiles() {
        // Shift tiles
        for (var i = 0; i < level.columns; i++) {
            for (var j = level.rows - 1; j >= 0; j--) {
                // Loop from bottom to top
                if (level.tiles[i][j].type == EMPTY) {
                    // Insert new random tile
                    //level.tiles[i][j].type = getRandomTile();
                } else {
                    // Swap tile to shift it
                    var shift = level.tiles[i][j].shift;
                    if (shift > 0) {
                        swap(i, j, i, j + shift)
                    }
                }

                // Reset shift
                level.tiles[i][j].shift = 0;
            }
        }
    }

    // Get the tile under the mouse
    function getMouseTile(pos) {
        // Calculate the index of the tile
        var tx = Math.floor((pos.x - level.x) / level.tilewidth);
        var ty = Math.floor((pos.y - level.y) / level.tileheight);

        // Check if the tile is valid
        if (tx >= 0 && tx < level.columns && ty >= 0 && ty < level.rows) {
            // Tile is valid
            return {
                valid: level.tiles[tx][ty].type !== EMPTY,
                x: tx,
                y: ty
            };
        }

        // No valid tile
        return {
            valid: false,
            x: 0,
            y: 0
        };
    }

    // Check if two tiles can be swapped
    function canSwap(x1, y1, x2, y2) {
        // Check if the tile is a direct neighbor of the selected tile
        if ((Math.abs(x1 - x2) == 1 && y1 == y2) ||
            (Math.abs(y1 - y2) == 1 && x1 == x2)) {
            return true;
        }

        return false;
    }

    // Swap two tiles in the level
    function swap(x1, y1, x2, y2) {
        var typeswap = level.tiles[x1][y1].type;
        level.tiles[x1][y1].type = level.tiles[x2][y2].type;
        level.tiles[x2][y2].type = typeswap;
    }

    // Swap two tiles as a player action
    function mouseSwap(c1, r1, c2, r2) {
        // Save the current move
        currentmove = { column1: c1, row1: r1, column2: c2, row2: r2 };

        // Deselect
        level.selectedtile.selected = false;

        // Start animation
        animationstate = 2;
        animationtime = 0;
        gamestate = gamestates.resolve;
    }

    // On mouse movement
    function onMouseMove(e) {
        // check game state, avoid swapping two pairs of tiles at the same time
        if (gamestate !== gamestates.ready)
            return

        // Get the mouse position
        var pos = getMousePos(canvas, e);

        // Check if we are dragging with a tile selected
        if (drag && level.selectedtile.selected) {
            // Get the tile under the mouse
            mt = getMouseTile(pos);
            if (mt.valid) {
                // Valid tile

                // Check if the tiles can be swapped
                if (canSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row)) {
                    // Swap the tiles
                    mouseSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row);
                }
            }
        }

    }

    // On mouse button click
    function onMouseDown(e) {
        // Get the mouse position
        var pos = getMousePos(canvas, e);

        // Start dragging
        if (!drag) {
            // Get the tile under the mouse
            mt = getMouseTile(pos);

            if (mt.valid) {
                // Valid tile
                var swapped = false;
                if (level.selectedtile.selected) {
                    if (mt.x == level.selectedtile.column && mt.y == level.selectedtile.row) {
                        // Same tile selected, deselect
                        level.selectedtile.selected = false;
                        drag = true;
                        return;
                    } else if (canSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row)) {
                        // Tiles can be swapped, swap the tiles
                        mouseSwap(mt.x, mt.y, level.selectedtile.column, level.selectedtile.row);
                        swapped = true;
                    }
                }

                if (!swapped) {
                    // Set the new selected tile
                    level.selectedtile.column = mt.x;
                    level.selectedtile.row = mt.y;
                    level.selectedtile.selected = true;
                }
            } else {
                // Invalid tile
                level.selectedtile.selected = false;
            }

            // Start dragging
            drag = true;
        }

        // Check if a button was clicked
        for (var i = 0; i < buttons.length; i++) {
            if (pos.x >= buttons[i].x && pos.x < buttons[i].x + buttons[i].width &&
                pos.y >= buttons[i].y && pos.y < buttons[i].y + buttons[i].height) {

                // Button i was clicked
                if (i == 0) {
                    // New Game
                    newGame();
                } else if (i == 1) {
                    // Show Moves
                    showmoves = !showmoves;
                    buttons[i].text = (showmoves ? "Hide" : "Show") + " Moves";
                } else if (i == 2) {
                    // AI Bot
                    aibot = !aibot;
                    buttons[i].text = (aibot ? "Disable" : "Enable") + " AI Bot";
                }
            }
        }
    }

    function onMouseUp(e) {
        // Reset dragging
        drag = false;
    }

    function onMouseOut(e) {
        // Reset dragging
        drag = false;
    }

    // Get the mouse position
    function getMousePos(canvas, e) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: Math.round((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width),
            y: Math.round((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
        };
    }

    // Call init to start the game
    init();
};


