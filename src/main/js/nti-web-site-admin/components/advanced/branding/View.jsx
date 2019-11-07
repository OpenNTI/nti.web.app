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

	constructor (props) {
		super(props);
		this.form = React.createRef();
	}

	static deriveBindingFromProps = () => Theme.getGlobalTheme()

	onSave = e => {
		e.preventDefault();
		e.stopPropagation();
		this.props.save(this.form.current);
	}

	render () {
		const {
			theme,
			assets,
			setAsset,
			setBrandProp,
		} = this.props;

		return !theme ? null : (
			<Theme.Apply theme={theme}>
				<form ref={this.form} onSubmit={this.onSave} encType="multipart/form-data">
					<Card className={cx('branding-root')}>
						<Library onChange={setBrandProp} />
						<Site onChange={setBrandProp} />
						<Assets assets={assets} onChange={setAsset} />
						<button onClick={this.onSave}>Save</button>
					</Card>
				</form>
			</Theme.Apply>
		);
	}
}

SiteAdminBranding.propTypes = {
	assets: PropTypes.object,
	setAsset: PropTypes.func.isRequired,
	setBrandProp: PropTypes.func.isRequired,
	theme: PropTypes.object,
	save: PropTypes.func.isRequired,
};

export default Store.connect([
	'theme',
	'assets',
	'setAsset',
	'setBrandProp',
	'save'
])(SiteAdminBranding);
