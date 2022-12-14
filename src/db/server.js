import { Alert, Button, Row, Col, Offcanvas, Table, Form, Navbar, Container, Tabs, Tab } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import 'chart.js/auto';
import { Bar, Pie } from "react-chartjs-2";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./../arachne.js";
import { AutoComplete, SelectMenu, ToolKit, StatusButton, sleep, sqlDate } from "./../elements.js";

import { MLWImportRessource, MLWImportZettel, GeschichtsquellenImport } from "./../content/mlw.js"; // cannot lazy load these components!
import { TLLImportRessource, TLLImportZettel } from "./../content/tll.js"; // cannot lazy load these components!
import { DOMImportRessource, DOMImportZettel } from "./../content/dom.js"; // cannot lazy load these components!
let StatisticsChart;


function Statistics(props){
    const [statData, setStatData] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [zettelBox, setZettelBox] = useState([]);
    const [lemmaBox, setLemmaBox] = useState([]);
    const [ressourceBox, setRessourceBox] = useState([]);
    useEffect(()=>{
        const fetchData=async()=>{
            ({ StatisticsChart } = await import(`./../content/mlw.js`));
            const dataIn = await arachne.statistics.getAll();
            let newZettelBox = [];
            let newLemmaBox = [];
            let newRessourceBox = [];
            dataIn.forEach(d=>{
                if(d.name==="last_updated"){
                    setLastUpdated(JSON.parse(d.data));
                }else if(d.name.substring(0,6)==="zettel"){
                    newZettelBox.push(<StatisticsChart key={d.id} name={d.name} data={JSON.parse(d.data)} />);
                }else if(d.name.substring(0,5)==="lemma"){
                    newLemmaBox.push(<StatisticsChart key={d.id} name={d.name} data={JSON.parse(d.data)} />);
                }else if(d.name.substring(0,9)==="ressource"){
                    newRessourceBox.push(<StatisticsChart key={d.id} name={d.name} data={JSON.parse(d.data)} />);
                }else{
                    throw new Error("data type not found!");
                }
            });
            setZettelBox(newZettelBox);
            setLemmaBox(newLemmaBox);
            setRessourceBox(newRessourceBox);
        };
        fetchData();
    }, []);
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
            <div style={{float: "right", color: "var(--bs-gray-400"}}>{lastUpdated}</div>
        </Container>
    </>;
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
            {arachne.access("ocr_jobs")&&<Tab eventKey="o" title="ocr-Auftr??ge" style={{padding: "0 25%"}}>
                <Row className="mb-2">
                    <Col>Hier finden Sie die auf dem Server laufenden und abgeschlossenen Auftr??ge.</Col>
                </Row>
                <Row><Col>
                    <StatusButton value="neuen Zettel-Auftrag aufgeben" onClick={async ()=>{
                        const re = await arachne.exec("ocr_job");
                        if(re===200){
                            await sleep(1000);
                            this.loadOcrJobs();
                            return {status: true};
                        } else if (re===409){
                            return {status: false, error: "Es ist bereits ein Auftrag aktiv! Warten Sie, bis dieser abgeschlossen ist."}
                        } else{return {status: false, error: "Es ist ein Fehler aufgetreten."};}
                    }} />
                    <StatusButton style={{float: "right"}} value="neuen Scan-Auftrag aufgeben" onClick={async ()=>{
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
                {this.state.ocrDisplayAll?null:<Alert style={{cursor: "pointer", marginTop: "50px", textAlign: "center"}} variant="secondary" onClick={()=>{this.setState({ocrDisplayAll: true})}}>Alle Eintr??ge anzeigen.</Alert>}
            </Tab>}
            {arachne.access("faszikel")&&<Tab eventKey="d" title="Druckausgabe" style={{padding: "0 25%"}}>
                <Row className="mb-2">
                    <Col>Hier finden Sie die auf dem Server laufenden und abgeschlossenen Auftr??ge zum Erstellen der Druckausgabe.</Col>
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
            "module": "Zugriff ??ber Python-Modul",
            "editor": "Zugriff auf Lemmastrecken-Editor",
            "comment": "Zugriff auf Kommentarfunktion",
            "comment_moderator": "Kommentare moderieren",
            "faszikel": "Faszikel konvertieren",
            "ocr_jobs": "OCR-Auftr??ge aufgeben",
            "geschichtsquellen": "Zugriff auf Geschichtsquellen-Verkn??pfung",
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
                    if(window.confirm("Soll der Account wirklich gel??scht werden? Dieser Schritt kann nicht mehr r??ckg??ngig gemacht werden!")){
                        await arachne.user.delete(this.props.item.id);
                        this.props.onClose();
                        this.props.onReload();
                    }
                }}>Account l??schen</Button></Col></Row>
            </Container>
        </Offcanvas.Body></Offcanvas>;
    }
    componentDidUpdate(prevProps){
        if(prevProps.item.id!=this.props.item.id){
            this.setState({access: JSON.parse(this.props.item.access)});
        }
    }
}
function ImportOCR(props){
    const [ocrRessource, setOCRRessource] = useState();
    const [ocrRessourceId, setOCRRessourceId] = useState();
    const [fileLst, setFileLst] = useState();
    return <>
        <Row className="mb-1">
            <Col xs={3}>Ressource:</Col>
            <Col><AutoComplete  style={{width: "100%"}} value={ocrRessource?ocrRessource:""} tbl="scan_paths" placeholder="/A/..." searchCol="path" returnCol="path" onChange={async (value, id)=>{setOCRRessource(value);setOCRRessourceId(id)}} /></Col>
        </Row>
        <Row className="mb-2"><Col xs={3}></Col><Col><small className="text-danger">Achtung: Die Vorschlagsliste muss manuell aktualisiert werden.</small></Col></Row>
        <Row className="mb-4">
            <Col xs={3}>.txt-Dateien:</Col>
            <Col><Form.Group>
                <Form.Control type="file" multiple accept="text/plain" onChange={e=>{setFileLst(e.target.files)}} />
            </Form.Group></Col>
        </Row>
        <Row>
            <Col xs={3}></Col>
            <Col><StatusButton type="button" value="hochladen" onClick={async ()=>{
            if(fileLst==null){
                return {status: false, error: "Geben Sie Dateien zum Hochladen an."};
            }else if(ocrRessourceId==null){
                return {status: false, error: "W??hlen Sie einen Ordner aus."};
            }else{
                const scanLst = await arachne.scan.get({path: ocrRessource}, {select: ["id", "filename"]});
                //console.log(scanLst);
                let missLst = [];
                let saveLst = [];
                for(const file of fileLst){
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
                if(missLst.length>1){console.log(`??bersprungene Dateien: ${missLst.join(", ")}`);return {status: true, success: `Dateien wurden hochgeladen. ${missLst.length} Dateien konnten nicht zugewiesen werden (s. Konsole).`};}
                else if(missLst.length==1){console.log(`??bersprungene Dateien: ${missLst.join(", ")}`);return {status: true, success: "Dateien wurden hochgeladen. 1 Datei konnte nicht zugewiesen werden (s. Konsole)."};}
                else{return {status: true};}
            }
        }} /></Col>
        </Row>
    </>;
}
function Import(props){
    const [zettelSuccess, setZettelSuccess]=useState(null);
    const importRessource=async(editionObj, fileLst)=>{
        // create new edition
        if(editionObj.path.substring(0,1)!="/"){editionObj.path = "/"+editionObj.path}
        if(editionObj.path.substring(editionObj.path.length-1)!="/"){editionObj.path = editionObj.path+"/"}
        const newEditionId = await arachne.edition.save(editionObj);
        // upload files
        if(newEditionId>0){
            let uploadForm = new FormData();
            uploadForm.append("edition_id", newEditionId);
            uploadForm.append("path", editionObj.path);
            const fLength = fileLst.length;
            for(let i=0; i<fLength; i++){uploadForm.append("files", fileLst[i])}
            const re = await arachne.importScans(uploadForm);
            if(re.status===400){return {status: false, error: `Fehler beim Hochladen der Dateien. Eine neue Ressource mit ID ${newEditionId} wurde aber bereits erstellt.`};}
            else if(re.body.length==1){console.log(`Bereits auf dem Server und deshalb ??bersprungen: ${re.body.join(", ")}`);return {status: true, success: `Das Hochladen war erfolgreich. Eine Datei wurde ??bersprungen (s. Konsole). Eine neue Ressource mit ID ${newEditionId} wurde erstellt.`};}
            else if(re.body.length>0){console.log(`Bereits auf dem Server und deshalb ??bersprungen: ${re.body.join(", ")}`);return {status: true, success: `Das Hochladen war erfolgreich. ${re.body.length} Dateien wurden ??bersprungen (s. Konsole). Eine neue Ressource mit ID ${newEditionId} wurde erstellt.`};}
            else{return {status: true, success: `Eine neue Ressource mit ID ${newEditionId} wurde erstellt.`};}
        } else {
            return {status: false, error: "Edition konnte nicht erstellt werden. Keine Bilder wurden hochgeladen."};
        }
    };
    const importZettel=async(progress, zettelLst, zettelLetter, zettelType, editorId)=>{
        const maxItem= 100;
        let cItemCount = maxItem;
        let cUploadIndex = -1;
        let uploadGroup = [];
        // sort imgs
        let zettelFiles = Array.from(zettelLst);
        zettelFiles.sort((a, b) => {if(b.name < a.name){return 1;}else{return -1;}});

        // prepare upload groups
        for(let i=0; i<zettelFiles.length; i++){
            if(cItemCount >= maxItem){
                cItemCount = 0;
                cUploadIndex ++;
                uploadGroup.push(new FormData());
                uploadGroup[cUploadIndex].append("letter", zettelLetter);
                uploadGroup[cUploadIndex].append("type", zettelType);
                uploadGroup[cUploadIndex].append("user_id_id", editorId);
            }
            cItemCount ++;
            uploadGroup[cUploadIndex].append("files", zettelFiles[i]);
        }
        // loop through groups and upload!
        let firstId = 0;
        let lastId = 0;
        const maxLoops = uploadGroup.length;
        let currentLoop = 0;
        for(const uItem of uploadGroup){
            const r = await arachne.importZettel(uItem);
            if(firstId === 0){firstId=r[0]}
            lastId = r[1];
            currentLoop ++;
            progress(100/maxLoops*currentLoop);
        }
        setZettelSuccess([firstId, lastId]);
        return {status: true};
    };

    let importRessourceComponent = null;
    if(arachne.project_name==="mlw"){
        importRessourceComponent = <MLWImportRessource importRessource={importRessource} />;
    }else if(arachne.project_name==="tll"){
        importRessourceComponent = <TLLImportRessource importRessource={importRessource} />;
    }else if(arachne.project_name==="dom"){
        importRessourceComponent = <DOMImportRessource importRessource={importRessource} />;
    }
    let importZettelComponent = null;
    if(arachne.project_name==="mlw"){
        importZettelComponent = <MLWImportZettel importZettel={importZettel} />;
    }else if(arachne.project_name==="tll"){
        importZettelComponent = <TLLImportZettel importZettel={importZettel} />;
    }else if(arachne.project_name==="dom"){
        importZettelComponent = <DOMImportZettel importZettel={importZettel} />;
    }
    return <Container className="mainBody">
        <Tabs defaultActiveKey="r" className="mb-5">
            {arachne.access("e_edit")&&<Tab eventKey="r" title="Ressource" style={{padding: "0 25%"}}>
                            {importRessourceComponent}
                        </Tab>}
            {arachne.access("e_edit")&&<Tab eventKey="o" title="ocr-Dateien" style={{padding: "0 25%"}}>
                <ImportOCR />
            </Tab>}
            {arachne.access("z_add")&&<Tab eventKey="z" title="Zettel" style={{padding: "0 25%"}}>
                {importZettelComponent}
                {zettelSuccess&&<Row>
                    <Col><Alert variant="success" onClose={()=>{setZettelSuccess(null)}} dismissible>
                        <Alert.Heading>Hochladen erfolgreich!</Alert.Heading><p>Die neuen Zettel haben IDs zwischen <b>{zettelSuccess[0]}</b> und <b>{zettelSuccess[1]}</b>. M??chten Sie die neuen Zettel in Zettel-Datenbank <Alert.Link href="#" onClick={e=>{
                localStorage.setItem(`${arachne.project_name}_searchBox_zettel`, `[[{"id":0,"c":"id","o":">=","v":${zettelSuccess[0]}},{"id":1,"c":"id","o":"<=","v":${zettelSuccess[1]}}],1,["id"]]`);
                props.loadMain(e, "zettel");
            }}>??ffnen</Alert.Link>?</p></Alert></Col>
                </Row>}
            {arachne.project_name==="mlw"&&<Row className="mt-4"><Col>Eine Anleitung zum Hochladen der Zettel finden Sie <a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/09-HiwiHow:-Zettel-scannen-und-hochladen">hier</a>.</Col></Row>}
            </Tab>}
            {arachne.project_name==="mlw"&&arachne.access("geschichtsquellen")&&<Tab eventKey="g" title="Geschichtsquellen-Daten" style={{padding: "0 25%"}}>
            <GeschichtsquellenImport />
        </Tab>}
        </Tabs>
    </Container>;
}

export { Import, Server, Statistics };