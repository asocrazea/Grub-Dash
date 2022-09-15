const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
// returns  list of dishes
function list(req, res) {
  res.json({ data: dishes });
}
// Returns speccific dish
function read(req, res) {
  const dishId = Number(req.params.dishId);
  const foundDish = dishes.find((dish) => (dish.id = dishId));
  res.json({ data: foundDish });
  res.sendStatus(200);
}

function update(req, res, next) { 
  const newDish = req.body.data; 
  for(let dish of dishes){ 
    if(dish.id == newDish.id){ 
      Object.assign(dish, newDish); 
    }; 
  }; 
  res.json({ data: newDish }); 
}


// deltes a dish
function destroy(req, res) {
  const { dishId } = req.params;
  const index = dishes.findIndex((dish) => dish.id === Number(dishId));
  if (index > -1) {
    dishes.splice(index, 1);
  }
  res.sendStatus(204);
}


// creates a new dish
function create(req, res) {
  
  // destuctes the dish
  const { data: { name, description, price, image_url } = {} } = req.body 
  const newDish = { 
    id: nextId(), name, description, price, image_url, 
  }
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

// validators

function exists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find(dish => dish.id === dishId);
    
    if(!foundDish) {
        return next({
            status: 404,
            message: `Dish not found ${dishId}`,
        });
    };
    res.locals.dish = foundDish;
    next();
}


function validateName(req, res, next) {
  const nameId = req.params.dishId;
  const { data: { dishes } = {} } = req.body
  if (!dishes.name || dishes.name === "") {
      next({
        status: 405,
        message: "",
      })
      }
}


function validateDish(req, res, next) { 
  //destructuring 
  const { data: { price } = {} } = req.body; 
  //lising out valid fields 
  const requiredFields = ["name", "description", "price", "image_url"];
  //checking if dish has all required fields 
  for (const field of requiredFields) { 
  if (!req.body.data[field]) { 
    next({ 
      status: 400, 
      message: `A '${field}' property is required.` });
   } 
  } 
//checking if price is a number and greater than 0 
if (typeof price !== "number" || price < 1) { 
  return res.status(400).json({ error: "price must be a number" }); 
} 
if (price < 0) { 
  return res .status(400) .json({ error: "price must be a number greater than zero"  }); 
} 
  next(); 
}

function validateUpdate(req, res, next) { 
  const { dishId } = req.params; 
  const newDish = req.body.data; 
  if(!newDish.id) newDish.id = dishId; 
  if(newDish.id != dishId){ 
    return next({ 
      status: 400,
      message: `Dish id ${newDish.id} does not match the route link!`, 
    }); 
  } 
  next(); 
}

function hasValidPrice(req, res, next) { 
  const { data : { price }={} } = req.body; 
  if (Number(price) > 0 && Number.isInteger(price)) { 
    return 
    next() 
  } 
  next({ 
    status: 400, 
    message: `Dish must have a price that is an integer greater than 0` 
  }); 
}

module.exports = {
  create: [  validateDish, create],
  list,
  read: [exists, read],
  update: [exists, validateDish, validateUpdate, update],
  delete: [destroy],
};
