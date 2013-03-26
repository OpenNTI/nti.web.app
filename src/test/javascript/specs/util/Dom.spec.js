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

	describe('getVideosFromDom',function(){
		var videoContainer
		beforeEach(function(){
			videoContainer = document.createElement('object');
			videoContainer.className = "videoContainer";
		});
		it("One video",function(){
			var result, videoObject = [{
				'url' : 'www.youtube.com',
				'thumbnail' : 'image.jpeg'
			}],
			video = document.createElement('object'),
			firstParam = document.createElement('param'),
			secondParam = document.createElement('param');
			
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

		it("Three Videos",function(){
			var i, result, videoObject, videos, params;

			videoObject = [
				{ url : 'www.youtube.com', thumbnail : 'image1.jpeg'},
				{ url : 'www.facebook.com', thumbnail : 'image2.jpeg'},
				{ url : 'www.google.com', thumbnail : 'image3.jpeg'}
			];

			videos = [
				document.createElement('object'),
				document.createElement('object'),
				document.createElement('object')
			];

			params = [
				{
					first : document.createElement('param'),
					second : document.createElement('param')
				},
				{
					first : document.createElement('param'),
					second : document.createElement('param')
				},
				{
					first : document.createElement('param'),
					second : document.createElement('param')
				}
			];

			for(i = 0; i < 3; i++){
				videos[i].className = 'naqvideo';

				params[i].first.name = 'url';
				params[i].first.value = videoObject[i].url;
				params[i].second.name = 'thumbnail';
				params[i].second.value = videoObject[i].thumbnail;

				videos[i].appendChild(params[i].first);
				videos[i].appendChild(params[i].second);

				videoContainer.appendChild(videos[i]);
			}

			testBody.appendChild(videoContainer);
			result = DomUtil.getVideosFromDom(videoContainer);
			expect(result).toEqual(videoObject);

		})

	});

	describe("getImagesFromDom",function(){
		var imgContainer;

		beforeEach(function(){
			imgContainer = document.createElement('span');
		});

		it("one img",function(){
			var result, imgObject =[{
					url : 'full.png'
				}],
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

		it("three imgs",function(){
			var i, result, imgObject, imgs;

			imgObject = [
				{ url : 'full0.png'},
				{ url : 'full1.png'},
				{ url : 'full2.png'}
			];

			imgs = [
				document.createElement('img'),
				document.createElement('img'),
				document.createElement('img')
			];

			for(i = 0; i < 3; i++){
				imgs[i].setAttribute('data-nti-image-full', 'full'+i+'.png');
				imgs[i].setAttribute('data-nti-image-half', 'half'+i+'.png');
				imgs[i].setAttribute('data-nti-image-quarter', 'quarter'+i+'.png');
				imgs[i].setAttribute('data-nti-image-size', 'half');
				imgs[i].setAttribute('src', 'half'+i+'.png');

				imgContainer.appendChild(imgs[i]);
			}

			testBody.appendChild(imgContainer);
			result = DomUtil.getImagesFromDom(imgContainer);
			expect(result).toEqual(imgObject);
		});

	});

	describe("adjustLinks",function(){
		var linkContainer;

		beforeEach(function(){
			linkContainer = document.createElement('div');
		});

		it("one link",function(){
			var link = document.createElement('a');

				link.setAttribute('href','www.google.com');

				linkContainer.appendChild(link);
				testBody.appendChild(linkContainer);

				DomUtil.adjustLinks(Ext.fly(document.body),"www.facebook.com");
				expect(link.target).toBe("_blank");
		});

		it("three links",function(){
			var links = [
				document.createElement('a'),
				document.createElement('a'),
				document.createElement('a')
			];

			links[0].setAttribute('href','www.google.com');
			links[1].setAttribute('href','www.facebook.com#profile');
			links[2].setAttribute('href','www.myspace.com');

			linkContainer.appendChild(links[0]);
			linkContainer.appendChild(links[1]);
			linkContainer.appendChild(links[2]);
			testBody.appendChild(linkContainer);

			DomUtil.adjustLinks(Ext.fly(document.body),"www.facebook.com");

			expect(links[0].target).toBe("_blank");
			expect(links[1].target).toBe("");
			expect(links[2].target).toBe("_blank");
		});
	});
});
