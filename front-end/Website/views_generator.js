
function generate_package_views(packages, container, v_type=null){

    for(let i = 0; i<packages.length; i++){
        container.innerHTML += get_view(packages,v_type)
    }
}

let view = document.getElementById('dis')


generate_package_views(pack_inv_bat, view, true)
// generate_package_views(pack_, view)
// generate_package_views(pack_no_solar, view)

function get_view(package, v_type=null){
    let data = package.get_json()
    let price_var = data['total-price']
    price_var = Math.ceil(price_var)
    if (v_type != null){
        return String(
            ` <div class="card">
                 <div class ="image">
                     <img src="${images[Math.ceil(Math.random() *(images.length-1))]}" width=200 height=200 alt="p-h" />
                 </div>
                 <div class="info">
                     <hr />
                     <h4>${package['title']}</h4>
                     <hr />
                     <p>The components of the package:<br />
                         <ul>
                             <li>Battery - ${data['item 1']['options']['elec-size']}</li>
                             <li>Inverter - ${data['item 0']['options']['elec-size']}</li>
                             <li>MPPT Charge Controller - ${data['item 3']['options']['elec-size']}</li>
                         </ul>
                     </p>
                     <p class='price'>R ${price_var}*</p>
                 </div>
                 <div class="controls">
                     <a class="add-to-cart h-buttons" id="${data['_id']}" >Add to Cart</a> <a class="view-more-buttons h-buttons" >View More</a>
            </div> `
     
         )
    }
   
    return String(
       ` <div class="card">
            <div class ="image">
                <img src="${images[Math.ceil(Math.random() *(images.length-1))]}" width=200 height=200 alt="p-h" />
            </div>
            <div class="info">
                <hr />
                <h4>Solar UPS Systems</h4>
                <hr />
                <p>The UPS is composed of 4 items:<br />
                    <ul>
                        <li>Battery - ${data['item 2']['options']['elec-size']}</li>
                        <li>Inverter - ${data['item 1']['options']['elec-size']}</li>
                        <li>Solar Panels - ${data['item 0']['options']['elec-size']}</li>
                        <li>MPPT Charge Controller - ${data['item 3']['options']['elec-size']}</li>
                    </ul>
                </p>
                <p class='price'>R ${price_var}*</p>
            </div>
            <div class="controls">
                <a class="add-to-cart h-buttons" id="${data['_id']}" >Add to Cart</a> <a class="view-more-buttons h-buttons" >View More</a>
       </div> `

    )
}