import React from "react";

import { arachne } from "./arachne.js";
import { AutoComplete, Navigator, parseHTML, SearchBox, SelectMenu } from "./elements.js";

class Lemma extends React.Component{
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
                    ["lemma", "Lemma"], ["id", "ID"], ["farbe", "Farbe"], ["URL", "URL"]
                ]}
                sortOptions={[['["id"]', "ID"], ['["lemma"]', "Lemma"]]}
                gridArea={(this.state.item)?"1/1/1/2":"1/1/1/3"}
            />
            <LemmaBox
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
            {(this.state.item)?<LemmaAside status={this.props.status} item={this.state.item} onUpdate={id=>{this.reloadEntry(id)}} onClose={()=>{this.setState({item: null})}} />:""}
        </div>
        );
    }
    async reloadEntry(id){
        let newItem = await arachne.lemma.get({id: id}); newItem = newItem[0];
        let currentElements = this.state.currentElements;
        const indexOfNewItem = currentElements.findIndex(i => i.id===newItem.id)
        currentElements[indexOfNewItem] = newItem;
        this.setState({currentElements: currentElements, item: newItem});
    }
    async searchQuery(newQuery, order){
        this.props.status("searching");
        const count = await arachne.lemma.search(newQuery, {count:true, order:order});
        const currentElements = await arachne.lemma.search(newQuery, {limit:50, order:order});
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
        this.colors = {
            "gelb": "#E9AB17",
            "grün": "green",
            "blau": "#0000A0",
            "rot": "#C11B17",
            "lila": "#4B0082",
            "türkis": "#3f888f"
        };
    }
    render(){
        if(this.props.count>0){
            let cEls = [];
            for(const cEl of this.props.currentElements){
                cEls.push(<tr key={cEl.id} id={cEl.id} onDoubleClick={e=>{this.props.showDetail(this.props.currentElements.find(i =>i.id === parseInt(e.target.closest("tr").id)))}}><td title={"ID: "+cEl.id} dangerouslySetInnerHTML={parseHTML(cEl.lemma_display)}></td><td style={{color: this.colors[cEl.farbe]}}>{cEl.farbe}</td><td dangerouslySetInnerHTML={parseHTML(cEl.comment)}></td><td>{cEl.URL?<a href={"https://dom-en-ligne.de/"+cEl.URL} target="_blank" rel="noreferrer">zum Artikel</a>:""}</td></tr>);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Navigator loadPage={newPage=>{this.props.loadPage(newPage)}} currentPage={this.props.currentPage} maxPage={this.props.maxPage} />
                <table width="100%">
                    <thead style={{textAlign:"left"}}><tr><th>Lemma</th><th>Farbe</th><th>Kommentar</th><th>dom en ligne</th></tr></thead>
                    <tbody>{cEls}</tbody>
                </table>
            </div>);
        } else {
            return null;
        }
    }
}
class LemmaAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: this.props.item.id,
            lemma: this.props.item.lemma,
            lemma_simple: this.props.item.lemma_simple,
            nr: this.props.item.nr,
            reference_id: this.props.item.reference_id,
            reference: this.props.item.reference,
            normgraphie: this.props.item.normgraphie,
            dom_normgraphie: this.props.item.dom_normgraphie,
            verworfen: this.props.item.verworfen,
            unsicher: this.props.item.unsicher,
            farbe: this.props.item.farbe,
            comment: this.props.item.comment,
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
            overflow: "scroll"
        }} className="mainColors">
            <div style={{
                display: "grid",
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr 5px 1fr 1fr",
                rowGap: "10px",
                margin: "50px 0 10px 0"
            }}>
                <div className="minorTxt" style={{gridArea: "1/1/1/3", textAlign: "right"}}>
                    <i>ID {this.state.id}</i>
                </div>
                <div style={{gridArea: "3/1/3/2"}}>Lemma:</div>
                <div style={{gridArea: "3/2/3/3"}}><input type="text" value={this.state.lemma} onChange={event=>{this.setState({lemma: event.target.value})}} /></div>
                <div style={{gridArea: "4/1/4/2"}}>Lemma: <i className="minorTxt">(ohne Sonderzeichen)</i></div>
                <div style={{gridArea: "4/2/4/3"}}><input type="text" value={this.state.lemma_simple} onChange={event=>{this.setState({lemma_simple: event.target.value})}} /></div>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr 1fr 1fr 1fr",
                rowGap: "10px",
                margin: "20px 0"
            }}>
                <div style={{gridArea: "1/1/1/2"}}>Farbe:</div>
                <div style={{gridArea: "1/2/1/3"}}><SelectMenu options={[["gelb", "gelb"], ["grün", "grün"],
            ["rot", "rot"], ["blau", "blau"], ["lila", "lila"], ["türkis", "türkis"]]} onChange={event=>{this.setState({farbe: event.target.value})}} value={this.state.farbe} /></div>
                {["blau", "türkis", "lila"].includes(this.state.farbe)&&<div style={{gridArea: "2/1/2/2"}}>Referenz:</div>}
                {["blau", "türkis", "lila"].includes(this.state.farbe)&&<div style={{gridArea: "2/2/2/3"}}><AutoComplete onChange={(value, id)=>{this.setState({reference: value, reference_id: id})}} tbl="lemma" col="ac_w" value={this.state.reference} /></div>}
                <div style={{gridArea: "3/1/3/2"}}>Nummer: <i className="minorTxt">(bei Homonymen)</i></div>
                <div style={{gridArea: "3/2/3/3"}}><input type="text" onChange={event=>{this.setState({nr: event.target.value})}} value={this.state.nr} /></div>
                <div style={{gridArea: "4/1/4/2"}}>Normgraphie:</div>
                <div style={{gridArea: "4/2/4/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({normgraphie: event.target.value})}} value={this.state.normgraphie} /></div>
                <div style={{gridArea: "5/1/5/2"}}>DOM-Normgraphie:</div>
                <div style={{gridArea: "5/2/5/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({dom_normgraphie: event.target.value})}} value={this.state.dom_normgraphie} /></div>
                <div style={{gridArea: "6/1/6/2"}}>verworfen:</div>
                <div style={{gridArea: "6/2/6/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({verworfen: event.target.value})}} value={this.state.verworfen} /></div>
                <div style={{gridArea: "7/1/7/2"}}>unsicher:</div>
                <div style={{gridArea: "7/2/7/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({unsicher: event.target.value})}} value={this.state.unsicher} /></div>
                <div style={{gridArea: "8/1/8/2"}}>Kommentar:</div>
                <div style={{gridArea: "8/2/8/3"}}><textarea onChange={event=>{this.setState({comment: event.target.value})}} style={{resize: "false", width: "97%"}} value={this.state.comment}></textarea></div>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                <div style={{gridArea: "1/1/1/3"}}>
                    <input type="button" value="speichern" onClick={async ()=>{
                    if(this.state.lemma===""){
                        this.props.status("error", "Bitte ein gültiges Lemma eintragen!");
                    } else if(this.state.lemma_display===""){
                        this.props.status("error", "Bitte tragen Sie eine gültige Lemma-Anzeige ein!");
                    } else {
                        let lemmaValue = {
                            id: this.state.id,
                            lemma: this.state.lemma,
                            lemma_simple: this.state.lemma_simple,
                            reference_id: this.state.reference_id,
                            normgraphie: this.state.normgraphie,
                            dom_normgraphie: this.state.dom_normgraphie,
                            verworfen: this.state.verworfen,
                            unsicher: this.state.unsicher,
                            farbe: this.state.farbe,
                            comment: this.state.comment
                        };
                        if(!isNaN(this.state.nr)){lemmaValue.nr=this.state.nr}
                        const newId = await arachne.lemma.save(lemmaValue);
                        this.props.status("saved");
                        this.props.onUpdate(this.state.id);
                    }
                    }} />
                    <input style={{marginLeft: "20px"}} type="button" value="löschen" onClick={async ()=>{
                        if(window.confirm("Soll das Lemma wirklich gelöscht werden? Dieser Schritt kann nicht rückgängig gemacht werden.")){
                            const zettels = await arachne.zettel.get({lemma_id: this.state.id});
                            if(zettels.length>0){
                                alert("Mit diesem Lemma sind Zettel verknüpft. Es kann nicht gelöscht werden. Weisen Sie zuerst den Zettel ein anderes Lemma zu, bevor Sie das Lemma löschen.");
                            } else {
                                this.props.status("deleting");
                                await arachne.lemma.delete(this.state.id)
                                this.props.status("deleted");
                                this.props.onClose();

                            }
                        }
                    }} />
                </div>
            </div>
    </div>);
    }
    componentDidUpdate(){
        if(this.state.id!==this.props.item.id){
            this.setState({
                id: this.props.item.id,
                lemma: this.props.item.lemma,
                lemma_simple: this.props.item.lemma_simple,
                nr: this.props.item.nr,
                reference_id: this.props.item.reference_id,
                reference: this.props.item.reference,
                normgraphie: this.props.item.normgraphie,
                dom_normgraphie: this.props.item.dom_normgraphie,
                verworfen: this.props.item.verworfen,
                unsicher: this.props.item.unsicher,
                farbe: this.props.item.farbe,
                comment: this.props.item.comment
            });
        }
    }
}

export { Lemma };