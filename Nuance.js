/*
 * Nuance Class
 * @author: Olivier Roquigny
 * @licence: GPL 2
 * 
 * @TODO: layers management => use html id as JS keys
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
 */
function Nuance(config){
	var config = config || {};
	this.id = config.id || 'nuance';
	this.contextType = config.contextType || '2d';
	this.interval = config.interval || 80;
	this.currentFrame = 0;
	this.lastFrame = config.lastFrame || 50;
	this.loop = config.loop || false;
	this.frames = config.frames || {};
	this.context = null;

	this.setContext()
	
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
	if(this.frames[this.currentFrame]){
		var frame = this.frames[this.currentFrame];
		if(this.context){
			if(frame.shapes){
				for(var s in frame.shapes){
					var shape = frame.shapes[s]
					if(shape.type){
						/* it's a complete shape as rect, circle, image ... */
						switch(shape.type){
							case Nuance.RECT:
								this.drawRect(shape);
								break;
							case Nuance.CIRCLE:
								this.drawCircle(shape);
								break;
							case Nuance.IMAGE:
								this.drawImage(shape);
								break;
							default:
							
								break;
						}
					}else if(shape.segments){
						/* it's a composed shape, with multiples segments as line, arc, besier, quadratic ... */
						this.drawShape(shape);
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

Nuance.prototype.setContext = function(){
	var cvs = document.getElementById(this.id);
	if(cvs.getContext){
		this.context = cvs.getContext(this.contextType);
	}else{
		this.context = null;
	}
}

Nuance.prototype.drawImage = function(config){
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
	
	this.context.save();
	this.context.globalAlpha = alpha;
	this.context.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
	this.context.restore();
}

Nuance.prototype.drawRect = function(config){
	var x = config.x || 0;
	var y = config.y || 0;
	var width = config.width;
	var height = config.height;
	
	if(config.fillStyle){
		this.context.fillStyle = config.fillStyle;
	}
	if(config.strokeStyle){
		this.context.strokeStyle = config.strokeStyle;
	}
	
	if(config.stroke){
		this.context.strokeRect(x, y, width, height);
		if(config.fill){
			this.context.fillRect(x, y, width, height);
		}
	}else if(config.clear){
		this.context.clearRect(x, y, width, height);
	}else{
		this.context.fillRect(x, y, width, height);
	}
}

Nuance.prototype.drawCircle = function(config){
	var x = config.x || this.context.width/2;
	var y = config.y || this.context.height/2;
	var radius = config.radius;
	
	if(config.fillStyle){
		this.context.fillStyle = config.fillStyle;
	}

	if(config.strokeStyle){
		this.context.strokeStyle = config.strokeStyle;
	}

	this.context.beginPath();
	
	this.context.arc(x, y, radius, 0, 2*Math.PI, false);
	
	if(config.stroke){
		this.context.stroke()
		if(config.fill){
			this.context.fill();
		}
	}else{
		this.context.fill();
	}
	this.context.closePath();
}

Nuance.prototype.drawShape = function(config){
	var x = config.x || 0;
	var y = config.y || 0;
	
	if(config.fillStyle){
		this.context.fillStyle = config.fillStyle;
	}

	if(config.strokeStyle){
		this.context.strokeStyle = config.strokeStyle;
	}
	
	if(config.lineWidth){
		this.context.lineWidth = config.lineWidth;
	}
	
	if(config.lineCap){
		this.context.lineCap = config.lineCap;
	}
	
	if(config.lineJoin){
		this.context.lineJoin = config.lineJoin;
	}
	
	if(config.miterLimit){
		this.context.miterLimit = config.miterLimit;
	}

	this.context.beginPath();
		this.context.moveTo(x,y);

		for(var s in config.segments){
			var segment = config.segments[s];
			switch(segment.type){
				case Nuance.LINE:
					this.context.lineTo(segment.x,segment.y);
					break;
				case Nuance.ARC:
					this.context.arc(segment.x, segment.y, segment.radius, segment.startAngle, segment.endAngle, segment.anticlockwise);
					break;
				case Nuance.QUAD:
					this.context.quadraticCurveTo(segment.cp1x, segment.cp1y, segment.x, segment.y);
					break;
				case Nuance.BEZIER:
					this.context.bezierCurveTo(segment.cp1x, segment.cp1y, segment.cp2x, segment.cp2y, segment.x, segment.y);
					break;
				default:
				
					break;
			}
		}
	
	if(config.stroke){
		this.context.stroke()
		if(config.fill){
			this.context.fill();
		}
	}else{
		this.context.fill();
	}
	this.context.closePath();
	
}

Nuance.prototype.addTween = function(firstFrame, lastFrame, f_callback, args){
	var frames = f_callback.call(this, firstFrame, lastFrame, args);
	for(var f in frames){
		var keys;
		if( ! this.frames[f]){
			this.frames[f] = { shapes: {}}
		}
		if(this.frames[f].shapes){
			for(var s in frames[f].shapes){
				var k;
				if( ! this.frames[f].shapes.hasOwnProperty(s)){
					k = s;
				}else{
					do{
						k = '';
						var ascii = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

						for( var j=0; j < 5; j++ ){
							var r = Math.random();
							k = k + ascii.charAt(Math.floor(r * ascii.length));
						}
					}while(this.frames[f].shapes.hasOwnProperty(k));
				}
				
				this.frames[f].shapes[k] = frames[f].shapes[s];
			}
		}
	}
}
