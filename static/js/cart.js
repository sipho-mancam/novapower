
let form_sub = null
window.addEventListener('load', function(e){

    let add_installation = this.document.getElementById('installation-control')
    
    add_installation.addEventListener('change', function(e){
        let value = e.target.value
        let path = '/add-option?session_token='+_token+'&option=installation';
        if(value == 1){
            make_request('GET',path)
            .then(function(response){
                update_totals(response)
            })
        }
    });

   

    form_sub = document.getElementById('form')    
    get_session_token()
    .then(res=>{
        _token = res
        get_cart_items() // update cart with current data for now ...
       .then(function(){
            cart_table = this.document.getElementById('cart-table')
            cart_total = this.document.getElementById('cart-total')
            update_table(cart.cart_objects, cart_table)

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

function view_quote(html_data){
    const disp = document.getElementById('overlay');
    const cl_q = document.getElementById('close-q-overlay');
    const quote_view = document.getElementById('view-quote');

    disp.style.display = 'block';

    cl_q.addEventListener('click', function(){
        disp.style.display = 'none';
        window.location.pathname = '/';
        print();
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
            .then(
                ()=>{
                    // window.location.pathname = '/'
                    // window.location.reload()
                }
            )
            
            // show them a success message
                 
            let uri = window.URL.createObjectURL(res)
            saveFile(res, 'Quote.pdf')
            // window.open(uri, '_blank')
        }).catch(err=>{
            console.log(err);
            alert("Sorry we couldn't download your quote at this moment, but it has been recevied.")
        })
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

function get_row_view(cart_obj){
    console.log(cart_obj)
//     <span class="size">5kVA - 48V - 5kWh</span><br />
        // < span class="size" > ${ cart_obj["size"]["voltage"] + ' - ' + cart_obj["size"]["voltage"] }</span > <br />

    return(
        `
          <tr id=${cart_obj['item']['obj']['_uid']}>
            <th scope="row">
            <div class="cart-item-details">
                <img src="${cart_obj['item']['img_url']}" alt="c_image" width="100" height="100"/>
                <div class="cart-item-text-details">
                <span class="item-heading">${cart_obj['name']}</span><br />
               
                <span class="cart-item-type">${cart_obj['name']}</span>
                </div>
            </div>
            </td>
            <td> 
            <div class="spinner-border spinner-border-sm" style="display:none" role="status" id=${cart_obj['item']['obj']['_uid'] + 'spinner'} >
                <span class="visually-hidden">Loading...</span>
            </div>
            <div class="qty-container" id=${cart_obj['item']['obj']['_uid']+'qty'}>
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
                <span class="cart-item-unit-price">${cart_obj['price'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}</span>
            </td>
            <td>
            <span class="cart-item-unit-price">${(cart_obj['price']*cart_obj['qty']).toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}</span>
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