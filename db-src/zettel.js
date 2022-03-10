import { Form, Row, Col, Button, Navbar, Offcanvas, Container, Spinner, Accordion } from "react-bootstrap";
import React from "react";

import { arachne } from "./arachne.js";
import { Navigator, parseHTML, SearchBox, SelectMenu, Selector, AutoComplete, ToolKit, SearchHint, StatusButton } from "./elements.js";

class Zettel extends React.Component{
    constructor(props){
        super(props);
        this.state = {searchStatus: "", setupItems: null, showPreset: false, showDate: true, count:0, selectionDetail:{ids:[], currentId:null}};
    }
    render(){
        return <>
            <Navbar fixed="bottom" bg="light">
                <Container fluid>
                    <Navbar.Collapse className="justify-content-start">
                        <Navbar.Text>
                            <SearchBox
                            boxName="zettel"
                            searchQuery={(q,order) => {this.searchQuery(q,order)}}
                            setupItems={this.state.setupItems}
                            searchOptions={[
                                ["lemma", "Wort"],
                                ["type", "Typ"],
                                ["id", "ID"],
                                ["ac_web", "Werk"],
                                ["date_type", "Datum-Typ"],
                                ["date_own", "eigenes Sortierdatum"],
                                ["date_own_display", "eigenes Anzeigedatum"],
                                ["auto", "Automatisierung"],
                                ["ocr_length", "Textlänge"],
                            ]}
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
                            {arachne.access("z_edit")&&<ToolKit menuItems={[
                                    ["neuer Zettel erstellen", async ()=>{
                                        if(window.confirm("Soll ein neuer Zettel erstellt werden?")){
                                            const newId = await arachne.zettel.save({type: 2, txt: "Neuer Zettel"});
                                            this.setState({setupItems: [{id: 0, c: "id", o: "=", v:newId}]});
                                        }
                                    }]
                                ]} />}
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
                {/*<Navigator loadPage={newPage=>{this.props.loadPage(newPage)}} currentPage={this.props.currentPage} maxPage={this.props.maxPage} />*/}
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
class ZettelCard extends React.Component{
    render(){
        const zettel = this.props.item;
        let style = {height: arachne.options.z_height+"px", width: arachne.options.z_width+"px"};
        
        if(zettel.img_path!=null){
            let classList = "";
            if(zettel.in_use===0){classList+="zettel_img no_use"}
            else{classList+="zettel_img in_use"}
            const box =
            <div className="zettel" id={zettel.id} style={style}>
                <img alt="" style={{objectFit: "fill", borderRadius: "7px"}} className={classList} src={zettel.img_path+".jpg"}></img>
                {this.props.showDate?<div className="zettel_msg" dangerouslySetInnerHTML={parseHTML(zettel.date_own_display?zettel.date_own_display:zettel.date_display)}></div>:null}
                {this.props.showDate?
                <div className="zettel_menu">
                    <span style={{float: "left", overflow: "hidden", maxHeight: "50px", maxWidth: "250px"}} dangerouslySetInnerHTML={parseHTML(zettel.lemma_display)}></span>
                    <span style={{float: "right"}} dangerouslySetInnerHTML={parseHTML(zettel.opus)}></span>
                </div>
                :null}
            </div>;
            return box;
        } else {
            //style.height = "355px";
            const box =
            <div className="zettel" id={zettel.id} style={style}>
                <div className="digitalZettel">
                    <div className='digitalZettelLemma' dangerouslySetInnerHTML={parseHTML(zettel.lemma_display)}></div>
                    <div className='digitalZettelDate' dangerouslySetInnerHTML={parseHTML(zettel.date_display)}></div>
                    <div className='digitalZettelWork' dangerouslySetInnerHTML={parseHTML(zettel.opus)}></div>
                    <div className='digitalZettelText' dangerouslySetInnerHTML={parseHTML(zettel.txt)}></div>
                </div>
            </div>;
            return box;
        }
    }
}
class ZettelAside extends React.Component{
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
            batch_lemma_id: null,
            batch_lemma_ac: "",
            batch_work_id: null,
            batch_ac_web: "", // = work_ac
            batch_type: null,
            batch_project: null,
            new_comment_txt: "",
        };
    }
    render(){
        if(this.state.addLemma){ // add lemma
            return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={()=>{this.setState({addLemma: false})}}>
                <Offcanvas.Header closeButton><Offcanvas.Title>Soll ein neues Wort erstellt werden?</Offcanvas.Title></Offcanvas.Header>
                <Offcanvas.Body>
                    <Row className="mb-4">
                        <Col><a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/10-WikiHow:-Umlemmatisierung" target="_blank" rel="noreferrer">Hier</a> finden Sie Informationen zum Erstellen neuer Wörter.</Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>Wort:</Col>
                        <Col><input type="text" value={this.state.newLemma_Lemma} onChange={event=>{this.setState({newLemma_Lemma: event.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-4">
                        <Col>Wort-Anzeige:</Col>
                        <Col><input type="text" value={this.state.newLemma_LemmaDisplay} onChange={event=>{this.setState({newLemma_LemmaDisplay: event.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>Zahlzeichen:</Col>
                        <Col><SelectMenu options={[[0, ""], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]]} onChange={event=>{this.setState({newLemma_Homonym: event.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>im Wörterbuch:</Col>
                        <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({newLemma_MLW: event.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>Stern:</Col>
                        <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({newLemma_Stern: event.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-4">
                        <Col>Fragezeichen:</Col>
                        <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({newLemma_LemmaFrage: event.target.value})}} /></Col>
                    </Row>
                    <Row>
                        <Col><StatusButton type="button" value="neues Wort erstellen" onClick={async ()=>{
                            if(this.state.newLemma_Lemma==="" || this.state.newLemma_Lemma.indexOf(" ")>-1){
                                return {status: false, error: "Bitte ein gültiges Wort eintragen!"}
                            } else if(this.state.newLemma_LemmaDisplay===""){
                                return {status: false, error: "Bitte tragen Sie eine gültige Wort-Anzeige ein!"}
                            } else {
                                let newLemmaValue = {
                                    lemma: this.state.newLemma_Lemma,
                                    lemma_display: this.state.newLemma_LemmaDisplay,
                                    MLW: this.state.newLemma_MLW,
                                    Fragezeichen: this.state.newLemma_LemmaFrage,
                                    Stern: this.state.newLemma_Stern,
                                };
                                if(this.state.newLemma_Homonym>0){newLemmaValue.lemma_nr=this.state.newLemma_Homonym}
                                const newId = await arachne.lemma.save(newLemmaValue);
                                if(this.props.selection.ids.length===1){
                                    this.setState({lemma_ac: this.state.newLemma_LemmaDisplay, lemma_id: newId, addLemma: false});
                                    this.saveDetail(this.state.addLemmaNext);
                                } else {
                                    this.setState({batch_lemma_ac: this.state.newLemma_LemmaDisplay, batch_lemma_id: newId, addLemma: false});
                                    this.saveBatch();
                                }
                                return {status: true};
                            }
                        }} /><Button variant="secondary" style={{marginLeft: "10px"}} onClick={()=>{this.setState({addLemma: false})}}>abbrechen</Button></Col>
                    </Row>
                </Offcanvas.Body>
            </Offcanvas>;
        } else if(this.props.selection.ids.length===1){ // single zettel
            let cRes = [];
            if(this.state.ressources.length>0){
                let keyCount = -1;
                for(const item of this.state.ressources){
                    keyCount ++;
                    let url = item.url;
                    if(url===null||url===""){url=`/site/viewer/${item.id}`}
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
            let inputType = null;
            switch(this.state.batchType){
                case 1:
                    inputType = <AutoComplete onChange={(value, id)=>{this.setState({batch_lemma_ac: value, batch_lemma_id: id})}} value={this.state.batch_lemma_ac} tbl="lemma"  searchCol="lemma" returnCol="lemma_ac" />;
                    break;
                case 2:
                    inputType = <AutoComplete  value={this.state.batch_ac_web} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={(value, id)=>{this.setState({batch_ac_web: value, batch_work_id: id})}} />;
                    break;
                case 3:
                    inputType = 
                    <SelectMenu style={{width: "86%"}} options={[[0, "..."],[1, "verzettelt"],[2,"Exzerpt"],[3,"Index"],[4,"Literatur"], [6, "Index (unkl. Stelle)"], [7, "Notiz"]]} onChange={event=>{this.setState({batch_type: event.target.value})}} />;
                    break;
                default:
                    inputType = <div style={{color: "red"}}>Unbekannter Stapel-Typ!</div>         
            }
            let batch_options = [[1, "Wort"],[2, "Werk"],[3,"Zettel-Typ"]];
            return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={this.props.onClose}>
                <Offcanvas.Header closeButton><Offcanvas.Title>{this.props.selection.ids.length} Zettel</Offcanvas.Title></Offcanvas.Header>
                <Offcanvas.Body>
                    <Row className="mb-3">
                        <Col><SelectMenu style={{width: "110px"}} options={batch_options} onChange={event=>{
                                this.setState({batchType: parseInt(event.target.value)})
                                }} /></Col>
                        <Col>{inputType}</Col>
                    </Row>
                    <Row>
                        <Col><StatusButton value="für alle übernehmen" onClick={()=>{return this.saveBatch()}} /></Col>
                    </Row>
                </Offcanvas.Body>
            </Offcanvas>;
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
    async saveBatch(){
        let skipSave = false;
        let newValue = "";
        let newKey = "";
        if(this.state.batchType===1&&this.state.batch_lemma_id!=null){newKey="lemma_id";newValue=this.state.batch_lemma_id}
        else if(this.state.batchType===1&&this.state.batch_lemma_id===null&&this.state.batch_lemma_ac!=""){skipSave=true;this.setState({addLemma: true, newLemma_Lemma:this.state.batch_lemma_ac, newLemma_LemmaDisplay: this.state.batch_lemma_ac});return {status: true};}
        else if(this.state.batchType===2&&this.state.batch_work_id!=null){newKey="work_id";newValue=this.state.batch_work_id}
        else if(this.state.batchType===3&&this.state.batch_type!=null){newKey="type";newValue=this.state.batch_type}
        else if(this.state.batchType===4&&this.state.batch_project!=null){newKey="project";newValue=this.state.batch_project}
        else{skipSave=true;return {status: false, error: "Bitte tragen Sie einen gültigen Wert ein."};}
        if(skipSave===false&&this.state.batchType<4){
            let newValueLst = [];
            for(const cId of this.props.selection.ids){
                let newValueObj = {id: cId, user_id: arachne.me.id}
                newValueObj[newKey] = newValue;
                newValueLst.push(newValueObj);
            }
            await arachne.zettel.save(newValueLst);
            this.props.onUpdate(this.props.selection.ids);
            return {status: true};
        }else if(skipSave===false&&this.state.batchType===4){
            const defaultArticle = await arachne.article.get({"project_id": this.state.batch_project, sort_nr: 0, parent_id: 0});
            if(defaultArticle.length!=1){alert("Ein Fehler ist aufgetreten: Die Zettel können dem Projekt nicht zugewiesen werden!")}
            else{
                const newLinks = this.props.selection.ids.map(i=>{return {zettel_id: i, article_id: defaultArticle[0].id};});
                await arachne.zettel_lnk.save(newLinks);
                return {status: true};
            }
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
}

export { Zettel };
