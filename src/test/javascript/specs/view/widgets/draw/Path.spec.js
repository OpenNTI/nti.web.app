describe("Path Shape Functionality",function(){
	var div = null;

	beforeEach(function(){
		div = document.createElement('div');
		expect(div).toBeTruthy();

		div.setAttribute('id','NTIContent');

		//div.setAttribute('style','display: none');
		document.body.appendChild(div);
	});

	afterEach(function(){
		document.body.removeChild(div);
	});

	it("create a path as if it came from the dataserver", function(){
		//NOTE: if it comes from the dataserver, it has points but no path
		var json = {"MimeType":"application/vnd.nextthought.canvaspathshape",
			"transform":{"a":1,"c":0,"b":0,"d":1,"tx":0.16612377850162868,"ty":0.04343105320304018,"Class":"CanvasAffineTransform"},
			"strokeOpacity":1,
			"NTIID":"tag:nextthought.com,2011-10:zope.security.management.system_user-OID-0x05fd:5573657273",
			"points":[0.1,0.1,0.5,0.5,0.9,0.1,0.9,0.9,0.1,0.9,0.1,0.1],
			/*
			"path":[
				['M', 0.1,0.1],
				['L',0.5,0.5],
				['L',0.9,0.1],
				['L',0.9,0.9],
				['L',0.1,0.9],
				['L',0.1,0.1]
			],
			 */
			"fillColor":"rgb(255.0,255.0,255.0)",
			"closed":false,
			"strokeColor":"rgb(0.0,0.0,0.0)",
			"Class":"CanvasPathShape",
			"strokeWidth":"0.001%",
			"fillOpacity":1,
			"strokeRGBAColor":"0.000 0.000 0.000",
		 	"fillRGBAColor":"0.000 0.000 0.000"
			},
			pathObj = ShapeFactory.restoreShape(div, json, 1),
			backToJson;

		//do some validation of the path created
		expect(pathObj.path.length).toBe(6);
		expect(pathObj.points.length).toBe(12);

		backToJson = pathObj.toJSON();
		expect(backToJson.points).toBeTruthy();
	});

	it("create a path as if it came from the whiteboard", function(){
		//NOTE: if it comes form the WB, it has a path but no points
		//1) create the object the same way that the wb does
		var pathObj = ShapeFactory.createShape(div, 'path', 100, 100, null, {stroke: '#000000', fill: '#000000'}, 1),
			canvasWidth = 1000,
			p,
			expectedScaledPoints = [0.0,0.0,0.4,0.4,0.8,0.0,0.8,0.8,0.0,0.8,0.0,0.0],
			expectedScaledTransform = {'Class': 'CanvasAffineTransform', 'a':1, 'b':0,'c':0,'d':1,'tx':0.1,'ty':0.1},
			expectedUnscaledPoints = [0, 0, 400, 400, 800, 0, 800, 800, 0, 800, 0, 0],
			expectedUnscaledTransform = {'Class': 'CanvasAffineTransform', 'a':1000, 'b':0,'c':0,'d':1000,'tx':100,'ty':100},
			jsonObj;
		pathObj.matrix = Ext.create('Ext.draw.Matrix',1,0,0,1,0,0);
		expect(pathObj).toBeTruthy();

		//2) add some points to the path, same as drawing it around in whiteboard
		p = [
			['M',100,100],
			['L',500,500],
			['L',900,100],
			['L',900,900],
			['L',100,900],
			['L',100,100]
		];
		pathObj.setAttributes({path: p}, true);
		expect(pathObj.attr.path.length === 6).toBeTruthy();

		//3) now turn the obj into JSON, which should give us a non-scaled points array
		jsonObj = pathObj.toJSON(canvasWidth);
		expect(jsonObj.points).toBeTruthy();
		expect(jsonObj.path).toBeFalsy();
		expect(jsonObj.points.length).toBe(12);
		expect(jsonObj.points).toEqual(expectedUnscaledPoints);
		expect(jsonObj.transform).toEqual(expectedUnscaledTransform);

		//4) scale it down to unit size and verify points and transform
		ShapeFactory.scaleJson(1/canvasWidth, jsonObj);
		expect(jsonObj.points).toBeTruthy();
		expect(jsonObj.path).toBeFalsy();
		expect(jsonObj.points).toEqual(expectedScaledPoints);
		expect(jsonObj.transform).toEqual(expectedScaledTransform);

		//5) now scale it back up, make sure everything jives
		ShapeFactory.scaleJson(canvasWidth, jsonObj);
		expect(jsonObj.points).toBeTruthy();
		expect(jsonObj.path).toBeFalsy();
		expect(jsonObj.points).toEqual(expectedScaledPoints); //once points are in unit shape, they shouldn't change
		expect(jsonObj.transform).toEqual(expectedUnscaledTransform);

		//6) scale it back down (a re-save), the points ought not to change
		ShapeFactory.scaleJson(1/canvasWidth, jsonObj);
		expect(jsonObj.points).toBeTruthy();
		expect(jsonObj.path).toBeFalsy();
		expect(jsonObj.points).toEqual(expectedScaledPoints); //once points are in unit shape, they shouldn't change
		expect(jsonObj.transform).toEqual(expectedScaledTransform);
	});


	it("create a path and scale and move it before saving", function(){
		//NOTE: if it comes form the WB, it has a path but no points
		//1) create the object the same way that the wb does
		var pathObj = ShapeFactory.createShape(div, 'path', 100, 100, null, {stroke: '#000000', fill: '#000000'}, 1),
			canvasWidth = 1000,
			p,
			expectedScaledPoints = [0.0,0.0,0.4,0.4,0.8,0.0,0.8,0.8,0.0,0.8,0.0,0.0],
			expectedScaledTransform = {'Class': 'CanvasAffineTransform', 'a':.5, 'b':0,'c':0,'d':.5,'tx':0.2,'ty':0.2},
			expectedUnscaledPoints = [0, 0, 400, 400, 800, 0, 800, 800, 0, 800, 0, 0],
			expectedUnscaledTransform = {'Class': 'CanvasAffineTransform', 'a':500, 'b':0,'c':0,'d':500,'tx':200,'ty':200},
			jsonObj,
			dragX=200,
			dragY=200;
		expect(pathObj).toBeTruthy();

		//2) add some points to the path, same as drawing it around in whiteboard
		p = [
			['M',100,100],
			['L',500,500],
			['L',900,100],
			['L',900,900],
			['L',100,900],
			['L',100,100]
		];
		pathObj.setAttributes({path: p}, true);
		expect(pathObj.attr.path.length === 6).toBeTruthy();

		//3) scale it down by 500px in each direction, move it to the right and down by 100px
		pathObj.matrix = Ext.create('Ext.draw.Matrix',-500,0,0,-500,100,100);

		//4) validate changed matrix pre scale:
		jsonObj = pathObj.toJSON(canvasWidth);
		expect(jsonObj.points).toBeTruthy();
		expect(jsonObj.path).toBeFalsy();
		expect(jsonObj.points.length).toBe(12);
		expect(jsonObj.points).toEqual(expectedUnscaledPoints);
		expect(jsonObj.transform).toEqual(expectedUnscaledTransform);

		//4) scale it down to unit size and verify points and transform
		ShapeFactory.scaleJson(1/canvasWidth, jsonObj);
		expect(jsonObj.points).toBeTruthy();
		expect(jsonObj.path).toBeFalsy();
		expect(jsonObj.points).toEqual(expectedScaledPoints);
		expect(jsonObj.transform).toEqual(expectedScaledTransform);

		//5) now scale it back up, make sure everything jives
		ShapeFactory.scaleJson(canvasWidth, jsonObj);
		expect(jsonObj.points).toBeTruthy();
		expect(jsonObj.path).toBeFalsy();
		expect(jsonObj.points).toEqual(expectedScaledPoints); //once points are in unit shape, they shouldn't change
		expect(jsonObj.transform).toEqual(expectedUnscaledTransform);
	});


	it("checking that path is closed when it should be", function(){
		//NOTE: if it comes form the WB, it has a path but no points
		//1) create the object the same way that the wb does
		var pathObj = ShapeFactory.createShape(div, 'path', 100, 100, null, {stroke: '#000000', fill: '#000000'}, 1),
			p,
			json;

		//2) add some points to the path, same as drawing it around in whiteboard
		p = [
			['M',100,100],
			['L',500,500],
			['L',900,100],
			['L',900,900],
			['L',100,900],
			['L',105,105]
		];
		pathObj.setAttributes({path: p}, true);
		json = pathObj.toJSON();
		expect(json.closed).toBeTruthy();
	});


	it("checking that path is closed when it should be 2", function(){
		//NOTE: if it comes form the WB, it has a path but no points
		//1) create the object the same way that the wb does
		var pathObj = ShapeFactory.createShape(div, 'path', 100, 100, null, {stroke: '#000000', fill: '#000000'}, 1),
			p,
			json;

		//2) add some points to the path, same as drawing it around in whiteboard
		p = [
			['M',100,100],
			['L',500,500],
			['L',900,100],
			['L',900,900],
			['L',100,900],
			['L',105,105],
			['Z']
		];
		pathObj.setAttributes({path: p}, true);
		json = pathObj.toJSON();
		expect(json.closed).toBeTruthy();
	});


	it("checking that path is NOT closed when it should'NT be", function(){
		//NOTE: if it comes form the WB, it has a path but no points
		//1) create the object the same way that the wb does
		var pathObj = ShapeFactory.createShape(div, 'path', 100, 100, null, {stroke: '#000000', fill: '#000000'}, 1),
			p,
			json;

		//2) add some points to the path, same as drawing it around in whiteboard
		p = [
			['M',100,100],
			['L',500,500],
			['L',900,100],
			['L',900,900],
			['L',100,900]
		];
		pathObj.setAttributes({path: p}, true);
		json = pathObj.toJSON();
		expect(json.closed).not.toBeTruthy();
	});

	it("create a path as if it came from the dataserver with closed set", function(){
		//NOTE: if it comes from the dataserver, it has points but no path
		var json = {"MimeType":"application/vnd.nextthought.canvaspathshape",
			"transform":{"a":1,"c":0,"b":0,"d":1,"tx":0.16612377850162868,"ty":0.04343105320304018,"Class":"CanvasAffineTransform"},
			"strokeOpacity":1,
			"NTIID":"tag:nextthought.com,2011-10:zope.security.management.system_user-OID-0x05fd:5573657273",
			"points":[0.1,0.1,0.5,0.5,0.9,0.1,0.9,0.9,0.1,0.9],
			"closed": true,
			"fillColor":"rgb(255.0,255.0,255.0)",
			"strokeColor":"rgb(0.0,0.0,0.0)",
			"Class":"CanvasPathShape",
			"strokeWidth":"0.001%",
			"fillOpacity":1,
			"strokeRGBAColor":"0.000 0.000 0.000",
			"fillRGBAColor":"0.000 0.000 0.000"
		},
			pathObj = ShapeFactory.restoreShape(div, json, 1),
			backToJson;


		//verify the last part of the SVG is a closepath: Z
		expect(pathObj.attr.path.last()[0]).toBe('Z');
	});
});
