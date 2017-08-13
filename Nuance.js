/*
 * Nuance Class
 * @author: Olivier Roquigny
 * @licence: GPL 2
 * 

 * @TODO: callback functions management:
	- in the shape/image/text drawing ? before, after ...
	- independant from draw functions

 * @TODO: layers management 

	- manipulate the layer and parent on the fly (resize, move, hide, show ...)
		* isn't it better to manage it directly ?
	- use html id as JS keys => an array linking keys to number ?
	- what about z-index ?

 * @TODO: make frames, shapes, segments as Arrays => if (value instanceof Array) {
 * @TODO: sort shapes and segments and put them consecutive
 * @TODO: requestAnimationFrame
 * @TODO: gradient management
 * @TODO: memorize region
 * @TODO: easy region copying
 * @TODO: shape detection (loop only on shapes who need actions)
 * @TODO: easy shape creation
 * @TODO: video support => manage <video></video> ?
 * @TODO: audio support => manage <audio></audio> ?
 * @TODO: webgl support => manage other frameworks ? (Three.js, pixi.js ...)
 * @TODO: SVG support => manage other frameworks ?  (Raphael.js, SVG.js)

 * @TODO: text support
 * @TODO: easy region removing

 */

function Nuance(config){
	var config = config || {};
	this.interval = config.interval || 80;
	this.currentFrame = 0;
	this.lastFrame = config.lastFrame || 50;
	this.loop = config.loop || false;
	this.layers = new Array();
	config.layers = config.layers || new Array();
	for(var i=0; i<config.layers.length; i++){
		this.layers[i] = new Object();
		this.layers[i].id = config.layers[i].id || 'nuance_' + i; 
		this.layers[i].contextType = config.layers[i].contextType || '2d'; 
		this.layers[i].name = config.layers[i].name || 'nuance_' + i; 
		this.layers[i].container_id = config.layers[i].container_id || ''; 
		this.layers[i].frames = config.layers[i].frames || [];
		this.layers[i].context = null;

		if(config.layers[i].create && config.layers[i].container_id){
			var container = document.getElementById(this.layers[i].container_id); 
			var height;
			var width;

			if(config.layers[i].height || config.layers[i].height === 0){
				height = config.layers[i].height;
			}else{
				height = container.clientHeight;
			}
			if(config.layers[i].width || config.layers[i].width === 0){
				width = config.layers[i].width;
			}else{
				width = container.clientWidth;
			}

			this.addCanvas(this.layers[i].container_id, this.layers[i].id, height, width);			
		}

		this.setContext(i);
	}

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
Nuance.TEXT = 7;
Nuance.CLEARRECT = 8;
Nuance.CALLBACK = 9;

Nuance.prototype.play = function play(){

	if(this.timer){
		window.clearInterval(this.timer);
	}

	var passThis = this;
	this.timer = setInterval(
		function(){ passThis.execFrame(); }, 
		this.interval
	);
}

Nuance.prototype.stop = function stop(){
	window.clearInterval(this.timer);
}

Nuance.prototype.execFrame = function execFrame(){
	var layer;
	for(var i=0; i<this.layers.length; i++){
		layer = this.layers[i];
		if(layer.frames[this.currentFrame]){
			var frame = layer.frames[this.currentFrame];
			if(layer.context){
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
								case Nuance.TEXT:
									this.drawText(i, shape);
									break;
								case Nuance.CLEARRECT:
									this.clearRect(i, shape);
									break;
								case Nuance.CALLBACK:
									this.callbackExec(i, shape);
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
	if(this.currentFrame > this.lastFrame){
		if(this.loop){
			this.currentFrame = 0;
		}else{
			this.stop();
		}
	}
}

Nuance.prototype.setContext = function setContext(layer_num){
	if(layer_num == undefined){
		layer_num = 0;
	}
	var layer = this.layers[layer_num];
	var cvs = document.getElementById(layer.id);

	if(cvs.getContext){
		layer.context = cvs.getContext(layer.contextType);
	}else{
		layer.context = null;
	}
}

Nuance.prototype.setContainer = function setContainer(layer_num, container_id){
	layer_num = layer_num || 0;
	var layer = this.layers[layer_num];
	if(container_id != undefined){
		layer.container_id = container_id;
	}

	layer.container = document.getElementById(layer.container_id);
}

Nuance.prototype.addCanvas = function addCanvas(container_id, id, height, width){
	var container = document.getElementById(container_id);
	
	if( ! container){
		return false;
	}

	var canvas = document.createElement('canvas');

	canvas.setAttribute('id', id);
	canvas.setAttribute('height', height);
	canvas.setAttribute('width', width);
	container.appendChild(canvas);

	return canvas;
}

Nuance.prototype.drawImage = function drawImage(layer_num, config){
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
	var layerContext = this.layers[layer_num].context;
	layerContext.save();
	layerContext.globalAlpha = alpha;
	layerContext.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
	layerContext.restore();
}

Nuance.prototype.drawRect = function drawRect(layer_num, config){
	var x = config.x || 0;
	var y = config.y || 0;
	var width = config.width;
	var height = config.height;
	var layerContext = this.layers[layer_num].context;
	
	if(config.fillStyle){
		layerContext.fillStyle = config.fillStyle;
	}
	if(config.strokeStyle){
		layerContext.strokeStyle = config.strokeStyle;
	}
	
	if(config.clear){
		layerContext.clearRect(x, y, width, height);
	}

	if(config.stroke || config.strokeStyle){
		layerContext.strokeRect(x, y, width, height);
		if(config.fill || config.fillStyle){
			layerContext.fillRect(x, y, width, height);
		}
	}else{
		layerContext.fillRect(x, y, width, height);
	}
}

Nuance.prototype.clearRect = function clearRect(layer_num, config){
	var x = config.x || 0;
	var y = config.y || 0;
	var width = config.width;
	var height = config.height;
	var layerContext = this.layers[layer_num].context;

	layerContext.clearRect(x, y, width, height);
}

Nuance.prototype.drawText = function drawText(layer_num, config){
	var x = config.x || 0;
	var y = config.y || 0;
	var maxWidth = config.maxWidth || undefined;
	var layerContext = this.layers[layer_num].context;
	var text = config.text || '';
	
	if(config.font){
		layerContext.font = config.font;
	}
	layerContext.textAlign = config.textAlign || 'left';
	layerContext.textBaseline = config.textBaseline || 'middle';
	layerContext.direction = config.direction || 'ltr';
	if(config.fillStyle){
		layerContext.fillStyle = config.fillStyle;
	}
	if(config.strokeStyle){
		layerContext.strokeStyle = config.strokeStyle;
	}
	
	if(config.stroke || config.strokeStyle){
		layerContext.strokeText(text, x, y, maxWidth);
		if(config.fill || config.fillStyle){
			layerContext.fillText(text, x, y, maxWidth);
		}
	}else{
		layerContext.fillText(text, x, y, maxWidth);
	}
}

Nuance.prototype.drawCircle = function drawCircle(layer_num, config){
	var layerContext = this.layers[layer_num].context;
	var x = config.x || layerContext.width/2;
	var y = config.y || layerContext.height/2;
	var radius = config.radius;

	if(config.fillStyle){
		layerContext.fillStyle = config.fillStyle;
	}

	if(config.strokeStyle){
		layerContext.strokeStyle = config.strokeStyle;
	}

	layerContext.beginPath();
	
	layerContext.arc(x, y, radius, 0, 2*Math.PI, false);
	
	if(config.stroke){
		layerContext.stroke()
		if(config.fill){
			layerContext.fill();
		}
	}else{
		layerContext.fill();
	}
	layerContext.closePath();
}

Nuance.prototype.drawShape = function drawShape(layer_num, config){
	var x = config.x || 0;
	var y = config.y || 0;
	var layerContext = this.layers[layer_num].context;

	if(config.fillStyle){
		layerContext.fillStyle = config.fillStyle;
	}

	if(config.strokeStyle){
		layerContext.strokeStyle = config.strokeStyle;
	}
	
	if(config.lineWidth){
		layerContext.lineWidth = config.lineWidth;
	}
	
	if(config.lineCap){
		layerContext.lineCap = config.lineCap;
	}
	
	if(config.lineJoin){
		layerContext.lineJoin = config.lineJoin;
	}
	
	if(config.miterLimit){
		layerContext.miterLimit = config.miterLimit;
	}

	layerContext.beginPath();
	layerContext.moveTo(x,y);

	for(var s in config.segments){
		var segment = config.segments[s];
		switch(segment.type){
			case Nuance.LINE:
				layerContext.lineTo(segment.x,segment.y);
				break;
			case Nuance.ARC:
				layerContext.arc(segment.x, segment.y, segment.radius, segment.startAngle, segment.endAngle, segment.anticlockwise);
				break;
			case Nuance.QUAD:
				layerContext.quadraticCurveTo(segment.cp1x, segment.cp1y, segment.x, segment.y);
				break;
			case Nuance.BEZIER:
				layerContext.bezierCurveTo(segment.cp1x, segment.cp1y, segment.cp2x, segment.cp2y, segment.x, segment.y);
				break;
			default:

				break;
		}
	}
	
	if(config.stroke){
		layerContext.stroke()
		if(config.fill){
			layerContext.fill();
		}
	}else{
		layerContext.fill();
	}
	layerContext.closePath();
	
}

Nuance.prototype.callbackExec = function callbackExec(layer_num, config){
	config.args = config.args || [];
	config.args.push(layer_num);
	config.callback.apply(this, config.args);
}

Nuance.prototype.addTween = function addTween(layer_num, firstFrame, lastFrame, f_callback, args){
	var frames = f_callback.call(this, firstFrame, lastFrame, args);
	for(var f=0; f<frames.length; f++){

		if(frames[f] instanceof Object){
			var keys;
			var layer_frames = this.layers[layer_num].frames;

			if( ! layer_frames[f]){
				layer_frames[f] = { shapes: {}}
			}

			if(layer_frames[f].shapes){
				for(var s in frames[f].shapes){
					var k;
					if( ! layer_frames[f].shapes.hasOwnProperty(s)){
						k = s;
					}else{
						do{
							k = '';
							var ascii = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

							for( var j=0; j < 5; j++ ){
								var r = Math.random();
								k = k + ascii.charAt(Math.floor(r * ascii.length));
							}
						}while(layer_frames[f].shapes.hasOwnProperty(k));
					}

					layer_frames[f].shapes[k] = frames[f].shapes[s];
				}
			}
		}
	}
}
