const mongoose = require("mongoose");

const Orderschema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'Customer'}, // store id here but this id links to the customer model.
    cart : {type: Object, required: true},
    address: {type: String, required: true},
    name: {type: String, required: true},
    paymentId: {type: String}
},
{timestamps: true}
);

module.exports = mongoose.model("Order", Orderschema);