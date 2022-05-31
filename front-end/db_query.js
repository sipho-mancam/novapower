

let xhttp = new XMLHttpRequest();

view = document.getElementById('dis')

xhttp.addEventListener('readystatechange',function(){
    res = JSON.parse(this.responseText)
    console.log(res)
    let keys_array = Object.keys(res)
    for(let i=0; i<100; i++){
        view.innerHTML += get_view(res[keys_array[i]])
    }
    
})

xhttp.open('GET', 'http://10.30.0.48:5000/item/solar-collection');
xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
xhttp.send();
