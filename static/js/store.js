window.addEventListener('load', function(e){
    const loader = this.document.getElementById('loader')
    let contact_us_form = document.getElementById('contact-us-form')
    contact_us_form.addEventListener('submit', send_form_data)
    
    get_session_token()
    .then(
        res=>{
        _token = res
        let path = '/packages/all?n=15';
        make_request('GET',path)
        .then(res=>{
            // console.log(res)
            loader.style.display = 'none'; // hide spinner...
            console.log(res)
            data_structure = res
            current_selected_tab = res['solar'];
            
            get_package_group_views(current_selected_tab, tab_content,'solar')
            init_tabs()
            add_to_cart_init();
            get_cart_count();
        })
        .catch(err=>{
            console.log(err)
        })
    })
})
