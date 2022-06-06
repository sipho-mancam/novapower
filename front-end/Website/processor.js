


function add_to_cart(e){
    // Search for the item using id ...
    e.preventDefault() 
    let _search_key = e.path[0].id
    let package = search_package(pack_list, _search_key)
    console.log(package)

    if (package) {
        cart.add_to_cart(package);
    }
    else{
        alert("Couldn't find the package ...")
    }
    // update the cart icon with the current number of items in the cart
}

function add_to_cart_init(){
    for(let i = 0; i < add_to_cart_buttons.length; i++){
        add_to_cart_buttons[i].addEventListener('click', add_to_cart)
    }
}

function search_package(pack_list, key){
    let _key = key.split(' ')[1]
    return pack_list[_key]
}

add_to_cart_init()