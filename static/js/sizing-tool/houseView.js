
class HouseView extends View{
    constructor(name, domElem, extras={}){
        super()
        this.domElement = domElem;
        this.extras = extras
        this.name = name
        this.data = null;
        this.state = 0;
        this.viewModel = global_viewModel
        this.overlay = new OverlayContainer('house-ov', (extras)=>{})
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
        this.initRooms()
    }
    initRooms(){
        const rooms = document.getElementsByClassName('room');
        for(let r of rooms){
            r.addEventListener('click', (e)=>{
                let data_pointer = e.currentTarget.getAttribute('data-target');
                // console.log(data_pointer)
                this.viewModel.get(data_pointer)
                .then(res=>{
                    
                   this.overlay.draw((extras)=>{
                        // draw function
                        let r = extras[0]
                        let data = r
                        if("0" in r){
                            data = r[0]
                        } 
                        let res = ''
                        try{
                            res = `
                            
                            <div class="room-view-container">
                                <div class="title">
                                    <h2 style="text-align:center; color:black">${data['type'].toUpperCase()}</h2>
                                </div>
                                <span style="text-align:center; font-weight:bold; color:black">Appliances in the<span style="color:#00ff04; font-weight:bolder;"> ${data['type']}</span>:</span>
                                <div class="app-list" style="display:flex; flex-flow:row; flex-wrap:wrap; background-color:#131c39; padding:20px;">
                                    ${iconsGridView(data['appliances'])}
                                </div>

                            </div>
                            `
                        }catch(err){
                            console.log(err)
                        }finally{
                            return res
                        }
                        
                   }, res, ()=>{
                    // init function
                   });
                })
            })
        }
    }

    roomView(room, target){
        // (${room.appliances.length})
        return `
        <div class="room-model block room" data-target="house>${target}>${room.type}" name="${room.type}">
            <span class="name">${room.type} </span>
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