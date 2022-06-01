
class Item{

    constructor(obj){
        this._id = obj['_id'];
        this.class = obj['class'];
        this.description = obj['description'];
        this.img_url= obj['img_url'];
        // this.index= obj['index'];
        this.price= obj['price'];
        this.options= obj['options'];
        this.json_obj=obj;
    }
    get_id(){return this._id}
    get_price(){ return this.price; }
    get_json(){ return this.json_obj; }
    
    get_elec_size(){
        return this.options_object['elec-size']
    }
}


class Package{
    constructor(obj){
       this.total_price = obj['total-price'];
       this.obj = obj
       this.item_list = this.parse_items(); 
       this.state = true;
    }

    toggle_state(){this.state = !this.state;}
    get_state(){return this.state}
    parse_items(){
        let l = []
        let keys = Object.keys(this.obj)
        for(let key =0; key < keys.length; key++){
            if (keys[key] != 'total-price'){
                l.push(new Item(this.obj[keys[key]]))
            }
        }
        return l
    }
    get_json(){return this.obj; }

}

class PackageGroup{
    constructor(obj){
        this.title = obj['title']
        this.count = obj['count']
        this.raw_data = obj['data']
        this.packages = get_packages(this.raw_data)
        
    }
    
     get_packages(data){
        let p_keys = Object.keys(data)
        let packages_list = []
        for (let i =0; i<p_keys.length; i++){
            let temp = data[p_keys[i]]
            temp['_id'] = p_keys[i]
            let pack = new Package(temp)
            packages_list.push(pack)
        }
        return packages_list
    }
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
    }
}