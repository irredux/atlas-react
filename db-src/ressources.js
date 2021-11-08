import React from "react";
import { faExternalLinkAlt, faPlusCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./arachne.js";
import { AutoComplete, Navigator, parseHTML, SearchBox, SelectMenu } from "./elements.js";

class SekLit extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            item: null,
            newItemCreated: null
        };
    }

    render(){
        return (
        <div style={{padding: "0 10px", display: "grid", gridTemplateColumns: "auto 420px", gridTemplateRows: "min-content auto", rowGap: "15px"}}>
            <SearchBox
                setupItems={this.state.newItemCreated}
                boxName="seklit"
                searchQuery={(q,order) => {this.searchQuery(q,order)}}
                searchOptions={[
                    ["id", "ID"]
                ]}
                sortOptions={[['["id"]', "ID"]]}
                gridArea={(this.state.item)?"1/1/1/2":"1/1/1/3"}
            />
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
            {(this.state.item)?<SekLitAside status={this.props.status} item={this.state.item} onUpdate={id=>{this.reloadEntry(id)}} onClose={()=>{this.setState({item: null})}} />:""}

            {arachne.access("e_edit")&&<div style={{position: "fixed", bottom: "20px", right: "20px", fontSize: "30px"}}><FontAwesomeIcon id="mainAddButton" icon={faPlusCircle} onClick={async ()=>{
                if(window.confirm("Soll ein neuer Eintrag erstellt werden?")){
                    this.props.status("saving");
                    const newId = await arachne.seklit.save({titel: "neues Werk"});
                    this.setState({newItemCreated: [{c: "id", o: "=", v:newId}]});
                    this.props.status("saved", "Neuer Eintrag erstellt.");
                }
            }} /></div>}
        </div>
        );
    }
    async reloadEntry(id){
        let newItem = await arachne.seklit.get({id: id}); newItem = newItem[0];
        let currentElements = this.state.currentElements;
        const indexOfNewItem = currentElements.findIndex(i => i.id===newItem.id)
        currentElements[indexOfNewItem] = newItem;
        this.setState({currentElements: currentElements, item: newItem});
    }
    async searchQuery(newQuery, order){
        this.props.status("searching");
        const count = await arachne.seklit.search(newQuery, {count:true, order:order});
        const currentElements = await arachne.seklit.search(newQuery, {limit:50, order:order});
        if(count[0]["count"]>1){this.props.status("found", `${count[0]["count"]} Einträge gefunden.`)}
        else if(count[0]["count"]===1){this.props.status("found", "1 Eintrag gefunden.")}
        else{this.props.status("notFound")}
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
                cEls.push(<tr key={cEl.id} id={cEl.id} onDoubleClick={e=>{this.props.showDetail(this.props.currentElements.find(i =>i.id === parseInt(e.target.closest("tr").id)))}}><td title={"ID: "+cEl.id}>{cEl.kennziffer}</td><td>{cEl.signatur} {cEl.alte_signatur?`(${cEl.alte_signatur})`:null}</td><td>
                    {cEl.name}, {cEl.vorname}, <b>{cEl.titel}</b>, {cEl.reihe}, {cEl.ort} {cEl.jahr}
                    </td>
                    <td>{cEl.weitere_angaben}{cEl.zusatz?" - "+cEl.zusatz:null}</td></tr>);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Navigator loadPage={newPage=>{this.props.loadPage(newPage)}} currentPage={this.props.currentPage} maxPage={this.props.maxPage} />
                <table width="100%">
                    <thead style={{textAlign:"left"}}><tr><th>Kennziffer</th><th>Signatur</th><th>Werkbezeichnung</th><th>weitere Angaben</th></tr></thead>
                    <tbody>{cEls}</tbody>
                </table>
            </div>);
        } else {
            return null;
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
        return (
<div style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            right: 0,
            width: "400px",
            padding: "10px 15px",
            boxShadow: "rgb(60, 110, 113) 0px 0px 2px"
        }} className="mainColors">
    <div style={{
        display: "grid",
        gridTemplateColumns: "120px auto",
        gridTemplateRows: "1fr 5px 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
        rowGap: "10px",
        margin: "35px 0 30px 0"
    }}>
        <div className="minorTxt" style={{gridArea: "1/1/1/3", textAlign: "right"}}>
            <i>ID {this.state.id}</i><FontAwesomeIcon style={{position: "relative", top: "4px", marginLeft: "10px", fontSize: "23px"}} className="closeButton" icon={faTimesCircle} onClick={()=>{this.props.onClose()}} />
        </div>
        <div></div><div></div>

        <div>Kennziffer:</div>
        <div><input type="text" value={this.state.kennziffer} onChange={e=>{this.setState({kennziffer: e.target.value})}} /></div>
        <div>Signatur:</div>
        <div><input type="text" value={this.state.signatur} onChange={e=>{this.setState({signatur: e.target.value})}} /></div>
        <div>alte Signatur:</div><div><input type="text" value={this.state.alte_signatur} onChange={e=>{this.setState({alte_signatur: e.target.value})}} /></div>
        <div>Name:</div><div><input type="text" value={this.state.name} onChange={e=>{this.setState({name: e.target.value})}} /></div>
        <div>Vorname:</div><div><input type="text" value={this.state.vorname} onChange={e=>{this.setState({vorname: e.target.value})}} /></div>
        <div>Titel:</div><div><input type="text" value={this.state.titel} onChange={e=>{this.setState({titel: e.target.value})}} /></div>
        <div>Reihe</div><div><input type="text" value={this.state.reihe} onChange={e=>{this.setState({reihe: e.target.value})}} /></div>
        <div>Ort:</div><div><input type="text" value={this.state.ort} onChange={e=>{this.setState({ort: e.target.value})}} /></div>
        <div>Jahr:</div><div><input type="text" value={this.state.jahr} onChange={e=>{this.setState({jahr: e.target.value})}} /></div>
        <div>weitere Angaben:</div><div><input type="text" value={this.state.weitere_angaben} onChange={e=>{this.setState({weitere_angaben: e.target.value})}} /></div>
        <div>Zusatz:</div><div><input type="text" value={this.state.zusatz} onChange={e=>{this.setState({zusatz: e.target.value})}} /></div>
        <div></div><div><input type="button" value="speichern" onClick={async ()=>{
            this.props.status("saving");
            // create new edition
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
            this.props.status("saved", "Das Speichern war erfolgreich.");
            this.props.onUpdate(this.state.id);
        }} /></div>
    </div>
</div>
        );
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
            newItemCreated: null
        };
    }

    render(){
        return (
        <div style={{padding: "0 10px", display: "grid", gridTemplateColumns: "auto 420px", gridTemplateRows: "min-content auto", rowGap: "15px"}}>
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
                gridArea={(this.state.item)?"1/1/1/2":"1/1/1/3"}
            />
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
            {(this.state.item)?<RessourceAside status={this.props.status} item={this.state.item} onUpdate={id=>{this.reloadEntry(id)}} onClose={()=>{this.setState({item: null})}} />:""}

            {arachne.access("e_edit")&&<div style={{position: "fixed", bottom: "20px", right: "20px", fontSize: "30px"}}><FontAwesomeIcon id="mainAddButton" icon={faPlusCircle} onClick={async ()=>{
                if(window.confirm("Soll eine neue Ressource erstellt werden?")){
                    this.props.status("saving");
                    const newId = await arachne.edition.save({ressource: 0, editor: "Neue Edition", year: 2021});
                    this.setState({newItemCreated: [{c: "id", o: "=", v:newId}]});
                    this.props.status("saved", "Neue Ressource erstellt.");
                }
            }} /></div>}
        </div>
        );
    }
    async reloadEntry(id){
        let newItem = await arachne.edition.get({id: id}); newItem = newItem[0];
        let currentElements = this.state.currentElements;
        const indexOfNewItem = currentElements.findIndex(i => i.id===newItem.id)
        currentElements[indexOfNewItem] = newItem;
        this.setState({currentElements: currentElements, item: newItem});
    }
    async searchQuery(newQuery, order){
        this.props.status("searching");
        const count = await arachne.edition.search(newQuery, {count:true, order:order});
        const currentElements = await arachne.edition.search(newQuery, {limit:50, order:order});
        console.log(count);
        if(count[0]["count"]>1){this.props.status("found", `${count[0]["count"]} Einträge gefunden.`)}
        else if(count[0]["count"]===1){this.props.status("found", "1 Eintrag gefunden.")}
        else{this.props.status("notFound")}
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
                if(url===""||url===null){url = "/site/viewer/"+cEl.id}
                cEls.push(<tr key={cEl.id} id={cEl.id} onDoubleClick={e=>{this.props.showDetail(this.props.currentElements.find(i =>i.id === parseInt(e.target.closest("tr").id)))}}><td title={"ID: "+cEl.id}>{cEl.label}</td><td>{resTypes[cEl.ressource]}</td><td dangerouslySetInnerHTML={parseHTML(cEl.opus)}></td><td><a href={url} target="_blank">öffnen</a>{
                    cEl.url?<FontAwesomeIcon style={{fontSize:"14px", marginLeft: "10px"}} icon={faExternalLinkAlt} />:null
                }</td></tr>);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Navigator loadPage={newPage=>{this.props.loadPage(newPage)}} currentPage={this.props.currentPage} maxPage={this.props.maxPage} />
                <table width="100%">
                    <thead style={{textAlign:"left"}}><tr><th>Kürzel</th><th>Typ</th><th>vrkn. Werk</th><th>Link</th></tr></thead>
                    <tbody>{cEls}</tbody>
                </table>
            </div>);
        } else {
            return null;
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
            volumeContent: this.props.item.volumeContent,
            serie: this.props.item.serie,
            location: this.props.item.location,
            library: this.props.item.library,
            signature: this.props.item.signature,
            comment: this.props.item.comment,
            path: this.props.item.path,
            url: this.props.item.url,
            bibliography_preview: null,
        };
    }
    render(){
        return (
<div style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            right: 0,
            width: "400px",
            padding: "10px 15px",
            boxShadow: "rgb(60, 110, 113) 0px 0px 2px",
            overflow: "scroll",
        }} className="mainColors">
    <div style={{
        display: "grid",
        gridTemplateColumns: "120px auto",
        gridTemplateRows: "1fr 5px",
        rowGap: "10px",
        margin: "35px 0 30px 0"
    }}>
        <div className="minorTxt" style={{gridArea: "1/1/1/3", textAlign: "right"}}>
            <i>ID {this.state.id}</i><FontAwesomeIcon style={{position: "relative", top: "4px", marginLeft: "10px", fontSize: "23px"}} className="closeButton" icon={faTimesCircle} onClick={()=>{this.props.onClose()}} />
        </div>

        <div style={{gridArea: "3/1/3/2"}}><span title={this.props.item.dir_name}>Werk:</span></div>
        <div style={{gridArea: "3/2/3/3"}}>
            <AutoComplete  value={this.state.ac_web?this.state.ac_web:""} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={(value, id)=>{this.setState({ac_web: value, work_id: id});this.updateBibliography(id)}} />
        </div>
        {this.state.bibliography_preview?<div className="minorTxt" style={{gridArea: "4/1/4/2"}}>Biblio-graphische Angaben:</div>:null}
        {this.state.bibliography_preview?<div className="minorTxt" style={{gridArea: "4/2/4/3", boxShadow: "0 1px 2px lightgray", backgroundColor: "#F4F4F4", padding: "5px 10px"}}>{this.state.bibliography_preview}</div>:null}
        <div style={{gridArea: "5/1/5/2"}}>Ressource:</div>
        <div style={{gridArea: "5/2/5/3"}}><SelectMenu options={[[0, "Edition (relevant)"], [1, "Edition (veraltet)"], [2, "Handschrift"], [3, "Alter Druck (relevant)"], [4, "Alter Druck (veraltet)"], [5, "Sonstiges"]]} value={this.state.ressource} onChange={e=>{this.setState({ressource: parseInt(e.target.value)})}} /></div>
        {this.state.ressource===0||this.state.ressource===1||this.state.ressource===5?[
            <div key="0" style={{gridArea: "6/1/6/2"}}>Editor:</div>,
            <div key="1" style={{gridArea: "6/2/6/3"}}><input type="text" style={{width: "96%"}} value={this.state.editor} onChange={e=>{this.setState({editor: e.target.value})}} /></div>,
            <div key="2" style={{gridArea: "7/1/7/2"}}>Jahr:</div>,
            <div key="3" style={{gridArea: "7/2/7/3"}}><input type="text" style={{width: "96%"}} value={this.state.year} onChange={e=>{this.setState({year: e.target.value})}} /></div>,
            <div key="4" style={{gridArea: "8/1/8/2"}}>Band:</div>,
            <div key="5" style={{gridArea: "8/2/8/3"}}><input type="text" style={{width: "96%"}} value={this.state.volume} onChange={e=>{this.setState({volume: e.target.value})}} /></div>,
            <div key="6" style={{gridArea: "9/1/9/2"}}>Bandinhalt:</div>,
            <div key="7" style={{gridArea: "9/2/9/3"}}><input type="text" style={{width: "96%"}} value={this.state.volumeContent} onChange={e=>{this.setState({volumeContent: e.target.value})}} /></div>,
            <div key="8" style={{gridArea: "10/1/10/2"}}>Reihe:</div>,
            <div key="9" style={{gridArea: "10/2/10/3"}}><SelectMenu options={[[0, ""], [1, "Migne PL"], [2, "ASBen."], [3, "ASBoll."], [4, "AnalBoll."], [5, "Mon. Boica"], [6, "Ma. Schatzverzeichnisse"], [7, "Ma. Bibliothekskataloge"]]} value={this.state.serie} onChange={e=>{this.setState({serie: parseInt(e.target.value)})}} /></div>
        ]:null}
        {this.state.ressource===2?[
            <div key="0" style={{gridArea: "6/1/6/2"}}>Stadt:</div>,
            <div key="1" style={{gridArea: "6/2/6/3"}}><input type="text" style={{width: "96%"}} value={this.state.location} onChange={e=>{this.setState({location: e.target.value})}} /></div>,
            <div key="2" style={{gridArea: "7/1/7/2"}}>Bibliothek:</div>,
            <div key="3" style={{gridArea: "7/2/7/3"}}><input type="text" style={{width: "96%"}} value={this.state.library} onChange={e=>{this.setState({library: e.target.value})}} /></div>,
            <div key="4" style={{gridArea: "8/1/8/2"}}>Signatur:</div>,
            <div key="5" style={{gridArea: "8/2/8/3"}}><input type="text" style={{width: "96%"}} value={this.state.signature} onChange={e=>{this.setState({signature: e.target.value})}} /></div>
        ]:null}
        {this.state.ressource===3||this.state.ressource===4?[
            <div key="0" style={{gridArea: "6/1/6/2"}}>Drucker:</div>,
            <div key="1" style={{gridArea: "6/2/6/3"}}><input type="text" style={{width: "96%"}} value={this.state.editor} onChange={e=>{this.setState({editor: e.target.value})}} /></div>,
            <div key="2" style={{gridArea: "7/1/7/2"}}>Ort:</div>,
            <div key="3" style={{gridArea: "7/2/7/3"}}><input type="text" style={{width: "96%"}} value={this.state.location} onChange={e=>{this.setState({location: e.target.value})}} /></div>,
            <div key="4" style={{gridArea: "8/1/8/2"}}>Jahr:</div>,
            <div key="5" style={{gridArea: "8/2/8/3"}}><input type="text" style={{width: "96%"}} value={this.state.year} onChange={e=>{this.setState({year: e.target.value})}} /></div>,
        ]:null}
        <div style={{gridArea: "12/1/12/2"}}>Kommentar:</div><div style={{gridArea: "12/2/12/3"}}><textarea style={{width: "270px", height: "100px"}} value={this.state.comment} onChange={e=>{this.setState({comment: e.target.value})}}></textarea></div>
        <div style={{gridArea: "13/1/13/2"}}><span title={this.props.item.dir_name}>Dateipfad:</span></div>
        <div style={{gridArea: "13/2/13/3"}}><input type="text" style={{width: "96%"}} value={this.state.path} onChange={e=>{this.setState({path: e.target.value})}} /></div>
        <div style={{gridArea: "14/1/14/2"}}><span title={this.props.item.dir_name}>Link <i className="minorTxt">(nur externe Quellen)</i>:</span></div>
        <div style={{gridArea: "14/2/14/3"}}><input type="text" style={{width: "96%"}} value={this.state.url} onChange={e=>{this.setState({url: e.target.value})}} /></div>
        <div style={{gridArea: "15/2/15/3"}}><input type="button" value="speichern" onClick={async ()=>{
            if((this.state.type===0||this.state.type===1||this.state.type===5)&&(!this.state.editor||!this.state.year)){
                this.props.status("error", "Geben Sie den Editor und das Jahr ein.");
            } else {
                this.props.status("saving", "Die Dateien werden hochgeladen.");
                // create new edition
                await arachne.edition.save({
                    id: this.state.id,
                    work_id: this.state.work_id,
                    ressource: this.state.ressource,
                    editor: this.state.editor,
                    year: this.state.year,
                    volume: this.state.volume,
                    vol_cont: this.state.volumeContent,
                    serie: this.state.serie,
                    comment: this.state.comment,
                    location: this.state.location,
                    library: this.state.library,
                    signature: this.state.signature,
                    path: this.props.item.path,
                    url: this.props.item.url,
                });
                this.props.status("saved", "Das Speichern war erfolgreich.");
                this.props.onUpdate(this.state.id);
            }
        }} /></div>
    </div>
</div>
        );
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
                volumeContent: this.props.item.volumeContent,
                serie: this.props.item.serie,
                location: this.props.item.location,
                library: this.props.item.library,
                signature: this.props.item.signature,
                comment: this.props.item.comment,
                path: this.props.item.path,
                url: this.props.item.url,
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