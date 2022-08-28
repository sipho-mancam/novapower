
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
        this.old_data = {};
        this.new_data = {};
        this.state = 0;
        this.read = 0
        
    }

    update(method, url, data){
        make_request(method, url, data)
        .then(res=>{
            this.new_data = res;
            this.state = 1
            this.read = 0
            this.old_data = this.new_data
        });
    }

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