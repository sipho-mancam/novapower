window.addEventListener('load', function(){
    
    const url = this.location.href

    const p_url = new  URL(url)
    _token = p_url.searchParams.get('session_token')
    let table_body = document.getElementById('table-body')

    let path = '/admin/get_quotes?session_token=' + _token
    make_request('GET', path)
    .then(res=>{
        console.log(res)
        table_body.innerHTML = get_table_rows(res);
    })

})


function get_table_rows(cart_list={}){
    let res = ''
    let counter = 0
    const keys = Object.keys(cart_list)
    let i = null
    for(let j=0; j<keys.length; j++){
        i = cart_list[keys[j]]
        res+=`<tr>
            <th scope="row">${counter}</th>
            <td>${i.name}</td>
            <td>${i.address}</td>
            <td><a href="mailto:${i.email}?subject=Quote-Response">${i.email}</a></td>
            <td>${i.cell +', '+i['alt-num']}</td>
            <td><a href="#">View Order-details</a></td>
        </tr>
        `
        counter ++;
    }

    return res
}