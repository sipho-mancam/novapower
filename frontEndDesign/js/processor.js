function parse_json(data) {
    // console.log(data)
    packages_data['inverter+battery']['data'] = data['inverter']
    packages_data['solar+inverter+battery']['data'] = data['solar']
    // packages_data['generator']['data'] = data['generator']
}



function add_to_cart(e){
    // Search for the item using id ...
    // console.log('I run ... ad to cart')
    e.preventDefault() 
    let _search_key = e.path[0].id
    let package = search_package(current_list, _search_key)

    // console.log('Current -->\n',current_list)

    if (package) {
        cart.add_to_cart(package);
        cart_badge.innerText = cart.cart_list.length;
    }
    else{
        alert("Couldn't find the package ...")
    }
    // update the cart icon with the current number of items in the cart
}

function view_more(e){

    e.preventDefault() 
    let _search_key = e.path[0].id
    _search_key = _search_key.split('+')[0]
    let package = search_package(current_list, _search_key)

    if (package) {
        overlay.innerHTML = get_view_more(package, package.name)
        overlay.style.display='flex';
        close_overlay = document.getElementById('close-overlay')
        close_overlay.addEventListener('click', close)
    }
    else{
        alert("Couldn't find the package ...")
    }

}

function add_to_cart_init(){
    try{
        for(let i = 0; i < add_to_cart_buttons.length; i++){
            add_to_cart_buttons[i].addEventListener('click', add_to_cart)
            view_more_buttons[i].addEventListener('click', view_more)
        }
        cart_button.addEventListener('click', openCart)
    }catch(err){
        console.log(err)
    }
    
}

function search_package(pack_list, key){
    
    for(let i=0; i<pack_list.length; i++){
        if(pack_list[i].id == key) return pack_list[i]
    }
    return null
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
        let st = window.location.pathname
        window.location.pathname = window.location.pathname.replace(st.match('/[a-zA-Z0-9]+.html')[0].split('/')[1],'cart.html');

    }catch(err){
        console.log(err)
    }   
}

function close(e){
    overlay.style.display = 'none'
}

function is_session_token(){
    let session_token = window.sessionStorage.getItem('session_token')
    return session_token == null
}

function make_request(method, url, data){
    const promise = new Promise((resolve, reject) =>{

        const xhttp = new XMLHttpRequest()
        xhttp.open('GET', url, true)
        xhttp.withCredentials=true
        xhttp.responseType='json'

        if(data){
            xhttp.setRequestHeader('Content-Type', 'application/json')

        }

        xhttp.onerror = (e)=>{
            reject(xhttp.response)
        }

        xhttp.onreadystatechange = function(){

            if(xhttp.readyState == 4 && xhttp.status == 200){ 
                resolve(xhttp.response)
            }
            else if( xhttp.status >= 400){ // request unsuccesful
                reject(xhttp.response)
            }
        }

        xhttp.ontimeout = function(){
            alert('timedout')
        }
        
        xhttp.send(JSON.stringify(data))
    })
    return promise
    
}

 async function request_token(url){

    let s_url = 'session?session_id='+12312341//Math.random()*10000
    let session_token = null
    await make_request('GET', base_url+s_url)
    .then(responseData=>{
        try{
           
            session_token = responseData.session_token


        }catch(err){
            console.log(err)
        }
    })
    .catch(err=>{
        console.log(err)
    })
    localStorage.setItem('session_token', session_token)
    
    return session_token

}

async function get_session_token(){
    let session_token = window.localStorage.getItem('session_token')
    
    if(session_token == null){
        session_token = await request_token()
        // session_token = await request_token()
        console.log(session_token)
    }
   
    return session_token
}