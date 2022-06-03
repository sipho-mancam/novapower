let canvas = document.getElementById('canvas');
canvas.width = innerWidth-innerWidth*0.05;
canvas.height = innerHeight - innerHeight*0.05;
let stage = new createjs.Stage(canvas);

class AnimeObject{
    constructor(stage, color){
        this.stage = stage;
        this.color = color;
        this.x = stage.canvas.width/2;
        this.y = stage.canvas.height/2;
        this.width = 0;
        this.height = 0;
        this.id = 0;
        this.shape = new createjs.Shape();
        this.graphics = this.shape.graphics;
        this.radius = 3;
        this.stage.addChild(this.shape);
        this.next = null;
        this.prev = null;
        this.link = false;
        this.xBoundary = this.stage.canvas.width-10;
        this.yBoundary = this.stage.canvas.height-10;
        this.omega = 0;
        this.dx = 0.5;
        this.dy = 0.6;
        this.lineColor = 'rgba(110,110, 110, 0.5)';
    }

    addNode(elem){
        if(this.next == null){
            this.next = elem;
            elem.prev = this;
        }
        else{
            this.next.addNode(elem);
        }
    }

    generateObjects(n){
        for(let i=1; i<n; i++){
            let temp = new AnimeObject(this.stage, this.color);
            temp.omega = i*360/(n-1);
            temp.dy = Math.sin((Math.PI/180)*temp.omega)*(0.2+Math.random()*5);
            temp.dx = Math.cos((Math.PI/180)*temp.omega)*(0.2+Math.random()*4);

            temp.x = 10+Math.random()*(this.stage.canvas.width-10)
            temp.y = 10+Math.random()*(this.stage.canvas.height - 10)
            temp.id = i;
            temp.lineColor = 'rgba(110,110, 110, 0.5)';
            temp.link = true;
            this.addNode(temp);
        } 
    }

    setXY(x, y){
        this.x = x;
        this.y = y;
    }

    showMe(){
        this.graphics.beginFill(this.color);
        this.graphics.drawCircle(this.x, this.y, this.radius);
    }

    createLink(head){
        this.link = true;
        this.graphics.setStrokeStyle(1);
        this.graphics.beginStroke(this.lineColor);
        this.graphics.moveTo(this.x, this.y);
        this.graphics.lineTo(head.x, head.y);
        this.graphics.endStroke();  
    }

    clearAll(){
        this.graphics.clear();
    }

    update(head){
        if(this.x+this.radius+this.dx < this.xBoundary && this.x-this.radius+this.dx >= 0)this.x += this.dx;
        else this.dx = -1*(this.dx+Math.floor(Math.random()*0.02));
        if(this.y+this.radius+this.dy < this.yBoundary && this.y-this.radius+this.dy >= 0)this.y += this.dy;
        else this.dy = -1*(this.dy+Math.floor(Math.random()*0.05));
        this.clearAll();
        if(this.next!=null)this.broadCastBall(this.next);
        this.showMe();
        if(this.next != null)this.next.update(head);
    }

    clearLink(){
        this.clearAll();
        this.link = false;
        this.showMe();
    }

    broadCastBall(head){ // detect ball collision

        let closeObject = [];

        head.whoHasXY(this.x, this.y, this.id, closeObject, 250);
        if(closeObject.length != 0){
            for(let i = 0; i<closeObject.length; i++)
                this.createLink(closeObject[i]);
        }
    }

    whoHasXY(x, y, id, objects = [], lim){
        if(Math.sqrt(Math.pow((this.x - x), 2) + Math.pow((this.y - y), 2)) < lim && id != this.id)objects.push(this);
        if(this.next != null)this.next.whoHasXY(x, y, id, objects, lim);
        return objects;
    }

}

let mouseObject = new AnimeObject(stage, 'rgba(0,0,0,0)');
mouseObject.id = 'mouse';

let head = new AnimeObject(stage, 'yellow');
head.addNode(mouseObject);
head.generateObjects(20);

for(let i=0; i<5; i++){
    let tempO = new AnimeObject(stage, 'rgba(110, 110, 110, 1)');
    tempO.radius = 3;
    tempO.dy = (0.2+Math.random()*2.5);
    tempO.dx = (0.2+Math.random()*2.2);

    tempO.x = 10+Math.random()*stage.canvas.width/2
    tempO.y = 10+Math.random()*stage.canvas.height/2
    tempO.id = i;
    tempO.lineColor = 'rgba(110,110, 110, 0.5)';

    head.addNode(tempO);
}

head.createLink(head.next);

createjs.Ticker.addEventListener('tick', function(e){
    head.update(head);
    head.stage.update();
});

canvas.addEventListener('mousemove', function(e){
    mouseObject.x = e.x;
    mouseObject.y = e.y;
})