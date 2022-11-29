

class CartView extends View{
    constructor(name, domElem, extras){
        super()
        this.name = name
        this.domElement = domElem;
        this.extras = extras;
        this.view_callBack = null;
        if(this.domElement){
            this.domElement.parentNode.addEventListener('click', (e)=>{
                window.location.pathname = '/cart'
            })
        }
    }


    load_data(){
        console.log(this.viewModel)
        this.viewModel.get('cart-count')
        .then(res=>{
            this.domElement.innerText = res
        });
    }

    update(){
        this.load_data()
       
    }
}


uiController.registerView( new CartView('cart-count', document.getElementById('cart-badge'), {}))