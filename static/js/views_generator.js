function get_package_group_views(package_group, view, name, append=false){
    console.log(package_group)
    try{
        if(!append)view.innerHTML = ''
        for(let i in package_group){
            view.innerHTML += get_card_html(package_group[i]);
        }
    }catch(err){
        console.log(err)
    }
}

function get_item(package){
    let item_list = package.item_list;
    let v = '<ul>';
    let temp = ' ';
    let keys = item_list;
    let p_obj = package.obj;

    if(package.name.toLowerCase()!= 'generator'){
        for(let k=0; k<keys.length; k++){
            if(item_list[k].name){
                item = item_list[k]; 
                if(item_list[k].name == 'Solar'){
                    temp += `<li>${p_obj['solar-qty']} x ${item.json_obj.size.Power.value} ${item.json_obj.size.Power.unit} ${item_list[k].name} panels</li>`;
                    v+= temp;
                }
                else if(item.name =='Battery'){
                    let i = item.json_obj
                    v+= `<li>Battery backup of ${i.size.Energy.value}${i.size.Energy.unit}</li>`;
                } 
            }

        }
        v+=`<li>Maximum power Output of ${p_obj['max-power']}kW</li>`;
        v += '</ul>';
        return v
    }else{
        for(let k=0; k<keys.length; k++){
            if(item_list[k].name){
                item = item_list[k]; 
               
                if(item.name.toLowerCase() =='generator'){
                    let i = item.json_obj
                    v+= `<li>Max power Output of ${i.size.Size.value}${i.size.Size.unit}</li>`;
                } 
            }

        }
        v += '</ul>';
        return v
    }
}

function get_card_html(package, name='Solar'){
  if(name.toLowerCase() != 'generator'){
    return(
        `<div class="cust-card">
              <div class ="image">
                  <img  src="${'package.img_url'}" alt="${images[Math.ceil(Math.random()*(images.length-1))]}" width="210" height="210"  alt="p-h" />
              </div>
              <div class="info">
                  
                  <span>
                    ${"get_voltage(package)"} system with:  <br />
                    <!-- ${'get_item(package)'} -->
                  </span>
                  <p class='price'>${package['price'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}*</p>
              </div>
            <div class="controls">
                <a class="add-to-cart h-buttons" id="${package['_uid']}" >Add to Cart</a> 
                <a class="view-more-buttons h-buttons" id="${package['_uid']}+1">View Details</a>
            </div>
          </div>`
    )
  }
  else{
    return(`<div class="cust-card">
              <div class ="image">
                  <img  src="${package.img_url}" alt="${images[Math.ceil(Math.random()*(images.length-1))]}" width=200 height=200 alt="p-h" />
              </div>
              <div class="info">
                  
                  <span>
                    ${get_item(package)}
                  </span>
                  <p class='price'>${package.get_total_price().toLocaleString('af-ZA', { style: 'currency', currency: 'ZAR' }) }*</p>
              </div>
            <div class="controls">
                <a class="add-to-cart h-buttons" id="${package.get_id()}" >Add to Cart</a> 
                <a class="view-more-buttons h-buttons" id="${package.get_id()}+1">View Details</a>
            </div>
          </div>`)
  }
}

function get_item_full(package){
    // console.log(package)
    let item_list = package.item_list;
    let v = '<ul><b>Name: Brand - Type</b>';
    let temp = ''
    let keys = item_list;
    for(let k=0; k<keys.length; k++){
        if(item_list[k].name){
            temp = `<li><b>${item_list[k].name}</b>:&nbsp;&nbsp;   
                        ${item_list[k].brand} - 
                        ${item_list[k].json_obj['type-group']} :
                            <ul>
                                ${get_size(item_list[k].size)}
                            </ul>
                    </li>`
            v += temp
        }
    }
    v += '</ul>';

    return v

}

function get_size(item_size){
    let keys = Object.keys(item_size);
    let res = ''
    for(let i=0; i<keys.length; i++){
        res += `<li><em>${keys[i]}</em>: ${item_size[keys[i]]['value']}${item_size[keys[i]]['unit']}</li> `
    }

    return res

}

function get_product_summary(package){
    let item_list = package.item_list;
    let temp = ''
    let keys = item_list;
    let v = 'Components <br /><ul>'
    for(let k=0; k<keys.length; k++){
        if(item_list[k].name){
            temp = `<li><b>${item_list[k].name}</b>:&nbsp;&nbsp;   
                        ${item_list[k].brand} - 
                        ${item_list[k].json_obj['type-group']} 
                    </li>`
            v += temp
        }
    }
    v += '</ul>';

    v += 'Description <br />'
    
    v += `<ul>
        <span style="color:grey;font-size:medium;">This ${package.name} can power the following appliances: </span>

        ${get_pluggable_apps_view(package)}<br />
    </ul> `

    // <span class =${hide_text(package)}>Can the inverter be able to upgrade to solar later? <img src=${show_cross_or_tick(package)} width="25" height="25" />   </span>

    v += '<span style="color:red;font-size:small;">Price excludes installation</span>'

    return v
}

function show_cross_or_tick(package){

    let inverter = search_item_in_package(package, 'Inverter');
   // || inverter.json_obj['type-group'].toLowerCase() == 'hybrid'
    if(inverter){
        if(inverter.json_obj['type-group'].toLowerCase() == 'hybrid' || inverter.json_obj['type-group'].toLowerCase() == 'stand-alone'){
            return 'https://flyclipart.com/thumb2/green-tick-check-mark-tick-green-clipart-free-to-use-clip-art-616217.png'
        }
        else{
            return 'https://coneyislandpark.com/wp-content/uploads/2020/10/AdobeStock_337038526-scaled.jpeg'
           
        }
    }
    return 'https://e7.pngegg.com/pngimages/994/729/png-clipart-exclamation-mark-exclamation-mark.png'
}

function hide_text(package){
    if(package.name.toLowerCase() != 'inverter package'){
        return 'hide'
    }
    else{
        return ' '
    }
}

function get_view_more(package, p_type){
    return(
        `
        <div class="view-details-card container">
            <div class="img v-img">
                <img src="${package.img_url}" class="img-thumbnail" width="300px" height="300px" alt=""/>
            </div>

            <div class="text">
                <h4>${package.name}</h4>
                <ul class="nav nav-tabs">
                    <li class="nav-item active-tab v-tab">
                        <a class="nav-link"  aria-current="page" href="#">Summary</a>
                    </li>
                    <li class="nav-item v-tab">
                        <a class="nav-link" href="#" >Technical Details</a>
                    </li>
                    <li class="nav-item v-tab">
                        <a class="nav-link" href="#" >Reviews</a>
                    </li>
                </ul>

                <div class="tab-content" style="width: 100%; display:block; margin-top:5px;" id="v-tab-cont">
                   ${package['description']}
                </div>
                
                <p class='price'>${package.get_total_price().toLocaleString('af-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }) }*</p>
                <div class="buttons">
                  <a class="close-buttons h-buttons b close" id="close-overlay">Close</a>
                </div>
            </div>
        </div>`)
}

function get_pluggable_view(p_obj){
    
    return(`
    <div class="product-container">
        <img class="product-img" src=${p_obj.img} width="40" height="40" />
        <span class="product-name">${p_obj.name}</span>
    </div>
    `)
}

function get_pluggable_apps(package){
    let inverter = search_item_in_package(package, 'Inverter');
    let total_power = 0
    let res = ''
    let variable = null;
    
    if(inverter)variable = inverter;
    else{
        
        if(package.name.toLowerCase() == 'generator'){
            variable = search_item_in_package(package, 'generator');
        }
        
    }
    
   
    if(variable){
        total_power = variable.json_obj.size.Size.value*1000;
        for(let i of appliance_list){
            total_power -= i['power'];
            if(total_power < 0)break;
            res += get_pluggable_view(i)
        }
        return res
    }
}

function get_pluggable_apps_view(package){
//    console.log(get_pluggable_apps(package))
    return(`<div class="apps-container">
        ${get_pluggable_apps(package)}
    </div>
    `)
}