import React, {useState,useEffect}  from "react";
import {ViewDocumentComponent, useTDBDocuments} from "@terminusdb/terminusdb-documents-ui-template"
import {useParams,useNavigate } from "react-router-dom";
import {Loading} from "../components/Loading"
import {decodeUrl} from "../components/utils"
import {EDIT_DOC} from "../routing/constants"
import { DeleteDocumentModal } from "../components/DeleteDocumentModal";
import {WOQLClientObj} from '../init-woql-client'
import {CreateChangeRequestModal} from '../components/CreateChangeRequestModal'
import {ErrorMessageReport} from "../components/ErrorMessageReport"
import '@terminusdb/terminusdb-documents-ui/dist/css/terminusdb__darkly.css'


export const DocumentView = () => {   
    const { branch,setChangeRequestBranch,woqlClient,currentChangeRequest} = WOQLClientObj()
    const {type, docid} = useParams()
    const [showCRModal, setShowCRModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal]=useState(false)
    const navigate = useNavigate()
    const {
        frames,
        selectedDocument,
        error,
        setError,
        loading,
        deleteDocument,
        getSelectedDocument,
        getDocumentFrames,
        getDocumentById
    } = useTDBDocuments(woqlClient)

    let documentID=decodeUrl(docid)
 
    useEffect(() => {
        getDocumentFrames()
        getSelectedDocument(documentID)
	},[])

    function deleteDocumentHandler(e) {
        // I can not change main directly
        // I can change other branches creates with create branch interface
        if(!currentChangeRequest){
            setShowCRModal(true)
        }else setShowDeleteModal(true)
    }

    async function callDeleteDocument(){
        const delCall = await deleteDocument(documentID)
        if(delCall){
            navigate(-1)
        }else{
            setShowDeleteModal(false)
        }
    }

    if(!selectedDocument || !frames) return  <Loading message={`Fetching ${documentID} ...`}/>

    return <React.Fragment>
        {showCRModal && <CreateChangeRequestModal showModal={showCRModal} type={type}  setShowModal={setShowCRModal} updateViewMode={setChangeRequestBranch}/>}
        {error && <ErrorMessageReport error={error} setError={setError}/>}
        {showDeleteModal && <DeleteDocumentModal
            loading={loading}
            deleteDocument={callDeleteDocument}
            documentID={documentID}
            showDeleteModal={showDeleteModal}
            handleClose={()=>showDeleteModal(false)}
        /> }
        <ViewDocumentComponent 
          type={type}
          getDocumentById={getDocumentById}
          documentJson={selectedDocument}
          frames={frames}
          closeButtonClick={()=>navigate(-1)}
          documentID={documentID}
          deleteDocument={deleteDocumentHandler}
          editDocument = {()=>navigate(`${EDIT_DOC}`)}
        />
    </React.Fragment>
}
