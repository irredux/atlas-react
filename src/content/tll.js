import { parseHTML, parseHTMLPreview, SelectMenu, StatusButton, AutoComplete, TableView } from "./../elements.js";
import { arachne } from "./../arachne.js";
import { Accordion, Form, Col, Row, Container, NavDropdown, Card, ListGroup, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import 'chart.js/auto';
import { Bar, Pie } from "react-chartjs-2";
function arachneTbls(){
    return ["project", "auctores", "edition", "lemma", "tll_index", "scan", "scan_lnk", "opera", "opera_ac", "loci", "loci_ac", "zettel", "user", "seklit", "article", "zettel_lnk", "statistics", "scan_paths", "ocr_jobs", "comment", "scan_opera", "fulltext_search_view", "tags", "tag_lnks", "sections"];
}
/* ************************************************************************************* */
function LemmaHeader(){
    return <tr><th width="30%">Wortansatz</th><th width="20%">TLL</th></tr>;
}
function LemmaRow(props){
    return <tr id={props.lemma.id} onDoubleClick={e=>{props.showDetail(parseInt(e.target.closest("tr").id))}}>
        <td title={"ID: "+props.lemma.id}>
            <a dangerouslySetInnerHTML={parseHTML(props.lemma.lemma_display)} onClick={e=>{
                localStorage.setItem("tll_searchBox_zettel", `[[{"id":0,"c":"lemma_id","o":"=","v":${props.lemma.id}}],1,["id"]]`);
                props.loadMain(e);
            }}>
            </a>
        </td>
        <td><a href={`https://publikationen.badw.de/de/thesaurus/${props.lemma.link_img}`} target="_blank">{props.lemma.link_name}</a></td>
    </tr>;
}
function lemmaSearchItems(){
    return [
        ["lemma", "Wort"],
        ["lemma_display", "Wort-Anzeige"],
        ["id", "ID"],
        ["hom_nr", "Homonym-Nr"],
        ["sub", "Sublemma"],
        ["addenda", "Addenda"],
        ["search", "alt. Schreibewise"],
    ];
}
function LemmaAsideContent(props){
    const [lemma, setLemma] = useState(props.item.lemma);
    const [lemma_display, setLemma_display] = useState(props.item.lemma_display);
    const [lemma_nr, setLemma_Nr] = useState(props.item.lemma_nr);
    const [sub, setSub] = useState(props.item.sub);
    const [addenda, setAddenda] = useState(props.item.addenda);
    const [search, setSearch] = useState(props.item.search);
    const [link_name, setLink_name] = useState(props.item.link_name);
    const [link_img, setLink_img] = useState(props.item.link_img);
    const [comment, setComment] = useState(props.item.comment);

    useEffect(()=>{
        setLemma(props.item.lemma);
        setLemma_display(props.item.lemma_display);
        setLemma_Nr(props.item.lemma_nr);
        setSub(props.item.sub);
        setAddenda(props.item.addenda);
        setSearch(props.item.search);
        setLink_name(props.item.link_name);
        setLink_img(props.item.link_img);
        setComment(props.item.comment);
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
            <Col><SelectMenu options={[[0, ""], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7]]} onChange={event=>{setLemma_Nr(event.target.value)}} value={lemma_nr} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>Sublemma:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setSub(event.target.value)}} value={sub} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>Addenda:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setAddenda(event.target.value)}} value={addenda} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>alt. Schreib-weise:</Col>
            <Col><input type="text" value={search} onChange={event=>{setSearch(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>pdf-Linkname:</Col>
            <Col><input type="text" value={link_name} onChange={event=>{setLink_name(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>pdf-Bildname:</Col>
            <Col><input type="text" value={link_img} onChange={event=>{setLink_img(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col>Kommentar:</Col>
            <Col><textarea style={{width: "210px", height: "150px"}} value={comment?comment.replace(/&lt;/g, "<").replace(/&gt;/g, ">"):""} onChange={event=>{setComment(event.target.value)}}></textarea></Col>
        </Row>
        <Row>
            <Col>
            <StatusButton value="speichern" onClick={async ()=>{
        if(lemma===""||lemma.indexOf(" ")>-1||lemma.indexOf("*")>-1||lemma.indexOf("[")>-1){
            return {status: false, error: "Bitte tragen Sie ein g??ltiges Wort ein!"};
        } else if(lemma_display===""){
            return {status: false, error: "Bitte tragen Sie eine g??ltige Wort-Anzeige ein!"};
        } else {
            let newLemmaValue = {
                id: props.id,
                lemma: lemma,
                lemma_display: lemma_display,
                hom_nr: lemma_nr,
                sub: sub,
                addenda: addenda,
                search: search,
                link_name: link_name,
                link_img, link_img,
                comment: comment,
            };
            const newId = await arachne.lemma.save(newLemmaValue);
            props.onUpdate(props.id);
            return {status: true};
        }
    }} />
    {arachne.access("l_edit")?<StatusButton style={{marginLeft: "10px"}} variant="danger" value="l??schen" onClick={async ()=>{
        if(window.confirm("Soll das Wort gel??scht werden? Das Wort wird von allen verkn??pften Zettel entfernt. Dieser Schritt kann nicht r??ckg??ngig gemacht werden!")){
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
        ["ocr_length", "Textl??nge"],
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
            <img alt="" style={{objectFit: "fill", borderRadius: "7px"}} className={classList} src={"/tll"+zettel.img_path+".jpg"}></img>
            {props.showDetail?<div className="zettel_msg" dangerouslySetInnerHTML={parseHTML(zettel.date_own_display?zettel.date_own_display:zettel.date_display)}></div>:null}
            {props.showDetail?
            <div className="zettel_menu">
                <span style={{float: "left", overflow: "hidden", maxHeight: "50px", maxWidth: "250px"}} dangerouslySetInnerHTML={parseHTML(zettel.lemma_display)}></span>
                <span style={{float: "right"}} dangerouslySetInnerHTML={parseHTML(zettel.ac_web)}></span>
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
                <div className='digitalZettelWork' dangerouslySetInnerHTML={parseHTML(zettel.ac_web)}></div>
                <div className='digitalZettelText' dangerouslySetInnerHTML={parseHTML(zettel.txt)}></div>
            </div>
        </div>;
    }
    return box;
}
function zettelBatchOptions(){return [[1, "Wort", "lemma_id", true],[2, "Opus", "opus_id", true],[3,"Zettel-Typ", "type", false]]} // [id, description, db-col, use AutoComplete Component]; first array will trigger "add new lemma" if not in auto-complete list.
function BatchInputType(props){
    switch(props.batchType){
        case 1:
            return <AutoComplete onChange={(value, id)=>{props.setBatchValue(value);props.setBatchValueId(id)}} value={props.batchValue} tbl="lemma"  searchCol="lemma" returnCol="lemma_display" />;
            break;
        case 2:
            return <AutoComplete  value={props.batchValue} tbl="opera_ac" searchCol="ac_web" returnCol="ac_web" onChange={(value, id)=>{props.setBatchValue(value);props.setBatchValueId(id)}} />;
            break;
        case 3:
            return <SelectMenu style={{width: "86%"}} options={[[1, "Perikopenzettel"], [2, "Exzerptzettel"], [3, "Lexikonzettel"], [4, "Indexzettel"], [5, "Literaturzettel"]]} onChange={event=>{props.setBatchValue(event.target.value)}} />;
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
            <Col><a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/10-WikiHow:-Umlemmatisierung" target="_blank" rel="noreferrer">Hier</a> finden Sie Informationen zum Erstellen neuer W??rter.</Col>
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
            <Col>im W??rterbuch:</Col>
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
    const [lemmaAc, setLemmaAc]=useState(props.item.lemma_display);
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
        setLemmaAc(props.item.lemma_display);
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
            opus_id: workId>0?workId:null,
            date_type: dateType,
            date_own: dateType===9?dateOwn:null,
            date_own_display: dateType===9?dateOwnDisplay:null,
            txt: txt,
        });
        if(!(dateOwnDisplay===null||dateOwnDisplay==="")&&(dateOwn===null||dateOwn==="")){
            props.setZettelObjectErr({status: 2, msg: "Sie d??rfen kein Anzeigedatum speichern, ohne ein Sortierdatum anzugeben!"});
        } else if(workId>0&&dateType===9&&((dateOwn!=""&&dateOwn!=null&&!Number.isInteger(dateOwn))||((dateOwn===""||dateOwn===null)))){
            props.setZettelObjectErr({status: 1, msg: "Achtung: Dieser Zettel ben??tigt eine Datierung! Soll er trotzdem ohne Datierung gespeichert werden?"});
        } else if (dateType===9&&!(dateOwn===null||dateOwn==="")&&(dateOwnDisplay===null||dateOwnDisplay==="")){
            props.setZettelObjectErr({status: 2, msg: "Setzen Sie ein Anzeigedatum f??r den Zettel!"});
        }else{props.setZettelObjectErr(null)}
    },[txt,type,lemmaId,workId,dateType,dateOwn,dateOwnDisplay]);
    useEffect(()=>{props.setLemma(lemmaAc)},[lemmaAc]);
    return <>
        <Row className="mb-2">
            <Col xs={4}>Zetteltyp:</Col>
            <Col><SelectMenu style={{width: "100%"}} value={type?type:0} options={[[0, "..."],[1, "Perikopenzettel"], [2, "Exzerptzettel"], [3, "Lexikonzettel"], [4, "Indexzettel"], [5, "Literaturzettel"],]} onChange={event=>{setType(parseInt(event.target.value))}} classList="onOpenSetFocus" /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>Wort:</Col>
            <Col><AutoComplete style={{width: "100%"}} onChange={(value, id)=>{setLemmaAc(value); setLemmaId(id)}} value={lemmaAc?lemmaAc:""} tbl="lemma" searchCol="lemma" returnCol="lemma_display" /></Col>
        </Row>
        {type!==4&&type<6&&<Row className="mb-2">
            <Col xs={4}>Werk:</Col>
            <Col><AutoComplete style={{width: "100%"}}  value={work?work:""} tbl="opera_ac" searchCol="ac_web" returnCol="ac_web" onChange={async (value, id)=>{
                setWork(value);setWorkId(id);
                if(id>0){
                    const newDateType = await arachne.opera.get({id: id}, {select: ["date_display", "date_type"]});
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
                <Col><span className="minorTxt"><b>Achtung:</b> Dieser Zettel ben??tigt eine <a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/09-HiwiHow:-Zettel-verkn??pfen#anzeigedatumsortierdatum" target="_blank" rel="noreferrer">eigene Datierung</a>.</span></Col>
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
function zettelSortOptions(){return [['["id"]', "ID"], ['["lemma","lemma_nr","date_sort","date_type"]', "Datum"], ['["ocr_length"]', "Textl??nge"]]}
/* ************************************************************************************* */
function MainMenuContent(props){
    return <>
        <NavDropdown.Item onClick={e => {props.loadMain(e, "index")}}>Index</NavDropdown.Item>
        <NavDropdown.Item onClick={e => {props.loadMain(e, "tllressource")}}>Ressourcen</NavDropdown.Item>
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
                <Col xs={2}>W??rterb??cher:</Col>
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
function TLLRessource(props){
    const menuItems = [
        ["neuer Eintrag", async(that)=>{
            if(window.confirm("Soll ein neuer Eintrag erstellt werden?")){
                const newId = await arachne.edition.save({editor: "EditorIn", year: 2022});
                that.setState({newItemCreated: [{id: 0, c: "id", o: "=", v:newId}]});
            }
        }]
    ];
    const tblRow=(props)=>{
        return <><td title={"ID: "+props.cEl.id}>{props.cEl.editor} {props.cEl.year}</td><td>{props.cEl.ac_web}</td></>;
    };
    const asideContent = [ // caption; type: t(ext-input), (text)a(rea), (auto)c(omplete); col names as array
        {caption: "EditorIn", type: "text", col: "editor"},
        {caption: "Jahr", type: "text", col: "year"},
        {caption: <i>opus</i>, type: "auto", col: ["ac_web", "opus_id"], search: {tbl: "opera_ac", sCol: "ac_web", rCol: "ac_web"}},
        {caption: <span>URL <small>(extern)</small></span>, type: "text", col: "url"},
        {caption: <span>Pfad <small>(auf dem Server)</small></span>, type: "text", col: "path"},
        {caption: "Kommentar", type: "area", col: "comment"},
        {caption: "Seiten-verh??ltnis", type: "text", col: "aspect_ratio"},
    ];
    return <TableView
        tblName="edition"
        searchOptions={[["id", "ID"], ["editor", "EditorIn"], ["year", "Jahr"]]}
        sortOptions={[['["id"]', "ID"]]}
        menuItems={menuItems}
        tblRow={tblRow}
        tblHeader={<><th>K??rzel</th><th><i>opus</i></th></>}
        asideContent={asideContent}
    />;
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
                        label: 'ver??ndert',
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
                labels: ["Jan.", "Feb.", "M??r.", "Apr.", "Mai", "Jun.", "Jul.", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."].slice(0,(new Date()).getMonth()+1),
                datasets: [
                    {
                        label: 'ver??ndert',
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
            returnChart=<div style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Relevanz f??rs W??rterbuch</h4><Pie options={{plugins: {legend:{display: true, position: "bottom"}}}} data={{
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
                labels: ["gepr??fter Volltext", "automatischer Volltext", "ohne Volltext", "kein lat. Text"],
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
/* ************************************************************************************* */
function TLLImportRessource(props){
    const [scanWork, setScanWork] = useState();
    const [scanId, setScanId] = useState();
    const [scanEditor, setScanEditor] = useState();
    const [scanYear, setScanYear] = useState();
    const [scanPath, setScanPath] = useState();
    const [scanFiles, setScanFiles] = useState();
    return <>
        <Row className="mb-2">
            <Col xs={3}>Opus:</Col>
            <Col><AutoComplete  style={{width: "100%"}} value={scanWork?scanWork:""} tbl="opera_ac" searchCol="ac_web" returnCol="ac_web" onChange={async (value, id)=>{setScanWork(value);setScanId(id)}} /></Col>
        </Row>
        <Row key="0" className="mb-2">
            <Col xs={3}>Editor:</Col>
            <Col><input type="text" style={{width: "100%"}} value={scanEditor?scanEditor:""} onChange={e=>{setScanEditor(e.target.value)}} /></Col>
        </Row>
        <Row key="1" className="mb-2">
            <Col xs={3}>Jahr:</Col>
            <Col><input type="text" style={{width: "100%"}} value={scanYear?scanYear:""} onChange={e=>{setScanYear(e.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={3}>Dateipfad:</Col>
            <Col><input type="text" style={{width: "100%"}} value={scanPath?scanPath:""} placeholder="/A/ABLAB. epigr./" onChange={e=>{setScanPath(e.target.value)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col xs={3}>.png-Dateien:</Col>
            <Col><Form.Group>
                <Form.Control type="file" multiple accept="image/png" onChange={e=>{setScanFiles(e.target.files)}} />
            </Form.Group></Col>
        </Row>
        <Row>
            <Col xs={3}></Col>
            <Col><StatusButton value="hochladen" onClick={async ()=>{
                if(scanFiles==null){
                    return {status: false, error: "Geben Sie Dateien zum Hochladen an."};
                } else if(!scanEditor||!scanYear){
                    return {status: false, error: "Geben Sie den Editor und das Jahr ein."};
                } else if(scanId === null){
                    return {status: false, error: "Kein g??ltiges Opus ausgew??hlt!"};
                } else if(scanPath&&scanId){
                    return await props.importRessource({
                        opus_id: scanId,
                        editor: scanEditor,
                        year: scanYear,
                        path: scanPath,
                        url: "",
                    }, scanFiles);
                    
                } else{return {status: false, error: "Geben Sie einen g??ltigen Pfad ein!"};}
            }} /></Col>
            </Row>
    </>;
}
function TLLImportZettel(props){
    const [zettelLetter, setZettelLetter]=useState("A");
    const [zettelEditors, setZettelEditors]=useState([]);
    const [zettelEditorSelected, setZettelEditorSelected]=useState(arachne.me.id); // here: id of arachne.me?
    const [zettelType, setZettelType]=useState(0);
    const [zettelLst, setZettelLst] = useState();
    useEffect(()=>{
        const fetchData=async()=>{
            const newUsers = await arachne.user.getAll({order: ["last_name"]});
            setZettelEditors(newUsers.map(u=>[u.id, u.last_name]));
        };
        if(arachne.access("admin")){fetchData()}
    }, []);
    return <>
        <Row className="mb-2">
            <Col xs={3}>Buchstabe:</Col>
            <Col><SelectMenu options={[["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"], ["G", "G"], ["H", "H"], ["I", "I/J"], ["K", "K"], ["L", "L"], ["M", "M"], ["N", "N"], ["O", "O"], ["P", "P"], ["Q", "Q"], ["R", "R"], ["S", "S"], ["T", "T"], ["U", "U/V"], ["W", "W"], ["X", "X"], ["Y", "Y"], ["Z", "Z"]]} value={zettelLetter} onChange={e=>{setZettelLetter(e.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={3}>erstellt von:</Col>
            <Col><SelectMenu options={zettelEditors} value={zettelEditorSelected} onChange={e=>{setZettelEditorSelected(parseInt(e.target.value))}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={3}>Zettel-Typ:</Col>
            <Col><SelectMenu options={[[0, "..."], [1, "Perikopenzettel"], [2, "Exzerptzettel"], [3, "Lexikonzettel"], [4, "Indexzettel"], [5, "Literaturzettel"]]} value={zettelType} onChange={e=>{setZettelType(parseInt(e.target.value))}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col xs={3}>Bilder:</Col>
            <Col><Form.Group>
                <Form.Control type="file" multiple accept="image/jpeg" onChange={e=>{setZettelLst(e.target.files)}} />
            </Form.Group></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={3}></Col>
            <Col><StatusButton value="Zettel hochladen" onClick={async (progress)=>{
                if(zettelLst==null){
                    return {status: false, error: "W??hlen Sie Bilder zum Hochladen aus."};
                }else{
                    return await props.importZettel(progress, zettelLst, zettelLetter, zettelType, zettelEditorSelected);
                }
            }} /></Col>
        </Row>
    </>;
}
/* ************************************************************************************* */
export {
    arachneTbls,
    LemmaRow, LemmaHeader, lemmaSearchItems, LemmaAsideContent,
    zettelSearchItems, ZettelCard, zettelBatchOptions, BatchInputType, ZettelAddLemmaContent, ZettelSingleContent, newZettelObject, exportZettelObject, zettelPresetOptions, zettelSortOptions,
    MainMenuContent,
    fetchIndexBoxData, IndexBoxDetail,
    TLLRessource,
    StatisticsChart,
    TLLImportRessource, TLLImportZettel,
}