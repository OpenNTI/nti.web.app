describe("Check Content Utility Functions", function () {

	it('Makes ContentUtils available', function () {
		expect(ContentUtils).toBeTruthy();
	});

	describe("isExternalUri", function () {
		it("can determine internal and external urls", function () {
			expect(ContentUtils.isExternalUri("http://google.com/coolthing.jpeg")).toBeTruthy();
			expect(ContentUtils.isExternalUri("/mathcounts/image/image1.png")).toBeFalsy();
		});
	});

	describe("fixReferences", function () {

		function sourceWithImage(url) {
			return '<body><img src="' + url + '"></img></body>';
		}

		function sourceWithImages(urls) {
			var r = '<body>';

			Ext.each(urls, function (url) {
				r += '<img src="' + url + '"></img>'
			});

			r += '</body>';
			return r;
		}

		it("applies the base to internal links", function () {
			var orig = sourceWithImage('images/foo/bar.png'),
				fixed = ContentUtils.fixReferences(orig, '/base/');

			expect(fixed).toEqual(sourceWithImage('/base/images/foo/bar.png'));

		});

		it('but doesn\'t touch external links', function () {
			var orig = sourceWithImage('http://google.com/images/foo/bar.png'),
				fixed = ContentUtils.fixReferences(orig, '/base/');

			expect(fixed).toEqual(orig);
		});

		it('and can handle multiple sources', function () {
			var orig = sourceWithImages(['images/img1.png', 'http://google.com/cats.png', 'images/img2.png']),
				fixed = ContentUtils.fixReferences(orig, '/base/');

			expect(fixed).toEqual(sourceWithImages(['/base/images/img1.png', 'http://google.com/cats.png', '/base/images/img2.png']));
		});

		it('Uses a envSalt if present when hashing', function () {
			var orig = sourceWithImages(['images/img1.png']),
				notSalted, salted;
			spyOn(ContentUtils, 'bustCorsForResources').andCallThrough();

			ContentUtils.fixReferences(orig, '/base');

			expect(ContentUtils.bustCorsForResources).toHaveBeenCalledWith(orig, 'h', jasmine.any(Number));
			notSalted = ContentUtils.bustCorsForResources.argsForCall.first()[2];

			$AppConfig.corsSalt = 'alpha';

			ContentUtils.fixReferences(orig, '/base');
			salted = ContentUtils.bustCorsForResources.argsForCall[1][2];
			expect(ContentUtils.bustCorsForResources.callCount).toBe(2);

			expect(salted).not.toEqual(notSalted);

			delete $AppConfig.corsSalt;
		});
	});

	describe('bustCorsForResources', function () {

		function snippetWithLink(href) {
			var html = '';

			html += '<body>'
			html = html + '<img src="' + href + '" data-nti-image-full="' + href + '">';
			html = html + '<param name="foo" value="' + href + '"></param>';
			html += '</body>'
			return html;
		};

		it('Doesnt screw with absolute urls', function () {
			var orig = snippetWithLink('http://google.com/resources/foo.png');

			expect(ContentUtils.bustCorsForResources(orig, 'foo', 'bar')).toBe(orig);
		});

		it('Doesnt screw with protocol-less absolute urls (//)', function () {
			var orig = snippetWithLink('//resources/foo.png');

			expect(ContentUtils.bustCorsForResources(orig, 'foo', 'bar')).toBe(orig);
		});

		it('Handles paths relative to resources', function () {
			var orig = snippetWithLink('resources/cool.png'),
				expected = snippetWithLink('resources/cool.png?foo=bar');

			expect(ContentUtils.bustCorsForResources(orig, 'foo', 'bar')).toBe(expected);
		});

		it('Handles absolute paths at content root', function () {
			var orig = snippetWithLink('/mathcounts/resources/cool.png'),
				expected = snippetWithLink('/mathcounts/resources/cool.png?foo=bar');

			expect(ContentUtils.bustCorsForResources(orig, 'foo', 'bar')).toBe(expected);
		});

		it('Doesnt screw with things that have query params', function () {
			var orig = snippetWithLink('resources/cool.png?level=10');

			expect(ContentUtils.bustCorsForResources(orig, 'foo', 'bar')).toBe(orig);
		});

	});
});
