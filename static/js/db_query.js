
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


// let xhttp = new XMLHttpRequest();

// xhttp.addEventListener('readystatechange',function(){
//     try{
//         console.log(xhttp.response)
//         // res = JSON.parse(this.responseText)
//         parse_json(xhttp.response)
//         package_groups = get_package_groups(packages_data)
//         get_package_group_views(search_package_group(package_groups,groups_maps['Solar Packages']), tab_content)
//         init_tabs()
//         add_to_cart_init()
//         current_list = package_groups[1].get_package_list()
//         featured_products = []
//         for(let i=0; i<package_groups.length; i++){
//             try{
//                 featured_products.push(package_groups[i].packages[0])
//                 featured_products.push(package_groups[i].packages[1])
//             }catch(err){

//             }
//         }
        
//     }catch(err){
//         console.log(err)
//     } 
// })

// let b_url = new URL('/packages/all', 'http://192.168.137.73:5000')

// xhttp.open('GET', b_url);
// xhttp.responseType='json';
// xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
// xhttp.send();

// function parse_json(data){
//     // console.log(data)
//     packages_data['inverter+battery']['data'] = data['inverter']
//     packages_data['solar+inverter+battery']['data']=data['solar']
//     // packages_data['generator']['data'] = data['generator']
// }