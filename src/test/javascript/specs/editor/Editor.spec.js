describe('Sanitizing HTML', function(){
	var editor;
	beforeEach(function(){
		editor = new NextThought.editor.Editor();
	});
	it('escapes script tags', function(){
		var str = "<script>setTimeout(function() {alert('Hallo');}, 50);</script>";

		expect(/<script.*?>/g.test(str)).toBeTruthy();
		str = editor.sanitizeHTML(str);
		expect(/<script.*?>/g.test(str)).toBeFalsy();
	});
});
