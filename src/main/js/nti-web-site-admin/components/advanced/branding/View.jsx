import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Theme} from '@nti/web-commons';

import Card from '../../common/Card';

import {Library, Assets, Site} from './sections/';
import style from './View.css';
import Store from './Store';

const cx = classnames.bind(style);

class SiteAdminBranding extends React.Component {
	
	static deriveBindingFromProps = () => Theme.getGlobalTheme()

	changeHandler = scope => newProps => {
		this.props.setThemeProps({
			[scope]: { ...newProps }
		});
	}

	onSave = () => this.props.save();

	render () {
		const {theme, assets, setAsset} = this.props;

		return !theme ? null : (
			<Card className={cx('branding-root')}>
				<Library theme={theme.library} onChange={this.changeHandler('library')} />
				<Assets assets={assets} onChange={setAsset} />
				<Site />
				{/* {scopes.map(scope => {
					const Widget = getSection(scope);
					return (
						<Widget key={scope} theme={theme[scope]} onChange={this.changeHandler(scope)} />
					);
				})} */}
				<button onClick={this.onSave}>Save</button>
			</Card>
		);
	}
}

SiteAdminBranding.propTypes = {
	assets: PropTypes.object,
	setAsset: PropTypes.func.isRequired,
	setThemeProps: PropTypes.func.isRequired,
	theme: PropTypes.object,
	save: PropTypes.func.isRequired,
};

export default Store.connect([
	'theme',
	'assets',
	'setThemeProps',
	'setAsset',
	'save'
])(SiteAdminBranding);
