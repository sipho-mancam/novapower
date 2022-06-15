window.addEventListener('load', function(e){

    const resp = get_session_token()

    resp
    .then(function(token){
        let session_token = token;
        const session_param = 'session_token='+session_token
        const f_url = 'featured?n=6&'+session_param
        console.log(session_token)
        const feature_products = null
        make_request('GET', base_url+f_url)
        .then(response => {
            // const res = JSON.parse(response)
            console.log(response)
            if('status' in response){
                console.log(localStorage)
                console.log('There is an error')
                // this.localStorage.removeItem('session_token')
                // session_token = null;
                
                // this.window.location.pathname = this.window.location.pathname
            }
            const featured_products_raw = response
            console.log(featured_products_raw)
        })
        .catch(err=>{
            console.log(`Error making request`,err)
        })
    })
    // if(!sessionStorage.getItem('session_token')){
    //     this.fetch(base_url+'session?session_id='+Math.random()*100000, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         }
    //     })
    //     .then(responseData=>{
    //         responseData.json()
    //         .then(data=>{
    //             sessionStorage.setItem('session_token', data.session_token)
    //             console.log(data.session_token)
    
    //         })
    //     })
    // }
    // else{
    //     this.fetch(base_url+'featured?n=6&session_token='+this.sessionStorage.getItem('session_token'), {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Access-Control-Allow-withCredentials':'*'
    //         }
    //     })
    //     .then(responseData=>{
    //         // console.log(responseData.headers.values().next())
    //         responseData.json()
    //         .then(data=>{
    //             console.log(data)
    //         })
    //     })
    // }
    

})


