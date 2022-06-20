import { Col, Table, Offcanvas, Navbar, Row, Container, Spinner } from "react-bootstrap";
import React from "react";
import { arachne } from "./../arachne.js";
import { Navigator, parseHTML, parseHTMLPreview, SearchBox, SelectMenu, ToolKit, SearchHint, StatusButton } from "./../elements.js";

let LemmaRow;
let LemmaHeader;
let LemmaAsideContent;
let lemmaSearchItems;

class Lemma extends React.Component{
    constructor(props){
        super(props);
        this.state = {item: null, newItemCreated: null, lemmaSearchItems: [["id", "ID"]]};
        const loadModules = async () =>{
            
            ({ LemmaRow, LemmaHeader, lemmaSearchItems, LemmaAsideContent } = await import(`./../content/${props.PROJECT_NAME}.js`));
            this.setState({lemmaSearchItems: lemmaSearchItems()})
        };
        loadModules();
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
                            searchOptions={this.state.lemmaSearchItems}
                            sortOptions={[['["id"]', "ID"], ['["lemma"]', "Wort"]]}
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
                                            const newId = await arachne.lemma.save({lemma_display:"Neues Wort", lemma:"NeuesWort"});
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
                cEls.push(<LemmaRow key={cEl.id} lemma={cEl} loadMain={e=>{this.props.loadMain(e, "zettel");}} showDetail={(cId)=>{this.props.showDetail(this.props.currentElements.find(i =>i.id === cId))}} />);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Table striped width="100%">
                    <thead style={{textAlign:"left"}}><LemmaHeader /></thead>
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
        this.state = {id: this.props.item.id};
    }
    render(){
        return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={()=>{this.props.onClose()}}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>ID {this.props.item.id}</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body><LemmaAsideContent id={this.state.id} item={this.props.item} onUpdate={id=>{this.props.onUpdate(id);}} onClose={()=>{this.props.onClose()}} onReload={()=>{this.props.onReload()}} />
        </Offcanvas.Body></Offcanvas>;
    }
    componentDidUpdate(){
        if(this.state.id!==this.props.item.id){
            this.setState({id: this.props.item.id});
        }
    }
}

export { Lemma };