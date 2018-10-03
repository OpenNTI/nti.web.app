import React from 'react';
import renderer from 'react-test-renderer';

import View from '../View';

const getCourse = (hasRosterLink) => {
	return {
		CatalogEntry: {
			Title: 'course1'
		},
		getPresentationProperties: () => {
			return {
				title: 'course1',
				label: 'Course 1'
			};
		},
		hasLink: () => hasRosterLink
	};
};

/* eslint-env jest */
describe('Site admin user course enrollment nav bar test', () => {
	test('Basic render test (has roster link)', async () => {
		const course = getCourse(true);

		const cmp = renderer.create(<View course={course}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});

	test('Basic render test (has no roster link)', async () => {
		const course = getCourse(false);

		const cmp = renderer.create(<View course={course}/>);

		const tree = cmp.toJSON();

		expect(tree).toMatchSnapshot();
	});
});
