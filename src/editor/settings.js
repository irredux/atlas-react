import { useEffect, useState } from "react";
import { Col, Container, Form, Row } from "react-bootstrap";
import { getSettings, setSetting } from "./mainContent.js";

function Settings(props){
    const settings = getSettings();
    const [openExternal, setOpenExternal] = useState(settings.openExternal) // open ressource in external window
    useEffect(()=>{setSetting("openExternal", openExternal)}, [openExternal]);
    return <Container>
        <h1>Einstellungen</h1>
        <Row><Col>Öffnen der Ressourcen:</Col><Col>
        <Form>
            <Form.Check type="radio" name="ressource" label="extern" checked={openExternal} onChange={()=>{setOpenExternal(true)}} />
            <Form.Check type="radio" name="ressource" label="Seite-an-Seite" checked={!openExternal} onChange={()=>{setOpenExternal(false)}} />
        </Form>
        </Col></Row>
    </Container>
}
export { Settings }