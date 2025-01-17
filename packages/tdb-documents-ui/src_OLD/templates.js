import React from "react"
import {keyExists} from "./utils"
import * as CONST from "./constants"

/** --- Frame Viewer templates --- */
// checks if choice sub document form data is valid or not 
function validChoiceSubDocumentFormData(formData) {
	if(typeof formData !== CONST.OBJECT_TYPE) return false
	if(!Object.keys(formData).length) return false
	if(Object.keys(formData).length === 1) {
		let key = Object.keys(formData)[0]
		// form data is empty and it has only @type of choice sub doc 
		// example - formData = {"@type": "Botony"}
		if(key === "@type") return false
	} 
	return true
}

const DisplayLabel = ({schema, id, label, formData}) => {
	if(schema.hasOwnProperty(CONST.INFO) && 
		schema[CONST.INFO] === CONST.DATA_TYPE) { 
			if(schema.hasOwnProperty(CONST.FORMAT) && 
				schema[CONST.FORMAT]=== CONST.URI) return <div/> 
			return <label className={`control-label display__label__template`} htmlFor={id}>{label}</label>
		}

	if(schema.hasOwnProperty(CONST.INFO) && 
		schema[CONST.INFO] === CONST.ENUM) { 
			return <label className={`control-label display__label__template`} htmlFor={id}>{label}</label>
	}

	if(schema.hasOwnProperty(CONST.INFO) && 
		schema[CONST.INFO] === CONST.DOCUMENT) {
			return <div/>
	}

	return <div/>
}

/**
 * DisplayFieldTemplate is called only in VIEW mode, to hide fields if they are not populated.
 * @param {*} props - props from rjsf form
 * @returns custom field templates
 */
 export function DisplayFieldTemplate(props) {
	const {id, classNames, label, help, required, description, errors, children, formData, schema, uiSchema} = props;
	
	//console.log("props", id, props) 
	// return empty div when no data available
	//if(!formData && !uiSchema.hasOwnProperty("ui:field")) {
		// check for ui field -  we use custom fields some times to represent null fields
		if(schema.info === CONST.DATA_TYPE && schema.type === CONST.BOOLEAN_TYPE) {
			// display a different widget for bool type 
			// the reason we display it separately is that boolean type when false is not showed in UI 
			// so we force it in ui instead
			let css = uiSchema && uiSchema.hasOwnProperty(CONST.CLASSNAME) ? uiSchema[CONST.CLASSNAME] : `tdb__input mb-3 mt-3 tdb__view`
			return <div className={`form-group field field-boolean ${css}`}>
				<label className="control-label" for="root_transparent">
					<div className="d-flex h6 view__display__field__template">{schema.title}<div>
				</div></div>
				</label>
				<div className="checkbox disabled">
					<label>
						{formData && <input type="checkbox" id="root_transparent" disabled="" checked/>}
						{!formData && <input type="checkbox" id="root_transparent" disabled=""/>}
						<span>{schema.title}</span>
					</label>
				</div>
			</div>
		//}
		return <div className="empty__field"/>
	}

	// return nothing when subdocument is not filled (mandatory/ optional only ...)
	if(typeof formData === CONST.OBJECT_TYPE && 
		!Object.keys(formData).length && 
		schema.hasOwnProperty(CONST.INFO) &&  
		schema[CONST.INFO] === CONST.SUBDOCUMENT_TYPE && 
		uiSchema["ui:field"] === "collapsible") { 
			return <div className="empty__subdocument"/>
	}

	// return nothing when choice subdocument is not filled (mandatory/ optional only ...)
	if(schema.hasOwnProperty(CONST.INFO) && 
		schema[CONST.INFO] === CONST.CHOICESUBCLASSES) {
			if (!validChoiceSubDocumentFormData(formData)) {
				return <div className="empty__choice__subdocument"/>
			}
	}

	// if coordinates is empty dont display anything 
	let coordinateArray=keyExists(formData, CONST.COORDINATES)
	if(coordinateArray) {
		if(Array.isArray(coordinateArray) && coordinateArray.includes(undefined)) {
			return <div className="empty__location"/>
		}
		else if(!coordinateArray) return <div className="empty__location"/>
	}
	
	
	return (
	  <div className={classNames}>
		<DisplayLabel schema={schema} id={id} label={label} formData={formData}/>
		{description}
		{children}
		{errors}
		{help}
	  </div> 
	)
}

/** 
* 
* @param {*} documentation - extracted documentation from frames
* @returns displays document's comment
*/
export const DisplayDocumentation = ({documentation}) => {
 if(documentation && documentation.hasOwnProperty(CONST.COMMENT)) {
   return <p className="text-muted fw-bold ml-3 text-left">{documentation[CONST.COMMENT]}</p>
 }
 return <div/>
}
