import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';

import Card from '../../common/Card';

import {scopes} from './constants';
import getSection from './sections/';
import Store from './Store';
import style from './View.css';

const cx = classnames.bind(style);

class SiteAdminBranding extends React.Component {
	render () {
		const {theme} = this.props;
		return !theme ? null : (
			<Card className={cx('branding-root')}>
				{scopes.map(scope => {
					const Widget = getSection(scope);
					return (
						<Widget key={scope} theme={theme.scope(scope)} />
					);
				})}
			</Card>
		);
	}
}

SiteAdminBranding.propTypes = {
	theme: PropTypes.object
};

export default Store.connect(['theme'])(SiteAdminBranding);
