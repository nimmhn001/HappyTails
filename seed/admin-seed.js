const Customer = require("../models/customer");
const mongoose = require("mongoose");
const { extendWith } = require("lodash");
mongoose.connect("mongodb://127.0.0.1:27017/custDB", {useNewUrlParser: true}); // connect to port 27017


const admin = new Customer({
    name: "admin",
    uname:"admin",
    pwd : "pwd1234",
    isAdmin: true
});

admin.save();


