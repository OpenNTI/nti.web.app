import React from 'react';
import {Theme} from '@nti/web-commons';
import classnames from 'classnames/bind';

import styles from './FavIcon.css';

const cx = classnames.bind(styles);

export default function Browser () {
	const brandName = Theme.useThemeProperty('brandName');

	return (
		<div className={cx('browser-root')}>
			<svg width="780px" height="127px" viewBox="0 0 780 127" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
				<defs>
					<path d="M3,0 L765,0 C766.656854,-3.04359188e-16 768,1.34314575 768,3 L768,117 L0,117 L0,3 C-2.02906125e-16,1.34314575 1.34314575,3.04359188e-16 3,0 Z" id="path-1"></path>
					<filter x="-1.1%" y="-5.6%" width="102.2%" height="114.5%" filterUnits="objectBoundingBox" id="filter-2">
						<feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
						<feGaussianBlur stdDeviation="2.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
						<feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.15 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
						<feOffset dx="0" dy="-1" in="SourceAlpha" result="shadowOffsetOuter2"></feOffset>
						<feGaussianBlur stdDeviation="1" in="shadowOffsetOuter2" result="shadowBlurOuter2"></feGaussianBlur>
						<feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.184249344 0" type="matrix" in="shadowBlurOuter2" result="shadowMatrixOuter2"></feColorMatrix>
						<feMerge>
							<feMergeNode in="shadowMatrixOuter1"></feMergeNode>
							<feMergeNode in="shadowMatrixOuter2"></feMergeNode>
						</feMerge>
					</filter>
					<path d="M18.4290277,58 L36.6050613,15.6343589 C37.5510529,13.4293925 39.7196917,12 42.1190201,12 L280.88098,12 C283.280308,12 285.448947,13.4293925 286.394939,15.6343589 L304.570972,58 L765,58 C766.656854,58 768,59.3431458 768,61 L768,117 L0,117 L0,61 C-2.02906125e-16,59.3431458 1.34314575,58 3,58 L18.4290277,58 Z" id="path-3"></path>
					<filter x="-1.4%" y="-12.9%" width="102.7%" height="120.0%" filterUnits="objectBoundingBox" id="filter-4">
						<feOffset dx="0" dy="-3" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
						<feGaussianBlur stdDeviation="3" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
						<feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.087767701 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
					</filter>
					<path d="M274,41 L279.999128,41 C280.551894,41 281,41.4438648 281,42 C281,42.5522847 280.555369,43 279.999128,43 L274,43 L274,48.9991283 C274,49.5518945 273.556135,50 273,50 C272.447715,50 272,49.5553691 272,48.9991283 L272,43 L266.000872,43 C265.448106,43 265,42.5561352 265,42 C265,41.4477153 265.444631,41 266.000872,41 L272,41 L272,35.0008717 C272,34.4481055 272.443865,34 273,34 C273.552285,34 274,34.4446309 274,35.0008717 L274,41 Z" id="path-5"></path>
				</defs>
				<g id="Artboard-Copy-10" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
					<g id="Group-10" transform="translate(6.000000, 3.000000)">
						<g id="Rectangle">
							<use fill="black" fillOpacity="1" filter="url(#filter-2)" xlinkHref="#path-1"></use>
							<use fill="#F1F1F1" fillRule="evenodd" xlinkHref="#path-1"></use>
						</g>
						<g id="Combined-Shape">
							<use fill="black" fillOpacity="1" filter="url(#filter-4)" xlinkHref="#path-3"></use>
							<use fill="#FAFAFA" fillRule="evenodd" xlinkHref="#path-3"></use>
						</g>
					</g>
					{/* <circle id="favicon" fill="#FF5744" cx="66.5" cy="40.5" r="14.5"></circle> */}
					<text id="Zenefits-Learning" fontFamily="OpenSans, Open Sans" fontSize="18" fontWeight="normal" fill="#757474">
						<tspan x="91" y="48">{brandName}</tspan>
					</text>
					<rect id="Rectangle" strokeOpacity="0.292722902" stroke="#979797" fill="#FFFFFF" x="92.5" y="75.5" width="666" height="33"></rect>
					<g id="Mask" transform="translate(25.250000, 86.062500)">
						<path d="M14.6424513,6.68750003 L17.5,6.68750003 L17.5,9.18750003 L14.6773538,9.18750003 L7.95495129,15.9099026 L-1.15463195e-14,7.95495129 L7.95495129,-8.93216438e-15 L14.6424513,6.68750003 Z M14.6418199,6.68750003 L9.72208679,1.76776695 L4.80235372,6.68750003 L14.6418199,6.68750003 Z M14.6767224,9.18750003 L4.7674512,9.18750003 L9.72208679,14.1421356 L14.6767224,9.18750003 Z" fill="#787878"></path>
						<path d="M47.1424513,6.68750003 L50,6.68750003 L50,9.18750003 L47.1773538,9.18750003 L40.4549513,15.9099026 L32.5,7.95495129 L40.4549513,8.88389211e-13 L47.1424513,6.68750003 Z M47.1418199,6.68750003 L42.2220868,1.76776695 L37.3023537,6.68750003 L47.1418199,6.68750003 Z M47.1767224,9.18750003 L37.2674512,9.18750003 L42.2220868,14.1421356 L47.1767224,9.18750003 Z" fill="#B8B8B8" transform="translate(41.250000, 7.954951) scale(-1, 1) translate(-41.250000, -7.954951) "></path>
					</g>
					<mask id="mask-6" fill="white">
						<use xlinkHref="#path-5"></use>
					</mask>
					<use id="Mask" fill="#B8B8B8" transform="translate(273.000000, 42.000000) rotate(-315.000000) translate(-273.000000, -42.000000) " xlinkHref="#path-5"></use>
				</g>
			</svg>

			<Theme.Asset name="assets.favicon" className={cx('favicon')} />
		</div>
	);
}
