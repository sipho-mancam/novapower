
let filter_view = null;
let cat_view = null;
let products_container = null;
let all_products_list = null;
let data_o = null;
let products_tabs = null;
let current_selected_tab = null;
let sorted_data = null;

window.addEventListener('load', function(e){
    filter_view =  document.getElementById('filter_list')
    cat_view = document.getElementById('categories-list')
    products_container = this.document.getElementById('products_container')
    products_tabs = document.getElementById('products-tabs');

    let path = '/products_list/init'
    make_request('GET', path)
    .then(res=>{
        console.log(res)
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
    });

    // get_cart_count();

});

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
        })
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
                // console.log(i.getAttribute('scope'))
                let x = {
                    "name":i.getAttribute('name'),
                    'value':i.getAttribute('value'),
                    'scope':i.getAttribute('scope')
                }
                filters.push(x)
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

//    console.log(filters)
    
   for(let f of filters){
        
        if(f['name'] in f_output){
            f_output[f['name']]['value'].push(f['value'])
            if(!f_output[f['name']]['scope'].includes(f['scope']))f_output[f['name']]['scope'].push(f['scope'])
        }
        else{
            f_output[f['name']] = {'value':[], 'scope':[]}
            f_output[f['name']]['value'].push(f['value'])
            f_output[f['name']]['scope'].push(f['scope'])
        }
   }
   
   filter_object['filter'] = f_output
   return filter_object
}

// function get_price_range(){
//     /*
//     1) Get the price range ...
//     2) Get the value and build a price value model
//     3) return an object of name/value for price model
//     */
   
// }

function build_filter(){
    /* 
        1) Determine the scope of the filter... (check categories selected to get this)
        2) Determin filters added in the object and parse them to the correct format that the server expects
        3) return a filter object...
    */
   let f_object = get_filters()
   
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
        
        // for(let c of children){
        //     console.log(c)
        //     if(c.getAttribute('name') != f.getAttribute('id')){
        //         // c.className = c.className.replace('show', ' ')
        //     }
        // }
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
        </li>
        `
    }
    return res
}


function get_filter_groups(filter_group){
    let keys = Object.keys(filter_group)
    let res = ``
    for(let k of keys){
        res += `<div class="filter-group">`
        res += `<span >${k}(s)</span>`
        res += get_filter_view(filter_group, 'brand')
        res += `</div> <br/>`
        // break; // temporary for testing ...
    }
   
    return res
}

function get_filter_view(filter, key){
    let res = ''
    // console.log(filter)
    if('brand' in filter){
        let keys = Object.keys(filter[key])
        for(let k of keys){
            res+=`
            <div class="s s-1" id="${k}+1" >
                <a class="s f-item" data-bs-toggle="collapse" name=${k} href="#${k}" style="display:block;" id="${k}" role="button" aria-expanded="false" aria-controls="collapseExample">
                    <span class="icon"><i class="bi bi-caret-right-fill"></span></i>&nbsp ${k}&nbsp 
                </a>
                <div class="collapse child" style="background-color:white;" name="${k}" id="${k}">
                    <ul>
                        ${get_filter_sec_list(filter['brand'][k],'brand', k)}
                    </ul>
                </div>  
            </div>         
            `
        }
    }
    if('size' in filter){

    }

    return res
}

function get_filter_sec_list(filter_array, key='brand', scope='*'){
    let res =  ''
    // console.log(filter_array[key], key)
    for(let i of filter_array[key]){
        res += `
        <li>
            <input type="checkbox" value="${i}" class="input" name="${key}" scope=${scope} group="filter" /> &nbsp ${i}
        </li>`
    }

    // console.log(res)

    return res
}

function get_item_cards(item_dict){
    let keys = Object.keys(item_dict)
    let res = ''
    let count =  0
    if(keys.length == 0){
        res="<br /><br /><p style='color:grey; font-size:small; font-weight:light;margin-top:20px;'>Please check the selected filters and make sure these products are selected for viewing</p>"
    }

    for(let k of keys){
        // if(count >=16)break;
        
        if(item_dict[k]['image_url'] != 0 || item_dict[k]['image_url'] == 0 ){
            res += `
            <div class="cust-card product-card" index="${keys.indexOf(k)}">
                <div class ="image">
                    <img  src=${item_dict[k]['image_url']} alt="${images[Math.ceil(Math.random()*(images.length-1))]}" width="210" height="210"  alt="p-h" />
                </div>
                <div class="info">
                    
                    <span>
                    <span class="name">${item_dict[k]['brand'] +" - "+ item_dict[k]['name']}</span><br />
                    <span class="size-details">
                        2.5kWh - 48V - 100Ah
                    </span>
                    
                    </span>
                    <p class='price'>${item_dict[k]['price'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}*</p>
                </div>
            <div class="controls">
                <a class="add-to-cart h-buttons" id="${item_dict[k]['_uid']}" >Add to Cart</a> 
                <a class="view-more-buttons h-buttons" id="${item_dict[k]['_uid']}+1">View Details</a>
            </div>
            </div>
            `
            count++;
        }
        
    }
    return res
}

function product_view_more(e){

    e.preventDefault() 
    

    console.log(e.currentTarget.getAttribute('index'))

        overlay.innerHTML = get_view_more(sorted_data[current_selected_tab.getAttribute('name')][e.currentTarget.getAttribute('index')])
        overlay.style.display='flex';
        close_overlay = document.getElementById('close-overlay')
        close_overlay.addEventListener('click', close)
        
        let v_tab_buttons = document.getElementsByClassName('v-tab')
        v_tab_cont = document.getElementById('v-tab-cont');
        current_v_tab = v_tab_buttons[0];
        // console.log(current_v_tab)
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



function text_scrolling_animation(){

}