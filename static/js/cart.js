let tab_row = document.getElementsByTagName('tr')
let form_sub = null
window.addEventListener('load', function(e){
    qty_buttons_up = this.document.getElementsByClassName('up')
    qty_buttons_down = this.document.getElementsByClassName('down')
    form_sub = document.getElementById('form')
    get_session_token()
    .then(res=>{
        _token = res
        get_cart_items() // update cart with current data for now ...
       .then(function(){
            cart_table = this.document.getElementById('cart-table')
            cart_total = this.document.getElementById('cart-total')
            update_table(cart.cart_objects, cart_table)
            update_price(cart, cart_total)
            
            for(let i=0; i<qty_buttons_up.length; i++){
                qty_buttons_up[i].addEventListener('click', incrementQty)
                qty_buttons_down[i].addEventListener('click', decrementQty)
            }
            
            form_sub.addEventListener('submit', submit_quote);
            order_button.addEventListener('click', openOrderForm)
            close_order_form.addEventListener('click', closeOrderForm)

            for(let j=0; j<tab_row.length; j++){
                tab_row[j].addEventListener('click', function(e){
                    let name = e.currentTarget.children[1].innerText;
                    let price = e.currentTarget.children[2].innerText.split(' ')[1]
                    price = parseFloat(price)
                    current_cart_obj = cart.search_by_name(name, price)

                    if(e.target.className.split(' ').includes('d-item')){
                        cart.remove_from_cart(current_cart_obj);
                        this.style.display = 'None';
                        update_price(cart, cart_total)
                        update_cart_server('delete', current_cart_obj.item.id)

                    } 

                    if(e.target.className.split(' ').includes('up')){
                        try{
                            console.log(current_cart_obj)
                            current_cart_obj['qty']++;
                            cart.update_price()
                            update_price(cart, cart_total)
                            update_cart_server('increase', current_cart_obj.item.id)
                            
                        }
                        catch(err){console.log(err)}

                    }
                    else if(e.target.className.split(' ').includes('down')){
                        try{
                            current_cart_obj['qty'] = (current_cart_obj['qty']-1)>=0?current_cart_obj['qty']-1:0;
                            cart.update_price()
                            update_price(cart, cart_total)
                            update_cart_server('decrease', current_cart_obj.item.id)
                        }
                        catch(err){
                            console.log(err)
                        }
                    }
                })
            }
       })
    })
      
})

function submit_quote(e){
    let path = '/contact-us';
    e.preventDefault()
    let form_data = new FormData(e.currentTarget)
    let entries = form_data.entries()
    let res = entries.next()
    let form_json = {}

    while(!res.done){
        form_json[res.value[0]] = res.value[1]
        res = entries.next()
    }
    form_json['sub-tot'] = cart.total_price
    send_quote_form(form_json)
    .then(res=>{
        get_quote()
        .then(res=>{
            let uri = window.URL.createObjectURL(res)
            window.open(uri, '_blank')
        })
    })
}

function openOrderForm(e){
    
    if(cart.total_price>0){
        order_form.style.display = 'flex'
    }
    else{
        alert('Cart Empty ... please add items')
    }   
}

function closeOrderForm(e){
    order_form.style.display = 'none'
}



function incrementQty(event){
    let elem = event.currentTarget;
    let parent = elem.parentNode;
    let parent_parent = parent.parentNode
    let inp = parent_parent.children[0]
    let val = parseInt(inp.value);
    inp.value = val+1; // update screen, 
   
    //update memory and price ...
}

function decrementQty(event){
    let elem = event.currentTarget;
    let parent = elem.parentNode;
    let parent_parent = parent.parentNode
    let inp = parent_parent.children[0]
    let val = parseInt(inp.value);
    inp.value = val-1>0?val-1:0;
    //update memory and price ...
}


function get_row_view(cart_obj){
    return(
        `
          <tr>
            <th scope="row">
            <div class="cart-item-details">
                <img src="${cart_obj['item']['img_url']}" alt="c_image" width="100" height="100"/>
                <div class="cart-item-text-details">
                <span class="item-heading">${cart_obj['name']}</span><br />
                <span class="size">5kVA - 48V - 5kWh</span><br />
                <span class="cart-item-type">Solar Hybrid System</span>
                </div>
            </div>
            </td>
            <td> 
            <div class="qty-container">
                <div class="qty-buttons">
                <div class="qty-item">
                    <i class="bi bi-dash-lg q-b down"></i>
                </div>
                <div class="qty-item">
                    <input type="text" name="qty" class="q-input" value="${cart_obj['qty']}" />
                </div>
                <div class="qty-item">
                    <i class="bi bi-plus-lg q-b up"></i>
                </div>   
                </div>
            </div>
            </td>
            <td>
                <span class="cart-item-unit-price">R ${cart_obj['price']}</span>
            </td>
            <td>
            <span class="cart-item-unit-price">R ${cart_obj['price']*cart_obj['qty']}</span>
            </td>
            <td>
                <div class="remove-container">
                    <i class="bi bi-trash d-item" ></i>
                </div>
            </td>
        </tr>
        `
    )
}

function update_table(cart,view){
    // console.log(cart)
    view.innerHTML = ''
    for(let i=0; i<cart.length; i++){
        view.innerHTML += get_row_view(cart[i]);
    }
}

function update_price(cart, view){
    cart.update_price()
    try{
        view.innerText = cart.total_price
    }catch(err){
        console.log(err)
    }
}