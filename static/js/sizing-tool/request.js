
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