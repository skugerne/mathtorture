var number1 = {val: null, idstring: null};
var number2 = {val: null, idstring: null};
var unknown = {val: null, idstring: null};
var problems = 200.0;
var floating_score = 0;
var base_score = 0;
var score_drop_interval_ms = 250;
var incremental_score_drop = 5.5 / problems;
var floating_increment = 0.0 / problems;         // could be 500.0 / problems
var floating_wrong_decrement = 100.0 / problems;
var base_increment = 100.0 / problems;



function initPage(){
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return; // Should do nothing if the default action has been cancelled
        }
        
        var handled = false;
        if (event.keyCode !== undefined) {
            // Handle the event with KeyboardEvent.keyCode and set handled true.
            handled = keypressFunc(event.keyCode);
        } else if (event.key !== undefined) {
            // Handle the event with KeyboardEvent.key and set handled true.
            alert("Not supported: event.key");
        } else if (event.keyIdentifier !== undefined) {
            // Handle the event with KeyboardEvent.keyIdentifier and set handled true.
            alert("Not supported: event.keyIdentifier");
        } else {
            alert("Not supported: anything ??");
        }

        if (handled) {
            // Suppress "double action" if event handled
            event.preventDefault();
        }
    }, true);

    setInterval(eatScore,score_drop_interval_ms);
    nextProblem();
};



function assignUnknown(a, b, c){
    var choice = Math.floor(Math.random() * 4 + 1);
    
    if(choice == 1 || choice == 2 || choice == 3){
        number1.idname = '#number1';
        number1.val = a;
        number2.idname = '#number2';
        number2.val = b;
        unknown.idname = '#number3';
        unknown.val = c;
    }else if(choice == 4){
        number1.idname = '#number1';
        number1.val = a;
        unknown.idname = '#number2';
        unknown.val = b;
        number2.idname = '#number3';
        number2.val = c;
    }else if(choice == 5){
        unknown.idname = '#number1';
        unknown.val = a;
        number1.idname = '#number2';
        number1.val = b;
        number2.idname = '#number3';
        number2.val = c;
    }else{
        alert("Invalid random number "+choice+".");
    }
}



function getRandomInt(min, max){
    /*
        Return a random integer in the range, where min is inclusive and max is exclusive.
    */
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}



function getRandomIntForMultiply(){
    /*
        Return a random integer 0-9, and 0-9 multiplied by powers of 10.
    */
    var a = getRandomInt(1,17);
    if(a == 1) a = getRandomInt(1,6);          // re-roll the value 1
    else if(a > 12) a -= 4;                    // 10 => x10, 11 => x100, 12 => x1000
    if(a > 10) a = getRandomInt(1,10) * 10 ** (a-9);
    return a;
}



function nextMultiplicationProblem(){
    var a = getRandomIntForMultiply();
    var b = getRandomIntForMultiply();
    var c = a * b;
    
    $('#op').html("&sdot;");
    assignUnknown(a,b,c);
}



function nextDivisionProblem(){
    var a = getRandomIntForMultiply();
    var b = getRandomIntForMultiply();
    var c = a * b;
    
    $('#op').html(":");
    assignUnknown(c,a,b);
}



function nextAdditionProblem(){
    var a = getRandomInt(1,14);
    if(a < 6){
        a = getRandomInt(1,10); // 1-5 "re-rolls" into the range 1-9
    }
    else if(a > 10){
        a = getRandomInt(1,10) * 10 ** (a-10);
    }
    
    var b = getRandomInt(1,14);
    if(b < 6){
        b = getRandomInt(1,10); // 1-5 "re-rolls" into the range 1-9
    }
    else if(b > 10){
        b = getRandomInt(1,10) * 10 ** (b-10);
    }
    
    var c = a + b;
    
    $('#op').html("+");
    assignUnknown(a,b,c);
}



function nextSubtractionProblem(){
    var a = getRandomInt(1,14);
    if(a > 10){
        a = getRandomInt(1,10) * 10 ** (a-10);
    }
    
    var b = getRandomInt(1,14);
    if(b > 10){
        b = getRandomInt(1,10) * 10 ** (b-10);
    }
    if(b > a){   // ensure non-negative result
        var c = a;
        a = b;
        b = c;
    }
    
    var c = a - b;
    
    $('#op').html("-");
    assignUnknown(a,b,c);
}



function nextProblem(){
    var choice = getRandomInt(1,7);
    
    if(choice == 1 || choice == 2){
        nextMultiplicationProblem();
    }else if(choice == 3 || choice == 4){
        nextDivisionProblem();
    }else if(choice == 5){
        nextAdditionProblem();
    }else if(choice == 6){
        nextSubtractionProblem();
    }else{
        alert("Invalid random number "+choice+".");
    }
    
    sameProblem();
}



function assignColors(){
    var r = Math.floor(Math.random() * 64 + 63);
    var g = Math.floor(Math.random() * (r-16));
    var b = Math.floor(Math.random() * (239-r) + r + 16);
    
    var colors = [r,g,b];
    colors = shuffleList(colors);
    
    r = colors[0];
    g = colors[1];
    b = colors[2];
    
    if(r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255){
        alert("R: "+r+" G: "+g+" B: "+b);
    }
    
    r = toHex(r);
    g = toHex(g);
    b = toHex(b);
    
    var possibleColors = [
        "#"+r+g+b,
        "#"+r+b+g,
        "#"+g+b+r,
        "#"+g+r+b,
        "#"+b+r+g,
        "#"+b+g+r
    ];
    possibleColors = shuffleList(possibleColors);
    
    $('#painbox').css("background-color", possibleColors[0]);
    $('#number1').css("color", possibleColors[1]);
    $('#op').css("color", possibleColors[2]);
    $('#number2').css("color", possibleColors[3]);
    $('#eq').css("color", possibleColors[4]);
    $('#number3').css("color", possibleColors[5]);
}



function sameProblem(){
    assignColors();
    $(number1.idname).html(number1.val);
    $(number2.idname).html(number2.val);
    $(unknown.idname).html("?");
}



function shuffleList(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}



function toHex(d) {
    return ("0"+(Number(d).toString(16))).slice(-2).toUpperCase();
}



function keypressFunc(x){
    var is = $(unknown.idname).html();

    if(x >= 48 && x <= 57){
        // number key pressed: 0 == 48, 1 == 49, etc
        x -= 48;
        
        if (is == "?" || is == "0"){
            is = ""+x;
        }else{
            is += x;
        }
        $(unknown.idname).html(is);
    }else if(x == 8 || x == 46){
        // this is the regular delete key
        is = is.slice(0,-1);
        if(is == ""){ is = "?"; }
        $(unknown.idname).html(is);
    }else if(x == 13){
        // this is the enter key
        var result = Number(is);
        if(unknown.val == result){
            base_score += base_increment;
            floating_score += floating_increment;
            $(unknown.idname).html("&#x263B;");
            if(floating_score + base_score >= 100.0){
                alert("DONE");
            }
            setTimeout(nextProblem,1000);   // show for 1 second
        }else{
            $(unknown.idname).html("&#x26D4;");
            floating_score -= floating_wrong_decrement;
            setTimeout(sameProblem,500);   // show for half second
        }
    }else{
        return false;
    }

    return true;
}



function eatScore(){
    // to be called 4 times per second
    
    floating_score -= incremental_score_drop;
    if(floating_score < 0) floating_score = 0.0;
    
    var baseperc = base_score;
    var floatperc = Math.round(floating_score);
    var remainperc = 100-baseperc-floatperc;
    $('#basescorepart').css("width", ""+baseperc+"%");
    $('#floatscorepart').css("left", ""+baseperc+"%");
    $('#floatscorepart').css("width", ""+floatperc+"%");
    $('#unscorepart').css("left", ""+(baseperc+floatperc)+"%");
    $('#unscorepart').css("width", ""+remainperc+"%");
    
    if(baseperc > 5){
        $('#basescorepart').html(""+baseperc+"% done");
    }else{
        $('#basescorepart').html("&nbsp;");
    }
    
    if(floatperc > 5){
        $('#floatscorepart').html(""+floatperc+"% bonus");
    }else{
        $('#floatscorepart').html("&nbsp;");
    }
    
    if(remainperc > 5){
        $('#unscorepart').html(""+remainperc+"% to do");
    }else{
        $('#unscorepart').html("&nbsp;");
    }
}

