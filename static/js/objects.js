
class Item{
    constructor(obj){
        this._id = obj['_uid'];
        this.brand = obj['brand'];
        this.img_url= obj['image_url'];
        this.price= obj['price'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR', minimumFractionDigits:2});
        this.options= obj['extra'];
        this.json_obj = obj;
        this.size = obj['size'];
        this.name = obj['name']
        this.qty = obj['qty']?obj['qty']:1;
        this.total_price = (this.qty * obj['price']).toLocaleString('af-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2})
        this.json_obj['total_price'] = this.total_price
        this.type = obj['type-group'];
        this.voltage = (this.name.toLowerCase() == 'inverter'  
                        || this.name.toLowerCase() == 'generator')?obj.size.Size : obj.size.Voltage

        if(this.name.toLowerCase()=='battery')this.energy = obj.size.Energy
        else this.energy = (this.name.toLowerCase() == 'solar')?obj.size.Power:obj.size.EngineSize
        if(this.name.toLowerCase()=='inverter')this.energy = obj.size.Voltage?obj.size.Voltage:obj.size.BatVoltage

        this.json_obj['type'] = this.type
        this.json_obj['voltage'] = this.voltage
        this.json_obj['energy'] = this.energy


    }
    get_id(){return this._id}
    get_total_price(){ return this.price; }
    get_json(){ return this.json_obj; }
    get_elec_size(){return this.size['elec-size']}
    get_name(){return this.name;}
}


class Package{
    constructor(obj){
        // console.log(obj)
        this.id = obj['_uid']
        this.total_price = obj['total-price'];
        this.obj = obj
        this.item_list = this.parse_items(); 
        this.state = true;
        this.name = obj['name'];
        this.img_url = obj['image'];
        this.max_power = obj['max-power'];
        this.solar_qty = obj['solar-qty'];
        this.description = get_product_summary(this)
    }

    toggle_state(){this.state = !this.state;}
    get_state(){return this.state}
    parse_items(){
        let l = []
        let keys = Object.keys(this.obj)
        for(let key =0; key < keys.length; key++){
            if(keys[key].match('item \+[0-9]')){
                if (keys[key] != 'total-price'){
                    l.push(new Item(this.obj[keys[key]]))
                }
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
        this.images= obj['images']
        this.packages = this.get_packages(this.raw_data)
        this.id = obj['_uid']
        
    }
    
    get_packages(data){
        let p_keys = Object.keys(data)
        let packages_list = []
       
        for (let i =0; i<p_keys.length; i++){
            let temp = data[p_keys[i]]
            // console.log(data)
            temp['_id'] = p_keys[i]
            temp['name'] = this.title;

            temp['image'] = (temp['item 0']['image_url'])?temp['item 0']['image_url']:this.images[Math.ceil(Math.random()*this.images.length-1)] // give me an image from package 0 or give me a fallback
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
        temp['name'] = item['name'];
        temp['price'] = item['total_price'];
        temp['qty'] = item['qty'];
        temp['item']= item;
        this.cart_objects.push(temp);
    }

    add_to_cart(item){
       
        if(this.cart_list.includes(item)){
           let index = this.cart_list.indexOf(item);
           this.cart_objects[index]['qty']++;
        //    console.log(index)
           return;
        }
        this.parse_to_cart_i(item)
        this.cart_list.push(item)
    }

    get_price(){
        this.total_price = 0;
        for(let i=0; i<this.cart_list.length; i++){
            this.total_price += (this.cart_objects[i]['price']*this.cart_objects[i]['qty'])
        }
    }

    remove_from_cart(cart_obj){
        let price = cart_obj['price']
        let name = cart_obj['name']
        let res = this.search_by_name(name, price)

        if (res != null){
            let index = this.cart_objects.indexOf(res);
            this.cart_objects.splice(index, 1);
            this.cart_list.splice(index, 1); 
            this.update_price()
        }
        
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