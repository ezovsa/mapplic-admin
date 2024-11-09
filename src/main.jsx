import React from 'react'
import ReactDOM from 'react-dom/client'
import MapplicAdmin from './MapplicAdmin'

const searchParams = new URLSearchParams(window.location.search);

const builder = document.getElementById('mapplic-builder');

const parse = (json) => {
	if (!json) return null;
	return JSON.parse(json);
}

ReactDOM.createRoot(builder).render(
	<MapplicAdmin
		json={searchParams.get('map') || parse(builder.dataset.json) || undefined}
		saveMap={builder.dataset.save}
		newMap={builder.dataset.new}
		dir={builder.dataset.dir}
	/>
)