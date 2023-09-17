var number1 = {val: null, idstring: null, fracmult: null};
var number2 = {val: null, idstring: null, fracmult: null};
var unknown = {val: null, idstring: null};
var problems = 100.0;
var floating_score = 0;
var base_score = 0;
var score_drop_interval_ms = 250;                // rate that bonus decays
var incremental_score_drop = 5.5 / problems;
var floating_increment = 0.0 / problems;         // suggested bonus: 500.0 / problems
var floating_wrong_decrement = 100.0 / problems;
var base_increment = 100.0 / problems;
var multiply_with_decimals = true;
var divide_with_decimals = true;
var multiply_with_fractions = true;
var divide_with_fractions = true;



function initPage(){
    window.addEventListener("keydown", function (event) {
        if (event.defaultPrevented) {
            return; // Should do nothing if the default action has been cancelled
        }

        handled = keypressFunc(event.key);

        if (handled) {
            // Suppress "double action" if event handled
            event.preventDefault();
        }
    }, true);

    setInterval(eatScore,score_drop_interval_ms);
    nextProblem();
};



function getRandomInt(min, max){
    /*
        Return a random integer in the range, where min is inclusive and max is exclusive.
    */
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}



function assignUnknown(a, b, c, fracmult1, fracmult2){
    /*
    The unknown (shown as '?') can be in any of the three positions.
    */
    var choice = getRandomInt(1,6);
    
    if(choice == 1 || choice == 2 || choice == 3){   // the unknown is third (alone on the right)
        number1.idname = '#number1';
        number1.val = a;
        number2.idname = '#number2';
        number2.val = b;
        unknown.idname = '#number3';
        unknown.val = c;
    }else if(choice == 4){                  // the unknown is second
        number1.idname = '#number1';
        number1.val = a;
        unknown.idname = '#number2';
        unknown.val = b;
        number2.idname = '#number3';
        number2.val = c;
    }else if(choice == 5){                  // the unknown is first
        unknown.idname = '#number1';
        unknown.val = a;
        number1.idname = '#number2';
        number1.val = b;
        number2.idname = '#number3';
        number2.val = c;
    }else{
        alert("Invalid random number "+choice+".");
    }

    // store any relevant fraction inflations
    number1.fracmult = fracmult1;
    number2.fracmult = fracmult2;
}



function getRandomForMultiply(with_decimals){
    /*
        Return a random Decimal object 0-9, and 0-9 multiplied by powers of 10.
    */

    var baseval = Decimal(getRandomInt(1,10));
    if(with_decimals){
        var b = getRandomInt(1,9);   // 50% chance of some power of 10 (inc less than 1)
        if(b != 3 && b < 6){
            // a *= 10 ** (3-b)
            // so for b == 4, value is divided by 10
            //        b == 5, value is divided by 100
            //        b == 1, value is multiplied by 100
            //        b == 2, value is multiplied by 10
            baseval = baseval.mul(10 ** (3-b));
        }
    }else{
        var b = getRandomInt(1,7);   // 50% chance of some power of 10
        if(b < 4){
            //        b == 1, value is multiplied by 1000
            //        b == 2, value is multiplied by 100
            //        b == 3, value is multiplied by 10
            baseval = baseval.mul(10 ** (4-b));
        }
    }

    return baseval;
}



function nextMultiOrDivideProblem(with_decimals, with_fractions){
    /*
        Choose the values for multiplication of division, which are set up the same way.
    */

    if(getRandomInt(1,3) == 1 || !with_fractions){
        // the case without fractions (but maybe numbers less than 1)

        var a = getRandomForMultiply(with_decimals);
        var b = getRandomForMultiply(with_decimals);
        var c = a.mul(b);
        return [a,b,c,1,1];
    }

    var a = Fraction(getRandomInt(1,6), getRandomInt(1,6))
    var b = Fraction(getRandomInt(1,6), getRandomInt(1,6))
    var c = a.mul(b);
    var choice = getRandomInt(1,4);
    if(choice == 1){
        var [fracmult1,fracmult2] = [getRandomInt(2,6), 1];
    }else if(choice == 2){
        var [fracmult1,fracmult2] = [1, getRandomInt(2,6)];
    }else{
        // scale numbers of both fractions by 2, 3 or 4
        choice = getRandomInt(2,5);
        var [fracmult1,fracmult2] = [choice, choice];
    }
    return [a,b,c,fracmult1,fracmult2];
}



function nextMultiplicationProblem(){
    var [a,b,c,fm1,fm2] = nextMultiOrDivideProblem(multiply_with_decimals, multiply_with_decimals);
    $('#op').html("&sdot;");
    assignUnknown(a,b,c,fm1,fm2);
}



function nextDivisionProblem(){
    var [a,b,c,fm1,fm2] = nextMultiOrDivideProblem(divide_with_decimals, divide_with_fractions);
    $('#op').html(":");
    assignUnknown(c,a,b,fm1,fm2);
}



function nextAdditionProblem(){
    var a = getRandomInt(1,14);
    if(a < 6){
        a = getRandomInt(1,10); // 1-5 "re-rolls" into the range 1-9
    }
    else if(a > 10){
        a = getRandomInt(1,10) * (10 ** (a-10));
    }

    var b = getRandomInt(1,14);
    if(b < 6){
        b = getRandomInt(1,10); // 1-5 "re-rolls" into the range 1-9
    }
    else if(b > 10){
        b = getRandomInt(1,10) * (10 ** (b-10));
    }

    a = Decimal(a)
    b = Decimal(b)
    var c = a.add(b);

    $('#op').html("+");
    assignUnknown(a,b,c,1,1);
}



function nextSubtractionProblem(){
    var a = getRandomInt(1,14);
    if(a > 10){
        a = getRandomInt(1,10) * (10 ** (a-10));
    }

    var b = getRandomInt(1,14);
    if(b > 10){
        b = getRandomInt(1,10) * (10 ** (b-10));
    }
    if(b > a){   // ensure non-negative result
        var c = a;
        a = b;
        b = c;
    }

    a = Decimal(a)
    b = Decimal(b)
    var c = a.sub(b);

    $('#op').html("-");
    assignUnknown(a,b,c,1,1);
}



function nextProblem(){
    /*
        Set up the next problem and get it displayed.
    */

    var choice = getRandomInt(1,9);

    if(choice < 5){
        nextMultiplicationProblem();
    }else if(choice == 5 || choice == 6){
        nextDivisionProblem();
    }else if(choice == 7){
        nextAdditionProblem();
    }else if(choice == 8){
        nextSubtractionProblem();
    }else{
        alert("Invalid random number "+choice+".");
    }

    displayTheProblem();
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



function numberToHtml(numinfo){
    /*
        Given a Decimal or Fraction, convert it into a suitable HTML representation.
    */

    var val = numinfo.val;
    var fracmult = numinfo.fracmult;

    if(val instanceof Decimal || (val.d * fracmult) == 1){
        return val.toString();
    }

    return `
        <math display="inline">
            <mfrac>
                <mrow>
                    <mn>${val.n * fracmult}</mn>
                </mrow>
                <mrow>
                    <mn>${val.d * fracmult}</mn>
                </mrow>
            </mfrac>
        </math>
    `;
}



function displayTheProblem(){
    /*
        Show the values (either the same as last time, or new ones).
    */

    assignColors();
    $(number1.idname).html(numberToHtml(number1));
    $(number2.idname).html(numberToHtml(number2));
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

    var numkey = Number(x);
    if(x == '/' || !(isNaN(numkey) || x === null || x === ' ')){
        // number key pressed
        if (is == "?" || is == "0"){
            is = ""+x;
        }else{
            is += x;
        }
        $(unknown.idname).html(is);
    }else if(x == 'Backspace'){
        // this is the regular delete key
        is = is.slice(0,-1);
        if(is == ""){ is = "?"; }
        $(unknown.idname).html(is);
    }else if(x == '.'){
        if(is == "?")
            $(unknown.idname).html("0.");
        else if(is.indexOf(".") == -1)
            $(unknown.idname).html(is+".");
    }else if(x == 'Enter'){
        // this is the enter key
        var result = Number(is);
        var thecheck = (unknown.val == result);
        if(isNaN(result)){
            result = Fraction(is);
            console.log("Interpreted string '"+is+"' as '"+result.toString()+"'.");
            if(unknown.val instanceof Decimal)
                thecheck = (Fraction(unknown.val.toFraction()).equals(result));
            else
                thecheck = (unknown.val.equals(result));
        }
        if(thecheck){
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
            setTimeout(displayTheProblem,500);   // show for half second
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

