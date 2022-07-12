
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

    // add_delivery.addEventListener('change', function(e){
    //     let value = e.target.value

    //     let path = '/add-option?session_token='+_token+'&option=delivery';
    //     if(value == 1){
    //         make_request('GET',path)
    //         .then(function(response){
    //             update_totals(response)
    //         })
    //     }
    // })

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
            })
       })
    })
      
})

function update_totals(res, tot_buttons=document.getElementsByClassName('tot')){
    
    let keys = Object.keys(res)
    tot_buttons[0].innerText = res[keys[0]]
    tot_buttons[1].innerText = res[keys[2]]
    tot_buttons[2].innerText = res[keys[1]]
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
    form_json['sub-tot'] = cart.total_price
    send_quote_form(form_json)
    .then(res=>{
        get_quote()
        .then(res=>{
            
            
            // before showing the use the quote...
            // clear cart...
            update_cart_server('clear')
            
            // show them a success message
            
           

            let uri = window.URL.createObjectURL(res)
            window.open(uri, '_blank')

            window.location.pathname = '/'


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
//     console.log(cart_obj)
//     <span class="size">5kVA - 48V - 5kWh</span><br />
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
                <span class="cart-item-unit-price">R ${cart_obj['price']}</span>
            </td>
            <td>
            <span class="cart-item-unit-price">R ${(cart_obj['price']*cart_obj['qty']).toFixed(2)}</span>
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


function generate_html_for_pdf(extras){
    res = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" type="text/css" />
        <!-- <link rel="stylesheet" href="./quote.css" type="text/css" /> -->
        <title>Quote Template</title>
    </head>
    <style>
        body{
            background-color: rgb(230, 230, 230);
        }

        .main{
            background-color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            border: 1px solid black;
            padding:40px;
        }

        .heading{
            font-weight: bolder;
            font-size: larger;
        }

        .image-container{
            float: right;
            width: fit-content;
        }

        .name{
            font-weight: bold;
            font-size: x-small;
        }

        .text{
            font-size: x-small;
        }

        .value{
            float:right;
            font-size: x-small;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .address{
            font-size: x-small;
        }

        .left-side{
            padding-right: 100px;
        }

        .shaded{
            background-color: rgb(75, 75, 75);
            height: fit-content;
            color:white;
        }

        .t-header{
            height: fit-content;
        }
    </style>
    <body>
        
        <div class="main container">

            <!-- Row 1 -->
            <div class="row header">
            <div class="col">
                <span class="heading">QUOTE</span><br />
                <span class="name">Redbrick Consulting (Pty) Ltd</span><br />
                <span class="address">
                    Optimum house<br />
                    Epsom Downs Office Park<br />
                    13 Sloan Street<br />
                    Bryanston <br />
                    2191
                </span>
            </div>
            <div class="col">
                <div class="image-container">
                    <img src="https://i.ibb.co/bJBDv04/Logo-01.jpg" width="150"  alt="https://i.ibb.co/bJBDv04/Logo-01.jpg" />
                </div>
            </div>
            </div><br />

            <!-- Row 2 -->

            <div class="row"> 
                <div class="col">
                    <div class="left-side">
                        <span class="text vat-no">
                            <span class="name">VAT No:</span><span class="value">4890242344</span>
                        </span><br />
                        <span class="name">Msizi Mhlanga</span><br />
                        <span class="address">
                            16 Onyx<br />
                            Riverside Road<br />
                            Berverley<br />
                            Residential Installation
                        </span>
                    </div>
                </div>
                <div class="col">
                <div class="right-side">
                    <br/>
                    <div class="text">
                        <span class="name">Number:</span><span class="value">RBC_RSI-22071</span>
                    </div>
                    <div class="text ">
                        <span class="name">Date:</span><span class="value">2022/07/05</span>
                    </div>
                    <div class="text">
                        <span class="name">Page:</span><span class="value">1/1</span>
                    </div>
                    <div class="text">
                        <span class="name">Sales Rep:</span><span class="value">Wayne Batchelor</span>
                    </div><br />
                </div>
                </div>
            </div><br />

            <!-- Row 3 -->

            <div class="row"> 
                <div class="col">
                    <div class="left-side">
                        <span class="text vat-no">
                            <span class="name">Customer VAT No:</span><span class="value">N/A</span>
                        </span><br />
                    </div>
                </div>
                <div class="col">
                <div class="right-side shaded">
                    <div class="text">
                        <span class="name">Total Due:</span><span class="value">N/A</span>
                    </div>
                </div>
                </div>
            </div>

            <!-- Row 4 -->
            <div class="row shaded"> 
                <div class="col-5 t-header">
                    <span class="text vat-no">
                        <span class="name">Description</span>
                    </span>
                </div>
                <div class="col">
                    <span class="text vat-no">
                        <span class="name">Rate</span>
                </div>
                <div class="col">
                    <span class="text vat-no">
                        <span class="name">Qty</span>
                    </span>
                </div>
                <div class="col">
                    <span class="text vat-no">
                        <span class="name">Unit Price</span>
                    </span>
                </div>
                <div class="col">
                    <span class="text vat-no">
                        <span class="name">Total</span>
                    </span>
                </div>
            </div><br />

            <div class="row package-name"> 

                <div class="col-5">
                    <div class="row">
                        <div class="col-2">
                            <span class="name">1</span>
                        </div>
                        <div class="col">
                            <span class="name"> Lithium-ion Batteries</span>
                        </div>
                    </div>
                </div>
                <div class="col"></div>
                <div class="col"></div>
                <div class="col"></div>
                <div class="col"></div>
            </div>

            <div class="row data-item"> 
                <div class="col-5">
                    <div class="row">
                        <div class="col-2">
                            <span class="text">1.1</span>
                        </div>
                        <div class="col">
                            <span class="text">4.8kWh 48V Lithium-Ion Battery</span>
                        </div>
                    </div>
                </div>

                <div class="col">
                    <span class="text rate">
                        <span class="text">Fixed</span>
                </div>
                <div class="col">
                    <span class="text qty">
                        <span class="text">2</span>
                    </span>
                </div>
                <div class="col">
                    <span class="text unit-price">
                        <span class="value">R 21 000.43</span>
                    </span>
                </div>
                <div class="col">
                    <span class="text total">
                        <span class="value">R 1 908.26</span>
                    </span>
                </div>
            </div>

            <br />
            <div class="row sub-total" > 
                <div class="col-5"></div>
                <div class="col"></div>
                <div class="col"></div>
                <div class="col">
                    <span class="text sub-total">
                        <span class="name">Sub-total</span>
                    </span>
                </div>
                <div class="col">
                    <span class="text ">
                        <span class="value">R 1 908.26</span>
                    </span>
                </div>
            </div>

            <div class="row vat" > 
                <div class="col-5"></div>
                <div class="col"></div>
                <div class="col"></div>
                <div class="col">
                    <span class="text">
                        <span class="name">VAT</span>
                    </span>
                </div>
                <div class="col">
                    <span class="text total">
                        <span class="value">R 1 08.26</span>
                    </span>
                </div>
            </div>

            <div class="row sub-total" > 
                <div class="col-5"></div>
                <div class="col"></div>
                <div class="col"></div>
                <div class="col">
                    <span class="text">
                        <span class="name">Total</span>
                    </span>
                </div>
                <div class="col" style="border-top: 1px solid black;">
                    <span class="text total">
                        <span class="value">R 1 908.26</span>
                    </span>
                </div>
            </div>


            <div class="row Description" > 
                <div class="col-1"></div>
                <div class="col">
                    <span class="name">System Features:</span><br />

                    <span class="text">
                        this solar package will power the following items:<br />
                        stove, kettle, LCD TV, DSTV
                    </span>
                </div>
                
            </div>
            <div class="row banking details" > 
                <div class="col">
                        <div class="left-side">
                        <span class="name">BANKING DETAILS:</span><br />
                        <div class="text">
                            <span class="name">Bank:</span><span class="value">Standard</span>
                        </div>
                        <div class="text ">
                            <span class="name">Account No:</span><span class="value">270 930 744</span>
                        </div>
                        <div class="text">
                            <span class="name">Branch:</span><span class="value">Thibault Sqaure</span>
                        </div>
                        <div class="text">
                            <span class="name">Branch Code:</span><span class="value">02 09 09</span>
                        </div><br />
                        
                    </div>
                </div>
                <div class="col"></div>
            </div>

            <div class="row terms and conditions" > 
                <div class="col-9">
                    <span class="text" style="font-size: 0.6em;" >
                        Payment Terms: 90% Deposit, 10% on completion and commissioning
                        Note: All equipment remains the property of RedBrick Consulting (PTY) until invoice is paid in full.
                        RedBrick offer a 6 month warrantee on installation only
                        RedBrick will manage warrantee of equipment with suppliers on behalf of the supplier.
                        RedBrick cannot guarentee performance of system
                        The Price quoted is for the installation works only, 
                        RedBrick are not liable for additional costs as a result of existing errors or issues on 
                        existing equipment and electrical installation at the client's site. Any additional works required 
                        will be quoted and need to be accepted before any additional works will commence
                    </span>
                </div>
                <div class="col"></div>
            </div>
        </div>

    </body>
    <!-- <script src="https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js" type="text/javascript"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/js/bootstrap.bundle.min.js" type="text/css" media="all"></script>-->
    <!-- <script src="./quote.js" type="text/javascript"></script>  -->

    </html>
    
    `
}
