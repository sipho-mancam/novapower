// window.addEventListener('load', function(){

//     let login_b = this.document.getElementById('login-submit')

//     login_b.addEventListener('submit', function(e){
//         e.preventDefault()
//         const form_data = FormData(this.document.getElementById('loginForm'))
        
//         make_request('POST', '/admin-login-d',form_data)
//         .then(res=>{
//             _token = res
//             window.location.pathname = '/admin?session_token='+_token
//         })

//     })


// })