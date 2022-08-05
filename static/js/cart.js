
let form_sub = null;

window.addEventListener('load', function(e){

    let add_installation = this.document.getElementById('installation-control')
    
    add_installation.addEventListener('change', function(e){
        let value = e.target.value
        let path = '/add-option?session_token='+_token+'&option=installation';
        if(value == 1){
            make_request('GET',path)
            .then(function(response){
                update_totals(response)
            }).catch(err=>{
                console.log(err)
            })
        }
    });

   

    form_sub = document.getElementById('form')    
    get_session_token()
    .then(res=>{
        _token = res
        get_cart_items() // update cart with current data for now ...
       .then(res=>{
            cart_table = this.document.getElementById('cart-table');
            cart_total = this.document.getElementById('cart-total');
            console.log(res)

            allocate_qty_to_package(res)

            if('cart-items' in res){ // we got some stuff from the server...
                update_table(res['cart-items'], cart_table)
                cart_items = res['cart-items']
            }

            

            let cart_counts = this.document.getElementsByClassName('cart-count')
            let tab_row = document.getElementsByTagName('tr')
            
            get_cart_count()
            .then(()=>{
                for(let i of cart_counts){
                    i.innerText = cart_count
                }
            })
            
            form_sub.addEventListener('submit', submit_quote);
            order_button.addEventListener('click', openOrderForm)
            close_order_form.addEventListener('click', closeOrderForm)

            for(let j=0; j<tab_row.length; j++){
                tab_row[j].addEventListener('click', function(e){

                     let _uid = e.currentTarget.getAttribute('id')
                    let spinner = document.getElementById(_uid+'spinner')
                    let qty_cont = document.getElementById(_uid+'qty')
                    

                    if(e.target.className.split(' ').includes('d-item')){
                        qty_cont.style.display = 'none';
                        spinner.style.display = 'block';
                        update_cart_server('delete', _uid)
                        .then(res=>{
                            console.log(res)
                            window.location.reload()
                        })
                        
                    } 

                    if(e.target.className.split(' ').includes('up')){
                        qty_cont.style.display = 'none';
                        spinner.style.display = 'block';
                        try{
                            update_cart_server('increase', _uid)
                            .then(res=>{
                                window.location.reload()
                            })
                            
                            
                        }
                        catch(err){console.log(err)}

                    }
                    else if(e.target.className.split(' ').includes('down')){
                        qty_cont.style.display = 'none';
                        spinner.style.display = 'block';
                        try{
                            update_cart_server('decrease', _uid)
                            .then(res=>{
                                window.location.reload()
                            })
                        }
                        catch(err){
                            console.log(err)
                        }
                    }
                    
                })
            }
        
            get_price_summary(_token)
            .then(res=>{
                update_totals(res)
                price_summary = res
            })
       })
    })
      
})

function update_totals(res, tot_buttons=document.getElementsByClassName('tot')){
    let keys = Object.keys(res)
    tot_buttons[0].innerText = res[keys[0]].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})
    tot_buttons[1].innerText = res[keys[2]].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})
    tot_buttons[2].innerText = res[keys[1]].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})
}

function allocate_qty_to_package(server_res){
    let s_pacakges = server_res['cart-items'];
    for(let p of s_pacakges){
        p['package']['qty'] = p['qty'];
    }    
}

function view_quote(html_data){
    const disp = document.getElementById('overlay');
    const cl_q = document.getElementById('close-q-overlay');
    const quote_view = document.getElementById('view-quote');

    disp.style.display = 'block';

    cl_q.addEventListener('click', function(){
        disp.style.display = 'none'; 
        window.location.pathname = '/'; 
    });
    quote_view.innerHTML = html_data;
    
}

function submit_quote(e){
    let path = '/contact-us';

    let resp_card = document.getElementById('resp-card')
    e.currentTarget.style.display = 'none';
    e.currentTarget.parentNode.style.display = 'none';
 
    resp_card.style.display = 'flex';

    e.preventDefault()
    let form_data = new FormData(e.currentTarget)
    let entries = form_data.entries()
    let res = entries.next()
    let form_json = {}

    while(!res.done){
        form_json[res.value[0]] = res.value[1]
        res = entries.next()
    }

    // console.log(form_json)


    form_json['sub-tot'] = cart.total_price

    let quote_data = form_json;
    quote_data['cart-list'] = cart_items
    quote_data['price-summary'] = price_summary
    form_json['pdf_data'] = generate_html_for_pdf(quote_data)

    view_quote(form_json['pdf_data'])

    send_quote_form(form_json)
    .then(res=>{
        get_quote()
        .then(res=>{
            // before showing the use the quote...
            // clear cart...
            update_cart_server('clear')
            .then(()=>{
                    window.location.pathname = '/'
                    // window.location.reload()
                    console.log('Done')
<<<<<<< HEAD
                })
=======
            })
>>>>>>> 79c237d51b8cf2f698c3317af4ae074b7d7d49ca
            
            // show them a success message
            let uri = window.URL.createObjectURL(res)
            saveFile(res, 'Quote.pdf')
            // window.open(uri, '_blank')
        }).catch(err=>{
            print()
            update_cart_server('clear')
            .then(()=>{})
            .catch(err={})
        })
    }).catch(err=>{
        console.log(err); 
    })
}

function openOrderForm(e){
    
    get_cart_count()
    .then(()=>{
        if(cart_count){
            order_form.style.display = 'flex'
        }
        else{
            alert('Cart Empty ... please add items')
        } 
    }) // set the cart count value in there ...
}

function closeOrderForm(e){
    order_form.style.display = 'none'
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

function get_row_view(cart_obj){
    console.log(cart_obj)
//     <span class="size">5kVA - 48V - 5kWh</span><br />
        // < span class="size" > ${ cart_obj["size"]["voltage"] + ' - ' + cart_obj["size"]["voltage"] }</span > <br />
    let pack = cart_obj['package']
    let image = null;
    let price = 0;
    let size = ''
    let item
    if('type' in cart_obj){// it's an item .... do something 
        size = get_product_size(pack)
        image = pack['image_url'];
        item = pack
    }else{ // it's a package do something different
       item = pack;
       image = get_package_image(pack);
    } 
    price = pack['price'];

    return(
        `
          <tr id=${item['_uid']}>
            <th scope="row">
            <div class="cart-item-details">
                <img src="${image}" alt="c_image" width="100" height="100"/>
                <div class="cart-item-text-details">
                <span class="item-heading">${item['name']}</span><br />
                <span class="size"> ${ size }</span> <br />
                <span class="cart-item-type">${item['name']}</span>
                </div>
            </div>
            </td>
            <td> 
            <div class="spinner-border spinner-border-sm" style="display:none" role="status" id=${item['_uid'] + 'spinner'} >
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="qty-container" id=${item['_uid']+'qty'}>
                <div class="qty-buttons">
                <div class="qty-item">
                    <i class="bi bi-dash-lg q-b down"></i>
                </div>
                <div class="qty-item">
                    <input type="text" class="cart-qty" name="qty" class="q-input" value="${item['qty']}" />
                </div>
                <div class="qty-item">
                    <i class="bi bi-plus-lg q-b up"></i>
                </div>   
                </div>
            </div>
            </td>
            <td>
                <span class="cart-item-unit-price">${price.toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}</span>
            </td>
            <td>
            <span class="cart-item-unit-price">${(price*item['qty']).toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}</span>
            </td>
            <td>
                <div class="remove-container">
                    <i class="bi bi-trash d-item" ></i>
                </div>
            </td>
        </tr>`)
}

function update_table(cart,view){
    // console.log(cart)
    view.innerHTML = ''
    for(let i=0; i<cart.length; i++){
        view.innerHTML += get_row_view(cart[i]);
    }
}

async function get_price_summary(session_token){
    let path = '/price-summary?session_token='+session_token;
    return make_request('GET', path)

}


function saveFile(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
    } else {
      const a = document.createElement('a');
      document.body.appendChild(a);
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }, 0)
    }
  }