describe("Whiteboard Functionality",function(){

	it("should work!", function(){
		expect(false).toBeTruthy();
	});

    it('json should be scaled down, then back up and match', function(){
        var json = JSON.parse('{"Class":"CanvasPolygonShape","transform":{"Class":"CanvasAffineTransform","a":147,"b":-3,"c":3,"d":147,"tx":80,"ty":101},"strokeColor":"rgb(0,0,0)","strokeOpacity":1,"fillColor":"rgb(255,255,0)","fillOpacity":1,"strokeWidth":"1pt","sides":4}'),
            scaleFactor = 829,
            jsonScaledDown = ShapeFactory.scaleJson(1/scaleFactor, Ext.clone(json)),
            jsonScaledBackUp = ShapeFactory.scaleJson(scaleFactor, Ext.clone(jsonScaledDown));

        console.log('orig', JSON.stringify(json));
        console.log('down', JSON.stringify(jsonScaledDown));
        console.log('up', JSON.stringify(jsonScaledBackUp));



    });

});
