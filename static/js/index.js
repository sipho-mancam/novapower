window.addEventListener('load', function(e){
    let flag = false;
    let loader = this.document.getElementById('loader')
    // console.log(loader)
    //start the spinner overlay here....

    let featured_products_view = this.document.getElementById('featured-cont');
    const resp = get_session_token( )
    resp
    .then(function(token){
        let session_token = token;
        _token = session_token
        const session_param = 'session_token='+session_token
        const f_url = 'featured?n=6&'+session_param

        make_request('GET', base_url+f_url)
        .then(response => {
            // const res = JSON.parse(response)
            if('status' in response){
                console.log('There is an error') 
                sessionStorage.clear()
                window.location.reload()
            }
            const featured_products_raw = response
            parse_json(featured_products_raw)         
            package_groups = get_package_groups(packages_data)

            current_list = package_groups

            for(let i=0; i<package_groups.length; i++) {
                if (package_groups[i].packages.length >0){
                    get_package_group_views(package_groups[i], featured_products_view, true)
                }
                
            }
            add_to_cart_init()
            get_cart_count()
            loader.style.display = 'none';
        
        })
        .catch(err=>{
            console.log(`Error making request`,err)
        })
    }) 
    let contact_us_form = document.getElementById('contact-us-form')
    contact_us_form.addEventListener('submit', send_form_data)
    //stop the spinner here...


    
})




