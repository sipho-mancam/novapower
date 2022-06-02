
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


function get_card_html(package, p_type){
    return(
        
        `<div class="cust-card">
              <div class ="image">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfamdwzmQLtnZHPjPNaiukcPqmeLMsGAVbLA&usqp=CAU" width=200 height=200 alt="p-h" />
              </div>
              <div class="info">
                  <hr />
                  <h4>${p_type}</h4>
                  <hr />
                  <span>
                    This backup power system will give you x-hours of backup power under average
                    household usage conditions like plugging a stove,
                    fridge etc..
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


