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