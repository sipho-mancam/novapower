
function get_package_groups(data_json){
    let _keys = Object.keys(data_json);
    let temp = null;
    let package_groups_list = []
    for(let i=0; i<_keys.length; i++){
        temp = new PackageGroup(data_json[_keys[i]]);
        temp['id'] = _keys[i];
        package_groups_list.push(temp);
    }
    return package_groups_list
}


let solar_packages = {}

let inverter_packages ={}

let generator={}

let packages_data = {
    "inverter+battery":{
        "title":"Inverter - Battery",
        "count":20,
        "data":inverter_packages
    },
    "solar+inverter+battery":{
        "title":"Solar panels, Inverters and Battery",
        "count":20,
        "data":solar_packages
    },
    "generator":{
        "title":"Generator",
        "count":20,
        "data":generator
    }
}

let images = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfamdwzmQLtnZHPjPNaiukcPqmeLMsGAVbLA&usqp=CAU",
    "https://s.alicdn.com/@sc04/kf/Hfbd2edb28f02404da030c89ae61a1ef9H.jpg_220x220.jpg",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoG7SL03bsXQod1gkOHLq-nappFtr7HymFAg&usqp=CAU",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh1WiV3y5FkLlQnOvj72qJQuh2XABs5R-5kQ&usqp=CAU",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlUAR4AVkGPVSwN6WNOAbktxmrl9eM-Xy9lQ&usqp=CAU"
]

let groups_maps = {
    'Solar Packages':'solar+inverter+battery',
    'Inverter Packages':'inverter+battery',
    'Generator Packages':'generator'
}

let view = document.getElementById('tab-content')
let add_to_cart_buttons = document.getElementsByClassName('add-to-cart')
let view_more_buttons = document.getElementsByClassName('view-more-buttons')
let cart = new Cart([])
let tabs = document.getElementsByClassName('tab')
let current_tab = tabs[0]
let tab_content = document.getElementById('tab-cont')
let package_groups = get_package_groups(packages_data);
let current_list = package_groups[1].get_package_list()
let cart_badge = document.getElementById('cart-badge')
let cart_button = document.getElementById('cart-button')
let qty_buttons = document.getElementsByClassName('q-b')
let qty_buttons_down = null;
let qty_buttons_up = null;
let cart_table = null
let cart_total = null
let current_cart_obj = null;
let overlay = document.getElementById('view-detail')
let close_overlay = document.getElementById('close-overlay')

console.log(overlay)