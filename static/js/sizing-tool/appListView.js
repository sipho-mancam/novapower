


let app_view = document.getElementById('full-app-list');
let app_details_view = document.getElementById('app-details-view')
// let view_model = global_viewModel


let current_app

async function available_rooms(){
    viewModel = global_viewModel
    let result = ''
    await viewModel.get('house')
    .then(res=>{
        let rooms =  res['rooms']
        // console.log(rooms)
        for(let k in rooms){
            if(k != 'bedroom')result += roomView(rooms[k], k)
            else{
                for(let b of rooms[k]){
                    
                    result += roomView(b, k)
                    // console.log(result)
                }
            }
        }   
    })
    return result
}


function roomView(room, index){
    return `
    <div class="room-model block rt" index=${index} name=${room.type}>
        <span>${room.type}</span>
      </div>
    `
}


function init_rooms(){
    const rooms = document.getElementsByClassName('rt')
    let ov = document.getElementById('overlay-container')
    let viewModel = global_viewModel
    for(let r of rooms){
        r.addEventListener('click', (e)=>{
            viewModel.get('house')
            .then(res=>{
                // console.log(current_app)
                let app_list = res['app-list']
                current_app['room'] = r.getAttribute('name')
                viewModel.updateLiveData({
                    path:'house>app-list',
                    data:current_app,
                    type:'array',
                    func:'add',
                    room:r.getAttribute('name')
                })
                ov.style.display = 'none';
            })
        });
    }
}


class AppGridView extends View{
    constructor(name='app-list', domElem, extras){
        super()
        this.extras = extras
        this.domElement = domElem
        this.viewModel = global_viewModel
        this.data = {}
        this.view_callBack = this.update
        this.name = name
        this.rooms = ''  
    }

    app_details_view(app){
        // console.log(app)
        return(
        `<div class="app-details-view">
            <div class="img">
                <img src=${app.img} width="50" height="50" alt=""/>
            </div>
            <div class="det-title">
                <span class="value-title">${app.name}</span>
            </div>
            <div class="description">
                <span class="key"> Total-Energy:</span><span class="value">${app['Total Energy']}kWh</span><br />
                <span class="key"> Total-Time:</span><span class="value">${app['Total-time']}hr(s)</span><br />
                <span class="key">Total Usage<span style="font-size: xx-small; color:red;">(%)</span>:<span class="value">${Math.ceil((app['Total-time']/24)*100)} %</span><br />
                <span class="key">Power: </span><span class="value">${app['Total Energy']/app['Total-time']}kW</span>
            </div>
            <div class="load-profile">
                <canvas id="loading-profile" width="200px" height="100" style="background-color: white;"></canvas>
            </div>
        </div>`)
    }


    initAppsView2(data, det_container=null){
        const apps = document.getElementsByClassName('app-icon');
        for(let a of apps){
            a.addEventListener('mouseover', (e)=>{
                let parentN = e.currentTarget.parentNode
                let index = parseInt(e.currentTarget.getAttribute('index'))
                let current_app_2 = data[index]
                if(det_container){
                    det_container.innerHTML = this.app_details_view(current_app_2)
                }else{
                    this.extras.innerHTML = this.app_details_view(current_app_2)
                }
                
                // drawLoadingChart(current_app['usage-profile'])
            })
        }
    }

    overlayContent(extras){
        // console.log(this.rooms)
        // console.log(extras)
        return `
            <div class="add-to">
            <h1 class="title">Add <span class=""  style="color:red; font-weight:bold;">${current_app['name']}</span> To ...</h1><br />
            <div class="rooms house-model">
                ${extras}
            </div>
        </div>
            `
        
    }
   

    initAppsView(){
        let temp = this.available_rooms
        // console.log(temp)
        let overlay = new OverlayContainer('app-select', this.overlayContent, this.available_rooms, init_rooms)

        const apps = document.getElementsByClassName('app-icon');
        // let current_app = null
        // console.log(this.data)
        for(let a of apps){
            a.addEventListener('mouseover', (e)=>{
                let parentN = e.currentTarget.parentNode
                let p_id = parentN.getAttribute('id')
                // console.log(this.name)
                if(p_id == 'full-app-list' && this.name == 'app-list'){
                    let index = parseInt(e.currentTarget.getAttribute('index'))
                    current_app = this.data[index]
                    this.extras.innerHTML = this.app_details_view(current_app)
                    let nArr = [...current_app['usage-profile']]
                    drawLoadingChart(nArr)
                }
            })

            a.addEventListener('click', (e)=>{
                // start the overlay here...
                if(e.currentTarget.getAttribute('name') == 'app-list' && this.name == 'app-list'){
                    let index = parseInt(e.currentTarget.getAttribute('index'))
                    current_app = this.data[index]
                    overlay.open()
                }
                else if(e.currentTarget.getAttribute('name') == 'house>app-list' && this.name=='house>app-list'){ // we want it to remove the apps here..
                    let index = parseInt(e.currentTarget.getAttribute('index'))
                    let current_house_app = this.data[index]
                    console.log(current_house_app)
                    this.viewModel.updateLiveData({
                        path:'house>app-list',
                        data:current_house_app,
                        type:'array',
                        func:'remove',
                        room:current_house_app['room']
                    });
                }
            });
        }
    }

    iconView(app_data, index=0){
        return `
        <div class="app-icon" index=${index} name="${this.name}">
            <div class="icon">
                <img src=${app_data['img']} width="50" height="50" alt="" />
            </div>
            <div class="title">
                <a class="name">${app_data['name']}</a>
            </div>
        </div>
        `
    }
    
    iconsGridView(app_list){
        let res = ''
        for(app of app_list){
            res += iconView(app, app_list.indexOf(app))
        }
        return res
    }
    
    iconsGridView(app_list, elem){
        let res = ''
        for(let app of app_list){
            res += this.iconView(app, app_list.indexOf(app))
        }
        if(elem)elem.innerHTML = res
        else return res
    }
    

    load_data(data=0){
        if(data == 0){
            this.viewModel.get(this.name)
            .then(res1=>{
                this.data = res1
                
                available_rooms()
                .then(res=>{
                    this.available_rooms = res
                    
                    this.iconsGridView(this.data, this.domElement)
                    this.initAppsView()
                    this.extras.innerHTML = this.app_details_view(this.data[0])
                    if(this.name=='app-list')drawLoadingChart(this.data[0]['usage-profile'].slice(0, 24))
                    
                })
                
            });
        }else{
            iconsGridView(data, this.domElement)
            this.initAppsView2(data)
            this.extras.innerHTML = this.app_details_view(data[0])
        }
    }
    
   
    update(){
        this.load_data()
    }
}


let appsGridView = new AppGridView('app-list',app_view, app_details_view)

// appsGridView.update()

uiController.registerView(appsGridView)


