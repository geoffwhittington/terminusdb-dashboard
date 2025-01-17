
import React, {useState, useEffect} from "react"
import {LATITUDE, LONGITUDE, POINTS, POLYGON, LAT, LNG, REFRESH} from "../constants"
import {customMapOptions, customMarkerOptions} from "./markers"
import icon from "../constants"
import "leaflet-arrowheads"
import L from "leaflet"
import {MAP_OPTION, MARKER_OPTION} from "./map.constants"
import uuid from 'react-uuid'

export const polygonMapViewer = (args) => {
	let {property, documents, zoom, icon, center, bounds, type}=args
	
	let mapID=uuid()

	useEffect(() => {
		map()
	}, [])  

	const map = () => {
		
		let mapOptions = customMapOptions(zoom, [37, -109.05], documents, type)
        let markerOptions= customMarkerOptions(icon)

		const map = L.map(`map-polygon-id-${mapID}`, mapOptions)

        // set center of maps 
		if(bounds && Array.isArray(bounds) && bounds.length > 0){
			//map.setView([40.866667, 34.566667], 5) 
			map.fitBounds(bounds)
			map.flyToBounds(bounds)
		}

		const tileLayer = new  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })

		tileLayer.addTo(map)
		
		//console.log("documents", documents)
		var polygonMap = L.polygon(documents, { color: 'purple', smoothFactor: 5 }).addTo(map)

        // zoom the map to the polygon
        map.fitBounds(polygonMap.getBounds())

		window.map = map
	}

	return <div id={`map-polygon-id-${mapID}`} style={{ height: "100vh" }}></div>
}