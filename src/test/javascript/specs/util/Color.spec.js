describe("Check Color Utility Functions", function() {

	it("does rgb string result in correct object?", function(){
		var fillColor = 'rgb(0,0,0)',
			result;

		result = Color.parse(fillColor);
		expect(result).toBeTruthy();
		expect(result.r).toBe(0);
		expect(result.g).toBe(0);
		expect(result.b).toBe(0);
		expect(result.toString()).toEqual('rgba(0,0,0,1)');
	});


	it("does rgb string and opacity result in correct object?", function(){
		var fillColor = 'rgb(0,0,0)',
			fillOpacity = 1,
			result;

		result = Color.parse(fillColor, fillOpacity);
		expect(result).toBeTruthy();
		expect(result.r).toBe(0);
		expect(result.g).toBe(0);
		expect(result.b).toBe(0);

		expect(result.toString()).toEqual('rgba(0,0,0,1)');
	});

	it("does rgb string and opacity result in correct object 2?", function(){
		var fillColor = 'rgba(0,0,0,1)',
			result;

		result = Color.parse(fillColor);
		expect(result).toBeTruthy();
		expect(result.r).toBe(0);
		expect(result.g).toBe(0);
		expect(result.b).toBe(0);

		expect(result.toString()).toEqual('rgba(0,0,0,1)');
	});
});
