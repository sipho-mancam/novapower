/**
 * Hold the house model (current state)
 * Change house model as per UI controllers request and update the live data through repository
 * 
 */

class ViewModel{
    constructor(){
        this.livedata = {}
        this.repoistory = new Repository()
        this.views_list = {}
    }
    
  
    get(key){
        return new Promise((resolve, reject)=>{
            let time = setInterval(()=>{
                if(this.repoistory.isReady()){
                    clearInterval(time)
                    resolve(this.repoistory.get(key))
                }
            })
        })
    }
}

let global_viewModel = new ViewModel()


