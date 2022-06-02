import React from "react";

import { arachne } from "./arachne.js";
import { AutoComplete, Navigator, parseHTML, SearchBox } from "./elements.js";

class Opera extends React.Component{
    constructor(props){
        super(props);
        this.state = {item: null};
    }

    render(){
        return (
        <div style={{padding: "0 10px", display: "grid", gridTemplateColumns: "auto 420px", gridTemplateRows: "min-content auto", rowGap: "15px"}}>
            <SearchBox
                searchQuery={(q,order) => {this.searchQuery(q,order)}}
                searchOptions={[
                    ["sigel", "Sigel"], ["id", "ID"]
                ]}
                sortOptions={[['["id"]', "ID"], ['["sigel"]', "Sigel"]]}
                gridArea={(this.state.item)?"1/1/1/2":"1/1/1/3"}
            />
            <OperaBox
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
            {(this.state.item)?<OperaAside status={this.props.status} item={this.state.item} onUpdate={id=>{this.reloadEntry(id)}} />:""}
        </div>
        );
    }
    async reloadEntry(id){
        let newItem = await arachne.opera.get({id: id}); newItem = newItem[0];
        let currentElements = this.state.currentElements;
        const indexOfNewItem = currentElements.findIndex(i => i.id===newItem.id)
        currentElements[indexOfNewItem] = newItem;
        this.setState({currentElements: currentElements, item: newItem});
    }
    async searchQuery(newQuery, order){
        this.props.status("searching");
        const count = await arachne.opera.search(newQuery, {count:true, order:order});
        const currentElements = await arachne.opera.search(newQuery, {limit:50, order:order});
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
        const currentElements = await arachne.opera.search(this.state.query, {limit:50, offset:((newPage-1)*50), order:this.state.queryOrder});
            this.setState({
                currentPage: newPage,
                currentElements: currentElements,
                selectionDetail: {ids:[]}
            });
    }
}
class OperaBox extends React.Component{
    constructor(props){
        super(props);
        this.state = {selection: {currentId: null, ids:[]}}
    }
    render(){
        if(this.props.count>0){
            let cEls = [];
            for(const cEl of this.props.currentElements){
                cEls.push(<tr key={cEl.id} id={cEl.id} onDoubleClick={e=>{this.props.showDetail(this.props.currentElements.find(i =>i.id === parseInt(e.target.closest("tr").id)))}}><td title={"ID: "+cEl.id} dangerouslySetInnerHTML={parseHTML(cEl.sigel)}></td><td dangerouslySetInnerHTML={parseHTML(cEl.werk)}></td><td class="minorTxt">
                        {cEl.bibgrau&&<p dangerouslySetInnerHTML={parseHTML(cEl.bibgrau)}></p>}
                        {cEl.bibvoll&&<p dangerouslySetInnerHTML={parseHTML(cEl.bibvoll)}></p>}
                        {cEl.bibzusatz&&<p dangerouslySetInnerHTML={parseHTML(cEl.bibzusatz)}></p>}
                </td></tr>);
            }
            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Navigator loadPage={newPage=>{this.props.loadPage(newPage)}} currentPage={this.props.currentPage} maxPage={this.props.maxPage} />
                <table width="100%">
                    <thead style={{textAlign:"left"}}><tr><th>Sigel</th><th>Werktitel</th><th>Bibliographie</th></tr></thead>
                    <tbody>{cEls}</tbody>
                </table>
            </div>);
        } else {
            return null;
        }
    }
}
class OperaAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: this.props.item.id,
            db_id: this.props.item.db_id,
            sigel: this.props.item.sigel,
            werk: this.props.item.werk,
            bibgrau: this.props.item.bibgrau,
            bibvoll: this.props.item.bibvoll,
            bibzusatz: this.props.item.bibzusatz,
            konkordanz_id: this.props.item.konkordanz_id,
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
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr 5px 1fr 1fr 100px",
                rowGap: "10px",
                margin: "50px 0 0px 0"
            }}>
                <div className="minorTxt" style={{gridArea: "1/1/1/3", textAlign: "right"}}>
                    <i>dol-ID: {this.state.db_id}<br />ID {this.state.id}</i>
                </div>
                <div style={{gridArea: "3/1/3/2"}}>Sigel:</div>
                <div style={{gridArea: "3/2/3/3"}}><input type="text" value={this.state.sigel} onChange={event=>{this.setState({sigel: event.target.value})}} /></div>
                <div style={{gridArea: "4/1/4/2"}}>Werk:</div>
                <div style={{gridArea: "4/2/4/3"}}><AutoComplete  value={this.state.werk?this.state.werk:""} tbl="opera" col="sigel" onChange={(value, id)=>{this.setState({werk: value, opera_id: id})}} /></div>
                <div style={{gridArea: "5/1/5/2"}}>Bib-Grau:</div>
                <div style={{gridArea: "5/2/5/3"}}><input type="text" onChange={event=>{this.setState({bibgrau: event.target.value})}} value={this.state.bibgrau} /></div>
                <div style={{gridArea: "6/1/6/2"}}>Bib-Zusatz:</div>
                <div style={{gridArea: "6/2/6/3"}}><input type="text" onChange={event=>{this.setState({bibzusatz: event.target.value})}} value={this.state.bibzusatz} /></div>
                <div style={{gridArea: "7/1/7/2"}}>Bib-Voll:</div>
                <div style={{gridArea: "7/2/7/3"}}><textarea onChange={event=>{this.setState({bibvoll: event.target.value})}} style={{resize: "false", width: "85%"}} value={this.state.bibvoll}></textarea></div>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gridTemplateRows: "1fr",
                rowGap: "10px",
                margin: "10px 0"
            }}>
                <div style={{gridArea: "1/1/1/2"}}><input type="button" value="speichern" onClick={async ()=>{
                if(this.state.sigel===""){
                    this.props.status("error", "Bitte ein gültiges Sigel eintragen!");
                } else {
                    let newValues = {
                        id: this.state.id,
                        sigel: this.state.sigel,
                        werk: this.state.werk,
                        bibgrau: this.state.bibgrau,
                        bibvoll: this.state.bibvoll,
                        bibzusatz: this.state.bibzusatz,
                        konkordanz_id: this.state.konkordanz_id,
                    };
                    const newId = await arachne.opera.save(newValues);
                    this.props.status("saved");
                    this.props.onUpdate(this.state.id);
                }
            }} /></div>
            </div>
    </div>);
    }
    componentDidUpdate(){
        if(this.state.id!==this.props.item.id){
            this.setState({
                id: this.props.item.id,
                db_id: this.props.item.db_id,
                sigel: this.props.item.sigel,
                werk: this.props.item.werk,
                bibgrau: this.props.item.bibgrau,
                bibvoll: this.props.item.bibvoll,
                bibzusatz: this.props.item.bibzusatz,
                konkordanz_id: this.props.item.konkordanz_id,
            });
        }
    }
}
class Konkordanz extends React.Component{
    constructor(props){
        super(props);
        this.state = {item: null};
    }

    render(){
        return (
        <div style={{padding: "0 10px", display: "grid", gridTemplateColumns: "auto 420px", gridTemplateRows: "min-content auto", rowGap: "15px"}}>
            <SearchBox
                searchQuery={(q,order) => {this.searchQuery(q,order)}}
                searchOptions={[
                    ["zettel_sigel", "Sigel"], ["id", "ID"], ["opera_id", "Werk-ID"]
                ]}
                sortOptions={[['["id"]', "ID"], ['["zettel_sigel"]', "Sigel"]]}
                gridArea={(this.state.item)?"1/1/1/2":"1/1/1/3"}
            />
            <KonkordanzBox
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
            {(this.state.item)?<KonkordanzAside status={this.props.status} item={this.state.item} onUpdate={id=>{this.reloadEntry(id)}} />:""}
        </div>
        );
    }
    async reloadEntry(id){
        let newItem = await arachne.konkordanz.get({id: id}); newItem = newItem[0];
        let currentElements = this.state.currentElements;
        const indexOfNewItem = currentElements.findIndex(i => i.id===newItem.id)
        currentElements[indexOfNewItem] = newItem;
        this.setState({currentElements: currentElements, item: newItem});
    }
    async searchQuery(newQuery, order){
        this.props.status("searching");
        const count = await arachne.konkordanz.search(newQuery, {count:true, order:order});
        const currentElements = await arachne.konkordanz.search(newQuery, {limit:50, order:order});
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
        const currentElements = await arachne.konkordanz.search(this.state.query, {limit:50, offset:((newPage-1)*50), order:this.state.queryOrder});
            this.setState({
                currentPage: newPage,
                currentElements: currentElements,
                selectionDetail: {ids:[]}
            });
    }
}
class KonkordanzBox extends React.Component{
    constructor(props){
        super(props);
        this.state = {selection: {currentId: null, ids:[]}}
    }
    render(){
        if(this.props.count>0){
            let cEls = [];
            for(const cEl of this.props.currentElements){
                cEls.push(<tr key={cEl.id} id={cEl.id} onDoubleClick={e=>{this.props.showDetail(this.props.currentElements.find(i =>i.id === parseInt(e.target.closest("tr").id)))}}><td title={"ID: "+cEl.id} dangerouslySetInnerHTML={parseHTML(cEl.zettel_sigel)}></td><td>{cEl.comment}</td><td>{cEl.opera_id&&<span>{cEl.opera} <i className="minorTxt">(ID: {cEl.opera_id})</i></span>}</td></tr>);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Navigator loadPage={newPage=>{this.props.loadPage(newPage)}} currentPage={this.props.currentPage} maxPage={this.props.maxPage} />
                <table width="100%">
                    <thead style={{textAlign:"left"}}><tr><th>Angabe auf Zettel</th><th>Bemerkung</th><th>Quelle</th></tr></thead>
                    <tbody>{cEls}</tbody>
                </table>
            </div>);
        } else {
            return null;
        }
    }
}
class KonkordanzAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: this.props.item.id,
            zettel_sigel: this.props.item.zettel_sigel,
            opera_id: this.props.item.opera_id,
            opera: this.props.opera,
            comment: this.props.comment,
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
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr 5px 1fr 1fr 100px",
                rowGap: "10px",
                margin: "50px 0 0px 0"
            }}>
                <div className="minorTxt" style={{gridArea: "1/1/1/3", textAlign: "right"}}>
                    <i>ID {this.state.id}</i>
                </div>
                <div style={{gridArea: "3/1/3/2"}}>Sigel:</div>
                <div style={{gridArea: "3/2/3/3"}}><input type="text" value={this.state.zettel_sigel} onChange={event=>{this.setState({zettel_sigel: event.target.value})}} /></div>
                <div style={{gridArea: "4/1/4/2"}}>Werk:</div>
                <div style={{gridArea: "4/2/4/3"}}><AutoComplete  value={this.state.opera?this.state.opera:""} tbl="opera" col="sigel" onChange={(value, id)=>{this.setState({opera: value, opera_id: id})}} /></div>
                <div style={{gridArea: "5/1/5/2"}}>Kommentar:</div>
                <div style={{gridArea: "5/2/5/3"}}><textarea onChange={event=>{this.setState({comment: event.target.value})}} style={{resize: "false", width: "85%"}} value={this.state.comment}></textarea></div>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gridTemplateRows: "1fr",
                rowGap: "10px",
                margin: "10px 0"
            }}>
                <div style={{gridArea: "1/1/1/2"}}><input type="button" value="speichern" onClick={async ()=>{
                if(this.state.zettel_sigel===""){
                    this.props.status("error", "Bitte ein gültiges Sigel eintragen!");
                } else {
                    let newValues = {
                        id: this.state.id,
                        zettel_sigel: this.state.zettel_sigel,
                        opera_id: this.state.opera_id,
                        comment: this.state.comment
                    };
                    const newId = await arachne.konkordanz.save(newValues);
                    this.props.status("saved");
                    this.props.onUpdate(this.state.id);
                }
            }} /></div>
            </div>
    </div>);
    }
    componentDidUpdate(){
        if(this.state.id!==this.props.item.id){
            this.setState({
                id: this.props.item.id,
                zettel_sigel: this.props.item.zettel_sigel,
                opera_id: this.props.item.opera_id,
                opera: this.props.opera,
                comment: this.props.comment,
            });
        }
    }
}

export { Opera, Konkordanz };