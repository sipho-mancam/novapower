
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
                    '/sizing-tool?f=10']
        for(let p of paths){
            await this.update('GET', p)
            .then(res=>{
                let keys = Object.keys(res)
                for(let k of keys){
                    this.data_structure[k] = res[k];
                }
                
            })
            
        }

        console.log(this.data_structure)
      
        this.state = 0x11  
    }

    update(method, url, data){
        this.state = 0x00;
        return make_request(method, url, data)
    }

    get(key){
        if(this.isReady()){
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
