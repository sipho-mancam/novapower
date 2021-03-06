function parse_json(data) {
    // console.log(data)
    try{
        packages_data['inverter+battery']['data'] = data['inverter']
        packages_data['solar+inverter+battery']['data'] = data['solar']
        packages_data['generator']['data'] = data['generator']
    }catch(err){
        console.log(err)
    }
    
}

function add_to_cart(e){
    e.preventDefault() 
    // let _search_key = e.path[0].id
    let _search_key = e.currentTarget.getAttribute('id')
   
    let package = search_package(current_list, _search_key)
    // console.log(package)
    if (package) {
        let p_group = package.name.split(' ')[0]
        make_request('POST', '/add-to-cart?session_token='+_token, {
            'group': p_group,
            '_uid':package.id,
            'qty':1,
            'package':package
        })
        .then(res=>{
            get_cart_count();  // update the cart icon with the current number of items in the cart
        })

        cart.add_to_cart(package);
    }
    else{
        alert("Couldn't find the package ...")
    }
   
}

function view_more(e){

    e.preventDefault() 
    let _search_key = e.target.getAttribute('id')
    _search_key = _search_key.split('+')[0]
    let package = search_package(current_list, _search_key)

    if (package) {

        overlay.innerHTML = get_view_more(package, package.name)
        overlay.style.display='flex';
        close_overlay = document.getElementById('close-overlay')
        close_overlay.addEventListener('click', close)
        
        let v_tab_buttons = document.getElementsByClassName('v-tab')
        v_tab_cont = document.getElementById('v-tab-cont');
        current_v_tab = v_tab_buttons[0];
        // console.log(current_v_tab)
        for(let i of v_tab_buttons){
            i.addEventListener('click', function(){
                current_v_tab.className = current_v_tab.className.replace('active-tab', '')
                console.log(current_v_tab.className)
                current_v_tab = this
                this.className += ' active-tab '

                if (this.innerText.toLowerCase() == 'summary'){
                    v_tab_cont.innerHTML = get_product_summary(package)
                }
                else if(this.innerText.toLowerCase() == 'technical details'){
                    v_tab_cont.innerHTML = get_item_full(package)
                }
                else if(this.innerText.toLowerCase() == 'reviews'){
                    v_tab_cont.innerHTML = '<p style="color:grey">There are currently 0 reviews for this item</p>'
                }
            });
        }
        // alert('Showing the item')
    }
    else{
        alert("Couldn't find the package ...")
    }

}

function add_to_cart_init(){ // initialize the add to cart button currently present on the screen && view more buttons
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

function search_package(package_groups, key){
    let pack_list = null
    for(let j=0; j<package_groups.length; j++){
        pack_list = package_groups[j].packages
        for(let i=0; i<pack_list.length; i++){
            if(pack_list[i].id == key) return pack_list[i]
        }
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
        // window.sessionStorage.setItem('cart', JSON.stringify(cart))
        let st = window.location.pathname
        window.location.pathname = '/cart'

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

function make_request(method='GET', url, data){
    const promise = new Promise((resolve, reject) =>{

        const xhttp = new XMLHttpRequest()
        xhttp.open(method, url, true)
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

    let s_url = 'session?session_id='+Math.random()*10000
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
    sessionStorage.setItem('session_token', session_token)
    
    return session_token

}

async function get_session_token(){
    let session_token = window.sessionStorage.getItem('session_token');
    if(!session_token){
        session_token = await request_token()
       _token = session_token
    }else{
        _token = session_token
    }
   return session_token 
}

async function get_cart_count(){
    let path
    if(_token){
        path = '/get-cart?m=count&session_token='+_token;
        await make_request('GET', path)
        .then(res=>{
            let keys = Object.keys(res)
            try{
                if('response' in res){
                    sessionStorage.clear()
                    get_session_token()
                    .then(res=>{
                        get_cart_count() // recursion at its best...
                    })
                    // window.location.reload()
                }else{
                    cart_count = res[keys[0]]
                    cart_badge.innerText = res[keys[0]]
                    if(res[keys[0]]>0){
                        console.log('I run')
                        let f_badge = document.getElementById('cart-badge-f');
                        f_badge.style.display= 'block';
                        f_badge.innerText = res[keys[0]]
                    }
                    
                }
            }catch(err){
                console.log(err)
            }
        })
    }else{ // clear the session storege and refresh to get a new token...
        sessionStorage.clear()
        window.location.reload()
    }
}

async function get_cart_items(){
    let path = '/get-cart?m=items&session_token='+_token;
    await make_request('GET', path)
    .then(res=>{
        console.log(res)
        let keys = Object.keys(res)
        if('response' in res)// there's a session token error
        {
            window.sessionStorage.clear();
            window.location.reload();
        }
        else{
            if('cart-items' in res){
                // console.log(res)
                for(let i=0; i<res[keys[0]].length;i++){
                    let p = res[keys[0]][i]['package']
                    cart_items.push(p)
                    p['qty'] = res[keys[0]][i]['qty']
                    cart.add_to_cart(p)
                }
            }
        }
    });
}

async function update_cart_server(func='increase', _uid='none'){
    let path = '/update-cart?func='+func+'&session_token='+_token;
    return make_request('POST', path, {'_uid':_uid})
}

async function send_quote_form(fd){
    let p = '/get-quote?session_token='+_token;

    await make_request('POST', p, fd)
    .then(res=>{
        // console.log(res)
        // respond to the users and give them feedback on their request
    })
}

async function get_quote(){
    let p = '/get-quote?session_token='+_token;
    return new Promise((resolve, reject) =>{
        const xhttp = new XMLHttpRequest()
        xhttp.open('GET', p, true)
        xhttp.withCredentials=true
        xhttp.responseType='blob'
        // xhttp.overrideMimeType('text\/plain; charset=x-user-defined');
        xhttp.onerror = (e)=>{
            reject(xhttp.response)
        }

        xhttp.onreadystatechange = function(){

            if(xhttp.readyState == 4 && xhttp.status == 200){ 
                resolve(xhttp.response)
            }
        
        }

        xhttp.ontimeout = function(){
            alert('timedout')
        }
        xhttp.send(null)
    });
}

try{
    let cart_float = document.getElementById('cart-button-float')

    cart_float.addEventListener('click', click_cart)
}catch(err){
    
}


function click_cart(){
    window.location.pathname = '/cart';
}

function get_voltage(package){
    
    try{
        let raw = package.obj
        let inverter = null
        
        for(let i of Object.keys(raw)){
           
            if(i != '_uid' && raw[i].name.toLowerCase() == 'inverter'){
                inverter = raw[i]
                break;
            }
        }

        if('Voltage' in inverter.size){
            return `${inverter.size.Voltage.value} ${inverter.size.Voltage.unit}`
        }
        else if('BatVoltage' in inverter.size){
            return `${inverter.size.BatVoltage.value} ${inverter.size.BatVoltage.unit}`
        }
        else{
            let battery = search_item_in_package(package, 'battery')
            if(battery)return `${battery.json_obj.size.Voltage.value} ${battery.json_obj.size.Voltage.unit}`
            // else return `48V`
        }   
    }catch(e){
        // console.log(e)
    }
}

function search_item_in_package(package, item_name){
    let item_list = package.item_list;
    let keys = item_list;

    for(let k=0; k<keys.length; k++){
        if(item_list[k].name){
            item = item_list[k]; 
            if(item.name.toLowerCase() ==item_name.toLowerCase()){
                return item;
            } 
        }
    }
    return null;
}

function send_form_data(e=null){
    let path = '/contact-us';
    if(e)e.preventDefault();
    let form_data = new FormData(e.currentTarget)
    let entries = form_data.entries()
    let res = entries.next()
    let form_json = {}
    while(!res.done){
        form_json[res.value[0]] = res.value[1]
        res = entries.next()
    }
    
    make_request('POST', path, form_json)
    .then(res=>{
        // console.log(res)
        window.alert('Thank you for your inquiry, we\'ll be in touch');
        window.location.reload();
    })
    .catch(err=>{
        window.alert('There was an error sending your message, please try again');
        console.log(err)
    })
}