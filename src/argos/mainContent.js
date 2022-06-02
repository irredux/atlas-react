import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";

import { arachne } from "./../arachne.js";
import { Overview } from "./overview.js";
import { Edition, getEditions, storeEdition } from "./edition.js";
import { ChangeLog } from "./changelog.js";
import { SearchBox } from "./search.js";
import { Account } from "./../settings.js";

function arachneTbls(){
    return ["author", "edition", "scan_opera", "scan_opera_view", "scan", "scan_lnk", "work", "fulltext_search_view"];
}
function MainBody(props){
    useEffect(()=>{
        const fetchData=async ()=>{const urlQueries = new URLSearchParams(window.location.search);
            if(props.resId===null&&urlQueries.get("id")){
                const newRes = await arachne.edition.get({id: urlQueries.get("id")}, {select: ["id", "label", "ac_web"]});
                if(newRes.length===1){
                    storeEdition(newRes[0].id, newRes[0].label, newRes[0].ac_web);
                    props.loadMain(null, "edition", newRes[0].id)
                }
            }
        };
        fetchData();
    }, []);
    let main = null;
    switch(props.res){
        case null:
            main = <Overview loadMain={(...params)=>{props.loadMain(...params)}} />;
            break;
        case "edition":
            main = <Edition resId={props.resId} loadMain={(...params)=>{props.loadMain(...params)}} />;
            break;
        case "changelog":
            main = <ChangeLog />;
            break;
        case "search":
            main = <SearchBox loadMain={(...params)=>{props.loadMain(...params)}} />;
            break;
        case "account":
            main = <Account />;
            break;
        default:
            main = <div>Unbekannter Menü-Punkt: "{props.res}"</div>;
    }
    return main;
}

function MainNavBar(props){
    const [editions, setEditions] = useState([]);
    const [editionTxt, setEditionTxt] = useState("zuletzt geöffnet");
    useEffect(()=>{
        const fetchData = async ()=>{
            const newEditions = getEditions();
            setEditions(newEditions.map(e=>{return <NavDropdown.Item key={e.id} onClick={ev=>{storeEdition(e.id, e.label, e.opus);props.loadMain(ev,"edition", e.id)}}>{e.label}{e.opus?` (${e.opus.substring(0,20)+(e.opus.length>20?"...":"")})`:null}</NavDropdown.Item>;}));
            if(props.res==="edition"){setEditionTxt(newEditions[0].label+(newEditions[0].opus?` (${newEditions[0].opus.substring(0,20)+(newEditions[0].opus.length>20?"...":"")})`:null))}
            else{setEditionTxt("zuletzt geöffnet")}
        }
        fetchData();
    }, [props.res, props.resId]);
    return <Navbar bg="dark" variant="dark" fixed="top">
        <Container fluid>
            <Navbar.Brand style={{cursor: "pointer"}} onClick={e=>{props.loadMain(e, null)}}>Argos</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                <Nav>
                    <Nav.Link>
                        <span onClick={e=>{props.loadMain(e, "search")}}>Volltextsuche</span>
                    </Nav.Link>
                    <NavDropdown title={editionTxt}>{editions}
                    </NavDropdown>
                    <NavDropdown title="Einstellungen">
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "account")}}>Konto</NavDropdown.Item>
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
export { arachneTbls, MainBody, MainNavBar };