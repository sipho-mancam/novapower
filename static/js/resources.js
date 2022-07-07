
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
        "title":"Inverter Package",
        "count":20,
        "data":inverter_packages,
        'images':['https://www.solar-shop.co.za/1741/sunsynk-5kw-inverter-hubble-li-ion-5kwh-package-solar-ready.jpg',
                'https://www.victronenergy.com/upload/products/multiplus_nw.png',
                'https://electrical-compliance-certificate.co.za/wp-content/uploads/inverter_solar_package.png', 
                'https://www.mobile-solarpower.com/uploads/1/2/9/6/12964626/fireshot-capture-141-6500w-48v-solar-charge-inverter-parallel-wifi-monitor-ul1741-listed-sungoldpower-com_orig.png'
                ]

    },
    "solar+inverter+battery":{
        "title":"Solar Package",
        "count":20,
        "data":solar_packages,
        'images':[
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfamdwzmQLtnZHPjPNaiukcPqmeLMsGAVbLA&usqp=CAU",
            "https://s.alicdn.com/@sc04/kf/Hfbd2edb28f02404da030c89ae61a1ef9H.jpg_220x220.jpg",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoG7SL03bsXQod1gkOHLq-nappFtr7HymFAg&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQh1WiV3y5FkLlQnOvj72qJQuh2XABs5R-5kQ&usqp=CAU",
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlUAR4AVkGPVSwN6WNOAbktxmrl9eM-Xy9lQ&usqp=CAU"
        ]
    },
    "generator":{
        "title":"Generator",
        "count":20,
        "data":generator,
        'images':[
                'https://www.adendorff.co.za/wp-content/uploads/2017/05/MGENER-090-NEW.jpg',
                'https://www.adendorff.co.za/wp-content/uploads/2019/12/MGENER-220-NEW.jpg',
                'https://media.takealot.com/covers/35319989/6009605021476-zoom.jpg',
                'https://www.adendorff.co.za/wp-content/uploads/2018/01/MGENER-201-NEW.jpg'
                ]
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

let appliance_list = [
    {
        'name':'Lights',
        'img': "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Noun_Project_lightbulb_icon_1263005_cc.svg/1200px-Noun_Project_lightbulb_icon_1263005_cc.svg.png",
        'power':85,
        'rank':1000
    },
    {
        'name':'Laptop',
        'img': "https://cdn-icons-png.flaticon.com/512/4812/4812557.png",
        'power':60,
        'rank':999
    },
    {
        'name':'Fridge',
        'img': "https://toppng.com/uploads/preview/file-svg-fridge-icon-sv-11563715839vbv5lvmhxn.png",
        'power':500,
        'rank':998
    },
    {
        'name':'TV',
        'img': "https://cdn-icons-png.flaticon.com/512/3443/3443580.png",
        'power':120,
        'rank':997
    },
    {
        'name':'Stove',
        'img': "https://icon-library.com/images/85-512.png",
        'power':3000,
        'rank':996
    },
    {
        'name':'Kettle',
        'img': "https://cdn-icons-png.flaticon.com/512/125/125653.png",
        'power':3000,
        'rank':995
    },
    {
        'name':'Microwave',
        'img': "https://thumbs.dreamstime.com/b/bowl-microwave-icon-outline-style-vector-web-design-isolated-white-background-190751776.jpg",
        'power':1200,
        'rank':994
    },
    {
        'name':'Router',
        'img': "https://cdn-icons-png.flaticon.com/512/2502/2502330.png",
        'power':20,
        'rank':993
    },
    {
        'name':'Computer',
        'img': "https://cdn-icons-png.flaticon.com/512/2502/2502330.png",
        'power':120,
        'rank':992
    }
]

appliance_list.sort(function(a, b){
    return a['power'] - b['power']
})

// console.log(appliance_list)

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
let order_button = document.getElementById('get-quote-b')
let order_form = document.getElementById('order-form')
let close_order_form = document.getElementById('close-order-form')
let featured_products = []
let _token = null
let base_url = '/' //window.location.pathname
let cart_count = null;
let current_v_tab = null;
let v_tab_cont = null;

// console.log(base_url)
