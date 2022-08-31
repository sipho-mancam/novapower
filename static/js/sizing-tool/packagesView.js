
class PackagesView extends View{
    constructor(name, domElem, extras={}){
        super()
        this.name = name
        this.domElement = domElem
        this.extras = extras
        this.data = null;
        this.packages_data = null
        this.viewModel = global_viewModel
        this.current_tab = 'bill-crusher'
        // this.update()
    }

    update(){
        this.load_data()
    }

    load_data(data=0){
        this.viewModel.get('packages')
        .then(res=>{
            this.data = res;
            this.packages_data = this.data.packages
            let details = {group:'bill-crusher'}
            this.domElement.innerHTML = this.packagesView(this.packages_data[this.current_tab], details)
            this.extras.innerHTML = this.loadingSummaryView()

            drawLoadingChart(this.data.loading_profile, 'loading-profile-2', 'House Loading')
            let lp = this.data.loading_profile
            let avg_demand = lp.reduce((acc, cur)=>{return acc+cur})/24
            this.pieChartView([Math.max(...lp), avg_demand, this.data.max_demand, Math.abs(this.data.max_demand - Math.max(...lp))])
        })
    }

    updateTab(tab_name){
        let details = {group:tab_name}
        this.current_tab = tab_name;
        this.domElement.innerHTML = this.packagesView(this.packages_data[tab_name], details)
    }

    loadingSummaryView(){
        let loading_p = this.data.loading_profile
        let total_energy = loading_p.reduce((acc, cur)=>{
                        return acc + cur
                        }) 
        let res = ''
        res = `
        <div class="app-details-view">
            <div class="det-title">
                <span class="value-title">Loading Summary</span>
            </div>
            <div class="load-profile">
                <canvas id="loading-profile-2" width="200px" height="100" style="background-color: white;"></canvas>
            </div>
            <div class="load-summary" style="margin-top:5px; border-radius:5px; width:fit-content; display: flex;">
                <canvas id="loading-summary"  height="150" style="background-color: white; width:100%"></canvas>
            </div>
            <div class="description" style="margin-top:5px;">
                <span class="key">Total-Energy (daily):</span><span class="value">${total_energy}kWh</span><br />
                <span class="key">Peak Demand:</span><span class="value">${this.data.max_demand} kW</span><br />
                <span class="key">Average Demand:<span class="value"> ${Math.ceil(total_energy/24)} kW</span><br />
                <span class="key">Peak-Time: </span><span class="value">${this.data.loading_profile.indexOf(Math.max(...this.data.loading_profile)).toString()+':00'}</span>

            <!-- <span style="font-size: xx-small; color:red;">(%)</span>: -->
            </div>
        </div>
        `
        return res
    }

    pieChartView(list){
        const data = {
            labels: [
              'Peak Demand',
              'Average Demand',
              'System Size',
              'Diff (SS - PD)',
              
            ],
            datasets: [{
              label: 'My First Dataset',
              data: list,
              backgroundColor: [
                'rgb(255, 99, 132)',
                'rgb(75, 192, 192)',
                'rgb(255, 205, 86)',
                '#a0ce3f'
              ]
            }]
          };  

          const config = {
            type: 'doughnut',
            data: data,
            options: {}
          };

          const lpChart = new Chart(document.getElementById('loading-summary'), config);
    }

    packagesView(data, details){
        if(data){
            let res = ''
            for(let p of data){
                res += this.packageView(p, details)
            }
            return res
        }
        return ''
    }

    packageView(package_d, details={}){
        return(
            `<div class="p-card" group=${details.group} name=${package_d.name} id=${package_d._uid}>
                <div class="img-container row">
                    <!---<canvas width="190" height="190" id=${package_d._uid}'+img' style="background-color: rgb(0, 255, 136);"></canvas> --->
                    <img src="${package_d.img} alt="" width="190" height="190" />
                </div>
                <div class="p-description" group=${details.group} name=${package_d.name} >
                    <span class="text p-title">${package_d.name}</span><br />
                    <span class="text p-descr">Description: </span><br />
                    <span class="text">&emsp; ${package_d.characteristic}</span><br />
                    <span class="text">&emsp; Inverter size:<span class="text">${package_d['system-size']}</span>kW</span><br /><br />
                    <span class="text price">${package_d.price.toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}</span><a class="buy-button" href="#">Buy Now</a>
                </div>
            </div>`
        )
    }
       
}


let packageView = new PackagesView('packages', document.getElementById('packages-view'), document.getElementById('loading-summary-container'))


uiController.registerView(packageView) // register the view to the controller so that it can update with the rest of the app as it changes...