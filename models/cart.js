const product = require("./product");

// basic javascript constructor function -> Cart()
module.exports = function Cart(oldCart)
{
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    // a function to add new items to the cart
    this.add = function(product, id)
    {
        var storedItem = this.items[id];
        // if this item does not exist in the cart yet:
        if(!storedItem)
        {
            storedItem = this.items[id] = {item: product, qty:0, price : 0};
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    }

    // reduce item qty by 1
    this.reduceByOne = function(id)
    {
        this.items[id].qty--;
        this.items[id].price -= this.items[id].item.price;
        this.totalQty--;
        this.totalPrice -= this.items[id].item.price;
        if(this.items[id].qty <= 0)
        {
            delete this.items[id];
        }
    };

    this.set = function(product, id, qty)
    {
        var storedItem = this.items[id];
        var change = qty - storedItem.qty;
        // console.log("stored qty - >", storedItem.qty);
        // console.log("chnage - >", change);
        // console.log("tp - > ", this.totalPrice);
        // console.log("tq - >", this.totalQty);
        storedItem.qty = qty;
        storedItem.price = storedItem.qty * storedItem.item.price;
        if(this.totalPrice < 0)
            this.totalPrice = 0;
        if(this.totalQty < 0)
            this.totalQty = 0;
        this.totalPrice += (change * storedItem.item.price);
        this.totalQty += (change);
    }
    // to delete this item
    this.delete = function(id)
    {
        this.totalQty -= this.items[id].qty;
        this.totalPrice -= this.items[id].price;
        delete this.items[id];
    };


    // to output the list of cart items
    this.generateArray = function()
    {
        var arr = [];
        for(var id in this.items)
        {
            arr.push(this.items[id]);
        }
        return arr;
    }
};