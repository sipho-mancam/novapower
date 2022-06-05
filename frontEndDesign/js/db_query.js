
function get_package_groups(data_json){
    let _keys = Object.keys(data_json);
    let temp = null;
    let package_groups_list = []
    for(let i=0; i<_keys.length; i++){
        temp = new PackageGroup(data_json[_keys[i]]);
        temp['id'] = _keys[i];
        package_groups_list.push(temp);
    }
    return package_groups_list
}


let xhttp = new XMLHttpRequest();

xhttp.addEventListener('readystatechange',function(){
    try{
        res = JSON.parse(this.responseText)
        parse_json(res)
        package_groups = get_package_groups(packages_data)
        get_package_group_views(search_package_group(package_groups,groups_maps['Solar Packages']), tab_content)
        init_tabs()
        add_to_cart_init()
        current_list = package_groups[0].get_package_list()
    }catch(err){
        console.log(err)
    } 
})

xhttp.open('GET', 'http://localhost:5000/packages/all');
xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
xhttp.send();

function parse_json(data){
    packages_data['inverter+battery']['data'] = data['inverter']
    packages_data['solar+inverter+battery']['data']=data['solar']
    packages_data['generator']['data'] = data['generator']
}