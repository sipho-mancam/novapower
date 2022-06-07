window.addEventListener('load', function(e){
    
    this.setTimeout(function(){
        console.log('I run', featured_products)
        let v = this.document.getElementById('featured-cont')
        v.innerHTML = ''
    
        for(let i=0; i<featured_products.length; i++){
            v.innerHTML += get_card_html(featured_products[i])
        }
    }, 2000)
    
})