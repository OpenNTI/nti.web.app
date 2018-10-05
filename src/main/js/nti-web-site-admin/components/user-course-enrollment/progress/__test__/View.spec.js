import React from 'react';
import renderer from 'react-test-renderer';

import View from '../View';

/* eslint-env jest */
describe('Site admin user course enrollment progress view', () => {
	test('Basic render test', async () => {
		const course = {
			hasLink: () => true
		};

		const enrollment = {};

		// this component will show an "unable to load" message in the snapshot, which is ok.  The underlying Progress
		// widget (in nti-web-course) should be tested on its own
		const cmp = renderer.create(<View course={course} enrollment={enrollment}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Basic render test (no course)', async () => {
		const enrollment = {};

		const cmp = renderer.create(<View enrollment={enrollment}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Basic render test (no enrollment)', async () => {
		const course = {};

		const cmp = renderer.create(<View course={course}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
