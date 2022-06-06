import { Alert, Button, Row, Col, Offcanvas, Table, Form, Navbar, Container, Tabs, Tab } from "react-bootstrap";
import React from "react";
import 'chart.js/auto';
import { Bar, Pie } from "react-chartjs-2";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./../arachne.js";
import { AutoComplete, SelectMenu, ToolKit, StatusButton, sleep, sqlDate } from "./../elements.js";

class Statistics extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            zettel_process: null,
            lemma_letters: null,
            ressource_work: null,
        };
    }
    render(){
        // zettel
        let zettelBox = null;
        if(this.state.zettel_process){
            let zettelCharts = [];

            // process
            const zettel_process_data = {
                labels: ["abgeschlossen", "nur Lemma", "unbearbeitet"],
                datasets: [
                  {
                    label: '# of Votes',
                    data: this.state.zettel_process,
                    backgroundColor: ['#114B79', '#347F9F', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#065A82', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            };
            
            zettelCharts.push(<div key="1" style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Bearbeitungsstand</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={zettel_process_data} /></div>);
            
            // zetteltype
            const zettel_types_data = {
                labels: ["verzetteltes Material", "Exzerpt", "Index", "Literatur", "Index (unkl. Werk)", "Notiz", "kein Typ"],
                datasets: [
                  {
                    label: '# of Votes',
                    data: this.state.zettel_types,
                    backgroundColor: ['#114B79', '#347F9F', '#8FC9D9', '#D2EFF4', '#EAF2F3', '#EFEFEF', '#FFFFFF'],
                    borderColor: ['#1B3B6F', '#065A82', '#61A4BC', '#BCEDF6', '#E8F1F2', '#EEEEEE', "#EFEFEF"],
                    borderWidth: 1,
                  },
                ],
            };
            zettelCharts.push(<div key="2" style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Typen</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={zettel_types_data} /></div>);

            // created in years
            const zettel_created_data = {
                labels: ["2020", "2021", "2022"],
                datasets: [
                    {
                        label: 'verändert',
                        data: this.state.zettel_changed,
                        backgroundColor: ['#114B79'],
                        borderColor: ['#114B79'],
                        borderWidth: 1,
                        /*fill: true,*/
                        type: 'line',
                    },
                    {
                        label: 'erstellt',
                        data: this.state.zettel_created,
                        backgroundColor: ['#347F9F'],
                        borderColor: ['#347F9F'],
                        borderWidth: 1,
                    },
                ],
            };
            zettelCharts.push(<div key="3" style={{marginBottom: "80px", width: "100%", height: "400px"}}><h4>nach Jahren</h4><Bar options={{aspectRatio: false, plugins: {legend:{display: true, position: "bottom"}}}} data={zettel_created_data} /></div>);

            // created in current year
            let zettel_current_year_labels = ["Jan.", "Feb.", "Mär.", "Apr.", "Mai", "Jun.", "Jul.", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
            zettel_current_year_labels.splice((new Date()).getMonth()+1)
            const zettel_created_current_data = {
                labels: zettel_current_year_labels,
                datasets: [
                    {
                        label: 'verändert',
                        data: this.state.zettel_changed_current,
                        backgroundColor: ['#114B79'],
                        borderColor: ['#114B79'],
                        borderWidth: 1,
                        /*fill: true,*/
                        type: 'line',
                    },
                    {
                        label: 'erstellt',
                        data: this.state.zettel_created_current,
                        backgroundColor: ['#347F9F'],
                        borderColor: ['#347F9F'],
                        borderWidth: 1,
                    },
                ],
            };
            zettelCharts.push(<div key="4" style={{marginBottom: "80px", width: "100%", height: "400px"}}><h4>in diesem Jahr</h4><Bar options={{aspectRatio: false, plugins: {legend:{display: true, position: "bottom"}}}} data={zettel_created_current_data} /></div>);
            
            zettelBox = <div>{zettelCharts}</div>;
        }

        // lemma
        let lemmaBox = null;
        if(this.state.lemma_letters){
            let lemmaCharts = [];
            // nach Buchstaben
            const lemma_letters_data = {
                labels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z"],
                datasets: [
                  {
                    label: '',
                    data: this.state.lemma_letters,
                    backgroundColor: ['#114B79', '#347F9F', '#8FC9D9', '#D2EFF4', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#065A82', '#61A4BC', '#BCEDF6', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            };
            lemmaCharts.push(<div key="1" style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Buchstaben</h4><Pie options={{plugins: {legend:{display: false, position: "bottom"}}}} data={lemma_letters_data} /></div>);

            // Filtern der Lemma nach Typ (in MLW)
            const lemma_mlw_data = {
                labels: ["relevant", "nicht relevant"],
                datasets: [
                  {
                    label: '',
                    data: this.state.lemma_mlw,
                    backgroundColor: ['#114B79', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            };
            lemmaCharts.push(<div key="2" style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Relevanz fürs Wörterbuch</h4><Pie options={{plugins: {legend:{display: true, position: "bottom"}}}} data={lemma_mlw_data} /></div>);

            lemmaBox = <div style={{display: "flex", flexWrap: "wrap"}}>{lemmaCharts}</div>;
        }
        
        // ressources
        let ressourceBox = null;
        if(this.state.ressource_work){
            let ressourceCharts = [];
            // Werke mit/ohne Ressourcen - Werk mit/ohne Edition: Nach Ressource-Typ sortieren.

            // Volltexte pro Scans
            const ressource_work_data = {
                labels: ["mit Volltext und pdf", "nur mit pdf", "ohne pdf und Volltext", "nicht in Benutzung"],
                datasets: [
                  {
                    label: '',
                    data: this.state.ressource_work,
                    backgroundColor: ['#114B79', '#347F9F', '#EAF2F3', '#FFFFFF'],
                    borderColor: ['#1B3B6F', '#065A82', '#E8F1F2', "#EFEFEF"],
                    borderWidth: 1,
                  },
                ],
            };
            ressourceCharts.push(<div key="1" style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>Werke nach Volltext und pdfs</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={ressource_work_data} /></div>);

            ressourceBox = <div style={{display: "flex", flexWrap: "wrap"}}>{ressourceCharts}</div>;
        }
        return <>
        <Navbar fixed="bottom" bg="light">
            <Container fluid>
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        {arachne.access("l_edit")&&<ToolKit menuItems={[
                                ["Statistik aktualisieren", async ()=>{
                                    if(window.confirm("Sollen die Statistik aktualisiert werden? Dieser Prozess dauert ca. 30 Sekunden.")){
                                        const reStatus = await arachne.exec("statistics_update");
                                        if(reStatus===200){
                                            this.getNumbers();
                                            return {status: true};
                                        }else{
                                            return {status: false, error: "Die Aktualisierung war nicht erfolgreich."};
                                        }
                                    }
                                }]
                            ]} />}
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <Container className="mainBody">
            <Tabs defaultActiveKey="lemma" className="mb-3">
                <Tab eventKey="lemma" title="Lemma">{lemmaBox}</Tab>
                <Tab eventKey="zettel" title="Zettel">{zettelBox}</Tab>
                <Tab eventKey="ressource" title="Werke und Ressourcen">{ressourceBox}</Tab>
            </Tabs>
            <div style={{float: "right", color: "var(--bs-gray-400"}}>{this.state.last_updated}</div>
        </Container>
    </>;
    }
    componentDidMount(){this.getNumbers()}
    async getNumbers(){
        const numbers = await arachne.statistics.getAll();
        this.setState({
            last_updated: JSON.parse(numbers.find(i => i.name === "last_updated").data),
            zettel_process: JSON.parse(numbers.find(i => i.name === "zettel_process").data),
            zettel_types: JSON.parse(numbers.find(i => i.name === "zettel_type").data),
            zettel_created: JSON.parse(numbers.find(i => i.name === "zettel_created").data),
            zettel_changed: JSON.parse(numbers.find(i => i.name === "zettel_changed").data),
            zettel_created_current: JSON.parse(numbers.find(i => i.name === "zettel_created_current").data),
            zettel_changed_current: JSON.parse(numbers.find(i => i.name === "zettel_changed_current").data),
            lemma_letters: JSON.parse(numbers.find(i => i.name === "lemma_letter").data),
            lemma_mlw: JSON.parse(numbers.find(i => i.name === "lemma_mlw").data),
            ressource_work: JSON.parse(numbers.find(i => i.name === "ressource_work").data)
        });
    }
}

class Server extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            ocrJobs: [],
            faszikelJobs: [],
            users: [],
            ocrDisplayAll: false,
        };
    }
    render(){
        let defaultActive = "";
        if(arachne.access("ocr_jobs")){defaultActive = "o"}
        else if(arachne.access("faszikel")){defaultActive = "d"}
        else if(arachne.access("admin")){defaultActive = "a"}
        return <><Container className="mainBody">
        <Tabs defaultActiveKey={defaultActive} className="mb-5">
            {arachne.access("ocr_jobs")&&<Tab eventKey="o" title="ocr-Aufträge" style={{padding: "0 25%"}}>
                <Row className="mb-2">
                    <Col>Hier finden Sie die auf dem Server laufenden und abgeschlossenen Aufträge zur ocr-Erkennung.</Col>
                </Row>
                <Row><Col>
                    <StatusButton value="neuer Zettel-Auftrag aufgeben" onClick={async ()=>{
                        const re = await arachne.exec("ocr_job");
                        if(re===200){
                            await sleep(1000);
                            this.loadOcrJobs();
                            return {status: true};
                        } else if (re===409){
                            return {status: false, error: "Es ist bereits ein Auftrag aktiv! Warten Sie, bis dieser abgeschlossen ist."}
                        } else{return {status: false, error: "Es ist ein Fehler aufgetreten."};}
                    }} />
                    <StatusButton style={{float: "right"}} value="neuer Scan-Auftrag aufgeben" onClick={async ()=>{
                        const re = await arachne.exec("ocr_job_scans");
                        if(re===200){
                            await sleep(1000);
                            this.loadOcrJobs();
                            return {status: true};
                        } else if (re===409){
                            return {status: false, error: "Es ist bereits ein Auftrag aktiv! Warten Sie, bis dieser abgeschlossen ist."}
                        } else{return {status: false, error: "Es ist ein Fehler aufgetreten."};}
                    }} />
                </Col></Row>
                <Row><Col>
                    <Table striped width="100%">
                        <thead>
                            <tr>
                                <th>Datum</th>
                                <th>Objekte</th>
                                <th>Status</th>
                                <th>Gesamtauftrag</th>
                                <th>bearbeitet</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.ocrJobs.map((row,i)=>{
                                if(this.state.ocrDisplayAll||i<12){
                                    let status=<td className="text-primary">aktiv</td>;
                                    if(row.finished===1){status=<td className="text-secondary">beendet</td>}
                                    else if(new Date()-sqlDate(row.u_date)>1800000){status=<td className="text-warning">inaktiv</td>}
                                    return <tr key={row.id}><td>{row.c_date.substring(0, 10)}</td><td>{row.source}</td>{status}<td>{row.total}</td><td>{Math.round(1000/row.total*row.count)/10}%</td></tr>;
                                }else{
                                    return null;
                                }
                                
                            })}
                        </tbody>
                    </Table>
                </Col></Row>
                {this.state.ocrDisplayAll?null:<Alert style={{cursor: "pointer", marginTop: "50px", textAlign: "center"}} variant="secondary" onClick={()=>{this.setState({ocrDisplayAll: true})}}>Alle Einträge anzeigen.</Alert>}
            </Tab>}
            {arachne.access("faszikel")&&<Tab eventKey="d" title="Druckausgabe" style={{padding: "0 25%"}}>
                <Row className="mb-2">
                    <Col>Hier finden Sie die auf dem Server laufenden und abgeschlossenen Aufträge zum Erstellen der Druckausgabe.</Col>
                </Row>
                <Row><Col>
                <Table striped width="100%">
                        <tbody>{this.state.faszikelJobs.map(faszikel => {
                            if(faszikel.log){
                                let dateArray = faszikel.date.split("")
                                dateArray[10] = " ";
                                dateArray[13] = ":";
                                dateArray[16] = ":";
                                let createdDate = dateArray.join("").substring(0, 19);
                                return <tr style={{verticalAlign: "top"}}><td style={{padding: "10px 0px"}}><b>{faszikel.name?faszikel.name.substring(0, faszikel.name.length-4):<i>Eintrag</i>}</b><br /><i className="minorTxt">{createdDate}</i></td><td>{faszikel.name?<a target="_blank" href={`/file/faszikel/${faszikel.date}/${faszikel.name}`}>pdf</a>:null}</td><td><a target="_blank" href={`/file/faszikel/${faszikel.date}/zip`}>Artikel</a></td><td><a target="_blank" href={`/file/faszikel/${faszikel.date}/log`}>log-Datei</a></td></tr>;
                            } else {
                                return <tr style={{verticalAlign: "top"}}><td style={{padding: "10px 0px"}}><b>Neuer Auftrag in Bearbeitung</b></td><td></td><td></td></tr>;
                            }
                        })}</tbody>
                </Table>
                </Col></Row>
            </Tab>}
            {arachne.access("admin")&&<Tab eventKey="a" title="Kontenverwaltung" style={{padding: "0 20%"}}>
                <Table striped width="100%">
                        <thead style={{textAlign:"left"}}><tr><th width="25%">Name</th><th width="30%">Rechte</th><th width="35%">Browser</th><th width="10%">Aktiv</th></tr></thead>
                        <tbody>
                            {this.state.users.map(u=>{return <tr key={u.id}>
                            <td><a className="text-dark" onClick={()=>{this.setState({item: u})}}>{u.first_name} {u.last_name}</a></td>
                            <td>{JSON.parse(u.access).join(", ")}</td>
                            <td>{u.agent}</td>
                            <td>{u.session_last_active&&new Date()-sqlDate(u.session_last_active)<1800000?<FontAwesomeIcon icon={faSun} color="gold" style={{fontSize: "25px", marginLeft: "20px"}} />:<FontAwesomeIcon icon={faMoon} color="silver" style={{fontSize: "20px", marginLeft: "20px"}} />}</td>
                        </tr>})}
                        </tbody>
                </Table>
            </Tab>}
        </Tabs></Container>
        {this.state.item&&<ServerAside onReload={()=>{this.loadUsers()}} onClose={()=>{this.setState({item: null})}} item={this.state.item} onUpdate={ids=>{}} />}
        </>;
    }
    componentDidMount(){
        if(arachne.access("admin")){this.loadUsers()}
        if(arachne.access("ocr_jobs")){this.loadOcrJobs()}
        if(arachne.access("faszikel")){this.loadFaszikelJobs()}
    }
    async loadFaszikelJobs(){
        this.setState({faszikelJobs: []});
        const allFaszikelJobs = await arachne.exec("get_faszikel_jobs", true);
        //allFaszikelJobs.sort((a,b)=>a.date<b.date);
        this.setState({faszikelJobs: allFaszikelJobs/*.splice(0,100)*/});
    }
    async loadOcrJobs(){
        this.setState({ocrJobs: []});
        const newOcrJobs = await arachne.ocr_jobs.getAll();
        newOcrJobs.sort((a,b)=>a.c_date<b.c_date);
        this.setState({ocrJobs: newOcrJobs});
    }
    async loadUsers(){
        this.setState({users: []});
        const newUsers = await arachne.user.getAll({order: ["last_name"]});
        this.setState({users: newUsers});
    }
}
class ServerAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {access: JSON.parse(this.props.item.access)};
    }
    render(){
        const rights = {
            "auth": "Profil aktiviert",
            "admin": "Adminrechte",
            "o_view": "Kommentarspalte (opera-Listen)",
            "o_edit": "opera-Listen bearbeiten",
            "z_add": "Zettel importieren",
            "z_edit": "Zettel bearbeiten",
            "l_edit": "Lemma-Liste bearbeiten",
            "library": "Zugriff auf Bibliothek",
            "e_edit": "Bibliothek bearbeiten",
            "setup": "Zugriff auf Datenbanksetup",
            "module": "Zugriff über Python-Modul",
            "editor": "Zugriff auf Lemmastrecken-Editor",
            "comment": "Zugriff auf Kommentarfunktion",
            "comment_moderator": "Kommentare moderieren",
            "faszikel": "Faszikel konvertieren",
            "ocr_jobs": "OCR-Aufträge aufgeben",
        };
        let rightList = [];
        for(const [right, description] of Object.entries(rights)){
            let marked = "";
            if(this.state.access.includes(right)){marked = "accessMarked"}
            rightList.push(<div key={right} style={{cursor: "pointer"}} className={marked} onClick={()=>{
                let nAccess = this.state.access;
                if(nAccess.includes(right)){
                    nAccess = nAccess.map(i => {if(i!=right){return i}});
                } else {
                    nAccess.push(right);
                }
                this.setState({access: nAccess});
            }}>{description}</div>);
        }

        return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={()=>{this.props.onClose()}}>
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>{this.props.item.first_name} {this.props.item.last_name} (ID {this.props.item.id})</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <Container>
                <Row className="mb-1">
                    <Col>Am {this.props.item.session_last_active} zuletzt online.</Col>
                </Row>
                <Row className="mb-3">
                    <Col style={{border: "1px solid var(--bs-secondary)", borderRadius: "2px", color: "var(--bs-secondary)", margin: "10px 0", padding: "10px"}}>{this.props.item.agent}</Col>
                </Row>
                <Row><Col><h4>Rechte</h4></Col></Row>
                <Row className="mb-3"><Col style={{border: "1px solid var(--bs-secondary)", borderRadius: "2px", color: "var(--bs-secondary)", margin: "10px 0", padding: "10px"}}>{rightList}</Col></Row>
                <Row><Col><StatusButton value="speichern" onClick={()=>{
                    arachne.user.save({
                        id: this.props.item.id,
                        access: JSON.stringify(this.state.access)
                    })
                    this.props.onReload();
                    return {status: true};
                }} />
                </Col><Col><Button variant="danger" onClick={async ()=>{
                    if(window.confirm("Soll der Account wirklich gelöscht werden? Dieser Schritt kann nicht mehr rückgängig gemacht werden!")){
                        await arachne.user.delete(this.props.item.id);
                        this.props.onClose();
                        this.props.onReload();
                    }
                }}>Account löschen</Button></Col></Row>
            </Container>
        </Offcanvas.Body></Offcanvas>;
    }
    componentDidUpdate(prevProps){
        if(prevProps.item.id!=this.props.item.id){
            this.setState({access: JSON.parse(this.props.item.access)});
        }
    }
}
class Import extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            tab: "res",
            workLst: [],
            pathLst: [],
            scanWork: "",
            scanWorkId: null,
            scanType: 0,
            scanEditor: null,
            scanYear: null,
            scanVolume: null,
            scanVolumeContent: null,
            scanSerie: null,
            scanLibrary: null,
            scanLocation: null,
            scanSignature: null,
            scanFiles: null,
            ocrRessource: "",
            ocrRessourceId: null,
            ocrFiles: null,
            zettelLetter: "A",
            zettelType: 0,
            zettelFiles: null,
            zettelEditors: [[arachne.me.id, arachne.me.last_name]],
            zettelEditorSelected: arachne.me.id,
            zettelSuccess: null,
        };
    }
    render(){
        return <Container className="mainBody">
            <Tabs defaultActiveKey="r" className="mb-5">
                <Tab eventKey="r" title="Ressource" style={{padding: "0 25%"}}>
                    <Row className="mb-2">
                        <Col xs={3}>Werk:</Col>
                        <Col><AutoComplete  style={{width: "100%"}} value={this.state.scanWork} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={async (value, id)=>{
                                this.setState({scanWork: value, scanWorkId: id})
                            }} /></Col>
                    </Row>
                    <Row className="mb-4">
                        <Col xs={3}>Ressource:</Col>
                        <Col><SelectMenu options={[[0, "Edition (relevant)"], [1, "Edition (veraltet)"], [2, "Handschrift"], [3, "Alter Druck (relevant)"], [4, "Alter Druck (veraltet)"], [5, "Sonstiges"]]} onChange={e=>{this.setState({scanType: parseInt(e.target.value)})}} /></Col>
                    </Row>
                    {this.state.scanType===0||this.state.scanType===1||this.state.scanType===5?[
                        <Row key="0" className="mb-2">
                            <Col xs={3}>Editor:</Col>
                            <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanEditor: e.target.value})}} /></Col>
                        </Row>,
                        <Row key="1" className="mb-2">
                            <Col xs={3}>Jahr:</Col>
                            <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanYear: e.target.value})}} /></Col>
                        </Row>,
                        <Row key="2" className="mb-2">
                            <Col xs={3}>Band:</Col>
                            <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanVolume: e.target.value})}} /></Col>
                        </Row>,
                        <Row key="3" className="mb-2">
                            <Col xs={3}>Bandinhalt:</Col>
                            <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanVolumeContent: e.target.value})}} /></Col>
                        </Row>,
                        <Row key="4" className="mb-4">
                            <Col xs={3}>Reihe:</Col>
                            <Col><SelectMenu options={[[0, ""], [1, "Migne PL"], [2, "ASBen."], [3, "ASBoll."], [4, "AnalBoll."], [5, "Mon. Boica"], [6, "Ma. Schatzverzeichnisse"], [7, "Ma. Bibliothekskataloge"]]} onChange={e=>{this.setState({scanSerie: parseInt(e.target.value)})}} /></Col>
                        </Row>,
                    ]:null}
                    {this.state.scanType===2?[
                        <Row key="5" className="mb-2">
                            <Col xs={3}>Stadt:</Col>
                            <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanLocation: e.target.value})}} /></Col>
                        </Row>,
                        <Row key="6" className="mb-2">
                            <Col xs={3}>Bibliothek:</Col>
                            <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanLibrary: e.target.value})}} /></Col>
                        </Row>,
                        <Row key="7" className="mb-4">
                            <Col xs={3}>Signatur:</Col>
                            <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanSignature: e.target.value})}} /></Col>
                        </Row>,
                    ]:null}
                    {this.state.scanType===3||this.state.scanType===4?[
                        <Row key="8" className="mb-2">
                            <Col xs={3}>Drucker:</Col>
                            <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanEditor: e.target.value})}} /></Col>
                        </Row>,
                        <Row key="9" className="mb-2">
                            <Col xs={3}>Ort:</Col>
                            <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanLocation: e.target.value})}} /></Col>
                        </Row>,
                        <Row key="10" className="mb-4">
                            <Col xs={3}>Jahr:</Col>
                            <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanYear: e.target.value})}} /></Col>
                        </Row>,
                    ]:null}
                    <Row className="mb-2">
                        <Col xs={3}>Dateipfad:</Col>
                        <Col><input type="text" style={{width: "100%"}} onChange={e=>{this.setState({scanPath: e.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-4">
                        <Col xs={3}>.png-Dateien:</Col>
                        <Col><Form.Group>
                            <Form.Control type="file" multiple accept="image/png" onChange={e=>{this.setState({scanFiles: e.target.files})}} />
                        </Form.Group></Col>
                    </Row>
                    <Row>
                        <Col xs={3}></Col>
                        <Col><StatusButton value="hochladen" onClick={async ()=>{
                    if(this.state.scanFiles==null){
                        return {status: false, error: "Geben Sie Dateien zum Hochladen an."};
                    } else if((this.state.scanType===0||this.state.scanType===1||this.state.scanType===5)&&(!this.state.scanEditor||!this.state.scanYear)){
                        return {status: false, error: "Geben Sie den Editor und das Jahr ein."};
                    } else if(this.state.scanWorkId === null){
                        return {status: false, error: "Kein gültiges Werk ausgewählt!"};
                    } else if(this.state.scanPath&&this.state.scanWorkId){
                        // create new edition
                        let nPath = this.state.scanPath;
                        if(nPath.substring(0,1)!="/"){nPath = "/"+nPath}
                        if(nPath.substring(nPath.length-1)!="/"){nPath = nPath+"/"}
                        const newEditionId = await arachne.edition.save({
                            work_id: this.state.scanWorkId,
                            ressource: this.state.scanType,
                            editor: this.state.scanEditor,
                            year: this.state.scanYear,
                            volume: this.state.scanVolume,
                            vol_cont: this.state.scanVolumeContent,
                            serie: this.state.scanSerie,
                            location: this.state.scanLocation,
                            library: this.state.scanLibrary,
                            signature: this.state.scanSignature,
                            path: nPath,
                            url: "",
                        });
                        // upload files
                        if(newEditionId>0){
                            let uploadForm = new FormData();
                            uploadForm.append("edition_id", newEditionId);
                            uploadForm.append("path", this.state.scanPath);
                            const fLength = this.state.scanFiles.length;
                            for(let i=0; i<fLength; i++){uploadForm.append("files", this.state.scanFiles[i])}
                            const re = await arachne.importScans(uploadForm);
                            if(re.status===400){return {status: false, error: `Fehler beim Hochladen der Dateien. Eine neue Ressource mit ID ${newEditionId} wurde aber bereits erstellt.`};}
                            else if(re.body.length==1){console.log(`Bereits auf dem Server und deshalb übersprungen: ${re.body.join(", ")}`);return {status: true, success: `Das Hochladen war erfolgreich. Eine Datei wurde übersprungen (s. Konsole). Eine neue Ressource mit ID ${newEditionId} wurde erstellt.`};}
                            else if(re.body.length>0){console.log(`Bereits auf dem Server und deshalb übersprungen: ${re.body.join(", ")}`);return {status: true, success: `Das Hochladen war erfolgreich. ${re.body.length} Dateien wurden übersprungen (s. Konsole). Eine neue Ressource mit ID ${newEditionId} wurde erstellt.`};}
                            else{return {status: true, success: `Eine neue Ressource mit ID ${newEditionId} wurde erstellt.`};}
                        } else {
                            return {status: false, error: "Edition konnte nicht erstellt werden. Keine Bilder wurden hochgeladen."};
                        }
                    } else{return {status: false, error: "Geben Sie einen gültigen Pfad ein!"};}                    
                }} /></Col>
                    </Row>
                </Tab>
                <Tab eventKey="o" title="ocr-Dateien" style={{padding: "0 25%"}}>
                    <Row className="mb-2">
                        <Col xs={3}>Ressource:</Col>
                        <Col><AutoComplete  style={{width: "100%"}} value={this.state.ocrRessource} tbl="scan_paths" searchCol="path" returnCol="path" onChange={async (value, id)=>{
                                this.setState({ocrRessource: value, ocrRessourceId: id})
                            }} />{/*const paths = await arachne.scan_paths.getAll({select: ["path"], order: ["path"]}); ||||||| <SelectMenu options={this.state.pathLst} onChange={async e=>{this.setState({ocrRessource: e.target.value})}} />*/}</Col>
                    </Row>
                    <Row className="mb-4">
                        <Col xs={3}>.txt-Dateien:</Col>
                        <Col><Form.Group>
                            <Form.Control type="file" multiple accept="text/plain" onChange={e=>{this.setState({ocrFiles: e.target.files})}} />
                        </Form.Group></Col>
                    </Row>
                    <Row>
                        <Col xs={3}></Col>
                        <Col><StatusButton type="button" value="hochladen" onClick={async ()=>{
                        if(this.state.ocrFiles==null){
                            return {status: false, error: "Geben Sie Dateien zum Hochladen an."};
                        }else if(this.state.ocrRessourceId==null){
                            return {status: false, error: "Wählen Sie einen Ordner aus."};
                        }else{
                            const scanLst = await arachne.scan.get({path: this.state.ocrRessource}, {select: ["id", "filename"]});
                            //console.log(scanLst);
                            let missLst = [];
                            let saveLst = [];
                            for(const file of this.state.ocrFiles){
                                const fName = file.name.substring(0,file.name.length-4);
                                const cScan = scanLst.find(i => i.filename == fName);
                                if(cScan){
                                    //console.log(cScan);
                                    const fileTxt = await file.text();
                                    saveLst.push({id: cScan.id, full_text: fileTxt});
                                } else {
                                    missLst.push(file.name);
                                }
                            }
                            if(saveLst.length>0){await arachne.scan.save(saveLst)}
                            if(missLst.length>1){console.log(`übersprungene Dateien: ${missLst.join(", ")}`);return {status: true, success: `Dateien wurden hochgeladen. ${missLst.length} Dateien konnten nicht zugewiesen werden (s. Konsole).`};}
                            else if(missLst.length==1){console.log(`übersprungene Dateien: ${missLst.join(", ")}`);return {status: true, success: "Dateien wurden hochgeladen. 1 Datei konnte nicht zugewiesen werden (s. Konsole)."};}
                            else{return {status: true};}
                        }
                    }} /></Col>
                    </Row>
                </Tab>
                <Tab eventKey="z" title="Zettel" style={{padding: "0 25%"}}>
                    <Row className="mb-2">
                        <Col xs={3}>Buchstabe:</Col>
                        <Col><SelectMenu options={[["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"], ["G", "G"], ["H", "H"], ["I", "I/J"], ["K", "K"], ["L", "L"], ["M", "M"], ["N", "N"], ["O", "O"], ["P", "P"], ["Q", "Q"], ["R", "R"], ["S", "S"], ["T", "T"], ["U", "U/V"], ["W", "W"], ["X", "X"], ["Y", "Y"], ["Z", "Z"]]} onChange={e=>{this.setState({zettelLetter: e.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={3}>erstellt von:</Col>
                        <Col><SelectMenu options={this.state.zettelEditors} onChange={e=>{this.setState({zettelEditorSelected: e.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={3}>Zettel-Typ:</Col>
                        <Col><SelectMenu options={[[0, "Index-/Exzerpt-Zettel"], [1, "verzetteltes Material"], [4, "Literatur"]]} onChange={e=>{this.setState({zettelType: e.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-4">
                        <Col xs={3}>Bilder:</Col>
                        <Col><Form.Group>
                            <Form.Control type="file" multiple accept="image/jpeg" onChange={e=>{this.setState({zettelFiles: e.target.files})}} />
                        </Form.Group></Col>
                    </Row>
                    <Row className="mb-2">
                        <Col xs={3}></Col>
                        <Col><StatusButton value="Zettel hochladen" onClick={async ()=>{
                            if(this.state.zettelFiles==null){
                                return {status: false, error: "Wählen Sie Bilder zum Hochladen aus."};
                            } else if(this.state.zettelFiles.length%2 != 0){
                                return {status: false, error: "Wählen Sie eine gerade Anzahl Bilder aus (jeweils Vorder- und Rückseiten!)."}
                            }else{
                                const maxItem= 100;
                                let cItemCount = maxItem;
                                let cUploadIndex = -1;
                                let uploadGroup = [];
                                let zettelFiles = this.state.zettelFiles;
                                //console.log(zettelFiles);
                                // sort imgs
                                zettelFiles = Array.from(zettelFiles);
                                zettelFiles.sort((a, b) => {if(b.name < a.name){return 1;}else{return -1;}});
                                //console.log(zettelFiles);

                                // prepare upload groups
                                for(let i=0; i<zettelFiles.length; i++){
                                    if(cItemCount >= maxItem){
                                        cItemCount = 0;
                                        cUploadIndex ++;
                                        uploadGroup.push(new FormData());
                                        uploadGroup[cUploadIndex].append("letter", this.state.zettelLetter);
                                        uploadGroup[cUploadIndex].append("type", this.state.zettelType);
                                        uploadGroup[cUploadIndex].append("user_id_id", this.state.zettelEditorSelected);
                                    }
                                    cItemCount ++;
                                    uploadGroup[cUploadIndex].append("files", zettelFiles[i]);
                                }
                                // loop through groups and upload!
                                let firstId = 0;
                                let lastId = 0;
                                for(const uItem of uploadGroup){
                                    const r = await arachne.importZettel(uItem);
                                    if(firstId === 0){firstId=r[0]}
                                    lastId = r[1];
                                }
                                this.setState({zettelSuccess: [firstId, lastId]});
                                return {status: true};
                            }
                        }} /></Col>
                    </Row>
                    {this.state.zettelSuccess&&<Row>
                        <Col><Alert variant="success" onClose={()=>{this.setState({zettelSuccess: null})}} dismissible>
                            <Alert.Heading>Hochladen erfolgreich!</Alert.Heading><p>Die neuen Zettel haben IDs zwischen <b>{this.state.zettelSuccess[0]}</b> und <b>{this.state.zettelSuccess[1]}</b>. Möchten Sie die neuen Zettel in Zettel-Datenbank <Alert.Link href="#" onClick={e=>{
                    localStorage.setItem("searchBox_zettel", `[[{"id":0,"c":"id","o":">=","v":${this.state.zettelSuccess[0]}},{"id":1,"c":"id","o":"<=","v":${this.state.zettelSuccess[1]}}],1,["id"]]`);
                    this.props.loadMain(e, "zettel");
                }}>öffnen</Alert.Link>?</p></Alert></Col>
                    </Row>}
                <Row className="mt-4"><Col>Eine Anleitung zum Hochladen der Zettel finden Sie <a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/09-HiwiHow:-Zettel-scannen-und-hochladen">hier</a>.</Col></Row>
                </Tab>
            </Tabs>
        </Container>;
    }
    componentDidMount(){
        /*
        const loadOptions = async () => {
            const works = await arachne.work.get({in_use: 1}, {select: ["id", "ac_web"], order: ["ac_web"]});
            let newWorkLst = [];
            for(const work of works){
                newWorkLst.push([work.id, work.ac_web]);
            }
            this.setState({workLst: newWorkLst});
            const paths = await arachne.scan_paths.getAll({select: ["path"], order: ["path"]});
            let newPathLst = [];
            for(const path of paths){
                newPathLst.push([path.path, path.path]);
            }
            this.setState({pathLst: newPathLst, ocrRessource: newPathLst[0][0]});

        }
        loadOptions();
        */

        if(arachne.access("admin")){
            arachne.user.getAll({order: ["last_name"]}).then(users=>{
                let userLst = [];
                for(const user of users){
                    userLst.push([user.id, user.last_name]);
                }
                this.setState({zettelEditors: userLst});
            }).catch(e=>{throw e});
        }
    }
}

export { Import, Server, Statistics };