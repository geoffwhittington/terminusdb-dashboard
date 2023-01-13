import React, {useEffect, useState} from "react"
import Form from "@terminusdb/rjsf-core"
import {getProperties} from "./FrameHelpers"
import CollapsibleField from "react-jsonschema-form-extras/lib/CollapsibleField"
import * as CONST from "./constants"
import {Alert} from "react-bootstrap"
import * as util from "./utils"
import {transformData} from "./extract" 
import {processFormData} from "./processFormData"
import {DisplayFieldTemplate, DisplayDocumentation} from "./templates"
/*
**  frame     - full json schema of a document
**  uiFrame   - ui json of a document
**  type      - document type of interest
**  mode      - create/ edit/ view
**  submitButton - submit button configuration json object
**  formData  - filled value of the document
**  onSubmit  - a function with have custom logic to process data submitted
**  hideSubmit - hides Submit button - this is helpfull when you want to display nested FrameViewers
**  onChange   - a function with custom logic to process data when form data is changed
**  onSelect   - a js function which gets back the selected value from selects
**  onTraverse - a js function which gets back the ID of a document on click
**  FieldTemplate - a js function which you can pass at root level of FrameViewer to alter look and feel of fields
**  language - language code parameters to support a wide variety of languages in Ui as defined in schema
*/
export function FrameViewer({frame, uiFrame, type, mode, formData, onSubmit, onTraverse, onSelect, hideSubmit, onChange, FieldTemplate, language}){
    const [schema, setSchema]=useState(false)
    const [uiSchema, setUISchema]=useState(false)
    const [readOnly, setReadOnly]=useState(false)
    const [lang, setLanguage]=useState(false)
    const [error, setError]=useState(false)
    const [input, setInput]=useState({})
    const [documentation, setDocumentation]=useState(false)

    const [message, setMessage]=useState(false)

    let current = `${type}`
    let formDataTemp=formData

    function clear() {
        setSchema(false)
        setUISchema(false)
        setReadOnly(false)
        setLanguage(false)

    }

    useEffect(() => {
        //try{ 
            if(frame, uiFrame, type, mode) { //formData 
                clear()
                let extractedDocumentation= util.extractDocumentation(frame, current, language)
                //if(extractedDocumentation) setDocumentation (extractedDocumentation)
                let properties=getProperties(frame, type, frame[current], uiFrame, mode, formData, onTraverse, onSelect, extractedDocumentation)
                
                let schema = {
                    type: CONST.OBJECT_TYPE,
                    properties: properties.properties,
                    required: properties.required,
                    dependencies: properties.dependencies,
                }
                //console.log("schema", JSON.stringify(schema, null, 2))
                //console.log("uiSchema", JSON.stringify(properties.uiSchema, null, 2))

                console.log("schema", schema)
                console.log("properties.uiSchema", properties.uiSchema)
                //console.log("uiSchema", uiSchema)

                if(mode === CONST.VIEW) {
                    setReadOnly(true)
                    setInput(formData)
                }
                else if(mode === CONST.CREATE) setInput(formData)
                else if(mode === CONST.EDIT && util.isValueHashDocument(frame[current])) {
                    setInput(formData)
                    setMessage(util.getValueHashMessage())
                    setReadOnly(true)
                }
                else if(onChange) { // form nested frame viewers
                    setInput(formData)
                }
                else {
                    setReadOnly(false)
                    setInput({})
                }
                setSchema(schema)
                const uiSchema = properties.uiSchema
 
                // get form level ui schema 
                if(uiFrame && uiFrame.hasOwnProperty("classNames")) uiSchema["classNames"]= uiFrame.classNames
                if(uiFrame && uiFrame.hasOwnProperty("ui:order")) uiSchema["ui:order"]=uiFrame["ui:order"]
                if(uiFrame && uiFrame.hasOwnProperty("ui:title")) uiSchema["ui:title"]= uiFrame["ui:title"]
                if(uiFrame && uiFrame.hasOwnProperty("ui:description")) uiSchema["ui:description"]= uiFrame["ui:description"]
                
                // order is set to place @documentation field at the start of the document
                if(frame) {
                  uiSchema["ui:order"] = util.getOrderFromMetaData(frame[type])
                }
                
                setUISchema(uiSchema)
            }
        //}
        //catch(e) {
            //setError(`An error has occured in generating frames. Err - ${e}`)
        //}

    }, [frame, uiFrame, type, mode, formData, language]) 

    if(!frame) return <div>No schema provided!</div>
    if(!mode) return  <div>Please include a mode - Create/ Edit/ View</div>
    if(mode === CONST.VIEW && !formData) return <div>Mode is set to View, please provide filled form data</div>
    if(!type) return  <div>Please include the type of document</div>

    const handleChange = ({formData}) => {
        if(onChange) {
            var extracted = transformData(mode, schema.properties, formData, frame, type)
            if(extracted && !extracted.hasOwnProperty("@type")) extracted["@type"] = type

            if(mode === CONST.EDIT &&  // append id in edit mode
                extracted && 
                !extracted.hasOwnProperty("@id") && 
                formDataTemp.hasOwnProperty("@id")) {
                    extracted["@id"] = formDataTemp["@id"]
            }
            onChange(extracted)
        }
    }

    /**
     * 
     * @param {*} formData - data extracted from the form 
     * @returns extracted data to onSubmit callback function 
     */
    const handleSubmit = ({formData}) => {
        if(onSubmit) { 
            //console.log("Before submit: ", formData)

            var extracted = transformData(mode, schema.properties, formData, frame, type)
            if(extracted && !extracted.hasOwnProperty("@type")) extracted["@type"] = type

            if(mode === CONST.EDIT &&  // append id in edit mode
                extracted && 
                !extracted.hasOwnProperty("@id") && 
                formDataTemp.hasOwnProperty("@id")) {
                    extracted["@id"] = formDataTemp["@id"]
            }

            onSubmit(extracted)
            console.log("Data submitted: ",  extracted)
            return extracted
        }
    }


    if(error) {
        return <Alert variant="danger">{error}</Alert>
    }

    // process form data to check if one ofs are available
    let processedFormData=(mode !== CONST.CREATE) ? processFormData(frame, type, formData) : formData 

    return <div data-cy="frame_viewer" className="tdb__frame__viewer">
        {schema && message && message}
        <DisplayDocumentation documentation={documentation}/>
        {schema && <Form schema={schema}
            uiSchema={uiSchema}
            mode={mode} 
            onSubmit={handleSubmit}
            readonly={readOnly}
            //formData={input}
            //formData={formData}
            formData={processedFormData}
            //onChange={handleChange}
            fields={{
                collapsible: CollapsibleField
            }}
            children={hideSubmit} // hide submit button on view mode
            FieldTemplate={mode===CONST.VIEW ? DisplayFieldTemplate : null}
        />
    }

    </div>
}

/**
 const handleChange = (data) => {
    //console.log("Data changed: ",  data)
    setInput(data)
    if(onChange) {
        onChange(data)
    }
}
 */
