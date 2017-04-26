import React from 'react';
import { shallow } from 'enzyme';

import SearchResults from '../Results';
import Hit from '../Hit';
import Pager from '../Pager';

describe('<SearchResults />', () => {

	it('should render ten <Hit /> components', () => {
		const wrapper = shallow(<SearchResults />);
		expect(wrapper.find(Hit)).to.have.length(10);
	});

	it('should render one <Pager /> component', () => {
		const wrapper = shallow(<SearchResults />);
		expect(wrapper.find(Pager)).to.have.length(1);
	});

	it('should render a `.search-results`', () => {
		const wrapper = shallow(<SearchResults />);
		expect(wrapper.find('.search-results')).to.have.length(1);
	});

});
