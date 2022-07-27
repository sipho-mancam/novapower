
let filter_view = null;
let cat_view = null;
let products_container = null;
let all_products_list = null;
let data_o = null;
let products_tabs = null;
let current_selected_tab = null;
let sorted_data = null;

let filterview_callback_list = {
    'brand':brand_filter_view
}

let buttons_handlers = {
    'details':product_view_more,
    'cart':product_add_to_cart
}

let price_range = null;

window.addEventListener('load', function(e){
    filter_view =  document.getElementById('filter_list')
    cat_view = document.getElementById('categories-list')
    products_container = this.document.getElementById('products_container')
    products_tabs = document.getElementById('products-tabs');
    let side_bar = document.getElementById('side-bar-view')
    this.document.getElementById('filter-toggle').addEventListener('click', function(e){
        let state = this.getAttribute('expanded');

        if(state == 'false'){ // expand the filter
            const width_anim = [
                {width:'0%'},
                {width:'100%'}
            ]
            const anim_options = {
                duration:200,
                iterations:1, 
            }
    
            side_bar.animate(width_anim, anim_options);
            side_bar.style.display = 'block';
            side_bar.style.width = '100%';
            state = 'true';

        }else if(state =='true'){ // it is expanded...
            
            const width_anim = [
                {height:'100%'},
                {height:'0%'}
            ];

            const anim_options = {
                duration:200,
                iterations:1, 
            };

            side_bar.animate(width_anim, anim_options);
            side_bar.setAttribute('h', side_bar.style.height);
            side_bar.style.height = '0%';
            state = 'false';

            setTimeout(function(){
                side_bar.style.display = 'none';
                side_bar.style.width = '0%';
                side_bar.style.height = side_bar.getAttribute('h');
            },200);
        }
       
        this.setAttribute('expanded', state);
    });

    const cart_button = document.getElementById('cart-button');
    cart_button.addEventListener('click', function(e){
        window.location.pathname = '/cart';
    });
    get_session_token()
    .then(res=>{
        console.log(res)

        let path = '/products_list/init'
        make_request('GET', path)
        .then(res=>{
            // console.log(res)
            sort_data(res)
            all_products_list = res['data']['data'];
            data_o = res; 
            cat_view.innerHTML = get_categories_view(res['categories']);
            products_tabs.innerHTML = get_products_tabs(res['categories']);
            init_product_tabs()
            filter_view.innerHTML = get_filter_groups(res['filters']);
            products_container.innerHTML = get_item_cards(sorted_data[current_selected_tab.getAttribute('name')]);
            update_tab_counts()
            update_filters_view(res['categories']);

            let input = this.document.getElementsByClassName('input');
            for(let i of input){
                i.addEventListener('change', update_content);
            }
            price_range  = this.document.getElementById('range-value');
            product_cards_init()
        });
         get_cart_count();
    });
});

function register_filter_view_cb(f_name, cb){
    filterview_callback_list[f_name] = cb
}

function sort_data(data){
    sorted_data = {}

    for(let i of data['categories']){
        sorted_data[i] = []
    }

    let products = data['data']['data']
    for(let p in products){
        sorted_data[products[p]['name'].toLowerCase()].push(products[p])
    }
}

function get_products_tabs(categories){
    let res =""

    for(let i of categories){
       res +=`<div class="col tab " name="${i}">
                        ${i}<span class="count" name="${i}" >(0)</span>
            </div>
            `
    }
    return res
}

function update_tab_counts(){
    const count_views = document.getElementsByClassName('count');

    for(let c_v of count_views){
        c_v.innerText = '('+sorted_data[c_v.getAttribute('name')].length+')';
    }
}

function init_product_tabs(){
    const tabs = document.getElementsByClassName('tab');
    current_selected_tab = tabs[0]
    current_selected_tab.className += " selected";

    // console.log(current_selected_tab)

    for(let t of tabs){
        t.addEventListener('click', function(e){
            current_selected_tab.className = current_selected_tab.className.replace('selected', ' ');
            this.className += ' selected'
            current_selected_tab = this
            products_container.innerHTML = get_item_cards(sorted_data[this.getAttribute('name')]);
            product_cards_init();
        });
    }
}

function get_scope(){
    /* 
    1) Get all the categories objects 
    2) get all those that are checked...
    3) build an array and return the scope.
    */
    let filters = []
    let category = []
    let output = {}
    let temp = null;
    let checks = document.getElementsByClassName('input');
   
    for(let i of checks){
        temp = i.getAttribute('group');
        
        if(temp == 'filter'){
            if(i.checked){
                let x = {
                    "name":i.getAttribute('name'),
                    'value':i.getAttribute('value'),
                    'scope':i.getAttribute('scope')
                }
                filters.push(x)
            }else if(i.getAttribute('type')!='checkbox'){ // process other input types differently... always get their value and everything else..

                const filters_data = data_o['filters'];
                let name = i.getAttribute('name');
                let value = null;
                if(name in filters_data){
                    // find out the type of "value we are expecting"
                    const f_type = filters_data[name]['type'].split('|');
                    if(f_type.includes('int') || f_type.includes('float') || f_type.includes('number')){ // type is a number 
                        value = new Number(i.value)
                        value = value.valueOf()
                        if(name =='price'){ // update the view for the price...
                            price_range.innerText = value.toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})
                        }
                        let x = {
                            'name':name,
                            'value':value,
                            'scope':i.getAttribute('scope')
                        }
                        filters.push(x)
                        continue;
                    }
                }
            }   
        }
        else if(temp == 'scope'){
            if(i.checked){
                category.push(i.getAttribute('value'))
            }
        }
    }
 
    update_filters_view(category)
    output['scope'] = category
    output['filter'] = filters
    // console.log(output)
    return output
}

function get_filters(){
    /* 
    1) Get all the filter objects...
    2) Check all the ones that are checked.
    3) get their names and/or values
    4) Build the filter structure and return an object of name/value pairs for filters..
    */
   let filter_object = get_scope();
   let filters = filter_object['filter']
   let f_output = {}

    
   for(let f of filters){
        
        if(f['name'] in f_output){
            f_output[f['name']]['value'].push(f['value'])
            if(!f_output[f['name']]['scope'].includes(f['scope']))f_output[f['name']]['scope'].push(f['scope'])
        }
        else{
            if(data_o['filters'][f['name']]['type'].split('|').includes('int') || data_o['filters'][f['name']]['type'].split('|').includes('float') || data_o['filters'][f['name']]['type'].split('|').includes('number')){
                f_output[f['name']] = {'value':f['value'], 'scope':f['scope']}
            }else if(data_o['filters'][f['name']]['type'].split('|').includes('list') || data_o['filters'][f['name']]['type'].split('|').includes('object')){
                f_output[f['name']] = {'value':[], 'scope':[]};
                f_output[f['name']]['value'].push(f['value']);
                f_output[f['name']]['scope'].push(f['scope']);
            }
            
        }
   }
   filter_object['filter'] = f_output
   return filter_object
}

function build_filter(){
    /* 
        1) Determine the scope of the filter... (check categories selected to get this)
        2) Determin filters added in the object and parse them to the correct format that the server expects
        3) return a filter object...
    */
   let f_object = get_filters()
//   console.log(f_object)
   let fil = f_object['filter']
   let f_keys = Object.keys(fil)
   let filter_struct = {}
   for(let i of f_keys){
        
        let temp = {
            "name":i,
            'value':fil[i]['value'],
            'scope':fil[i]['scope']
        }
        filter_struct[i] = temp
   }

   filter_struct['p'] ={
        'name':'package-flag',
        'value':false,
        'scope':'*'
    }

   f_object['filter'] = filter_struct
   return f_object
}

function update_filters_view(categories_list){
    let cat_list = categories_list
    let filters = document.getElementsByClassName('s')
    const children = document.getElementsByClassName('child');

    for(let f of filters){
        f.addEventListener('click', function(e){
            try{
                const icon = e.target.children[0];
                // console.log(icon, e.target.getAttribute('aria-expanded'))
                if(e.target.getAttribute('aria-expanded') =='true'){
                    icon.innerHTML = `<i class="bi bi-caret-down-fill"></i>`
                }
                else{
                    icon.innerHTML = `<i class="bi bi-caret-right-fill"></i>`
                }
            }catch(err){
                console.log(null)
            }
            
        });
        f.style.display = 'none';
    }

    for(let cat of cat_list){        

            if(cat != '*'){
                let temp = document.getElementById(cat)
                let t2 = document.getElementById(cat+'+1');
                temp.style.display = 'block';
                t2.style.display = 'block';
            }
            else{
                for(let f of filters)f.style.display = 'block';
            }
    }
    
}

async function update_content(e){
    /* 
    1) Get the filter model.
    2) Make request to the server...
    3) Recieve data and split it into Viewport/Data groups
    3) Call the draw method to update the screen ...
    */
   if(e.target.checked && e.target.getAttribute('group')=='scope'){
        let value  = e.target.getAttribute('value')
        if(value != '*'){
            let all = document.getElementById('all');
            all.checked = false;
        }else{ // uncheck the rest if * is checked
            let checks = document.getElementsByClassName('input');
            for(let i of checks){
                temp = i.getAttribute('group');
                if(temp == 'scope'){
                    if(i.getAttribute('value') != '*')i.checked = false;
                } 
            }
        }
   }
    let path = '/products_list/apply_filter';
    let filter = build_filter()

    await make_request('PUT', path, filter)
    .then(res=>{
        res['categories'] = data_o['categories']
        let temp = res['data']
        res['data'] = {}
        res['data']['data'] = temp
    
        sort_data(res);
        products_container.innerHTML = get_item_cards(sorted_data[current_selected_tab.getAttribute('name')]);
        update_tab_counts()
        //initialise cards here...
        product_cards_init()
   });
}

function get_categories_view(cat){
    let res = `
    <li>
        <input type="checkbox"  checked class="input" id='all'  value="*" name="scope" group="scope" /> &nbsp All
    </li>
    `
    for(let c of cat){
        res += `
        <li>
            <input type="checkbox" class="input" value=${c} name="scope" group="scope" /> &nbsp ${c}
        </li>`
    }
    return res
}

function get_filter_groups(filter_group){
    let keys = Object.keys(filter_group)
    let res = ``
    for(let k of keys){
        res += `<div class="filter-group">`
        res += `<span >${k}(s)</span>`
        res += get_filter_view(filter_group[k], k)
        res += `</div> <br/>`
        // break; // temporary for testing ...
    }
    return res
}

function get_filter_view(filter, name){
    if(name in filterview_callback_list)return filterview_callback_list[name](filter)
}

function brand_filter_view(brand_filter){
    let res = ' '
    let keys = Object.keys(brand_filter)
    for(let k of keys){
        res+=
        `<div class="s s-1" id="${k}+1" >
            <a class="s f-item" data-bs-toggle="collapse" name=${k} href="#${k}" style="display:block;" id="${k}" role="button" aria-expanded="false" aria-controls="collapseExample">
                <span class="icon"><i class="bi bi-caret-right-fill"></span></i>&nbsp ${k}&nbsp 
            </a>
            <div class="collapse child" style="background-color:white;" name="${k}" id="${k}">
                <ul>
                    ${get_filter_sec_list(brand_filter[k],'brand', k)}
                </ul>
            </div>  
        </div>`
    }
    return res
}

function price_filter_view(price_filter){
    let res = 
    `<div class="price-f-view">
        <br />
        <div class="input-range">

            <div class='range-item'>
                <div class="white-block wb-l" style="margin-left:auto"></div>
                <span class="range-display value">R 1 000,00</span>
            </div>
            <div class='range-item'>
                <input type='range' min=1000 max=50000 value='5000' step=500  class='input price-input form-range' name="price" scope='*' group="filter" />
            </div>
            <div class='range-item'>
                <div class="white-block wb-r"></div>
                <span class="range-display value">R 50 000,00</span>
            </div>
        </div>
       <div class='range-item'>
            <div class="range-update">
                <span class="value">Set:&nbsp</span><span class="value" id="range-value" >all</span>
            </div> 
        </div>
        
        
    </div>`
    return res
}

function size_filter_view(size_filter){
    return `
    <div class="price-f-view">
        <span class="value">filter view still under-development</span>
    </div>
    `
}

function get_filter_sec_list(filter_array, key='brand', scope='*'){
    let res =  ''
    if(typeof(filter_array) != 'string'){
        for(let i of filter_array[key]){
            res += `
            <li>
                <input type="checkbox" value="${i}" class="input" name="${key}" scope=${scope} group="filter" /> &nbsp ${i}
            </li>`
        }
        return res
    }
    
    return null
    // console.log(res) 
}

function get_item_cards(item_dict){
    let keys = Object.keys(item_dict)
    let res = ''
    let count =  0
    if(keys.length == 0){
        res="<br /><br /><p style='color:grey; font-size:small; font-weight:light;margin-top:20px;'>Please check the selected filters and make sure these products are selected for viewing</p>"
    }

    for(let k of keys){        
        if(item_dict[k]['image_url'] != 0 || item_dict[k]['image_url'] == 0 ){
            res += `
            <div class="cust-card product-card" index="${keys.indexOf(k)}">
                <div class ="image">
                    <img  src=${item_dict[k]['image_url']} alt="${images[Math.ceil(Math.random()*(images.length-1))]}" width="210" height="210"  alt="p-h" />
                </div>
                <div class="info">
                    
                    <span>
                    <span class="name">${item_dict[k]['brand'] +" - "+ item_dict[k]['type-group']}</span><br />
                    <span class="size-details">
                        ${get_product_size(item_dict[k])}
                    </span>
                    
                    </span>
                    <p class='price'>${item_dict[k]['price'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}*</p>
                </div>
            <div class="controls">
                <a class="add-to-cart h-buttons" name='cart' index=${keys.indexOf(k)} id="${item_dict[k]['_uid']}" >Add to Cart</a> 
                <a class="view-more-buttons h-buttons" name='details' index=${keys.indexOf(k)} id="${item_dict[k]['_uid']}+1">View Details</a>
            </div>
            </div>
            `
            count++;
        }
        
    }
    return res
}

function get_product_size(item){
    /** @internal 
     * asses the item for it's "sizing" parameters
     * During the assessment prioritize 1) Voltage --> 2) Power --> 3) Apparent Power --> 4)Energy
     * Load parameters you find into an array. 
     * Check array length: if >= 2 proceed to generate view
     * Else find other paramenters in the item to populate up to 3 then generate the view
     * we need a minimum of 2 items in the list. (Unbreakable rule) - Strict mode.
     * */ 
    let priorities = ['Voltage','Size', 'Power', 'Energy']

    let items_size_params = item['size'];
    let keys = Object.keys(items_size_params)
    let staging = []
    for(let i of priorities){ // run through the priorities first
        if(keys.includes(i)){ // check if the keys include our items as per the priorities
            staging.push(items_size_params[i])
        }
        if(staging.length == 3)break;
    }

    let res = ``
    if(staging.length >=2){
        // proceed to generate the view and the return ...
        for(let i of staging){
            res += `&nbsp${i['value']+''+i['unit']} -`
        }
        res = res.slice(0, res.length-1)
        return res;
    }else{
        // run the random wheel and take whatever we have left.
        for(let i in items_size_params){
            if(!staging.includes(items_size_params[i])){
                staging.push(items_size_params[i])
            }
            if(staging.length == 3)break;
        }

        for(let i of staging){
            res += `&nbsp${i['value']+''+i['unit']} -`
        }
        res = res.slice(0, res.length-1)
        return res; 
    }

}

function product_cards_init(){
    const card_buttons = document.getElementsByClassName('h-buttons');
    for(let i of card_buttons){
        i.addEventListener('click', buttons_handlers[i.getAttribute('name')]);
    }
}

function product_add_to_cart(e){
    e.preventDefault() 
    // let _search_key = e.path[0].id
    let item = sorted_data[current_selected_tab.getAttribute('name')][e.target.getAttribute('index')]

    make_request('POST', '/add-to-cart?session_token='+_token, {
        'group': item['package-group'],
        '_uid':item['_uid'],
        'qty':1,
        'package':item,
        'type':'item'
    }).then(res=>{
        get_cart_count();  // update the cart icon with the current number of items in the cart
    }).catch(err=>{
        console.log(err)
    })

    // cart.add_to_cart(package);
  
}

function get_products_view_more(item_data){
    return(
        `
        <div class="view-details-card container">
            <div class="img v-img">
                <img src="${item_data['image_url']}" class="img-thumbnail" width="300px" height="300px" alt=""/>
            </div>

            <div class="text">
                <h4>${item_data.name}</h4>
                <ul class="nav nav-tabs">
                    <li class="nav-item active-tab v-tab">
                        <a class="nav-link"  aria-current="page" href="#">Summary</a>
                    </li>
                    <li class="nav-item v-tab">
                        <a class="nav-link" href="#" >Technical Details</a>
                    </li>
                    <li class="nav-item v-tab">
                        <a class="nav-link" href="#" >Reviews</a>
                    </li>
                </ul>

                <div class="tab-content" style="width: 100%; display:block; margin-top:5px;" id="v-tab-cont">
        
                </div>
                
                <p class='price'>${item_data['price'].toLocaleString('af-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }) }*</p>
                <div class="buttons">
                  <a class="close-buttons h-buttons b close" id="close-overlay">Close</a>
                </div>
            </div>
        </div>`)
}

function product_view_more(e){
    e.preventDefault() 

    overlay.innerHTML = get_products_view_more(sorted_data[current_selected_tab.getAttribute('name')][e.target.getAttribute('index')])
    overlay.style.display='flex';
    close_overlay = document.getElementById('close-overlay')
    close_overlay.addEventListener('click', close)
    
    let v_tab_buttons = document.getElementsByClassName('v-tab')
    v_tab_cont = document.getElementById('v-tab-cont');
    current_v_tab = v_tab_buttons[0];
    for(let i of v_tab_buttons){
        i.addEventListener('click', function(){
            current_v_tab.className = current_v_tab.className.replace('active-tab', '')
            console.log(current_v_tab.className)
            current_v_tab = this
            this.className += ' active-tab '

            if (this.innerText.toLowerCase() == 'summary'){
                v_tab_cont.innerHTML = get_product_summary(package)
            }
            else if(this.innerText.toLowerCase() == 'technical details'){
                v_tab_cont.innerHTML = get_item_full(package)
            }
            else if(this.innerText.toLowerCase() == 'reviews'){
                v_tab_cont.innerHTML = '<p style="color:grey">There are currently 0 reviews for this item</p>'
            }
        });
    }
}

function get_view_more(package, p_type){
    return(
        `
        <div class="view-details-card container">
            <div class="img v-img">
                <img src="${package.img_url}" class="img-thumbnail" width="300px" height="300px" alt=""/>
            </div>

            <div class="text">
                <h4>${package.name}</h4>
                <ul class="nav nav-tabs">
                    <li class="nav-item active-tab v-tab">
                        <a class="nav-link"  aria-current="page" href="#">Summary</a>
                    </li>
                    <li class="nav-item v-tab">
                        <a class="nav-link" href="#" >Technical Details</a>
                    </li>
                    <li class="nav-item v-tab">
                        <a class="nav-link" href="#" >Reviews</a>
                    </li>
                </ul>

                <div class="tab-content" style="width: 100%; display:block; margin-top:5px;" id="v-tab-cont">
                   ${package['description']}
                </div>
    
                <p class='price'>${package.get_total_price().toLocaleString('af-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }) }*</p>
                <div class="buttons">
                  <a class="close-buttons h-buttons b close" id="close-overlay">Close</a>
                </div>
            </div>
        </div>`)
}

register_filter_view_cb('brand', brand_filter_view);
register_filter_view_cb('price', price_filter_view);
register_filter_view_cb('size', size_filter_view);
