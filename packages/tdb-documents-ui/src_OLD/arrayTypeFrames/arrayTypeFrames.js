import React from "react"
import { generateLabel } from "../helpers/labelHelper"
import * as CONST from "../constants"
import * as helper from "./helpers"
import {ArrayFieldTemplate} from "../arrayFrames/templates"
import {gatherViewUIItems} from "./viewGeoArrayTypeFrames"

/** gather items for array  */
function gatherItems (item, dimension, type) {
    // point
    if(dimension === CONST.POINT_TYPE_DIMENSION && type === CONST.POINT_TYPE) {
        return helper.POINT_TYPE_LAYOUT
    }

    // line string 
    if(dimension === CONST.LINE_STRING_TYPE_DIMENSION && type === CONST.LINE_STRING_TYPE) {
        return [{
            "type": "array",
            "items": helper.POINT_TYPE_LAYOUT
        }]
    }

    // polygon
    if(dimension === CONST.POLYGON_TYPE_DIMENSION && type === CONST.POLYGON) {
        let polygon = []

        let polygonLayout= {
            type: "array",
            title: item,
            [CONST.DIMENSION]: dimension,
            items: [{
                type: "array",
                items: helper.POINT_TYPE_LAYOUT
            }],
            additionalItems: {
                type: "array",
                items: helper.POINT_TYPE_LAYOUT
            }
        }

        polygon.push(polygonLayout)
        return polygon
    }

    // multi polygon
    if(dimension === CONST.POLYGON_TYPE_DIMENSION && type === CONST.MULTIPOLYGON) {
        return {
            type: "array", 
            title: "Polygon",
            description: "Add a polygon",
            items: {
                type: "array", 
                title: "coordinates",
                description: "Add coordinates",
                items: [ {type: CONST.STRING_TYPE}, {type: CONST.STRING_TYPE} ]
            }
        }
      
    }

    // mostly b_box
    return helper.POINT_TYPE_LAYOUT
}

/** generates label with required tag */
/** we make bbox and coordinates required here  */
function generateGeoFrameLabel (frame, item, documentation) {
    return <>
        {generateLabel(frame, item, documentation)} {` `}
        <span class="required">*</span>
    </>
}

/** gather ui items for array  */
function gatherUIItems (frame, item, documentation, dimension, type) {
    let generatedLabel=generateGeoFrameLabel(frame, item, documentation)

    if(dimension === CONST.POLYGON_TYPE_DIMENSION && type === CONST.POLYGON) {
        // polygon and multipolygon @dimensions = 3
        let uiPolygon = {
            "items": helper.POINT_TYPE_UI_LAYOUT
        }
        return {
            "ui:title": generatedLabel, 
            "ui:description": "Add coordinates ...",
            "items": {
                "ui:ArrayFieldTemplate": ArrayFieldTemplate,
                "ui:options" : {
                    addable: true,
                    orderable: true,
                    removable: true
                },
                "items" : uiPolygon,
                "additionalItems": helper.POLYGON_TYPE_UI_LAYOUT
            }
        }
    }
    else if (dimension === CONST.POLYGON_TYPE_DIMENSION && type === CONST.MULTIPOLYGON) {
        let uiMultiPolygionLayout={
            "ui:title": "MultiPolygon",
            "ui:description": "MultiPolygon",
            "classNames": "card border border-secondary p-2",
            items: {
                "ui:title": "Polygon",
                "ui:description": "Add Polygon ...",
                "ui:ArrayFieldTemplate": ArrayFieldTemplate,
                "ui:options" : {
                    addable: true,
                    orderable: true,
                    removable: true
                },
                items: {
                    "ui:title": "Coordinates",
                    "ui:description": "Add Coordinates ...",
                    "ui:ArrayFieldTemplate": ArrayFieldTemplate,
                    "ui:options" : {
                        addable: true,
                        orderable: true,
                        removable: true
                    },
                    items: [
                        { 
                            "ui:placeholder": `Enter latitude ...`,
                            classNames: "tdb__input mb-3"
                        },
                        {
                            "ui:placeholder": `Enter longitude ...`, 
                            classNames: "tdb__input mb-3"
                        }
                    ]
                }
            },
            "ui:ArrayFieldTemplate": ArrayFieldTemplate,
            "ui:options" : {
                addable: true,
                orderable: true,
                removable: true
            }
        }
        return uiMultiPolygionLayout
    }
    else {
        // for points and line strings
        // @dimensions < 3
        return {
            "ui:title": generatedLabel, 
            "classNames": "tdb__geo__input",
            "ui:options" : {
                addable: true,
                orderable: true,
                removable: true 
            },
            "ui:ArrayFieldTemplate": ArrayFieldTemplate,
            "items": helper.getherUIItems(dimension),
            "additionalItems": helper.gatherAdditionalUIItems(dimension)
        }
    }
}

// EDIT & CREATE
function makeEditableGeoArrayTypeFrames (args) {
    let layout={}, uiLayout={}
    let { frame, item, documentation }=args

    let dimension=frame[item][CONST.DIMENSION]
    let type=frame.hasOwnProperty("type") ? frame["type"]["@values"][0] : ""

    layout= {
        type: "array", 
        title: item,
        [CONST.DIMENSION]: dimension, 
        items: gatherItems(item, dimension, type)
    }

    if(dimension === CONST.LINE_STRING_TYPE_DIMENSION) {
        layout["additionalItems"]=helper.gatherAdditionalItems(dimension)
    }

    uiLayout = gatherUIItems(frame, item, documentation, dimension, type)
    return {layout, uiLayout}
} 

// VIEW 
function makeViewGeoArrayTypeFrames (args) {
    let layout={}, uiLayout={}
    let { frame, item, documentation, formData }=args

    let dimension=frame[item][CONST.DIMENSION]
     
    layout= {
        type: "object",
        title: item,
        [CONST.DIMENSION]: dimension, 
        properties: {
            type: CONST.STRING_TYPE
        }
    } 

    uiLayout = gatherViewUIItems(frame, item, formData, documentation, dimension)
    return {layout, uiLayout}
}


export function makeArrayTypeFrames (args) {
    let { mode }=args
    if(mode !== CONST.VIEW) {
        return makeEditableGeoArrayTypeFrames(args)
    }
    // in View mode display Map Viewer
    return makeViewGeoArrayTypeFrames(args)
}