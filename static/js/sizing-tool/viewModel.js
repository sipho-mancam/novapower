/**
 * Hold the house model (current state)
 * Change house model as per UI controllers request and update the live data through repository
 * 
 */



class ViewModel{
    constructor(){
        this.livedata = {}
        this.repoistory = new Repository()
        this.update_query = ''
    }
    
    init(){
        /**
         * Request the house from the repository.
         * 
         */
    }
}