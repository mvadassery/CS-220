// failed(reason: string): void
// A function that takes in a string and returns nothing. It asserts false, prematurly ending the program.
// reason is a string that contains the reason as to why the program failed and was terminated
function failed(reason) {
  console.log(reason);
  assert(false);
}


// Given a state object and an AST of an expression as arguments,
// interpExpression returns the result of the expression (number or boolean)
// interpExpression(state: State, e: Expr): number | boolean
// interpExpression has a switch statement that checks the kind of expression e is.
function interpExpression(state, e) {
  switch (e.kind) {
    case "number": { // if e is a number, then return the value of it
      return e.value;
  }
    case "boolean": { // if e is a boolean, then return its value - either true or false
      return e.value;
  }
  case "operator" : { // if e is an operator, then enter a new switch statement to check exactly what operator e is
    switch (e.op) { // depending on which operator is passed, evaluate (a helper function) is called. The result of calling evaluate will be returned
      case "+" : { return evaluate(interpExpression(state, e.e1), interpExpression(state, e.e2), "+"); }
      case "-" : { return evaluate(interpExpression(state, e.e1), interpExpression(state, e.e2), "-"); }
      case "*" : { return evaluate(interpExpression(state, e.e1), interpExpression(state, e.e2), "*"); }
      case "/" : { return evaluate(interpExpression(state, e.e1), interpExpression(state, e.e2), "/"); }

      case "&&" : { return evaluate(interpExpression(state, e.e1), interpExpression(state, e.e2), "&&"); }
      case "||" : { return evaluate(interpExpression(state, e.e1), interpExpression(state, e.e2), "||"); }
      case "<" : { return evaluate(interpExpression(state, e.e1), interpExpression(state, e.e2), "<"); }
      case ">" : { return evaluate(interpExpression(state, e.e1), interpExpression(state, e.e2), ">"); }
      case "===" : { return evaluate(interpExpression(state, e.e1), interpExpression(state, e.e2), "==="); }

    default: { failed("Invalid operator"); } // if the operator passed is none of the aforementioned operators, then the user has inputted an invalid operator. failed

    }
  }
  case "variable" : { // if e is a variable, get the property corresponding to its name, and then its value
    return lib220.getProperty(state, e.name).value;
  }
  default: { failed("Invalid"); } // if e is none of the aforementioned kinds, then it is invalid. failed

  }
}

// evaluate(num1 : number | boolean, num2 : number | boolean, op: string) : number | boolean
// evaluate is a helper function for interpExpression. First, it checks to see if num1 and num2 are of the same type, as you can't perform operations on one boolean and one number
// next, it checks to see if num1 is either a number of boolean, as those are the only two types that these operations can be performed on
function evaluate (num1, num2, op) {
  if (typeof(num1) !== typeof(num2)) { return failed("Type mismatch. You are trying to perform operations on two different types."); }
  if (typeof(num1) !== "number" && typeof(num1) !== "boolean") {
    return failed("Type mismatch. You are trying to perform operations on incompatible types.");
  }

  switch (op) { //depending on what the operator is, the case performs a different function
    case "+" : { return (num1 + num2); }
    case "-" : { return (num1 - num2); }
    case "*" : { return (num1 * num2); }
    case "/" : { return (num1 / num2); }

    case "&&" : { return (num1 && num2); }
    case "||" : { return (num1 || num2);; }
    case "<" : { return (num1 < num2); }
    case ">" : { return (num1 > num2); }
    case "===" : { return (num1 === num2); }
    
    default: { failed("Invalid operator"); }
  }

}

// Given a state object and an AST of a statement,
// interpStatement updates the state object and returns nothing
// interpStatement(state: State, p: Stmt): void
 function interpStatement (state, p) {
  switch(p.kind) { // depending on what kind of statement it is, let the cases deal with it
    case 'let' : {
      let val = interpExpression(state, p.expression); //call interpExpression. The resulting value is stored in val
      if (lib220.getProperty(state, p.name).found) { // if the name of the statement is found in the state...
        if (lib220.getProperty(state, 'insert').found) { // insert is a string array. if it is is found in the state...
          lib220.getProperty(state, 'insert').value.push(p.name); // ...then within the array of insert, push the name of p into it
        } else { // Otherwise, if the array is not found, call failed. this instance would be a redeclaration of a variable, which is not allowed
          failed("Redeclaration of a variable. This will not work");
        }
      }
      lib220.setProperty(state, p.name, val);
      break;
    }

    case 'assignment' : {
      if (lib220.getProperty(state, p.name).found === false) { // if the p's name is not present in the state, then it was not declared. Assignment cannot happen for an undeclared variable
        failed("Variable not already declared");
      }
      let val = interpExpression(state, p.expression);
      lib220.setProperty(state, p.name, val);
      break;
    }

    case 'if' : {
      let val = interpExpression(state, p.test); // calling interpExpression will return either true or false
      if (val) { // if true, call interpBlock
        interpBlock(state, p.truePart);
      } else {
        interpBlock(state, p.falsePart);
      }
      break;
    }

    case 'while' : {
      while (interpExpression(state, p.test)) { // while interpExpression returns true
        interpBlock(state, p.body);
      }
      break;
    }
    case 'print' : { //print the result of interpExpression
      console.log(interpExpression(state, p.expression));
      break;
    }
    default: {
      return failed("No such command exists");
      
    }
  }
 }

 // interpBlock(state: State, p: Stmt[]): void
function interpBlock(state, p) {
  let NS = {}; //create a new, empty state
  let out = Object.keys(state); //returns an array of the names of the properties within state
  out.forEach(x => lib220.setProperty(NS, x, lib220.getProperty(state, x).value)); // for each property within the array out, set the value of each in the NS to its value in state
  if (lib220.getProperty(NS, 'insert').found === false) { //if the string array insert is not found in NS, then create one
    lib220.setProperty(NS, 'insert', []);
  }
  p.forEach(x => interpStatement(NS, x)); // call interpStatement for each statement in p
  let arr = [];
  if (lib220.getProperty(NS, 'insert').value.length !== 0) {
    arr = lib220.getProperty(NS, 'insert').value;
  }
  out.forEach(function(e) 
  { if (arr.indexOf(e) === -1) { lib220.setProperty(state, e, lib220.getProperty(NS, e).value);}} );
}


// Given the AST of a program,
// interpProgram returns the final state of the program
// interpProgram(p: Stmt[]): State
function interpProgram (p) {
  if (p.length < 1) { return failed("Error. No arguments given."); } // if the length of p is 0, then no arguments were given
  let newState = {};
  p.forEach(x => interpStatement(newState, x));
  return newState;
}

test("addition 1", function() {
  let y = interpExpression({}, parser.parseExpression("5 + 2").value);
  assert( y === 7);
});

test("addition 2", function() {
  let z = interpExpression({x: 20, y: 30}, parser.parseExpression("x + y").value);
  assert(z === 50);
});

test("addition 3", function() {
  let z = interpExpression({x: 20}, parser.parseExpression("x + 5").value);
  assert(z === 25);
});

test("subtraction 1", function() {
  let z = interpExpression({}, parser.parseExpression("5 - 10").value);
  assert(z === -5);
});

test("subtraction 2", function() {
  let z = interpExpression({x: 10}, parser.parseExpression("x - 10").value);
  assert(z === 0);
});

test("subtraction 3", function() {
  let z = interpExpression({x: 10, y: 11}, parser.parseExpression("y - x").value);
  assert(z === 1);
  let a = interpExpression({x: 10, y: 11}, parser.parseExpression("y > x").value);
  assert(a);
  let b = interpExpression({x: 5, y: 11}, parser.parseExpression("x > y").value);
  assert(b === false);


});

test("multiplication", function() {
  let z = interpExpression({x: 10}, parser.parseExpression("x * 4").value);
  assert(z === 40);
});

test("division", function() {
  let z = interpExpression({x: 10}, parser.parseExpression("x / 2").value);
  assert(z === 5);
});

test("logic operations", function() {
  let a = interpExpression({x: true, y: false}, parser.parseExpression("x && y").value);
  assert(a === false);
  let b = interpExpression({x: true, y: false}, parser.parseExpression("x || y").value);
  assert(b === true);
  let c = interpExpression({x: true, y: false}, parser.parseExpression("x === y").value);
  assert(c === false);
});

test("assignment", function() {
  let a = interpProgram(parser.parseProgram("let x = 10; x = 1; let y = 5; y = y * 5;").value);
  assert(a.x === 1);
  assert(a.y === 25);
});

test("if", function() {
  let a = interpProgram(parser.parseProgram("let x = 10; x = 1; let y = 5; if(y>0){x = 20;}else{x = 1;}").value);
  assert(a.x === 20);
  assert(a.y === 5);
});

test("while", function() {
  let a = interpProgram(parser.parseProgram("let x = 1; while(x < 9) {x = x + 2;}").value);
  assert(a.x === 9);
});

test("mixed", function() {
  let z = interpExpression({x: 10}, parser.parseExpression("x + 10 / 2 - 1").value);
  assert(z === 14);
  let a = interpExpression({x: 10}, parser.parseExpression("x + 2 * 6").value);
  assert(a === 22);
  let b = interpExpression({x: 10}, parser.parseExpression("x - 3 * 5").value);
  assert(b === -5);
  let c = interpProgram(parser.parseProgram("let x=2; let y=3; while(x<20){x = x*y;}").value);
  assert(c.x===54);
 });
