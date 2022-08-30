

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
        this.view_callBack()
    }

}

class UIController{
    constructor(){
        this.views = {}
    }

    update(){
        for(let k in this.views){
            this.views[k].update();
        }
    }
}