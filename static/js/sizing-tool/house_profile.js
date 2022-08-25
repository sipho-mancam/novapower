
let property_data = {}
let packages = {}
let loading_profile = {}

function init_tabs(){
    const tabs = document.getElementsByClassName('tab')

    for(let t of tabs){
        t.addEventListener('click', function(e){
            let data_p = e.target.getAttribute('name')
            alert('I am clicked')
        })
    }
}

async function init(){
    /**
     * Request the house from the server.
     * store the data in the property data_structure
     * split the data into 1 ... loading profile, house (linked to profile), packages (sepearate processing also linked to profile)
     * Why do we want to split the data? 
     *     * To isolate every view generator from the rest of the data.
     *     * 
     * request for the full app list of available apps
     * make call to the view generators to update the:
     *  1. House Models,
     *  2. Appliance list
     *  3. packages
     *  4. request the app list. (All available appliances from server.)
     */

    request_house()
    .then((res)=>{
        console.log(res)
        if('house' in res) property_data = res['house'] 
        if('packages' in res) packages = res['packages']
        if('loading-profile' in res) loading_profile = res['loading-profile']
        
        console.log(property_data, loading_profile, packages)
        // make all the necessary calls to the view generators
        // house_appliances_view(property_data, )
        init_tabs()

        request_apps_list()
        .then(res=>{
            let view_data = generate_appliance_view(res['app-list'])
            document.getElementById('full-app-list').innerHTML = view_data
        })
        
    })
    .catch(err=>{
        console.log(err)
    })

}

async function request_house(n_bedrooms=1){
    /**
     * Fetch the house model with it's packages and it's profile.
     */
    let path = '/sizing-tool?f='
    if(n_bedrooms == 1)path += 'init'
    else path += n_bedrooms
    return make_request('GET', path)
}

async function request_apps_list(){
    let path = '/sizing-tool/apps-list'
    return make_request('GET', path)
}

function icon_view(app_data, index=0){
    return `
    <div class="app-icon" index=${index}>
        <div class="icon">
            <img src=${app_data['img']} width="50" height="50" alt="" />
        </div>
        <div class="title">
            <a class="name">${app_data['name']}</a>
        </div>
    </div>
    `
}



function generate_appliance_view(app_list){
    let res = ''
    for(app of app_list){
        res += icon_view(app, app_list.indexOf(app))
    }
    return res
}

function house_appliances_view(house, container){
    let app_list = house['app-list']
    container.innerHTML = generate_appliance_view(app_list)
}






window.addEventListener('load', function(){

    /**
     * Initialise the page
     * 1) We need the middle man that will facilitate between UI events and the Data Models.
     * 
     */
    
    init()
    .then(res=>{
        console.log(res)
    })
    .catch(err=>{
        console.log(err)
    })


})