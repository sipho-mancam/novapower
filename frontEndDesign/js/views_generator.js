
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
    console.log(images)
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
                <a class="view-more-buttons h-buttons" >View More</a>
            </div>
          </div>`
    )
}

