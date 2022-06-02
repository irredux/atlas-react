import { Form, Row, Col, Button, Navbar, Modal, Offcanvas, Container, Spinner, Accordion } from "react-bootstrap";
import React, { useState, useEffect } from "react";

import { arachne } from "./../arachne.js";
import { Navigator, parseHTML, SearchBox, SelectMenu, Selector, AutoComplete, ToolKit, SearchHint, StatusButton } from "./../elements.js";

let zettelSearchItems;
let zettelBatchOptions;
let ZettelCard;
let BatchInputType;
let ZettelAddLemmaContent;

class Zettel extends React.Component{
    constructor(props){
        super(props);
        this.state = {zettelSearchItems: [["id", "ID"]],searchStatus: "", setupItems: null, showPreset: false, showDate: true, count:0, selectionDetail:{ids:[], currentId:null}};

        const loadModules = async () =>{    
            ({ zettelSearchItems, ZettelCard, zettelBatchOptions, BatchInputType, ZettelAddLemmaContent } = await import(`./../content/${props.PROJECT_NAME}.js`));
            this.setState({zettelSearchItems: zettelSearchItems()})
        };
        loadModules();
    }
    render(){
        const menuItems = [
            ["Suchergebnisse exportieren", async ()=>{
                const exportPdf = await arachne.zettel.search(this.state.query, {select: ["img_path", "date_display", "ac_web", "lemma_display", "txt"],export:true, order:this.state.queryOrder});
                console.log(exportPdf);
                window.open(exportPdf, "_blank");
            }]
        ];
        if(arachne.access("z_edit")){
            menuItems.push(["neuer Zettel erstellen", async ()=>{
                if(window.confirm("Soll ein neuer Zettel erstellt werden?")){
                    const newId = await arachne.zettel.save({type: 2, txt: "Neuer Zettel"});
                    this.setState({setupItems: [{id: 0, c: "id", o: "=", v:newId}]});
                }
            }]);
        }
        return <>
            <Navbar fixed="bottom" bg="light">
                <Container fluid>
                    <Navbar.Collapse className="justify-content-start">
                        <Navbar.Text>
                            <SearchBox
                            boxName="zettel"
                            searchQuery={(q,order) => {this.searchQuery(q,order)}}
                            setupItems={this.state.setupItems}
                            searchOptions={this.state.zettelSearchItems}
                            sortOptions={[['["id"]', "ID"], ['["lemma","lemma_nr","date_sort","date_type"]', "Datum"], ['["ocr_length"]', "Textlänge"]]}
                            status={this.state.searchStatus}
                            presetOptions={[
                                ['[{"id":2,"c":"lemma","o":"=","v":"NULL"}]', "Wortzuweisung"],
                                ['[{"id": 2,"c":"type","o":"=","v":"NULL"}]', "Typzuweisung"],
                                ['[{"id": 2, "c": "ac_web", "o": "=", "v": "NULL"},{"id": 3, "c": "type", "o": "!=", "v": 4},{"id": 4, "c": "type", "o": "!=", "v": 6},{"id": 5, "c": "type", "o": "!=", "v": 7}]', "Werkzuweisung"],
                                ['[{"id": 2, "c": "date_type", "o": "=", "v": 9},{"id": 3, "c": "date_own", "o": "!=", "v": "NULL"},{"id": 4, "c": "type", "o": "!=", "v": 3},{"id": 5, "c": "type", "o": "!=", "v": 6},{"id": 6, "c": "type", "o": "!=", "v": 7}]', "Datumszuweisung"],
                            ]}
                        />
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
                    showDetail={item => {
                        this.setState({selectionDetail: item.selection, itemDetail: item.item});
                    }}
                    showDate={this.state.showDate}
                />
                {this.state.count==0?<SearchHint />:null}
            </Container>
            {(this.state.selectionDetail.ids.length>0)?<ZettelAside onReload={()=>{this.loadPage(this.state.currentPage)}} onClose={()=>{this.setState({selectionDetail: {ids: []}})}} selection={this.state.selectionDetail} item={this.state.itemDetail} onUpdate={ids=>{this.reloadZettel(ids)}} showDate={this.state.showDate} openNextItem={()=>{this.openNextItem()}} toggleShowDate={()=>{
                if(this.state.showDate){this.setState({showDate: false})}
                else{this.setState({showDate: true})}
                
                }} />:""}
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
                cEls.push(<ZettelCard showDate={this.props.showDate} testProp={cEl.id+"_test"} id={cEl.id} item={cEl} key={cEl.id} />);
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
        if(element){this.props.showDetail({selection: selection, item: element.props.item});}
        else{this.props.showDetail({selection: selection, item: null});};
    }
}
function ZettelAside(props){
    const [mode, setMode] = useState("batch") // batch, single, lemma
    const [lastMode, setLastMode]=useState("batch") // mode activated when add lemma is closed.
    const [content, setContent] = useState(null);
    const [newLemma, setNewLemma] = useState(null);
    const [newLemmaDisplay, setNewLemmaDisplay] = useState(null);
    useEffect(()=>{
        switch(mode){
            case "batch":
                setContent(<ZettelAsideBatch  openAddLemma={(l,ld)=>openAddLemma(l,ld)} saveBatch={async (t,v,i)=>{return await saveBatch(t,v,i)}} onUpdate={props.onUpdate} selection={props.selection} />);
                break;
            case "single":
                setContent(null);
                break;
            case "lemma":
                setContent(<ZettelAddLemma newLemma={newLemma} newLemmaDisplay={newLemma} closeAddLemma={()=>{setMode(lastMode)}} />);
                break;
            default:
                setContent(null);
        }
    },[mode]);
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
    const openAddLemma=(l, ld)=>{setLastMode(mode);setNewLemma(l);setNewLemmaDisplay(ld);setMode("lemma")};
    return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={()=>{if(mode!="lemma"){props.onClose()}else{setMode(lastMode)}}}>{content}</Offcanvas>;
}
class ZettelAsideOLD extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            comments: [],
            addLemma: false,
            addLemmaNext: false,
            ressources: [],
            batchType: 1,
            id: this.props.item.id,
            type: this.props.item.type,
            date_display: this.props.item.date_display,
            date_type: this.props.item.date_type,
            lemma_id: this.props.item.lemma_id,
            lemma_ac: this.props.item.lemma_ac,
            work_id: this.props.item.work_id,
            ac_web: this.props.item.ac_web,
            date_own: this.props.item.date_own,
            date_own_display: this.props.item.date_own_display,
            txt: this.props.item.txt,
            /* */
            newLemma_Lemma: "",
            newLemma_LemmaDisplay: "",
            new_comment_txt: "",
        };
    }
    render(){
        if(this.state.addLemma){ // add lemma
            return <ZettelAddLemma closeAddLemma={()=>{this.setState({addLemma: false})}} newLemma={this.state.newLemma_Lemma} newLemmaDisplay={this.state.newLemma_LemmaDisplay} selection={this.props.selection} />;
        } else if(this.props.selection.ids.length===1){ // single zettel
            let cRes = [];
            if(this.state.ressources.length>0){
                let keyCount = -1;
                for(const item of this.state.ressources){
                    keyCount ++;
                    let url = item.url;
                    if(url===null||url===""){url=`/site/argos/${item.id}`}
                    cRes.push(<div key={keyCount}><a href={url} target="_blank" rel="noreferrer">{item.label}</a></div>);
                }
            }
            let dateOwn = null;
            let dateStyle = {
                borderTop: "1px solid #f2f2f2",
                paddingTop: "30px",
                display: "grid",
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr",
                rowGap: "10px",
                margin: "10px 0 30px 0"
                };
            if(this.state.date_type===9){
                dateStyle.gridTemplateRows = "1fr 1fr 1fr 1fr";
                dateOwn = [
                    <Row key="1" className="mt-4 mb-2">
                        <Col><span className="minorTxt"><b>Achtung:</b> Dieser Zettel benötigt eine <a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/09-HiwiHow:-Zettel-verknüpfen#anzeigedatumsortierdatum" target="_blank" rel="noreferrer">eigene Datierung</a>.</span></Col>
                    </Row>,
                    <Row key="2" className="mb-2">
                        <Col xs={4}>Sortierdatum:</Col>
                        <Col><input style={{width:"100%"}} type="text" value={this.state.date_own?this.state.date_own:""} onChange={e=>{
                        if(e.target.value===""){
                            this.setState({date_own: null});
                        } else if(!isNaN(e.target.value)&&e.target.value!==" "){
                            this.setState({date_own: parseInt(e.target.value)});
                        }else{
                            //this.props.status("error", "Sortierdatum muss eine Ganzzahl sein!");
                        }
                    }} /></Col>
                    </Row>,
                    <Row key="3" className="mb-4">
                        <Col xs={4}>Anzeigedatum:</Col>
                        <Col><input style={{width:"100%"}} type="text" value={this.state.date_own_display?this.state.date_own_display:""} onChange={e=>{this.setState({date_own_display: e.target.value})}} /></Col>
                    </Row>,
                ];
            }
            let commentBox = null;
            if(arachne.access("comment")&&this.state.comments.length>0){
                let commentList = [];
                for(const comment of this.state.comments){
                    commentList.push(<div key={comment.id} style={{marginBottom: "10px"}}><span className="minorTxt"><b>{comment.user}</b> am {comment.c_date?comment.c_date.substring(0, 10):null}:</span><br />{comment.comment}{arachne.me.id===comment.user_id||arachne.access("comment_moderator")?<i className="minorTxt" style={{cursor: "pointer"}} onClick={async ()=>{
                        if(window.confirm("Soll der Kommentar wirklich gelöscht werden? Dieser Schritt kann nicht rückgängig gemacht werden.")){
                            await arachne.comment.delete(comment.id);
                            this.loadComments();
                        }
                        
                    }}> (löschen)</i>:null}</div>);
                }
                commentBox = <div className="commentBox">{commentList}</div>;
            }
            let newComment = null;
            if(arachne.access("comment")){
                newComment = <div>
                <textarea placeholder="neuer Kommentar" style={{width: "100%", height: "100px"}} onChange={e=>{this.setState({new_comment_txt: e.target.value})}} value={this.state.new_comment_txt}></textarea>
                <StatusButton style={{fontSize: "15px", float: "right", marginRight: "60px"}} value="Kommentar erstellen" onClick={async ()=>{
                    if(this.state.new_comment_txt!=""){
                        await arachne.comment.save({
                            user_id: arachne.me.id,
                            zettel_id: this.state.id,
                            comment: this.state.new_comment_txt
                        });
                        this.setState({new_comment_txt: ""})
                        this.loadComments();
                        return {status: true};
                    }else{
                        return {status: false, error: "Geben Sie einen Kommentar-Text ein."};
                    }
                }} />
            </div>;
            }
            return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={this.props.onClose}>
                <Offcanvas.Header closeButton><Offcanvas.Title>ID {this.state.id}</Offcanvas.Title></Offcanvas.Header>
                <Offcanvas.Body>
                    <Accordion defaultActiveKey={0}>
                        <Accordion.Item eventKey={0}>
                            <Accordion.Header>Übersicht</Accordion.Header>
                            <Accordion.Body>
                            <Row className="mb-2">
                                <Col xs={4}>Zetteltyp:</Col>
                                <Col><SelectMenu style={{width: "100%"}} value={this.state.type?this.state.type:0} options={[[0, "..."],[1, "verzettelt"],[2,"Exzerpt"],[3,"Index"],[4,"Literatur"], [6, "Index (unkl. Werk)"], [7, "Notiz"]]} onChange={event=>{this.setState({type: parseInt(event.target.value)})}} classList="zettel_type" /></Col>
                            </Row>
                            <Row className="mb-2">
                                <Col xs={4}>Wort:</Col>
                                <Col><AutoComplete style={{width: "100%"}} onChange={(value, id)=>{this.setState({lemma_ac: value, lemma_id: id, newLemma_Lemma: value, newLemma_LemmaDisplay: value})}} value={this.state.lemma_ac?this.state.lemma_ac:""} tbl="lemma" searchCol="lemma" returnCol="lemma_ac" /></Col>
                            </Row>
                            {this.state.type!==4&&this.state.type<6&&<Row className="mb-2">
                                <Col xs={4}>Werk:</Col>
                                <Col><AutoComplete style={{width: "100%"}}  value={this.state.ac_web?this.state.ac_web:""} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={async (value, id)=>{
                                    this.setState({ac_web: value, work_id: id});
                                    const newDateType = await arachne.work.get({id: id}, {select: ["date_type"]});
                                    if(newDateType.length>0){
                                        this.setState({date_type: newDateType[0].date_type});
                                    }
                                }} /></Col>
                            </Row>}
                            {this.props.item.img_path===null&&<Row className="mb-2">
                                <Col xs={4}>Text:</Col>
                                <Col><textarea style={{width: "100%"}} value={this.state.txt} onChange={e=>{this.setState({txt: e.target.value})}}></textarea></Col>
                            </Row>}
                            {this.state.type!==4&&this.state.type<6&&this.state.work_id>0&&<Row className="mb-2">
                                <Col xs={4}>Datierung:</Col>
                                <Col><span style={{width: "100%"}} dangerouslySetInnerHTML={parseHTML(this.state.date_display)}></span></Col>
                            </Row>}
                            {dateOwn}
                            <Row className="mb-3 mt-4">
                                <Col>
                                    <Button style={{marginRight: "10px"}} onClick={()=>{this.saveDetail(true)}}>speichern&weiter</Button>
                                    <StatusButton onClick={()=>{return this.saveDetail();}} value="speichern" />
                                </Col>
                            </Row>
                            <Row>
                                <Col><Form>
                                    <Form.Check size="sm" type="switch" label="Details ein-/ausblenden" checked={this.props.showDate} onChange={this.props.toggleShowDate} />
                                </Form></Col>
                            </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                        {cRes.length>0&&<Accordion.Item eventKey={1}>
                            <Accordion.Header>Ressourcen</Accordion.Header>
                            <Accordion.Body>
                                {cRes}
                            </Accordion.Body>
                        </Accordion.Item>}
                        <Accordion.Item eventKey={2}>
                            <Accordion.Header>Kommentare</Accordion.Header>
                            <Accordion.Body>
                                {commentBox}
                                {newComment}
                            </Accordion.Body>
                        </Accordion.Item>
                        {arachne.access("admin")&&<Accordion.Item eventKey={3}>
                            <Accordion.Header>Zettel löschen</Accordion.Header>
                            <Accordion.Body>
                            <Button variant="danger" onClick={async ()=>{
                                if(window.confirm("Soll der Zettel wirklich gelöscht werden? Dieser Schritt kann nicht mehr rückgängig gemacht werden.")){
                                    await arachne.zettel.delete(this.state.id);
                                    this.props.onClose();
                                    this.props.onReload();
                                }
                            }}>Zettel löschen</Button>
                            </Accordion.Body>
                        </Accordion.Item>}
                    </Accordion>
                </Offcanvas.Body>
            </Offcanvas>
        } else { // batch
            return <ZettelAsideBatch  openAddLemma={(l,ld)=>this.openAddLemma(l,ld)} onUpdate={this.props.onUpdate} selection={this.props.selection} onClose={this.props.onClose} />;
        }
    }
    componentDidMount(){
        // loading ressources
        if(this.state.work_id>0){
            arachne.edition.get({work_id: this.state.work_id})
            .then(res => {
                this.setState({ressources: res});
            })
            .catch(e => {throw e;});
        }
        // loading comments
        this.loadComments();
    }
    componentDidUpdate(){
        if(this.state.id!==this.props.item.id){
            if(this.props.item.work_id>0){
                arachne.edition.get({work_id: this.props.item.work_id})
                .then(res => {
                    this.setState({
                        addLemma: false,
                        id: this.props.item.id,
                        type: this.props.item.type,
                        date_display: this.props.item.date_display,
                        date_type: this.props.item.date_type,
                        lemma_id: this.props.item.lemma_id,
                        lemma_ac: this.props.item.lemma_ac,
                        work_id: this.props.item.work_id,
                        ac_web: this.props.item.ac_web,
                        date_own: this.props.item.date_own,
                        date_own_display: this.props.item.date_own_display,
                        ressources: res
                    });
                })
                .catch(e => {throw e;});
            } else {this.setState({addLemma: false,
                id: this.props.item.id,
                type: this.props.item.type,
                date_display: this.props.item.date_display,
                date_type: this.props.item.date_type,
                lemma_id: this.props.item.lemma_id,
                lemma_ac: this.props.item.lemma_ac,
                work_id: this.props.item.work_id,
                ac_web: this.props.item.ac_web,
                date_own: this.props.item.date_own,
                date_own_display: this.props.item.date_own_display,
                ressources: []})
            }
            // loading comments
            if(arachne.access("comment")){
                arachne.comment.get({zettel_id: this.state.id})
                .then(comments=>{this.setState({comments: comments})})
                .catch(e=>{throw e;});
            }
        }
    }
    async loadComments(){
        if(arachne.access("comment")){
            const comments = await arachne.comment.get({zettel_id: this.state.id});
            this.setState({comments: comments});
        }
    }
    async saveDetail(next=false){
        if(!(this.state.date_own_display===null||this.state.date_own_display==="")&&(this.state.date_own===null||this.state.date_own==="")){
            return {status: -1, error: "Sie dürfen kein Anzeigedatum setzen, ohne ein Sortierdatum anzugeben!"}
        } else if(this.state.work_id>0&&this.state.date_type===9&&((this.state.date_own!=""&&this.state.date_own!=null&&!Number.isInteger(this.state.date_own))||((this.state.date_own===""||this.state.date_own===null)&&!window.confirm("Achtung: Dieser Zettel benötigt eine Datierung! Soll er trotzdem ohne Datierung gespeichert werden?")))){
            return {status: 0};
        } else if (this.state.date_type===9&&!(this.state.date_own===null||this.state.date_own==="")&&(this.state.date_own_display===null||this.state.date_own_display==="")){
            return {status: -1, error: "Setzen Sie ein Anzeigedatum für den Zettel!"};
        } else {
            let nVals = {
                id: this.state.id,
                type: this.state.type,
                user_id: arachne.me.id,
                txt: this.state.txt,
            };
            if(this.state.work_id>0){nVals.work_id = this.state.work_id}
            else{nVals.work_id = null}

            if(this.state.lemma_id===null&&this.state.newLemma_Lemma!==""){this.setState({addLemma: true, addLemmaNext: next})}
            else if(this.state.lemma_id>0){nVals.lemma_id = this.state.lemma_id}
            else {nVals.lemma_id = null}
            if(this.state.date_type===9&&this.state.date_own!=""&&Number.isInteger(this.state.date_own)){
                nVals.date_own = this.state.date_own;
                nVals.date_own_display = this.state.date_own_display;
            } else {
                nVals.date_own = null;
                nVals.date_own_display = null;
            }
            await arachne.zettel.save(nVals)
            if(next){
                document.querySelector("select.zettel_type").focus();
                this.props.openNextItem();
            }else{
                this.props.onUpdate([this.state.id]);
            }
            return {status: 1};
        }
    }
    openAddLemma(l, ld){
        this.setState({addLemma: true, newLemma_Lemma: l, newLemma_LemmaDisplay: ld});
    }
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
                <Col><StatusButton type="button" value="neues Wort erstellen" onClick={async ()=>{
                    if(newLemmaOK){
                        const newId = 1//await arachne.lemma.save(lemmaObject);
                        if(props.selection.ids.length===1){
                            props.closeAddLemma();
                            //this.setState({lemma_ac: this.state.newLemma_LemmaDisplay, lemma_id: newId});
                            //this.saveDetail(this.state.addLemmaNext);
                        } else {
                            props.closeAddLemma();
                            //this.setState({batch_lemma_ac: this.state.newLemma_LemmaDisplay, batch_lemma_id: newId});
                            //this.saveBatch();
                        }
                        return {status: true};
                    }else{
                        return {status: false, error: "Bitte füllen Sie alle Angaben korrekt aus!"}
                    }
                }} /><Button variant="secondary" style={{marginLeft: "10px"}} onClick={()=>{props.closeAddLemma()}}>abbrechen</Button></Col>
            </Row>
        </Offcanvas.Body>
    </>;
}

export { Zettel };