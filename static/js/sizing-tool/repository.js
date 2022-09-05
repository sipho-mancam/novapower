
/**
 * Will make contact with the outside world and keep data updated in the system
 * Store and manage data 
 * update the data accordingly ... 
 * How do we do this ?
 */

function search_app_by_id(app_list, id){
    for(let app of app_list){
        if(app['id'] == id)return app_list.indexOf(app)
    }
    return -1;
}

class Repository{
    constructor(){
        this.current_data = {};
        this.data_structure = {};
        this.old_data = {};
        this.new_data = {};
        this.state = 0;
        this.read = 0;
        this.init()
        this.session_token = null
    }

    async init(){
        /**
         * Get apps list.
         * Get Default house model
         * Get Default pacakges
         * Get Cart Count
         */
        this.state = 0x00;

        let paths = ['/sizing-tool/apps-list',
                    '/sizing-tool?f=init', ]
        await get_session_token()
        .then(res=>{
            this.session_token = res; 
            get_cart_count(this.session_token)
            .then(res=>{
                this.data_structure['cart-count'] = res['cart-items-count']
            })
    
        })
        
        for(let p of paths){
            await this.update('GET', p)
            .then(res=>{
                let keys = Object.keys(res)
                for(let k of keys){
                    this.data_structure[k] = res[k];
                }  
            })   
        }
        // console.log(this.data_structure)
        this.state = 0x11  
    }

    async procesCart(data_m={}){
        let path = data_m["path"];
        let data = data_m["data"];
        let type = data_m["type"];
        let func = data_m["func"];
       
        let cur = this.traverseDataStructure(path)
        // console.log(cur)
       
        switch(type){
            case "add":
                await addPackageToCart(cur, this.session_token)
                .then(res=>{
                    console.log(res)
                    if('response' in res){
                         return get_cart_count(this.session_token)
                        .then(res=>{
                             this.data_structure['cart-count'] = res['cart-items-count']
                        })
                    }
                })
                break;
            case "remove":
                updateCart(this.session_token, 'delete', cur['_uid'])
                .then(res=>{
                    console.log(res)
                })
                break;
        }
    }

    update(method, url, data){
        this.state = 0x00; // reading state
        return make_request(method, url, data)
    }

    traverseDataStructure(path){
        let cur = this.data_structure
        let paths = path.split('>')
        for(let p of paths){
            cur = cur[p]
        }
        return cur
    }

    updateContent(house){
        let loadingProfile = computeLoadingProfile(buildAppList(house))
        this.update('POST', '/sizing-tool/update', {"data":loadingProfile})
        .then(res=>{
            let keys = Object.keys(res)
            for(let k of keys){
                this.data_structure[k] = res[k];
                
            }
            this.state = 0x11; // data is ready state
        })
    }
    updateLiveData(data_m={}){
        let path = data_m["path"];
        let data = data_m["data"];
        let type = data_m["type"];
        let func = data_m["func"];
        let room = data_m["room"];

        let cur = this.traverseDataStructure(path)
       
        let lp = null;
        if(type == 'array'){ // adding and removing of appliances
            let dir = 1;
            if(func == 'add'){
                dir = 1
            }else if(func =='remove') dir = -1;

            let power = data['Total Energy'] / data['Total-time']
            let up = augmentVector(data['usage-profile'], dir*power)
            up.splice(0,1)
            
            lp  = addVectors(this.data_structure['house']['loading-profile'], up) 
            this.data_structure['house']['loading-profile'] = lp

            if(room != 'app-list' && func == 'add') {
                try{
                    this.data_structure['house']['rooms'][room]['appliances'].push(data);
                }catch(err){
                    this.data_structure['house']['rooms'][room][0]['appliances'].push(data);
                }
                
            }
            else if(room != 'app-list' && func == 'remove') {
            let c_app_index =  0
                try{
                    c_app_index = search_app_by_id(this.data_structure['house']['rooms'][room]['appliances'], data['id'])
                    this.data_structure['house']['rooms'][room]['appliances'].splice(c_app_index, 1)
                }catch(err){
                    c_app_index = search_app_by_id(this.data_structure['house']['rooms'][room][0]['appliances'], data['id'])
                    let i=1;
                    while(c_app_index == -1 && i< this.data_structure['house']['rooms'][room].length){
                        c_app_index = search_app_by_id(this.data_structure['house']['rooms'][room][i]['appliances'], data['id'])
                        i++;
                    }

                    this.data_structure['house']['rooms'][room][0]['appliances'].splice(c_app_index,1)
                }    
            }

            if(func =='add')cur.push(data);
            else if(func =='remove')cur.splice(cur.indexOf(data), 1);
        }else if(type =='json'){
            switch(func){
                case 'remove':
                 
                    let ap = null
                    ap = data['appliances']
                    if(!ap)ap=data[0]['appliances']

                    for(let d of ap){
                        let power = d['Total Energy'] / d['Total-time']
                        let up = augmentVector(d['usage-profile'], -1*power)
                        up.splice(0,1)
                        lp  = addVectors(this.data_structure['house']['loading-profile'], up)
                        this.data_structure['house']['loading-profile'] = lp
                        this.data_structure['loading-profle'] = lp
                        this.data_structure['house']['app-list'].splice(search_app_by_id(this.data_structure['house']['app-list'], d['id']), 1);
                    }
                    delete cur[room];
                    break;

                case 'add': // add room to the house
                cur[room] = data   
                    // console.log(this.data_structure)
                for(let a of data['appliances']){
                    let power = a['Total Energy'] / a['Total-time']
                    let up = augmentVector(a['usage-profile'], 1 * power)
                    up.splice(0, 1)

                    lp = addVectors(this.data_structure['house']['loading-profile'], up)
                    this.data_structure['house']['loading-profile'] = lp
                    this.data_structure['house']['app-list'].push({...a})
                }

                break;
            }
        }
        
       
        this.update('POST', '/sizing-tool/update', {"data":lp})
        .then(res=>{
            let keys = Object.keys(res)
            for(let k of keys){
                this.data_structure[k] = res[k];
            }
            // console.log(this.data_structure)
            this.state = 0x11;
        })
        return this.data_structure
    }

    liveData(){
        return this.data_structure
    }    

    get(key){

        if(this.isReady()){
            return this.traverseDataStructure(key)
        }else{
            return {'error':'Still loading...'}
        }
    }

    isReady(){return this.state==0x11}


    isNewData(){
        return this.state == 1;
    }

}
