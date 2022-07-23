const Product = require("../models/product");
const Customer = require("../models/customer");
const Sales = require("../models/sales");

const mongoose = require("mongoose");
const { extendWith } = require("lodash");
mongoose.connect("mongodb://127.0.0.1:27017/custDB", {useNewUrlParser: true}); // connect to port 27017



const sales = new Sales({
    name: "sales",
    totalOrders: 0,
    totalSales : 0,
    bestSelling: {}
});

sales.save();