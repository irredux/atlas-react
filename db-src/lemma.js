import { Col, Table, Offcanvas, Navbar, Row, Container, Spinner } from "react-bootstrap";
import React from "react";
import { arachne } from "./arachne.js";
import { Navigator, parseHTML, parseHTMLPreview, SearchBox, SelectMenu, ToolKit, SearchHint, StatusButton } from "./elements.js";

class Lemma extends React.Component{
    constructor(props){
        super(props);
        this.state = {item: null, newItemCreated: null};
    }

    render(){
        return <>
            <Navbar fixed="bottom" bg="light">
                <Container fluid>
                    <Navbar.Collapse className="justify-content-start">
                        <Navbar.Text>
                            <SearchBox
                            boxName="lemma"
                            searchQuery={(q,order) => {this.searchQuery(q,order)}}
                            setupItems={this.state.newItemCreated}
                            searchOptions={[
                                ["lemma", "Wort"],
                                ["lemma_ac", "Wort-Anzeige"],
                                ["id", "ID"],
                                ["dicts", "Wörterbücher"],
                                ["comment", "Kommentar"],
                                ["lemma_nr", "Zahlzeichen"],
                                ["MLW", "MLW"],
                                ["Stern", "Stern"],
                                ["Fragezeichen", "Fragezeichen"],
                            ]}
                            sortOptions={[['["id"]', "ID"], ['["lemma"]', "Lemma"]]}
                            status={this.state.searchStatus}
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
                            {arachne.access("l_edit")&&<ToolKit menuItems={[
                                    ["neues Wort", async ()=>{
                                        if(window.confirm("Soll ein neues Wort erstellt werden?")){
                                            const newId = await arachne.lemma.save({lemma_display:"Neues Wort", lemma:"Neues Wort"});
                                            this.setState({newItemCreated: [{id: 0, c: "id", o: "=", v:newId}]});
                                        }
                                    }]
                                ]} />}
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mainBody">
                <LemmaBox
                    loadMain={(e, res)=>{this.props.loadMain(e, res)}}
                    loadPage={newPage => {this.loadPage(newPage)}}
                    currentElements={this.state.currentElements}
                    count={this.state.count}
                    currentPage={this.state.currentPage}
                    maxPage={this.state.maxPage}
                    gridArea={(this.state.item)?"2/1/2/2":"2/1/2/3"}
                    showDetail={item => {
                        this.setState({item: item});
                    }}
                />
            </Container>
            {(this.state.item)?<LemmaAside item={this.state.item} onUpdate={id=>{this.reloadEntry(id)}} onReload={()=>{this.loadPage(this.state.currentPage)}} onClose={()=>{this.setState({item: null})}} />:""}
        </>;
    }
    async reloadEntry(id){
        let newItem = await arachne.lemma.get({id: id}); newItem = newItem[0];
        let currentElements = this.state.currentElements;
        const indexOfNewItem = currentElements.findIndex(i => i.id===newItem.id)
        currentElements[indexOfNewItem] = newItem;
        this.setState({currentElements: currentElements, item: newItem});
    }
    async searchQuery(newQuery, order){
        this.setState({searchStatus: <Spinner animation="border" size="sm" />});
        const count = await arachne.lemma.search(newQuery, {count:true, order:order});
        const currentElements = await arachne.lemma.search(newQuery, {limit:50, order:order});
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
        const currentElements = await arachne.lemma.search(this.state.query, {limit:50, offset:((newPage-1)*50), order:this.state.queryOrder});
            this.setState({
                currentPage: newPage,
                currentElements: currentElements,
                selectionDetail: {ids:[]}
            });
    }
}
class LemmaBox extends React.Component{
    constructor(props){
        super(props);
        this.state = {selection: {currentId: null, ids:[]}}
    }
    render(){
        if(this.props.count>0){
            let cEls = [];
            for(const cEl of this.props.currentElements){
                cEls.push(<tr key={cEl.id} id={cEl.id} onDoubleClick={e=>{this.props.showDetail(this.props.currentElements.find(i =>i.id === parseInt(e.target.closest("tr").id)))}}><td title={"ID: "+cEl.id}><a dangerouslySetInnerHTML={parseHTML(cEl.lemma_display)} onClick={e=>{
                    localStorage.setItem("searchBox_zettel", `[[{"id":0,"c":"lemma_id","o":"=","v":${cEl.id}}],1,["id"]]`);
                    this.props.loadMain(e, "zettel");
                }}></a></td><td dangerouslySetInnerHTML={parseHTML(cEl.dicts)}></td><td dangerouslySetInnerHTML={parseHTML(cEl.comment)}></td></tr>);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Table striped width="100%">
                    <thead style={{textAlign:"left"}}><tr><th width="30%">Wortansatz</th><th width="20%">Wörterbücher</th><th>Kommentar</th></tr></thead>
                    <tbody>{cEls}</tbody>
                </Table>
            </div>);
        } else {
            return <SearchHint />;
        }
    }
}
class LemmaAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: this.props.item.id,
            lemma: this.props.item.lemma,
            lemma_display: this.props.item.lemma_display,
            lemma_nr: this.props.item.lemma_nr,
            MLW: this.props.item.MLW,
            Stern: this.props.item.Stern,
            Fragezeichen: this.props.item.Fragezeichen,
            comment: this.props.item.comment,
            dicts: this.props.item.dicts,
        };
    }
    render(){
        return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={()=>{this.props.onClose()}}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>ID {this.state.id}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <Container>
                    <Row className="mb-2">
                        <Col>Wort:</Col>
                        <Col><input type="text" value={this.state.lemma} onChange={event=>{this.setState({lemma: event.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-5">
                        <Col>Wort-Anzeige:</Col>
                        <Col><input type="text" value={parseHTMLPreview(this.state.lemma_display)} onChange={event=>{this.setState({lemma_display: event.target.value})}} /></Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>Zahlzeichen:</Col>
                        <Col><SelectMenu options={[[0, ""], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]]} onChange={event=>{this.setState({lemma_nr: event.target.value})}} value={this.state.lemma_nr} /></Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>im Wörterbuch:</Col>
                        <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({MLW: event.target.value})}} value={this.state.MLW} /></Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>Stern:</Col>
                        <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({Stern: event.target.value})}} value={this.state.Stern} /></Col>
                    </Row>
                    <Row className="mb-5">
                        <Col>Fragezeichen:</Col>
                        <Col><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({Fragezeichen: event.target.value})}} value={this.state.Fragezeichen} /></Col>
                    </Row>
                    <Row className="mb-2">
                        <Col>Wörterbücher:</Col>
                        <Col><textarea style={{width: "210px", height: "50px"}} value={this.state.dicts?this.state.dicts.replace(/&lt;/g, "<").replace(/&gt;/g, ">"):""} onChange={event=>{this.setState({dicts: event.target.value})}}></textarea></Col>
                    </Row>
                    <Row className="mb-4">
                        <Col>Kommentar:</Col>
                        <Col><textarea style={{width: "210px", height: "150px"}} value={this.state.comment?this.state.comment.replace(/&lt;/g, "<").replace(/&gt;/g, ">"):""} onChange={event=>{this.setState({comment: event.target.value})}}></textarea></Col>
                    </Row>
                    <Row className="mb-4">
                        <Col><small><a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/10-WikiHow:-Umlemmatisierung" target="_blank" rel="noreferrer">Hier</a> finden Sie Informationen zum Bearbeiten der Wörter.</small></Col>
                    </Row>
                    <Row>
                        <Col>
                        <StatusButton value="speichern" onClick={async ()=>{
                    if(this.state.lemma==="" || this.state.lemma.indexOf(" ")>-1){
                        return {status: false, error: "Bitte ein gültiges Wort eintragen!"};
                    } else if(this.state.lemma_display===""){
                        return {status: false, error: "Bitte tragen Sie eine gültige Wort-Anzeige ein!"};
                    } else {
                        let newLemmaValue = {
                            id: this.state.id,
                            lemma: this.state.lemma,
                            lemma_display: this.state.lemma_display,
                            MLW: this.state.MLW,
                            Fragezeichen: this.state.Fragezeichen,
                            Stern: this.state.Stern,
                            comment: this.state.comment,
                            dicts: this.state.dicts,
                            lemma_nr: this.state.lemma_nr,
                        };
                        const newId = await arachne.lemma.save(newLemmaValue);
                        this.props.onUpdate(this.state.id);
                        return {status: true};
                    }
                }} />
                {arachne.access("l_edit")?<StatusButton style={{marginLeft: "10px"}} variant="danger" value="löschen" onClick={async ()=>{
                    if(window.confirm("Soll das Wort gelöscht werden? Das Wort wird von allen verknüpften Zettel entfernt. Dieser Schritt kann nicht rückgängig gemacht werden!")){
                        const allZettel = await arachne.zettel.get({lemma_id: this.state.id});
                        let zettelRemoveList = [];
                        for(const zettel of allZettel){
                            zettelRemoveList.push({id: zettel.id, lemma_id: null});
                        }
                        if(zettelRemoveList.length>0){await arachne.zettel.save(zettelRemoveList);}
                        await arachne.lemma.delete(this.state.id);
                        this.props.onClose();
                        this.props.onReload();
                        return {status: true};
                    }
                }} />:null}
                        </Col>
                    </Row>
                </Container>
        </Offcanvas.Body></Offcanvas>;
    }
    componentDidUpdate(){
        if(this.state.id!==this.props.item.id){
            this.setState({
                id: this.props.item.id,
                lemma: this.props.item.lemma,
                lemma_display: this.props.item.lemma_display,
                lemma_nr: this.props.item.lemma_nr,
                MLW: this.props.item.MLW,
                Stern: this.props.item.Stern,
                Fragezeichen: this.props.item.Fragezeichen,
                comment: this.props.item.comment,
                dicts: this.props.item.dicts,
            });
        }
    }
}

export { Lemma };