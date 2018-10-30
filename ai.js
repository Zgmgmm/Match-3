const SCORES = [0, 0, 0, 1, 4, 10, 8, 16, 32];
const EMPTY = 0;

var g_states = new Map();
var g_maps = new Map();
var g_highest = 0;
var g_score = 0;
var g_swaps = [];
var g_bestSwaps = [];
var g_times = 0;


test();

function test() {
    let map;

    map = `
     1 2 3 2 3 4 2 3 4 2
2 1 2 4 3 4 4 2 4 4
1 2 1 3 4 3 3 1 3 3
2 4 3 3 1 1 3 3 1 3
4 2 3 4 3 3 4 3 3 4
    `;

    map = `
    2 3 2 2 3 3 4 1
    4 3 4 4 2 2 3 2
    3 1 2 3 2 1 2 2
    2 4 1 2 4 3 3 1
    1 4 3 2 2 3 1 2
    3 1 3 3 1 4 2 2
    1 1 4 2 1 3 1 3
    1 4 4 2 3 2 3 3`;

   
    map = `
4 4 2 4 4 0 4 4 2 4 4
3 3 1 3 3 0 3 3 1 3 3
1 3 3 1 3 0 1 3 3 1 3
3 4 3 3 4 0 3 4 3 3 4
3 3 1 3 3 0 3 3 1 3 3
1 3 3 1 3 0 1 3 3 1 3
3 3 1 3 3 0 3 3 1 3 3
`;

map=`
4 4 2 4 4
3 3 1 3 3
1 3 3 1 3
3 4 3 3 4
3 3 1 3 3
1 3 3 1 3
3 3 1 3 3
`;
map = `
4 4 2 4 4 0 0 4 4 2 4 4
3 3 1 3 3 0 0 3 3 1 3 3
1 3 3 1 3 0 0 1 3 3 1 3
3 4 3 3 4 0 0 3 4 3 3 4
3 3 1 3 3 0 0 3 3 1 3 3
1 3 3 1 3 0 0 1 3 3 1 3
3 3 1 3 3 0 0 3 3 1 3 3
`;

map=`
4 4 2 4 4
3 3 1 3 3
1 3 3 1 3
3 4 3 3 4
3 3 1 3 3
1 3 3 1 3
3 3 1 3 2
3 3 1 3 3
`;

map = `
4 4 2 4 4 
3 3 1 3 3 
1 3 3 1 3 
3 4 3 3 4 
`;
// ===highest-16 time-45===
// ===g_times-388 ===
map = `
4 4 2 4 4 0 0 4 4 2 4 4
3 3 1 3 3 0 0 3 3 1 3 3
1 3 3 1 3 0 0 1 3 3 1 3
3 4 3 3 4 0 0 3 4 3 3 4
`;
// ==highest-32 time-2648===
// ===g_times-150541 ===
    let tiles = readMap(map);
    print(tiles);

    let t_begin = new Date().getTime();

    let highest = search(tiles);

    let t_end = new Date().getTime();
    let t_duration = t_end - t_begin;

    for (let e of g_bestSwaps) {
        console.log(`\n${e.r1},${e.c1} - ${e.r2},${e.c2}`);
        result = trySwap(tiles, e.r1, e.c1, e.r2, e.c2);
        tiles = result.tiles;
        print(tiles);
    }
    console.log(`===highest-${highest} time-${t_duration}===`);
    console.log(`===g_times-${g_times} ===`);
    
}

function init() {
    g_states = new Map();
    g_maps = new Map();
    g_highest = 0;
    g_score = 0;
    g_swaps = [];
    g_bestSwaps = [];
    g_times = 0;
}

function readMap(map) {
    map = map.trim();
    let tiles = [[]];
    let s = map.split('\n')
    for (let i in s) {
        s[i] = s[i].trim();
        let row = s[i].split(' ');
        tiles[i] = [];
        for (let j in row)
            tiles[i][j] = parseInt(row[j]);
    }
    return tiles;
}

function same(t1, t2) {
    let rows = t1.length,
        cols = t1[0].length;
    for (var i = 0; i < rows; i++)
        for (var j = 0; j < cols - 1; j++) {
            if (t1[i][j] != t2[i][j])
                return false;
        }
    return true;
}

function search(tiles) {
    // print(tiles);

    let hashCode = hash(tiles);
    if (g_states.has(hashCode))
        return g_states.get(hashCode);

    g_times += 1;

    //find valid swap
    let rows = tiles.length,
        cols = tiles[0].length;
    let higest = 0;
    for (var i = 0; i < rows; i++)
        for (var j = 0; j < cols - 1; j++) {
            if (tiles[i][j] == EMPTY || tiles[i][j + 1] == EMPTY || tiles[i][j] == tiles[i][j + 1]) {
                continue;
            }
            let result = trySwap(tiles, i, j, i, j + 1);
            if (result.score == 0) {
                continue;
            }

            g_swaps.push({ r1: i, c1: j, r2: i, c2: j + 1 });
            g_score += result.score;

            let sum = result.score + search(result.tiles);
            if (sum > higest) {
                higest = sum;
            }

            if (g_score > g_highest) {
                g_bestSwaps = g_swaps.slice();
                g_highest = g_score;
            }
            g_swaps.pop();
            g_score -= result.score;


        }
    for (var i = 0; i < rows - 1; i++)
        for (var j = 0; j < cols; j++) {
            if (tiles[i][j] == EMPTY || tiles[i + 1][j] == EMPTY || tiles[i][j] == tiles[i + 1][j]) {
                continue;
            }
            let result = trySwap(tiles, i, j, i + 1, j);
            if (result.score == 0) {
                continue;
            }

            g_swaps.push({ r1: i, c1: j, r2: i + 1, c2: j });
            g_score += result.score;

            let sum = result.score + search(result.tiles);
            if (sum > higest) {
                higest = sum;
            }

            if (g_score > g_highest) {
                g_bestSwaps = g_swaps.slice();
                g_highest = g_score;
            }
            g_swaps.pop();
            g_score -= result.score;

        }
    // record the highest score can obtained in this state
    g_states.set(hash(tiles), higest);
    // g_maps.set(hash(tiles), tiles);
    return higest;
}

function findSwap() {

}


function hash(tiles) {
    let rows = tiles.length,
        cols = tiles[0].length;
    let mask = 0xffffffff;
    let result = 1;
    for (var i = 0; i < rows; i++)
        for (var j = 0; j < cols; j++)
            result = (result * 131 + tiles[i][j]) & mask;
    return result;
}

function print(tiles) {
    console.log("");
    let rows = tiles.length,
        cols = tiles[0].length;
    for (var i = 0; i < rows; i++) {
        var s = ''
        for (var j = 0; j < cols; j++) {
            s += tiles[i][j] + ' '
        }
        console.log(s)
    }
}

function copy(tiles) {
    let rows = tiles.length,
        cols = tiles[0].length;
    let copy = new Array(rows);
    for (var i = 0; i < rows; i++) {
        copy[i] = new Array(cols);
        for (var j = 0; j < cols; j++)
            copy[i][j] = tiles[i][j];
    }
    return copy;
}

function trySwap(state, r1, c1, r2, c2) {
    let tiles = copy(state);
    let rows = tiles.length,
        cols = tiles[0].length;
    swap(tiles, r1, c1, r2, c2);
    let score = 0;
    let t1 = findClusters(tiles, { row: r1, col: c1 });
    let t2 = findClusters(tiles, { row: r2, col: c2 });
    let clusters = t1.concat(t2);

    // find clusters
    while (clusters.length != 0) {
        score += eliminateClusters(tiles, clusters);
        // print(tiles);
        fallDown(tiles);
        // print(tiles);
        clusters = findClusters(tiles);
    }
    return { tiles, score: score };
}


function swap(tiles, r1, c1, r2, c2) {
    let t = tiles[r1][c1];
    tiles[r1][c1] = tiles[r2][c2];
    tiles[r2][c2] = t;
}


function eliminateClusters(tiles, clusters) {
    let score = 0;
    clusters.forEach(e => {
        // eliminate clusters
        if (e.isHorizontal) {
            let row = e.row;
            let end = e.col + e.length;
            for (let col = e.col; col < end; col++) {
                tiles[row][col] = EMPTY;
            }
        } else {
            let col = e.col;
            let end = e.row + e.length;
            for (let row = e.row; row < end; row++) {
                tiles[row][col] = EMPTY;
            }
        }
        // add scores
        score += SCORES[e.length];
    })
    return score;
}

function fallDown(tiles) {
    let rows = tiles.length,
        cols = tiles[0].length;
    for (let col = 0; col < cols; col++) {
        let bottom = rows - 1;
        let row = bottom;
        while (true) {
            while (row >= 0 && tiles[row][col] == EMPTY)
                row--;
            if (row < 0)
                break;
            swap(tiles, bottom, col, row, col);
            bottom--;
            row--;
        }
    }
}



/**
 * 
 * @param {number} tiles 
 * @param {*} tile Find only the clusters containning this tile.
 */
function findClusters(tiles, tile) {
    let rows = tiles.length,
        cols = tiles[0].length;
    if (tile)
        return findClusterFromTile(tiles, tile);

    let clusters = [];
    // horizontial
    for (let row = 0; row < rows; row++) {
        let curType = tiles[row][0];
        let begin = 0;
        let col = 0;
        while (true) {
            if (col == cols || tiles[row][col] != curType) {
                if (curType != EMPTY && col - begin >= 3)
                    clusters.push({ row: row, col: begin, length: col - begin, isHorizontal: true });
                if (col == cols)
                    break;
                begin = col;
                curType = tiles[row][col];
            }
            col++;
        }
    }

    // vertical
    for (let col = 0; col < cols; col++) {
        let curType = tiles[0][col];
        let begin = 0;
        let row = 0;
        while (true) {
            if (row == rows || tiles[row][col] != curType) {
                if (curType != EMPTY && row - begin >= 3)
                    clusters.push({ row: begin, col: col, length: row - begin, isHorizontal: false });
                if (row == rows)
                    break;
                begin = row;
                curType = tiles[row][col];
            }
            row++;
        }
    }

    return clusters;
}



/**
 * 
 * @param {number} tiles 
 * @param {*} tile Find only the clusters containning this tile.
 */
function findClusterFromTile(tiles, tile) {

    let clusters = [];
    let rows = tiles.length
    let cols = tiles[0].length
    let row = tile.row,
        col = tile.col;
    let type = tiles[row][col];
    if (type == EMPTY)
        return clusters;

    //horizontal
    let left = col,
        right = col + 1;
    while (left > 0 && tiles[row][left - 1] == type) left--;
    while (right < cols && tiles[row][right] == type) right++;
    let hCluster = { row: row, col: left, length: right - left, isHorizontal: true };
    //vertical
    let top = row,
        bottom = row + 1;
    while (top > 0 && tiles[top - 1][col] == type) top--;
    while (bottom < rows && tiles[bottom][col] == type) bottom++;
    let vCluster = { row: top, col: col, length: bottom - top, isHorizontal: false };

    if (hCluster.length >= 3)
        clusters.push(hCluster);
    if (vCluster.length >= 3)
        clusters.push(vCluster);
    return clusters;
}

