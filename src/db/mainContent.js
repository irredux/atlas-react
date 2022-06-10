import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faSearch, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { Container, Navbar, Nav, NavDropdown, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";

import { ChangeLog } from "./../changelog.js";
import { Lemma } from "./lemma.js";
import { Opera } from "./../content/mlw_opera.js";
import { DOMOpera, Konkordanz, Etudaus, DOMRessource } from "./../content/dom.js";
import { Ressource, SekLit } from "./ressources.js";
import { Account } from "./../settings.js";
import { Import, Server, Statistics } from "./server.js"
import { Zettel } from "./zettel.js";
import { IndexBox } from "./indexbox.js";
import { arachne } from "./../arachne.js";
let MainMenuContent;

function MainBody(props){
    arachne.changeLog = dbChangeLog;
    let main = {
        null: <ChangeLog />,
        "ressources": <Ressource />, // mlw
        "stats": <Statistics />,
        "server": <Server />,
        "lemma": <Lemma PROJECT_NAME={props.PROJECT_NAME} loadMain={(e,res)=>{props.loadMain(e, res)}} />,
        "import": <Import loadMain={(e,res)=>{props.loadMain(e, res)}} />,
        "zettel": <Zettel PROJECT_NAME={props.PROJECT_NAME}  />,
        "indexbox": <IndexBox PROJECT_NAME={props.PROJECT_NAME} />,
        "account": <Account />,
        "seklit": <SekLit />, // mlw
        "maiora": <Opera listName="opera_maiora" />, // mlw
        "minora": <Opera listName="opera_minora" />, // mlw
        "konkordanz": <Konkordanz />, // dom
        "quellenverzeichnis": <DOMOpera />, // dom
        "etudaus": <Etudaus />, // dom
        "domressource": <DOMRessource />, // dom
        }
    if(props===null||props.res===null||Object.keys(main).includes(props?props.res:null)){return main[props?props.res:null]}
    else{return <div className="text-danger" style={{textAlign: "center", marginTop: "100px"}}>Unbekannter Menü-Punkt '{props.res}'.</div>}
}

function MainNavBar(props){
    const [mainMenuContentLoaded, setMainMenuContentLoaded] = useState(false);
    useEffect(()=>{
        const loadModules = async () =>{
            ({ MainMenuContent } = await import(`./../content/${props.PROJECT_NAME}.js`));
            setMainMenuContentLoaded(true);
        };
        loadModules();
    }, []);
    let dbName = "Datenbank"
    switch(props.PROJECT_NAME){
        case "mlw":
            dbName = "dMLW";
            break;
        case "dom":
            dbName = "dDOM";
            break;
        default:
            dbName = "Datenbank";
    }
    return <Navbar bg="dark" variant="dark" fixed="top">
        <Container fluid>
            <Navbar.Brand style={{cursor: "pointer"}} onClick={e=>{props.loadMain(e, null)}}>{dbName}</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                <Nav>
                    <NavDropdown title="Zettel- und Wortmaterial">
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "zettel")}}>Zettel-Datenbank</NavDropdown.Item>
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "lemma")}}>Wortliste</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown title="Verzeichnisse">
                        {mainMenuContentLoaded?<MainMenuContent loadMain={(...params)=>{props.loadMain(...params)}} />:null}
                    </NavDropdown>
                    <NavDropdown title="Einstellungen">
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "account")}}>Konto</NavDropdown.Item>
                        <NavDropdown.Item onClick={e => {props.loadMain(e, "server")}}>Server</NavDropdown.Item>
                        {arachne.project_name!="dom"&&<NavDropdown.Item onClick={e => {props.loadMain(e, "import")}}>Import</NavDropdown.Item>}
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

const dbChangeLog = [
    {
        project: "dom",
        title: "dDOM Update",
        date: "2022-06-03",
        description: <><p>Die neue Version ist online!</p></>
    },
    {
        title: "Beta 12.10",
        date: "2022-05-04",
        description: <><p>Zettel können nun aus der Zettel-Datenbank als pdf exportiert werden. Benutzen Sie das Kontextmenü <FontAwesomeIcon icon={faEllipsisV} /> in der Zettel-Datenbank (rechts unten) und wählen Sie "Suchergebnisse exportieren" aus.</p></>
    },
    {
        project: "mlw",
        title: "Beta 12.9",
        date: "2022-04-29",
        description: <><p>Kleine Verbesserung in der Darstellung der <i>opera</i>-Listen.</p></>
    },
    {
        project: "mlw",
        title: "Beta 12.8",
        date: "2022-04-14",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li>Ressourcen: "Autor/Jahr-Angabe"-Fehler bei Angabe der Serie behoben.</li>
            <li>Ressourcen: Bandinhalt-Fehler behoben.</li>
            <li>Ressourcen: Seitenverhältnis der Bilder kann verändert werden.</li>
        </ul>
        <p>Einige Fehler in den Ressourcen wurden behoben. Ins System aufgenommen <i>(falls Ressourcen zu diesen Bänden in den opera-Listen fehlen, schreiben Sie unbedingt ein Ticket!)</i>:</p>
        <ul>
            <li>MGH Poet. I</li>
            <li>MGH Poet. IV (Winterfeld)</li>
        </ul></>
    },
    {
        project: "mlw",
        title: "Beta 12.7",
        date: "2022-02-26",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li>Änderungen beim Zettel-Upload: Buchstaben U/V und I/J wurden zusammengefasst.</li>
            <li>Korrekturen bei der Zitiertitel-Suche der opera-Listen.</li>
            <li>Korrekturen beim Upload von Scan-Bildern.</li>
        </ul></>
    },
    {
        project: "mlw",
        title: "Beta 12.6",
        date: "2022-02-23",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li>Suche in opera-Listen funktioniert wieder.</li>
            <li>Korrektur bei der voreingestellten Suche.</li>
            <li>Links auf Wiki angepasst.</li>
        </ul>
        </>
    },
    {
        title: "Beta 12.5",
        date: "2022-02-18",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li>ocr-Funktionen des Servers in Modul "archimedes.py" verschoben.</li>
            <li>Darstellung der Detailansicht für Ressourcen und Sekundärliteratur überarbeitet.</li>
            <li>Neuladen der Ansicht beim Löschen von Elementen.</li>
            <li>Opera-Listen werden automatisch neu geladen, wenn die Listen auf dem Server aktualisiert wurden oder wenn Autoren oder Werke erstellt oder gelöscht wurden.</li>
            <li>Altes Benachrichtigungssystem (StatusBox) entfernt.</li>
        </ul></>
    },
    {
    title: "Beta 12.4",
        date: "2022-02-15",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li>Grösse der abgebildeten Wörter begrenzt auf digitalen und gescannten Zetteln.</li>
            <li>Wiki-Anleitung für das Hochladen der Zettel verlinkt.</li>
            <li>Zettel-Reihenfolge beim Hochladen stimmt jetzt auch mit Chrome.</li>
            <li>Veraltete Daten und Links von früherer Version entfernt.</li>
        </ul></>
    },
    {
        title: "Beta 12.3",
        date: "2022-02-14",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li>ocr-Verfahren für neue Zettel überarbeitet (s. Einstellungen &gt; Server) und automatische Typ-Erkennung aktiviert.</li>
            <li>Konto-Verwaltung überarbeitet (Löschen von Accounts jetzt möglich).</li>
        </ul></>
    },
    {
        title: "Beta 12.2",
        date: "2022-02-13",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li><Alert.Link href="https://gitlab.lrz.de/haeberlin/dmlw/-/issues/194">Issue #194</Alert.Link></li>
            <li>"Details ein-/ausblenden" unter "speichern" und "speichern&weiter" verschoben.</li>
            <li>Kleiner Fehler bei Stapelverabeitung behoben (Änderugnen wurde nicht angezeigt).</li>
            <li>Mit "X" kann die Detailansicht in der Zettel-DB geschlossen werden.</li>
            <li>Wenn ein neues Wort in der Zettel-DB erstellt wurde, wird es automatisch mit dem aktuellen Zettel verknüpft.</li>
            <li>Man kann nun aus der Stapel-Ansicht neue Wörter erstellen.</li>
            <li>Die Hilfe zum Erstellen von Wörtern wird nun auch in der Wortliste angezeigt.</li>
            <li>Import-Formulare überarbeitet und verbessert.</li>
        </ul></>
    },
    {
        title: "Beta 12.1",
        date: "2022-02-11",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li>Mit einem Klick auf den Wortansatz in der Wortliste wird die Zettel-Datenbank geöffnet und die mit diesem Wort verknüpften Zettel angezeigt.</li>
            <li>Suchfelder in Wortliste hinzugefügt: "Wörterbücher", "Kommentar", "Zahlzeichen", "im Wörterbuch (MLW)", "Stern", "Fragezeichen".</li>
            <li>Verbesserung des Fehlers mit "speichern&weiter".</li>
            <li>"Lemmaliste" in "Wortliste" umbenannt. Ebenso "Lemma" in "Wort" (usw.).</li>
            <li>Kontextmenü <FontAwesomeIcon icon={faEllipsisV} /> der opera-Listen: Alle sollen nun die Listen aktualisieren können.</li>
            <li>opera-Listen können nicht mehr von "Einstellungen"-&gt;"Server" aktualisiert werden.</li>
            <li>Die Statistiken können nur noch über das Kontextmenü <FontAwesomeIcon icon={faEllipsisV} /> unter "Einstellungen"-&gt;"Statistik" aktualisiert werden.</li>
            <li>Alle Links sollten mit CTRL/CMD+Klick in einem neuen Fenster/Tab geöffnet werden können.</li>
            <li>Dark-Mode deaktiviert (wird später wieder eingeführt).</li>
        </ul>
    </>},
    {
        title: "Beta 12.0",
        date: "2022-02-09",
        description: <><p>Neues Design und Steuerelemente mit <Alert.Link target="_blank" href="https://react-bootstrap.github.io">Bootstrap</Alert.Link>. Die Suchfunktion befindet sich links unten auf der Seite (<FontAwesomeIcon icon={faSearch} />).</p></>
    }
]
export { MainBody, MainNavBar };