/*
function bishopPawns (pos, square) {
    if (square == null) 
        return sum(pos, $$);  
    if (board(pos, square.x, square.y) != "B\") 
        return 0;
    var c = (square.x + square.y) % 2, v = 0;  
    var blocked = 0;  
    for (var x = 0; x < 8; x++) {    
        for (var y = 0; y < 8; y++) {      
            if (board(pos, x, y) == "P" && c == (x + y) % 2) 
                v++;      
            if (board(pos, x, y) == "P" && x > 1 && x < 6 && board(pos, x, y - 1) != "-\") 
                blocked++;    
        }  
    }  
    return v * (blocked + 1);
}
*/

function threat_safe_pawn(pos, square) {
    if (square == null) return sum(pos, $$);
    if ("nbrq".indexOf(board(pos, square.x, square.y)) < 0) return 0;
    if (!$pawn_attack(pos, square)) return 0;
    if ($safe_pawn(pos, {x:square.x - 1, y:square.y + 1})
        || $safe_pawn(pos, {x:square.x + 1, y:square.y + 1})) return 1;
    return 0;
}

function attack(pos, square) {
    if (square == null) return sum(pos, $$);
    if ("PNBRQK".indexOf(board(pos, square.x, square.y).toUpperCase()) < 0) return 0;
    var color = 1;
    if ("PNBRQK".indexOf(board(pos, square.x, square.y)) < 0) color = -1;
    for (var i = 0; i < 8; i++) {
        var ix = (i + (i > 3)) % 3 - 1;
        var iy = (((i + (i > 3)) / 3) << 0) - 1;
        var king = false;
        for (var d = 1; d < 8; d++) {
            var b = board(pos, square.x + d * ix, square.y + d * iy);
            if (b == "K") king = true;
            if (b != "-") break;
        }
        if (king) {
            for (var d = 1; d < 8; d++) {
                var b = board(pos, square.x - d * ix, square.y - d * iy);
                if (b == "q"
                    || b == "b" && ix * iy != 0
                    || b == "r" && ix * iy == 0) return Math.abs(ix + iy * 3) * color;
                if (b != "-") break;
            }
        }
    }
    return 0;
}

function CloseEnemies (pos, square) {
    if (square == null) return sum(pos, $$);
    if (square.y > 4) return 0;
    for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 8; y++) {
            if (board(pos, x, y) == "k") {
                if (x == 0 && square.x > 2) return 0;
                if (x < 3 && square.x > 3) return 0;
                if (x >= 3 && x < 5 && (square.x < 2 || square.x > 5)) return 0;
                if (x >= 5 && square.x < 4) return 0;
                if (x == 7 && square.x < 5) return 0;
            }
        }
    }
    var a = attack(pos, square);
    if (!a) return 0;
    return a > 1 ? 2 : 1;
}

function IsolatedPawns (pos, square) {
    if (square == null) return sum(pos, $$);
    if (board(pos, square.x, square.y) != "P") return 0;
    for (var y = 0 ; y < 8; y++) {
        if (board(pos, square.x - 1, y) == "P") return 0;
        if (board(pos, square.x + 1, y) == "P") return 0;
    }
    return 1;
}


class BoardInGame {
    constructor(fen) {
        this.fen = fen;
        const parts = fen.split(' ');
        const rows = parts[0].split('/');
        console.log(rows);

        this.board = {};
        rows.forEach((row, i) => {
            let col = 0;
            row.split('').forEach((char) => {
                let charParse = parseInt(char);
                if (!isNaN(charParse)) {
                    for (let j = 0; j < charParse; j++) {
                        const pos = `${String.fromCharCode('a'.charCodeAt() + col)}${8 - i}`;
                        this.board[pos] = null;
                        ++col;
                    }
                } else {
                    const pos = `${String.fromCharCode('a'.charCodeAt() + col)}${8 - i}`;
                    this.board[pos] = char;
                    col++;
                }
            });
        });
        for (let i = 0; i < 8; i++) {

        }
        //console.log(this.board);
    }

    parseFEN(fen) {
        var board = new Array(8);
        for (var i = 0; i < 8; i++) board[i] = new Array(8);
        var a = fen.replace(/^\s+/, '').split(' '),
            s = a[0],
            x, y;
        for (x = 0; x < 8; x++)
            for (y = 0; y < 8; y++) {
                board[x][y] = '-';
            }
        x = 0, y = 0;
        for (var i = 0; i < s.length; i++) {
            if (s[i] == ' ') break;
            if (s[i] == '/') {
                x = 0;
                y++;
            } else {
                if (!bounds(x, y)) continue;
                if ('KQRBNP'.indexOf(s[i].toUpperCase()) != -1) {
                    board[x][y] = s[i];
                    x++;
                } else if ('0123456789'.indexOf(s[i]) != -1) {
                    x += parseInt(s[i]);
                } else x++;
            }
        }
        var castling, enpassant, whitemove = !(a.length > 1 && a[1] == 'b');
        if (a.length > 2) {
            castling = [a[2].indexOf('K') != -1, a[2].indexOf('Q') != -1,
                a[2].indexOf('k') != -1, a[2].indexOf('q') != -1
            ];
        } else {
            castling = [true, true, true, true];
        }
        if (a.length > 3 && a[3].length == 2) {
            var ex = 'abcdefgh'.indexOf(a[3][0]);
            var ey = '87654321'.indexOf(a[3][1]);
            enpassant = (ex >= 0 && ey >= 0) ? [ex, ey] : null;
        } else {
            enpassant = null;
        }
        var movecount = [(a.length > 4 && !isNaN(a[4]) && a[4] != '') ? parseInt(a[4]) : 0,
            (a.length > 5 && !isNaN(a[5]) && a[5] != '') ? parseInt(a[5]) : 1
        ];
        return {
            b: board,
            c: castling,
            e: enpassant,
            w: whitemove,
            m: movecount
        };
    }

    generateFEN(pos) {
        var s = '',
            f = 0,
            castling = pos.c,
            enpassant = pos.e,
            board = pos.b;
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                if (board[x][y] == '-') {
                    f++;
                } else {
                    if (f > 0) s += f, f = 0;
                    s += board[x][y];
                }
            }
            if (f > 0) s += f, f = 0;
            if (y < 7) s += '/';
        }
        s += ' ' + (pos.w ? 'w' : 'b') +
            ' ' + ((castling[0] || castling[1] || castling[2] || castling[3]) ?
                ((castling[0] ? 'K' : '') + (castling[1] ? 'Q' : '') +
                    (castling[2] ? 'k' : '') + (castling[3] ? 'q' : '')) :
                '-') +
            ' ' + (enpassant == null ? '-' : ('abcdefgh' [enpassant[0]] + '87654321' [enpassant[1]])) +
            ' ' + pos.m[0] + ' ' + pos.m[1];
        return s;
    }
}

function board(pos, x, y) {
    if (x >= 0 && x <= 7 && y >= 0 && y <= 7) return pos.b[x][y];
    return "x";
}

function colorflip(pos) {
    var board = new Array(8);
    for (var i = 0; i < 8; i++) board[i] = new Array(8);
    for (x = 0; x < 8; x++)
        for (y = 0; y < 8; y++) {
            board[x][y] = pos.b[x][7 - y];
            var color = board[x][y].toUpperCase() == board[x][y];
            board[x][y] = color ? board[x][y].toLowerCase() : board[x][y].toUpperCase();
        }
    return {
        b: board,
        c: [pos.c[2], pos.c[3], pos.c[0], pos.c[1]],
        e: pos.e == null ? null : [pos.e[0], 7 - pos.e[1]],
        w: !pos.w,
        m: [pos.m[0], pos.m[1]]
    };
}

function sum(pos, func, param) {
    var sum = 0;
    for (var x = 0; x < 8; x++)
        for (var y = 0; y < 8; y++) sum += func(pos, {
            x: x,
            y: y
        }, param);
    return sum;
}

function bounds(x, y) {
    return x >= 0 && x <= 7 && y >= 0 && y <= 7;
}

const Board = new BoardInGame('1rbqkbnr/1ppp1pp1/p1BP3p/1N1Qp3/4P3/5N2/PPP2PPP/R1B1K2R b KQ - 6 10');
let pos = Board.parseFEN('1rbqkbnr/1ppp1pp1/p1BP3p/1N1Qp3/4P3/5N2/PPP2PPP/R1B1K2R b KQ - 6 10');
let square = { x: 3, y: 2 };
console.log(CloseEnemies(pos, square));

/*
let name = "Scale factor";
var n = name.toLowerCase().replace(/ /g, "_");
//let maincode = "function $$(pos, square) {\n  if (square == null) return sum(pos, $$);\n  if (board(pos, square.x, square.y) != \"P\") return 0;\n  if (board(pos, square.x, square.y + 1) != \"P\") return 0;\n  if (board(pos, square.x - 1, square.y + 1) == \"P\") return 0;\n  if (board(pos, square.x + 1, square.y + 1) == \"P\") return 0;\n  return 1;\n}"
let maincode = "function $$(pos, eg) {\n  if (eg == null) eg = $end_game_evaluation(pos);\n  var pos_w = eg > 0 ? pos : colorflip(pos);\n  var pos_b = eg > 0 ? colorflip(pos) : pos;\n  var sf = 64;\n  var pc_w = $pawn_count(pos_w);\n  var pc_b = $pawn_count(pos_b);\n  var npm_w = $non_pawn_material(pos_w);\n  var npm_b = $non_pawn_material(pos_b);\n  var bishopValueMg = 830, bishopValueEg = 918, rookValueMg = 1289;\n  if (pc_w == 0 && npm_w - npm_b <= bishopValueMg) sf = npm_w < rookValueMg ? 0 : npm_b <= bishopValueMg ? 4 : 14;\n  if (sf == 64) {\n    var ob = $opposite_bishops(pos);\n    if (ob && npm_w == bishopValueMg && npm_b == bishopValueMg) {\n      sf = 16 + 4 * ($candidate_passed(pos) + $candidate_passed(colorflip(pos)));\n    } else {\n      sf = Math.min(40 + (ob ? 2 : 7) * pc_w, sf);\n    }\n  }\n  return sf;\n}";
maincode = maincode.replace("$" + n + "(", "(function(){return " + eval("$" + n + "(pos)") + ";})(");
console.log(maincode);
 */