

/**
 * You Draw callback to display contents in the overlay will recieve a single input everytime (extras)
 * 
 */


class OverlayContainer{
    constructor(name,  drawCb, extras, init=0){
        this.name = name;
        this.drawCallBack = drawCb
        this.extras = extras;
        this.close_b = '<h1 class="close-overlay" id="close-ol"><i class="bi bi-x"></i></h1>'
        this.domElement = document.getElementById('overlay-content-container') 
        this.content_container = document.getElementById('overlay-container')
        this.initCb = init
    }

    open(data=0){
        if(data==0)this.domElement.innerHTML = this.drawCallBack(this.extras)
        else this.domElement.innerHTML = this.drawCallBack(data);

        this.content_container.style.display = 'block';
        this.close()
        if(this.initCb != 0)this.initCb()
    }   

    close(b=false){
        if(!b){
            let b = document.getElementById('close-ol')
            b.addEventListener('click', (e)=>{
                this.content_container.style.display = 'none';
            })
        }else{
            this.content_container.style.display = 'none';
        }
        
    }
    draw(draw_cb, args=[], init=0){
        this.content_container.style.display = 'block';
        if(typeof(args) != 'Object')args = [args];

        if(args.length == 0){ // assume draw_cb doesn't expect arguments.
            this.domElement.innerHTML = draw_cb()
            // this.domElement.innerHTML += this.close_b;
        }else{
            this.domElement.innerHTML = draw_cb(args)
            // this.domElement.innerHTML += this.close_b;
        }
        if(init != 0)init()
        this.close()
    }

}


// let ov = new OverlayContainer('overlay', (extras)=>{
//             return `<h1 style="color:black">${extras}</h1>`
// }, 'Hello world', ()=>{
//     alert('hello world')
// })


// ov.open()