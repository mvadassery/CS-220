function memo0(f) {
  let r = {evaluated: false};
  return {get: function() {
    if (!r.evaluated) {
      r = {evaluated: true, v:f()}
    }
    return r.v;
    }
  }
}

// snode<T>(head: T, next: Memo<Stream<T>>): Stream<T>
// snode represents a node of the stream. it takes in the data it holds and points to the next node in the stream
function snode(data, next) {
  return {isEmpty: () => false, //if the snode contains data, then it is not empty
          head: () => data,
          tail: next.get,
          toString: () => "snode(" + head.toString() + "," + tail.toString() + ")"}
}
// sempty: Stream<T>
// an empty node
let sempty = {
  isEmpty: () => true
};

//addSeries(s: Stream<T>, t: Stream<T>): Stream<T>
// takes two streams of coefficients for the series s(x) and t(x) and returns the stream of coefficients for the sum s(x) + t(x).
function addSeries (s, t) {
  if (s.isEmpty() && t.isEmpty()) { //if both streams are empty, return the empty node
    return sempty;
  }
  if (s.isEmpty()) { //if s is empty, return the empty node
    return sempty;
  }
  if (t.isEmpty()) { //if t is empty, return the empty node
    return sempty;
  }
  //add the data of the first node of s and the first node of t. then, when pointing to the next node, invoke a recursive call that will call the next node in the series and apple addSeries to them
  return snode(s.head() + t.head(), memo0(() => addSeries(s.tail(), t.tail())));
}

//prodSeries(s: Stream<T>, t: Stream<T>): Stream<T>
// takes two streams of coefficients for the series s(x) and t(x) and returns the stream of coefficients for the product s(x) ⋅ t(x).
function prodSeries (s, t) {
    if (s.isEmpty() && t.isEmpty()) { //if both streams are empty, return the empty node
    return sempty;
  }
  if (s.isEmpty() || t.isEmpty()) { //if either s or t are empty, return the empty node
    return sempty;
  }
  // call addSeries to add the resulting stream of prodHelper and the recursive call together
  return addSeries(prodHelper(t, s.head()), snode(0, memo0(() => prodSeries(s.tail(), t)))); 
}

//prodHelper(s: Stream<T>, n: number): Stream<T>
// prodHelper is a helper function to prodSeries
function prodHelper(stream, n) {
  if (stream.isEmpty()) {
    return sempty;
  }
  // multiply the value of n with the first element of the stream. create a new stream that contains all elements of stream now multiplied by n
  return snode(n * stream.head(), memo0(() => prodHelper(stream.tail(), n)));
}

//derivSeries(s: Stream<T>): Stream<T>
//takes a stream of coefficients for the series s(x), and returns a stream of coefficients for the derivative s’(x).
function derivSeries (s) {
  if (s.isEmpty()) {
    return sempty;
  }
  let n = 0;
  return derivHelper(s, n);
}

//derivSeries(s: Stream<T>, n: number): Stream<T>
// helper for derivSeries
function derivHelper(s, n) {
  if (s.isEmpty()) {
    return sempty;
  }
  //when finding the derivative, you multiply the constant with the degree of the variable's power. in a polynomial with no skipped terms, that would mean that the degree of the order keeps increasing
  //therefore, multiply the constant with the increasing value of n to find the constant of the derived polynomial sequence
  console.log(s.head());
  return snode(s.head() * n, memo0(() => derivHelper(s.tail(), (n+1))));
}

//coeff(s: Stream<T>, n: number): number[]
//takes a stream of coefficients for the series s(x) and a natural number n, and returns the array of coefficients of s(x), up to and including that of order n.
function coeff(s, n) {
  let arr = []; //an empty array to put the data of nodes in
  while(s.isEmpty() === false && n >= 0) { //while the stream is not empty and n remains greater than 0
    arr.push(s.head()); //push the data of the node s into the array
    s = s.tail(); //assign s to the next node
    --n; //decrement n
  }
  return arr;
}

//evalSeries(s: Stream<T>, n: number): number => number
//takes a stream of coefficients for the series s(x), and a natural number n, and returns a closure. When called with a real number x, this closure will return the sum of all terms of s(x) up to and including the term of order n.
function evalSeries(s, n) {
 function evaluate(x) {
  let arr = coeff(s, n); //assign arr to all the coefficients of the stream up until that order of n
  //arr.map(y => y*x);
  return arr.reduce((acc, e) => acc + e, 0);
 }
 return evaluate(x);
}

//rec1Series(f: (number) => number, v: number): Stream<T>
// takes a function f and a value v and returns the stream representing the infinite series s(x) where 𝑎0 = v, and a(k+1)= f(a(k)), for all k ≥ 0.
function rec1Series(f, v) {
  return snode(v, memo0(() => rec1Series(f, f(v)))); //create a stream by continually applying f to v
}

//expSeries: Stream<T>
//  returns the Taylor series for ex
function expSeries() {
    return expHelper(0, 1);
}

//expHelper(init: number, n: number): Stream<T>
// helper for expSeries()
function expHelper(init, n) {
  let num = n;
  if (init > 1) {
    num = init * n;
  }
  return snode(1/num, memo0(() => expHelper(init+1, num)));
}

//recurSeries(coef: number[], init: number[]): Stream<T>
 function recurSeries(coef, init) {
  let y = 0;
  return recurHelper(coef, init, y);
 }

 //recurHelper(coef: number[], init: number[], y: number): Stream<T>
  function recurHelper(coef, init, y) {
    let val = 0;
    if (y >= init.length) {
      for (let x = 0; x < init.length; ++x) {
        val += (init[x] * coef[x]);
      }
      init.splice(0, 1, val);
      // init.push(val);
 //     return snode(val, memo0(() => recurHelper(coef, init, y)));
    } else {
      val = init[y];
      ++y;
 //     return snode(val, memo0(() => recurHelper(coef, init, y)));
    }
    return snode(val, memo0(() => recurHelper(coef, init, y)));
    }
/* 
[1, 2, 3, 4], [1, 2, 3, 4]
1 -> 2 -> 3 -> 4 -> 30 -> 140 -> 661

[1, 2, 3], [1, 2, 3]
1 -> 2 -> 3 -> 14 -> 50 -> 181 -> 657 -> 2383

[1, 2], [1, 2]
1 -> 2 -> 5 -> 12 -> 29 -> ....

[3], [2]
2 -> 6-> 18 -> 54
*/


let stream0 = snode(0, memo0(() => snode(4, memo0(() => snode(6, memo0(() => sempty))))));
let stream1 = snode(1, memo0(() => snode(2, memo0(() => snode(3, memo0(() => sempty))))));
let stream2 = snode(5, memo0(() => snode(3, memo0(() => snode(10, memo0(() => snode(11, memo0(() => sempty))))))));

// console.log(coeff(stream0, 2));
// let b = derivSeries(stream0).tail();
// console.log(b.head());
// console.log(evalSeries(stream1, 3));
// console.log(expSeries().head());
// console.log(expSeries().tail().head());
// console.log(expSeries().tail().tail().head());
// console.log(expSeries().tail().tail().tail().head());
// console.log(expSeries().tail().tail().tail().tail().head());

test('recurSeries', function(){
assert(recurSeries([1, 2, 3, 4], [1, 2, 3, 4]).head() === 1);
assert(recurSeries([1, 2, 3, 4], [1, 2, 3, 4]).tail().head() === 2);
assert(recurSeries([1, 2, 3, 4], [1, 2, 3, 4]).tail().tail().head() === 3);
assert(recurSeries([1, 2, 3, 4], [1, 2, 3, 4]).tail().tail().tail().head() === 4);
assert(recurSeries([1, 2, 3, 4], [1, 2, 3, 4]).tail().tail().tail().tail().head() === 30);
});

test('coeff', function() {
assert(coeff(stream0, 2)[0] === 0);
assert(coeff(stream1, 1)[1] === 2);
assert(coeff(stream0, 2)[2] === 6);

assert(coeff(stream1, 4)[2] === 3);
assert(coeff(stream2, 4)[3] === 11);
});

test('addSeries', function(){
assert(addSeries(stream1, stream2).head() === 6);
assert(addSeries(stream1, stream2).tail().head() === 5);
assert(addSeries(stream1, stream2).tail().tail().head() === 13);
});

test('prodSeries', function() {
assert(prodSeries(stream0, stream1).head() === 0);
assert(prodSeries(stream0, stream1).tail().head() === 4);
assert(prodSeries(stream0, stream1).tail().tail().head() === 14);
});

console.log(derivSeries(stream2).tail().head());
console.log(derivSeries(stream2).tail().tail().head());


test('derive', function() {
assert(derivSeries(stream2).head() === 0);
 assert(derivSeries(stream2).tail().head() === 3);
 assert(derivSeries(stream2).tail().tail().head() === 20);
assert(derivSeries(stream2).tail().tail().tail().head() === 33);
});
