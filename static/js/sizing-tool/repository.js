
/**
 * Will make contact with the outside world and keep data updated in the system
 * Store and manage data 
 * update the data accordingly ... 
 *  How do we do this ?
 */

class Repository{
    constructor(){
        this.current_data = {};
        this.data_structure = {};
        this.state = 0;
        this.read = 0
        
    }

    update(method, url, data){
        make_request(method, url, data)
        .then(res=>{
            this.current_data = res;
            this.state = 1
            this.read = 0
        });
    }

    read_data(){

    }
}