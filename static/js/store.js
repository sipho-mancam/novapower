window.addEventListener('load', function(e){

    get_session_token()
    .then(
        res=>{
            _token = res
        }
    )
    let path = '/packages/all?n=20'
    
    make_request('GET',path)
    .then(res=>{
        // console.log(res)
        parse_json(res)
        package_groups = get_package_groups(packages_data)
        get_package_group_views(search_package_group(package_groups,groups_maps['Solar Packages']), tab_content)
        init_tabs()
        add_to_cart_init();
        current_list = package_groups
        get_cart_count();
    })
    .catch(err=>{
        console.log(err)
    })
})