import { Row, Col, Button, Table, Navbar, Offcanvas, Container } from "react-bootstrap";
import React from "react";
import { faExternalLinkAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./../arachne.js";
import { AutoComplete, Navigator, parseHTML, SearchBox, SelectMenu, ToolKit, SearchHint, StatusButton } from "./../elements.js";

class SekLit extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            item: null,
            newItemCreated: null
        };
    }

    render(){
        return <>
            <Navbar fixed="bottom" bg="light">
                <Container fluid>
                    <Navbar.Collapse className="justify-content-start">
                        <Navbar.Text>
                            <SearchBox
                            setupItems={this.state.newItemCreated}
                            boxName="seklit"
                            searchQuery={(q,order) => {this.searchQuery(q,order)}}
                            searchOptions={[
                                ["id", "ID"]
                            ]}
                            sortOptions={[['["id"]', "ID"]]}
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
                            {arachne.access("e_edit")&&<ToolKit menuItems={[
                                    ["neuer Eintrag", async ()=>{
                                        if(window.confirm("Soll ein neuer Eintrag erstellt werden?")){
                                            const newId = await arachne.seklit.save({titel: "neues Werk"});
                                            this.setState({newItemCreated: [{id: 0, c: "id", o: "=", v:newId}]});
                                        }
                                    }]
                                ]} />}
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mainBody">
                <SekLitBox
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
            {(arachne.access("e_edit")&&this.state.item)?<SekLitAside item={this.state.item} onUpdate={id=>{this.reloadEntry(id)}} onReload={()=>{this.loadPage(this.state.currentPage)}} onClose={()=>{this.setState({item: null})}} />:""}
        </>;
    }
    async reloadEntry(id){
        if(id>0){
            let newItem = await arachne.seklit.get({id: id}); newItem = newItem[0];
            let currentElements = this.state.currentElements;
            const indexOfNewItem = currentElements.findIndex(i => i.id===newItem.id)
            currentElements[indexOfNewItem] = newItem;
            this.setState({currentElements: currentElements, item: newItem});
        } else {
            this.setState({currentElements: [], item: null});
        }
    }
    async searchQuery(newQuery, order){
        const count = await arachne.seklit.search(newQuery, {count:true, order:order});
        const currentElements = await arachne.seklit.search(newQuery, {limit:50, order:order});
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
        const currentElements = await arachne.seklit.search(this.state.query, {limit:50, offset:((newPage-1)*50), order:this.state.queryOrder});
            this.setState({
                currentPage: newPage,
                currentElements: currentElements,
                selectionDetail: {ids:[]}
            });
    }
}
class SekLitBox extends React.Component{
    constructor(props){
        super(props);
        this.state = {selection: {currentId: null, ids:[]}}
    }
    render(){
        if(this.props.count>0){
            let cEls = [];
            for(const cEl of this.props.currentElements){
                cEls.push(<tr key={cEl.id} id={cEl.id} onDoubleClick={e=>{this.props.showDetail(this.props.currentElements.find(i =>i.id === parseInt(e.target.closest("tr").id)))}}><td title={"ID: "+cEl.id}>{cEl.kennziffer}</td><td>{cEl.signatur} {cEl.alte_signatur?`(${cEl.alte_signatur})`:null}</td><td>
                    {cEl.name}, {cEl.vorname}, <b>{cEl.titel}</b>, {cEl.reihe}, {cEl.ort} {cEl.jahr}
                    </td>
                    <td>{cEl.weitere_angaben}{cEl.zusatz?" - "+cEl.zusatz:null}</td></tr>);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Table width="100%" striped>
                    <thead style={{textAlign:"left"}}><tr><th width="10%">Kennziffer</th><th width="10%">Signatur</th><th width="60%">Werkbezeichnung</th><th>weitere Angaben</th></tr></thead>
                    <tbody>{cEls}</tbody>
                </Table>
            </div>);
        } else {
            return <SearchHint />;
        }
    }
}
class SekLitAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: this.props.item.id,
            kennziffer: this.props.item.kennziffer,
            signatur: this.props.item.signatur,
            alte_signatur: this.props.item.alte_signatur,
            name: this.props.item.name,
            vorname: this.props.item.vorname,
            titel: this.props.item.titel,
            reihe: this.props.item.reihe,
            weitere_angaben: this.props.item.weitere_angaben,
            ort: this.props.item.ort,
            jahr: this.props.item.jahr,
            zusatz: this.props.item.zusatz,
        };
    }
    render(){
        return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={()=>{this.props.onClose()}}>
    <Offcanvas.Header closeButton>
        <Offcanvas.Title>ID {this.state.id}</Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body>
        <Row className="mb-2">
            <Col xs={4}>Kennziffer:</Col>
            <Col><input type="text" value={this.state.kennziffer?this.state.kennziffer:""} onChange={e=>{this.setState({kennziffer: e.target.value})}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>Signatur:</Col>
            <Col><input type="text" value={this.state.signatur?this.state.signatur:""} onChange={e=>{this.setState({signatur: e.target.value})}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>alte Signatur:</Col>
            <Col><input type="text" value={this.state.alte_signatur?this.state.alte_signatur:""} onChange={e=>{this.setState({alte_signatur: e.target.value})}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>Name:</Col>
            <Col><input type="text" value={this.state.name?this.state.name:""} onChange={e=>{this.setState({name: e.target.value})}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>Vorname:</Col>
            <Col><input type="text" value={this.state.vorname?this.state.vorname:""} onChange={e=>{this.setState({vorname: e.target.value})}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>Titel:</Col>
            <Col><input type="text" value={this.state.titel?this.state.titel:""} onChange={e=>{this.setState({titel: e.target.value})}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>Reihe:</Col>
            <Col><input type="text" value={this.state.reihe?this.state.reihe:""} onChange={e=>{this.setState({reihe: e.target.value})}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>Ort:</Col>
            <Col><input type="text" value={this.state.ort?this.state.ort:""} onChange={e=>{this.setState({ort: e.target.value})}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>Jahr:</Col>
            <Col><input type="text" value={this.state.jahr?this.state.jahr:""} onChange={e=>{this.setState({jahr: e.target.value})}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={4}>weitere Angaben:</Col>
            <Col><input type="text" value={this.state.weitere_angaben?this.state.weitere_angaben:""} onChange={e=>{this.setState({weitere_angaben: e.target.value})}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col xs={4}>Zusatz:</Col>
            <Col><input type="text" value={this.state.zusatz?this.state.zusatz:""} onChange={e=>{this.setState({zusatz: e.target.value})}} /></Col>
        </Row>
        <Row>
            <Col><StatusButton value="speichern" onClick={async ()=>{
            await arachne.seklit.save({
                id: this.state.id,
                kennziffer: this.state.kennziffer,
                signatur: this.state.signature,
                alte_signatur: this.state.alte_signatur,
                name: this.state.name,
                vorname: this.state.vorname,
                titel: this.state.titel,
                reihe: this.state.reihe,
                weitere_angaben: this.state.weitere_angaben,
                ort: this.state.ort,
                jahr: this.state.jahr,
                zusatz: this.state.zusatz,
            });
            this.props.onUpdate(this.state.id);
            return {status: true};
        }} />
        <Button variant="danger" style={{marginLeft: "10px"}} onClick={async ()=>{
                    if(window.confirm("Soll der Eintrag gelöscht werden? Dieser Schritt kann nicht rückgängig gemacht werden!")){
                        await arachne.seklit.delete(this.state.id);
                        this.props.onClose();
                        this.props.onReload();
                    }
                }}>löschen</Button></Col>
        </Row>
    </Offcanvas.Body>
</Offcanvas>;
    }
    componentDidUpdate(){
        if(this.state.id!==this.props.item.id){
            this.setState({
                id: this.props.item.id,
                kennziffer: this.props.item.kennziffer,
                signatur: this.props.item.signatur,
                alte_signatur: this.props.item.alte_signatur,
                name: this.props.item.name,
                vorname: this.props.item.vorname,
                titel: this.props.item.titel,
                reihe: this.props.item.reihe,
                weitere_angaben: this.props.item.weitere_angaben,
                ort: this.props.item.ort,
                jahr: this.props.item.jahr,
                zusatz: this.props.item.zusatz,
            });
        }
    }
}


class Ressource extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            item: null,
            newItemCreated: null,
            offset: 0,
        };
    }
    render(){
        return <>
            <Navbar fixed="bottom" bg="light">
                <Container fluid>
                    <Navbar.Collapse className="justify-content-start">
                        <Navbar.Text>
                            <SearchBox
                            setupItems={this.state.newItemCreated}
                            boxName="ressources"
                            searchQuery={(q,order) => {this.searchQuery(q,order)}}
                            searchOptions={[
                                ["ac_web", "Werk"],
                                ["work_id", "Werk-ID"],
                                ["ressource", "Ressource-Typ"],
                                ["id", "ID"],
                                ["path", "Dateipfad"],
                            ]}
                            sortOptions={[['["id"]', "ID"], ['["label"]', "Kürzel"], ['["opus"]', "vrkn. Werk"]]}
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
                                    ["neue Ressource", async ()=>{
                                        if(window.confirm("Soll eine neue Ressource erstellt werden?")){
                                            const newId = await arachne.edition.save({ressource: 0, editor: "Neue Ressource", year: new Date().getFullYear()});
                                            this.setState({newItemCreated: [{id: 0, c: "id", o: "=", v:newId}]});
                                        }
                                    }]
                                ]} />}
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            <Container className="mainBody">
                <RessourceBox
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
            {(arachne.access("e_edit")&&this.state.item)?<RessourceAside item={this.state.item} onUpdate={id=>{this.reloadEntry(id)}} onReload={()=>{this.loadPage(this.state.currentPage)}} onClose={()=>{this.setState({item: null})}} />:""}
        </>;
    }
    async reloadEntry(id){
        if(id>0){
            let newItem = await arachne.edition.get({id: id}); newItem = newItem[0];
            let currentElements = this.state.currentElements;
            const indexOfNewItem = currentElements.findIndex(i => i.id===newItem.id)
            currentElements[indexOfNewItem] = newItem;
            this.setState({currentElements: currentElements, item: newItem});
        } else {
            const currentElements = await arachne.edition.search(this.state.query, {limit:50, offset:this.state.offset, order:this.state.queryOrder});
            this.setState({currentElements: currentElements, item: null});
        }
    }
    async searchQuery(newQuery, order){
        const count = await arachne.edition.search(newQuery, {count:true, order:order});
        const currentElements = await arachne.edition.search(newQuery, {limit:50, order:order});
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
        const currentElements = await arachne.edition.search(this.state.query, {limit:50, offset:((newPage-1)*50), order:this.state.queryOrder});
            this.setState({
                offset: ((newPage-1)*50),
                currentPage: newPage,
                currentElements: currentElements,
                selectionDetail: {ids:[]}
            });
    }
}
class RessourceBox extends React.Component{
    constructor(props){
        super(props);
        this.state = {selection: {currentId: null, ids:[]}}
    }
    render(){
        if(this.props.count>0){
            const resTypes = {
                0: "Edition (relevant)",
                1: "Edition (veraltet)",
                2: "Handschrift",
                3: "Alter Druck (relevant)",
                4: "Alter Druck (veraltet)",
                5: "Sonstiges"
            };
    
            let cEls = [];
            for(const cEl of this.props.currentElements){
                let url = cEl.url;
                if(url===""||url===null){url = "/site/argos/"+cEl.id}
                cEls.push(<tr key={cEl.id} id={cEl.id} onDoubleClick={e=>{this.props.showDetail(this.props.currentElements.find(i =>i.id === parseInt(e.target.closest("tr").id)))}}><td title={"ID: "+cEl.id}>{cEl.label}</td><td>{resTypes[cEl.ressource]}</td><td dangerouslySetInnerHTML={parseHTML(cEl.opus)}></td><td><a href={url} target="_blank">öffnen</a>{
                    cEl.url?<FontAwesomeIcon style={{fontSize:"14px", marginLeft: "10px"}} icon={faExternalLinkAlt} />:null
                }</td></tr>);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Table width="100%"striped>
                    <thead style={{textAlign:"left"}}><tr><th width="20%">Kürzel</th><th width="20%">Typ</th><th>vrkn. Werk</th><th width="10%">Link</th></tr></thead>
                    <tbody>{cEls}</tbody>
                </Table>
            </div>);
        } else {
            return <SearchHint />;
        }
    }
}
class RessourceAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: this.props.item.id,
            ressource: this.props.item.ressource,
            work_id: this.props.item.work_id,
            ac_web: this.props.item.ac_web,
            editor: this.props.item.editor,
            year: this.props.item.year,
            volume: this.props.item.volume,
            vol_cont: this.props.item.vol_cont,
            serie: this.props.item.serie,
            location: this.props.item.location,
            library: this.props.item.library,
            signature: this.props.item.signature,
            comment: this.props.item.comment,
            path: this.props.item.path,
            url: this.props.item.url,
            aspect_ratio: this.props.item.aspect_ratio,
            bibliography_preview: null,
        };
    }
    render(){
        return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={()=>{this.props.onClose()}}>
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>ID {this.state.id}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <Row className="mb-2">
                <Col xs={3}>Werk:</Col>
                <Col><AutoComplete  value={this.state.ac_web?this.state.ac_web:""} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={(value, id)=>{this.setState({ac_web: value, work_id: id});this.updateBibliography(id)}} /></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={3}>Alter Dateiname:</Col>
                <Col>{this.props.item.dir_name}</Col>
            </Row>
            {this.state.bibliography_preview&&<Row className="mb-4">
                <Col xs={3}>Biblio-graphische Angaben:</Col>
                <Col style={{fontSize: "90%", backgroundColor: "var(--bs-gray-100"}}>{this.state.bibliography_preview}</Col>
            </Row>}
            <Row className="mb-2">
                <Col xs={3}>Ressource:</Col>
                <Col><SelectMenu options={[[0, "Edition (relevant)"], [1, "Edition (veraltet)"], [2, "Handschrift"], [3, "Alter Druck (relevant)"], [4, "Alter Druck (veraltet)"], [5, "Sonstiges"]]} value={this.state.ressource?this.state.ressource:""} onChange={e=>{this.setState({ressource: parseInt(e.target.value)})}} /></Col>
            </Row>
            {this.state.ressource===0||this.state.ressource===1||this.state.ressource===5?[
                <Row key="0" className="mb-2">
                    <Col xs={3}>Editor:</Col>
                    <Col><input type="text" style={{width: "100%"}} value={this.state.editor?this.state.editor:""} onChange={e=>{this.setState({editor: e.target.value})}} /></Col>
                </Row>,
                <Row key="1" className="mb-2">
                    <Col xs={3}>Jahr:</Col>
                    <Col><input type="text" style={{width: "100%"}} value={this.state.year?this.state.year:""} onChange={e=>{this.setState({year: e.target.value})}} /></Col>
                </Row>,
                <Row key="2" className="mb-2">
                    <Col xs={3}>Band:</Col>
                    <Col><input type="text" style={{width: "100%"}} value={this.state.volume?this.state.volume:""} onChange={e=>{this.setState({volume: e.target.value})}} /></Col>
                </Row>,
                <Row key="3" className="mb-2">
                    <Col xs={3}>Bandinhalt:</Col>
                    <Col><input type="text" style={{width: "100%"}} value={this.state.vol_cont?this.state.vol_cont:""} onChange={e=>{this.setState({vol_cont: e.target.value})}} /></Col>
                </Row>,
                <Row key="4" className="mb-4">
                    <Col xs={3}>Reihe:</Col>
                    <Col><SelectMenu options={[[0, ""], [1, "Migne PL"], [2, "ASBen."], [3, "ASBoll."], [4, "AnalBoll."], [5, "Mon. Boica"], [6, "Ma. Schatzverzeichnisse"], [7, "Ma. Bibliothekskataloge"]]} value={this.state.serie?this.state.serie:""} onChange={e=>{this.setState({serie: parseInt(e.target.value)})}} /></Col>
                </Row>,
            ]:null}
            {this.state.ressource===2?[
                <Row key="5" className="mb-2">
                    <Col xs={3}>Stadt:</Col>
                    <Col><input type="text" style={{width: "100%"}} value={this.state.location?this.state.location:""} onChange={e=>{this.setState({location: e.target.value})}} /></Col>
                </Row>,
                <Row key="6" className="mb-2">
                    <Col xs={3}>Bibliothek:</Col>
                    <Col><input type="text" style={{width: "100%"}} value={this.state.library?this.state.library:""} onChange={e=>{this.setState({library: e.target.value})}} /></Col>
                </Row>,
                <Row key="7" className="mb-4">
                    <Col xs={3}>Signatur:</Col>
                    <Col><input type="text" style={{width: "100%"}} value={this.state.signature?this.state.signature:""} onChange={e=>{this.setState({signature: e.target.value})}} /></Col>
                </Row>,
            ]:null}
            {this.state.ressource===3||this.state.ressource===4?[
                <Row key="8" className="mb-2">
                    <Col xs={3}>Drucker:</Col>
                    <Col><input type="text" style={{width: "100%"}} value={this.state.editor?this.state.editor:""} onChange={e=>{this.setState({editor: e.target.value})}} /></Col>
                </Row>,
                <Row key="9" className="mb-2">
                    <Col xs={3}>Ort:</Col>
                    <Col><input type="text" style={{width: "100%"}} value={this.state.location?this.state.location:""} onChange={e=>{this.setState({location: e.target.value})}} /></Col>
                </Row>,
                <Row key="10" className="mb-4">
                    <Col xs={3}>Jahr:</Col>
                    <Col><input type="text" style={{width: "100%"}} value={this.state.year?this.state.year:""} onChange={e=>{this.setState({year: e.target.value})}} /></Col>
                </Row>,
            ]:null}
            <Row className="mb-2">
                <Col xs={3}>Kommentar:</Col>
                <Col><textarea style={{width: "267px", height: "100px"}} value={this.state.comment?this.state.comment:""} onChange={e=>{this.setState({comment: e.target.value})}}></textarea></Col>
            </Row>
            <Row className="mb-2">
                <Col xs={3}>Dateipfad:</Col>
                <Col><input type="text" style={{width: "100%"}} value={this.state.path?this.state.path:""} onChange={e=>{this.setState({path: e.target.value})}} /></Col>
            </Row>
            <Row className="mb-4">
                <Col xs={3}>Link:<br /><small>(externe Quellen)</small></Col>
                <Col><input type="text" style={{width: "100%"}} value={this.state.url?this.state.url:""} onChange={e=>{this.setState({url: e.target.value})}} /></Col>
            </Row>
            <Row className="mb-4">
            <Col xs={3}>Seiten-verhältnis:</Col>
            <Col><input type="text" style={{width: "100%"}} value={this.state.aspect_ratio?this.state.aspect_ratio:""} onChange={e=>{this.setState({aspect_ratio: e.target.value.substring(0,5)})}} /></Col>
        </Row>
            <Row className="mb-2">
                <Col><StatusButton value="speichern" onClick={async ()=>{
            if((this.state.ressource===0||this.state.ressource===1||this.state.ressource===5)&&!this.state.serie&&(!this.state.editor||!this.state.year)){
                return {status: false, error: "Geben Sie den Editor und das Jahr ein."};
            } else {
                await arachne.edition.save({
                    id: this.state.id,
                    work_id: this.state.work_id,
                    ressource: this.state.ressource,
                    editor: this.state.editor,
                    year: this.state.year,
                    volume: this.state.volume,
                    vol_cont: this.state.vol_cont,
                    serie: this.state.serie,
                    comment: this.state.comment,
                    location: this.state.location,
                    library: this.state.library,
                    signature: this.state.signature,
                    path: this.state.path,
                    url: this.state.url,
                    aspect_ratio: this.state.aspect_ratio,
                });
                this.props.onUpdate(this.state.id);
                return {status: true};
            }
        }} />
        <Button variant="danger" style={{marginLeft: "20px"}} onClick={async ()=>{
            if(window.confirm("Soll die Ressource wirklich gelöscht werden? Dieser Schritt kann nicht rückgängig gemacht werden!")){
                await arachne.edition.delete(this.state.id);
                this.props.onUpdate(null);
                this.props.onReload();
            }
        }}>löschen</Button></Col>
            </Row>
    </Offcanvas.Body>
</Offcanvas>;
    }
    componentDidMount(){
        this.updateBibliography(this.props.item.work_id);
    }
    componentDidUpdate(){
        if(this.state.id!==this.props.item.id){
            this.updateBibliography(this.props.item.work_id);
            this.setState({
                id: this.props.item.id,
                ressource: this.props.item.ressource,
                work_id: this.props.item.work_id,
                ac_web: this.props.item.ac_web,
                editor: this.props.item.editor,
                year: this.props.item.year,
                volume: this.props.item.volume,
                vol_cont: this.props.item.vol_cont,
                serie: this.props.item.serie,
                location: this.props.item.location,
                library: this.props.item.library,
                signature: this.props.item.signature,
                comment: this.props.item.comment,
                path: this.props.item.path,
                url: this.props.item.url,
                aspect_ratio: this.props.item.aspect_ratio,
            });
        }
    }
    async updateBibliography(work_id){
        if(work_id>0){
            let bibliography = await arachne.work.get({id: work_id}, {select: ["bibliography"]});
            if(bibliography.length > 0){
                this.setState({bibliography_preview: bibliography[0].bibliography});
            } else {
                this.setState({bibliography_preview: null});
            }
        }
    }
}

export { Ressource, SekLit };