import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";

import { Overview } from "./overview.js";
import { Editor } from "./editor.js";
import { ChangeLog } from "./../changelog.js";
import { Account } from "./../settings.js";
import { arachne } from "./../arachne.js";

function getSettings(){
    let settings = JSON.parse(localStorage.getItem("editor_settings"));
    if(settings===null){settings = {}}
    if(!settings.hasOwnProperty("projectSort")){settings.projectSort = "name"}
    if(!settings.hasOwnProperty("openExternal")){settings.openExternal=false}
    return settings;
}
function getSetting(name){
    const settings = getSettings();
    return settings[name];
}
function setSetting(key, value){
    let settings = getSettings()
    settings[key] = value;
    localStorage.setItem("editor_settings", JSON.stringify(settings))
}

function MainBody(props){
    arachne.changeLog = dbChangeLog;
    let main = null;
    switch(props.res){
        case null:
            main = <Overview loadMain={(...params)=>{props.loadMain(...params)}} />;
            break;
        case "editor":
            main = <Editor loadMain={(...params)=>{props.loadMain(...params)}} resId={props.resId} />;
            break;
        case "changelog":
            main = <ChangeLog />;
            break;
        case "settings":
            main = <Account />;
            break;
        default:
            main = <div>Unbekannter Menü-Punkt: "{props.res}"</div>;
    }
    return <>
        {main}
        
    </>;
}
function MainNavBar(props){
    const [editions, setEditions] = useState([]);
    const [editionTxt, setEditionTxt] = useState("zuletzte geöffnet");
    /*useEffect(async ()=>{
        const newEditions = getEditions();
        setEditions(newEditions.map(e=>{return <NavDropdown.Item key={e.id} onClick={ev=>{storeEdition(e.id, e.label, e.opus);props.loadMain(ev,"edition", e.id)}}>{e.label}{e.opus?` (${e.opus.substring(0,20)+(e.opus.length>20?"...":"")})`:null}</NavDropdown.Item>;}));
        if(props.res==="edition"){setEditionTxt(newEditions[0].label+(newEditions[0].opus?` (${newEditions[0].opus.substring(0,20)+(newEditions[0].opus.length>20?"...":"")})`:null))}
        else{setEditionTxt("zuletzte geöffnet")}
    }, [props.res, props.resId]);*/
    return <Navbar bg="dark" variant="dark" fixed="top">
        <Container fluid>
            <Navbar.Brand style={{cursor: "pointer"}} onClick={e=>{props.loadMain(e, null)}}>Editor</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                <Nav>
                    <NavDropdown title={editionTxt}>{editions}
                    </NavDropdown>
                    <NavDropdown title="Einstellungen">
                    <NavDropdown.Item onClick={e=>{props.loadMain(e,"settings")}}>Konto</NavDropdown.Item>
                        <NavDropdown.Item onClick={e=>{props.loadMain(e,"changelog")}}>Änderungen</NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link>
                        <FontAwesomeIcon icon={faSignOutAlt} onClick={e => {props.loadMain(e, "logout")}} title="abmelden" />
                    </Nav.Link>
                </Nav>
            </Navbar.Collapse>
        </Container>
</Navbar>;
}
const dbChangeLog = [
    {
        title: "Beta 1.0",
        date: "2022-06-10",
        description: <><p>Beta Version online!</p></>
    },
]
export { MainBody, MainNavBar, getSettings, getSetting, setSetting };