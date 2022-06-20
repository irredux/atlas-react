import { parseHTML, parseHTMLPreview, SelectMenu, StatusButton, AutoComplete } from "./../elements.js";
import { arachne } from "./../arachne.js";
import { Accordion, Col, Row, Container, NavDropdown, Card, ListGroup, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import 'chart.js/auto';
import { Bar, Pie } from "react-chartjs-2";
function arachneTbls(){
    return ["project", "author", "edition", "lemma", "opera_maiora", "opera_minora", "scan", "scan_lnk", "work", "zettel", "user", "seklit", "article", "zettel_lnk", "statistics", "scan_paths", "ocr_jobs", "comment", "scan_opera", "fulltext_search_view", "tags", "tag_lnks", "sections"];
}

/* ************************************************************************************* */

function LemmaHeader(){
    return <tr><th width="30%">Wortansatz</th><th width="20%">Wörterbücher</th><th>Kommentar</th></tr>;
}
function LemmaRow(props){
    return <tr id={props.lemma.id} onDoubleClick={e=>{props.showDetail(parseInt(e.target.closest("tr").id))}}>
        <td title={"ID: "+props.lemma.id}>
            <a dangerouslySetInnerHTML={parseHTML(props.lemma.lemma_display)} onClick={e=>{
                localStorage.setItem("mlw_searchBox_zettel", `[[{"id":0,"c":"lemma_id","o":"=","v":${props.lemma.id}}],1,["id"]]`);
                props.loadMain(e);
            }}>
            </a>
        </td>
        <td dangerouslySetInnerHTML={parseHTML(props.lemma.dicts)}></td>
        <td dangerouslySetInnerHTML={parseHTML(props.lemma.comment)}></td>
    </tr>;
}

function lemmaSearchItems(){
    return [
        ["lemma", "Wort"],
        ["lemma_ac", "Wort-Anzeige"],
        ["id", "ID"],
        ["dicts", "Wörterbücher"],
        ["comment", "Kommentar"],
        ["lemma_nr", "Zahlzeichen"],
        ["MLW", "MLW"],
        ["Stern", "Stern"],
        ["Fragezeichen", "Fragezeichen"],
    ];
}

function LemmaAsideContent(props){
    const [lemma, setLemma] = useState(props.item.lemma);
    const [lemma_display, setLemma_display] = useState(props.item.lemma_display);
    const [lemma_nr, setLemma_Nr] = useState(props.item.lemma_nr);
    const [MLW, setMLW] = useState(props.item.MLW);
    const [Fragezeichen, setFragezeichen] = useState(props.item.Fragezeichen);
    const [Stern, setStern] = useState(props.item.Stern);
    const [comment, setComment] = useState(props.item.comment);
    const [dicts, setDicts] = useState(props.item.dicts);

    useEffect(()=>{
        setLemma(props.item.lemma);
        setLemma_display(props.item.lemma_display);
        setLemma_Nr(props.item.lemma_nr);
        setMLW(props.item.MLW);
        setFragezeichen(props.item.Fragezeichen);
        setStern(props.item.Stern);
        setComment(props.item.comment);
        setDicts(props.item.dicts);
    }, [props.id]);
    return <Container>
        <Row className="mb-2">
            <Col>Wort:</Col>
            <Col><input type="text" value={lemma} onChange={event=>{setLemma(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-5">
            <Col>Wort-Anzeige:</Col>
            <Col><input type="text" value={parseHTMLPreview(lemma_display)} onChange={event=>{setLemma_display(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>Zahlzeichen:</Col>
            <Col><SelectMenu options={[[0, ""], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]]} onChange={event=>{setLemma_Nr(event.target.value)}} value={lemma_nr} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>im Wörterbuch:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setMLW(event.target.value)}} value={MLW} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>Stern:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setStern(event.target.value)}} value={Stern} /></Col>
        </Row>
        <Row className="mb-5">
            <Col>Fragezeichen:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setFragezeichen(event.target.value)}} value={Fragezeichen} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>Wörterbücher:</Col>
            <Col><textarea style={{width: "210px", height: "50px"}} value={dicts?dicts.replace(/&lt;/g, "<").replace(/&gt;/g, ">"):""} onChange={event=>{setDicts(event.target.value)}}></textarea></Col>
        </Row>
        <Row className="mb-4">
            <Col>Kommentar:</Col>
            <Col><textarea style={{width: "210px", height: "150px"}} value={comment?comment.replace(/&lt;/g, "<").replace(/&gt;/g, ">"):""} onChange={event=>{setComment(event.target.value)}}></textarea></Col>
        </Row>
        <Row className="mb-4">
            <Col><small><a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/10-WikiHow:-Umlemmatisierung" target="_blank" rel="noreferrer">Hier</a> finden Sie Informationen zum Bearbeiten der Wörter.</small></Col>
        </Row>
        <Row>
            <Col>
            <StatusButton value="speichern" onClick={async ()=>{
        if(lemma===""||lemma.indexOf(" ")>-1||lemma.indexOf("*")>-1||lemma.indexOf("[")>-1){
            return {status: false, error: "Bitte ein gültiges Wort eintragen!"};
        } else if(lemma_display===""){
            return {status: false, error: "Bitte tragen Sie eine gültige Wort-Anzeige ein!"};
        } else {
            let newLemmaValue = {
                id: props.id,
                lemma: lemma,
                lemma_display: lemma_display,
                MLW: MLW,
                Fragezeichen: Fragezeichen,
                Stern: Stern,
                comment: comment,
                dicts: dicts,
                lemma_nr: lemma_nr,
            };
            const newId = await arachne.lemma.save(newLemmaValue);
            props.onUpdate(props.id);
            return {status: true};
        }
    }} />
    {arachne.access("l_edit")?<StatusButton style={{marginLeft: "10px"}} variant="danger" value="löschen" onClick={async ()=>{
        if(window.confirm("Soll das Wort gelöscht werden? Das Wort wird von allen verknüpften Zettel entfernt. Dieser Schritt kann nicht rückgängig gemacht werden!")){
            const allZettel = await arachne.zettel.get({lemma_id: props.id});
            let zettelRemoveList = [];
            for(const zettel of allZettel){
                zettelRemoveList.push({id: zettel.id, lemma_id: null});
            }
            if(zettelRemoveList.length>0){await arachne.zettel.save(zettelRemoveList);}
            await arachne.lemma.delete(props.id);
            props.onClose();
            props.onReload();
            return {status: true};
        }
    }} />:null}
            </Col>
        </Row>
    </Container>;
}

/* ************************************************************************************* */

function zettelSearchItems(){
    return [
        ["lemma", "Wort"],
        ["lemma_id", "Wort-ID"],
        ["type", "Typ"],
        ["id", "ID"],
        ["ac_web", "Werk"],
        ["date_type", "Datum-Typ"],
        ["date_own", "eigenes Sortierdatum"],
        ["date_own_display", "eigenes Anzeigedatum"],
        ["auto", "Automatisierung"],
        ["ocr_length", "Textlänge"],
        ["img_path", "Bildpfad"],
    ];
}
function ZettelCard(props){
    const zettel = props.item;
    let style = {height: arachne.options.z_height+"px", width: arachne.options.z_width+"px"};
    let box = null;
    if(zettel.img_path!=null){
        let classList = "";
        if(zettel.in_use===0){classList+="zettel_img no_use"}
        else{classList+="zettel_img in_use"}
        box =
        <div className="zettel" id={zettel.id} style={style}>
            <img alt="" style={{objectFit: "fill", borderRadius: "7px"}} className={classList} src={"/mlw"+zettel.img_path+".jpg"}></img>
            {props.showDetail?<div className="zettel_msg" dangerouslySetInnerHTML={parseHTML(zettel.date_own_display?zettel.date_own_display:zettel.date_display)}></div>:null}
            {props.showDetail?
            <div className="zettel_menu">
                <span style={{float: "left", overflow: "hidden", maxHeight: "50px", maxWidth: "250px"}} dangerouslySetInnerHTML={parseHTML(zettel.lemma_display)}></span>
                <span style={{float: "right"}} dangerouslySetInnerHTML={parseHTML(zettel.opus)}></span>
            </div>
            :null}
        </div>;
    } else {
        //style.height = "355px";
        box =
        <div className="zettel" id={zettel.id} style={style}>
            <div className="digitalZettel">
                <div className='digitalZettelLemma' dangerouslySetInnerHTML={parseHTML(zettel.lemma_display)}></div>
                <div className='digitalZettelDate' dangerouslySetInnerHTML={parseHTML(zettel.date_display)}></div>
                <div className='digitalZettelWork' dangerouslySetInnerHTML={parseHTML(zettel.opus)}></div>
                <div className='digitalZettelText' dangerouslySetInnerHTML={parseHTML(zettel.txt)}></div>
            </div>
        </div>;
    }
    return box;
}
function zettelBatchOptions(){return [[1, "Wort", "lemma_id", true],[2, "Werk", "work_id", true],[3,"Zettel-Typ", "type", false]]} // [id, description, db-col, use AutoComplete Component]; first array will trigger "add new lemma" if not in auto-complete list.
function BatchInputType(props){
    switch(props.batchType){
        case 1:
            return <AutoComplete onChange={(value, id)=>{props.setBatchValue(value);props.setBatchValueId(id)}} value={props.batchValue} tbl="lemma"  searchCol="lemma" returnCol="lemma_ac" />;
            break;
        case 2:
            return <AutoComplete  value={props.batchValue} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={(value, id)=>{props.setBatchValue(value);props.setBatchValueId(id)}} />;
            break;
        case 3:
            return <SelectMenu style={{width: "86%"}} options={[[0, "..."],[1, "verzettelt"],[2,"Exzerpt"],[3,"Index"],[4,"Literatur"], [6, "Index (unkl. Stelle)"], [7, "Notiz"]]} onChange={event=>{props.setBatchValue(event.target.value)}} />;
            break;
        default:
            return <div style={{color: "red"}}>Unbekannter Stapel-Typ!</div>;  
    }
}
function ZettelAddLemmaContent(props){
    const [newLemma, setNewLemma]=useState(props.newLemma);
    const [newLemmaDisplay, setNewLemmaDisplay]=useState(props.newLemmaDisplay);
    const [homonym, setHomonym]=useState(0);
    const [MLW, setMLW]=useState(0);
    const [Stern, setStern]=useState(0);
    const [Fragezeichen, setFragezeichen]=useState(0);
    const [errorLemma, setErrorLemma]=useState(false);
    const [errorLemmaDisplay, setErrorLemmaDisplay]=useState(false);

    useEffect(()=>{
        props.setLemmaObject({
            lemma: newLemma,
            lemma_display: newLemmaDisplay,
            lemma_nr: homonym>0?homonym:null,
            MLW: MLW,
            Fragezeichen: Fragezeichen,
            Stern: Stern,
        });
        if(newLemma==="" || newLemma.indexOf(" ")>-1||newLemma.indexOf("*")>-1||newLemma.indexOf("[")>-1){setErrorLemma(true)}
        else{setErrorLemma(false)}

        if(newLemmaDisplay===""){setErrorLemmaDisplay(true)}
        else{setErrorLemmaDisplay(false)}

        if((newLemma===""||newLemma.indexOf(" ")>-1)||newLemma.indexOf("*")>-1||newLemma.indexOf("[")>-1||newLemmaDisplay===""){props.setNewLemmaOK(false)}
        else{props.setNewLemmaOK(true)}
    },[newLemma,newLemmaDisplay,homonym,MLW,Stern,Fragezeichen]);
    return <>
        <Row className="mb-4">
            <Col><a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/10-WikiHow:-Umlemmatisierung" target="_blank" rel="noreferrer">Hier</a> finden Sie Informationen zum Erstellen neuer Wörter.</Col>
        </Row>
        <Row className="mb-2">
            <Col>Wort:</Col>
            <Col><input type="text" className={errorLemma?"invalidInput":null} value={newLemma} onChange={event=>{setNewLemma(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col>Wort-Anzeige:</Col>
            <Col><input type="text" className={errorLemmaDisplay?"invalidInput":null} value={newLemmaDisplay} onChange={event=>{setNewLemmaDisplay(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>Zahlzeichen:</Col>
            <Col><SelectMenu options={[[0, ""], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]]} onChange={event=>{setHomonym(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>im Wörterbuch:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setMLW(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>Stern:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setStern(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col>Fragezeichen:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{Fragezeichen(event.target.value)}} /></Col>
        </Row>
    </>;
}
function ZettelSingleContent(props){
    const [type, setType]=useState(props.item.type);
    const [lemmaAc, setLemmaAc]=useState(props.item.lemma_ac);
    const [lemmaId, setLemmaId]=useState(props.item.lemma_id);
    const [work, setWork]=useState(props.item.ac_web);
    const [workId, setWorkId]=useState(props.item.work_id);
    const [dateType, setDateType]=useState(props.item.date_type);
    const [dateDisplay, setDateDisplay]=useState(props.item.date_display);
    const [dateOwn, setDateOwn]=useState(props.item.date_own);
    const [dateOwnDisplay, setDateOwnDisplay]=useState(props.item.date_own_display);
    const [dateOwnError, setDateOwnError]=useState(false);
    const [dateOwnDisplayError, setDateOwnDisplayError]=useState(false);
    const [txt, setTxt]=useState(props.item.txt);
    useEffect(()=>{
        setType(props.item.type);
        setLemmaAc(props.item.lemma_ac);
        setLemmaId(props.item.lemma_id);
        setWork(props.item.ac_web);
        setWorkId(props.item.work_id);
        setDateType(props.item.date_type);
        setDateDisplay(props.item.date_display);
        setDateOwn(props.item.date_own);
        setDateOwnDisplay(props.item.date_own_display);
        setTxt(props.item.txt);
    },[props.item.id]);
    useEffect(()=>{
        if(!isNaN(dateOwn)&&dateOwn!==" "&&dateOwn!==""&&dateOwn!==null){setDateOwnError(false)}
        else{setDateOwnError(true)}
    },[dateOwn]);
    useEffect(()=>{
        if(dateOwnDisplay!==" "&&dateOwnDisplay!==""&&dateOwnDisplay!==null){setDateOwnDisplayError(false)}
        else{setDateOwnDisplayError(true)}
    },[dateOwnDisplay]);
    useEffect(()=>{
        props.setZettelObject({
            id: props.item.id,
            type: type,
            lemma_id: lemmaId>0?lemmaId:null,
            work_id: workId>0?workId:null,
            date_type: dateType,
            date_own: dateType===9?dateOwn:null,
            date_own_display: dateType===9?dateOwnDisplay:null,
            txt: txt,
        });
        if(!(dateOwnDisplay===null||dateOwnDisplay==="")&&(dateOwn===null||dateOwn==="")){
            props.setZettelObjectErr({status: 2, msg: "Sie dürfen kein Anzeigedatum speichern, ohne ein Sortierdatum anzugeben!"});
        } else if(workId>0&&dateType===9&&((dateOwn!=""&&dateOwn!=null&&!Number.isInteger(dateOwn))||((dateOwn===""||dateOwn===null)))){
            props.setZettelObjectErr({status: 1, msg: "Achtung: Dieser Zettel benötigt eine Datierung! Soll er trotzdem ohne Datierung gespeichert werden?"});
        } else if (dateType===9&&!(dateOwn===null||dateOwn==="")&&(dateOwnDisplay===null||dateOwnDisplay==="")){
            props.setZettelObjectErr({status: 2, msg: "Setzen Sie ein Anzeigedatum für den Zettel!"});
        }else{props.setZettelObjectErr(null)}
    },[txt,type,lemmaId,workId,dateType,dateOwn,dateOwnDisplay]);
    useEffect(()=>{props.setLemma(lemmaAc)},[lemmaAc]);
    return <>
        <Row className="mb-2">
            <Col xs={4}>Zetteltyp:</Col>
            <Col><SelectMenu style={{width: "100%"}} value={type?type:0} options={[[0, "..."],[1, "verzettelt"],[2,"Exzerpt"],[3,"Index"],[4,"Literatur"], [6, "Index (unkl. Werk)"], [7, "Notiz"]]} onChange={event=>{setType(parseInt(event.target.value))}} classList="onOpenSetFocus" /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>Wort:</Col>
            <Col><AutoComplete style={{width: "100%"}} onChange={(value, id)=>{setLemmaAc(value); setLemmaId(id)}} value={lemmaAc?lemmaAc:""} tbl="lemma" searchCol="lemma" returnCol="lemma_ac" /></Col>
        </Row>
        {type!==4&&type<6&&<Row className="mb-2">
            <Col xs={4}>Werk:</Col>
            <Col><AutoComplete style={{width: "100%"}}  value={work?work:""} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={async (value, id)=>{
                setWork(value);setWorkId(id);
                if(id>0){
                    const newDateType = await arachne.work.get({id: id}, {select: ["date_display", "date_type"]});
                    if(newDateType.length>0){setDateType(newDateType[0].date_type);setDateDisplay(newDateType[0].date_display)}
                }
            }} /></Col>
        </Row>}
        {type!==4&&type<6&&workId>0?<Row className="mb-2">
            <Col xs={4}>Datierung:</Col>
            <Col><span style={{width: "100%"}} dangerouslySetInnerHTML={parseHTML(dateDisplay)}></span></Col>
        </Row>:null}
        {dateType===9?<>
            <Row className="mt-4 mb-2">
                <Col><span className="minorTxt"><b>Achtung:</b> Dieser Zettel benötigt eine <a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/09-HiwiHow:-Zettel-verknüpfen#anzeigedatumsortierdatum" target="_blank" rel="noreferrer">eigene Datierung</a>.</span></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={4}>Sortierdatum:</Col>
                <Col><input className={dateOwnError?"invalidInput":null} style={{width:"100%"}} type="text" value={dateOwn?dateOwn:""} onChange={e=>{
                    setDateOwn(e.target.value===""?null:e.target.value);
                }} /></Col>
            </Row>
            <Row className="mb-4">
                <Col xs={4}>Anzeigedatum:</Col>
                <Col><input className={dateOwnDisplayError?"invalidInput":null} style={{width:"100%"}} type="text" value={dateOwnDisplay?dateOwnDisplay:""} onChange={e=>{
                    setDateOwnDisplay(e.target.value);
                }} /></Col>
            </Row>
        </>:null}
        {props.item.img_path===null&&<Row className="mb-2">
            <Col xs={4}>Text:</Col>
            <Col><textarea style={{width: "100%"}} value={txt} onChange={e=>{setTxt(e.target.value)}}></textarea></Col>
        </Row>}
    </>;
}
function newZettelObject(){return {type: 2, txt: "Neuer Zettel"}}
function exportZettelObject(){return ["img_path", "date_display", "ac_web", "lemma_display", "txt"]}
function zettelPresetOptions(){return [
    ['[{"id":2,"c":"lemma","o":"=","v":"NULL"}]', "Wortzuweisung"],
    ['[{"id": 2,"c":"type","o":"=","v":"NULL"}]', "Typzuweisung"],
    ['[{"id": 2, "c": "ac_web", "o": "=", "v": "NULL"},{"id": 3, "c": "type", "o": "!=", "v": 4},{"id": 4, "c": "type", "o": "!=", "v": 6},{"id": 5, "c": "type", "o": "!=", "v": 7}]', "Werkzuweisung"],
    ['[{"id": 2, "c": "date_type", "o": "=", "v": 9},{"id": 3, "c": "date_own", "o": "!=", "v": "NULL"},{"id": 4, "c": "type", "o": "!=", "v": 3},{"id": 5, "c": "type", "o": "!=", "v": 6},{"id": 6, "c": "type", "o": "!=", "v": 7}]', "Datumszuweisung"],
]}
function zettelSortOptions(){return [['["id"]', "ID"], ['["lemma","lemma_nr","date_sort","date_type"]', "Datum"], ['["ocr_length"]', "Textlänge"]]}

/* ************************************************************************************* */

function MainMenuContent(props){
    return <>
        <NavDropdown.Item onClick={e => {props.loadMain(e, "maiora")}}><i>opera maiora</i>-Liste</NavDropdown.Item>
        <NavDropdown.Item onClick={e => {props.loadMain(e, "minora")}}><i>opera minora</i>-Liste</NavDropdown.Item>
        <NavDropdown.Item onClick={e => {props.loadMain(e, "seklit")}}>Sekundärliteratur</NavDropdown.Item>
        <NavDropdown.Item onClick={e => {props.loadMain(e, "ressources")}}>Ressourcen</NavDropdown.Item>
    </>;
}

/* ************************************************************************************* */

const fetchIndexBoxData=async()=>{
    let wl = await arachne.lemma.getAll({select: ["id", "lemma", "lemma_display"], order: ["lemma"]})
    wl=wl.map(w=>{return {id: w.id, lemma_display: w.lemma_display, lemma: w.lemma.toLowerCase()}})
    return wl;
}
function Zettel(props){
    const [verso, setVerso] = useState("");
    const [editions, setEditons] = useState([]);
    useEffect(()=>{
        const fetchData=async()=>{
            if(props.z.work_id>0){
                const newEditions = await arachne.edition.get({work_id: props.z.work_id}, {select: ["id", "label", "url"]});
                let editionsLst = [];
                for(const e of newEditions){
                    editionsLst.push(<ListGroup.Item key={e.id}><a href={e.url===""?`/site/argos/${e.id}`:e.url} target="_blank" rel="noreferrer">{e.label}</a></ListGroup.Item>);
                }
                setEditons(editionsLst)
            }
        };
        fetchData();
    }, []);
    return <Card style={{width: "30rem"}} className="mb-3">
        <FontAwesomeIcon style={{position: "absolute", top: "12px", right: "10px"}} onClick={()=>{if(verso===""){setVerso("v")}else{setVerso("")}}} icon={faSync} />
        <Card.Header style={{height: "41px"}} dangerouslySetInnerHTML={parseHTML(props.z.opus)}></Card.Header>
        <Card.Img variant="bottom" src={`${arachne.url}/mlw${props.z.img_path}${verso}.jpg`} />
        <Card.Body>
            <Card.Text><ListGroup horizontal>{editions}</ListGroup></Card.Text>
        </Card.Body>
    </Card>;
}
function IndexBoxDetail(props){
    const [lemma, setLemma] = useState(null);
    const [vZettels, setVZettels] = useState(null);
    const [eZettels, setEZettels] = useState(null);
    const [iZettels, setIZettels] = useState(null);
    const [rZettels, setRZettels] = useState(null);
    const [timeLineData, setTimeLineData] = useState([]);
    useEffect(()=>{
        const fetchData=async()=>{
            setLemma(null);
            setVZettels(null);
            setEZettels(null);
            setIZettels(null);
            setRZettels(null);
            const newLemma = await arachne.lemma.get({id: props.lemma_id});
            setLemma(newLemma[0]);
            const nVZettel = await arachne.zettel.get({lemma_id: props.lemma_id, type: 1}, {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id", "date_sort", "date_own"]});
            setVZettels(nVZettel);
            const nEZettel = await arachne.zettel.get({lemma_id: props.lemma_id, type: 2}, {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id", "date_sort", "date_own"]});
            setEZettels(nEZettel);
            const nIZettel = await arachne.zettel.search([{c: "lemma_id", o: "=", v: props.lemma_id}, {c: "type", o: ">=", v: "3"}, {c: "type", o: "<=", v: "6"}, {c: "type", o: "!=", v: "4"}], {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id", "date_sort", "date_own"]})
            setIZettels(nIZettel);
            setTimeLineData(nVZettel.concat(nEZettel.concat(nIZettel)))
            setRZettels(await arachne.zettel.search([{c: "lemma_id", o: "=", v: props.lemma_id}, {c: "type", o: ">=", v: "4"}, {c: "type", o: "!=", v: "6"}], {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id"]}));
        };
        fetchData();
    }, [props.lemma_id])
    return (lemma?<>
        <h1 dangerouslySetInnerHTML={parseHTML(lemma.lemma_display)}></h1>
        <Container>
            {lemma.dicts&&<Row>
                <Col xs={2}>Wörterbücher:</Col>
                <Col dangerouslySetInnerHTML={parseHTML(lemma.dicts)}></Col>
            </Row>}
            {lemma.comment&&<Row className="mb-4">
                <Col xs={2}>Kommentar:</Col>
                <Col dangerouslySetInnerHTML={parseHTML(lemma.comment)}></Col>
            </Row>}
            <Row>
                <Col>
                    <Accordion defaultActiveKey="">
                    <Accordion.Item eventKey="s">
                        <Accordion.Header>Statistik</Accordion.Header>
                        <Accordion.Body>
                            <div style={{width: "70%", margin: "auto"}}>
                                <Bar options={{aspectRatio: false, plugins: {legend:{display: true, position: "bottom"}}}} data={{
                                    labels: ["6. Jh.","7. Jh.","8. Jh.","9. Jh.","10. Jh.","11. Jh.","12. Jh.","13. Jh.",],
                                    datasets: [
                                        {
                                            label: 'Anzahl Zettel',
                                            data: [
                                                timeLineData.filter(t=>t.date_sort<600).length,
                                                timeLineData.filter(t=>t.date_sort>599&&t.date_sort<700).length,
                                                timeLineData.filter(t=>t.date_sort>699&&t.date_sort<800).length,
                                                timeLineData.filter(t=>t.date_sort>799&&t.date_sort<900).length,
                                                timeLineData.filter(t=>t.date_sort>899&&t.date_sort<1000).length,
                                                timeLineData.filter(t=>t.date_sort>999&&t.date_sort<1100).length,
                                                timeLineData.filter(t=>t.date_sort>1099&&t.date_sort<1200).length,
                                                timeLineData.filter(t=>t.date_sort>1199).length,
                                            ],
                                            backgroundColor: ['#347F9F'],
                                            borderColor: ['#347F9F'],
                                            borderWidth: 1,
                                        },
                                    ],
                                }} />
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="v">
                        <Accordion.Header>verzetteltes Material&nbsp;{vZettels?<span>({vZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{vZettels?vZettels.map(z=>{return <Zettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="e">
                        <Accordion.Header>Exzerpt-Zettel&nbsp;{eZettels?<span>({eZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{eZettels?eZettels.map(z=>{return <Zettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="i">
                        <Accordion.Header>Index-Zettel&nbsp;{iZettels?<span>({iZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{iZettels?iZettels.map(z=>{return <Zettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="r">
                        <Accordion.Header>restliche Zettel&nbsp;{rZettels?<span>({rZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{rZettels?rZettels.map(z=>{return <Zettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                </Col>
            </Row>
        </Container>
    </>:null);
}

/* ************************************************************************************* */

function StatisticsChart(props){
    let returnChart = null;
    switch(props.name){
        case "zettel_process":
            returnChart=<div style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Bearbeitungsstand</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={{
                    labels: ["abgeschlossen", "nur Lemma", "unbearbeitet"],
                    datasets: [
                      {
                        label: '# of Votes',
                        data: props.data,
                        backgroundColor: ['#114B79', '#347F9F', '#EAF2F3'],
                        borderColor: ['#1B3B6F', '#065A82', '#E8F1F2'],
                        borderWidth: 1,
                      },
                    ],
                }} /></div>;
            break;
        case "zettel_type":
            returnChart=<div style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Typen</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={{
                    labels: ["verzetteltes Material", "Exzerpt", "Index", "Literatur", "Index (unkl. Werk)", "Notiz", "kein Typ"],
                    datasets: [
                      {
                        label: '# of Votes',
                        data: props.data,
                        backgroundColor: ['#114B79', '#347F9F', '#8FC9D9', '#D2EFF4', '#EAF2F3', '#EFEFEF', '#FFFFFF'],
                        borderColor: ['#1B3B6F', '#065A82', '#61A4BC', '#BCEDF6', '#E8F1F2', '#EEEEEE', "#EFEFEF"],
                        borderWidth: 1,
                      },
                    ],
                }} /></div>;
            break;
        case "zettel_created_changed":
            returnChart=<div style={{marginBottom: "80px", width: "100%", height: "400px"}}><h4>nach Jahren</h4><Bar options={{aspectRatio: false, plugins: {legend:{display: true, position: "bottom"}}}} data={{
                labels: ["2020", "2021", "2022"],
                datasets: [
                    {
                        label: 'verändert',
                        data: props.data[1],
                        backgroundColor: ['#114B79'],
                        borderColor: ['#114B79'],
                        borderWidth: 1,
                        //fill: true,
                        type: 'line',
                    },
                    {
                        label: 'erstellt',
                        data: props.data[0],
                        backgroundColor: ['#347F9F'],
                        borderColor: ['#347F9F'],
                        borderWidth: 1,
                    },
                ],
            }} /></div>;
            break;
        case "zettel_created_changed_current":
            returnChart=<div style={{marginBottom: "80px", width: "100%", height: "400px"}}><h4>in diesem Jahr</h4><Bar options={{aspectRatio: false, plugins: {legend:{display: true, position: "bottom"}}}} data={{
                labels: ["Jan.", "Feb.", "Mär.", "Apr.", "Mai", "Jun.", "Jul.", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."].slice(0,(new Date()).getMonth()+1),
                datasets: [
                    {
                        label: 'verändert',
                        data: props.data[1],
                        backgroundColor: ['#114B79'],
                        borderColor: ['#114B79'],
                        borderWidth: 1,
                        //fill: true,
                        type: 'line',
                    },
                    {
                        label: 'erstellt',
                        data: props.data[0],
                        backgroundColor: ['#347F9F'],
                        borderColor: ['#347F9F'],
                        borderWidth: 1,
                    },
                ],
            }} /></div>;
            break;
        case "zettel_letter":
            returnChart=<div style={{marginBottom: "80px", width: "100%", height: "400px"}}><h4>nach Buchstaben</h4><Bar options={{
                aspectRatio: false,
                plugins: {legend:{display: true, position: "bottom"}},
                scales: {x: {stacked: true}, y: {stacked: true}}
            }}
            data={{
                labels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "W", "X", "Y", "Z"],
                datasets: [
                    {
                        label: 'Anzahl verzetteltes Material',
                        data: props.data[0],
                        backgroundColor: ['#347F9F'],
                        borderColor: ['#347F9F'],
                        borderWidth: 1,
                    },
                    {
                        label: 'Anzahl Exzerpt-Zettel',
                        data: props.data[1],
                        backgroundColor: ['#8FC9D9'],
                        borderColor: ['#8FC9D9'],
                        borderWidth: 1,
                    },
                    {
                        label: 'Anzahl Index-Zettel',
                        data: props.data[2],
                        backgroundColor: ['#D2EFF4'],
                        borderColor: ['#D2EFF4'],
                        borderWidth: 1,
                    },
                    {
                        label: 'Anzahl restlicher Zettel',
                        data: props.data[3],
                        backgroundColor: ['#EAF2F3'],
                        borderColor: ['#EAF2F3'],
                        borderWidth: 1,
                    },
                ],
            }} /></div>;
            break;
        case "lemma_letter":
            returnChart=<div style={{marginBottom: "80px", margin: "auto", width: "70%", height: "600px"}}><h4>nach Buchstaben</h4><Bar options={{plugins: {legend:{display: false, position: "bottom"}}}} data={{
                labels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z"],
                datasets: [
                  {
                    label: '',
                    data: props.data,
                    backgroundColor: ['#114B79', '#347F9F', '#8FC9D9', '#D2EFF4', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#065A82', '#61A4BC', '#BCEDF6', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            }} /></div>;
            break;
        case "lemma_mlw":
            returnChart=<div style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Relevanz fürs Wörterbuch</h4><Pie options={{plugins: {legend:{display: true, position: "bottom"}}}} data={{
                labels: ["relevant", "nicht relevant"],
                datasets: [
                  {
                    label: '',
                    data: props.data,
                    backgroundColor: ['#114B79', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            }} /></div>;
            break;
        case "ressource_work":
            returnChart=<div style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>Werke nach Volltext und pdfs</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={{
                labels: ["mit Volltext und pdf", "nur mit pdf", "ohne pdf und Volltext", "nicht in Benutzung"],
                datasets: [
                  {
                    label: '',
                    data: props.data,
                    backgroundColor: ['#114B79', '#347F9F', '#EAF2F3', '#FFFFFF'],
                    borderColor: ['#1B3B6F', '#065A82', '#E8F1F2', "#EFEFEF"],
                    borderWidth: 1,
                  },
                ],
            }} /></div>;
            break;
        case "ressource_scans":
            returnChart=<div style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>Scan-Seiten und Volltexte</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={{
                labels: ["geprüfter Volltext", "automatischer Volltext", "ohne Volltext", "kein lat. Text"],
                datasets: [
                  {
                    label: '',
                    data: props.data,
                    backgroundColor: ['#114B79', '#347F9F', '#EAF2F3', '#FFFFFF'],
                    borderColor: ['#1B3B6F', '#065A82', '#E8F1F2', "#EFEFEF"],
                    borderWidth: 1,
                  },
                ],
            }} /></div>;
            break;
        default:
            console.log(props.name);
            //throw new Error("Statistic Name not found!");
    }
    return returnChart;
}
export {
    arachneTbls,
    LemmaRow, LemmaHeader, lemmaSearchItems, LemmaAsideContent,
    zettelSearchItems, ZettelCard, zettelBatchOptions, BatchInputType, ZettelAddLemmaContent, ZettelSingleContent, newZettelObject, exportZettelObject, zettelPresetOptions, zettelSortOptions,
    MainMenuContent,
    fetchIndexBoxData, IndexBoxDetail,
    StatisticsChart,
}