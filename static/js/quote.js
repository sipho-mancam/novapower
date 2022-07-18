// add address to the quote.
// Add Package name
// iterate package items
// add totals

function format_csa(address_str=''){
    let address = address_str.split(',');
    address = address.map(function(obj){
        return obj.trim();
    });
    return address.join("<br />")
}

function format_package(package, index=1){

    try{
        let items_list = package['item_list']
        const name  = package['name']
        const indx = String(index)

        items_list = items_list.map(function(item){
            return `
            <div class="row data-item"> 
            <div class="col-5">
                <div class="row">
                    <div class="col-2">
                        <span class="text"></span>
                    </div>
                    <div class="col">
                        <span class="text">${item.energy.value+''+item.energy.unit
                                            +' '+
                                            item.voltage.value+''+item.voltage.unit+
                                            ' '+item['brand'] 
                                            +' '+ item['type'] 
                                            + ' '+ item['name']}
                        </span>
                    </div>
                </div>
            </div>

            <div class="col">
                <div class="text rate">
                    <span class="text">Fixed</span>
                </div>
            </div>
            <div class="col">
                <div class="text qty">
                    <span class="text">${item['qty']}</span>
                </div>
            </div>
            <div class="col">
                <div class="text unit-price">
                    <span class="value">${item['price']}</span>
                </div>
            </div>
            <div class="col">
                <div class="text total">
                    <span class="value">${item['total_price']}</span>
                </div>
            </div>
        </div>
            

            `
        })
        return `
        <div class="row package-name"> 

            <div class="col-5">
                <div class="row">
                    <div class="col-2">
                        <span class="name">${indx}</span>
                    </div>
                    <div class="col">
                        <span class="name">${name}</span>
                    </div>
                </div>
            </div>
            <div class="col"></div>
            <div class="col"></div>
            <div class="col"></div>
            <div class="col"></div>
        </div>
        ${items_list.join('')}
        `
    }catch(err){
        console.log(err)
    }
}

function format_packages(packages){

    let res = ''
    for(let i=0; i<packages.length; i++){
        res += format_package(packages[i], i+1)
    }
    return res
}

function generate_html_for_pdf(data){
    res = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.0-beta1/dist/css/bootstrap.min.css" type="text/css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.3/font/bootstrap-icons.css">
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

        .product-container{
            display: flex;
            flex-flow: column;
            width: fit-content;
            height: fit-content;
            border: 1px solid rgb(173, 173, 173);
            background-color: white;
            border-radius: 5px;
            padding:5px;
            margin: 2px;
        }
        
        .product-img{
            /* border: 1px solid black; */
            margin: auto;
        }
        
        .product-name{
            /* border: 1px solid black; */
            font-size: medium;
        }
        
        .apps-container{
            display: flex;
            flex-flow: row;
            flex-wrap: wrap;
            width: 100%;
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
                    2191<br />
                    <i class="bi bi-envelope-fill"></i>&nbsp;novapower@rbconsult.co.za<br />
                    <i class="bi bi-telephone-fill"></i>&nbsp;011 463 0073
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
                        <span class="name">${data['name']}</span><br />
                        <span class="address">
                            ${format_csa(data['address'])} <br />
                            ${'<i class="bi bi-envelope-fill"></i>&nbsp;'+data['email']+'<br />'+'<i class="bi bi-telephone-fill"></i>&nbsp;'+data['cell']+'<br />'}
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
                        <span class="name">Total Due:</span><span class="value">${data['price-summary']['total'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}</span>
                    </div>
                </div>
                </div>
            </div>

            <!-- Row 4 -->
            <div class="row shaded"> 
              <div class="col-5 t-header">
                  <div class="text vat-no">
                      <span class="name">Description</span>
                  </div>
              </div>
              <div class="col">
                  <div class="text vat-no">
                      <span class="name">Rate</span>
                  </div>
              </div>
              <div class="col">
                  <div class="text vat-no">
                      <span class="name">Qty</span>
                  </div>
              </div>
              <div class="col">
                  <div class="text vat-no" style="float: right;" >
                      <span class="name">Unit Price</span>
                  </div>
              </div>
              <div class="col">
                  <div class="text vat-no" style="float:right ;">
                      <span class="name">Total</span>
                  </div>
              </div>
            </div><br />
  

           ${format_packages(data['cart-list'])}

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
                       <span class="value">${data['price-summary']['sub-total'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}</span>
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
                       <span class="value">${data['price-summary']['vat'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}</span>
                   </span>
               </div>
           </div>

           <div class="row total" > 
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
                       <span class="name">${data['price-summary']['total'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}</span>
                   </span>
               </div>
           </div>

            <div class="row Description" > 
                <div class="col-1"></div>
                <div class="col">
                    <span class="name">System Features:</span><br />

                    <span class="text">
                       ${data['cart-list'][0]['description']}
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

    return res
}


