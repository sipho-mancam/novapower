function add_to_cart(e){
    // Search for the item using id ...
    e.preventDefault() 
    let _search_key = e.path[0].id
    let package = search_package(current_list, _search_key)

    if (package) {
        cart.add_to_cart(package);
        cart_badge.innerText = cart.cart_list.length;
    }
    else{
        alert("Couldn't find the package ...")
    }
    console.log(cart)
    // update the cart icon with the current number of items in the cart
}

function add_to_cart_init(){
    try{
        for(let i = 0; i < add_to_cart_buttons.length; i++){
            add_to_cart_buttons[i].addEventListener('click', add_to_cart)
        }
        cart_button.addEventListener('click', openCart)
    }catch(err){
        console.log(err)
    }
    
}

function search_package(pack_list, key){
    let _key = key.split(' ')[1]
    return pack_list[_key]
}

function search_package_group(p_list, id){
    let res = null;
    for(let i=0; i<p_list.length; i++){
        if(p_list[i].get_id() == id){
            res = p_list[i];
            break;
        }
    }
    return res;
}

function init_tabs(){
    for(let i=0; i<tabs.length; i++){
        tabs[i].addEventListener('click', openTab)
    }
}

function openTab(event){
    current_tab.className = current_tab.className.replace(' active-tab', ' ')
    event.currentTarget.className += ' active-tab'
    current_tab = event.currentTarget;

    event.preventDefault();

    // do some logic to append data to the tab
    let id = groups_maps[event.currentTarget.innerText]

    let package_group = search_package_group(package_groups, id);

    if(package_group){
        current_list = package_group.get_package_list()
        get_package_group_views(package_group, tab_content)
        add_to_cart_buttons = document.getElementsByClassName('add-to-cart')
        add_to_cart_init()
    }
    else{
        current_list = null;
        tab_content.innerHTML = `<p class="err">
                                    No packages in this group ... Contact RBC for enquiries
                                </p>`
    }
}

function openCart(event){
    try{
        event.preventDefault()

        window.sessionStorage.setItem('cart', JSON.stringify(cart))
        window.location.pathname = window.location.pathname.replace('index.html','cart.html');
        
        for(let i =  0; i<qty_buttons.length; i++){
            
        }
    }catch(err){
        console.log(err)
    }   
}





init_tabs()
get_package_group_views(search_package_group(package_groups,groups_maps['Solar Packages']), tab_content)
add_to_cart_init()