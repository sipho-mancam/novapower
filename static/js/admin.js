window.addEventListener('load', function(){
    const resp = get_session_token()
    let table_body = document.getElementById('table-body')
    resp
    .then(function(token){
        let session_token = token;


        let path = '/admin/get_quotes?session_token=' + session_token
        make_request('GET', path)
        .then(res=>{
            console.log(res)
            table_body.innerHTML = get_table_rows(res);
        })
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