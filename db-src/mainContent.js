import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";

import { ChangeLog } from "./changelog.js";
import { Lemma } from "./lemma.js";
import { Opera } from "./opera.js";
import { Ressource, SekLit } from "./ressources.js";
import { Account, Import, Server, Statistics } from "./settings.js";
import { Zettel } from "./zettel.js";
import { IndexBox } from "./indexbox.js";

function arachneTbls(){
    return ["author", "edition", "lemma", "opera_maiora", "opera_minora", "scan", "scan_lnk", "work", "zettel", "user", "seklit", "project", "article", "zettel_lnk", "statistics", "scan_paths", "ocr_jobs", "comment"];
}
function MainBody(props){
    let main = null;
    switch(props.res){
        case null:
            main = <ChangeLog />;
            break;
        case "ressources":
            main = <Ressource />;
            break;
        case "seklit":
            main = <SekLit />;
            break;
        case "stats":
            main = <Statistics />;
            break;
        case "server":
            main = <Server />;
            break;
        case "lemma":
            main = <Lemma loadMain={(e,res)=>{props.loadMain(e, res)}} />;
            break;
        case "maiora":
            main = <Opera listName="opera_maiora" />;
            break;
        case "minora":
            main = <Opera listName="opera_minora" />;
            break;
        case "import":
            main = <Import loadMain={(e,res)=>{props.loadMain(e, res)}} />;
            break;
        case "zettel":
            main = <Zettel />;
            break;
        case "indexbox":
            main = <IndexBox />;
            break;
        case "account":
            main = <Account />;
            break;
        default:
            main = <div>Unbekannter Menü-Punkt {props.res}</div>;
    }
    return main;
}

function MainNavBar(props){
    return <Navbar bg="dark" variant="dark" fixed="top">
        <Container fluid>
            <Navbar.Brand style={{cursor: "pointer"}} onClick={e=>{props.loadMain(e, null)}}>dMLW</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                <Nav>
                    <NavDropdown title="Zettel- und Wortmaterial">
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "zettel")}}>Zettel-Datenbank</NavDropdown.Item>
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "lemma")}}>Wortliste</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Verzeichnisse">
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "maiora")}}><i>opera maiora</i>-Liste</NavDropdown.Item>
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "minora")}}><i>opera minora</i>-Liste</NavDropdown.Item>
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "ressources")}}>Ressourcen</NavDropdown.Item>
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "seklit")}}>Sekundärliteratur</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Einstellungen">
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "account")}}>Konto</NavDropdown.Item>
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "server")}}>Server</NavDropdown.Item>
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "import")}}>Import</NavDropdown.Item>
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "stats")}}>Statistik</NavDropdown.Item>
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