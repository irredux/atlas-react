import { parseHTML, StatusButton, SelectMenu, AutoComplete } from "./../elements.js";
import { arachne } from "./../arachne.js";
import { useState, useEffect } from "react";
import { Col, Row, Container } from "react-bootstrap";

function arachneTbls(){
    return ["lemma", "work", "zettel", "user", "konkordanz", "opera", "comment"];
}

/* ************************************************************************************* */

function LemmaHeader(){
	return <tr><th width="30%">Lemma</th><th width="20%">Farbe</th><th>Kommentar</th><th>dom en ligne</th></tr>;
}
			
function LemmaRow(props){
	const colors = {
        "gelb": "#E9AB17",
        "grün": "green",
        "blau": "#0000A0",
        "rot": "#C11B17",
        "lila": "#4B0082",
        "türkis": "#3f888f"
    };
    return <tr id={props.lemma.id} onDoubleClick={e=>{props.showDetail(parseInt(e.target.closest("tr").id))}}>
		<td title={"ID: "+props.lemma.id}>
			<a dangerouslySetInnerHTML={parseHTML(props.lemma.lemma_display)} onClick={e=>{
    			localStorage.setItem("searchBox_zettel", `[[{"id":0,"c":"lemma_id","o":"=","v":${props.lemma.id}}],1,["id"]]`);
    			props.loadMain(e);
			}}>
			</a>
		</td>
		<td style={{color: colors[props.lemma.farbe]}}>{props.lemma.farbe}</td>
		<td dangerouslySetInnerHTML={parseHTML(props.lemma.comment)}></td>
		<td>{props.lemma.URL?<a href={"https://dom-en-ligne.de/"+props.lemma.URL} target="_blank" rel="noreferrer">zum Artikel</a>:null}</td>
	</tr>;
}
function lemmaSearchItems(){
	return [
		["lemma", "Lemma"],
		["id", "ID"],
		["farbe", "Farbe"],
		["URL", "URL"],
	];
}

function LemmaAsideContent(props){
	const [lemma, setLemma] = useState(props.item.lemma);
	const [lemma_simple, setLemma_simple] = useState(props.item.lemma_simple);
	const [nr, setNr] = useState(props.item.nr);
	const [normgraphie, setNormgraphie] = useState(props.item.normgraphie);
	const [dom_normgraphie, setDom_normgraphie] = useState(props.item.dom_normgraphie);
	const [verworfen, setVerworfen] = useState(props.item.verworfen);
	const [unsicher, setUnsicher] = useState(props.item.unsicher);
	const [farbe, setFarbe] = useState(props.item.farbe);
	const [comment, setComment] = useState(props.item.comment);
	const [reference_id, setReference_id] = useState(props.item.reference_id);
	const [reference, setReference] = useState(props.item.reference);
	useEffect(()=>{
		setLemma(props.item.lemma);
		setLemma_simple(props.item.lemma_simple);
		setNr(props.item.nr);
		setNormgraphie(props.item.normgraphie);
		setDom_normgraphie(props.item.dom_normgraphie);
		setVerworfen(props.item.verworfen);
		setUnsicher(props.item.unsicher);
		setFarbe(props.item.farbe);
		setComment(props.item.comment);
		setReference_id(props.item.reference_id);
		setReference(props.item.reference);
	}, [props.id]);

	return <Container>
        <Row className="mb-2">
            <Col>Wort:</Col>
            <Col><input type="text" value={lemma} onChange={event=>{setLemma(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>Wort: <small>(ohne Sonderz.)</small></Col>
            <Col><input type="text" value={lemma_simple} onChange={event=>{setLemma_simple(event.target.value)}} /></Col>
        </Row>
		<Row className="mb-2">
            <Col>Farbe:</Col>
            <Col><SelectMenu options={[["gelb", "gelb"], ["grün", "grün"], ["rot", "rot"], ["blau", "blau"], ["lila", "lila"], ["türkis", "türkis"]]} onChange={event=>{setFarbe(event.target.value)}} value={farbe} /></Col>
        </Row>
		{["blau", "türkis", "lila"].includes(farbe)?<Row>
			<Col>Referenz:</Col>
			<Col><AutoComplete onChange={(value, id)=>{setReference(value);setReference_id(id)}} tbl="lemma" col="ac_w" value={reference} /></Col>
		</Row>:null}


        <Row className="mt-4 mb-2">
            <Col>Homonym-Nr.:</Col>
            <Col><input type="text" value={nr} onChange={event=>{setNr(event.target.value)}} /></Col>
        </Row>

        <Row className="mb-2">
        	<Col>Normgraphie:</Col>
        	<Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setNormgraphie(event.target.value)}} value={normgraphie} /></Col>
        </Row>
        <Row className="mb-2">
        	<Col>DOM-Normgraphie:</Col>
        	<Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setDom_normgraphie(event.target.value)}} value={dom_normgraphie} /></Col>
        </Row>
        <Row className="mb-2">
        	<Col>verworfen:</Col>
        	<Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setVerworfen(event.target.value)}} value={verworfen} /></Col>
        </Row>
        <Row className="mb-2">
        	<Col>unsicher:</Col>
        	<Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setUnsicher(event.target.value)}} value={unsicher} /></Col>
        </Row>
        <Row className="mb-4">
        	<Col>Kommentar:</Col>
        	<Col><textarea onChange={event=>{setComment(event.target.value)}} style={{resize: "false", width: "97%"}} value={comment}></textarea></Col>
        </Row>
        <Row>
            <Col>
            <StatusButton value="speichern" onClick={async ()=>{
        if(lemma===""){
            return {status: false, error: "Bitte ein gültiges Wort eintragen!"};
        } else if(lemma_simple===""){
            return {status: false, error: "Bitte tragen Sie eine gültiges Wort (ohne Sonderzeichen) ein!"};
        } else {
            let newLemmaValue = {
                id: props.id,
                lemma: lemma,
                lemma_simple: lemma_simple,
                reference_id: reference_id,
                normgraphie: normgraphie,
                dom_normgraphie: dom_normgraphie,
                verworfen: verworfen,
                unsicher: unsicher,
                farbe: farbe,
                comment: comment,
            };
            if(!isNaN(nr)){newLemmaValue.nr=nr}
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
        ["lemma_simple", "Lemma"],
        ["lemma_id", "lemma-ID"],
        ["farbe", "Farbe"],
        ["id", "ID"],
        ["editor", "EditorIn"],
        ["comment", "Kommentar"],
        ["zettel_sigel", "Sigel"],
    ];
}
function ZettelCard(props){
    const zettel = props.item;
    let style = {width: arachne.options.z_width+"px", height: "100%"};
    let box = null;
    if(zettel.img_path!=null){
        let classList = "";
        if(zettel.in_use===0){classList+="zettel_img no_use"}
        else{classList+="zettel_img in_use"}
        box =
        <div className="zettel" id={zettel.id} style={style}>
            <img alt="" style={{objectFit: "fill", borderRadius: "7px"}} className={classList} src={"https://dienste.badw.de:9996"+zettel.img_path+".jpg"}></img>
            {props.sh   ?
            <div className="zettel_menu">
                <span style={{float: "left", overflow: "hidden", maxHeight: "50px", maxWidth: "250px"}} dangerouslySetInnerHTML={parseHTML(zettel.lemma_display)}></span>
                <span style={{float: "right"}} dangerouslySetInnerHTML={parseHTML(zettel.zettel_sigel)}></span>
            </div>
            :null}
        </div>;
    } else {
        //style.height = "355px";
        box =
        <div className="zettel" id={zettel.id} style={style}>
            <div className="digitalZettel">
                <div className='digitalZettelLemma' dangerouslySetInnerHTML={parseHTML(zettel.lemma_display)}></div>
                <div className='digitalZettelWork' dangerouslySetInnerHTML={parseHTML(zettel.zettel_sigel)}></div>
                <div className='digitalZettelText' dangerouslySetInnerHTML={parseHTML(zettel.txt)}></div>
            </div>
        </div>;
    }
    return box;
}
function zettelBatchOptions(){return [[1, "Wort", "lemma_id", true],[2, "Sigel", "konkordanz_id", true]]} // [id, description, db-col, use AutoComplete Component]; first array will trigger "add new lemma" if not in auto-complete list.
function BatchInputType(props){
    switch(props.batchType){
        case 1:
            return <AutoComplete onChange={(value, id)=>{props.setBatchValue(value);props.setBatchValueId(id)}} value={props.batchValue} tbl="lemma" searchCol="ac_w" returnCol="ac_w" />;
            break;
        case 2:
            return <AutoComplete  value={props.batchValue} tbl="konkordanz" searchCol="zettel_sigel" returnCol="zettel_sigel" onChange={(value, id)=>{props.setBatchValue(value);props.setBatchValueId(id)}} />;
            break;
        default:
            return <div style={{color: "red"}}>Unbekannter Stapel-Typ!</div>         
    }
}
function ZettelAddLemmaContent(props){
    const [newLemma, setNewLemma]=useState(props.newLemma);
    const [newLemmaDisplay, setNewLemmaDisplay]=useState(props.newLemmaDisplay);
    const [homonym, setHomonym]=useState(0);
    const [farbe, setFarbe]=useState("gelb");
    const [reference, setReference]=useState("");
    const [referenceId, setReferenceId]=useState(null);
    const [normgraphie, setNormgraphie]=useState(0);
    const [domNormgraphie,setDomNormgraphie]=useState(0);
    const [verworfen, setVerworfen]=useState(0);
    const [unsicher, setUnsicher]=useState(0);
    const [comment, setComment]=useState("");
    const [errorLemma, setErrorLemma]=useState(false);
    const [errorLemmaDisplay, setErrorLemmaDisplay]=useState(false);
    const referenceColors = ["blau", "türkis", "lila"];
    useEffect(()=>{
        props.setLemmaObject({
            lemma: newLemma,
            lemma_simple: newLemmaDisplay,
            nr: homonym>0?homonym:null,
            farbe: farbe,
            reference_id: referenceColors.includes(farbe)?referenceId:null,
            normgraphie: normgraphie,
            dom_normgraphie: domNormgraphie,
            verworfen: verworfen,
            unsicher: unsicher,
            comment: comment!=""?comment:null
        });
        if(newLemma===""){setErrorLemma(true)}
        else{setErrorLemma(false)}

        if(newLemmaDisplay===""){setErrorLemmaDisplay(true)}
        else{setErrorLemmaDisplay(false)}

        if((newLemma==="" || newLemma.indexOf(" ")>-1)||newLemmaDisplay===""){props.setNewLemmaOK(false)}
        else{props.setNewLemmaOK(true)}
    },[newLemma,newLemmaDisplay,homonym,farbe,reference,normgraphie,domNormgraphie,verworfen,unsicher,comment]);
    return <>
        <Row className="mb-2">
            <Col>Wort:</Col>
            <Col><input type="text" className={errorLemma?"invalidInput":null} value={newLemma} onChange={event=>{setNewLemma(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>Wort: <small>(ohne Sonderzeichen)</small></Col>
            <Col><input type="text" className={errorLemmaDisplay?"invalidInput":null} value={newLemmaDisplay} onChange={event=>{setNewLemmaDisplay(event.target.value)}} /></Col>
        </Row>
        <Row>
            <Col>Farbe:</Col>
            <Col><SelectMenu options={[["gelb", "gelb"], ["grün", "grün"],
            ["rot", "rot"], ["blau", "blau"], ["lila", "lila"], ["türkis", "türkis"]]} onChange={event=>{setFarbe(event.target.value)}} /></Col>
        </Row>
        {referenceColors.includes(farbe)?<Row className="mt-2">
            <Col>Referenz:</Col>
            <Col><AutoComplete onChange={(value, id)=>{setReference(value);setReferenceId(id)}} tbl="lemma" col="ac_w" /></Col>
        </Row>:null}
        <Row className="mt-4 mb-2">
            <Col>Zahlzeichen:</Col>
            <Col><SelectMenu options={[[0, ""], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]]} onChange={event=>{setHomonym(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>Normgraphie:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setNormgraphie(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>DOM-Normgraphie:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setDomNormgraphie(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>verworfen:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setVerworfen(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col>unsicher:</Col>
            <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{setUnsicher(event.target.value)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col>Kommentar:</Col>
            <Col><textarea onChange={event=>{setComment(event.target.value)}} style={{resize: "false", width: "97%"}} value={comment}></textarea></Col>
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
            <Col><SelectMenu style={{width: "100%"}} value={type?type:0} options={[[0, "..."],[1, "verzettelt"],[2,"Exzerpt"],[3,"Index"],[4,"Literatur"], [6, "Index (unkl. Werk)"], [7, "Notiz"]]} onChange={event=>{setType(parseInt(event.target.value))}} classList="zettel_type" /></Col>
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
                <Col><input className={dateOwn?"invalidInput":null} style={{width:"100%"}} type="text" value={dateOwn?dateOwn:""} onChange={e=>{
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
export {
    arachneTbls,
    LemmaRow, LemmaHeader, lemmaSearchItems, LemmaAsideContent,
    zettelSearchItems, ZettelCard, zettelBatchOptions, BatchInputType, ZettelAddLemmaContent, ZettelSingleContent
}