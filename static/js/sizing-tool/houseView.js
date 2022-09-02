
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
                                <div class="remove-room" name=${data['type']}>
                                    <a class="remove-room-btn" name=${data['type']} >Delete Room</a>
                                </div>
                            </div>
                            `
                        }catch(err){
                            console.log(err)
                        }finally{
                            return res
                        }
                        
                   }, res, ()=>{
                        const delete_room = document.getElementsByClassName('remove-room')

                        for(let d_b of delete_room ){
                            d_b.addEventListener('click', (e)=>{
                                let room_name = d_b.getAttribute('name')
                                this.overlay.close(true)
                                this.viewModel.get('house>rooms>'+room_name)
                                .then(res=>{
                                    console.log(res)
                                    let a_room = res
                                    this.viewModel.updateLiveData({
                                        path:'house>rooms',
                                        data:a_room,
                                        type:'json',
                                        func:'remove',
                                        room:room_name
                                    })
                                });
                            });
                        }
                   });
                })
            })
        }

        const add_room_b = document.getElementById('add-room-btn');
       
        add_room_b.addEventListener('click', (e)=>{
            let create_room = {
                type:'custom-room'+(Math.ceil(Math.random()*1000)).toString(),
                appliances:[]
            }


            this.viewModel.get('app-list')
            .then(res=>{
                
                this.overlay.draw((data)=>{
                    let view = ``
                    view += `<div class="add-room-container">
                            <div class="a-title">
                                    <h5 style="text-align:center;font-weight:bolder;">Create Room  <i class="bi bi-plus-circle-fill"></i></h5>
                                </div>
                                <div class="view-container row">
                                    <div class="col bl app-list">
                                        <div class="s-title data-row">
                                            <h4 class="naming">Add Appliances <i class="bi bi-plus-circle-fill"></i></h4>
                                        </div>
                                        <div class="room-app-list apps-view data-row" id="create-room-list">
                                            ${iconsGridView(res, 'ov-apps')}
                                        </div>
                                    </div>
                                    <div class="col bl room-details">
                                        <div class=" data-row">
                                            <label for="room-type" class="key" >Type: <input class="" required type="text" placeholder="Bedroom, kitchen, etc" value="custom-room" id="room-type" /> </label>
                                        </div>
                                        <div class="room-app-list data-row" id="cust-room-apps">
                                            ${iconsGridView(create_room['appliances'], 'create-room-app')}
                                        </div>
                                    </div>
                                </div>
                                <div class="add-room-btn-container">
                                    <a href="" class="add-room-btn" id="create-room-btn-1">Create Room <i class="bi bi-plus-circle-fill"></i> </a>
                                </div>
                            </div>`

                    return view

                }, [], ()=>{
                    const apps = document.getElementsByClassName('ov-apps');
                    const cust_r_apps =  document.getElementById("cust-room-apps");

                    for(let a of apps){
                        a.addEventListener('click', (e)=>{
                            let index = parseInt(e.currentTarget.getAttribute('index'))
                            let obj = {...res[index]}
                            obj['id'] = index.toString()+(Math.random()*1000).toString()
                            obj['room'] = create_room['type']
                            create_room['appliances'].push(obj)
                            iconsGridView(create_room['appliances'], 'create-room-app', cust_r_apps);

                            for (let b of document.getElementsByClassName('create-room-app')) {
                                b.addEventListener('click', (e) => {
                                    let index = parseInt(e.currentTarget.getAttribute('index'))
                                    create_room['appliances'].splice(index, 1);
                                    b.remove(); 
                                   
                                });
                            }
                        });

                        
                        
                    }
                    

                    document.getElementById('create-room-btn-1')
                    .addEventListener('click', (e)=>{
                        e.preventDefault();
                        if(create_room['appliances'].length > 0){
                            this.viewModel.updateLiveData({
                                path: 'house>rooms',
                                data: create_room,
                                type: 'json',
                                func: 'add',
                                room: create_room['type']
                            });
                            this.overlay.close(true)
                        }
                    });
                    


                })
            })
        })
    }

    roomView(room, target){
        // (${room.appliances.length})
        return `
        <div class="room-model block room" data-target="house>${target}>${room.type}" name="${room.type}">
            <span class="name">${room.type} (${room.appliances.length}) </span>
        </div>
        `
    }

    addRoomButton(){
        return `
        <div class="room-model block add-room" id="add-room-btn">
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