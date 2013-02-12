describe("Check Content Utility Functions", function() {

	it('Makes ContentUtils available', function(){
		expect(ContentUtils).toBeTruthy();
	});

	describe("isExternalUri", function(){
		it("can determine internal and external urls", function(){
			expect(ContentUtils.isExternalUri("http://google.com/coolthing.jpeg")).toBeTruthy();
			expect(ContentUtils.isExternalUri("/mathcounts/image/image1.png")).toBeFalsy();
		});
	});

	describe("fixReferences", function(){

		function sourceWithImage(url){
			return '<body><img src="'+url+'"></img></body>';
		}

		it("applies the base to internal links", function(){
			var orig = sourceWithImage('images/foo/bar.png'),
			fixed = ContentUtils.fixReferences(orig, '/base/');

			expect(fixed).toEqual(sourceWithImage('/base/images/foo/bar.png'));

		});

		it('but doesn\'t touch external links', function(){
			var orig = sourceWithImage('http://google.com/images/foo/bar.png'),
				fixed = ContentUtils.fixReferences(orig, '/base/');

			expect(fixed).toEqual(orig);
		});

		function sourceWithImages(urls){
			var r = '<body>';

			Ext.each(urls, function(url){
				r += '<img src="'+url+'"></img>'
			});

			r += '</body>';
			return r;
		}

		it('and can handle multiple sources', function(){
			var orig = sourceWithImages(['images/img1.png', 'http://google.com/cats.png', 'images/img2.png']),
				fixed = ContentUtils.fixReferences(orig, '/base/');

			expect(fixed).toEqual(sourceWithImages(['/base/images/img1.png', 'http://google.com/cats.png', '/base/images/img2.png']));
		});
	});
});
