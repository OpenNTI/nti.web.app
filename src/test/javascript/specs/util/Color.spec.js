describe("Check Color Utility Functions", function() {

	it("does rgb string result in correct object?", function(){
		var fillColor = 'rgb(0.0,0.0,0.0)',
			result;

		result = Color.parseColor(fillColor, null);
		expect(result).toBeTruthy();
		expect(result.r).toBe(0);
		expect(result.g).toBe(0);
		expect(result.b).toBe(0);
		expect(result.toString()).toEqual('#000000');
	});


	it("does rgb string and opacity result in correct object?", function(){
		var fillColor = 'rgb(0.0,0.0,0.0)',
			fillOpacity = 0.0,
			result;

		result = Color.parseColor(fillColor, fillOpacity);
		expect(result).toBeTruthy();
		expect(result.r).toBe(0);
		expect(result.g).toBe(0);
		expect(result.b).toBe(0);

		expect(result.toString()).toEqual('rgba(0,0,0,0)');
	});

	it("does rgb string and opacity result in correct object 2?", function(){
		var fillColor = 'rgba(0.0,0.0,0.0,0.0)',
			result;

		result = Color.parseColor(fillColor);
		expect(result).toBeTruthy();
		expect(result.r).toBe(0);
		expect(result.g).toBe(0);
		expect(result.b).toBe(0);

		expect(result.toString()).toEqual('rgba(0,0,0,0.0)');
	});
});
