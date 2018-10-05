import React from 'react';
import renderer from 'react-test-renderer';

import Progress from '../Progress';

/* eslint-env jest */
describe('Site admin user course enrollment overview progress widget', () => {
	test('Basic render test (percent = 55)', async () => {
		const enrollment = {
			CourseProgress: {
				PercentageProgress: 0.55
			}
		};

		const cmp = renderer.create(<Progress enrollment={enrollment}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Basic render test (no PercentageProgress)', async () => {
		const enrollment = {
			CourseProgress: {}
		};

		const cmp = renderer.create(<Progress enrollment={enrollment}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Basic render test (no CourseProgress)', async () => {
		const enrollment = {};

		const cmp = renderer.create(<Progress enrollment={enrollment}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
