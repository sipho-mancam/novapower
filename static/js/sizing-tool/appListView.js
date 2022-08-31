


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
                console.log(current_app)
                let app_list = res['app-list']
                app_list.push(current_app)
                viewModel.updateLiveData({
                    path:'house>app-list',
                    data:current_app,
                    type:'array'
                })
            })
            ov.style.display = 'none';
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
        return(`<div class="app-details-view">
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
            <h1 class="title">Add To ...</h1><br />
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
        console.log(this.data)
        for(let a of apps){
            a.addEventListener('mouseover', (e)=>{
                let parentN = e.currentTarget.parentNode
                let p_id = parentN.getAttribute('id')
                if(p_id == 'full-app-list'){
                    let index = parseInt(e.currentTarget.getAttribute('index'))
                    current_app = this.data[index]
                    this.extras.innerHTML = this.app_details_view(current_app)
                    let nArr = [...current_app['usage-profile']]
                    // Object.values()
                    drawLoadingChart(nArr)
                }
            })

            a.addEventListener('click', (e)=>{
                // start the overlay here...
                // console.log(current_app)
                overlay.open()
            });
        }
    }

    

    load_data(data=0){
        
        if(data == 0){
            this.viewModel.get(this.name)
            .then(res1=>{
                available_rooms()
                .then(res=>{
                    this.available_rooms = res

                    this.data = res1
                    // console.log(res)
                    iconsGridView(this.data, this.domElement)
                    this.initAppsView()
                    this.extras.innerHTML = this.app_details_view(this.data[0])
                    // console.log(this.data[0]['usage-profile'])
                    drawLoadingChart(this.data[0]['usage-profile'].slice(0, 24))
                    
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


