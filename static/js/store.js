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
            // console.log(res)
            parse_json(res)
            package_groups = get_package_groups(packages_data)
            current_list = package_groups
            get_package_group_views(search_package_group(package_groups,groups_maps['Solar Packages']), tab_content)
            init_tabs()
            add_to_cart_init();
            get_cart_count();
        })
        .catch(err=>{
            console.log(err)
        })
    })
})
