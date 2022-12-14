import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faSearch, faEllipsisV, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { Container, Navbar, Nav, NavDropdown, Alert } from "react-bootstrap";
import { useEffect, useState } from "react";

import { ChangeLog } from "./../changelog.js";
import { Lemma } from "./lemma.js";
import { Opera } from "./../content/mlw_opera.js";
import { GeschichtsquellenInterface, ExternalConnectionAuthorInterface, ExternalConnectionWorkInterface } from "./../content/mlw.js";
import { DOMOpera, Konkordanz, Etudaus, DOMRessource } from "./../content/dom.js";
import { TLLRessource } from "./../content/tll.js";
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
        "stats": <Statistics PROJECT_NAME={props.PROJECT_NAME} />,
        "server": <Server />,
        "lemma": <Lemma PROJECT_NAME={props.PROJECT_NAME} loadMain={(e,res)=>{props.loadMain(e, res)}} />,
        "import": <Import loadMain={(e,res)=>{props.loadMain(e, res)}} />,
        "zettel": <Zettel PROJECT_NAME={props.PROJECT_NAME}  />,
        "indexbox": <IndexBox PROJECT_NAME={props.PROJECT_NAME} />,
        "account": <Account />,
        "seklit": <SekLit />, // mlw
        "maiora": <Opera listName="opera_maiora" />, // mlw
        "minora": <Opera listName="opera_minora" />, // mlw
        "geschichtsquellen": <GeschichtsquellenInterface />, // mlw
        "externalConnectionAuthor": <ExternalConnectionAuthorInterface />, // mlw
        "externalConnectionWork": <ExternalConnectionWorkInterface />, // mlw
        "konkordanz": <Konkordanz />, // dom
        "quellenverzeichnis": <DOMOpera />, // dom
        "etudaus": <Etudaus />, // dom
        "domressource": <DOMRessource />, // dom
        "index": <Opera listName="tll_index" />, // TLL
        "tllressource": <TLLRessource />, // TLL
        }
    if(props===null||props.res===null||Object.keys(main).includes(props?props.res:null)){return main[props?props.res:null]}
    else{return <div className="text-danger" style={{textAlign: "center", marginTop: "100px"}}>Unbekannter Men??-Punkt '{props.res}'.</div>}
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

const dbChangeLog = [
    {
        project: "tll",
        title: "Import und Ressourcen",
        date: "2022-07-12",
        description: <><p>Zettel, Ressourcen und Volltexte k??nnen importiert werden. Die Ressourcen k??nnen hinzugef??gt und verwaltet werden, sie werden im Index angezeigt. Argos ist allerdings erst begrenzt lauff??hig.</p></>
    },
    {
        project: "dom",
        title: "Import und Ressourcen",
        date: "2022-07-12",
        description: <><p>Zettel, Ressourcen und Volltexte k??nnen importiert werden. Die Ressourcen k??nnen hinzugef??gt und verwaltet werden, sie werden im Quellenverzeichnis angezeigt. Argos ist allerdings erst begrenzt lauff??hig.</p></>
    },
    {
        project: "mlw",
        title: "Geschichtsquellen",
        date: "2022-07-08",
        description: <><p>Die Geschichtsquellen-Datens??tze k??nnen nun mit den dMLW-Datens??tzen verkn??pft werden. Bereits gemachte Verkn??pfungen werden mit einem <FontAwesomeIcon icon={faCaretDown} /> in den <i>opera</i>-Listen angezeigt. In den n??chsten Wochen sollen alle Verkn??pfungen eingetragen werden.</p></>
    },
    {
        project: "tll",
        title: "Testversion",
        date: "2022-06-20",
        description: <><p>Eine erste Testversion ist online! Die Lemmaliste wurde von der <a target="_blank" href="https://publikationen.badw.de/de/thesaurus/">TLL Open Access Lemmasuche</a> ??bernommen, der Index vom <a target="_blank" href="https://thesaurus.badw.de/tll-digital/index/a.html#pJ4">TLL Open Access Index</a>.</p></>
    },
    {
        title: "Beta 12.10",
        date: "2022-06-10",
        description: <><p>Die Suchfunktion (<FontAwesomeIcon icon={faSearch} />) unterst??tzt nun regul??re Ausdr??cke: W??hlen Sie "re" als Operator aus. Weitere Hinweise finden Sie <a href="https://mariadb.com/kb/en/regular-expressions-overview/" target="_blank">hier</a>.</p></>
    },
    {
        project: "dom",
        title: "dDOM Update",
        date: "2022-06-03",
        description: <><p>Die neue Version ist online!</p></>
    },
    {
        title: "Beta 12.10",
        date: "2022-05-04",
        description: <><p>Zettel k??nnen nun aus der Zettel-Datenbank als pdf exportiert werden. Benutzen Sie das Kontextmen?? <FontAwesomeIcon icon={faEllipsisV} /> in der Zettel-Datenbank (rechts unten) und w??hlen Sie "Suchergebnisse exportieren" aus.</p></>
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
            <li>Ressourcen: Seitenverh??ltnis der Bilder kann ver??ndert werden.</li>
        </ul>
        <p>Einige Fehler in den Ressourcen wurden behoben. Ins System aufgenommen <i>(falls Ressourcen zu diesen B??nden in den opera-Listen fehlen, schreiben Sie unbedingt ein Ticket!)</i>:</p>
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
            <li>??nderungen beim Zettel-Upload: Buchstaben U/V und I/J wurden zusammengefasst.</li>
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
            <li>Darstellung der Detailansicht f??r Ressourcen und Sekund??rliteratur ??berarbeitet.</li>
            <li>Neuladen der Ansicht beim L??schen von Elementen.</li>
            <li>Opera-Listen werden automatisch neu geladen, wenn die Listen auf dem Server aktualisiert wurden oder wenn Autoren oder Werke erstellt oder gel??scht wurden.</li>
            <li>Altes Benachrichtigungssystem (StatusBox) entfernt.</li>
        </ul></>
    },
    {
    title: "Beta 12.4",
        date: "2022-02-15",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li>Gr??sse der abgebildeten W??rter begrenzt auf digitalen und gescannten Zetteln.</li>
            <li>Wiki-Anleitung f??r das Hochladen der Zettel verlinkt.</li>
            <li>Zettel-Reihenfolge beim Hochladen stimmt jetzt auch mit Chrome.</li>
            <li>Veraltete Daten und Links von fr??herer Version entfernt.</li>
        </ul></>
    },
    {
        title: "Beta 12.3",
        date: "2022-02-14",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li>ocr-Verfahren f??r neue Zettel ??berarbeitet (s. Einstellungen &gt; Server) und automatische Typ-Erkennung aktiviert.</li>
            <li>Konto-Verwaltung ??berarbeitet (L??schen von Accounts jetzt m??glich).</li>
        </ul></>
    },
    {
        title: "Beta 12.2",
        date: "2022-02-13",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li><Alert.Link href="https://gitlab.lrz.de/haeberlin/dmlw/-/issues/194">Issue #194</Alert.Link></li>
            <li>"Details ein-/ausblenden" unter "speichern" und "speichern&weiter" verschoben.</li>
            <li>Kleiner Fehler bei Stapelverabeitung behoben (??nderugnen wurde nicht angezeigt).</li>
            <li>Mit "X" kann die Detailansicht in der Zettel-DB geschlossen werden.</li>
            <li>Wenn ein neues Wort in der Zettel-DB erstellt wurde, wird es automatisch mit dem aktuellen Zettel verkn??pft.</li>
            <li>Man kann nun aus der Stapel-Ansicht neue W??rter erstellen.</li>
            <li>Die Hilfe zum Erstellen von W??rtern wird nun auch in der Wortliste angezeigt.</li>
            <li>Import-Formulare ??berarbeitet und verbessert.</li>
        </ul></>
    },
    {
        title: "Beta 12.1",
        date: "2022-02-11",
        description: <><p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
        <ul>
            <li>Mit einem Klick auf den Wortansatz in der Wortliste wird die Zettel-Datenbank ge??ffnet und die mit diesem Wort verkn??pften Zettel angezeigt.</li>
            <li>Suchfelder in Wortliste hinzugef??gt: "W??rterb??cher", "Kommentar", "Zahlzeichen", "im W??rterbuch (MLW)", "Stern", "Fragezeichen".</li>
            <li>Verbesserung des Fehlers mit "speichern&weiter".</li>
            <li>"Lemmaliste" in "Wortliste" umbenannt. Ebenso "Lemma" in "Wort" (usw.).</li>
            <li>Kontextmen?? <FontAwesomeIcon icon={faEllipsisV} /> der opera-Listen: Alle sollen nun die Listen aktualisieren k??nnen.</li>
            <li>opera-Listen k??nnen nicht mehr von "Einstellungen"-&gt;"Server" aktualisiert werden.</li>
            <li>Die Statistiken k??nnen nur noch ??ber das Kontextmen?? <FontAwesomeIcon icon={faEllipsisV} /> unter "Einstellungen"-&gt;"Statistik" aktualisiert werden.</li>
            <li>Alle Links sollten mit CTRL/CMD+Klick in einem neuen Fenster/Tab ge??ffnet werden k??nnen.</li>
            <li>Dark-Mode deaktiviert (wird sp??ter wieder eingef??hrt).</li>
        </ul>
    </>},
    {
        title: "Beta 12.0",
        date: "2022-02-09",
        description: <><p>Neues Design und Steuerelemente mit <Alert.Link target="_blank" href="https://react-bootstrap.github.io">Bootstrap</Alert.Link>. Die Suchfunktion befindet sich links unten auf der Seite (<FontAwesomeIcon icon={faSearch} />).</p></>
    }
]
export { MainBody, MainNavBar };