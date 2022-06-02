
window.addEventListener('load', function(e){
    qty_buttons_up = this.document.getElementsByClassName('up')
    qty_buttons_down = this.document.getElementsByClassName('down')
    let res = window.sessionStorage.getItem('cart')
    cart = deserialiseCart(JSON.parse(res))

    console.log(cart)
    cart_table = this.document.getElementById('cart-table')
    cart_total = this.document.getElementById('cart-total')
    update_table(cart.cart_objects, cart_table)
    update_price(cart, cart_total)
    for(let i=0; i<qty_buttons_up.length; i++){
        qty_buttons_up[i].addEventListener('click', incrementQty)
        qty_buttons_down[i].addEventListener('click', decrementQty)
    }
})



function incrementQty(event){
    let elem = event.currentTarget;
    let parent = elem.parentNode;
    let parent_parent = parent.parentNode
    let inp = parent_parent.children[0]
    let val = parseInt(inp.value);
    inp.value = val+1; // update screen, 
    // let package = search_package()
}

function decrementQty(event){
    let elem = event.currentTarget;
    let parent = elem.parentNode;
    let parent_parent = parent.parentNode
    let inp = parent_parent.children[0]
    let val = parseInt(inp.value);
    inp.value = val-1>0?val-1:0;
}

function deserialisePackages(package){
    return new Package(package.obj)
}

function deserialiseCart(cart){
    let temp = []
    for(let i=0; i<cart.cart_list.length; i++){
        temp.push(deserialisePackages(cart.cart_list[i]))
    }
    return new Cart(temp)
}

function get_row_view(cart_obj){
    return(
        `
        <tr>
            <th scope="row">
                <img src="https://i.pinimg.com/564x/f7/12/98/f71298f873880592c4202e19a06da3a9.jpg" alt="c_image" width="40" height="30"/>
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
                    <i class="bi bi-trash"></i>
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