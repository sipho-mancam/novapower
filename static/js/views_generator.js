function get_package_group_views(package_group, view, name, append=false){
    try{
        if(!append)view.innerHTML = ''
        let index = 0;
        for(let i in package_group){

            view.innerHTML += get_card_html(package_group[i], name, index);
            index ++;
        }
    }catch(err){
        console.log(err)
    }
}

function get_item(package, name='generator'){
    let item_list = package.items;
    let v = '<ul>';
    let temp = ' ';

    if(name.toLowerCase()!= 'generator'){
        for(let k of item_list){
            if(k.name){
                item = k; 
                if(k.name == 'Solar'){
                    temp += `<li>${package['solar-qty']} x ${k.size.Power.value} ${k.size.Power.unit} ${k.name} panels</li>`;
                    v+= temp;
                }
                else if(item.name =='Battery'){
                    let i = item
                    v+= `<li>Battery backup of ${i.size.Energy.value}${i.size.Energy.unit}</li>`;
                } 
            }

        }
        v+=`<li>Maximum power Output of ${package['max-power']}kW</li>`;
        v += '</ul>';
        return v
    }else{
        for(let k of item_list){
            if(k.name){
                item = k;
                if(item.name.toLowerCase() =='generator'){
                    let i = item
                    v+= `<li>Max power Output of ${i.size.Size.value}${i.size.Size.unit}</li>`;
                } 
            }

        }
        v += '</ul>';
        return v
    }
}

function get_package_image(package){
    let p = package;
    let items = p.items
    for(let i of items){
        if('image_url' in i){
            return i['image_url']
        }
    }
    return images[Math.ceil(Math.random()*(images.length-1))] // return a place holder in the event that we don't find the image.
}

function get_card_html(package, name='Solar', index){
    if(get_package_image(package)!=0){
        if(name.toLowerCase() != 'generator'){
            return(
                `<div class="cust-card">
                        <div class ="image">
                            <img  src="${get_package_image(package)}" alt="${images[Math.ceil(Math.random()*(images.length-1))]}" width="210" height="210"  alt="p-h" />
                        </div>
                        <div class="info">
                            
                        <span>
                            ${get_voltage(package)} system with:  <br />
                            ${get_item(package, name)}
                        </span>
                            <p class='price'>${package['price'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}*</p>
                        </div>
                    <div class="controls">
                        <a class="add-to-cart h-buttons" id="${package['_uid']}" index=${index}>Add to Cart</a> 
                        <a class="view-more-buttons h-buttons" id="${package['_uid']}+1" index=${index}>View Details</a>
                    </div>
                    </div>`
            )
        }else{
        return(`<div class="cust-card">
                    <div class ="image">
                        <img  src="${get_package_image(package)}" alt="${images[Math.ceil(Math.random()*(images.length-1))]}" width=200 height=200 alt="p-h" />
                    </div>
                    <div class="info">
                        
                        <span>
                        ${get_item(package)}
                        </span>
                        <p class='price'>${package['price'].toLocaleString('af-ZA', { style: 'currency', currency: 'ZAR' }) }*</p>
                    </div>
                <div class="controls">
                    <a class="add-to-cart h-buttons" id="${package['_uid']}" index=${index}>Add to Cart</a> 
                    <a class="view-more-buttons h-buttons" id="${package['_uid']}+1" index=${index}>View Details</a>
                </div>
                </div>`)
        }
    }else{return ""}
  
}

function get_item_full(package){
    // console.log(package)
    let item_list = package.items;
    let v = '<ul><b>Name: Brand - Type</b>';
    let temp = ''

    for(let k of item_list){
        if(k.name){
            temp = `<li><b>${k.name}</b>:&nbsp;&nbsp;   
                        ${k.brand} - 
                        ${k['type-group']} :
                            <ul>
                                ${get_size(k.size)}
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
    let item_list = package.items;
    let temp = '';
    let v = 'Components <br /><ul>'
    for(let k of item_list){
        if(k.name){
            temp = `<li><b>${k.name}</b>:&nbsp;&nbsp;   
                        ${k.brand} - 
                        ${k['type-group']} 
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

function get_view_more(package, name){
    return(
        `
        <div class="view-details-card container">
            <div class="img v-img">
                <img src="${get_package_image(package)}" class="img-thumbnail" width="300px" height="300px" alt=""/>
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
                   ${package['description']?package['description']:get_product_summary(package)}
                </div>
                
                <p class='price'>${package['price'].toLocaleString('af-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 2 }) }*</p>
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
        total_power = variable.size.Size.value*1000;
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