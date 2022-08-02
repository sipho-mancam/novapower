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
            add_names_to_packages(res)
            data_structure = res
            current_selected_tab = res['solar'];

            current_list = current_selected_tab
            get_package_group_views(current_selected_tab, tab_content,'solar')
            init_tabs() // this initialises tabs ... and their clickability.
            add_to_cart_init();
            get_cart_count();
        })
        .catch(err=>{
            console.log(err)
        })
    })
})

function add_names_to_packages(p_groups){
    for(let key in p_groups){
       for(let p in p_groups[key]){
            p_groups[key][p]['name'] = key;
            p_groups[key][p]['description'] = get_product_summary(p_groups[key][p])
       } 
    }
}