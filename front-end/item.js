
class Item{

    constructor(obj){
        this._id = obj['_id'];
        this.class = obj['class'];
        this.description = obj['description'];
        this.img_url= obj['img_url'];
        this.index= obj['index'];
        this.price= obj['price'];
        this.options= obj['options'];
        this.json_obj=obj;
    }

    get_price(){ return this.price; }
    get_json(){ return this.json_obj; }


}

class Cart{
    constructor(list){
        this.cart_list = list;

    }
    add_to_cart(item){
        this.cart_list.push(item)
    }

    remove_from_cart(id){
        let from = this.cart_list.indexOf(id);
        let to = this.cart_list.indexOf(id)+1
        this.cart_list.splice(this.cart_list.indexOf(id),)
    }
}