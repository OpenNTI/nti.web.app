// require('legacy/model/courses/CourseInstance');
// require('legacy/app/library/courses/Current');

xdescribe('Current Courses Widget', () => {
	let CurrentCourseCmp;
	let containerEl;

	beforeEach(() => {
		containerEl = document.createElement('div');
		containerEl.classList.add('test-container');

		document.body.appendChild(containerEl);

		CurrentCourseCmp = NextThought.app.library.courses.Current.create({
			renderTo: containerEl
		});

	});


	afterEach(() => {
		if (CurrentCourseCmp && !CurrentCourseCmp.isDestroyed) {
			CurrentCourseCmp.destroy();
		}

		document.body.removeChild(containerEl);
	});

	function createCourse (name, startDate) {

	}

	describe('Four Current Courses', () => {
		it('Only ', () => {

		});
	});
});
