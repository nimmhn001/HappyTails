const mongoose = require("mongoose");
const Product = require("../models/product");
var bcrypt = require("bcryptjs");

const CustomerSchema = new mongoose.Schema(
    {
        fname: {type:String},
        lname: {type:String},
        name:{type :String},
        uname:{type :String, required: true},
        pwd : {type :String, required: true},
        cart: {type: Object},
        isAdmin:{type: Boolean, default : false},
        orders: {type: Number, default: 0}
    }
);

CustomerSchema.methods.encryptPassword = function(password)
{
    return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

CustomerSchema.methods.validPassword = function(password)
{
    return bcrypt.compareSync(password, this.pwd);
};

CustomerSchema.methods.change_name = function(newName, id)
{
    Customer.updateOne({_id: id}, {name: newName});
}


module.exports = mongoose.model("Customer", CustomerSchema);


// const ProductSchema = new mongoose.Schema(
//     {
//         name:{type :String, required: true},
//         price:{type:Number, required:true},
//         rating:Number,
//         details:String,
//         imagePath:String
//     }
// );

// const Product = mongoose.model("Product", ProductSchema);
// const CustomerSchema = new mongoose.Schema(
//     {
//         name:{type :String, required: true},
//         uname:{type :String, required: true},
//         pwd : {type :String, required: true},
//         cart: [ProductSchema]
//     }
// );

// const Customer = mongoose.model("Customer", CustomerSchema);