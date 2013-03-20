describe("Service Tests", function() {

	describe("urlWithQueryParams", function(){
		var service = new NextThought.model.Service(),
			params = {pizza: 'cheese'},
			base = 'http://google.com';

		it('handles no object', function(){
			expect(service.urlWithQueryParams(base)).toBe(base);
		});

		it('handles base with no params', function(){
			expect(service.urlWithQueryParams(base, params)).toBe(base+'?pizza=cheese');
		});

		it('handles base with params', function(){
			var theBase = base+'?fruit=apple';
			expect(service.urlWithQueryParams(theBase, params)).toBe(theBase+'&pizza=cheese');
		});
	});
});
