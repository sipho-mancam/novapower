
let current_selected = document.getElementsByClassName('selected')[0];
let data_table = null; 
let count_views = null
let quote_view = null;
let overlay_v = null;
let close_q_overlay = null;
let display = null
let table = null
let flag = true;

window.addEventListener('load', function(){
    data_table = {
        'waiting':[],
        'initiated':[],
        'processed':[],
        'completed':[],
        'enquiries':[]
    }
    quote_view = document.getElementById('view-quote');
    count_views =  document.getElementsByClassName('count');
    overlay_v = this.document.getElementById('overlay');
    close_q_overlay = document.getElementById('close-q-overlay');
    display = this.document.getElementById('display');
    table = this.document.getElementById('table')
    const url = this.location.href;
    
    close_q_overlay.addEventListener('click', function(e){
        overlay_v.style.display = 'none';
    })
    
    init_tabs()
    const p_url = new  URL(url)
    _token = p_url.searchParams.get('session_token')

    let path = '/admin/get_quotes?session_token=' + _token
    make_request('GET', path)
    .then(res=>{
        // sconsole.log(res)

        let p = '/admin/get_enquiries?session_token=' + _token
        make_request('GET', p)
        .then(res=>{
            for(let key in res){
                data_table['enquiries'].push(res[key]);
            }
            update_counts()
        });
        sort_data(res)
        init_tabs()
        update_counts()
        update_table()
    })
})


function update_counts(c_views=count_views){
    for(let v of c_views){
        let n = v.getAttribute('name')
        v.innerText = '('+data_table[n].length+')';
    }
}

function update_table(){
    table.style.display = 'block';
    display.style.display ='none';
    const table_body = document.getElementById('table-body')
    table_body.innerHTML = get_table_rows(data_table[current_selected.getAttribute('name')]); 
    init_table();
}

function sort_data(data, d_table=data_table){
    for(let key in data){
        if('status' in data[key]){
            d_table[data[key]['status']].push(data[key]);
        }
        else{
            data[key]['status'] = 'waiting';
            d_table[data[key]['status']].push(data[key]);
        }
    }

    for(let i in data_table){ // order by latest
        data_table[i] = reverse_array(data_table[i]);
    }
}

function update_select(status){
    const options = [
        'waiting',
        'initiated',
        'processed',
        'completed'
    ]
    let res = ''
    for(let i of options){
        if(i != status){
            res +=`<option value=${i}>${i}</option>`
        }
    }
    return res
}

function get_table_rows(cart_list={}){
    let res = ''
    let counter = 0
    const keys = Object.keys(cart_list)
    let i = null
    for(let j=0; j<keys.length; j++){
        i = cart_list[keys[j]]
        res+=`<tr>
            <th scope="row" name="index">${counter}</th>
            <td name="name">${i.name}</td>
            <td name="address">${i.address}</td>
            <td name="email"><a href="mailto:${i.email}?subject=Quote-Response">${i.email}</a></td>
            <td name="date">${i.date}</td>
            <td name="view-button"><a name="view-button" href="#">View Order</a></td>
            <td name="select">
                <select name="select" class="form-select status-select">
                    <option selected value=${i.status}>${i.status}</option>
                    ${update_select(i.status)}
                </select>
            </td>
            <td name="champion">
               <span >WB</span> 
            </td>
        </tr>
        `
        counter ++;
    }

    return res
}

function reverse_array(arr=[]){
    let rev_arr = []
    for(let i=arr.length-1; i>=0; i--){
        rev_arr.push(arr[i])
    }
    return rev_arr
}


function init_table(){ 
    const table_rows = document.getElementsByTagName('tr')

    for(let i of table_rows){
        i.addEventListener('click', function(e){     
            // get the currently selected list....(it's the only one we are interacting with anyways...)
            //  get the index of the current pressed row, it represents the position in the list.
            // use it to get the data and perform updates...
            const d_key = current_selected.getAttribute('name')
            const index = (i.rowIndex-1)
            const current_item = data_table[d_key][index]
            if(!flag){
                if(e.target.getAttribute('name') == 'select'){
                    const p_data = data_table[d_key].splice(data_table[d_key].indexOf(current_item), 1);
                    const next_list = e.target.value;
                    console.log(next_list)
                    p_data[0]['status'] = next_list
                    data_table[next_list].push(p_data[0]);
                    update_counts()
                    console.log('I run')
                    update_server(p_data[0])
                    update_table(); 
                }
            
                flag = !flag;
                return
            }
            flag = !flag;

            if(e.target.getAttribute('name') == 'view-button'){
                overlay_v.style.display = "flex";
                quote_view.innerHTML = current_item['pdf_data']
                close_q_overlay = document.getElementById('close-q-overlay');
                close_q_overlay.addEventListener('click', function(e){
                    overlay_v.style.display = 'none';
                });
            }

            // update_table();
        })
    }
}

function init_tabs(){
    const tabs = document.getElementsByClassName('tab-item')
    for(let i of tabs){
        i.addEventListener('click',function(e){
            current_selected.className = current_selected.className.replace('selected',' ');
            this.className += ' selected';
            current_selected = this;
            //load the current list...
            // refresh table
            if(this.getAttribute('name')!='enquiries')update_table();
            else{
                table.style.display = 'none';
                display.style.display ='flex';
                display.innerHTML = get_enquiries_list_view();
                
            }
        });
    }
}

function update_server(item_s){
    let path = '/admin/update_quotes?option=one&session_token='+_token
    if('_id' in item_s){
        const id = item_s['_id'];
        delete item_s['_id']
        item_s['uid'] = id
    }
    make_request('POST', path, item_s)
    .then(function(response){
        // console.log(response)
    })
}

function get_enquiries_list_view(){
    let enquiries_list = data_table['enquiries'].reverse();
    let res = ''

    enquiries_list = reverse_array(enquiries_list)

    for(let i of enquiries_list){
        res +=
        `<div class="row user-det">
            <span class="user-details">${i.name}&nbsp; - <em>${i.subject}</em> &nbsp; (${i.email})</span>
            <span class="time">${i.time}</span>
            <span class="message">
                ${i.message}
            </span> 
        </div>`
    }
    return res
}