import React from "react";

import { arachne } from "./arachne.js";
import { Navigator, parseHTML, SearchBox, SelectMenu, Selector, AutoComplete } from "./elements.js";

class Zettel extends React.Component{
    constructor(props){
        super(props);
        this.state = {count:0, selectionDetail:{ids:[], currentId:null}, showDetailsOnZettel: true};
    }

    render(){
        return (
        <div style={{padding: "0 10px", display: "grid", gridTemplateColumns: "auto 420px", gridTemplateRows: "min-content auto", rowGap: "15px"}}>
            <div className="minorTxt" style={{position: "fixed", bottom: "10px", left: "10px"}} onClick={()=>{
                if(this.state.showDetailsOnZettel){this.setState({showDetailsOnZettel: false})}
                else{this.setState({showDetailsOnZettel: true})}
            }}>{this.state.showDetailsOnZettel?<a>Details auf Zettel verbergen.</a>:<a>Details auf Zettel anzeigen.</a>}</div>
            <SearchBox
                searchQuery={(q,order) => {this.searchQuery(q,order)}}
                searchOptions={[
                    ["lemma_simple", "Lemma"],
                    ["lemma_id", "lemma-ID"],
                    ["farbe", "Farbe"],
                    ["id", "ID"],
                    ["editor", "EditorIn"],
                    ["comment", "Kommentar"],
                    ["zettel_sigel", "Sigel"],
                ]}
                sortOptions={[['["id"]', "ID"], ['["lemma_simple", "nr"]', "Lemma"]]}
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
                displayDetailsOnZettel={this.state.showDetailsOnZettel}
                showDetail={item => {
                    this.setState({selectionDetail: item.selection, itemDetail: item.item});
                }}
            />
            {(this.state.selectionDetail.ids.length>0)?<ZettelAside status={this.props.status} selection={this.state.selectionDetail} item={this.state.itemDetail} onUpdate={ids=>{this.reloadZettel(ids)}} openNextItem={()=>{this.openNextItem()}} />:""}
        </div>
        );
    }
    async openNextItem(){
        // save current element
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
                cEls.push(<ZettelCard displayDetailsOnZettel={this.props.displayDetailsOnZettel} testProp={cEl.id+"_test"} id={cEl.id} item={cEl} key={cEl.id} />);
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
        let style = {width: arachne.options.z_width+"px"};
        let classList = "";
        if(zettel.in_use===0){classList+="zettel_img no_use"}
        else{classList+="zettel_img in_use"}
        const box =
        <div className="zettel" id={zettel.id} style={style}>
            <img alt="" className={classList} src={zettel.img_path+".jpg"}></img>
            {this.props.displayDetailsOnZettel?<div className="zettel_menu">
                <span style={{float: "left"}} dangerouslySetInnerHTML={parseHTML(zettel.lemma_display)}></span>
                <span style={{float: "right"}} dangerouslySetInnerHTML={parseHTML(zettel.zettel_sigel)}></span>
            </div>:null}
        </div>;
        return box;
    }
}
class ZettelAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            addLemma: false,
            batchType: 1,
            id: this.props.item.id,
            lemma_id: this.props.item.lemma_id,
            ac_w: this.props.item.ac_w,
            konkordanz_id: this.props.item.konkordanz_id,
            zettel_sigel: this.props.item.zettel_sigel,
            comment: this.props.item.comment,
            newLemma_Lemma: "",
            newLemma_LemmaSimple: "",
            batch_lemma_id: null,
            batch_ac_w: "",
            batch_konkordanz_id: null,
            sigelPreview: null,
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
                <p><b>Soll ein neues Lemma erstellt werden?</b></p>
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
                <div style={{gridArea: "2/1/2/2"}}>Lemma: <i className="minorTxt">(ohne Sonderzeichen)</i></div>
                <div style={{gridArea: "2/2/2/3"}}><input type="text" value={this.state.newLemma_LemmaSimple} onChange={event=>{this.setState({newLemma_LemmaSimple: event.target.value})}} /></div>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr 1fr 1fr 1fr",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                <div style={{gridArea: "1/1/1/2"}}>Farbe:</div>
                <div style={{gridArea: "1/2/1/3"}}><SelectMenu options={[["gelb", "gelb"], ["grün", "grün"],
            ["rot", "rot"], ["blau", "blau"], ["lila", "lila"], ["türkis", "türkis"]]} onChange={event=>{this.setState({newLemma_farbe: event.target.value})}} /></div>
                {["blau", "türkis", "lila"].includes(this.state.newLemma_farbe)&&<div style={{gridArea: "2/1/2/2"}}>Referenz:</div>}
                {["blau", "türkis", "lila"].includes(this.state.newLemma_farbe)&&<div style={{gridArea: "2/2/2/3"}}><AutoComplete onChange={(value, id)=>{this.setState({newLemma_reference: value, newLemma_reference_id: id})}} tbl="lemma" col="ac_w" /></div>}
                <div style={{gridArea: "3/1/3/2"}}>Nummer: <i className="minorTxt">(bei Homonymen)</i></div>
                <div style={{gridArea: "3/2/3/3"}}><input type="text" onChange={event=>{this.setState({newLemma_nr: event.target.value})}} /></div>
                <div style={{gridArea: "4/1/4/2"}}>Normgraphie:</div>
                <div style={{gridArea: "4/2/4/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({newLemma_normgraphie: event.target.value})}} /></div>
                <div style={{gridArea: "5/1/5/2"}}>DOM-Normgraphie:</div>
                <div style={{gridArea: "5/2/5/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({newLemma_dom_normgraphie: event.target.value})}} /></div>
                <div style={{gridArea: "6/1/6/2"}}>verworfen:</div>
                <div style={{gridArea: "6/2/6/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({newLemma_verworfen: event.target.value})}} /></div>
                <div style={{gridArea: "7/1/7/2"}}>unsicher:</div>
                <div style={{gridArea: "7/2/7/3"}}><SelectMenu options={[[0, "Nein"], [1, "Ja"]]} onChange={event=>{this.setState({newLemma_unsicher: event.target.value})}} /></div>
                <div style={{gridArea: "8/1/8/2"}}>Kommentar:</div>
                <div style={{gridArea: "8/2/8/3"}}><textarea onChange={event=>{this.setState({newLemma_comment: event.target.value})}} style={{resize: "false"}}></textarea></div>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "150px auto",
                gridTemplateRows: "1fr",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                <div style={{gridArea: "1/1/1/2"}}><input type="button" value="erstellen" onClick={async ()=>{
                    if(this.state.newLemma_Lemma===""){
                        this.props.status("error", "Bitte ein gültiges Lemma eintragen!");
                    } else if(this.state.newLemma_LemmaSimple===""){
                        this.props.status("error", "Bitte tragen Sie eine gültige Lemma ohne Sonderzeichen ein!");
                    } else {
                        let newLemmaValue = {
                            lemma: this.state.newLemma_Lemma,
                            lemma_simple: this.state.newLemma_LemmaSimple,
                            reference_id: this.state.newLemma_reference_id,
                            normgraphie: this.state.newLemma_normgraphie,
                            dom_normgraphie: this.state.newLemma_dom_normgraphie,
                            verworfen: this.state.newLemma_verworfen,
                            unsicher: this.state.newLemma_unsicher,
                            farbe: this.state.newLemma_farbe,
                            comment: this.state.newLemma_comment,
                        };
                        if(this.state.newLemma_nr>0){newLemmaValue.nr=this.state.newLemma_nr}
                        const newId = await arachne.lemma.save(newLemmaValue);
                        this.props.status("saved", `Neue ID: ${newId}`);
                        this.setState({ac_w: this.state.newLemma_Lemma, lemma_id: newId, addLemma: false});
                    }
                }} /></div>
                <div style={{gridArea: "1/2/1/3"}}><input type="button" value="abbrechen" onClick={()=>{this.setState({addLemma: false})}} /></div>
            </div>
            </div>;
        } else if(this.props.selection.ids.length===1){ // single zettel
            return (
    <div style={style} className="mainColors">
        <div style={{
            display: "grid",
            gridTemplateColumns: "150px auto",
            gridTemplateRows: "1fr 5px 1fr 1fr",
            rowGap: "10px",
            margin: "35px 0 0px 0"
        }}>
            <div className="minorTxt" style={{gridArea: "1/1/1/3", textAlign: "right"}}>
                <i>ID {this.state.id}</i>
            </div>
            <div style={{gridArea: "3/1/3/2"}}>Lemma:</div>
            <div style={{gridArea: "3/2/3/3"}}>
                <AutoComplete classList="lemma_detail" onChange={(value, id)=>{this.setState({ac_w: value, lemma_id: id, newLemma_Lemma: value, newLemma_LemmaSimple: value, newLemma_farbe: "gelb"})}} value={this.state.ac_w?this.state.ac_w:""} tbl="lemma" col="ac_w" />
            </div>
            <div style={{gridArea: "4/1/4/2"}}>Sigel:</div>
            <div style={{gridArea: "4/2/4/3"}}><AutoComplete  value={this.state.zettel_sigel?this.state.zettel_sigel:""} tbl="konkordanz" col="zettel_sigel" onChange={(value, id)=>{this.setState({zettel_sigel: value, konkordanz_id: id})}} /></div>
        </div>
        {this.state.sigelPreview&&<div className="minorTxt" style={{padding: "5px 15px 0 15px"}}><b>{this.state.sigelPreview.sigel}</b> = <span dangerouslySetInnerHTML={parseHTML(this.state.sigelPreview.werk)}></span></div>}
        <div style={{
            display: "grid",
            gridTemplateColumns: "150px auto",
            gridTemplateRows: "60px",
            rowGap: "10px",
            margin: "10px 0 30px 0"
        }}>
            <div style={{gridArea: "1/1/1/2"}}>Kommentar:</div>
            <div style={{gridArea: "1/2/1/3"}}><textarea className="mainColors" style={{resize: "none", width: "85%", height: "50px"}} placeholder="..." value={this.state.comment?this.state.comment:""} onChange={e=>{this.setState({comment: e.target.value})}}></textarea></div>
        </div>
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
    </div>
            );
        } else { // batch
            let inputType = "";
            switch(this.state.batchType){
                case 1:
                    inputType = <AutoComplete onChange={(value, id)=>{this.setState({batch_ac_w: value, batch_lemma_id: id})}} value={this.state.batch_ac_w} tbl="lemma" col="ac_w" />;
                    break;
                case 2:
                    inputType = <AutoComplete  value={this.state.batch_konkordanz} tbl="konkordanz" col="zettel_sigel" onChange={(value, id)=>{this.setState({batch_konkordanz: value, batch_konkordanz_id: id})}} />;
                    break;
                case 3:
                    inputType = <span><textarea style={{width: "90%"}} placeholder="..." onChange={e=>{this.setState({batch_comment: e.target.value})}}></textarea><p className="minorTxt"><b>Achtung:</b> Bestehende Kommentare werden überschrieben!</p></span>;
                    break;
                default:
                    inputType = <div style={{color: "red"}}>Unbekannter Stapel-Typ!</div>         
            }
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
                        <SelectMenu style={{width: "86%"}} options={[[1, "Lemma"],[2, "Sigel"],[3,"Kommentar"]]} onChange={event=>{
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
                        else if(this.state.batchType===2&&this.state.batch_konkordanz_id!=null){newKey="konkordanz_id";newValue=this.state.batch_konkordanz_id}
                        else if(this.state.batchType===3&&this.state.batch_comment!=null){newKey="comment";newValue=this.state.batch_comment}
                        else{skipSave=true;this.props.status("error", "Bitte tragen Sie einen gültigen Wert ein.")}
                        if(skipSave===false){
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
                        }
                    }} /></div>
                </div>
            </div>;
        }
    }
    componentDidUpdate(prevProps, prevState){
        if(this.state.id!==this.props.item.id){
            this.setState({addLemma: false,
                id: this.props.item.id,
                type: this.props.item.type,
                lemma_id: this.props.item.lemma_id,
                ac_w: this.props.item.ac_w,
                konkordanz_id: this.props.item.konkordanz_id,
                zettel_sigel: this.props.item.zettel_sigel,
                comment: this.props.item.comment,
                sigelPreview: null,
            });
        } else if(this.state.konkordanz_id>0&&prevState.konkordanz_id!=this.state.konkordanz_id){
            arachne.opera.get({konkordanz_id: this.state.konkordanz_id}).then(sigel=>{
                this.setState({sigelPreview: sigel[0]})
            }).catch(e=>{throw e});
        }
    }
    async saveDetail(next=false){
        let nVals = {
            id: this.state.id,
            konkordanz_id: this.state.konkordanz_id,
            comment: this.state.comment,
            user_id: arachne.user.id
        };
        this.props.status("saving");
        if(this.state.lemma_id===null&&this.state.newLemma_Lemma!==""){this.setState({addLemma: true})}
        else {nVals.lemma_id = this.state.lemma_id}
        await arachne.zettel.save(nVals)
        this.props.status("saved");
        if(next){
            document.querySelector("input.lemma_detail").focus();
            this.props.openNextItem();
        }else{this.props.onUpdate([this.state.id]);}
    }
}

export { Zettel };