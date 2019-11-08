import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames/bind';
import {Errors, Theme} from '@nti/web-commons';

import Card from '../../common/Card';

import {ERROR, MODIFIED} from './constants';
import Apply from './Apply';
import Reset from './Reset';
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
			[ERROR]: error,
			[MODIFIED]: modified,
			theme,
			assets,
			setAsset,
			setBrandProp,
			cancel,
			reset
		} = this.props;

		return !theme ? null : (
			<Theme.Apply theme={theme}>
				<form ref={this.form} onSubmit={this.onSave} encType="multipart/form-data">
					<Card className={cx('branding-root')}>
						<div className={cx('header')}>
							<Apply disabled={!modified} onSave={this.onSave} onCancel={cancel} />
							{error && <Errors.Bar error={error} className={cx('errorbar')}/>}
						</div>
						<Library onChange={setBrandProp} />
						<Site onChange={setBrandProp} />
						<Assets assets={assets} onChange={setAsset} />
						<Reset onReset={reset} />
						<div className={cx('footer')}>
							<Apply disabled={!modified} onSave={this.onSave} onCancel={cancel} />
						</div>
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
	[MODIFIED]: PropTypes.bool,
	[ERROR]: PropTypes.object,
	save: PropTypes.func.isRequired,
	cancel: PropTypes.func.isRequired,
	reset: PropTypes.func.isRequired,
};

export default Store.connect([
	ERROR,
	MODIFIED,
	'theme',
	'assets',
	'setAsset',
	'setBrandProp',
	'cancel',
	'save',
	'reset'
])(SiteAdminBranding);
