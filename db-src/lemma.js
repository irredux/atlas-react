import React from "react";

import { arachne } from "./arachne.js";
import { Navigator, parseHTML, parseHTMLPreview, SearchBox, SelectMenu } from "./elements.js";

import { faPlusCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class Lemma extends React.Component{
    constructor(props){
        super(props);
        this.state = {item: null, newItemCreated: null};
    }

    render(){
        return (
        <div style={{padding: "0 10px", display: "grid", gridTemplateColumns: "auto 420px", gridTemplateRows: "min-content auto", rowGap: "15px"}}>
            <SearchBox
                setupItems={this.state.newItemCreated}
                boxName="lemma"
                searchQuery={(q,order) => {this.searchQuery(q,order)}}
                searchOptions={[
                    ["lemma", "Lemma"],
                    ["lemma_ac", "Lemma-Anzeige"],
                    ["id", "ID"]
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
            {arachne.access("l_edit")&&<div style={{position: "fixed", bottom: "20px", right: "20px", fontSize: "30px"}}><FontAwesomeIcon id="mainAddButton" icon={faPlusCircle} onClick={async ()=>{
                if(window.confirm("Soll ein neues Lemma erstellt werden?")){
                    this.props.status("saving");
                    const newId = await arachne.lemma.save({lemma_display:"Neues Lemma", lemma:"Neues Lemma"});
                    console.log("new ID:", newId)
                    this.setState({newItemCreated: [{c: "id", o: "=", v:newId}]});
                    this.props.status("saved", "Neuer Eintrag erstellt.");
                }
            }} /></div>}
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
                cEls.push(<tr key={cEl.id} id={cEl.id} onDoubleClick={e=>{this.props.showDetail(this.props.currentElements.find(i =>i.id === parseInt(e.target.closest("tr").id)))}}><td title={"ID: "+cEl.id} dangerouslySetInnerHTML={parseHTML(cEl.lemma_display)}></td><td>{cEl.dicts}</td><td dangerouslySetInnerHTML={parseHTML(cEl.comment)}></td></tr>);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Navigator loadPage={newPage=>{this.props.loadPage(newPage)}} currentPage={this.props.currentPage} maxPage={this.props.maxPage} />
                <table width="100%">
                    <thead style={{textAlign:"left"}}><tr><th>Lemmaansatz</th><th>Wörterbücher</th><th>Kommentar</th></tr></thead>
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
            lemma_display: this.props.item.lemma_display,
            homonym: this.props.item.homonym,
            MLW: this.props.item.MLW,
            Stern: this.props.item.Stern,
            Fragezeichen: this.props.item.Fragezeichen,
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
            gridTemplateRows: "1fr 5px 1fr 1fr",
            rowGap: "10px",
            margin: "50px 0"
        }}>
            <div className="minorTxt" style={{gridArea: "1/1/1/3", textAlign: "right"}}>
                <i>ID {this.state.id}</i><FontAwesomeIcon style={{position: "relative", top: "4px", marginLeft: "10px", fontSize: "23px"}} className="closeButton" icon={faTimesCircle} onClick={()=>{this.props.onClose()}} />
            </div>
            <div style={{gridArea: "3/1/3/2"}}>Lemma:</div>
            <div style={{gridArea: "3/2/3/3"}}><input type="text" value={this.state.lemma} onChange={event=>{this.setState({lemma: event.target.value})}} /></div>
            <div style={{gridArea: "4/1/4/2"}}>Lemma-Anzeige:</div>
            <div style={{gridArea: "4/2/4/3"}}><input type="text" value={parseHTMLPreview(this.state.lemma_display)} onChange={event=>{this.setState({lemma_display: event.target.value})}} /></div>
        </div>
        <div style={{
            display: "grid",
            gridTemplateColumns: "150px auto",
            gridTemplateRows: "1fr 1fr 1fr 1fr",
            rowGap: "10px",
            margin: "50px 0"
        }}>
            <div style={{gridArea: "1/1/1/2"}}>Zahlzeichen:</div>
            <div style={{gridArea: "1/2/1/3"}}><SelectMenu options={[[0, ""], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]]} onChange={event=>{this.setState({homonym: event.target.value})}} value={this.state.homonym} /></div>
            <div style={{gridArea: "2/1/2/2"}}>im Wörterbuch:</div>
            <div style={{gridArea: "2/2/2/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({MLW: event.target.value})}} value={this.state.MLW} /></div>
            <div style={{gridArea: "3/1/3/2"}}>Stern:</div>
            <div style={{gridArea: "3/2/3/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({Stern: event.target.value})}} value={this.state.Stern} /></div>
            <div style={{gridArea: "4/1/4/2"}}>Fragezeichen:</div>
            <div style={{gridArea: "4/2/4/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({Fragezeichen: event.target.value})}} value={this.state.Fragezeichen} /></div>
            <div style={{gridArea: "6/2/6/3"}}><input type="button" value="speichern" onClick={async ()=>{
                if(this.state.lemma==="" || this.state.lemma.indexOf(" ")>-1){
                    this.props.status("error", "Bitte ein gültiges Lemma eintragen!");
                } else if(this.state.lemma_display===""){
                    this.props.status("error", "Bitte tragen Sie eine gültige Lemma-Anzeige ein!");
                } else {
                    let newLemmaValue = {
                        id: this.state.id,
                        lemma: this.state.lemma,
                        lemma_display: this.state.lemma_display,
                        MLW: this.state.MLW,
                        Fragezeichen: this.state.Fragezeichen,
                        Stern: this.state.Stern,
                    };
                    if(this.state.homonym>0){newLemmaValue.lemma_nr=this.state.homonym}
                    const newId = await arachne.lemma.save(newLemmaValue);
                    this.props.status("saved");
                    this.props.onUpdate(this.state.id);
                }
            }} /></div>
        </div>
    </div>
        );
    }
    componentDidUpdate(){
        if(this.state.id!==this.props.item.id){
            console.log("NOW!");
            this.setState({
                id: this.props.item.id,
                lemma: this.props.item.lemma,
                lemma_display: this.props.item.lemma_display,
                homonym: this.props.item.homonym,
                MLW: this.props.item.MLW,
                Stern: this.props.item.Stern,
                Fragezeichen: this.props.item.Fragezeichen,
            });
        }
    }
}

export { Lemma };