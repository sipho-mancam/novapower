window.addEventListener('load', function(e){

    const resp = get_session_token()

    // while(!session_token);
    resp
    .then(function(token){
        let session_token = token;
        const session_param = 'session_token='+session_token
        const f_url = 'featured?n=6&'+session_param

        const feature_products = null
        make_request('GET', base_url+f_url)
        .then(response => {
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
    

})


