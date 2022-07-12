import { parseHTML, StatusButton, SelectMenu, AutoComplete, TableView } from "./../elements.js";
import { arachne } from "./../arachne.js";
import { useState, useEffect } from "react";
import { Col, Form, Row, Container, NavDropdown } from "react-bootstrap";
import 'chart.js/auto';
import { Bar, Pie } from "react-chartjs-2";

function arachneTbls(){
    return ["lemma", "work", "zettel", "user", "konkordanz", "opera", "comment", "etudaus", "ocr_jobs", "edition", "scan", "scan_lnk", "scan_paths", "statistics"];
}
/* ************************************************************************************* */
function LemmaHeader(){
	return <tr><th width="30%">Lemma</th><th width="20%">Farbe</th><th>Kommentar</th><th>dom en ligne</th></tr>;
}
const colors = {
    "gelb": "#E9AB17",
    "grün": "green",
    "blau": "#0000A0",
    "rot": "#C11B17",
    "lila": "#4B0082",
    "türkis": "#3f888f"
};
function LemmaRow(props){
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
        ["lemma_simple", "Wort"],
        ["lemma_id", "Wort-ID"],
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
            <img alt="" style={{objectFit: "fill", borderRadius: "7px"}} className={classList} src={"/dom"+zettel.img_path+".jpg"}></img>
            {props.showDetail?
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
        case 2:
            return <AutoComplete  value={props.batchValue} tbl="konkordanz" searchCol="zettel_sigel" returnCol="zettel_sigel" onChange={(value, id)=>{props.setBatchValue(value);props.setBatchValueId(id)}} />;
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
            comment: comment!==""?comment:null
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
    const [lemmaAc, setLemmaAc]=useState(props.item.ac_w);
    const [lemmaId, setLemmaId]=useState(props.item.lemma_id);
    const [sigel, setSigel]=useState(props.item.zettel_sigel);
    const [sigelId, setSigelId]=useState(props.item.konkordanz_id);
    const [txt, setTxt]=useState(props.item.txt);
    const [sigelPreview, setSigelPreview]=useState(null);
    useEffect(()=>{
        const fetchData=async()=>{
            const operaId = await arachne.konkordanz.get({id: sigelId}, {select: ["opera_id"]});
            if(operaId.length>0){
                const newSigelPreview = await arachne.opera.get({id: operaId[0].opera_id});
                console.log(newSigelPreview);
                if(newSigelPreview.length>0){setSigelPreview(newSigelPreview[0])}
                else{setSigelPreview(null)}
            }else{setSigelPreview(null)}
        };
        if(sigelId>0){fetchData()}else{setSigelPreview(null)}
    },[sigelId])
    useEffect(()=>{
        setLemmaAc(props.item.ac_w);
        setLemmaId(props.item.lemma_id);
        setSigel(props.item.zettel_sigel);
        setSigelId(props.item.konkordanz_id);
        setTxt(props.item.txt);
    },[props.item.id]);
    useEffect(()=>{
        props.setZettelObject({
            id: props.item.id,
            lemma_id: lemmaId>0?lemmaId:null,
            konkordanz_id: sigelId>0?sigelId:null,
            txt: txt,
        });
    },[txt,lemmaId,sigelId]);
    useEffect(()=>{props.setLemma(lemmaAc)},[lemmaAc]);
    return <>
        <Row className="mb-2">
            <Col xs={4}>Wort:</Col>
            <Col><AutoComplete classList="onOpenSetFocus" style={{width: "100%"}} onChange={(value, id)=>{setLemmaAc(value); setLemmaId(id)}} value={lemmaAc?lemmaAc:""} tbl="lemma" searchCol="ac_w" returnCol="ac_w" /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>Sigel:</Col>
            <Col><AutoComplete style={{width: "100%"}}  value={sigel?sigel:""} tbl="konkordanz" searchCol="zettel_sigel" returnCol="zettel_sigel" onChange={async (value, id)=>{setSigel(value);setSigelId(id)}} /></Col>
        </Row>
        {sigelPreview?<Row>
            <Col><small><b>{sigelPreview.sigel}</b> = <span dangerouslySetInnerHTML={parseHTML(sigelPreview.werk)}></span></small></Col>
        </Row>:null}
        {props.item.img_path===null&&<Row className="mb-2">
            <Col xs={4}>Text:</Col>
            <Col><textarea style={{width: "100%"}} value={txt} onChange={e=>{setTxt(e.target.value)}}></textarea></Col>
        </Row>}
    </>;
}
function newZettelObject(){return {txt: "Neuer Zettel"}}
function exportZettelObject(){return ["img_path", "zettel_sigel", "lemma_display", "txt"]}
function zettelPresetOptions(){return null}
function zettelSortOptions(){return [['["id"]', "ID"], ['["lemma_simple"]', "Lemma"]]}
/* ************************************************************************************* */
function MainMenuContent(props){


    return <>
        <NavDropdown.Item onClick={e => {props.loadMain(e, "konkordanz")}}>Konkordanz</NavDropdown.Item>
        <NavDropdown.Item onClick={e => {props.loadMain(e, "quellenverzeichnis")}}>Quellenverzeichnis</NavDropdown.Item>
        <NavDropdown.Item onClick={e => {props.loadMain(e, "etudaus")}}>Etudaus</NavDropdown.Item>
        <NavDropdown.Item onClick={e => {props.loadMain(e, "domressource")}}>Ressourcen</NavDropdown.Item>
    </>;
}
/* ************************************************************************************* */
function DOMOpera(props){
    const menuItems = [
        ["neuer Eintrag", async(that)=>{
            if(window.confirm("Soll ein neuer Eintrag erstellt werden?")){
                const newId = await arachne.opera.save({sigel: "neues Werk"});
                that.setState({newItemCreated: [{id: 0, c: "id", o: "=", v:newId}]});
            }
        }]
    ];
    const asideContent = [ // caption; type: t(ext-input), (text)a(rea), (auto)c(omplete); col names as array
        {caption: "dol-ID", type: "text", col: "db_id"},
        {caption: "Sigel", type: "text", col: "sigel"},
        {caption: "Quelle", type: "text", col: "werk"},
        {caption: "Bib-Grau", type: "text", col: "bibgrau"},
        {caption: "Bib-Zusatz", type: "text", col: "bibzusatz"},
        {caption: "Bib-Voll", type: "text", col: "bibvoll"},
    ];
    return <TableView
        tblName="opera"
        searchOptions={[["sigel", "Sigel"], ["id", "ID"], ["konkordanz_count", "verknpft. Konk."]]}
        sortOptions={[['["id"]', "ID"], ['["sigel"]', "Sigel"]]}
        menuItems={menuItems}
        tblRow={DOMOperaRow}
        tblHeader={<><th>Sigel</th><th>Titel der Quelle</th><th>Bibliographie</th><th>verknpft. Konkordanz-Einträge</th></>}
        asideContent={asideContent}
    />;
}
function DOMOperaRow(props){
    const [editionLst, setEditionLst]=useState([]);
    useEffect(()=>{
        const fetchData=async()=>{
            const newEditions = await arachne.edition.get({opera_id: props.cEl.id}, {select: ["id", "url", "label"]});
            setEditionLst(newEditions.map(e=><li key={e.id}><a href={e.url?e.url:`/dom/argos/${e.id}`} target="_blank" rel="noreferrer">{e.label}</a></li>));
        };
        fetchData();
    },[]);
    return <>
            <td title={"ID: "+props.cEl.id} dangerouslySetInnerHTML={parseHTML(props.cEl.sigel)}></td>
            <td dangerouslySetInnerHTML={parseHTML(props.cEl.werk)}></td>
            <td className="minorTxt">
                {props.cEl.bibgrau&&<p dangerouslySetInnerHTML={parseHTML(props.cEl.bibgrau)}></p>}
                {props.cEl.bibvoll&&<p dangerouslySetInnerHTML={parseHTML(props.cEl.bibvoll)}></p>}
                {props.cEl.bibzusatz&&<p dangerouslySetInnerHTML={parseHTML(props.cEl.bibzusatz)}></p>}
                {setEditionLst.length>0&&<ul className="noneLst">{editionLst}</ul>}
            </td>
            <td style={{textAlign: "right"}}>{props.cEl.konkordanz_count}</td>
        </>;
}
function Konkordanz(props){
    const menuItems = [
        ["neuer Eintrag", async(that)=>{
            if(window.confirm("Soll ein neuer Eintrag erstellt werden?")){
                const newId = await arachne.konkordanz.save({zettel_sigel: "neuer Verweis"});
                that.setState({newItemCreated: [{id: 0, c: "id", o: "=", v:newId}]});
            }
        }]
    ];
    const tblRow=(props)=>{
        return <><td title={"ID: "+props.cEl.id} dangerouslySetInnerHTML={parseHTML(props.cEl.zettel_sigel)}></td><td>{props.cEl.comment}</td><td>{props.cEl.opera_id&&<span>{props.cEl.opera} <i className="minorTxt">(ID: {props.cEl.opera_id})</i></span>}</td></>;
    };
    const asideContent = [ // caption; type: t(ext-input), (text)a(rea), (auto)c(omplete); col names as array
        {caption: "Zettel-Sigel", type: "text", col: "zettel_sigel"},
        {caption: "verknpft. Quelle", type: "auto", col: ["sigel", "opera_id"], search: {tbl: "opera", sCol: "sigel", rCol: "sigel"}},
        {caption: "Kommentar", type: "area", col: "comment"},
    ];
    return <TableView
        tblName="konkordanz"
        searchOptions={[["zettel_sigel", "Sigel"], ["id", "ID"], ["opera_id", "Werk-ID"]]}
        sortOptions={[['["id"]', "ID"], ['["zettel_sigel"]', "Sigel"]]}
        menuItems={menuItems}
        tblRow={tblRow}
        tblHeader={<><th>Angabe auf Zettel</th><th>Bemerkung</th><th>Quelle</th></>}
        asideContent={asideContent}
    />;
}
function Etudaus(props){
    const menuItems = [
        ["neuer Eintrag", async(that)=>{
            if(window.confirm("Soll ein neuer Eintrag erstellt werden?")){
                const newId = await arachne.etudaus.save({zettel_sigel: "neuer Verweis"});
                that.setState({newItemCreated: [{id: 0, c: "id", o: "=", v:newId}]});
            }
        }]
    ];
    const tblRow=(props)=>{
        return <><td title={"ID: "+props.cEl.id} dangerouslySetInnerHTML={parseHTML(props.cEl.sigel)}></td><td dangerouslySetInnerHTML={parseHTML(props.cEl.werk)}></td><td dangerouslySetInnerHTML={parseHTML(props.cEl.opera)}></td></>;
    };
    const asideContent = [ // caption; type: t(ext-input), (text)a(rea), (auto)c(omplete); col names as array
        {caption: "Sigel", type: "text", col: "sigel"},
        {caption: "verknpft. Quelle", type: "auto", col: ["opera", "opera_id"], search: {tbl: "opera", sCol: "sigel", rCol: "sigel"}},
        {caption: "Titel der Quelle", type: "area", col: "werk"},
    ];
    return <TableView
        tblName="etudaus"
        searchOptions={[["sigel", "Sigel"], ["id", "ID"], ["opera_id", "Werk-ID"], ["werk", "Quelle"]]}
        sortOptions={[['["id"]', "ID"], ['["sigel"]', "Sigel"]]}
        menuItems={menuItems}
        tblRow={tblRow}
        tblHeader={<><th>Angabe auf Zettel</th><th>Werk</th><th>Quelle</th></>}
        asideContent={asideContent}
    />;
}
function DOMRessource(props){
    const menuItems = [
        ["neuer Eintrag", async(that)=>{
            if(window.confirm("Soll ein neuer Eintrag erstellt werden?")){
                const newId = await arachne.edition.save({editor: "EditorIn", year: 2022});
                that.setState({newItemCreated: [{id: 0, c: "id", o: "=", v:newId}]});
            }
        }]
    ];
    const tblRow=(props)=>{
        return <><td title={"ID: "+props.cEl.id}>{props.cEl.editor} {props.cEl.year}</td><td>{props.cEl.ac_web} <small>(ID {props.cEl.opera_id})</small></td></>;
    };
    const asideContent = [ // caption; type: t(ext-input), (text)a(rea), (auto)c(omplete); col names as array
        {caption: "EditorIn", type: "text", col: "editor"},
        {caption: "Jahr", type: "text", col: "year"},
        {caption: "verknpft. Werk", type: "auto", col: ["ac_web", "opera_id"], search: {tbl: "opera", sCol: "sigel", rCol: "sigel"}},
        {caption: <span>URL <small>(extern)</small></span>, type: "text", col: "url"},
        {caption: <span>Pfad <small>(auf dem Server)</small></span>, type: "text", col: "path"},
        {caption: "Kommentar", type: "area", col: "comment"},
        {caption: "Seiten-verhältnis", type: "text", col: "aspect_ratio"},
    ];
    return <TableView
        tblName="edition"
        searchOptions={[["id", "ID"], ["editor", "EditorIn"], ["year", "Jahr"]]}
        sortOptions={[['["id"]', "ID"]]}
        menuItems={menuItems}
        tblRow={tblRow}
        tblHeader={<><th>Kürzel</th><th>verknpft. Werk</th></>}
        asideContent={asideContent}
    />;
}
/* ************************************************************************************* */
const fetchIndexBoxData=async()=>{
    let wl = await arachne.lemma.getAll({select: ["id", "lemma_display", "lemma_simple", "nr", "farbe"], order: ["lemma_simple"]})
    wl=wl.map(w=>{
        const lemma = `<span style="color: ${colors[w.farbe]}">${w.lemma_display}</span>`;
        return {id: w.id, lemma_display: lemma, lemma: w.lemma_simple?w.lemma_simple.toLowerCase():""}
    });
    return wl;
}
function IndexBoxDetail(props){
    const [lemma, setLemma] = useState(null);
    const [zettel, setZettel] = useState(null);
    useEffect(()=>{
        const fetchData=async()=>{
            const newLemma = await arachne.lemma.get({id: props.lemma_id});
            setLemma(newLemma[0]);
            const newZettel = await arachne.zettel.get({lemma_id: props.lemma_id});
            setZettel(newZettel);
        };
        setLemma(null);
        setZettel(null);
        fetchData();
    }, [props.lemma_id]);
    return (lemma?<>
            <h1><span dangerouslySetInnerHTML={parseHTML(lemma.lemma_display)}></span><small style={{fontSize: "40%", marginLeft: "10px"}}>(ID {lemma.id})</small></h1>
            <div>{lemma.URL?<a href={"https://dom-en-ligne.de/"+lemma.URL} target="_blank">zum Artikel</a>:<span>Kein Artikel verfügbar.</span>}</div>
            <div>{zettel!==null?zettel.length===0?<span>Keine Zettel mit diesem Lemma verknüpft!</span>:zettel.map(z=><div key={z.id}><div><img style={{width: arachne.options.z_width}} src={"https://dienste.badw.de:9999/dom"+z.img_path+".jpg"} /></div><div>{z.opera} ({z.id})</div></div>):<span>Zettel werden geladen...</span>}</div>
        </>:<div>Daten werden geladen...</div>);
}
/* ************************************************************************************* */
function StatisticsChart(props){
    let returnChart = null;
    switch(props.name){
        case "lemma_letter":
            returnChart=<div style={{marginBottom: "80px", margin: "auto", width: "70%", height: "600px"}}><h4>nach Buchstaben</h4><Bar options={{plugins: {legend:{display: false, position: "bottom"}}, scales: {x: {stacked: true}, y: {stacked: true}}}} data={{
                labels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z"],
                datasets: [
                  {
                    label: 'blau',
                    data: props.data[0],
                    backgroundColor: colors.blau,
                    borderColor: colors.blau,
                    borderWidth: 1,
                  },
                  {
                    label: 'lila',
                    data: props.data[1],
                    backgroundColor: colors.lila,
                    borderColor: colors.lila,
                    borderWidth: 1,
                  },
                  {
                    label: 'türkis',
                    data: props.data[2],
                    backgroundColor: colors["türkis"],
                    borderColor: colors["türkis"],
                    borderWidth: 1,
                  },
                  {
                    label: 'rot',
                    data: props.data[3],
                    backgroundColor: colors.rot,
                    borderColor: colors.rot,
                    borderWidth: 1,
                  },
                  {
                    label: 'grün',
                    data: props.data[4],
                    backgroundColor: colors["grün"],
                    borderColor: colors["grün"],
                    borderWidth: 1,
                  },
                  {
                    label: 'gelb',
                    data: props.data[5],
                    backgroundColor: colors.gelb,
                    borderColor: colors.gelb,
                    borderWidth: 1,
                  },
                ],
            }} /></div>;
            break;
        case "lemma_farbe":
            returnChart=<div style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Farbe</h4><Pie options={{plugins: {legend:{display: true, position: "bottom"}}}} data={{
                labels: ["blau", "gelb", "grün", "lila", "rot", "türkis", "keine"],
                datasets: [
                  {
                    label: '',
                    data: props.data,
                    backgroundColor: [colors.blau, colors.gelb, colors["grün"], colors.lila, colors.rot, colors["türkis"], '#EAF2F3'],
                    borderColor: [colors.blau, colors.gelb, colors["grün"], colors.lila, colors.rot, colors["türkis"], '#EAF2F3'],
                    borderWidth: 1,
                  },
                ],
            }} /></div>;
            break;
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
            returnChart=<div style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Farbe</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={{
                    labels: ["blau", "gelb", "grün", "lila", "rot", "türkis", "keine"],
                    datasets: [
                      {
                        label: '# of Votes',
                        data: props.data,
                        backgroundColor: [colors.blau, colors.gelb, colors["grün"], colors.lila, colors.rot, colors["türkis"], '#EAF2F3'],
                        borderColor: [colors.blau, colors.gelb, colors["grün"], colors.lila, colors.rot, colors["türkis"], '#EAF2F3'],
                        borderWidth: 1,
                      },
                    ],
                }} /></div>;
            break;
        case "zettel_created_changed":
            returnChart=<div style={{marginBottom: "80px", width: "100%", height: "400px"}}><h4>nach Jahren</h4><Bar options={{aspectRatio: false, plugins: {legend:{display: true, position: "bottom"}}}} data={{
                labels: ["2021", "2022"],
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
            returnChart=<div style={{marginBottom: "80px", margin: "auto", width: "70%", height: "600px"}}><h4>nach Buchstaben</h4><Bar options={{plugins: {legend:{display: false, position: "bottom"}}, scales: {x: {stacked: true}, y: {stacked: true}}}} data={{
                labels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z"],
                datasets: [
                  {
                    label: 'blau',
                    data: props.data[0],
                    backgroundColor: colors.blau,
                    borderColor: colors.blau,
                    borderWidth: 1,
                  },
                  {
                    label: 'lila',
                    data: props.data[1],
                    backgroundColor: colors.lila,
                    borderColor: colors.lila,
                    borderWidth: 1,
                  },
                  {
                    label: 'türkis',
                    data: props.data[2],
                    backgroundColor: colors["türkis"],
                    borderColor: colors["türkis"],
                    borderWidth: 1,
                  },
                  {
                    label: 'rot',
                    data: props.data[3],
                    backgroundColor: colors.rot,
                    borderColor: colors.rot,
                    borderWidth: 1,
                  },
                  {
                    label: 'grün',
                    data: props.data[4],
                    backgroundColor: colors["grün"],
                    borderColor: colors["grün"],
                    borderWidth: 1,
                  },
                  {
                    label: 'gelb',
                    data: props.data[5],
                    backgroundColor: colors.gelb,
                    borderColor: colors.gelb,
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
function DOM_Import_Ressource(props){
    const [scanWork, setScanWork] = useState();
    const [scanId, setScanId] = useState();
    const [scanEditor, setScanEditor] = useState();
    const [scanYear, setScanYear] = useState();
    const [scanPath, setScanPath] = useState();
    const [scanFiles, setScanFiles] = useState();
    return <>
        <Row className="mb-2">
            <Col xs={3}>Quelle:</Col>
            <Col><AutoComplete  style={{width: "100%"}} value={scanWork?scanWork:""} tbl="opera" searchCol="sigel" returnCol="sigel" onChange={async (value, id)=>{setScanWork(value);setScanId(id)}} /></Col>
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
            <Col><input type="text" style={{width: "100%"}} value={scanPath?scanPath:""} placeholder="/A/Abaco/" onChange={e=>{setScanPath(e.target.value)}} /></Col>
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
                    return {status: false, error: "Kein gültiges Opus ausgewählt!"};
                } else if(scanPath&&scanId){
                    return props.importRessource({
                        opera_id: scanId,
                        editor: scanEditor,
                        year: scanYear,
                        path: scanPath,
                        url: "",
                    }, scanFiles);
                    
                } else{return {status: false, error: "Geben Sie einen gültigen Pfad ein!"};}
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
    DOMOpera, Konkordanz, Etudaus, DOMRessource,
    fetchIndexBoxData, IndexBoxDetail,
    StatisticsChart,
    DOM_Import_Ressource,
}