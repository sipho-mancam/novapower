
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
    get_total_price(){ return this.price; }
    get_json(){ return this.json_obj; }
    
    get_elec_size(){
        return this.options_object['elec-size']
    }
    get_name(){return this.class}
}


class Package{
    constructor(obj){
        this.id = obj['_id']
       this.total_price = obj['total-price'];
       this.obj = obj
       this.item_list = this.parse_items(); 
       this.state = true;
       this.name = obj['name'];
       this.img_url = obj['img_url'];
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
    get_total_price(){return Math.ceil(this.total_price)}
    get_id(){return this.id}
    get_name(){return this.name}
    get_img_url(){return this.img_url}
    get_cart_obj(){return this.cart_object}

}

class PackageGroup{
    constructor(obj){
        this.title = obj['title']
        this.count = obj['count']
        this.raw_data = obj['data']
        this.packages = this.get_packages(this.raw_data)
        this.id = obj['id']
    }
    
    get_packages(data){
        let p_keys = Object.keys(data)
        let packages_list = []
        for (let i =0; i<p_keys.length; i++){
            let temp = data[p_keys[i]]
            temp['_id'] = p_keys[i]
            temp['name'] = this.title;
            let pack = new Package(temp)
            packages_list.push(pack)
        }
        return packages_list
    }
    get_package_list(){return this.packages;}
    get_packages_count(){return this.count;}
    get_group_title(){return this.title;}
    get_id(){return this.id;}
}

class Cart{
    constructor(list){
        this.cart_list = list;
        this.cart_objects=[]
        this.parse_to_cart(list) 
        this.total_price = 0;  
        this.get_price()  
    }

    parse_to_cart(list){
        for(let i=0; i<list.length; i++){
            this.parse_to_cart_i(list[i])
        }
    }

    parse_to_cart_i(item){
        let temp = {}
        temp['name'] = item.get_name();
        temp['price'] = item.get_total_price();
        temp['qty'] = 1;
        temp['item']= item;
        this.cart_objects.push(temp);
    }

    add_to_cart(item){
       
        if(this.cart_list.includes(item)){
           let index = this.cart_list.indexOf(item);
           this.cart_objects[index]['qty']++;
           console.log(index)
           return;
        }
        this.parse_to_cart_i(item)
        this.cart_list.push(item)
    }

    get_price(){
        this.total_price = 0;
        for(let i=0; i<this.cart_list.length; i++){
            this.total_price += (this.cart_list[i].get_total_price()*this.cart_objects[i]['qty'])
        }
    }

    remove_from_cart(id){
        let from = this.cart_list.indexOf(id);
        this.cart_list.splice(from, 1);
    }
    search_by_name(name, price){
        for(let i=0; i<this.cart_objects.length; i++){
            if(name == this.cart_objects[i]['name'] && price == this.cart_objects[i]['price']){
                return this.cart_objects[i]
            }
        }
    }

    update_price(){
        this.get_price();
    }
}