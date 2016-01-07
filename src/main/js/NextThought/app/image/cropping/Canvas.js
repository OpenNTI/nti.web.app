Ext.define('NextThought.app.image.cropping.Canvas', {
	extend: 'Ext.Component',
	alias: 'widget.image-cropping-canvas',

	requires: [
		'NextThought.app.image.cropping.CroppedImage'
	],

	cls: 'image-cropping-canvas',

	OPERATIONS: {
		NOOP: 'outside-of-mask',
		RESIZE_NW: 'resize-nw',
		RESIZE_NE: 'resize-ne',
		RESIZE_SE: 'resize-se',
		RESIZE_SW: 'resize-sw',
		MOVE: 'move'
	},

	CORNER_SIZE: {
		length: 16,
		overhang: 6
	},

	IMAGE_PADDING: 6,

	autoEl: {tag: 'canvas', cls: 'image-cropping-canvas', height: 3, width: 5},

	renderSelectors: {
		canvasEl: 'canvas'
	},


	afterRender: function() {
		this.callParent(arguments);

		//TODO: generalize this to not have to have a locked aspect ratio
		this.aspectLocked = (this.crop && this.crop.aspectRatio) || 1;

		if (this.image) {
			this.setImage(this.image);
		}

		this.mon(this.el, {
			mousedown: this.onMouseDown.bind(this),
			mouseup: this.onMouseUp.bind(this),
			mousemove: this.onMouseMove.bind(this),
			mouseout: this.onMouseOut.bind(this)
		});
	},


	getValue: function() {
		var imageInfo = this.imageInfo,
			selection = this.selection,
			c = document.createElement('canvas'),
			ctx;

		c.width = selection.width;
		c.height = selection.height;
		ctx = c.getContext('2d');
		ctx.drawImage(imageInfo.image, -selection.x, -selection.y, imageInfo.width, imageInfo.height);

		return new Promise(function(fulfill, reject) {
			c.toBlob(fulfill, 'image/png');
		}).then(function(blob) {
			return new NextThought.app.image.cropping.CroppedImage({
				blob: blob
			});
		});
	},


	getContext: function(context) {
		return this.el && this.el.dom.getContext(context || '2d');
	},


	getCanvasSize: function() {
		return {
			width: this.getWidth(),
			height: this.getHeight()
		};
	},


	getSelection: function(x, y, width, height, imageInfo) {
		var minWidth = this.crop.minWidth || Infinity,
			minHeight = this.crop.minHeight || Infinity,
			aspectLocked = !!this.aspectLocked,
			aspectRatio = this.aspectLocked || (imageInfo.width / imageInfo.height);

		function getHeight(width) {
			return Math.ceil(width / aspectRatio);
		}

		function getWidth(height) {
			return Math.ceil(aspectRatio * height);
		}

		if (!width && !height) {
			width = imageInfo.width;
		}

		if (width && !height) {
			height = getHeight(width);
		} else if (height) {
			width = getWidth(height);
		}

		if (x + width > imageInfo.width) {
			width = imageInfo.width - x;
			height = getHeight(width);
		}

		if (y + height > imageInfo.height) {
			height = imageInfo.height - y;
			width = getWidth(height);
		}

		if (width < minWidth) {
			width = minWidth;
			height = getHeight(width);
		}

		if (height < minHeight) {
			height = minHeight;
			width = getWidth(height);
		}

		return {
			x: x,
			y: y,
			width: width,
			height: height,
			minSize: {
				width: minWidth || 32,
				height: minHeight || 32
			},
			aspectLocked: aspectLocked,
			aspectRatio: aspectRatio
		};
	},


	clear: function() {
		if (!this.rendered) { return; }

		this.el.dom.width = this.el.dom.width;
		delete this.imageInfo;
	},


	rotate: function() {
		if (!this.imageInfo) {
			return;
		}


		var img = this.imageInfo.image,
			c = document.createElement('canvas'),
			ctx = c.getContext('2d'),
			h = img.height,
			w = img.width;

		c.width = h;
		c.height = w;

		ctx.rotate(Math.PI / 2);
		ctx.drawImage(img, 0, -h);
		this.loadImage(c.toDataURL('image/png'));
	},


	loadImage: function(src) {
		var img = new Image();

		img.onerror = this.clear.bind(this);
		img.onload = this.setImage.bind(this, img);

		img.src = src;
	},


	setImage: function(img) {
		if (!this.rendered) {
			this.image = img;
			return;
		}

		var mySize = this.getCanvasSize(),
			imgSize = {height: img.height, width: img.width},
			padding = this.IMAGE_PADDING,
			scale = imgSize.width / mySize.width,
			x, y, selection;

		if (imgSize.width + padding > mySize.width) {
			imgSize.width = Math.round(imgSize.width / scale) - (padding * 2);
			imgSize.height = Math.round(imgSize.height / scale) - (padding * 2);
		}

		mySize.height = imgSize.height + (padding * 2);

		this.setHeight(mySize.height);

		x = Math.round((mySize.width - imgSize.width) / 2);
		y = Math.round((mySize.height - imgSize.height) / 2);

		this.imageInfo = {
			image: img,
			x: x,
			y: y,
			width: imgSize.width,
			height: imgSize.height,
			canvasWidth: mySize.width,
			canvasHeight: mySize.height
		};

		if (imgSize.height > imgSize.width) {
			selection = this.getSelection(0, 0, imgSize.width, null, this.imageInfo);
		} else {
			selection = this.getSelection(0, 0, null, imgSize.height, this.imageInfo);
		}

		this.selection = selection;

		this.draw(this.imageInfo, this.selection);
	},


	getMask: function(size, pixAdj, imageInfo, selection) {
		size = size || 0;
		pixAdj = pixAdj || 0;
		imageInfo = imageInfo || {};
		selection = selection || {selection: {size: {height: 0, width: 0}}};

		return [
			Math.ceil(imageInfo.x + selection.x - size) + pixAdj,
			Math.ceil(imageInfo.y + selection.y - size) + pixAdj,
			Math.ceil(selection.width + (size * 2)),
			Math.ceil(selection.height + (size * 2))
		];
	},


	draw: function(imageInfo, selection) {
		imageInfo = imageInfo || this.imageInfo;
		selection = selection || this.selection;

		var ctx = this.getContext(),
			cornerSize = this.CORNER_SIZE;

		function drawCorners(x, y, width, height) {
			ctx.save();
			ctx.fillStyle = '#000';
			ctx.strokeStyle = '#fff';
			ctx.lineCap = 'butt';
			ctx.lineWidth = 1;
			var cw = Math.ceil(width / 2),
				ch = Math.ceil(height / 2);

			function nib(index) {
				ctx.beginPath();

				var w, h;

				if (index % 2 === 0) {
					w = cw;
					h = ch;
				} else {
					w = ch;
					h = cw;
				}

				ctx.moveTo(-w, -h);

				ctx.lineTo(cornerSize.length - w, -h);
				ctx.lineTo(cornerSize.length - w, cornerSize.overhang - h);

				ctx.lineTo(cornerSize.overhang - w, cornerSize.overhang - h);

				ctx.lineTo(cornerSize.overhang - w, cornerSize.length - h);
				ctx.lineTo(-w, cornerSize.length - h);

				ctx.closePath();

				ctx.fill();
				ctx.stroke();
			}

			//NOTE: only works for rectangles
			//move the origin to the bottom right of the cropped area
			ctx.setTransform(1, 0, 0, 1, x + cw, y + ch);

			//draw the nib at the top left
			nib(0);

			//Rotate the context 90deg
			ctx.rotate(Math.PI / 2);

			//draw the nib at the top right
			nib(1);

			//Rotate the context 90deg
			ctx.rotate(Math.PI / 2);

			//draw the nib at the bottom right
			nib(2);

			//Rotate the context 90deg
			ctx.rotate(Math.PI / 2);

			//draw the nib at the bottom left
			nib(3);

			ctx.restore();
		}

		this.el.dom.width = imageInfo.canvasWidth;
		this.el.dom.height = imageInfo.canvasHeight;


		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.lineWidth = 1;

		//mask
		ctx.save();
		ctx.fillStyle = 'rgba(0,0,0,0.2)';
		ctx.fillRect(imageInfo.x, imageInfo.y, imageInfo.width, imageInfo.height);
		ctx.restore();

		//cut out masked area;
		ctx.save();
		ctx.fillStyle = '#000';
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillRect.apply(ctx, this.getMask(0, 0, imageInfo, selection));
		ctx.restore();

		//draw image under mask
		ctx.save();
		ctx.globalCompositeOperation = 'destination-over';
		ctx.drawImage(imageInfo.image, imageInfo.x, imageInfo.y, imageInfo.width, imageInfo.height);
		ctx.restore();

		//draw border
		ctx.strokeStyle = '#fff';
		ctx.strokeRect.apply(ctx, this.getMask(0, 0.5, imageInfo, selection));
		ctx.strokeStyle = '#000';
		ctx.strokeRect.apply(ctx, this.getMask(1, 0.5, imageInfo, selection));

		drawCorners.apply(this, this.getMask(6, 0, imageInfo, selection));
	},


	__getOperationAt: function(x, y) {
		if (!this.rendered || !this.imageInfo) { return this.OPERATIONS.NOOP; }

		if (!x || !y) { return this.OPERATIONS.NOOP; }

		var imageInfo = this.imageInfo,
			selection = this.selection,
			rect = this.el.dom.getBoundingClientRect(),
			origin = {x: rect.left, y: rect.top},
			mask = this.getMask(0, 0, imageInfo, selection),
			operation, cornerSize = this.CORNER_SIZE,
			nearTop, nearRight, nearBottom, nearLeft;

		//Get position relative to canvas
		x -= origin.x;
		y -= origin.y;

		//Get position relative to mask
		x -= mask[0];
		y -= mask[1];

		//Detect if we are near the edges
		nearLeft = x >= -cornerSize.overhang && x <= cornerSize.length;
		nearTop = y >= -cornerSize.overhang && y <= cornerSize.length;
		nearRight = x > (selection.width - cornerSize.length - cornerSize.overhang) && x < (selection.width + cornerSize.overhang);
		nearBottom = y > (selection.height - cornerSize.length - cornerSize.overhang) && y < (selection.height + cornerSize.overhang);

		if (nearLeft && nearTop) {
			operation = this.OPERATIONS.RESIZE_NW;
		} else if (nearTop && nearRight) {
			operation = this.OPERATIONS.RESIZE_NE;
		} else if (nearRight && nearBottom) {
			operation = this.OPERATIONS.RESIZE_SE;
		} else if (nearBottom && nearLeft) {
			operation = this.OPERATIONS.RESIZE_SW;
		} else if (x >= 0 && x <= selection.width && y >= 0 && y <= selection.height) {
			operation = this.OPERATIONS.MOVE;
		} else {
			operation = this.OPERATIONS.NOOP;
		}

		return operation;
	},


	__clamp: function(v, min, max) {
		return (v < min) ? min : ((v > max) ? max : v);
	},


	__getOppositeCorner: function(operation, selection) {
		var opposite;

		if (operation === this.OPERATIONS.RESIZE_NW) {
			opposite = {x: selection.x + selection.width, y: selection.y + selection.height};
		} else if (operation === this.OPERATIONS.RESIZE_NE) {
			opposite = {x: selection.x, y: selection.y + selection.height};
		} else if (operation === this.OPERATIONS.RESIZE_SE) {
			opposite = {x: selection.x, y: selection.y};
		} else if (operation === this.OPERATIONS.RESIZE_SW) {
			opposite = {x: selection.x + selection.width, y: selection.y};
		}

		return opposite;
	},


	__getNewSelectionForMove: function(dx, dy, selection, imageInfo) {
		if (dx === 0 && dy === 0) { return selection; }

		selection.x = this.__clamp(selection.x - dx, 0, (imageInfo.width - selection.width));
		selection.y = this.__clamp(selection.y - dy, 0, (imageInfo.height - selection.height));

		return selection;
	},


	__getSizeFromPointToAnchor: function(x, y, anchor, minSize, maxSize) {
		var dx, dy;

		function clampDimension(d, min, max) {
			var abs = Math.abs(d);

			if (abs < min) {
				abs = min;
			} else if (abs > max) {
				abs = max;
			}

			return abs;
		}

		//get the point relative to the anchor
		dx = x - anchor.x;
		dy = y - anchor.y;

		return {
			width: clampDimension(dx, minSize.width, maxSize.width),
			height: clampDimension(dy, minSize.height, maxSize.height)
		};
	},


	__fitWidthToRatio: function(size, ratio, minSize, maxSize) {
		var potential = Math.ceil(size.height * ratio);

		while (potential > maxSize.width) {
			size.height -= this.IMAGE_PADDING;

			potential = Math.ceil(size.height * ratio);
		}

		size.width = potential;

		return size;
	},


	__fitHeightToRatio: function(size, ratio, minSize, maxSize) {
		var potential = Math.ceil(size.width / ratio);

		while (potential > maxSize.height) {
			size.width -= this.IMAGE_PADDING;

			potential = Math.ceil(size.width / ratio);
		}

		size.height = potential;

		return size;
	},


	__fitToAspectRatio: function(size, ratio, minSize, maxSize) {
		if (Math.abs(size.width) < Math.abs(size.height)) {
			size = this.__fitHeightToRatio(size, ratio, minSize, maxSize);
		} else {
			size = this.__fitWidthToRatio(size, ratio, minSize, maxSize);
		}

		return size;
	},


	__getNewSelectionForResize: function(operation, x, y, selection, imageInfo, origin) {
		var anchor = this.__getOppositeCorner(operation, selection),
			lastSize = {width: selection.width, height: selection.height},
			aspectRatio = selection.aspectRatio,
			minSize = selection.minSize,
			maxSize = {width: imageInfo.width, height: imageInfo.height},
			ops = this.OPERATIONS,
			newSize = {}, diffSize = {};

		x = x - imageInfo.x;
		y = y - imageInfo.y;

		newSize = this.__getSizeFromPointToAnchor(x, y, anchor, minSize, maxSize);
		newSize = this.__fitToAspectRatio(newSize, aspectRatio, minSize, maxSize);

		if (newSize.width < 0 || newSize.height < 0) {
			console.error('invalid size', newSize);
			return selection;
		}


		diffSize.width = lastSize.width - newSize.width;
		diffSize.height = lastSize.height - newSize.height;

		selection.height = newSize.height;
		selection.width = newSize.width;

		if (operation === ops.RESIZE_NW || operation === ops.RESIZE_SW) {
			selection.x = this.__clamp(selection.x + diffSize.width, 0, anchor.x - selection.width);
		}

		if (operation === ops.RESIZE_NW || operation === ops.RESIZE_NE) {
			selection.y = this.__clamp(selection.y + diffSize.height, 0, anchor.y - selection.height);
		}

		return selection;
	},


	__doOperation: function(operation, x, y, imageInfo, selection) {
		if (!operation || operation === this.OPERATIONS.NOOP || !this.rendered || !this.el.dom) { return; }

		imageInfo = imageInfo || this.imageInfo;
		selection = selection || this.selection;

		var rect = this.el.dom.getBoundingClientRect(),
			origin = {x: rect.left, y: rect.top},
			dx, dy;

		if (this.lastPoint) {
			dx = this.lastPoint.x - x;
			dy = this.lastPoint.y - y;
		} else {
			dx = 0;
			dy = 0;
		}

		if (operation === this.OPERATIONS.MOVE) {
			selection = this.__getNewSelectionForMove(dx, dy, selection, imageInfo);
		} else {
			selection = this.__getNewSelectionForResize(operation, x - origin.x, y - origin.y, selection, imageInfo);
		}

		this.lastPoint = {x: x, y: y};

		this.draw(imageInfo, selection);
	},


	onMouseDown: function(e) {
		var xy = e.getXY(),
			operation = this.__getOperationAt(xy[0], xy[1]);

		this.currentOperation = operation;
		this.lastPoint = {x: xy[0], y: xy[1]};
	},


	onMouseUp: function() {
		delete this.currentOperation;
	},


	onMouseMove: function(e) {
		var xy = e.getXY(),
			operation = this.__getOperationAt(xy[0], xy[1]);

		if (this.currentOperation) {
			operation = this.currentOperation;
			this.__doOperation(operation, xy[0], xy[1], this.imageInfo, this.selection);
		}

		if (this.potentialOperation !== operation) {
			this.removeCls(this.potentialOperation);
			this.addCls(operation);
			this.potentialOperation = operation;
		}
	},


	onMouseOut: function() {
		delete this.currentOperation;
	}
});
