//Name: Meghana Vadassery
// Project: HW5 JSON

let jsonData = lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json');

class FluentRestaurants {
  constructor(jsonData) {
    this.data = jsonData;
  }

  //fromState(stateStr: string): FluentRestaurants
  // It takes a string, stateStr, and returns a new FluentRestaurants object in which all 
  // restaurants are located in the given state, stateStr. 
  fromState(stateStr) {
    let stateExist = (this.data).filter(x => lib220.getProperty(x, 'state').found); //filtering through the data to only keep the objects which have the state property
    let inState = (stateExist).filter(x => x.state === stateStr); //checking each object's state to see if it matches stateStr
    return new FluentRestaurants(inState);
  }

  //ratingLeq(rating: number): FluentRestaurants
  //It takes a number, rating, and returns a new FluentRestaurants object that holds restaurants 
  //with ratings less than or equal to rating.
  ratingLeq(rating) {
    let starsExist = (this.data).filter(x => lib220.getProperty(x, 'stars').found); //filtering through the data to only keep the objects which have the stars property
    let lessThanRating = (starsExist).filter(x => x.stars <= rating); //checking the stars of each object to see if they are less than or equal to the desired rating. lessThanRating will only have those objects with stars <= rating
    return new FluentRestaurants(lessThanRating);
  }

  //ratingGeq(rating: number): FluentRestaurants
  //It takes a number, rating, and returns a new FluentRestaurants object that holds restaurants 
  //with ratings which are greater than or equal to rating.
  ratingGeq(rating) {
    let starsExist = (this.data).filter(x => lib220.getProperty(x, 'stars').found); //filtering through the data to only keep the objects which have the stars property
    let greaterThanRating = (starsExist).filter(x => x.stars >= rating); //checking the stars of each object to see if they are greater than or equal to the desired rating. greaterThanRating will only have those objects with stars >= rating
    return new FluentRestaurants(greaterThanRating);
  }

  //category(categoryStr: string): FluentRestaurants
  //It that takes a string, categoryStr, and produces a new FluentRestaurants object that holds 
  //only those restaurants that have the provided category, categoryStr
  category(categoryStr) {
    let catExists = (this.data).filter(x => lib220.getProperty(x, 'categories').found); //filtering through the data to only keep the objects which have the categories property
     let catComp = (catExists).filter(x => x.categories.includes(categoryStr));
     return new FluentRestaurants(catComp);
  }

  //hasAmbience(ambienceStr: string): FluentRestaurant
  //It takes a string, ambienceStr, and produces a new FluentRestaurants object with 
  //restaurants that have the provided ambience, ambienceStr.
  hasAmbience(ambienceStr) {
    let attributesExists = (this.data).filter(x => lib220.getProperty(x, 'attributes').found); //filtering through the data to only keep the objects which have the attributes property
    let ambienceExists = (attributesExists).filter(x => lib220.getProperty(x.attributes, 'Ambience').found);
    let temp = ambienceExists.filter(y => lib220.getProperty(y.attributes.Ambience, ambienceStr).found);
    let ambient = temp.filter(z => lib220.getProperty(z.attributes.Ambience, ambienceStr).value);
    return new FluentRestaurants(ambient);
  }

  //bestPlace(): Restaurant | {}
  //It returns the “best” restaurant. The “best” restaurant has a star rating which is highest. If there 
  // is a tie, pick the one with the most reviews. If there’s a tie with the most reviews, pick the first 
  // restaurant. If there is no matching result, it should return an empty object.
  bestPlace () {
    let highestRating = (this.data).reduce((a, b) => lib220.getProperty(a, 'stars').value >= lib220.getProperty(b, 'stars').value ? a : b, (this.data)[0]);
    let highestRated = (this.data).filter(x => lib220.getProperty(x, 'stars').value === lib220.getProperty(highestRating, 'stars').value);
    let mostRev = highestRated.reduce((a, b) => lib220.getProperty(a, 'review_count').value >= lib220.getProperty(b, 'review_count').value ? a : b, (this.data)[0]);
    let bestRest = highestRated.filter(x => lib220.getProperty(x, 'review_count').value === lib220.getProperty(mostRev, 'review_count').value);
    return (bestRest.length === 0 ? {} : bestRest[0]);
  }

  //mostReviews(): Restaurant | {}
  // It returns the "most reviewed" restaurant. The "most reviewed" restaurant has a review_count 
  // property with the largest value. If there is a tie, pick the one with the most stars. If there is still a 
  // tie, pick the first restaurant. If there is no matching result, it should return an empty object
  mostReviews () {
    let highestRev = (this.data).reduce((a, b) => a.review_count >= b.review_count ? a : b, 0);
    let mostReviewed = (this.data).filter(x => lib220.getProperty(x, 'review_count').value === lib220.getProperty(highestRev, 'review_count').value);
    let mostStars =  (mostReviewed).reduce((a, b) => a.stars >= b.stars ? a : b, 0);
    let bestRest = mostReviewed.filter(x => x.stars === mostStars.stars);
    return (bestRest.length === 0 ? {} : bestRest[0]);
  }
}

// Test
const testData = [
{
 name: "Applebee's",
 state: "NC",
 stars: 4,
 review_count: 6,
 },
 {
 name: "China Garden",
 state: "NC",
 stars: 4,
 review_count: 10,
 },
 {
 name: "Beach Ventures Roofing",
 state: "AZ",
 stars: 3,
 review_count: 30,
 },
 {
 name: "Alpaul Automobile Wash",
 state: "NC",
 stars: 3,
 review_count: 30,
 }
];


test('fromState filters correctly', function() {
 let tObj = new FluentRestaurants(testData);
 let list = tObj.fromState('NC').data;
 assert(list.length === 3);
 assert(list[0].name === "Applebee's");
 assert(list[1].name === "China Garden");
 assert(list[2].name === "Alpaul Automobile Wash");
});

test('bestPlace tie-breaking', function() {
 let tObj = new FluentRestaurants(testData);
 let place = tObj.fromState('NC').bestPlace();
 assert(place.name === 'China Garden');
});

test('fromState 2', function() {
 let tObj = new FluentRestaurants(testData);
 let list = tObj.fromState('AZ').data;
 assert(list.length === 1);
 assert(list[0].name === "Beach Ventures Roofing");
});


test('leq rating 1', function(){
 let tObj = new FluentRestaurants(testData);
 let list = tObj.ratingLeq(2).data;
 assert(list.length === 0);
});

test('leq rating 2', function(){
 let tObj = new FluentRestaurants(testData);
 let list = tObj.ratingLeq(4).data;
 assert(list.length === 4);
});



const testData2 = [
  {
    name: "South Florida Style Chicken & Ribs",
    city: "Charlotte",
    state: "NC",
    stars: 4.5,
    review_count: 4,
    attributes: {
      GoodForMeal: {
        dessert: false,
        latenight: false,
        lunch: false,
        dinner: false,
        breakfast: false,
        brunch: false
      },
      HasTV: false,
      RestaurantsGoodForGroups: true,
      NoiseLevel: "average",
      RestaurantsAttire: "casual",
      Ambience: {
        romantic: true,
        intimate: false,
        classy: false,
        hipster: false,
        casual: false
      },
      RestaurantsTakeOut: true,
      GoodForKids: true
    }
  },
  {
    name: "TRUmatch",
    city: "Scottsdale",
    state: "AZ",
    stars: 3,
    review_count: 3,
    attributes: {},
    categories: [
      "Professional Services",
      "Matchmakers"
    ]
  },
  {
    name: "Blimpie",
    city: "Phoenix",
    state: "AZ",
    stars: 4.5,
    review_count: 10,
    attributes: {
      Caters: true,
      HasTV: false,
      Ambience: {
        romantic: true,
        intimate: false,
        classy: false,
        upscale: false,
        casual: false
      }
    },
    categories: [
      "Sandwiches",
      "Restaurants"
    ]
  }
];

const testData3 = [
{
 name: "Applebee's",
 review_count: 6,
 },
 {
 name: "China Garden",
 review_count: 10,
 },
 {
 name: "Beach Ventures Roofing",
 review_count: 30,
 },
 {
 name: "Alpaul Automobile Wash",
 review_count: 30,
 }
];

test('hasAmbience works correctly 2', function(){
  let tObj = new FluentRestaurants(testData2);
  let list = tObj.hasAmbience('romantic').data;
  assert(list.length === 2);
});


test('bestPlace', function(){
  let tObj = new FluentRestaurants(lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json'));
  let temp = tObj.ratingLeq(1.5);
  let place = temp.bestPlace();
  assert(place.name === 'KFC');
});

test('bestPlace tie-breaking', function() {
    let tObj = new FluentRestaurants(testData);
    let place = tObj.fromState('NC').bestPlace();
    assert(place.name === 'China Garden');
});

test('mostReviews', function(){
  let tObj = new FluentRestaurants(lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json'));
  let place = tObj.ratingGeq(5).mostReviews();
  assert(place.name === 'Puff & Fluff Grooming and Pet Sitting');
});

test('fromState 4', function() {
 let tObj = new FluentRestaurants(testData3);
 let list = tObj.fromState('AZ').data;
 assert(list.length === 0);
});

test('stars', function() {
 let tObj = new FluentRestaurants(testData3);
 let list = tObj.ratingGeq(3).data;
 assert(list.length === 0);
});

test('category', function(){
  let tObj = new FluentRestaurants(lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json'));
  let list = tObj.category('Tires').data;
  assert(list.length === 14);
});

test('ratingLeq', function(){
  let tObj = new FluentRestaurants(lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json'));
  let list = tObj.ratingLeq(1).data;
  assert(list.length === 16);
});

test('ratingGeq 1', function(){
  let tObj = new FluentRestaurants(lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json'));
  let list = tObj.ratingGeq(6).data;
  assert(list.length === 0);
});

test('ratingGeq 2', function(){
  let tObj = new FluentRestaurants(lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json'));
  let list = tObj.ratingGeq(5).data;
  assert(list.length === 146);
});

test('hasAmbience -- invalid', function(){
  let tObj = new FluentRestaurants(testData2);
  let list = tObj.hasAmbience('muddy').data;
  assert(list.length === 0);
});

test('fromState', function() {
  let tObj = new FluentRestaurants(lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json'));
  let list = tObj.fromState('IL').data;
  assert(list.length === 12);
});

test('fromState filters correctly', function() {
    let tObj = new FluentRestaurants(testData2);
    let list = tObj.fromState('NC').data;
    assert(list.length === 1);
    assert(list[0].name === "South Florida Style Chicken & Ribs");
});

test('bestPlace normal test works correctly', function(){
  let tObj = new FluentRestaurants(lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json'));
  let place = tObj.ratingLeq(1).bestPlace();
  assert(place.name === 'Film Monkey');
});

test('mostReviews tie-breaking', function(){
  let tObj = new FluentRestaurants(lib220.loadJSONFromURL('https://people.cs.umass.edu/~joydeepb/yelp.json'));
  let place = tObj.ratingLeq(1).mostReviews();
  assert(place.name === 'Film Monkey');
});
