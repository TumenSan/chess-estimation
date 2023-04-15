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