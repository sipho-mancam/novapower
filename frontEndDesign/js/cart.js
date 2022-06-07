let tab_row = document.getElementsByTagName('tr')
window.addEventListener('load', function(e){
    qty_buttons_up = this.document.getElementsByClassName('up')
    qty_buttons_down = this.document.getElementsByClassName('down')
    let res = window.sessionStorage.getItem('cart')

    // console.log(JSON.parse(res))
    cart = deserialiseCart(JSON.parse(res))

    cart_table = this.document.getElementById('cart-table')
    cart_total = this.document.getElementById('cart-total')
    update_table(cart.cart_objects, cart_table)
    update_price(cart, cart_total)


    for(let i=0; i<qty_buttons_up.length; i++){
        qty_buttons_up[i].addEventListener('click', incrementQty)
        qty_buttons_down[i].addEventListener('click', decrementQty)
        
    }

    window.sessionStorage.setItem('cart', JSON.stringify(cart))
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

            } 

            if(e.target.className.split(' ').includes('up')){
                try{
                    current_cart_obj['qty']++;
                    cart.update_price()
                    update_price(cart, cart_total)
                }
                catch(err){console.log(err)}

            }
            else if(e.target.className.split(' ').includes('down')){
                try{
                    current_cart_obj['qty'] = (current_cart_obj['qty']-1)>=0?current_cart_obj['qty']-1:0;
                    cart.update_price()
                    update_price(cart, cart_total)
                }
                catch(err){
                    console.log(err)
                }
            }

            window.sessionStorage.setItem('cart', JSON.stringify(cart))
            
        })
    }
})

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

function deserialisePackages(package){
    return new Package(package.obj)
}

function deserialiseCart(cart){
    let temp = []
    for(let i=0; i<cart.cart_list.length; i++){
        temp.push(deserialisePackages(cart.cart_list[i]))
    }
    let t_cart = new Cart(temp)
    t_cart.cart_objects = cart.cart_objects;
    t_cart.update_price()
    return t_cart
}

function get_row_view(cart_obj){
    return(
        `
        <tr>
            <th scope="row">
                <img src="${cart_obj['item']['img_url']}" alt="c_image" width="40" height="30"/>
            </th>
            <td>
                ${cart_obj['name']}
            </td>
            <td>
                R ${cart_obj['price']}
            </td>
            <td>
                <div class="qty-container">
                    <input type="text" name="qty" class="q-input" value="${cart_obj['qty']}" />
                    <div class="qty-buttons">
                        <i class="bi bi-caret-up-fill q-b up"></i>
                        <i class="bi bi-caret-down-fill q-b down"></i>
                    </div>
                </div>
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
    let temp = null;
    view.innerHTML = ''
    for(let i=0; i<cart.length; i++){
        view.innerHTML += get_row_view(cart[i]);
    }
}

function update_price(cart, view){
    try{
        view.innerText = cart.total_price
    }catch(err){
        console.log(err)
    }
}