

let xhttp = new XMLHttpRequest();

xhttp.addEventListener('readystatechange',function(){
    console.log('response - Text')
    console.log(this.responseText)
});


xhttp.open('GET', 'http://10.30.0.48:5000/item/solar-colection');
xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');

xhttp.send();