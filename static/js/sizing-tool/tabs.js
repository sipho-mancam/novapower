


/**
 * Initialise tabs
 * update tabs and the content view 
 * manage tabs view and responses
 * 
 */


let current_tab = {}

function init_tabs() {
    const tabs = document.getElementsByClassName('tab')
    console.log(tabs[0].getAttribute('group'))
    current_tab[tabs[0].getAttribute('group')] = tabs[0]
    for (let t of tabs) {
        t.addEventListener('click', function (e) {
            /**
             * Update Tab State view.
             */
            let data_p = e.target.getAttribute('name')
            let group = t.getAttribute('group')
            t.className += ' selected-tab'
            current_tab[group].className = current_tab[group].className.replace('selected-tab', ' ');
            current_tab[group] = t
        })
    }
}


window.addEventListener('load', function(){
    init_tabs();
})



