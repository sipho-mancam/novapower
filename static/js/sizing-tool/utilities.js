

function iconView(app_data, index=0){
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

function iconsGridView(app_list){
    let res = ''
    for(app of app_list){
        res += iconView(app, app_list.indexOf(app))
    }
    return res
}

function iconsGridView(app_list, elem){
    let res = ''
    for(app of app_list){
        res += iconView(app, app_list.indexOf(app))
    }
    if(elem)elem.innerHTML = res
    else return res
}

function drawLoadingChart(lp, canv='loading-profile', title='Appliance Usage'){

    const labels = ['00:00', 
                    '01:00',
                    '02:00',
                    '03:00',
                    '04:00',
                    '05:00',
                    '06:00',
                    '07:00',
                    '08:00',
                    '09:00',
                    '10:00',
                    '11:00',
                    '12:00',
                    '13:00',
                    '14:00',
                    '15:00',
                    '16:00',
                    '17:00',
                    '18:00',
                    '19:00',
                    '20:00',
                    '21:00',
                    '22:00',
                    '23:00']
    const data = {
        labels:labels,
        datasets:[{
            label:title,
            backgroundColor:'rgb(255,255,255)',
            borderColor:'rgb(0,255,244)',
            data:lp
        }]
    };

    const config = {
        type:'line',
        data:data,
        options:{}
    };

    const lpChart = new Chart(document.getElementById(canv), config);
}

function addVectors(v1, v2){
    let s2

    s2 = v2.splice(0,1)[0]
    let resultant = []
    for(let i=0; i<v1.length; i++){
        resultant.push(v1[i]+s2*v2[i])
    }

    return resultant
}

function computeLoadingProfile(app_list){
    let result = app_list[0]['usage-profile']
    let start = Array(24).fill(0, 0, 24)
    result = addVectors(start, result)
    app_list.splice(0,1)

    for(let a of app_list){
        result = addVectors(result, a['usage-profile'])
    }
    return result
}

function buildAppList(house){
    let rooms = house['rooms']
    let room_keys = Object.keys(rooms)
    let r_m
    let ar = []
    for(let k of room_keys){
        r_m = rooms[k]
        if(k == 'bedroom'){
            for(let b of r_m){
                ar = ar.concat(b['appliances'])
            }
        }else{
            ar = ar.concat(r_m['appliances'])
        }
        
        // console.log(r_m['appliances'], "--> ", k)
    }
    house['app-list'] = ar
    console.log(ar)
    return ar
}




class View {
    constructor(){
        this.domElement = null
        this.extras = null
        this.view_callBack = null
        this.name = null
    }

    load_data(){

    }

    update(){
        console.log("I run")
        this.view_callBack()
    }

}

