describe("ExtJS Path Verification", function() {

    it("has fixed path conversion", function() {
		//Ext.draw.Draw.path2curve()
		//Jira Issue Tag: EXTJSIV-4399
		//Forum post: http://www.sencha.com/forum/showthread.php?153418-bug-in-path-conversion-Ext.draw.Draw.path2curve()-(as-of-4.0.7)

		var pathStr = "M0,-1A1,1,0,1,1,0,1A1,1,0,1,1,0,-1z";
		var path = Ext.draw.Draw.parsePathString(pathStr);

		expect(path.length).toBe(4);

		var curve = Ext.draw.Draw.path2curve(path);

		expect(curve.length).toBe(6);

		expect(curve[0][0]).toBe('M');
		for(var i=1; i<curve.length; i++){
			expect(curve[i][0]).toBe('C');
			expect(curve[i].length).toBe(7);
		}

    });

});
