
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

        let cur = this.data_structure
        path = path.split('>')
        for(let p of path){
            cur = cur[p]
        }
        // console.log(this.data_structure['app-list'].indexOf(data))
        if(type.toLowerCase() == 'array')cur.push(this.data_structure['app-list'][this.data_structure['app-list'].indexOf(data)])
       
        let lp = computeLoadingProfile(this.data_structure['house']['app-list'])
        lp[23] = 0;
        return this.update('POST', '/sizing-tool/update', {"data":lp})
    }

    liveData(){
        return this.data_structure
    }    

    get(key){

        if(this.isReady()){
            // console.log(this.data_structure[key])
            return this.data_structure[key] 
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
