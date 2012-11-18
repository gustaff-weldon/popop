// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function randomInt( min, max ) {
     return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
}

function Game() {

    this.currentWidth = null;
    this.currentHeight = null;
    this.canvas = null;
    this.ctx = null;
    this.draw = null;
    this.scale = 1;
    this.offset = {
        top: 0,
        left: 0
    };
    this.entities = [];
    this.nextBubble = 100;
}


Game.prototype = {

    init: function() {

        this.WIDTH = 320;
        this.HEIGHT = 480;

        // setup stage ratio and dimensions
        this.RATIO = this.WIDTH / this.HEIGHT;
        this.currentWidth = this.WIDTH;
        this.currentHeight = this.HEIGHT;

        // get canvas and 2d context, set it"s dimensions
        var canvas = document.getElementById( "stage" );
        canvas.width = this.WIDTH;
        canvas.height = this.HEIGHT;

        this.ctx = canvas.getContext( "2d" );
        this.canvas = canvas;

        this.draw = new Draw( this.ctx, this.WIDTH, this.HEIGHT );
        this.input = new Input( this );

        this.resize();
        this.addEvents();
        this.loop();
    },


    addEvents: function() {

        var that = this;

        // resize stage when screen size changes
        window.addEventListener( "resize", function() {
            that.resize();
        } , false);

        // listen for clicks
        window.addEventListener( "click", function( event ) {
            event.preventDefault();
            that.input.set( event );
        }, false);

        // listen for touches
        window.addEventListener( "touchstart", function( event ) {
            event.preventDefault();
            // use first touch
            that.input.set( event.touches[0] );
        }, false);
        window.addEventListener( "touchmove", function( event ) {
            // prevent default behaviour (scroll, zoom )
            event.preventDefault();
        }, false);
        window.addEventListener( "touchend", function( event ) {
            // as above
            event.preventDefault();
        }, false);
    },


    resize: function() {

        this.currentHeight = window.innerHeight;
        this.currentWidth = this.currentHeight * this.RATIO;

        this.scale = this.currentWidth / this.WIDTH;
        this.offset.top = this.canvas.offsetTop;
        this.offset.left = this.canvas.offsetLeft;

        console.log( "resize" +  this.offset.left + " " + this.offset.top );

        this.canvas.style.width = this.currentWidth + "px";
        this.canvas.style.height = this.currentHeight + "px";

        setTimeout( function() {
            window.scrollTo( 0, 1 );
        }, 0 );
    },


    loop: function() {

        var that = this;

        function loopStep() {
            requestAnimFrame( loopStep );
            that.update();
            that.render();
        }
        loopStep();
    },


    update: function() {

        if ( this.input.tapped ) {
            this.entities.push( new Touch( this.input.x, this.input.y, 10, this.draw ) );
            // mark input as served
            this.input.tapped = false;
        }

        // decrease our nextBubble counter
        this.nextBubble -= 1;

        // if it"s time for next bubble
        if ( this.nextBubble < 0) {
            this.entities.push( new Bubble( this.WIDTH, this.HEIGHT, this.draw ) );
            // reset the counter with a random value
            this.nextBubble = ( Math.random() * 100 ) + 100;
        }

        for ( var i = 0; i < this.entities.length; i++ ) {
            this.entities[ i ].update();
            // delete entity if it"s remove flag is true
            if ( this.entities[ i] .remove ) {
                this.entities.splice( i, 1 );
            }
        }
    },


    render: function() {

       this.x = this.x || 80;
        // this.draw.clear();

        this.draw.rect( 0, 0, this.WIDTH, this.HEIGHT, "#036" );
        this.draw.rect( this.x, 80, 30, 30, "green" );

        // cycle through all entities and render to canvas
        for ( var i = 0; i < this.entities.length; i++ ) {
            this.entities[i].render();
        }
    }


};
Game.prototype.constructor = Game;


function Draw( ctx, width, height ) {

    this.ctx = ctx;
    this.width = width;
    this.height = height;
}


Draw.prototype = {

    clear: function() {

        this.ctx.clearRect( 0, 0, this.width, this.height );
    },


   rect: function( x,  y, width, height, color ) {

        this.ctx.fillStyle = color;
        this.ctx.fillRect( x, y, width, height);
    },


    circle: function( x, y, radius, color ) {

        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc( x + 5, y + 5, radius, 0, Math.PI * 2, true );
        this.ctx.closePath();
        this.ctx.fill();
    },


    text: function( text, x, y, size, color ) {

        this.ctx.fillStyle = color;
        this.ctx.font = "bold " + size +"px Monospace";
        this.ctx.fillText( text, x, y );
    }


};
Draw.prototype.constructor = Draw;


function Input( game ) {

    this.x = 0;
    this.y = 0;
    this.tapped = false;
    this.game = game;
}

Input.prototype = {

   set: function( data ) {

        console.log( data );
        var offsetTop = this.game.canvas.offsetTop,
            offsetLeft = this.game.canvas.offsetLeft,
            scale = this.game.currentWidth / this.game.WIDTH;

        console.log( scale, this.game.scale);
        console.log( offsetLeft, offsetTop, this.game.offset );

        this.x = ( data.pageX - offsetLeft ) / scale;
        this.y = ( data.pageY - offsetTop ) / scale;

        // does not work for some reason...
        // this.x = ( data.pageX - this.game.offset.left ) / this.game.scale;
        // this.y = ( data.pageY - this.game.offset.top ) / this.game.scale;

        this.tapped = true;
    }
}
Input.prototype.constructor = Input;


function Touch( x, y, radius, draw ) {

    this.type = "touch";
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.opacity = 1;
    this.fade = 0.05; // fadout amount for game tick
    this.remove = false; //true if entity should be removed
    this.draw = draw;
}

Touch.prototype = {

    update: function() {

        this.opacity -=this.fade;
        this.remove = this.opacity <=0;
    },


    render: function() {

        this.draw.circle( this.x, this.y, this.radius, "rgba(255,0,0," + this.opacity + ")" );
    }
};
Touch.prototype.constructor = Touch;


function Bubble( stageWidth, stageHeight , draw ) {

    this.type = "bubble";
    this.radius = randomInt( 10, 30 );
    this.x = randomInt( this.radius, stageWidth - this.radius );
    this.y = stageHeight + 100;
    this.yv =  randomInt( 1, 3 );
    this.remove = false;
    this.draw = draw;

    console.log( this );
}

Bubble.prototype = {

    update: function() {
        this.y -= this.yv;

        // if off screen, flag for removal
        if ( this.y < -this.radius * 2 ) {
            this.remove = true;
        }
    },

    render: function() {

        this.draw.circle( this.x, this.y, this.radius, "rgba(255,255,255,1)" );
    }
};
Bubble.prototype.constructor = Bubble;


window.addEventListener( "load", function() {

    window.POPOP = new Game();
    POPOP.init()
    POPOP.draw.circle( 30, 30, 20, "red" );
}, false);
