
/**
 * Define the base module for requests, any call to APIs, will be called here.
 * 
 */

function make_request(method='GET', url, data){
    const promise = new Promise((resolve, reject) =>{
        const xhttp = new XMLHttpRequest()
        xhttp.open(method, url, true)
        xhttp.withCredentials=true
        xhttp.responseType='json'

        if(data){
            xhttp.setRequestHeader('Content-Type', 'application/json');
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
            reject(xhttp.response)
        }
        
        xhttp.send(JSON.stringify(data))
    });
    return promise
    
}

async function request_token(url){

    let s_url = 'session?session_id='+Math.random()*10000
    let session_token = null
    await make_request('GET','/'+s_url)
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

async function get_cart_count(session_token){
    let token = session_token
    let path = '/get-cart?m=count&session_token='+token;
    return  make_request('GET', path)    
}


function addPackageToCart(package, session_token){
    return make_request('POST', '/add-to-cart?session_token='+session_token, {
        '_uid':package._uid,
        'qty':1,
        'package':package
    });
}

async function updateCart(session_token, func='increase', _uid='none'){
    let _token = session_token;
    let path = '/update-cart?func='+func+'&session_token='+_token;
    return make_request('POST', path, {'_uid':_uid})
}