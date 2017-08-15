/*
 * Nuance Class
 * @author: Olivier Roquigny
 * @licence: GPL 2
 * 

 * @TODO: callback functions management:
	- in the shape/image/text drawing ? before, after ...

 * @TODO: layers management 

	- manipulate the layer and parent on the fly (resize, move, hide, show ...)
		* isn't it better to manage it directly ?
	- what about z-index ?
		* isn't it better to manage it directly ? in CSS ?

 * @TODO: sort shapes and segments and put them consecutive
 * @TODO: requestAnimationFrame
 * @TODO: gradient management
		* isn't it better to manage it directly ?
 * @TODO: memorize region
 * @TODO: easy region copying
 * @TODO: easy region deleting (clip)
 * @TODO: easy region rotation/translation/scaling (clip, move and draw)
 * @TODO: shape detection (loop only on shapes who need actions)
 * @TODO: easy shape creation
 * @TODO: video support => manage <video></video> ?
 * @TODO: audio support => manage <audio></audio> ?
 * @TODO: webgl support => manage other frameworks ? (Three.js, pixi.js ...)
 * @TODO: SVG support => manage other frameworks ?  (Raphael.js, SVG.js)

 */

function Nuance(config){
	var config = config || {};
	this.interval = config.interval || 80;
	this.currentFrame = 0;
	this.lastFrame = config.lastFrame || 50;
	this.loop = config.loop || false;
	this.layers = new Array();
	this.idLayers = new Object();
	config.layers = config.layers || new Array();
	var l = config.layers.length;
	var config_l, id;
	for(var i=0; i<l; i++){
		config_l = config.layers[i];
		this.layers[i] = new Object();
		this.layers[i].id = config_l.id || 'layer_' + i; 
		this.idLayers[this.layers[i].id] = i; 
		id = this.layers[i].id;
		this.layers[i].contextType = config_l.contextType || '2d'; 
		this.layers[i].name = config_l.name || 'layer_' + i; 
		this.layers[i].container_id = config_l.container_id || ''; 
		this.layers[i].frames = config_l.frames || [];
		this.layers[i].context = null;

		if(config_l.create && config_l.container_id){
			var container = document.getElementById(this.layers[i].container_id); 
			var height;
			var width;

			if(config_l.height || config_l.height === 0){
				height = config_l.height;
			}else{
				height = container.clientHeight;
			}
			if(config_l.width || config_l.width === 0){
				width = config_l.width;
			}else{
				width = container.clientWidth;
			}

			this.addCanvas(this.layers[i].container_id, this.layers[i].id, height, width, config_l);			
		}

		this.setContext(id);
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
	var id;
	for(var i=0; i<this.layers.length; i++){
		layer = this.layers[i];
		id = this.layers[i].id;
		if(layer.frames[this.currentFrame]){
			var frame = layer.frames[this.currentFrame];
			if(layer.context){
				if(frame.shapes){
					var shapes = frame.shapes;
					var s_l = shapes.length;
					for(var s=0; s<s_l; s++){
						var shape = shapes[s]
						if(shape.type){
							/* it's a complete shape as rect, circle, image ... */
							switch(shape.type){
								case Nuance.RECT:
									this.drawRect(id, shape);
									break;
								case Nuance.CIRCLE:
									this.drawCircle(id, shape);
									break;
								case Nuance.IMAGE:
									this.drawImage(id, shape);
									break;
								case Nuance.TEXT:
									this.drawText(id, shape);
									break;
								case Nuance.CLEARRECT:
									this.clearRect(id, shape);
									break;
								case Nuance.CALLBACK:
									this.callbackExec(id, shape);
									break;
								default:

									break;
							}
						}else if(shape.segments){
							/* it's a composed shape, with multiples segments as line, arc, besier, quadratic ... */
							this.drawShape(id, shape);
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

Nuance.prototype.setContext = function setContext(layer_id){
	var layer_num = this.idLayers[layer_id];
	layer_num = layer_num || 0;
	var layer = this.layers[layer_num];
	var cvs = document.getElementById(layer.id);

	if(cvs.getContext){
		layer.context = cvs.getContext(layer.contextType);
	}else{
		layer.context = null;
	}
}

Nuance.prototype.setContainer = function setContainer(layer_id, container_id){
	var layer_num = this.idLayers[layer_id];
	var layer = this.layers[layer_num];
	if(container_id != undefined){
		layer.container_id = container_id;
	}

	layer.container = document.getElementById(layer.container_id);
}

Nuance.prototype.getLayer = function getLayer(id){
	return this.layers[this.idLayers[id]];
}

Nuance.prototype.addCanvas = function addCanvas(container_id, id, height, width, config){
	var container = document.getElementById(container_id);
	config = config || {};

	if( ! container){
		return false;
	}

	var canvas = document.createElement('canvas');

	canvas.setAttribute('id', id);
	canvas.setAttribute('height', height);
	canvas.setAttribute('width', width);
	if( config.cssClass ){
console.log('config: ' + JSON.stringify(config));
		canvas.setAttribute('class', config.cssClass);
	}
	container.appendChild(canvas);

	return canvas;
}

Nuance.prototype.drawImage = function drawImage(layer_id, config){
	var layer_num = this.idLayers[layer_id];
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

Nuance.prototype.drawRect = function drawRect(layer_id, config){
	var layer_num = this.idLayers[layer_id];
	var x = config.x || 0;
	var y = config.y || 0;
	var width = config.width;
	var height = config.height;
	var layerContext = this.layers[layer_num].context;
	
	if(config.save){
		layerContext.save();
	}

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

	if(config.save){
		layerContext.restore();
	}
}

Nuance.prototype.clearRect = function clearRect(layer_id, config){
	var layer_num = this.idLayers[layer_id];
	var x = config.x || 0;
	var y = config.y || 0;
	var width = config.width;
	var height = config.height;
	var layerContext = this.layers[layer_num].context;

	layerContext.clearRect(x, y, width, height);
}

Nuance.prototype.drawText = function drawText(layer_id, config){
	var layer_num = this.idLayers[layer_id];
	var x = config.x || 0;
	var y = config.y || 0;
	var maxWidth = config.maxWidth || undefined;
	var layerContext = this.layers[layer_num].context;
	var text = config.text || '';
	
	if(config.save){
		layerContext.save();
	}

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

	if(config.save){
		layerContext.restore();
	}
}

Nuance.prototype.drawCircle = function drawCircle(layer_id, config){
	var layer_num = this.idLayers[layer_id];
	var layerContext = this.layers[layer_num].context;
	var x = config.x || layerContext.width/2;
	var y = config.y || layerContext.height/2;
	var radius = config.radius;

	if(config.save){
		layerContext.save();
	}

	if(config.fillStyle){
		layerContext.fillStyle = config.fillStyle;
	}

	if(config.strokeStyle){
		layerContext.strokeStyle = config.strokeStyle;
	}

	layerContext.beginPath();
	
	layerContext.arc(x, y, radius, 0, 2*Math.PI, false);
	
	if(config.strokeStyle || config.stroke){
		layerContext.stroke()
		if(config.fillStyle || config.fill){
			layerContext.fill();
		}
	}else{
		layerContext.fill();
	}
	layerContext.closePath();

	if(config.save){
		layerContext.restore();
	}
}

Nuance.prototype.drawShape = function drawShape(layer_id, config){
	var layer_num = this.idLayers[layer_id];
	var x = config.x || 0;
	var y = config.y || 0;
	var layerContext = this.layers[layer_num].context;

	if(config.save){
		layerContext.save();
	}

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

	if(config.segments){
		var l = config.segments.length;
		for(var s=0; s<l; s++){
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

	if(config.save){
		layerContext.restore();
	}	
}

Nuance.prototype.callbackExec = function callbackExec(layer_id, config){
	var layer_num = this.idLayers[layer_id];
	config.args = config.args || [];
	config.args.push(layer_num);
	config.callback.apply(this, config.args);
}

Nuance.prototype.addTween = function addTween(layer_id, firstFrame, lastFrame, f_callback, args){
	var layer_num = this.idLayers[layer_id];
	var layer_frames = this.layers[layer_num].frames;
	var frames = f_callback.call(this, firstFrame, lastFrame, args);

	var f_l = frames.length;
	for(var f=firstFrame; f<f_l; f++){
		if(frames[f] instanceof Object){
			if( ! layer_frames[f] || ! layer_frames[f].shapes){
				layer_frames[f] = { shapes: [], idShapes: {}, }
			}

			var layer_frame = layer_frames[f];

			if( ! layer_frame.idShapes){
				layer_frame.idShapes = {};
			}

			var shapes = frames[f].shapes;
			var s_l = shapes.length;
			var s_layer_frame = layer_frame.shapes.length;
			for(var s=0; s<s_l; s++){
				var k;
				var shape = shapes[s];
				var id = shape.id || s.toString();

				if( ! layer_frame.idShapes.hasOwnProperty(id)){
					k = id;
				}else{
					do{
						k = '';
						var ascii = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

						for( var j=0; j < 5; j++ ){
							var r = Math.random();
							k = k + ascii.charAt(Math.floor(r * ascii.length));
						}
					}while(layer_frame.idShapes.hasOwnProperty(k));
				}
				layer_frame.idShapes[k] = s_layer_frame;
				layer_frame.shapes[s_layer_frame++] = shape;
			}
		}
	}
}
