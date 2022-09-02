/**
 * Hold the house model (current state)
 * Change house model as per UI controllers request and update the live data through repository
 * 
 */

class ViewModel{
    constructor(){
        this.livedata = {}
        this.repository = new Repository()
        this.views_list = {}
        this.uiController = uiController;
        this.update()
    }
    
    get(key){
        
        return new Promise((resolve, reject)=>{
            let time = setInterval(()=>{
                if(this.repository.isReady()){
                    clearInterval(time)
                    this.livedata = this.repository.get(key)
                    // console.log(this.livedata, key)
                    resolve(this.livedata)
                }
            })
        })
    }

    updateLiveData(data){
        this.repository.updateLiveData(data)
        this.update()
    }

    update(){
        this.uiController.update()
    }
}

let global_viewModel = new ViewModel()


