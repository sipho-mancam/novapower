


/**
 * Initialise tabs
 * update tabs and the content view 
 * manage tabs view and responses
 * 
 */


let current_tab = {}

let packagesV = packageView

function init_tabs() {
    const tabs = document.getElementsByClassName('tab')
    const viewModel = global_viewModel

    for (let t of tabs) {
        if(t.getAttribute('group') in current_tab);
        else {
            current_tab[t.getAttribute('group')] = t;
            
            if(t.getAttribute('group') == "info" ){ // we are looking at the house info tabs
                viewModel.get('house')
                .then(res=>{
                    appGridV.load_data(res['app-list'])
                })
            }
        }

        let appGridV = new AppGridView('house-apps', document.getElementById('house-tab-content'), {})
        // uiController.registerView(appGridV)

        t.addEventListener('click', function (e) {
            /**
             * Update Tab State view.
             */
            let data_p = t.getAttribute('name')
            let group = t.getAttribute('group')
            t.className += ' selected-tab'
            current_tab[group].className = current_tab[group].className.replace('selected-tab', ' ');
            current_tab[group] = t

            /**
             * Update tab content view accordingly
             */
            // console.log(data_p)
            if(group == "info" && data_p == "app-list"){ // we are looking at the house info tabs
                viewModel.get('house')
                .then(res=>{
                    appGridV.load_data(res['app-list'])
                })
            }else if(group=="packages"){
                packagesV.updateTab(data_p)

            }else if(group == "info" && data_p == "stats"){
               let t_content = document.getElementById('house-tab-content')
               t_content.innerHTML = '<br />'
            }
        })
    }
}

class TabSystem extends View{
    constructor(name, documentslem, extras){
        super()
        this.name = name;
        this.domElement = domElem
        this.extras = extras;
        this.data = null; 
        this.tabContentsView = {}
    }

    registerTabContentView(tcv){

    }

    update(){
        // update all tab contents
    }

    load_data(){
        // for dynamic tabs loaded with data
    }
}


class TabContentView extends View{
    constructor(name, domElem, extras){
        super()
        this.name = name;
        this.domElement = domElem
        this.extras = extras
        this.data = null;

    }

    update(){
        
    }

    load_data(){

    }
}


window.addEventListener('load', function(){
    init_tabs();
})



