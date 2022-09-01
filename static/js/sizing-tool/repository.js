
/**
 * Will make contact with the outside world and keep data updated in the system
 * Store and manage data 
 * update the data accordingly ... 
 * How do we do this ?
 */

class Repository{
    constructor(){
        this.current_data = {};
        this.data_structure = {};
        this.old_data = {};
        this.new_data = {};
        this.state = 0;
        this.read = 0;
        this.init()

    }

    async init(){
        /**
         * Get apps list.
         * Get Default house model
         * Get Default pacakges
         */
        this.state = 0x00;

        let paths = ['/sizing-tool/apps-list',
                    '/sizing-tool?f=init']
        for(let p of paths){
            await this.update('GET', p)
            .then(res=>{
                let keys = Object.keys(res)
                for(let k of keys){
                    this.data_structure[k] = res[k];
                    // if(k == 'house')this.updateContent(res[k])
                }  
            })   
        }
        // console.log(this.data_structure
        this.state = 0x11  
    }

    update(method, url, data){
        this.state = 0x00; // reading state
        return make_request(method, url, data)
    }

    updateContent(house){
        let loadingProfile = computeLoadingProfile(buildAppList(house))
        this.update('POST', '/sizing-tool/update', {"data":loadingProfile})
        .then(res=>{
            let keys = Object.keys(res)
            for(let k of keys){
                this.data_structure[k] = res[k];
                
            }
            // console.log(this.data_structure)
            this.state = 0x11; // data is ready state
        })
    }
    updateLiveData(data_m={}){
        let path = data_m["path"];
        let data = data_m["data"];
        let type = data_m["type"];
        let func = data_m["func"];
        let room = data_m["room"];

        let cur = this.data_structure
        path = path.split('>')
        for(let p of path){
            cur = cur[p]
        }
        // console.log(data)
        let dir = 1;
        if(func == 'add'){
            dir = 1
        }else if(func =='remove') dir = -1;

        let power = data['Total Energy'] / data['Total-time']
        let up = augmentVector(data['usage-profile'], dir*power)
        up.splice(0,1)
        
        let lp  = addVectors(this.data_structure['house']['loading-profile'], up) 
        this.data_structure['house']['loading-profile'] = lp
        
       
        if(room != 'app-list' && func == 'add') {
            try{
                this.data_structure['house']['rooms'][room]['appliances'].push(data);
            }catch(err){
                this.data_structure['house']['rooms'][room][0]['appliances'].push(data);
            }
            
        }
        else if(room != 'app-list' && func == 'remove') {
            this.data_structure['house']['rooms'][room]['appliances']
            .splice(this.data_structure['house']['rooms'][room]['appliances'].indexOf(data), 1)
        }
       
        if(type.toLowerCase() == 'array' && func =='add')cur.push(data);
        else if(func =='remove')cur.splice(cur.indexOf(data), 1);
       
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
        let temp = key.split('>')

        if(this.isReady()){
            // console.log(this.data_structure[key])
          if(temp.length==1){
            return this.data_structure[temp[0]] 
          }else{
            let cur = this.data_structure
            for(let k of temp){
                cur = cur[k]
            }
            console.log(cur, 'cur is <<')
            return cur
          }
            
        }else{
            return {'error':'Still loading...'}
        }
    }

    isReady(){return this.state==0x11}

    read_data(){
        if(this.state == 0) return this.old_data;
        else if(this.state == 1) {
            this.read = 1;
            return this.new_data;        
        }
    }

    isNewData(){
        return this.state == 1;
    }

}
