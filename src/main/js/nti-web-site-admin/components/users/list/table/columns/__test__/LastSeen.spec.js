/* eslint-env jest */
import React from 'react';
import renderer from 'react-test-renderer';

import LastSeen from '../LastSeen';

describe('Site admin user table last seen column test', () => {
	const verifyColumn = (date) => {
		const colCmp = renderer.create(<LastSeen item={{
			getLastSeenTime: () => {
				return date;
			}
		}}/>);

		const tree = colCmp.toJSON();

		expect(tree).toMatchSnapshot();
	};

	test('Test date is null', () => {
		// null value should show "Never"
		verifyColumn(null);
	});

	test('Test date is within past 60 seconds', () => {
		// within past 60 seconds should just show "Now"
		verifyColumn(new Date(Date.now() - 20000));
	});

	test('Test date is 100 seconds ago', () => {
		// More than 60 seconds ago, show in minute or hour granularity.. "1 minute ago" in this case
		verifyColumn(new Date(Date.now() - 100 * 1000));
	});
});
