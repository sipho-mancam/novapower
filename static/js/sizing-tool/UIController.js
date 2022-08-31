
class UIController{
    constructor(){
        this.views = {}
    }

    registerView(v){
        if(v.name){
            this.views[v.name] = v
        }else{
           throw Error('Object does not inherit from <class View>') 
        }
    }

    update(){
        for(let k in this.views){
            this.views[k].update();
        }
    }

    updateOne(name){
        if(name in this.views){
            this.views[name].update()
        }else{
            alert('View not registered! Please register the view with "registerView(v) method." ')
        }
    }
}

let uiController = new UIController()
