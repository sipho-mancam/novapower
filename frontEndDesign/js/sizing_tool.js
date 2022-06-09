let form = document.getElementById('sizing-form')
let sys_price = document.getElementById('sys-price')
let size = document.getElementById('roi')

let formkeys = [
    'kettle',
    'home server',
    'heater',
    'ac',
    'cctv',
    'microwave',
    'toaster',
    'oven',
    'freezer',
    'pool pump',
    'heat pump',
    'borehole',
    'stove',
    'geyser',
]

let cons = ' Bed House'

let base_url = 'https://novapower.herokuapp.com/'

async function postData(url='', data={}){

    const response = await fetch(url, {
        method:'POST',
        body:JSON.stringify(data)

    });

    return response
}


form.addEventListener('submit', function(e){
    e.preventDefault()
        let data = new FormData(e.currentTarget)
        let iter = data.keys()
        let body_json = {}
        for(const i of data.keys()){
            body_json[i] = data.get(i).toUpperCase()

            if(i == 'size' && !(body_json[i].match('[0-9][\\s][a-zA-Z]+'))){
                body_json[i] += ' BED HOUSE'
            }
        }
        
        for(let i of formkeys){
            if(!(i in body_json)){
                body_json[i] = 'FALSE'
            }    
        }

        postData(base_url+'size-me', body_json)
        .then(data=>{
                if(data.ok){
                    data.json()
                    .then(res=>{
                        // console.log('Something to see')
                        sys_price.innerText = res['price']
                        size.innerText = res['size']
                    })
                    .catch(err=>{
                        console.log(err)
                    })
                }else{
                    alert('Request failed..')
                }   
            }
        )
        .catch(err=>{
            console.log(err)
        })
});