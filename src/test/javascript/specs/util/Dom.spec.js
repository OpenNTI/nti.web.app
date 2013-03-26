describe("Dom.js Tests",function(){
	var testBody, DomUtil;
	
	beforeEach(function(){
		DomUtil = NTITestUtils.newInstanceOfSingleton(NextThought.util.Dom);
		testBody = document.createElement('div');
		document.body.appendChild(testBody);
	});

	afterEach(function(){
		document.body.removeChild(testBody);
	});

	it("getVideosFromDom",function(){
		var result, videoObject = [{
			'url' : 'www.youtube.com',
			'thumbnail' : 'image.jpeg'
		}],
		videoContainer = document.createElement('object'),
		video = document.createElement('object'),
		firstParam = document.createElement('param'),
		secondParam = document.createElement('param');
		
		videoContainer.className = "videoContainer";
		video.className = 'naqvideo';
		firstParam.name = 'url';
		firstParam.value = 'www.youtube.com';
		secondParam.name = 'thumbnail';
		secondParam.value = 'image.jpeg';

		

		video.appendChild(firstParam);
		video.appendChild(secondParam);
		videoContainer.appendChild(video);
		testBody.appendChild(videoContainer); 

		result = DomUtil.getVideosFromDom(videoContainer);
		expect(result).toEqual(videoObject);
	});

	it("getImagesFromDom",function(){
		var result, imgObject =[{
				url : 'full.png'
			}],
			imgContainer = document.createElement('span');
			img = document.createElement('img');

			img.setAttribute('data-nti-image-full','full.png');
			img.setAttribute('data-nti-image-half','half.png');
			img.setAttribute('data-nti-image-quarter','quarter.png');
			img.setAttribute('data-nti-image-size','full');
			img.setAttribute('src','half.png');

			imgContainer.appendChild(img);
			testBody.appendChild(imgContainer);

			result = DomUtil.getImagesFromDom(imgContainer);
			expect(result).toEqual(imgObject);

	});

	it("adjustLinks",function(){
		var linkContainer = document.createElement('div'),
			link = document.createElement('a');

			link.setAttribute('href','www.google.com');

			linkContainer.appendChild(link);
			testBody.appendChild(linkContainer);

			DomUtil.adjustLinks(document.body,"www.facebook.com");
			expect(link.target).toBe("_blank");
	});
});
