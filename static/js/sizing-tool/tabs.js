


/**
 * Initialise tabs
 * update tabs and the content view 
 * manage tabs view and responses
 * 
 */


function init_tabs() {
    const tabs = document.getElementsByClassName('tab')
    for (let t of tabs) {
        t.addEventListener('click', function (e) {
            let data_p = e.target.getAttribute('name')
            alert(data_p)
        })
    }
}
