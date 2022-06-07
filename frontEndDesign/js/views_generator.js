
function get_package_group_views(package_group, view){
    try{
        view.innerHTML = ''
        for(let i=0; i<package_group.get_package_list().length; i++){
            view.innerHTML += get_card_html(package_group.get_package_list()[i],
                                        package_group.get_group_title());
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
    for(let k=0; k<keys.length; k++){
        if(item_list[k].name){
            temp = `<li>${item_list[k].name} - ${item_list[k].size[(Object.keys(item_list[k].size))[0]]['value']} ${item_list[k].size[(Object.keys(item_list[k].size))[0]]['unit']}</li>`
            v += temp
        }
    }
    v += '</ul>';
    return v
}

function get_card_html(package, p_type){
    return(
        `<div class="cust-card">
              <div class ="image">
                  <img src="${images[Math.ceil(Math.random()*(images.length-1))]}" width=200 height=200 alt="p-h" />
              </div>
              <div class="info">
                  <hr />
                  <h4>${p_type}</h4>
                  <hr />
                  <span>
                    In this package we have: <br />
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
    let v = '<ul>';
    let temp = ''
    let keys = item_list;
    for(let k=0; k<keys.length; k++){
        if(item_list[k].name){
            temp = `<li>${item_list[k].name} - 
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
              <img src="https://s.alicdn.com/@sc04/kf/Hfbd2edb28f02404da030c89ae61a1ef9H.jpg_220x220.jpg" class="img-thumbnail img-fluid" alt=""/>
            </div>

            <div class="text">
                <h4>${p_type}</h4>

                <p>This packages/Items has the below specifications:</p>

                <ul>
                  ${get_item_full(package)}
                </ul>
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