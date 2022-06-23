function get_package_group_views(package_group, view, append=false){
    try{
        if(!append)view.innerHTML = ''
        for(let i=0; i<package_group.get_package_list().length; i++){
            view.innerHTML += get_card_html(package_group.get_package_list()[i]);
        }
    }catch(err){
        console.log(err)
    }
}

function get_item(package){
    let item_list = package.item_list;
    let v = '<ul>';
    let temp = ''
    let keys = item_list;
    let p_obj = package.obj

    for(let k=0; k<keys.length; k++){
        if(item_list[k].name){
            item = item_list[k]; 
            if(item_list[k].name == 'Solar'){
                temp += `<li>${p_obj['solar-qty']} x ${item.json_obj.size.Power.value} ${item.json_obj.size.Power.unit} ${item_list[k].name} panels</li>`;
                v+= temp
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
}


function get_voltage(package){
    
    try{
        let raw = package.obj
        let inverter = null
        // console.log(raw)
        for(let i of Object.keys(raw)){
           
            if(i !== '_uid' && raw[i].name.toLowerCase() == 'inverter'){
                inverter = raw[i]
                break;
            }
        }
        
        if('Voltage' in inverter){
            console.log(inverter)
            return `${inverter.size.Voltage.value} ${inverter.size.Voltage.unit}`
        }
        else if('BatVoltage' in inverter){
            return `${inverter.size.BatVoltage.value} ${inverter.size.BatVoltage.unit}`
        }
        else{
            return ' '
        }
    }catch(e){
        console.log(e)
    }
}

function get_card_html(package){
  
    return(
        `<div class="cust-card">
              <div class ="image">
                  <img  src="${package.img_url}" alt="${images[Math.ceil(Math.random()*(images.length-1))]}" width=200 height=200 alt="p-h" />
              </div>
              <div class="info">
                  
                  <span>
                    ${get_voltage(package)} system with:  <br />
                    ${get_item(package)}
                  </span>
                  <p class='price'>R ${package.get_total_price()}*</p>
              </div>
            <div class="controls">
                <a class="add-to-cart h-buttons" id="${package.get_id()}" >Add to Cart</a> 
                <a class="view-more-buttons h-buttons" id="${package.get_id()}+1">View Details</a>
            </div>
          </div>`
    )
}

function get_item_full(package){
    let item_list = package.item_list;
    let v = '<ul>  <li><b>Name :Brand - Type: size</b></li>';
    let temp = ''
    let keys = item_list;
    for(let k=0; k<keys.length; k++){
        if(item_list[k].name){
            temp = `<li><b>${item_list[k].name}</b>:&nbsp;&nbsp;   
                        ${item_list[k].brand} - 
                        ${item_list[k].type} : size (
                            ${get_size(item_list[k].size)}
                            )
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
        res += `${keys[i]} ${item_size[keys[i]]['value']}${item_size[keys[i]]['unit']} ,`
    }

    return res

}

function get_view_more(package, p_type){
    return(
        `
        <div class="view-details-card container">
            <div class="img v-img">
              <img src="${package.img_url}" class="img-thumbnail img-fluid" alt=""/>
            </div>

            <div class="text">
                <h4>${package.name}</h4>

                <p>This packages/Items has the below specifications:</p>
                   
                  ${get_item_full(package)}
                
                <p class='price'>R ${package.get_total_price()}*</p>
                <div class="buttons">
                  <a class="close-buttons h-buttons b close" id="close-overlay">Close</a>
                </div>
            </div>
        </div>
        `
    )
    //   <a class="add-to-cart h-buttons b" id="" >Add to Cart</a> 
}