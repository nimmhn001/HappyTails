const mongoose = require("mongoose");
const Product = require("../models/product");
var bcrypt = require("bcryptjs");

const SalesSchema = new mongoose.Schema(
    {
      name : String,
      totalOrders: {type : Number, default: 0},
      totalSales : {type: Number, default: 0},
      bestSelling: {}
    }
);

module.exports = mongoose.model("Sales", SalesSchema);