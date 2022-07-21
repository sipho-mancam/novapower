
let filter_view = null;
let cat_view = null;
let products_container = null;
window.addEventListener('load', function(e){
    filter_view =  document.getElementById('filter_list')
    cat_view = document.getElementById('categories-list')
    products_container = this.document.getElementById('products_container')

    let path = '/products_list/init'
    make_request('GET', path)
    .then(res=>{
        console.log(res)
        cat_view.innerHTML = get_categories_view(res['categories'])
        filter_view.innerHTML = get_filter_groups(res['filters'])
        products_container.innerHTML = get_item_cards(res['data']['data'])
        add_to_cart_init()
    })

});


function get_categories_view(cat){
    let res = `
    <li>
        <input type="checkbox"  checked class="input" value="*" name="all" /> &nbsp All
    </li
    `
    for(let c of cat){
        res += `
        <li>
            <input type="checkbox" class="input" value=${c} name=${c} /> &nbsp ${c}
        </li>
        
        `
    }

    return res
}


function get_filter_groups(filter_group){
    let keys = Object.keys(filter_group)
    let res = ``
    for(let k of keys){
        res += `<em><b>${k.toUpperCase()}</b></span><ul>`
    
        res += get_filter_view(filter_group, 'brand')
    
        res += '</ul>'
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
            <li>
                <a class="s" data-bs-toggle="collapse" href="#${k}" role="button" aria-expanded="false" aria-controls="collapseExample">
                    ${k}&nbsp 
                </a>
                <div class="collapse" id="${k}">
                    <ul>
                        ${get_filter_sec_list(filter['brand'][k])}
                    </ul>
                </div>
            </li>            
            `
        }
    }
    if('size' in filter){

    }

    return res
}

function get_filter_sec_list(filter_array){
    let res =  ''
    // console.log(filter_array)
    for(let i of filter_array['brands']){
        res += `
        <li>
            <input type="checkbox" value="0" class="input" name="${i}" /> &nbsp ${i}
        </li>`
    }

    // console.log(res)

    return res
}

function get_item_cards(item_dict){
    let keys = Object.keys(item_dict)
    let res = ''
    let count =  0
    for(let k of keys){
        if(count >=16)break;
       
        if(item_dict[k]['image_url'] != 0){
            res += `
            <div class="cust-card product-card" >
                <div class ="image">
                    <img  src=${item_dict[k]['image_url']} alt="${images[Math.ceil(Math.random()*(images.length-1))]}" width="210" height="210"  alt="p-h" />
                </div>
                <div class="info">
                    
                    <span>
                    <span class="name">${item_dict[k]['name']}</span><br />
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