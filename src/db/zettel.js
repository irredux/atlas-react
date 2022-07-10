import { Form, Row, Col, Button, Navbar, Modal, Offcanvas, Container, Spinner, Accordion } from "react-bootstrap";
import React, { useState, useEffect } from "react";

import { arachne } from "./../arachne.js";
import { Navigator, parseHTML, SearchBox, SelectMenu, Selector, AutoComplete, ToolKit, SearchHint, StatusButton, CommentBox } from "./../elements.js";

let zettelSearchItems;
let zettelBatchOptions;
let ZettelCard;
let BatchInputType;
let ZettelAddLemmaContent;
let ZettelSingleContent;
let newZettelObject;
let exportZettelObject;
let zettelPresetOptions;
let zettelSortOptions;

class Zettel extends React.Component{
    constructor(props){
        super(props);
        this.state = {zettelSearchItems: [["id", "ID"]],searchStatus: "", setupItems: null, showPreset: false, showDetail: true, count:0, selectionDetail:{ids:[], currentId:null, sortOptions: null, presetOptions: null}};

        const loadModules = async () =>{    
            ({ zettelSearchItems, ZettelCard, zettelBatchOptions, BatchInputType, ZettelAddLemmaContent, ZettelSingleContent, newZettelObject, exportZettelObject, zettelPresetOptions, zettelSortOptions } = await import(`./../content/${props.PROJECT_NAME}.js`));
            this.setState({zettelSearchItems: zettelSearchItems(), sortOptions: zettelSortOptions(), presetOptions: zettelPresetOptions()})
        };
        loadModules();
    }
    render(){
        const menuItems = [
            ["Suchergebnisse exportieren", async ()=>{
                const exportPdf = await arachne.zettel.search(this.state.query, {select: exportZettelObject(), export:true, order:this.state.queryOrder});
                window.open(exportPdf, "_blank");
            }]
        ];
        if(arachne.access("z_edit")){
            menuItems.push(["neuer Zettel erstellen", async ()=>{
                if(window.confirm("Soll ein neuer Zettel erstellt werden?")){
                    const newId = await arachne.zettel.save(newZettelObject());
                    this.setState({setupItems: [{id: 0, c: "id", o: "=", v:newId}]});
                }
            }]);
        }
        return <>
            <Navbar fixed="bottom" bg="light">
                <Container fluid>
                    <Navbar.Collapse className="justify-content-start">
                        <Navbar.Text>
                            {this.state.sortOptions?<SearchBox
                                boxName="zettel"
                                searchQuery={(q,order) => {this.searchQuery(q,order)}}
                                setupItems={this.state.setupItems}
                                searchOptions={this.state.zettelSearchItems}
                                sortOptions={this.state.sortOptions}
                                status={this.state.searchStatus}
                                presetOptions={this.state.presetOptions}
                            />:null}
                        </Navbar.Text>
                    </Navbar.Collapse>
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text>
                        {this.state.count>0?
                        <Navigator loadPage={newPage=>{this.loadPage(newPage)}} currentPage={this.state.currentPage} maxPage={this.state.maxPage} />
                        :null}
                        </Navbar.Text>
                        <Navbar.Text>
                            <ToolKit menuItems={menuItems} />
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mainBody">
                <ZettelBox
                    loadPage={newPage => {this.loadPage(newPage)}}
                    currentElements={this.state.currentElements}
                    count={this.state.count}
                    currentPage={this.state.currentPage}
                    maxPage={this.state.maxPage}
                    presetSelection={this.state.presetSelection}
                    gridArea={(this.state.selectionDetail.ids.length>0)?"2/1/2/2":"2/1/2/3"}
                    toggleShowDetail={item => {
                        this.setState({selectionDetail: item.selection, itemDetail: item.item});
                    }}
                    showDetail={this.state.showDetail}
                />
                {this.state.count==0?<SearchHint />:null}
            </Container>
            {(arachne.access("z_edit")&&this.state.selectionDetail.ids.length>0)?<ZettelAside onReload={()=>{this.loadPage(this.state.currentPage)}} onClose={()=>{this.setState({selectionDetail: {ids: []}})}} selection={this.state.selectionDetail} item={this.state.itemDetail} onUpdate={ids=>{this.reloadZettel(ids)}} showDetail={this.state.showDetail} openNextItem={()=>{this.openNextItem()}} toggleShowDetail={()=>{this.setState({showDetail: !this.state.showDetail})}} />:""}
        </>;
    }
    async openNextItem(){// save current element
        let newItem = await arachne.zettel.get({id: this.state.itemDetail.id}); newItem = newItem[0];
        let currentElements = this.state.currentElements;
        const indexOfNewItem = currentElements.findIndex(i => i.id===newItem.id)
        currentElements[indexOfNewItem] = newItem;

        // load next element
        const lastIndex = this.state.currentElements.findIndex(i => i.id === this.state.itemDetail.id);
        if(this.state.currentElements.length>lastIndex+1){
            this.setState({currentElements: currentElements, itemDetail: this.state.currentElements[lastIndex+1], presetSelection: [this.state.currentElements[lastIndex+1].id]});
        }
    }
    async reloadZettel(ids){
        //await this.loadPage(0); // removes entry, if it doesnt match query!
        for(const id of ids){
            let newItem = await arachne.zettel.get({id: id}); newItem = newItem[0];
            let currentElements = this.state.currentElements;
            const indexOfNewItem = currentElements.findIndex(i => i.id===newItem.id)
            currentElements[indexOfNewItem] = newItem;
            this.setState({currentElements: currentElements, selectionDetail: {ids:ids}, itemDetail: newItem});
        }
    }
    async searchQuery(newQuery, order){
        this.setState({searchStatus: <Spinner animation="border" size="sm" />});
        const count = await arachne.zettel.search(newQuery, {count:true, order:order});
        const currentElements = await arachne.zettel.search(newQuery, {limit:50, order:order});
        if(count[0]["count"]>1){this.setState({searchStatus: `${count[0]["count"]} Einträge gefunden.`})}
        else if(count[0]["count"]===1){this.setState({searchStatus: "1 Eintrag gefunden."})}
        else{this.setState({searchStatus: "Keine Einträge gefunden."})}
        this.setState({
            query: newQuery,
            queryOrder: order,
            count: count[0]["count"],
            maxPage: Math.floor(count[0]["count"]/50)+1,
            currentPage: 1,
            currentElements: currentElements,
            selectionDetail: {ids:[]}
        });
    }
    async loadPage(newPage){
        const currentElements = await arachne.zettel.search(this.state.query, {limit:50, offset:((newPage-1)*50), order:this.state.queryOrder});
            this.setState({
                currentPage: newPage,
                currentElements: currentElements,
                selectionDetail: {ids:[]}
            });
    }
}
class ZettelBox extends React.Component{
    constructor(props){
        super(props);
        this.state = {selection: {currentId: null, ids:[]}}
    }
    render(){
        if(this.props.count>0){
            let cEls = [];
            for(const cEl of this.props.currentElements){
                cEls.push(<ZettelCard showDetail={this.props.showDetail} testProp={cEl.id+"_test"} id={cEl.id} item={cEl} key={cEl.id} />);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Selector multiSelect={true} className="zettel_box" selectCallback={
                    (item, selection)=>{this.selectCallback(item, selection)}
                } preset={this.props.presetSelection} >{cEls}</Selector>
            </div>);
        } else {
            return null;
        }
    }
    selectCallback(element, selection){
        if(element){this.props.toggleShowDetail({selection: selection, item: element.props.item});}
        else{this.props.toggleShowDetail({selection: selection, item: null});};
    }
}
function ZettelAside(props){
    const [mode, setMode] = useState(props.selection.ids.length===1?"single":"batch") // batch, single, lemma
    const [lastMode, setLastMode]=useState("batch") // mode activated when add lemma is closed.
    const [nextAfterLemmaAdd, setNextAfterLemmaAdd]=useState(false);
    const [content, setContent] = useState(null);
    const [newLemma, setNewLemma] = useState(null);
    const [newLemmaDisplay, setNewLemmaDisplay] = useState(null);
    useEffect(()=>{setMode(props.selection.ids.length===1?"single":"batch")},[props.selection.ids]);
    useEffect(()=>{
        switch(mode){
            case "batch":
                setContent(<ZettelAsideBatch  openAddLemma={(l,ld)=>openAddLemma(l,ld)} saveBatch={async (t,v,i)=>{return await saveBatch(t,v,i)}} onUpdate={props.onUpdate} selection={props.selection} />);
                break;
            case "single":
                setContent(<ZettelAsideSingle openAddLemma={(l, ld, n)=>openAddLemma(l, ld, n)} onClose={props.onClose} onReload={props.onReload} showDetail={props.showDetail} toggleShowDetail={()=>{props.toggleShowDetail()}} item={props.item} openNextItem={props.openNextItem} onUpdate={id=>{props.onUpdate(id)}} />);
                break;
            case "lemma":
                setContent(<ZettelAddLemma saveAfterAddLemma={async(l,l_id)=>{return await saveAfterAddLemma(l,l_id)}} newLemma={newLemma} newLemmaDisplay={newLemma} closeAddLemma={()=>{setMode(lastMode)}} />);
                break;
            default:
                setContent(null);
        }
    },[mode,props.item.id,props.showDetail]);
    const saveBatch = async(batchType,batchValue,batchValueId)=>{
        let newKey=null;
        let newValue=null;
        if(batchType===1&&batchValue!=""&&batchValueId===null){
            openAddLemma(batchValue, batchValue);
            return {status: true};
        } else if(zettelBatchOptions()[batchType-1][3]===true&&batchValueId!=null){
            newKey=zettelBatchOptions()[batchType-1][2];
            newValue=batchValueId;
        } else if(zettelBatchOptions()[batchType-1][3]===false&&batchValue!=null&&batchValue!=""){
            newKey=zettelBatchOptions()[batchType-1][2];
            newValue=batchValue;
        } else {
            return {status: false, error: "Bitte tragen Sie einen gültigen Wert ein."};
        }

        let newValueLst = [];
        for(const cId of props.selection.ids){
            let newValueObj = {id: cId, user_id: arachne.me.id}
            newValueObj[newKey] = newValue;
            newValueLst.push(newValueObj);
        }
        await arachne.zettel.save(newValueLst);
        props.onUpdate(props.selection.ids);
        return {status: true};
    }
    const openAddLemma=(l, ld,next=false)=>{setLastMode(mode);setNewLemma(l);setNewLemmaDisplay(ld);setMode("lemma");setNextAfterLemmaAdd(next)};
    const saveAfterAddLemma=async(lemma,lemma_id)=>{
        let re;
        if(props.selection.ids.length===1){
            await arachne.zettel.save({id: props.item.id, lemma_id: lemma_id})
            if(nextAfterLemmaAdd){props.openNextItem()}
        } else {
            re=await saveBatch(1,lemma, lemma_id);
        }
        setMode(lastMode);
        return re;
    };
    return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={()=>{if(mode!="lemma"){props.onClose()}else{setMode(lastMode)}}}>{content}</Offcanvas>;
}
function ZettelAsideSingle(props){
    const [commentCount, setCommentCount]=useState(0);
    const [ressourceLst, setRessourceLst]=useState([]);
    const [lemma, setLemma]=useState("");
    const [zettelObject, setZettelObject]=useState({});
    const [zettelObjectErr, setZettelObjectErr]=useState(null); // null=no err; {status: 1|2, msg: "err txt"}: 1 = prompt warning ("ok" means proceed saving data), 2 = error, dont save data
    useEffect(()=>{
        const fetchData=async()=>{
            setRessourceLst(await arachne.edition.get({work_id: zettelObject.work_id}));
        };
        if(zettelObject.work_id>0){fetchData()}
    },[zettelObject.work_id])
    const saveDetail=async(next=false)=>{
        if(zettelObjectErr&&zettelObjectErr.status===2){
            return {status: -1, error: zettelObjectErr.msg};
        }else if(zettelObjectErr===null||(zettelObjectErr.status===1&&window.confirm(zettelObjectErr.msg))){
            // save data
            let saveObj = zettelObject;
            saveObj.user_id = arachne.me.id;
            await arachne.zettel.save(saveObj)
            if(saveObj.lemma_id===null&&lemma!==""&&lemma!==null&&lemma!==undefined){
                console.log("here we are!", saveObj.lemma_id, lemma);
                document.querySelector(".onOpenSetFocus").focus();
                props.openAddLemma(lemma, lemma, next);
            }else if(next){
                document.querySelector(".onOpenSetFocus").focus();
                props.openNextItem();
            }else{
                props.onUpdate([props.item.id]);
            }
            return {status: 1};
        }else{
            return {status: 0};
        };
    }
    return <>
        <Offcanvas.Header closeButton><Offcanvas.Title>ID {props.item.id}</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body>
            <Accordion defaultActiveKey={0}>
                <Accordion.Item eventKey={0}>
                    <Accordion.Header>Übersicht</Accordion.Header>
                    <Accordion.Body>
                        <ZettelSingleContent setLemma={v=>{setLemma(v)}} setZettelObjectErr={err=>{setZettelObjectErr(err)}} setZettelObject={o=>{setZettelObject(o)}} item={props.item} />
                        <Row className="mb-3 mt-4">
                            <Col>
                                <StatusButton style={{marginRight: "10px"}} onClick={()=>{return saveDetail(true)}} value="speichern&weiter" />
                                <StatusButton onClick={()=>{return saveDetail()}} value="speichern" />
                            </Col>
                        </Row>
                        <Row>
                            <Col><Form>
                                <Form.Check size="sm" type="switch" label={props.showDetail?"Details ausblenden":"Details einblenden"} checked={props.showDetail} onChange={props.toggleShowDetail} />
                            </Form></Col>
                        </Row>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey={4}>
                    <Accordion.Header>Fliesstext</Accordion.Header>
                    <Accordion.Body>
                        <p>{props.item.ocr_text_corr}</p>
                        <p>{props.item.scan_id}</p>
                    </Accordion.Body>
                </Accordion.Item>
                {ressourceLst.length>0&&<Accordion.Item eventKey={1}>
                    <Accordion.Header>Ressourcen</Accordion.Header>
                    <Accordion.Body>
                        {ressourceLst.map(r=><div key={r.id}><a href={r.url===null||r.url===""?`/site/argos/${r.id}`:r.url} target="_blank" rel="noreferrer">{r.label}</a></div>)}
                    </Accordion.Body>
                </Accordion.Item>}
                {arachne.access("comment")?<Accordion.Item eventKey={2}>
                    <Accordion.Header>Kommentare{commentCount>0?<small style={{marginLeft: "5px"}}>({commentCount})</small>:null}</Accordion.Header>
                    <Accordion.Body>
                        <CommentBox tbl="zettel" id={props.item.id} setCommentCount={setCommentCount} />
                    </Accordion.Body>
                </Accordion.Item>:null}
                {arachne.access("admin")&&<Accordion.Item eventKey={3}>
                    <Accordion.Header>Zettel löschen</Accordion.Header>
                    <Accordion.Body>
                    <Button variant="danger" onClick={async ()=>{
                        if(window.confirm("Soll der Zettel wirklich gelöscht werden? Dieser Schritt kann nicht mehr rückgängig gemacht werden.")){
                            await arachne.zettel.delete(props.item.id);
                            props.onClose();
                            props.onReload();
                        }
                    }}>Zettel löschen</Button>
                    </Accordion.Body>
                </Accordion.Item>}
            </Accordion>
        </Offcanvas.Body>
    </>;
}
function ZettelAsideBatch(props){
    const [batchType, setBatchType] = useState(1);
    const [batchValue, setBatchValue] = useState("");
    const [batchValueId, setBatchValueId] = useState(null);
    let batch_options = zettelBatchOptions();
    return <>
        <Offcanvas.Header closeButton><Offcanvas.Title>{props.selection.ids.length} Zettel</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body>
            <Row className="mb-3">
                <Col>
                    <SelectMenu style={{width: "110px"}} options={batch_options} onChange={event=>{setBatchValue("");setBatchType(parseInt(event.target.value))}} />
                </Col>
                <Col><BatchInputType batchType={batchType} batchValue={batchValue} batchValueId={batchValueId} setBatchValue={v=>{setBatchValue(v)}} setBatchValueId={v=>{setBatchValueId(v)}} /></Col>
            </Row>
            <Row>
                <Col><StatusButton value="für alle übernehmen" onClick={async()=>{
                    const re=await props.saveBatch(batchType,batchValue,batchValueId);
                    setBatchValue("");
                    return re;
                }} /></Col>
            </Row>
        </Offcanvas.Body>
    </>;
}
function ZettelAddLemma(props){
    const [lemmaObject, setLemmaObject]=useState({});
    const [newLemmaOK, setNewLemmaOK]=useState(false); // ZettelAddLemmaContent checks validity of new lemma object and sets to newLemmaOK

    return <>
        <Offcanvas.Header closeButton><Offcanvas.Title>Soll ein neues Wort erstellt werden?</Offcanvas.Title></Offcanvas.Header>
        <Offcanvas.Body>
            <ZettelAddLemmaContent setNewLemmaOK={setNewLemmaOK} newLemma={props.newLemma} newLemmaDisplay={props.newLemmaDisplay} setLemmaObject={o=>{setLemmaObject(o)}} />
            <Row>
                <Col><StatusButton type="button" value="neues Wort erstellen" onClick={async()=>{
                    if(newLemmaOK){
                        const newId = await arachne.lemma.save(lemmaObject);
                        return await props.saveAfterAddLemma(lemmaObject.lemma,newId);
                    }else{
                        return {status: false, error: "Bitte füllen Sie alle Angaben korrekt aus!"}
                    }
                }} /><Button variant="secondary" style={{marginLeft: "10px"}} onClick={()=>{props.closeAddLemma()}}>abbrechen</Button></Col>
            </Row>
        </Offcanvas.Body>
    </>;
}

export { Zettel };