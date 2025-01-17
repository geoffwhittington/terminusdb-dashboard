import React from "react";
import {Card, Button} from "react-bootstrap"
import Stack from 'react-bootstrap/Stack'
import {HiPlusSm} from "react-icons/hi"
import { DocumentsGraphqlTable } from "./components/DocumentsGraphqlTable";

export const ListDocumentsComponent = ({type, apolloClient, tablesConfig , onRowClick, 
                                     onDeleteButtonClick,
                                     onViewButtonClick,
                                     onEditButtonClick,
                                     onCreateButtonClick,
                                     gqlQuery}) => {    
    if(!tablesConfig) return 
   
    return <Card className="content border-secondary w-100 mt-5" variant="light">
            <Card.Header>
                <Stack direction="horizontal" gap={3}>
                    <h6>Documents of type - <strong className="text-success">{type}</strong></h6>
                        <div className="ms-auto">
                            <Button className="bg-light text-dark" onClick={onCreateButtonClick}>
                                <HiPlusSm className="mr-1 mb-1"/>
                                <small>{`Add new ${type}`}</small>
                            </Button>
                        </div>
                </Stack>   
            </Card.Header>
            <Card.Body className="text-break">
            <DocumentsGraphqlTable tableConfig={tablesConfig} 
                    type={type} 
                    gqlQuery={gqlQuery}
                    apolloClient={apolloClient}
                    onRowClick={onRowClick}
                    onDeleteButtonClick={onDeleteButtonClick}
                    onViewButtonClick={onViewButtonClick}
                    onEditButtonClick={onEditButtonClick}/>
            </Card.Body>
        </Card>
       
}