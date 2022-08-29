


/**
 * Initialise tabs
 * update tabs and the content view 
 * manage tabs view and responses
 * 
 */


let current_tab = {}

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
            console.log(data_p)
            if(group == "info" && data_p == "app-list"){ // we are looking at the house info tabs
                viewModel.get('house')
                .then(res=>{
                    appGridV.load_data(res['app-list'])
                })
            }
        })
    }
}


window.addEventListener('load', function(){
    init_tabs();
})



