import React from "react";

import { arachne } from "./arachne.js";
import { Navigator, parseHTML, SearchBox, SelectMenu, Selector, AutoComplete } from "./elements.js";

import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

class Zettel extends React.Component{
    constructor(props){
        super(props);
        this.state = {showDate: true, count:0, selectionDetail:{ids:[], currentId:null, activeProjects: []}};
    }

    render(){
        return (
        <div style={{padding: "0 10px", display: "grid", gridTemplateColumns: "auto 420px", gridTemplateRows: "min-content auto", rowGap: "15px"}}>
            <SearchBox
                boxName="zettel"
                searchQuery={(q,order) => {this.searchQuery(q,order)}}
                searchOptions={[
                    ["lemma", "Lemma"],
                    ["type", "Typ"],
                    ["id", "ID"],
                    ["opus", "Werk"],
                    ["date_type", "Datum-Typ"]
                ]}
                sortOptions={[['["id"]', "ID"], ['["lemma", "lemma_nr", "date_sort", "date_type"]', "Datum"]]}
                gridArea={(this.state.selectionDetail.ids.length>0)?"1/1/1/2":"1/1/1/3"}
            />
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
            {(this.state.selectionDetail.ids.length>0)?<ZettelAside activeProjects={this.state.activeProjects} status={this.props.status} selection={this.state.selectionDetail} item={this.state.itemDetail} onUpdate={ids=>{this.reloadZettel(ids)}} openNextItem={()=>{this.openNextItem()}} toggleShowDate={()=>{
                if(this.state.showDate){this.setState({showDate: false})}
                else{this.setState({showDate: true})}
                
                }} />:""}
        </div>
        );
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
        this.props.status("searching");
        const count = await arachne.zettel.search(newQuery, {count:true, order:order});
        const currentElements = await arachne.zettel.search(newQuery, {limit:50, order:order});
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
        const currentElements = await arachne.zettel.search(this.state.query, {limit:50, offset:((newPage-1)*50), order:this.state.queryOrder});
            this.setState({
                currentPage: newPage,
                currentElements: currentElements,
                selectionDetail: {ids:[]}
            });
    }
    componentDidMount(){
        if(arachne.access("editor")){
            arachne.project.get({status: 1})
            .then(projects => {
                let projectLst = [];
                for(const project of projects){
                    projectLst.push([project.id, project.name]);
                }
                this.setState({activeProjects: projectLst});
            })
            .catch(e => {throw e;});
        }
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
                cEls.push(<ZettelCard showDate={this.props.showDate} testProp={cEl.id+"_test"} id={cEl.id} item={cEl} key={cEl.id} />);
            }

            return (
            <div style={{gridArea: this.props.gridArea, padding:"0 10px"}}>
                <Navigator loadPage={newPage=>{this.props.loadPage(newPage)}} currentPage={this.props.currentPage} maxPage={this.props.maxPage} />
                <Selector multiSelect={true} className="zettel_box" selectCallback={
                    (item, selection)=>{this.selectCallback(item, selection)}
                } preset={this.props.presetSelection} >{cEls}</Selector>
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
                <img alt="" style={{objectFit: "fill", borderRadius: "7px"}} className={classList} src={zettel.img_path+".jpg"}></img>
                {this.props.showDate?<div className="zettel_msg" dangerouslySetInnerHTML={parseHTML(zettel.date_display)}></div>:null}
                <div className="zettel_menu">
                    <span style={{float: "left"}} dangerouslySetInnerHTML={parseHTML(zettel.lemma_display)}></span>
                    <span style={{float: "right"}} dangerouslySetInnerHTML={parseHTML(zettel.opus)}></span>
                </div>
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
            addLemma: false,
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
            /* */
            newLemma_Lemma: "",
            newLemma_LemmaDisplay: "",
            batch_lemma_id: null,
            batch_lemma_ac: "",
            batch_work_id: null,
            batch_ac_web: "", // = work_ac
            batch_type: null,
            batch_project: null
        };
    }
    render(){
        const style = {
            position: "fixed",
            top: 0,
            bottom: 0,
            right: 0,
            width: "400px",
            padding: "10px 15px",
            boxShadow: "rgb(60, 110, 113) 0px 0px 2px",
            overflow: "scroll",
        }
        if(this.state.addLemma){ // add lemma
            return <div style={style} className="mainColors">
            <div style={{
                margin: "50px 0 10px 0"}}>
                <p><b>Soll ein neues Lemma erstellt werden?</b><br /><span className="minorTxt"><a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/10-WikiHow:-Neues-Lemma-erstellen#3-maske-ausfüllen" target="_blank" rel="noreferrer">Hier</a> finden Sie Informationen zum Erstellen neuer Lemmata.</span></p>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr 1fr",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                <div style={{gridArea: "1/1/1/2"}}>Lemma:</div>
                <div style={{gridArea: "1/2/1/3"}}><input type="text" value={this.state.newLemma_Lemma} onChange={event=>{this.setState({newLemma_Lemma: event.target.value})}} /></div>
                <div style={{gridArea: "2/1/2/2"}}>Lemma-Anzeige:</div>
                <div style={{gridArea: "2/2/2/3"}}><input type="text" value={this.state.newLemma_LemmaDisplay} onChange={event=>{this.setState({newLemma_LemmaDisplay: event.target.value})}} /></div>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr 1fr 1fr 1fr",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                <div style={{gridArea: "1/1/1/2"}}>Zahlzeichen:</div>
                <div style={{gridArea: "1/2/1/3"}}><SelectMenu options={[[0, ""], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]]} onChange={event=>{this.setState({newLemma_Homonym: event.target.value})}} /></div>
                <div style={{gridArea: "2/1/2/2"}}>im Wörterbuch:</div>
                <div style={{gridArea: "2/2/2/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({newLemma_MLW: event.target.value})}} /></div>
                <div style={{gridArea: "3/1/3/2"}}>Stern:</div>
                <div style={{gridArea: "3/2/3/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({newLemma_Stern: event.target.value})}} /></div>
                <div style={{gridArea: "4/1/4/2"}}>Fragezeichen:</div>
                <div style={{gridArea: "4/2/4/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({newLemma_LemmaFrage: event.target.value})}} /></div>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                <div style={{gridArea: "1/1/1/2"}}><input type="button" value="erstellen" onClick={async ()=>{
                    if(this.state.newLemma_Lemma==="" || this.state.newLemma_Lemma.indexOf(" ")>-1){
                        this.props.status("error", "Bitte ein gültiges Lemma eintragen!");
                    } else if(this.state.newLemma_LemmaDisplay===""){
                        this.props.status("error", "Bitte tragen Sie eine gültige Lemma-Anzeige ein!");
                    } else {
                        let newLemmaValue = {
                            lemma: this.state.newLemma_Lemma,
                            lemma_display: this.state.newLemma_LemmaDisplay,
                            MLW: this.state.newLemma_MLW,
                            Fragezeichen: this.state.newLemma_LemmaFrage,
                            Stern: this.state.newLemma_Stern,
                        };
                        if(this.state.newLemma_Homonym>0){newLemmaValue.lemma_nr=this.state.newLemma_Homonym}
                        const newId = await arachne.lemma.save(newLemmaValue);
                        this.props.status("saved", `Neue ID: ${newId}`);
                        this.setState({lemma_ac: this.state.newLemma_Lemma, lemma_id: newId, addLemma: false});
                    }
                }} /></div>
                <div style={{gridArea: "1/2/1/3"}}><input type="button" value="abbrechen" onClick={()=>{this.setState({addLemma: false})}} /></div>
            </div>
            </div>;
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
            let dateOwn = "";
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
                dateOwn = [<div key="1" style={{gridArea: "2/1/2/3"}}><span className="minorTxt"><b>Achtung:</b> Dieser Zettel benötigt eine <a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/10-WikiHow:-Zettel-verknüpfen#datierung-der-zettel" target="_blank" rel="noreferrer">eigene Datierung</a>.</span></div>,
                <div key="2" style={{gridArea: "3/1/3/2"}}>Sortierdatum:</div>,
                <div key="3" style={{gridArea: "3/2/3/3"}}><input type="text" value={this.state.date_own?this.state.date_own:""} onChange={e=>{
                    if(!isNaN(e.target.value)&&e.target.value!==""&&e.target.value!==" "){
                        this.setState({date_own: parseInt(e.target.value)});
                    }else{
                        this.props.status("error", "Sortierdatum muss eine Ganzzahl sein!");
                    }
                }} /></div>,
                <div key="4" style={{gridArea: "4/1/4/2"}}>Anzeigedatum:</div>,
                <div key="5" style={{gridArea: "4/2/4/3"}}><input type="text" value={this.state.date_own_display?this.state.date_own_display:""} onChange={e=>{this.setState({date_own_display: e.target.value})}} /></div>
            ];
            }
            return (
    <div style={style} className="mainColors">
        <div style={{
            display: "grid",
            gridTemplateColumns: "150px auto",
            gridTemplateRows: "1fr 5px 1fr 1fr 1fr",
            rowGap: "10px",
            margin: "35px 0 30px 0"
        }}>
            <div className="minorTxt" style={{gridArea: "1/1/1/3", textAlign: "right"}}>
                <i>ID {this.state.id}</i>
            </div>
            <div style={{gridArea: "3/1/3/2"}}>Zetteltyp:</div>
            <div style={{gridArea: "3/2/3/3"}}>
                <SelectMenu style={{width: "86%"}} value={this.state.type?this.state.type:0} options={[[0, "..."],[1, "verzettelt"],[2,"Exzerpt"],[3,"Index"],[4,"Literatur"], [6, "Index (unkl. Werk)"], [7, "Notiz"]]} onChange={event=>{this.setState({type: parseInt(event.target.value)})}} classList="zettel_type" />
            </div>
            <div style={{gridArea: "4/1/4/2"}}>Lemma:</div>
            <div style={{gridArea: "4/2/4/3"}}>
                <AutoComplete onChange={(value, id)=>{this.setState({lemma_ac: value, lemma_id: id, newLemma_Lemma: value, newLemma_LemmaDisplay: value})}} value={this.state.lemma_ac?this.state.lemma_ac:""} tbl="lemma" searchCol="lemma" returnCol="lemma_ac" />
            </div>
            {this.state.type!==4&&this.state.type<6 ? <div style={{gridArea: "5/1/5/2"}}>Werk:</div> : null}
            {this.state.type!==4&&this.state.type<6 ? <div style={{gridArea: "5/2/5/3"}}><AutoComplete  value={this.state.ac_web?this.state.ac_web:""} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={(value, id)=>{this.setState({ac_web: value, work_id: id})}} /></div> : null}
        </div>
        {this.state.type!==4&&this.state.type<6&&this.state.work_id>0 ?
        <div style={dateStyle}>
            <div style={{gridArea: "1/1/1/2"}}>Datierung:</div>
            <div style={{gridArea: "1/2/1/3"}}><span dangerouslySetInnerHTML={parseHTML(this.state.date_display)}></span></div>
            {dateOwn}
        </div>
        :null}
        {this.state.type!==4&&this.state.type<6&&this.state.work_id>0 ?
            <div style={{textAlign: "right", marginBottom: "20px"}}><a className="minorTxt" onClick={this.props.toggleShowDate}>Datierung ein-/ausblenden</a></div>
        :null}
        <div style={{
            borderTop: "1px solid #f2f2f2",
            paddingTop: "30px",
            display: "grid",
            gridTemplateColumns: "150px auto",
            gridTemplateRows: "1fr",
            rowGap: "10px",
            margin: "10px 0 30px 0"
            }}>
            <div style={{gridArea: "1/2/1/3"}}>
                <input type="button" value="speichern&weiter" style={{marginBottom: "10px"}} onClick={()=>{this.saveDetail(true)}} />
                <input type="button" value="speichern" onClick={()=>{this.saveDetail()}} />
            </div>
        </div>
        {this.state.ressources.length>0&&this.state.type!==4&&this.state.type<6?
        <div style={{
            borderTop: "1px solid #f2f2f2",
            paddingTop: "30px",
            display: "grid",
            gridTemplateColumns: "150px auto",
            gridTemplateRows: "1fr",
            rowGap: "10px",
            margin: "10px 0 30px 0"
            }}>
            <div style={{gridArea: "1/1/1/2"}}>Ressourcen:</div>
            <div style={{gridArea: "1/2/1/3"}}>{cRes}</div>
        </div>
        :null}
        {arachne.access("admin")?
        <div style={{textAlign: "right", fontSize:"25px", marginRight: "10px"}}><FontAwesomeIcon icon={faTrashAlt} onClick={()=>{
            if(window.confirm("Soll der Zettel wirklich gelöscht werden? Dieser Schritt kann nicht mehr rückgängig gemacht werden.")){
                this.props.status("deleting");
                arachne.zettel.delete(this.state.id);
                this.props.status("deleted");
            }
        }} /></div>
        :null}
    </div>
            );
        } else { // batch
            let inputType = "";
            switch(this.state.batchType){
                case 1:
                    inputType = <AutoComplete onChange={(value, id)=>{this.setState({batch_lemma_ac: value, batch_lemma_id: id})}} value={this.state.batch_lemma_ac} tbl="lemma"  searchCol="lemma" returnCol="lemma_ac" />;
                    break;
                case 2:
                    inputType = <AutoComplete  value={this.state.batch_ac_web} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={(value, id)=>{this.setState({batch_ac_web: value, batch_work_id: id})}} />;
                    break;
                case 3:
                    inputType = 
                    <SelectMenu style={{width: "86%"}} options={[[0, "..."],[1, "verzettelt"],[2,"Exzerpt"],[3,"Index"],[4,"Literatur"], [6, "Index (unkl. Stelle)"], [7, "Notiz"]]} onChange={event=>{this.setState({batch_type: event.target.value})}} />;
                    break;
                case 4:
                    //inputType = <SelectMenu style={{width: "86%"}} options={this.props.activeProjects} onChange={event=>{this.setState({batch_project: event.target.value})}} />;
                    break;
                default:
                    inputType = <div style={{color: "red"}}>Unbekannter Stapel-Typ!</div>         
            }
            let batch_options = [[1, "Lemma"],[2, "Werk"],[3,"Zettel-Typ"]];
            if(arachne.access("editor")){batch_options.push([4,"Projekt"])}
            return <div style={style} className="mainColors">
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "150px auto",
                    gridTemplateRows: "1fr 25px 1fr 15px 1fr",
                    rowGap: "10px",
                    margin: "35px 0 30px 0"
                }}>
                    <span style={{gridArea: "1/1/1/3", textAlign: "right"}} className="minorTxt"><i>{this.props.selection.ids.length} Zettel</i></span>
                    <div style={{gridArea: "3/1/3/2"}}>
                        <SelectMenu style={{width: "86%"}} options={batch_options} onChange={event=>{
                            this.setState({batchType: parseInt(event.target.value)})
                            }} />
                    </div>
                    <div style={{gridArea: "3/2/3/3"}}>
                        {inputType}
                    </div>
                    <div style={{gridArea: "5/2/5/3"}}><input type="button" value="für alle übernehmen" onClick={async ()=>{
                        let skipSave = false;
                        let newValue = "";
                        let newKey = "";
                        if(this.state.batchType===1&&this.state.batch_lemma_id!=null){newKey="lemma_id";newValue=this.state.batch_lemma_id}
                        else if(this.state.batchType===2&&this.state.batch_work_id!=null){newKey="work_id";newValue=this.state.batch_work_id}
                        else if(this.state.batchType===3&&this.state.batch_type!=null){newKey="type";newValue=this.state.batch_type}
                        else if(this.state.batchType===4&&this.state.batch_project!=null){newKey="project";newValue=this.state.batch_project}
                        else{skipSave=true;this.props.status("error", "Bitte tragen Sie einen gültigen Wert ein.")}
                        if(skipSave===false&&this.state.batchType<4){
                            let newValueLst = [];
                            for(const cId of this.props.selection.ids){
                                let newValueObj = {id: cId, user_id: arachne.user.id}
                                newValueObj[newKey] = newValue;
                                newValueLst.push(newValueObj);
                            }
                            this.props.status("saving");
                            await arachne.zettel.save(newValueLst);
                            this.props.status("saved");
                            this.props.onUpdate(this.props.selection.ids);
                        }else if(skipSave===false&&this.state.batchType===4){
                            const defaultArticle = await arachne.article.get({"project_id": this.state.batch_project, sort_nr: 0, parent_id: 0});
                            if(defaultArticle.length!=1){alert("Ein Fehler ist aufgetreten: Die Zettel können dem Projekt nicht zugewiesen werden!")}
                            else{
                                const newLinks = this.props.selection.ids.map(i=>{return {zettel_id: i, article_id: defaultArticle[0].id};});
                                this.props.status("saving");
                                await arachne.zettel_lnk.save(newLinks);
                                this.props.status("saved");   
                            }
                        }
                    }} /></div>
                </div>
            </div>;
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
                ressources: []})}
        }
    }
    async saveDetail(next=false){
        if(this.state.work_id>0&&this.state.date_type===9&&this.state.date_own!=""&&!Number.isInteger(this.state.date_own)){
            this.props.status("error", "Sortierdatum muss eine Ganzzahl sein!");
        } else {
            let nVals = {
                id: this.state.id,
                type: this.state.type,
                user_id: arachne.user.id
            };
            if(this.state.work_id>0){nVals.work_id = this.state.work_id}
            else{nVals.work_id = null}

            this.props.status("saving");
            if(this.state.lemma_id===null&&this.state.newLemma_Lemma!==""){this.setState({addLemma: true})}
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
            this.props.status("saved");
            if(next){
                document.querySelector("select.zettel_type").focus();
                this.props.openNextItem();
            }else{this.props.onUpdate([this.state.id]);}
        }
    }
}

export { Zettel };
