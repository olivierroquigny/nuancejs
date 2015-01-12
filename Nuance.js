/*
 * Nuance Class
 * @author: Olivier Roquigny
 * @licence: GPL 2
 * 
 * @TODO: layers management 

	- we need a stack of layers and for each layer we need :
		- layer order number
		- an optionnal name 
		- html id
		- context or type
		- frames as Array
		- container id if we want to:
			- create the layer on fly 
			- manipulate the layer and parent on the fly (resize, move, hide, show ...)

	- use html id as JS keys
	- default canvas (id)
	- get a div container => config.container_id || "c_nuance"
	- get 
		- the canvases already present in the container 
			make a stack with them
		- or the only canvas (id) 
		- or the default canvas 
	- make a container if (config.container_id and not exist?
		- where ?
	- make canvases in the container with IDs
	- config with multi canvases frames

 * @TODO: make frames, shapes, segments as Arrays => if (value instanceof Array) {
 * @TODO: sort shapes and segments and put them consecutive
 * @TODO: requestAnimationFrame
 * @TODO: gradient management
 * @TODO: text support
 * @TODO: memorize region
 * @TODO: easy region copying
 * @TODO: easy region removing
 * @TODO: shape detection
 * @TODO: easy shape creation
 * @TODO: video support
 * @TODO: audio support
 * @TODO: webgl support
 * @TODO: SVG support?
 */

function Nuance(config){
	var config = config || {};
	this.interval = config.interval || 80;
	this.currentFrame = 0;
	this.lastFrame = config.lastFrame || 50;
	this.loop = config.loop || false;
	// loop on the layers in config
	this.layers = new Array();
	config.layers = config.layers || new Array();
	for(var i=0; i<config.layers.length; i++){
		this.layers[i] = new Object();
		this.layers[i].id = config.layers[i].id || 'nuance'; // in the stack
		this.layers[i].contextType = config.layers[i].contextType || '2d'; // in the stack
		this.layers[i].frames = config.layers[i].frames || {}; // in the stack
		this.layers[i].context = null; // in the stack

		this.setContext(i); // in the stack		
	}
/*
	this.id = config.id || 'nuance'; // in the stack
	this.contextType = config.contextType || '2d'; // in the stack
	this.frames = config.frames || {}; // in the stack
	this.context = null; // in the stack

	this.setContext(); // in the stack
*/


	if(config.start){
		this.play();
	}
}

Nuance.LINE = 0;
Nuance.ARC = 1;
Nuance.RECT = 2;
Nuance.CIRCLE = 3;
Nuance.IMAGE = 4;
Nuance.QUAD = 5;
Nuance.BEZIER = 6;

Nuance.prototype.play = function(){

	if(this.timer){
		window.clearInterval(this.timer);
	}

	var passThis = this;
	this.timer = setInterval(
		function(){ passThis.execFrame(); }, 
		this.interval
	);
}

Nuance.prototype.stop = function(){
	window.clearInterval(this.timer);
}

Nuance.prototype.execFrame = function(){
	// in the stack
	for(var i=0; i<this.layers.length; i++){
		if(this.layers[i].frames[this.currentFrame]){
			var frame = this.layers[i].frames[this.currentFrame];
			if(this.layers[i].context){
				if(frame.shapes){
					for(var s in frame.shapes){
						var shape = frame.shapes[s]
						if(shape.type){
							/* it's a complete shape as rect, circle, image ... */
							switch(shape.type){
								case Nuance.RECT:
									this.drawRect(i, shape);
									break;
								case Nuance.CIRCLE:
									this.drawCircle(i, shape);
									break;
								case Nuance.IMAGE:
									this.drawImage(i, shape);
									break;
								default:

									break;
							}
						}else if(shape.segments){
							/* it's a composed shape, with multiples segments as line, arc, besier, quadratic ... */
							this.drawShape(i, shape);
						}
					}
				}
			}
		}
	}
	
	this.currentFrame++;
	if(this.currentFrame >= this.lastFrame){
		if(this.loop){
			this.currentFrame = 0;
		}else{
			this.stop();
		}
	}
}

// in the stack
Nuance.prototype.setContext = function(layer_num){
	var cvs = document.getElementById(this.layers[layer_num].id);
	if(cvs.getContext){
		this.layers[layer_num].context = cvs.getContext(this.layers[layer_num].contextType);
	}else{
		this.layers[layer_num].context = null;
	}
}

Nuance.prototype.drawImage = function(layer_num, config){
	if(config.image && config.image.width > 0){
		var img = config.image;
	}else{
		return;
	}
	var sx = config.sx || 0;
	var sy = config.sy || 0;
	var sw = config.sw || config.image.width;
	var sh = config.sh || config.image.height;
	var dx = config.dx || 0;
	var dy = config.dy || 0;
	var dw = config.dw || sw;
	var dh = config.dh || sh;
	var alpha = config.alpha || 1;
	
	// in the stack
	this.layers[layer_num].context.save();
	this.layers[layer_num].context.globalAlpha = alpha;
	this.layers[layer_num].context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
	this.layers[layer_num].context.restore();
}

Nuance.prototype.drawRect = function(layer_num, config){
	var x = config.x || 0;
	var y = config.y || 0;
	var width = config.width;
	var height = config.height;
	
	// in the stack
	if(config.fillStyle){
		this.layers[layer_num].context.fillStyle = config.fillStyle;
	}
	if(config.strokeStyle){
		this.layers[layer_num].context.strokeStyle = config.strokeStyle;
	}
	
	if(config.stroke || config.strokeStyle){
		this.layers[layer_num].context.strokeRect(x, y, width, height);
		if(config.fill || config.fillStyle){
			this.layers[layer_num].context.fillRect(x, y, width, height);
		}
	}else if(config.clear){
		this.layers[layer_num].context.clearRect(x, y, width, height);
	}else{
		this.layers[layer_num].context.fillRect(x, y, width, height);
	}
}

Nuance.prototype.drawCircle = function(layer_num, config){
	var x = config.x || this.layers[layer_num].context.width/2;
	var y = config.y || this.layers[layer_num].context.height/2;
	var radius = config.radius;

	// in the stack	
	if(config.fillStyle){
		this.layers[layer_num].context.fillStyle = config.fillStyle;
	}

	if(config.strokeStyle){
		this.layers[layer_num].context.strokeStyle = config.strokeStyle;
	}

	this.layers[layer_num].context.beginPath();
	
	this.layers[layer_num].context.arc(x, y, radius, 0, 2*Math.PI, false);
	
	if(config.stroke){
		this.layers[layer_num].context.stroke()
		if(config.fill){
			this.layers[layer_num].context.fill();
		}
	}else{
		this.layers[layer_num].context.fill();
	}
	this.layers[layer_num].context.closePath();
}

Nuance.prototype.drawShape = function(layer_num, config){
	var x = config.x || 0;
	var y = config.y || 0;

	// in the stack	
	if(config.fillStyle){
		this.layers[layer_num].context.fillStyle = config.fillStyle;
	}

	if(config.strokeStyle){
		this.layers[layer_num].context.strokeStyle = config.strokeStyle;
	}
	
	if(config.lineWidth){
		this.layers[layer_num].context.lineWidth = config.lineWidth;
	}
	
	if(config.lineCap){
		this.layers[layer_num].context.lineCap = config.lineCap;
	}
	
	if(config.lineJoin){
		this.layers[layer_num].context.lineJoin = config.lineJoin;
	}
	
	if(config.miterLimit){
		this.layers[layer_num].context.miterLimit = config.miterLimit;
	}

	this.layers[layer_num].context.beginPath();
		this.layers[layer_num].context.moveTo(x,y);

		for(var s in config.segments){
			var segment = config.segments[s];
			switch(segment.type){
				case Nuance.LINE:
					this.layers[layer_num].context.lineTo(segment.x,segment.y);
					break;
				case Nuance.ARC:
					this.layers[layer_num].context.arc(segment.x, segment.y, segment.radius, segment.startAngle, segment.endAngle, segment.anticlockwise);
					break;
				case Nuance.QUAD:
					this.layers[layer_num].context.quadraticCurveTo(segment.cp1x, segment.cp1y, segment.x, segment.y);
					break;
				case Nuance.BEZIER:
					this.layers[layer_num].context.bezierCurveTo(segment.cp1x, segment.cp1y, segment.cp2x, segment.cp2y, segment.x, segment.y);
					break;
				default:
				
					break;
			}
		}
	
	if(config.stroke){
		this.layers[layer_num].context.stroke()
		if(config.fill){
			this.layers[layer_num].context.fill();
		}
	}else{
		this.layers[layer_num].context.fill();
	}
	this.layers[layer_num].context.closePath();
	
}

Nuance.prototype.addTween = function(layer_num, firstFrame, lastFrame, f_callback, args){
	// in the stack
	var frames = f_callback.call(this, firstFrame, lastFrame, args);
	for(var f in frames){
		var keys;
		if( ! this.layers[layer_num].frames[f]){
			this.layers[layer_num].frames[f] = { shapes: {}}
		}
		if(this.layers[layer_num].frames[f].shapes){
			for(var s in frames[f].shapes){
				var k;
				if( ! this.layers[layer_num].frames[f].shapes.hasOwnProperty(s)){
					k = s;
				}else{
					do{
						k = '';
						var ascii = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

						for( var j=0; j < 5; j++ ){
							var r = Math.random();
							k = k + ascii.charAt(Math.floor(r * ascii.length));
						}
					}while(this.layers[layer_num].frames[f].shapes.hasOwnProperty(k));
				}
				
				this.layers[layer_num].frames[f].shapes[k] = frames[f].shapes[s];
			}
		}
	}
}
