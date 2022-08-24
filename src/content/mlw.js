import { parseHTML, parseHTMLPreview, SelectMenu, StatusButton, AutoComplete, TableView, useIntersectionObserver } from "./../elements.js";
import { arachne } from "./../arachne.js";
import { Accordion, Button, Col, Row, Container, Form, NavDropdown, Card, ListGroup, Spinner } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import 'chart.js/auto';
import { Bar, Pie } from "react-chartjs-2";
function arachneTbls(){
    return ["project", "author", "edition", "lemma", "opera_maiora", "opera_minora", "scan", "scan_lnk", "work", "zettel", "user", "seklit", "article", "zettel_lnk", "statistics", "scan_paths", "ocr_jobs", "comment", "scan_opera", "fulltext_search_view", "tags", "tag_lnks", "sections", "gq_werke", "gq_autoren"];
}
/* ************************************************************************************* */
function LemmaHeader(){
	return <tr><th width="30%">Wortansatz</th><th width="20%">Wörterbücher</th><th>Kommentar</th></tr>;
}
function LemmaRow(props){
    return <tr id={props.lemma.id} onDoubleClick={e=>{props.showDetail(parseInt(e.target.closest("tr").id))}}>
		<td title={"ID: "+props.lemma.id}>
			<span className="a_style" dangerouslySetInnerHTML={parseHTML(props.lemma.lemma_display)} onClick={e=>{
    			localStorage.setItem("mlw_searchBox_zettel", `[[{"id":0,"c":"lemma_id","o":"=","v":${props.lemma.id}}],1,["id"]]`);
    			props.loadMain(e);
			}}>
			</span>
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
            await arachne.lemma.save(newLemmaValue);
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
    let returnComponent = null;
    switch(props.batchType){
        case 1:
            returnComponent = <AutoComplete onChange={(value, id)=>{props.setBatchValue(value);props.setBatchValueId(id)}} value={props.batchValue} tbl="lemma"  searchCol="lemma" returnCol="lemma_ac" />;
            break;
        case 2:
            returnComponent = <AutoComplete  value={props.batchValue} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={(value, id)=>{props.setBatchValue(value);props.setBatchValueId(id)}} />;
            break;
        case 3:
            returnComponent = <SelectMenu style={{width: "86%"}} options={[[0, "..."],[1, "verzettelt"],[2,"Exzerpt"],[3,"Index"],[4,"Literatur"], [6, "Index (unkl. Stelle)"], [7, "Notiz"]]} onChange={event=>{props.setBatchValue(event.target.value)}} />;
            break;
        default:
            returnComponent = <div style={{color: "red"}}>Unbekannter Stapel-Typ!</div>;  
    }
    return returnComponent;
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
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setFragezeichen(event.target.value)}} /></Col>
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
        }else if((dateOwnDisplay===null||dateOwnDisplay==="")&&!(dateOwn===null||dateOwn==="")){
            props.setZettelObjectErr({status: 2, msg: "Sie dürfen kein Sortierdatum speichern, ohne ein Anzeigedatum anzugeben!"});
        } else if(isNaN(dateOwn)){
            props.setZettelObjectErr({status: 2, msg: "Das Sortierdatum muss eine Ganzzahl sein!"});
        } else if(workId>0&&dateType===9&&(dateOwn===null||dateOwn==="")){
            props.setZettelObjectErr({status: 1, msg: "Achtung: Dieser Zettel benötigt eine Datierung! Soll er trotzdem ohne Datierung gespeichert werden?"});
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
        {arachne.access("geschichtsquellen")&&<NavDropdown.Item onClick={e => {props.loadMain(e, "geschichtsquellen")}}>Geschichtsquellen</NavDropdown.Item>}
        {arachne.access("geschichtsquellen")&&<NavDropdown.Item onClick={e => {props.loadMain(e, "externalConnectionAuthor")}}>Datenbankverknüpfung (Autoren)</NavDropdown.Item>}
    </>;
}
/* ************************************************************************************* */
const fetchIndexBoxData=async()=>{
    let wl = await arachne.lemma.getAll({select: ["id", "lemma", "lemma_display"], order: ["lemma"]})
    wl=wl.map(w=>{return {id: w.id, lemma_display: w.lemma_display, lemma: w.lemma.toLowerCase()}})
    return wl;
}
function IndexBoxZettel(props){
    const [verso, setVerso] = useState("");
    const [editions, setEditons] = useState([]);
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef(null);
    const [img, setImg] = useState(null);

    useIntersectionObserver({
        target: imgRef,
        onIntersect: ([{ intersectionRatio, isIntersecting }], observerElement) => {
            if (isIntersecting&&!isVisible) {
                setIsVisible(true);
            }
            if(intersectionRatio>0.1){observerElement.unobserve(imgRef.current)}
        }
      });
      useEffect(()=>{
          if(isVisible){
                const fetchData = async ()=>{
                    setImg(`${arachne.url}${props.z.img_path}${verso}.jpg`);
                    if(props.z.work_id>0&&editions.length===0){
                        const newEditions = await arachne.edition.get({work_id: props.z.work_id}, {select: ["id", "label", "url"]});
                        let editionsLst = [];
                        for(const e of newEditions){
                            editionsLst.push(<ListGroup.Item key={e.id}><a href={e.url===""?`/site/argos/${e.id}`:e.url} target="_blank" rel="noreferrer">{e.label}</a></ListGroup.Item>);
                        }
                        setEditons(editionsLst)
                    }
                }
                fetchData();
                
          }else{
              setImg(null);
          }
      },[isVisible]);


    return <Card ref={imgRef} style={{width: "30rem"}} className="mb-3">
        <FontAwesomeIcon style={{position: "absolute", top: "12px", right: "10px"}} onClick={()=>{if(verso===""){setVerso("v")}else{setVerso("")}}} icon={faSync} />
        <Card.Header style={{height: "41px"}} dangerouslySetInnerHTML={parseHTML(props.z.opus)}></Card.Header>
        <Card.Img variant="bottom" src={img} />
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
                            <Container className="d-flex flex-wrap" style={{justifyContent: "space-around"}}>{vZettels?vZettels.map(z=>{return <IndexBoxZettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="e">
                        <Accordion.Header>Exzerpt-Zettel&nbsp;{eZettels?<span>({eZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{eZettels?eZettels.map(z=>{return <IndexBoxZettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="i">
                        <Accordion.Header>Index-Zettel&nbsp;{iZettels?<span>({iZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{iZettels?iZettels.map(z=>{return <IndexBoxZettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="r">
                        <Accordion.Header>restliche Zettel&nbsp;{rZettels?<span>({rZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{rZettels?rZettels.map(z=>{return <IndexBoxZettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
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
/* ************************************************************************************* */
function GeschichtsquellenImport(props){
    const [data, setData] = useState([null]); //db_length_werk, gq_length_werk, db_length_autor, gq_length_autor
    const [addLstAutor, setAddLstAutor] = useState([]);
    const [changeLstAutor, setChangeLstAutor] = useState([]);
    const [deleteLstAutor, setDeleteLstAutor] = useState([]);
    const [addLstWerk, setAddLstWerk] = useState([]);
    const [changeLstWerk, setChangeLstWerk] = useState([]);
    const [deleteLstWerk, setDeleteLstWerk] = useState([]);
    const [importError, setImportError] = useState(null);
    const [loadSpinner, setLoadSpinner] = useState(true);
    const [showDetails, setShowDetails] = useState(false);
    useEffect(()=>{
        const fetchData=async()=>{
            // /geschichtsquellen/<string:type>
            const db_data_autoren = await arachne.gq_autoren.getAll();
            const db_data_werke = await arachne.gq_werke.getAll();
            //const re_autoren = await fetch("https://www.geschichtsquellen.de/autoren/data");
            const re_autoren = await fetch(`${arachne.url}/geschichtsquellen/autoren`);
            const gq_autoren = await re_autoren.json();
            const re_werke = await fetch(`${arachne.url}/geschichtsquellen/werke`);
            //const re_werke = await fetch("https://www.geschichtsquellen.de/werke/data");
            const gq_werke = await re_werke.json();

            let newAddLst_autoren = [];
            let newChangeLst_autoren = [];
            let newDeleteLst_autoren = [];
            let newAddLst_werke = [];
            let newChangeLst_werke = [];
            let newDeleteLst_werke = [];

            const db_werke_ids = db_data_werke.map(d=>d.gq_id);
            const db_autoren_ids = db_data_autoren.map(d=>d.gq_id);
            const gq_autoren_ids = [];
            const gq_werke_ids = [];
            // werke
            for(const gq_id in gq_werke.data){
                const gqWork = {
                    gq_id: parseInt(gq_werke.data[gq_id][0]["_"].substring(15,gq_werke.data[gq_id][0]["_"].indexOf("\"",15))),
                    gq_autor_id: gq_werke.data[gq_id][3]["_"]?parseInt(gq_werke.data[gq_id][3]["_"].substring(16, gq_werke.data[gq_id][3]["_"].indexOf("\"", 16))):null,
                    werk_lat: gq_werke.data[gq_id][0]["_"].replace(/<.*?>/g, ""),
                    werk_de: gq_werke.data[gq_id][1]["_"],
                };
                gq_werke_ids.push(gqWork.gq_id);
                if(db_werke_ids.includes(parseInt(gqWork.gq_id))){
                    // dataset in db: test if there are changes.
                    const current_db_row = db_data_werke.find(d=>d.gq_id===gqWork.gq_id);
                    if (
                        current_db_row.gq_autor!==gqWork.gq_autor ||
                        current_db_row.werk_lat!==gqWork.werk_lat ||
                        current_db_row.werk_de!==gqWork.werk_de
                        ){
                        gqWork.id = current_db_row.id;
                        newChangeLst_werke.push(gqWork);
                    }
                }else{
                    // dataset not in db.
                    newAddLst_werke.push(gqWork);
                }
            }
            // check: datasets in db but not in gq!
            newDeleteLst_werke = db_werke_ids.filter(w=>!gq_werke_ids.includes(w));

            // autoren
            for(const gq_id in gq_autoren.data){
                const gqAutor = {
                    gq_id: parseInt(gq_autoren.data[gq_id][0]["_"].substring(16,gq_autoren.data[gq_id][0]["_"].indexOf("\"",16))),
                    autor_lat: gq_autoren.data[gq_id][0]["_"].replace(/<.*?>/g, ""),
                    autor_de: gq_autoren.data[gq_id][1]["_"],
                };
                gq_autoren_ids.push(gqAutor.gq_id);
                if(db_autoren_ids.includes(parseInt(gqAutor.gq_id))){
                    // dataset in db: test if there are changes.
                    const current_db_row = db_data_autoren.find(d=>d.gq_id===gqAutor.gq_id);
                    if (
                        current_db_row.autor_lat!==gqAutor.autor_lat ||
                        current_db_row.autor_de!==gqAutor.autor_de
                        ){
                        gqAutor.id = current_db_row.id;
                        newChangeLst_autoren.push(gqAutor);
                    }
                }else{
                    // dataset not in db.
                    newAddLst_autoren.push(gqAutor);
                }
            }
            // check: datasets in db but not in gq!
            newDeleteLst_autoren = db_autoren_ids.filter(a=>!gq_autoren_ids.includes(a));

            setData([db_data_werke.length, Object.keys(gq_werke.data).length, db_data_autoren.length, Object.keys(gq_autoren.data).length])
            setAddLstWerk(newAddLst_werke);
            setChangeLstWerk(newChangeLst_werke);
            setDeleteLstWerk(newDeleteLst_werke);
            setAddLstAutor(newAddLst_autoren);
            setChangeLstAutor(newChangeLst_autoren);
            setDeleteLstAutor(newDeleteLst_autoren);
            setLoadSpinner(false);
        };
        fetchData();
    }, []);
    return loadSpinner?<div style={{textAlign: "center"}}><Spinner variant="primary" animation="border" /></div>:<>
            <table width="100%">
                <tbody>
                <tr><th></th><th>Autoren</th><th>Werke</th></tr>
                <tr><td>Datensätze in der Geschichtsquellen/Datenbank:</td><td>{data[3]}/{data[2]}</td><td>{data[1]}/{data[0]}</td></tr>
                <tr><td>Neue Datensätze erstellen:</td><td>{addLstAutor.length}</td><td>{addLstWerk.length}</td></tr>
                <tr><td>Datensätze ändern:</td><td>{changeLstAutor.length}</td><td>{changeLstWerk.length}</td></tr>
                <tr><td>Datensätze löschen:</td><td>{deleteLstAutor.length}</td><td>{deleteLstWerk.length}</td></tr>
                </tbody>
            </table>
            {showDetails&&(addLstAutor.length>0||addLstWerk.length>0||changeLstAutor.length>0||changeLstWerk.length>0||deleteLstAutor.length>0||deleteLstWerk.length>0)?<div style={{marginTop: "20px"}}>
                    {addLstAutor.length>0&&<><i>neue Autoren:</i><ul>{addLstAutor.map(a=><li><b>{a.autor_lat}</b>/{a.autor_de} <small>ID: {a.gq_id}</small></li>)}</ul></>}
                    {changeLstAutor.length>0&&<><i>geänderte Autoren:</i><ul>{changeLstAutor.map(a=><li><b>{a.autor_lat}</b>/{a.autor_de} <small>ID: {a.gq_id}</small></li>)}</ul></>}
                    {deleteLstAutor.length>0&&<><i>gelöschte Autoren:</i><ul>{deleteLstAutor.map(a=><li><b>{a.autor_lat}</b>/{a.autor_de} <small>ID: {a.gq_id}</small></li>)}</ul></>}
                    {addLstWerk.length>0&&<><i>neue Werke:</i><ul>{addLstWerk.map(w=><li><b>{w.werk_lat}</b>/{w.werk_de} <small>ID: {w.gq_id} --- {w.gq_autor_id?<>Autor-ID: {w.gq_autor_id}</>:<i>Mit keinem Autor verknüpft</i>}</small></li>)}</ul></>}
                    {changeLstWerk.length>0&&<><i>geänderte Werke:</i><ul>{changeLstWerk.map(w=><li><b>{w.werk_lat}</b>/{w.werk_de} <small>ID: {w.gq_id} --- {w.gq_autor_id?<>Autor-ID: {w.gq_autor_id}</>:<i>Mit keinem Autor verknüpft</i>}</small></li>)}</ul></>}
                    {deleteLstWerk.length>0&&<><i>gelöschte Werke:</i><ul>{deleteLstWerk.map(w=><li><b>{w.werk_lat}</b>/{w.werk_de} <small>ID: {w.gq_id} --- {w.gq_autor_id?<>Autor-ID: {w.gq_autor_id}</>:<i>Mit keinem Autor verknüpft</i>}</small></li>)}</ul></>}
                    
            </div>:null}
            <div style={{marginTop: "20px"}}>{addLstAutor.length>0||changeLstAutor.length>0||deleteLstAutor.length>0||addLstWerk.length>0||changeLstWerk.length>0||deleteLstWerk.length>0?<><Button variant="secondary" style={{marginRight: "20px"}} onClick={()=>{setShowDetails(!showDetails)}}>Details {showDetails?"ausblenden":"anzeigen"}</Button><StatusButton onClick={async()=>{
                        if(addLstAutor.length>0){await arachne.gq_autoren.save(addLstAutor)}
                        if(changeLstAutor.length>0){await arachne.gq_autoren.save(changeLstAutor)}
                        if(deleteLstAutor.length>0){await arachne.gq_autoren.delete(deleteLstAutor)}
                        if(addLstWerk.length>0){await arachne.gq_werke.save(addLstWerk)}
                        if(changeLstWerk.length>0){await arachne.gq_werke.save(changeLstWerk)}
                        if(deleteLstWerk.length>0){await arachne.gq_werke.delete(deleteLstWerk)}
                        return {status: 1}
                    }} value="Änderungen übernehmen" /></>:null}</div>
        </>;
}
function GeschichtsquellenInterface(props){
    const menuItems = [];
    const asideContent = [
        {caption: "Autorenkürzel", type: "span", col: "abbr"},
        {caption: "Autorenname:", type: "span", col: "full"},
        {caption: "Geschichts-quelle:", type: "auto", col: ["gq_author", "gq_id"], search: {tbl: "gq_autoren", sCol: "autor_lat", rCol: "autor_lat", idCol: "gq_id"}},
    ];
    return <TableView
        tblName="author"
        searchOptions={[["id", "ID"]]}
        sortOptions={[['["id"]', "ID"]]}
        menuItems={menuItems}
        tblRow={GeschichtsquellenRow}
        tblHeader={<><th>MLW-Autor <span style={{float: "right"}}>verknpft. Geschichtsquelle</span></th></>}
        asideContent={asideContent}
    />;
}
function GeschichtsquellenRow(props){
    const [showDetails, setShowDetails] = useState(false);
    const [workLst, setWorkLst] = useState([]);
    const [gqWorkLst, setGQWorkLst] = useState([[null, "..."]]);
    useEffect(()=>{
        const fetchData=async()=>{
            await refreshWorkLst();
            const newGQWorkLst = await arachne.gq_werke.get({gq_autor_id: props.cEl.gq_id});
            setGQWorkLst([[null, "..."]].concat(newGQWorkLst.map(w=>[w.gq_id, w.werk_lat])));
        };
        if(showDetails&&workLst.length===0){fetchData()}
    }, [showDetails]);
    const refreshWorkLst = async()=>{setWorkLst(await arachne.work.get({author_id: props.cEl.id}))};
    return <>
        <td title={"ID: "+props.cEl.id}>
            {props.cEl.in_use?null:"["}<aut><span dangerouslySetInnerHTML={parseHTML(props.cEl.abbr)}></span></aut>{props.cEl.in_use?null:"]"}
        <small style={{marginLeft: "5px"}}>(<span dangerouslySetInnerHTML={parseHTML(props.cEl.full)}></span>)</small>
        <span style={{float: "right"}}><b style={{cursor: "pointer"}} onClick={()=>{setShowDetails(!showDetails)}}>{props.cEl.gq_author}</b> {props.cEl.gq_id?<small>(ID: {props.cEl.gq_id})</small>:null}</span>
        
        {showDetails&&<div style={{margin: "10px 0px", padding: "20px 15rem", borderTop: "1px solid black"}}>
            <p><small><a href={`https://www.geschichtsquellen.de/autor/${props.cEl.gq_id}`} target="_blank">Autor in den Geschichtsquellen öffnen</a></small></p>
            <table width="100%">
                <tbody>
                    {workLst.map(w=><tr className="geschichtsquellenRows" key={w.id}><td width="33%">{w.ac_web}</td><td style={{paddingBottom: "10px"}}><SelectMenu style={{background: "none", width: "100%"}} options={gqWorkLst} onChange={async(event)=>{
                            if(event.target.value==="..."){
                                await arachne.work.save({id: w.id, gq_id: null})
                            }else{
                                await arachne.work.save({id: w.id, gq_id: event.target.value})
                            }
                            setWorkLst([]);
                            await refreshWorkLst();
                    }} value={w.gq_id} /></td><td width="10%" style={{textAlign: "right"}}>{w.gq_id&&<small><a href={`https://www.geschichtsquellen.de/werk/${w.gq_id}`} target="_blank">öffnen</a></small>}</td></tr>)}
                </tbody>
            </table>
        </div>}
        </td>
    </>;
}
/* ************************************************************************************* */
function MLWImportRessource(props){
    const [scanWork, setScanWork] = useState();
    const [scanId, setScanId] = useState();
    const [scanType, setScanType] = useState(0);
    const [scanEditor, setScanEditor] = useState();
    const [scanYear, setScanYear] = useState();
    const [scanVolume, setScanVolume] = useState();
    const [scanVolumeContent, setScanVolumeContent] = useState();
    const [scanSerie, setScanSerie] = useState();
    const [scanLocation, setScanLocation] = useState();
    const [scanLibrary, setScanLibrary] = useState();
    const [scanSignature, setScanSignature] = useState();
    const [scanPath, setScanPath] = useState();
    const [scanFiles, setScanFiles] = useState();
    return <>
        <Row className="mb-2">
            <Col xs={3}>Werk:</Col>
            <Col><AutoComplete  style={{width: "100%"}} value={scanWork?scanWork:""} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={async (value, id)=>{setScanWork(value);setScanId(id)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col xs={3}>Ressource:</Col>
            <Col><SelectMenu options={[[0, "Edition (relevant)"], [1, "Edition (veraltet)"], [2, "Handschrift"], [3, "Alter Druck (relevant)"], [4, "Alter Druck (veraltet)"], [5, "Sonstiges"]]} onChange={e=>{setScanType(parseInt(e.target.value))}} /></Col>
        </Row>
        {scanType===0||scanType===1||scanType===5?[
            <Row key="0" className="mb-2">
                <Col xs={3}>Editor:</Col>
                <Col><input type="text" style={{width: "100%"}} value={scanEditor?scanEditor:""} onChange={e=>{setScanEditor(e.target.value)}} /></Col>
            </Row>,
            <Row key="1" className="mb-2">
                <Col xs={3}>Jahr:</Col>
                <Col><input type="text" style={{width: "100%"}} value={scanYear?scanYear:""} onChange={e=>{setScanYear(e.target.value)}} /></Col>
            </Row>,
            <Row key="2" className="mb-2">
                <Col xs={3}>Band:</Col>
                <Col><input type="text" style={{width: "100%"}} value={scanVolume?scanVolume:""} onChange={e=>{setScanVolume(e.target.value)}} /></Col>
            </Row>,
            <Row key="3" className="mb-2">
                <Col xs={3}>Bandinhalt:</Col>
                <Col><input type="text" style={{width: "100%"}} value={scanVolumeContent?scanVolumeContent:""} onChange={e=>{setScanVolumeContent(e.target.value)}} /></Col>
            </Row>,
            <Row key="4" className="mb-4">
                <Col xs={3}>Reihe:</Col>
                <Col><SelectMenu options={[[0, ""], [1, "Migne PL"], [2, "ASBen."], [3, "ASBoll."], [4, "AnalBoll."], [5, "Mon. Boica"], [6, "Ma. Schatzverzeichnisse"], [7, "Ma. Bibliothekskataloge"]]} onChange={e=>{setScanSerie(parseInt(e.target.value))}} /></Col>
            </Row>,
        ]:null}
        {scanType===2?[
            <Row key="5" className="mb-2">
                <Col xs={3}>Stadt:</Col>
                <Col><input type="text" style={{width: "100%"}} value={scanLocation?scanLocation:""} onChange={e=>{setScanLocation(e.target.value)}} /></Col>
            </Row>,
            <Row key="6" className="mb-2">
                <Col xs={3}>Bibliothek:</Col>
                <Col><input type="text" style={{width: "100%"}} value={scanLibrary?scanLibrary:""} onChange={e=>{setScanLibrary(e.target.value)}} /></Col>
            </Row>,
            <Row key="7" className="mb-4">
                <Col xs={3}>Signatur:</Col>
                <Col><input type="text" style={{width: "100%"}} value={scanSignature?scanSignature:""} onChange={e=>{setScanSignature(e.target.value)}} /></Col>
            </Row>,
        ]:null}
        {scanType===3||scanType===4?[
            <Row key="8" className="mb-2">
                <Col xs={3}>Drucker:</Col>
                <Col><input type="text" style={{width: "100%"}} value={scanEditor?scanEditor:""} onChange={e=>{setScanEditor(e.target.value)}} /></Col>
            </Row>,
            <Row key="9" className="mb-2">
                <Col xs={3}>Ort:</Col>
                <Col><input type="text" style={{width: "100%"}} value={scanLocation?scanLocation:""} onChange={e=>{setScanLocation(e.target.value)}} /></Col>
            </Row>,
            <Row key="10" className="mb-4">
                <Col xs={3}>Jahr:</Col>
                <Col><input type="text" style={{width: "100%"}} value={scanYear?scanYear:""} onChange={e=>{setScanYear(e.target.value)}} /></Col>
            </Row>,
        ]:null}
        <Row className="mb-2">
            <Col xs={3}>Dateipfad:</Col>
            <Col><input type="text" style={{width: "100%"}} value={scanPath?scanPath:""} placeholder="/A/ABBO FLOR. Calc./" onChange={e=>{setScanPath(e.target.value)}} /></Col>
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
                } else if((scanType===0||scanType===1||scanType===5)&&(!scanEditor||!scanYear)){
                    return {status: false, error: "Geben Sie den Editor und das Jahr ein."};
                } else if(scanId === null){
                    return {status: false, error: "Kein gültiges Werk ausgewählt!"};
                } else if(scanPath&&scanId){
                    return await props.importRessource({
                        work_id: scanId,
                        ressource: scanType,
                        editor: scanEditor,
                        year: scanYear,
                        volume: scanVolume,
                        vol_cont: scanVolumeContent,
                        serie: scanSerie,
                        location: scanLocation,
                        library: scanLibrary,
                        signature: scanSignature,
                        path: scanPath,
                        url: "",
                    }, scanFiles);
                    
                } else{return {status: false, error: "Geben Sie einen gültigen Pfad ein!"};}
            }} /></Col>
            </Row>
    </>;
}
function MLWImportZettel(props){
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
            <Col><SelectMenu options={[[0, "Index-/Exzerpt-Zettel"], [1, "verzetteltes Material"], [4, "Literatur"]]} value={zettelType} onChange={e=>{setZettelType(parseInt(e.target.value))}} /></Col>
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
                    return {status: false, error: "Wählen Sie Bilder zum Hochladen aus."};
                } else if(zettelLst.length%2 != 0){
                    return {status: false, error: "Wählen Sie eine gerade Anzahl Bilder aus (jeweils Vorder- und Rückseiten!)."}
                }else{
                    return await props.importZettel(progress, zettelLst, zettelLetter, zettelType, zettelEditorSelected);
                }
            }} /></Col>
        </Row>
    </>;
}
/* ************************************************************************************* */
function ExternalConnectionAuthorInterface(props){
    const menuItems = [
        /*["neuer Eintrag", async(that)=>{
            if(window.confirm("Soll ein neuer Eintrag erstellt werden?")){
                const newId = await arachne.konkordanz.save({zettel_sigel: "neuer Verweis"});
                that.setState({newItemCreated: [{id: 0, c: "id", o: "=", v:newId}]});
            }
        }]*/
    ];
    const tblRow=(props)=>{
        return <><td style={{color: props.cEl.in_use!==1?"lightgray":"inherit"}} title={"ID: "+props.cEl.id}>{props.cEl.in_use!==1?"[":null}<aut>{props.cEl.abbr}</aut> <small dangerouslySetInnerHTML={parseHTML(props.cEl.full)}></small>{props.cEl.is_maior!==1?<small>minora Werk</small>:null}{props.cEl.in_use!==1?"]":null}</td>
            <td>{props.cEl.GND?<a target="_blank" href={"https://d-nb.info/gnd/"+props.cEl.GND}>{props.cEl.GND}</a>:null}</td>
            <td>{props.cEl.VIAF?<a target="_blank" href={"https://viaf.org/viaf/"+props.cEl.VIAF}>{props.cEl.VIAF}</a>:null}</td>
            <td>{props.cEl.gq_id?<a target="_blank" href={"https://geschichtsquellen.de/autor/"+props.cEl.gq_id}>{props.cEl.gq_id}</a>:null}</td>
            <td>{props.cEl.cc_idno?<a target="_blank" href={"https://www.mlat.uzh.ch/browser?path="+props.cEl.cc_idno}>{props.cEl.cc_idno}</a>:null}</td>
            <td>{props.cEl.miarbile_id?<a target="_blank" href="">{props.cEl.miarbile_id}</a>:null}</td>
            <td>{props.cEl.wikidata_id?<a target="_blank" href={"https://www.wikidata.org/wiki/"+props.cEl.wikidata_id}>{props.cEl.wikidata_id}</a>:null}</td>
        </>;
    };
    const asideContent = [ // caption; type: t(ext-input), (text)a(rea), (auto)c(omplete); col names as array
        {caption: "GND", type: "text", col: "GND"},
        {caption: "VIAF", type: "text", col: "VIAF"},
        {caption: "Geschichtsquellen", type: "text", col: "gq_id"},
        {caption: "Corpus Corporum", type: "text", col: "cc_idno"},
        {caption: "Mirabile", type: "text", col: "mirabile_id"},
        {caption: "Wikidata", type: "text", col: "wikidata_id"},
    ];
    return <TableView
        tblName="author"
        searchOptions={[["id", "ID"], ["GND", "GND"], ["VIAF", "VIAF"], ["gq_id", "Geschichtsquellen"], ["cc_idno", "Corpus Corporum"], ["mirabile_id", "Mirabile"], ["wikidata_id", "Wikidata"]]}
        sortOptions={[['["id"]', "ID"], ['["abbr"]', "Autorname"]]}
        menuItems={menuItems}
        tblRow={tblRow}
        tblHeader={<><th>Autor</th><th>GND</th><th>VIAF</th><th>Geschichtsquellen</th><th>Corpus Corporum</th><th>Mirabile</th><th>Wikidata</th></>}
        asideContent={asideContent}
    />;
}
/* ************************************************************************************* */
export {
    arachneTbls,
    LemmaRow, LemmaHeader, lemmaSearchItems, LemmaAsideContent,
    zettelSearchItems, ZettelCard, zettelBatchOptions, BatchInputType, ZettelAddLemmaContent, ZettelSingleContent, newZettelObject, exportZettelObject, zettelPresetOptions, zettelSortOptions,
    MainMenuContent,
    fetchIndexBoxData, IndexBoxDetail,
    GeschichtsquellenImport, GeschichtsquellenInterface, ExternalConnectionAuthorInterface,
    StatisticsChart,
    MLWImportRessource, MLWImportZettel,
}