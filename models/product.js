const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
    {
        name:{type :String, required: true},
        price:{type:Number, required:true},
        rating:String,
        details:String,
        imagePath:String,
        totalOrders: {type:Number, default: 0}
    }
);

module.exports = mongoose.model("Product", ProductSchema);