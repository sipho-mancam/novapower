
class HouseView extends View{
    constructor(name, domElem, extras={}){
        super()
        this.domElement = domElem;
        this.extras = extras
        this.name = name
        this.data = null;
        this.state = 0;
        this.viewModel = global_viewModel
    }

    update(){
        this.load_data()
    }

    load_data(){
        this.viewModel.get('house')
        .then(res=>{
            this.data = res;
            // console.log(this.data)
            // console.log(computeLoadingProfile(this.data['app-list']))
            this.drawHouse(this.domElement)
        })
    }

    drawHouse(container){
        container.innerHTML = this.roomsView(this.data['rooms'])
        container.innerHTML += this.addRoomButton()
    }

    roomView(room, target){
        
        return `
        <div class="room-model block" data-target=${target}>
            <span class="name">${room.type} (${room.appliances.length})</span>
        </div>
        `
    }

    addRoomButton(){
        return `
        <div class="room-model block add-room" >
            <h1 style="font-weight: bolder; font-size: 2em;"><i class="bi bi-plus-circle"></i></h1>
        </div>
        `
    }

    roomsView(rooms_data){
        let res = ''
        for(let r in rooms_data){
            
            if(!("0" in rooms_data[r])){
                res += this.roomView(rooms_data[r], 'rooms')
            }else{
                for(let b_r of rooms_data[r]){
                    res += this.roomView(b_r, 'rooms')
                }
            }
        }
        return res
    }
}


let houseView = new HouseView('house', document.getElementById('house-view'))

// houseView.update()

uiController.registerView(houseView)