import React from 'react';

function InfoBox(props) {
	const { currentMarker, infoContent } = props;

	return (
		<aside 
			className="info-box"
			tabIndex={0}>
			
			<p className="attribution">Provided by Wikipedia</p>
			<h2>{currentMarker.title}</h2>
			<article>
				{infoContent}
			</article>
		</aside>
	);
}

export default InfoBox;
