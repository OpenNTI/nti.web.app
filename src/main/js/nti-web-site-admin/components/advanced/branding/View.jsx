import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import Card from '../../common/Card';

import {scopes} from './constants';
import getSection from './sections/';
import style from './View.css';
import Store from './Store';

const cx = classnames.bind(style);

class SiteAdminBranding extends React.Component {
	
	static deriveBindingFromProps = () => Theme.getGlobalTheme()

	changeHandler = scope => newProps => {
		this.props.onThemePropsChange({
			[scope]: { ...newProps }
		});
	}

	onSave = () => this.props.save();

	render () {
		const {theme} = this.props;
		return !theme ? null : (
			<Card className={cx('branding-root')}>
				{scopes.map(scope => {
					const Widget = getSection(scope);
					return (
						<Widget key={scope} theme={theme[scope]} onChange={this.changeHandler(scope)} />
					);
				})}
				<button onClick={this.onSave}>Save</button>
			</Card>
		);
	}
}

SiteAdminBranding.propTypes = {
	onThemePropsChange: PropTypes.func.isRequired,
	theme: PropTypes.object,
	save: PropTypes.func.isRequired,
};

export default Store.connect(['theme', 'onThemePropsChange', 'save'])(SiteAdminBranding);
