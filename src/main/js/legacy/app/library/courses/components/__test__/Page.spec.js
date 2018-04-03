/* eslint-env jest */
const Page = require('../Page');

describe('Course Page Tests', () => {
	describe('Sorting Tests', () => {
		function createCourseWithId (id) {
			return {
				getCourseCatalogEntry () {
					return {
						get (f) {
							if (f === 'ProviderUniqueID') {
								return id;
							}
						}
					};
				}
			};
		}

		test ('Store sorts correctly', () => {
			const courses = ['b', 'c', 'a'].map(createCourseWithId);
			const sorted = courses.sort(Page.prototype.sorterFn);
			const sortedIDs = sorted.map(x => x.getCourseCatalogEntry().get('ProviderUniqueID'));

			expect(sortedIDs[0]).toEqual('a');
			expect(sortedIDs[1]).toEqual('b');
			expect(sortedIDs[2]).toEqual('c');
		});
	});
});
