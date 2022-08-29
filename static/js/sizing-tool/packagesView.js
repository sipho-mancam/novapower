
class PackagesView extends View{
    constructor(name, domElem, extras={}){
        super()
        this.name = name
        this.domElement = domElem
        this.extras = extras
        this.data = null
    }

    update(){

    }

    load_data(data=0){

    }

    packageView(package, name='Solar', index){
        return(
            `<div class="cust-card">
                <div class ="image">
                    <img  src="${''}" alt="" width="210" height="210"  alt="p-h" />
                </div>
                <div class="info">
                    
                <span>
                    system with:  <br />
                </span>
                    <p class='price'>${package['price'].toLocaleString('af-ZA', {style:'currency', currency:'ZAR'})}*</p>
                </div>
                <div class="controls">
                    <a class="add-to-cart h-buttons" id="${package['_uid']}" index=${index}>Add to Cart</a> 
                    <a class="view-more-buttons h-buttons" id="${package['_uid']}+1" index=${index}>View Details</a>
                </div>
            </div>`
        )
    }
       
}