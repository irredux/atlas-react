import React from "react";
import { faExternalLinkAlt, faForward, faBackward, faPlusCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./arachne.js";
import { parseHTML, SelectMenu } from "./elements.js";

class OperaAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {author: null, work: null, authorLst: []};
    }
    render(){
        return <div style={{
            position: "fixed",
            overflow: "scroll",
            top: 0,
            bottom: 0,
            right: 0,
            width: "400px",
            padding: "10px 15px",
            boxShadow: "rgb(60, 110, 113) 0px 0px 2px"
        }} className="mainColors">
            <div style={{position: "absolute", top: "50px", right: "10px"}}><FontAwesomeIcon style={{position: "relative", top: "4px", marginLeft: "10px", fontSize: "23px"}} className="closeButton" icon={faTimesCircle} onClick={()=>{this.props.onClose()}} /></div>
            
            {this.state.author&&<div style={{
                display: "grid",
                gridTemplateColumns: "150px auto",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                <h3>Autor <i style={{fontSize: "60%"}}>ID: {this.state.author.id})</i></h3><div></div>
                <div>Name:</div><div><input type="text" value={this.state.author.full?this.state.author.full.replace(/&lt;/g, "<").replace(/&gt;/g,">"):""} onChange={e=>{let nAuthor = this.state.author;nAuthor.full = e.target.value;this.setState({author:nAuthor})}} /></div>
                <div>Abkürzung:</div><div><input type="text" value={this.state.author.abbr} onChange={e=>{let nAuthor = this.state.author;nAuthor.abbr = e.target.value;this.setState({author:nAuthor})}} /></div>
                <div>Abkürzung (Sortierung):</div><div><input type="text" value={this.state.author.abbr_sort} onChange={e=>{let nAuthor = this.state.author;nAuthor.abbr_sort = e.target.value;this.setState({author:nAuthor})}} /></div>
                <div>Anzeigedatum:</div><div><input type="text" value={this.state.author.date_display} onChange={e=>{let nAuthor = this.state.author;nAuthor.date_display = e.target.value;this.setState({author:nAuthor})}} /></div>
                <div>Sortierdatum:</div><div><input type="text" value={this.state.author.date_sort} onChange={e=>{let nAuthor = this.state.author;nAuthor.date_sort = e.target.value;this.setState({author:nAuthor})}} /></div>
                <div>Sortierdatum-Typ:</div><div><input type="text" value={this.state.author.date_type} onChange={e=>{let nAuthor = this.state.author;nAuthor.date_type = e.target.value;this.setState({author:nAuthor})}} /></div>
                <div>in Benutzung:</div><div><SelectMenu style={{width: "86%"}} options={[[0, "Nein"], [1, "Ja"]]} value={this.state.author.in_use} onChange={e=>{let nAuthor = this.state.author;nAuthor.in_use = e.target.value;this.setState({author:nAuthor})}} /></div>
                <div></div><div>
                    <input type="button" value="speichern" onClick={async ()=>{
                    this.props.status("saving");
                    await arachne.author.save(this.state.author);
                    this.props.status("saved");
                    this.props.onUpdate();
                }} />
                    <input type="button" value="löschen" style={{marginLeft: "10px"}} onClick={async ()=>{
                        const works = await arachne.work.search([{c: "author_id", o: "=", v: this.state.author.id}], {select: ["id"]});
                        let workLst = [];
                        for(const work of works){
                            workLst.push(work.id);
                        }
                        if(window.confirm(`Soll der Autor wirklich gelöscht werden? ${workLst.length} damit ${workLst.length>1?"verknüpfte Werke werden":"verknüpftes Werk wird"} ebenfalls gelöscht. Dieser Schritt kann nicht mehr rückgängig gemacht werden!`)){
                            this.props.status("deleting");
                            if(workLst.length>0){await arachne.work.delete(workLst)};
                            await arachne.author.delete(this.state.author.id);
                            this.props.status("deleted");
                            this.props.onUpdate();
                        }
                    }} />
                </div>
            </div>
        }
            {this.state.work&&<div style={{
                display: "grid",
                gridTemplateColumns: "150px auto",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                <h3>Werk <i style={{fontSize: "60%"}}>(ID: {this.state.work.id})</i></h3><div></div>
                <div>Werktitel:</div><div><input type="text" value={this.state.work.full?this.state.work.full.replace(/&lt;/g, "<").replace(/&gt;/g,">"):""} onChange={e=>{let nWork = this.state.work;nWork.full = e.target.value;this.setState({work:nWork})}} /></div>
                <div>Abkürzung:</div><div><input type="text" value={this.state.work.abbr} onChange={e=>{let nWork = this.state.work;nWork.abbr = e.target.value;this.setState({work:nWork})}} /></div>
                <div>Abkürzung (Sortierung):</div><div><input type="text" value={this.state.work.abbr_sort} onChange={e=>{let nWork = this.state.work;nWork.abbr_sort = e.target.value;this.setState({work:nWork})}} /></div>
                <div>Anzeigedatum:</div><div><input type="text" value={this.state.work.date_display} onChange={e=>{let nWork = this.state.work;nWork.date_display = e.target.value;this.setState({work:nWork})}} /></div>
                <div>Sortierdatum:</div><div><input type="text" value={this.state.work.date_sort} onChange={e=>{let nWork = this.state.work;nWork.date_sort = e.target.value;this.setState({work:nWork})}} /></div>
                <div>Sortierdatum-Typ:</div><div><input type="text" value={this.state.work.date_type} onChange={e=>{let nWork = this.state.work;nWork.date_type = e.target.value;this.setState({work:nWork})}} /></div>
                <div>Abweichender Autorenname
                (z.B. bei <aut>Vita</aut>):</div><div><input type="text" value={this.state.work.author_display} onChange={e=>{let nWork = this.state.work;nWork.author_display = e.target.value;this.setState({work:nWork})}} /></div>
                <div>verknpft. Autor:</div><div><SelectMenu style={{width: "86%"}} options={this.state.authorLst} value={this.state.work.author_id} onChange={e=>{let nWork = this.state.work;nWork.author_id = e.target.value;this.setState({work:nWork})}} /></div>
                <div>Stellenangabe: <span className="minorTxt">(Bsp.)</span></div><div><input type="text" value={this.state.work.citation} onChange={e=>{let nWork = this.state.work;nWork.citation = e.target.value;this.setState({work:nWork})}} /></div>
                <div>Stellenangabe Bibliographie: <i className="minorTxt">(nur minora)</i></div><div><input type="text" value={this.state.work.bibliography_cit} onChange={e=>{let nWork = this.state.work;nWork.bibliography_cit = e.target.value;this.setState({work:nWork})}} /></div>
                <div>Referenz:</div><div><input type="text" value={this.state.work.reference} onChange={e=>{let nWork = this.state.work;nWork.reference = e.target.value;this.setState({work:nWork})}} /></div>
                <div>in Benutzung:</div><div><SelectMenu style={{width: "86%"}} options={[[0, "Nein"], [1, "Ja"]]} value={this.state.work.in_use} onChange={e=>{let nWork = this.state.work;nWork.in_use = e.target.value;this.setState({work:nWork})}} /></div>
                <div>Kommentar:</div><div><textarea value={this.state.work.txt_info} onChange={e=>{let nWork = this.state.work;nWork.txt_info = e.target.value;this.setState({work:nWork})}} style={{width: "205px", height: "130px"}}></textarea></div>
                <div>Bibliographie:</div><div><textarea value={this.state.work.bibliography} onChange={e=>{let nWork = this.state.work;nWork.bibliography = e.target.value;this.setState({work:nWork})}} style={{width: "205px", height: "130px"}}></textarea></div>
                <div></div><div>
                    <input type="button" value="speichern" onClick={async ()=>{
                    this.props.status("saving");
                    await arachne.work.save(this.state.work);
                    this.props.status("saved");
                    this.props.onUpdate();
                }} />
                <input type="button" value="löschen" style={{marginLeft: "10px"}} onClick={async ()=>{
                    const worksDict = await arachne.work.search([{c: "author_id", o: "=", v: this.state.work.author_id}], {count: true});
                    const works = worksDict[0].count;
                    if(works<2){
                        alert("Das Werk kann nicht gelöscht werden, da es das lezte Werk des Autors ist. Um dieses Werk zu löschen, müssen Sie ein neues Werk erstellen und dem Autor zuweisen.");
                    } else if(window.confirm("Soll das Werk wirklich gelöscht werden? Dieser Schritt kann nicht mehr rückgängig gemacht werden!")){
                        this.props.status("deleting");
                        await arachne.work.delete(this.state.work.id);
                        this.props.status("deleted");
                        this.props.onUpdate();
                    }
                }} />
                </div>
            </div>}
        </div>;
    }
    componentDidMount(){
        const loadOptions = async () => {
            const authors = await arachne.author.getAll({select: ["id", "abbr"], order: ["abbr_sort"]});
            let newAuthorLst = [];
            for(const author of authors){
                newAuthorLst.push([author.id, author.abbr]);
            }
            this.setState({authorLst: newAuthorLst});
        }
        loadOptions();
        if(this.props.item.author_id>0){
            const getAuthor = async () => {
                const newAuthor = await arachne.author.get({id: this.props.item.author_id});
                this.setState({author: newAuthor[0]});
            }
            getAuthor();
        }
        if(this.props.item.work_id>0){
            const getWork = async () => {
                const newWork = await arachne.work.get({id: this.props.item.work_id});
                this.setState({work: newWork[0]});
            }
            getWork();
        }
    }
    componentDidUpdate(prevProps){
        if(prevProps.item.author_id!=this.props.item.author_id){
            if(this.props.item.author_id>0){
                const getAuthor = async () => {
                    const newAuthor = await arachne.author.get({id: this.props.item.author_id});
                    this.setState({author: newAuthor[0]});
                }
                getAuthor();
            }else{this.setState({author: null})}
        }
        if(prevProps.item.work_id!=this.props.item.work_id){
            if(this.props.item.work_id>0){
                const getWork = async () => {
                    const newWork = await arachne.work.get({id: this.props.item.work_id});
                    this.setState({work: newWork[0]});
                }
                getWork();
            }else{this.setState({work: null})}
        }
    }
}
class OperaBox extends React.Component{
    constructor(props){
        super(props);
        this.state = {oLst: [], cTrLst: []};
        this.resultsOnPage = 18;
        this.modeName = "opera"
    }
    render(){
        let trLst = [];
        let tblLst = [];
        let i = 0;
        let j = 0;
        const cHitId = (this.state.hits&&this.state.hits.length>0)?this.state.hits[this.state.hitIndex].id:0;
        this.scrollRef = null;
        for(const cTr of this.state.cTrLst){
            i++;
            let hitStyle = {};
            if(cTr.o.id===cHitId){hitStyle = "searchHit"; this.scrollRef = React.createRef()}
            else if(cHitId>0&&this.state.hits.some(i=>i.id===cTr.o.id)){hitStyle = "searchAllHits"}
            trLst.push(<tr className={hitStyle} ref={cTr.o.id===cHitId?this.scrollRef:null} key={i} onDoubleClick={e=>{e.stopPropagation();this.props.showDetail(cTr.o)}}>{cTr.data}</tr>);
            if(trLst.length >= this.resultsOnPage){
                j++;
                tblLst.push(<div key={j} id={"operaBox_"+j} style={{borderBottom: "1px dotted black", paddingBottom: "15px", margin: "10px"}}><table><tbody>{trLst}</tbody></table><div style={{textAlign: "center"}}>{j}</div></div>);
                trLst = [];
            }
        }
        if(j>0){tblLst.push(<div key={j+1} id={"operaBox_"+(j+1)} style={{margin: "10px"}}><table><tbody>{trLst}</tbody></table><div style={{textAlign: "center"}}>{j+1}</div></div>);}
        return <div style={{gridArea: this.props.gridArea}}>
                {tblLst.length===0?null:
                <div className="operaBox">{tblLst}</div>}
                <div className="SearchBar mainColors">
                    <input type="text" style={{boxShadow: "none", padding: "0px"}} placeholder="Suche nach Zitiertitel..." onKeyUp={async e=>{
                    if(e.keyCode === 13){
                        if(e.target.value!=""&&this.state.cSearch!=e.target.value){
                            const hits = await arachne[this.props.listName].search([{c: "search", o: "=", v: `*${e.target.value}*`}], {select: ["id"]});
                            if(hits.length>0){
                                this.setState({hitIndex: 0, cSearch: e.target.value, maxHits: hits.length, hits: hits});
                            } else {
                                this.setState({cSearch: e.target.value, maxHits: 0, hits: []});
                            }
                        } else if(this.state.maxHits>0){this.gotoSearchResult(1)}
                    }
                }} />
                {this.state.maxHits>0&&<div style={{display:"inline", marginLeft: "20px"}}>
                    <FontAwesomeIcon icon={faBackward} style={{fontSize: "14px"}} onClick={()=>{this.gotoSearchResult(-1)}} /> <span>{this.state.hitIndex+1}</span>/<span>{this.state.maxHits}</span> <FontAwesomeIcon icon={faForward} style={{fontSize: "14px"}} onClick={()=>{this.gotoSearchResult(1)}} />
                </div>}
                <div style={{float: "right"}}>
                <input type="text"  style={{textAlign: "right", width: "60px", boxShadow: "none", padding: "0px"}} placeholder="Seite..." onKeyUp={e=>{
                    if(e.keyCode===13){
                        const box = document.querySelector("div#operaBox_"+e.target.value);
                        if(box){box.scrollIntoView({behavior: "smooth"});}   
                    }
                }} />
                </div>
                
                </div>
            </div>;
    }
    createOperaLists(oLst, listName){
        let trLst = [];
        let i = 0;
        for(const o of oLst){
            let editionLst = [];
            if(o.editions_id){
                const editionsId = JSON.parse(o.editions_id);
                const editionsURL = JSON.parse(o.editions_url);
                const editionsLabel = JSON.parse(o.editions_label);
                for(let iE = 0; iE < editionsId.length; iE++){
                    let cURL = "/site/viewer/"+editionsId[iE];
                    let arrow = "";
                    if(editionsURL&&editionsURL[iE]!=""){
                        cURL=editionsURL[iE];
                        arrow = <span> <FontAwesomeIcon style={{fontSize:"14px"}} icon={faExternalLinkAlt} /></span>
                    }
                    let cLabel = "FEHLER!";
                    if(editionsLabel){cLabel=editionsLabel[iE]}
                    editionLst.push(<li key={iE}><a href={cURL} target="_blank" rel="noreferrer">{cLabel}{arrow}</a></li>);
                }
            }
            i++;
            if(listName=="opera_maiora"){
                let abbr = `<aut>${o.abbr}</aut>`;
                let full = o.full;
                if(o.work_id>0&&o.author_id===null){
                    abbr= `<span>&nbsp;&nbsp;&nbsp;${o.abbr}</span>`;
                    full = `<span>&nbsp;&nbsp;&nbsp;${o.full}</span>`;
                }
                trLst.push({o: o, data: [
                <td key="0" className="c1" dangerouslySetInnerHTML={parseHTML(o.date_display)}></td>,
                <td key="1" className="c2" dangerouslySetInnerHTML={parseHTML(abbr)}></td>,
                <td key="2" className="c3" dangerouslySetInnerHTML={parseHTML(full)}></td>,
                <td key="3" className="c4">{o.bibliography}<ul className="noneLst">{editionLst}</ul></td>,
                <td key="4" className="c5" dangerouslySetInnerHTML={parseHTML(o.comment)}></td>
            ]});
            } else if(listName==="opera_minora"){
                trLst.push({o: o, data: [
                <td key="0" className="c1_min" dangerouslySetInnerHTML={parseHTML(o.date_display)}></td>,
                <td key="1" className="c2_min" dangerouslySetInnerHTML={parseHTML(o.citation)}></td>,
                <td key="2" className="c5_min"><span dangerouslySetInnerHTML={parseHTML(o.bibliography)}></span><ul className="noneLst">{editionLst}</ul></td>
            ]});
            }
        }
        return trLst;
    }
    gotoSearchResult(move){
        if(move===1&&this.state.hitIndex<this.state.maxHits-1){
            this.setState({hitIndex: this.state.hitIndex+1});
        } else if (move===1){
            this.setState({hitIndex: 0});
        } else if (move===-1&&this.state.hitIndex>0){
            this.setState({hitIndex: this.state.hitIndex-1});
        } else if (move===-1){
            this.setState({hitIndex: this.state.maxHits-1});
        }
    }
    async loadPage(newPage){
        /*
        const oLst = await arachne[this.props.listName].getAll({limit: this.resultsOnPage, offset: (newPage-1)*this.resultsOnPage});
        this.setState({oLst: oLst, currentPage: newPage});
        */
    }
    componentDidMount(){
        const getLst = async () =>{
            const oMax = await arachne[this.props.listName].getAll({count: true});
            const oLst = await arachne[this.props.listName].getAll();
            const trLst = this.createOperaLists(oLst, this.props.listName);
            this.setState({listName: this.props.listName, cTrLst: trLst, oMax: Math.floor(oMax[0]["count"]/this.resultsOnPage)+1, currentPage: 1});
        };
        getLst();
    }
    componentDidUpdate(prevProps){
        if(this.props.listName!=prevProps.listName){
            const getLst = async () =>{
                const oMax = await arachne[this.props.listName].getAll({count: true});
                const oLst = await arachne[this.props.listName].getAll();
                const trLst = this.createOperaLists(oLst, this.props.listName);
                this.setState({cTrLst: trLst, listName: this.props.listName, oMax: Math.floor(oMax[0]["count"]/this.resultsOnPage)+1, currentPage: 1});
            };
            this.setState({cTrLst: []});
            getLst();
        }
        if(this.scrollRef){this.scrollRef.current.scrollIntoView({behavior: "smooth", block: "center"})}
    }
}
class Opera extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            selectionDetail: null
        }
    }
    render(){
        return (
            <div style={{padding: "0 10px", display: "grid", gridTemplateColumns: "auto 420px", gridTemplateRows: "auto", rowGap: "15px"}}>
                <OperaBox
                    listName={this.props.listName}
                    loadPage={move => {this.loadPage(move)}}
                    currentElements={this.state.currentElements}
                    count={this.state.count}
                    currentPage={this.state.currentPage}
                    pageMax={this.state.pageMax}
                    gridArea={(this.state.selectionDetail)?"2/1/2/2":"2/1/2/3"}
                    showDetail={item => {
                        this.setState({item: item});
                    }}
                />
                {this.state.item?<OperaAside status={this.props.status}  item={this.state.item} onUpdate={()=>{this.setState({item: null})}} onClose={()=>{this.setState({item: null})}} />:null}

                {arachne.access("o_edit")&&<div style={{position: "fixed", bottom: "40px", right: "15px", fontSize: "30px"}}><FontAwesomeIcon id="mainAddButton" icon={faPlusCircle} onClick={async ()=>{
                if(window.confirm("Soll ein neues Werk erstellt werden? (Das Werk wird ABBO FLOR. zugewiesen.")){
                    this.props.status("saving");
                    const newId = await arachne.work.save({full:"Neues Werk", abbr:"Neues Werk", abbr_sort: "Neues Werk", author_id: 1, is_maior: 1, in_use: 1});
                    this.props.status("saved", "Neues Werk erstellt.");
                } else if(window.confirm("Soll ein neuer Autor erstellt werden? Er heisst '+NEUER AUTOR'")){
                    this.props.status("saving");
                    const newId = await arachne.author.save({full:"+Neuer Autor", abbr:"+Neuer Autor", abbr_sort: "+Neuer Autor", in_use: 1});
                    await arachne.work.save({full:"Neues Werk", abbr:"Neues Werk", abbr_sort: "Neues Werk", author_id: newId, is_maior: 1, in_use: 1});
                    this.props.status("saved", "Neuer Autor erstellt.");
                }
            }} /></div>}
            </div>
            );
    }
}

export { Opera };