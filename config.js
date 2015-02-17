/*
 * Nuance config
 */

/*
	@TODO:
	transform the LAB anim' into a Nuance anim'
*/

window.onload = function(){
	var lastFrame = 150;
	var limitFramesAnim = { framb: [0,9], greenLab: [8,40], redLab: [40,lastFrame]};
	var images = new Array();
	images[0] = new Image();

	var anim = new Nuance({ 
		start: false , 
		loop: false, 
		lastFrame: lastFrame,
		layers: new Array(
			{
				id: 'nuance', 
				frames: [

				],
			}
		)
	});

	/********************************
	 * Tween's config for NuanceLab
	 *******************************/
	function nuanceLab(firstFrame, lastFrame, args){
		var frames = [];
		var nbFrames = lastFrame - firstFrame;
		if(nbFrames < 1){
			nbFrames = 1;
		}

		for(var i=0; i<args.pics.length; i++){
			frames[i] = { 
				shapes: {
					0: {
						type: Nuance.IMAGE,
						sx: args.pics[i].x,
						sy: args.pics[i].y,
						sw: args.pics[i].w,
						sh: args.pics[i].h,
						dx: args.pics[i].x,
						dy: args.pics[i].y,
						dw: args.pics[i].w,
						dh: args.pics[i].h,
						image: args.img,
					},
				},
			};	
		}

		return frames;
	}
	
	var pics = [
		{x: 0, y: 0, w: 252, h: 163},   // Nu
		{x: 252, y: 0, w: 75, h: 163}, // a
		{x: 327, y: 0, w: 85, h: 163}, // n
		{x: 412, y: 0, w: 53, h: 163}, // c
		{x: 465, y: 0, w: 76, h: 163}, // e
	];
	anim.addTween(0, limitFramesAnim.framb[0], limitFramesAnim.framb[1], nuanceLab, {img: images[0], pics: pics}); 
	
	/**********************************
	 * Tween's config for LAB
	 **********************************/
	function square(firstFrame, lastFrame, args){
		
		var frames = [];
		var nbFrames = lastFrame - firstFrame;
		if(nbFrames < 1){
			nbFrames = 1;
		}
		var coefAlpha = 1 / nbFrames;
		for(var currentFrame=firstFrame; currentFrame<=lastFrame; currentFrame++){
			if(currentFrame == lastFrame){
				coefAlpha = 1;
			}
			if(args.type === Nuance.RECT){
				frames[currentFrame] = {
					shapes: {
						0: {
							type: Nuance.RECT,
							x: args.x,
							y: args.y,
							width: 35,
							height: 35,
							fillStyle: 'rgba(' + args.r + ',' + args.g + ',' + args.b + ',' + coefAlpha + ')',
						},
					},
				};
			}else{
				var segments = [];
				var x = args.x;
				var y = args.y;
				switch(args.type){
					case TOP_LEFT :
						segments[0] = { type: Nuance.ARC, x: x+35 , y: y+35, radius: 35, startAngle: Math.PI, endAngle: 1.5 * Math.PI, anticlockwise: false };
						segments[1] = { type: Nuance.LINE, x: x+35 , y: y+35};
						segments[2] = { type: Nuance.LINE, x: x, y: y+35};
						x = x + 35;
						break;
					case TOP_RIGHT :
						segments[0] = { type: Nuance.LINE, x: x, y: y };
						segments[1] = { type: Nuance.ARC, x: x, y: y+35, radius: 35, startAngle: 1.5 * Math.PI, endAngle: 2 * Math.PI, anticlockwise: false };
						segments[2] = { type: Nuance.LINE, x: x+35, y: y+35};		
						y = y+35;			
						break;
					case BOTTOM_LEFT :
						segments[0] = { type: Nuance.LINE, x: x + 35, y: y };
						segments[1] = { type: Nuance.LINE, x: x + 35, y: y + 35 };
						segments[2] = { type: Nuance.ARC, x: x + 35, y: y, radius: 35, startAngle: 0.5 * Math.PI, endAngle: Math.PI, anticlockwise: false };					
						break;
					case BOTTOM_RIGHT :
						segments[0] = { type: Nuance.ARC, x: x, y: y, radius: 35, startAngle: 0, endAngle: 0.5 * Math.PI, anticlockwise: false, };
						segments[1] = { type: Nuance.LINE, x: x, y: y};
						segments[2] = { type: Nuance.LINE, x: x + 35, y: y};
						y = y + 35;
						break;
					
				}
				frames[currentFrame] = {
					shapes: {
						0 : {
							fillStyle: 'rgba(' + args.r + ',' + args.g + ',' + args.b + ',' + coefAlpha + ')',
							/*closePath: true,*/
							
							x: x,
							y: y,
							segments: {}
						}
					},
				};
				for(var i=0; i<segments.length; i++){
					frames[currentFrame].shapes[0].segments[i] = {
						type: segments[i].type,
						x: segments[i].x,
						y: segments[i].y,
					};
					if(segments[i].type === Nuance.ARC){
						frames[currentFrame].shapes[0].segments[i].radius = segments[i].radius;
						frames[currentFrame].shapes[0].segments[i].startAngle = segments[i].startAngle;
						frames[currentFrame].shapes[0].segments[i].endAngle = segments[i].endAngle;
						frames[currentFrame].shapes[0].segments[i].anticlockwise = segments[i].anticlockwise;
					}
				}
			}
		}

		return frames;
	}
	var green = { r:5, g:138, b:140 };
	var red = { r:153, g:7, b:0 };
	var TOP_LEFT = 10;
	var TOP_RIGHT = 11;
	var BOTTOM_RIGHT = 12;
	var BOTTOM_LEFT = 13;
	
	var tweens = [];
	var j = 0;
	var base_y = 163;
	var base_x = 40;
	var square_width = 35;
	var square_height = 35;
	var square_space = 5;
	var x = base_x;
	var y = base_y;
	var limitTweensLetters = { 
		l: { begin: null, end: null},
		a: { begin: null, end: null},
		b: { begin: null, end: null},
		apos: { begin: null, end: null},
	};
	
	/* 'L' begginning */
	limitTweensLetters.l.begin = j;
	/* 'L' vertical bar */
	for(var i=0; i<5; i++){
		tweens[j++] = { x: x, y: (y + i * (35 + 5)), type: Nuance.RECT};
	}
	/* 'L' corner */
	tweens[j++] = { x: x, y: (y + 5 * (35 + 5)), type: Nuance.RECT};

	/* 'L' Horizontal bar */

	for(var i=1; i<4; i++){
		tweens[j++] = { x: (x + i * (35 + 5)), y: (y + 5 * (35 + 5)), type: Nuance.RECT};
	}
	
	/* 'L' end */
	limitTweensLetters.l.end = j - 1;

	/* 'a' begginning */
	limitTweensLetters.a.begin = j;

	/* 'a' 1st Hbar */
	x = base_x + 142 + 40; 
	y = base_y + 40;

	for(var i=0; i<3; i++){
		tweens[j++] = { x: (x + i * (35 + 5)), y: y, type: Nuance.RECT};
	}

	/* 'a' top right corner */
	tweens[j++] = { x: (x + 3 * (35 + 5)), y: y, type: TOP_RIGHT};

	/* 'a' right Vbar */
	for(var i=1; i<4; i++){
		tweens[j++] = { x: (x + 3 * (35 + 5)), y: (y + i * (35+5)), type: Nuance.RECT};
	}

	/* 'a' bottom right corner */
	tweens[j++] = { x: (x + 3 * (35 + 5)), y: (y + 4 * (35+5)), type: Nuance.RECT};
	
	/* 'a' bottom Hbar */
	for(var i=2; i>0; i--){
		tweens[j++] = { x: (x + i * (35 + 5)), y: (y + 4 * (35+5)), type: Nuance.RECT};
	}

	/* 'a' bottom left corner */
	tweens[j++] = { x: x, y: (y + 4 * (35+5)), type: BOTTOM_LEFT};
	
	/* 'a' left Vbar */
	for(var i=3; i>2; i--){
		tweens[j++] = { x: x, y: (y + i * (35+5)), type: Nuance.RECT};
	}

	/* 'a' middle left corner */
	tweens[j++] = { x: x, y: (y + 2 * (35+5)), type: TOP_LEFT};

	/* 'a' middle Hbar */
	for(var i=1; i<3; i++){
		tweens[j++] = { x: (x + i * (35+5)), y: (y + 2 * (35+5)), type: Nuance.RECT};
	}

	/* 'a' end */
	limitTweensLetters.a.end = j - 1;

	/* 'b' begginning */
	limitTweensLetters.b.begin = j;
	
	/* b left Vbar */
	x = base_x + 323 + 40;
	y = base_y;

	for(var i=0; i<5; i++){
		tweens[j++] = { x: x, y: (y + i * (35+5)), type: Nuance.RECT};
	}
	
	/* 'b' bottom left corner */
	tweens[j++] = { x: x, y: (y + 5 * (35+5)), type: BOTTOM_LEFT};
	
	/* 'b' bottom Hbar */
	for(var i=1; i<3; i++){
		tweens[j++] = { x: (x + i * (35 + 5)), y: (y + 5 * (35+5)), type: Nuance.RECT};
	}

	/* 'b' bottom right corner */
	tweens[j++] = { x: (x + 3 * (35 + 5)), y: (y + 5 * (35+5)), type: Nuance.RECT};

	/* 'b' right Vbar */
	for(var i=4; i>2; i--){ 
		tweens[j++] = { x: (x + 3 * (35 + 5)), y: (y + i * (35+5)), type: Nuance.RECT};
	}

	/* 'b' middle right corner */
	tweens[j++] = { x: (x + 3 * (35 + 5)), y: (y + 2 * (35+5)), type: TOP_RIGHT}; 

	/* 'b' middle Hbar */
	for(var i=2; i>0; i--){
		tweens[j++] = { x: (x + i * (35 + 5)), y: (y + 2 * (35+5)), type: Nuance.RECT}; 
	}

	/* 'b' end */
	limitTweensLetters.b.end = j - 1;

	/* 'apos' begginning */
	limitTweensLetters.apos.begin = j;

	/* apos */
	x = base_x + 505;
	tweens[j++] = { x: x, y: y, type: Nuance.RECT};
	tweens[j++] = { x: x, y: (y + 1 * (35+5)), type: BOTTOM_LEFT};
	
	/* 'apos' end */
	limitTweensLetters.apos.end = j - 1;
	
	/* load the shapes as tweens */
	var intervalGreen = limitFramesAnim.greenLab[1] - limitFramesAnim.greenLab[0];
	for(var tween in tweens){
		
		var rand = Math.floor(Math.random() * (intervalGreen - 10)) + limitFramesAnim.greenLab[0];
		var t = tweens[tween];
		anim.addTween(0, rand, (rand+10), square, {x: t.x, y: t.y, r: green.r, g: green.g, b: green.b, type: t.type }); 
	}
	
	/***************************************
	 * Red squares config
	 ***************************************/

	var l = { 
		begin: limitTweensLetters.l.begin, 
		range: (limitTweensLetters.l.end - limitTweensLetters.l.begin + 1), 
		precedent: null, 
		indiceTween: null, 
		locked: [1],
		comeback: false,
	};
	var a = { 
		begin: limitTweensLetters.a.begin, 
		range: (limitTweensLetters.a.end - limitTweensLetters.a.begin + 1), 
		precedent: null, 
		indiceTween: null, 
		locked: [9,14],
		comeback: false,
	};
	var b = { 
		begin: limitTweensLetters.b.begin, 
		range: (limitTweensLetters.b.end - limitTweensLetters.b.begin + 1), 
		precedent: null, 
		indiceTween: null, 
		locked: [1,8],
		comeback: false,
	};
	var apos = { 
		begin: limitTweensLetters.apos.begin, 
		range: (limitTweensLetters.apos.end - limitTweensLetters.apos.begin + 1), 
		precedent: null, 
		indiceTween: null, 
		locked: [],
		comeback: false,
	};
	
	var numMoves = 15;
	var speed = 3;
	
	
	function moveSquare(frame, obj){
		// red square
		anim.addTween(
			0,
			frame + limitFramesAnim.redLab[0], /* first frame for the tween */
			frame + limitFramesAnim.redLab[0], /* last frame */
			square, 
			{ 
				x: tweens[obj.indiceTween].x, /* position */
				y: tweens[obj.indiceTween].y, 
				r: red.r, 						/* color */
				g: red.g, 
				b: red.b, 
				type: tweens[obj.indiceTween].type 
			}
		);
		// if precedent == null there is nothing to draw
		// if indiceTween == precedent we don't want to redraw indiceTween now
		// if comeback == false we don't wan't to let it red now
		// if (precedent - begin) is part of the lockeds, then we want it red
		if(
			obj.precedent !== null 
			&& obj.precedent != obj.indiceTween  
			&& ( ! obj.comeback || obj.locked.indexOf((obj.precedent - obj.begin)) == -1) 
		){
			if(
				tweens[obj.precedent].type === TOP_LEFT 
				|| tweens[obj.precedent].type === TOP_RIGHT
				|| tweens[obj.precedent].type === BOTTOM_RIGHT
				|| tweens[obj.precedent].type === BOTTOM_LEFT
			){
				var w_x;
				var w_y;
				if(tweens[obj.precedent].type === TOP_LEFT ){
					w_x = tweens[obj.precedent].x - 1;
					w_y = tweens[obj.precedent].y - 1;
				}else if(tweens[obj.precedent].type === TOP_RIGHT ){
					w_x = tweens[obj.precedent].x + 1;
					w_y = tweens[obj.precedent].y - 1;					
				}else if(tweens[obj.precedent].type === BOTTOM_RIGHT ){
					w_x = tweens[obj.precedent].x + 1;
					w_y = tweens[obj.precedent].y + 1;					
				}else if(tweens[obj.precedent].type === BOTTOM_LEFT ){
					w_x = tweens[obj.precedent].x - 1;
					w_y = tweens[obj.precedent].y + 1;
				}
				anim.addTween( /* replace the precedent with a white square for the transparent bug on the arc border */
					0,
					frame + limitFramesAnim.redLab[0],
					frame + limitFramesAnim.redLab[0], 
					square, { 
						x: w_x, 
						y: w_y, 
						r: 255, 
						g: 255, 
						b: 255, 
						type: tweens[obj.precedent].type 
					}
				);
			}
			// green square
			anim.addTween( /* replace the precedent with a green square */
				0,
				frame + limitFramesAnim.redLab[0],
				frame + limitFramesAnim.redLab[0], 
				square, { 
					x: tweens[obj.precedent].x, 
					y: tweens[obj.precedent].y, 
					r: green.r, 
					g: green.g, 
					b: green.b, 
					type: tweens[obj.precedent].type 
				}
			);
		}
		
		obj.precedent = obj.indiceTween;
	}
	
	var frame;
	var firstLocked;
	
	/* L path */
	l.name = 'l';
	for(var i = numMoves - l.range; i<numMoves; i++){
		l.indiceTween = l.begin + i - ( numMoves - l.range );
		moveSquare(i*speed, l);
		frame = i;
	}
	/* comeback l path */
	++frame;
	for(var j=1; j < (l.range - l.locked[0] + 1) ; frame++,j++){
		l.indiceTween = l.begin + l.range - j;
		l.comeback = true;
		moveSquare(frame*speed, l);
	}

	/* a path */
	a.name = 'a';
	for(var i = numMoves - a.range; i<numMoves; i++){
		a.indiceTween = a.begin + i - ( numMoves - a.range );
		moveSquare(i*speed, a);
		frame = i;
	}
	/* comeback a path */
	++frame;
	for(var j=1; j < (a.range - a.locked[0] + 1) ; frame++,j++){
		a.indiceTween = a.begin + a.range - j;
		a.comeback = true;
		moveSquare(frame*speed, a);
	}
	
	/* b path */
	b.name = 'b';
	for(var i = numMoves - b.range; i<numMoves; i++){
		b.indiceTween = b.begin + i - ( numMoves - b.range );
		moveSquare(i*speed, b);
		frame = i;
	}
	/* comeback b path */
	++frame;
	for(var j=1; j < (b.range - b.locked[0] + 1) ; frame++,j++){
		b.indiceTween = b.begin + b.range - j;
		b.comeback = true;
		moveSquare(frame*speed, b);
	}
	
/*
	anim.play();
*/
	images[0].onload = function(){
        anim.play();
    }
    images[0].src = './nuanceLab.png';
}
