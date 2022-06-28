
let form_sub = null
window.addEventListener('load', function(e){
    form_sub = document.getElementById('form')    
    get_session_token()
    .then(res=>{
        _token = res
        get_cart_items() // update cart with current data for now ...
       .then(function(){
            cart_table = this.document.getElementById('cart-table')
            cart_total = this.document.getElementById('cart-total')
            update_table(cart.cart_objects, cart_table)

            let tab_row = document.getElementsByTagName('tr')
            
            form_sub.addEventListener('submit', submit_quote);
            order_button.addEventListener('click', openOrderForm)
            close_order_form.addEventListener('click', closeOrderForm)

            for(let j=0; j<tab_row.length; j++){
                tab_row[j].addEventListener('click', function(e){

                     let _uid = e.currentTarget.getAttribute('id')
               
                    if(e.target.className.split(' ').includes('d-item')){
                        update_cart_server('delete', _uid)
                        window.location.reload()
                    } 

                    if(e.target.className.split(' ').includes('up')){
                        try{
                            update_cart_server('increase', _uid)
                            window.location.reload()
                        }
                        catch(err){console.log(err)}

                    }
                    else if(e.target.className.split(' ').includes('down')){
                        try{
                            update_cart_server('decrease', _uid)

                            window.location.reload()
                        }
                        catch(err){
                            console.log(err)
                        }
                    }
                    
                })
            }

            let tot_buttons = document.getElementsByClassName('tot')
            get_price_summary(_token)
            .then(res=>{
                console.log(res, tot_buttons)
                let keys = Object.keys(res)
                tot_buttons[0].innerText = res[keys[0]]
                tot_buttons[1].innerText = res[keys[2]]
                tot_buttons[2].innerText = res[keys[1]]
            })
        
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


function get_row_view(cart_obj){
    return(
        `
          <tr id=${cart_obj['item']['obj']['_uid']}>
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
                    <input type="text" disabled name="qty" class="q-input" value="${cart_obj['qty']}" />
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

async function get_price_summary(session_token){
    let path = '/price-summary?session_token='+session_token;
    return make_request('GET', path)

}

