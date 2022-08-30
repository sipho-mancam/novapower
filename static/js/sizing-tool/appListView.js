


let app_view = document.getElementById('full-app-list');
let app_details_view = document.getElementById('app-details-view')
// let view_model = global_viewModel

class AppGridView extends View{
    constructor(name='app-list', domElem, extras){
        super()
        this.extras = extras
        this.domElement = domElem
        this.viewModel = global_viewModel
        this.data = {}
        this.view_callBack = this.update
        this.name = name
    }

    app_details_view(app){
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

    appOnClickListener(e){

    }
    initAppsView2(data, det_container=null){
        const apps = document.getElementsByClassName('app-icon');
        for(let a of apps){
            a.addEventListener('mouseover', (e)=>{
                let parentN = e.currentTarget.parentNode
                let index = parseInt(e.currentTarget.getAttribute('index'))
                let current_app = data[index]
                if(det_container){
                    det_container.innerHTML = this.app_details_view(current_app)
                }else{
                    this.extras.innerHTML = this.app_details_view(current_app)
                }
                
                // drawLoadingChart(current_app['usage-profile'])
            })
        }
    }

    initAppsView(){
        const apps = document.getElementsByClassName('app-icon');
        for(let a of apps){
            a.addEventListener('mouseover', (e)=>{
                let parentN = e.currentTarget.parentNode
                let p_id = parentN.getAttribute('id')
                if(p_id == 'full-app-list'){
                    let index = parseInt(e.currentTarget.getAttribute('index'))
                    let current_app = this.data[index]
                    this.extras.innerHTML = this.app_details_view(current_app)
                    drawLoadingChart(current_app['usage-profile'])
                }
            })
        }
    }

    

    load_data(data=0){
        if(data == 0){
            this.viewModel.get(this.name)
            .then(res=>{
                this.data = res
                iconsGridView(this.data, this.domElement)
                this.initAppsView()
                this.extras.innerHTML = this.app_details_view(this.data[0])
                drawLoadingChart(this.data[0]['usage-profile'])
            });
        }else{
            iconsGridView(data, this.domElement)
            this.initAppsView2(data)
            this.extras.innerHTML = this.app_details_view(data[0])

        }
        
    }
    
   
    update(){
        console.log('I run')
        this.load_data()
    }
}


let appsGridView = new AppGridView('app-list',app_view, app_details_view)

appsGridView.update()


