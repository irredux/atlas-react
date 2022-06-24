import { Form, Navbar, Container, Offcanvas, Placeholder, Button } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { faExternalLinkAlt, faForward, faBackward } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./../arachne.js";
import { parseHTML, SelectMenu, ToolKit, StatusButton, sleep } from "./../elements.js";

class OperaAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {author: null, work: null, authorLst: []};
    }
    render(){
        return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={()=>{this.props.onClose()}}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title></Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {this.state.author&&<div style={{
                    display: "grid",
                    gridTemplateColumns: "150px auto",
                    rowGap: "10px",
                    margin: "0"
                }}>
                    <h3>Autor <i style={{fontSize: "60%"}}>ID: {this.state.author.id})</i></h3><div></div>
                    <div>Name:</div><div><input type="text" value={this.state.author.full?this.state.author.full.replace(/&lt;/g, "<").replace(/&gt;/g,">"):""} onChange={e=>{let nAuthor = this.state.author;nAuthor.full = e.target.value;this.setState({author:nAuthor})}} /></div>
                    <div>Abkürzung:</div><div><input type="text" value={this.state.author.abbr} onChange={e=>{let nAuthor = this.state.author;nAuthor.abbr = e.target.value;this.setState({author:nAuthor})}} /></div>
                    <div>Abkürzung (Sortierung):</div><div><input type="text" value={this.state.author.abbr_sort} onChange={e=>{let nAuthor = this.state.author;nAuthor.abbr_sort = e.target.value;this.setState({author:nAuthor})}} /></div>
                    <div>Anzeigedatum:</div><div><input type="text" value={this.state.author.date_display} onChange={e=>{let nAuthor = this.state.author;nAuthor.date_display = e.target.value;this.setState({author:nAuthor})}} /></div>
                    <div>Sortierdatum:</div><div><input type="text" value={this.state.author.date_sort} onChange={e=>{let nAuthor = this.state.author;nAuthor.date_sort = e.target.value;this.setState({author:nAuthor})}} /></div>
                    <div>Sortierdatum-Typ:</div><div><input type="text" value={this.state.author.date_type} onChange={e=>{let nAuthor = this.state.author;nAuthor.date_type = e.target.value;this.setState({author:nAuthor})}} /></div>
                    <div>in Benutzung:</div><div><SelectMenu style={{width: "86%"}} options={[[0, "Nein"], [1, "Ja"]]} value={this.state.author.in_use} onChange={e=>{let nAuthor = this.state.author;nAuthor.in_use = e.target.value;this.setState({author:nAuthor})}} /></div>
                    <div></div><div>
                        <StatusButton value="speichern" onClick={async ()=>{
                        await arachne.author.save(this.state.author);
                        this.props.onUpdate();
                        return {status: true};
                    }} />
                        <StatusButton value="löschen" variant="danger" style={{marginLeft: "10px"}} onClick={async ()=>{
                            const works = await arachne.work.search([{c: "author_id", o: "=", v: this.state.author.id}], {select: ["id"]});
                            let workLst = [];
                            for(const work of works){
                                workLst.push(work.id);
                            }
                            if(window.confirm(`Soll der Autor wirklich gelöscht werden? ${workLst.length>1?workLst.length+" verknüpfte Werke werden":"Ein verknüpftes Werk wird"} ebenfalls gelöscht. Dieser Schritt kann nicht mehr rückgängig gemacht werden!`)){
                                if(workLst.length>0){await arachne.work.delete(workLst)};
                                await arachne.author.delete(this.state.author.id);
                                await arachne.exec("opera_update");
                                this.props.onReload();
                                return {status: true};
                            } else{return {status: 0};}
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
                    <div>verknpft. Autor:</div><div><SelectMenu style={{width: "86%"}} options={this.state.authorLst} value={this.state.work.author_id} onChange={e=>{let nWork = this.state.work;nWork.author_id = e.target.value;this.setState({work:nWork})}} /></div>
                    <div>Stellenangabe: <span className="minorTxt">(Bsp.)</span></div><div><input type="text" value={this.state.work.citation} onChange={e=>{let nWork = this.state.work;nWork.citation = e.target.value;this.setState({work:nWork})}} /></div>
                    <div>Stellenangabe Bibliographie: <i className="minorTxt">(nur minora)</i></div><div><input type="text" value={this.state.work.bibliography_cit} onChange={e=>{let nWork = this.state.work;nWork.bibliography_cit = e.target.value;this.setState({work:nWork})}} /></div>
                    <div>Referenz:</div><div><input type="text" value={this.state.work.reference} onChange={e=>{let nWork = this.state.work;nWork.reference = e.target.value;this.setState({work:nWork})}} /></div>
                    <div>in Benutzung:</div><div><SelectMenu style={{width: "86%"}} options={[[0, "Nein"], [1, "Ja"]]} value={this.state.work.in_use} onChange={e=>{let nWork = this.state.work;nWork.in_use = e.target.value;this.setState({work:nWork})}} /></div>
                    <div><i>opus maius</i>:</div><div><SelectMenu style={{width: "86%"}} options={[[0, "Nein"], [1, "Ja"]]} value={this.state.work.is_maior} onChange={e=>{let nWork = this.state.work;nWork.is_maior = e.target.value;this.setState({work:nWork})}} /></div>
                    <div>Kommentar:</div><div><textarea value={this.state.work.txt_info} onChange={e=>{let nWork = this.state.work;nWork.txt_info = e.target.value;this.setState({work:nWork})}} style={{width: "205px", height: "130px"}}></textarea></div>
                    <div>Bibliographie:</div><div><textarea value={this.state.work.bibliography} onChange={e=>{let nWork = this.state.work;nWork.bibliography = e.target.value;this.setState({work:nWork})}} style={{width: "205px", height: "130px"}}></textarea></div>
                    <div></div><div>
                        <StatusButton value="speichern" onClick={async ()=>{
                        await arachne.work.save(this.state.work);
                        this.props.onUpdate();
                        return {status: true};
                    }} />
                    <StatusButton value="löschen" variant="danger" style={{marginLeft: "10px"}} onClick={async ()=>{
                        const worksDict = await arachne.work.search([{c: "author_id", o: "=", v: this.state.work.author_id}], {count: true});
                        const works = worksDict[0].count;
                        if(works<2){
                            return {status: -1, error: "Das Werk kann nicht gelöscht werden, da es das lezte Werk des Autors ist."};
                        } else if(window.confirm("Soll das Werk wirklich gelöscht werden? Dieser Schritt kann nicht mehr rückgängig gemacht werden!")){
                            await arachne.work.delete(this.state.work.id);
                            await arachne.exec("opera_update");
                            this.props.onReload();
                            return {status: true};
                        }else{return {status: 0};}
                    }} />
                    </div>
                </div>}
        </Offcanvas.Body></Offcanvas>;
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
        this.state = {oLst: [], cHitId: 0};
        this.resultsOnPage = 18;
    }
    render(){
        let trLst = [];
        let tblLst = [];
        let i = 0;
        let j = 0;
        this.scrollRef = null;
        for(const cTr of this.props.cTrLst){
            i++;
            let hitStyle = {};
            if(cTr.o.id===this.state.cHitId){hitStyle = "searchHit"; this.scrollRef = React.createRef()}
            else if(this.state.cHitId>0&&this.state.hits.some(i=>i.id===cTr.o.id)){hitStyle = "searchAllHits"}
            trLst.push(<tr className={hitStyle} ref={cTr.o.id===this.state.cHitId?this.scrollRef:null} key={i} onDoubleClick={e=>{e.stopPropagation();this.props.showDetail(cTr.o)}}>{cTr.data}</tr>);
            if(trLst.length >= this.resultsOnPage){
                j++;
                tblLst.push(<div key={j} id={"operaBox_"+j} style={{borderBottom: "1px dotted black", paddingBottom: "15px", margin: "10px"}}><table className="operaBox"><tbody>{trLst}</tbody></table><div style={{textAlign: "center"}}>{j}</div></div>);
                trLst = [];
            }
        }
        if(j>0){tblLst.push(<div key={j+1} id={"operaBox_"+(j+1)} style={{margin: "10px"}}><table className="operaBox"><tbody>{trLst}</tbody></table><div style={{textAlign: "center"}}>{j+1}</div></div>);}
        let placeholderTable = <table className="operaBox" style={{width:"100%"}}>
            <tbody>
                <tr>
                    <td className="c1"></td>
                    <td className="c2"><Placeholder sm={10} /></td>
                    <td className="c3"><Placeholder sm={10} /></td>
                    <td className="c4"></td>
                    <td className="c5"></td>
                </tr>
                <tr>
                    <td className="c1"><Placeholder sm={10} /></td>
                    <td className="c2">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c3">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c4"><Placeholder sm={10} />
                    <Placeholder sm={8} /> <Placeholder bg="primary" sm={4} /></td>
                    <td className="c5"><Placeholder sm={5} /></td>
                </tr>
                <tr>
                    <td className="c1"></td>
                    <td className="c2"><Placeholder sm={10} /></td>
                    <td className="c3"><Placeholder sm={10} /></td>
                    <td className="c4"></td>
                    <td className="c5"></td>
                </tr>
                <tr>
                    <td className="c1"><Placeholder sm={10} /></td>
                    <td className="c2">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c3">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c4"><Placeholder sm={10} /> <Placeholder sm={10} />
                    <Placeholder sm={8} /> <Placeholder bg="primary" sm={6} /></td>
                    <td className="c5"><Placeholder sm={6} /></td>
                </tr>
                <tr>
                    <td className="c1"></td>
                    <td className="c2"><Placeholder sm={10} /></td>
                    <td className="c3"><Placeholder sm={10} /><Placeholder sm={8} /></td>
                    <td className="c4"></td>
                    <td className="c5"></td>
                </tr>
                <tr>
                    <td className="c1"><Placeholder sm={10} /></td>
                    <td className="c2">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c3">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c4"><Placeholder sm={11} /> <Placeholder sm={10} /> <Placeholder sm={8} />
                    <Placeholder sm={8} /><Placeholder sm={10} /> <Placeholder sm={9} /> <Placeholder sm={10} />
                    <Placeholder sm={8} /> <Placeholder bg="primary" sm={6} /></td>
                    <td className="c5"><Placeholder sm={8} /></td>
                </tr>
                <tr>
                    <td className="c1"></td>
                    <td className="c2"><Placeholder sm={10} /></td>
                    <td className="c3"><Placeholder sm={10} /></td>
                    <td className="c4"></td>
                    <td className="c5"></td>
                </tr>
                <tr>
                    <td className="c1"><Placeholder sm={10} /></td>
                    <td className="c2">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c3">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c4"><Placeholder sm={11} />
                    <Placeholder sm={9} /> <Placeholder bg="primary" sm={8} /></td>
                    <td className="c5"><Placeholder sm={5} /></td>
                </tr>
                <tr>
                    <td className="c1"></td>
                    <td className="c2"><Placeholder sm={10} /></td>
                    <td className="c3"><Placeholder sm={10} /></td>
                    <td className="c4"></td>
                    <td className="c5"></td>
                </tr>
                <tr>
                    <td className="c1"><Placeholder sm={10} /></td>
                    <td className="c2">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c3">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c4"><Placeholder sm={9} /> <Placeholder sm={11} /> <Placeholder sm={8} /> <Placeholder bg="primary" sm={4} /></td>
                    <td className="c5"><Placeholder sm={5} /></td>
                </tr>
                <tr>
                    <td className="c1"><Placeholder sm={10} /></td>
                    <td className="c2">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c3">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c4"><Placeholder sm={10} /> <Placeholder sm={10} /> <Placeholder sm={10} />
                    <Placeholder sm={8} /> <Placeholder bg="primary" sm={4} /></td>
                    <td className="c5"><Placeholder sm={4} /></td>
                </tr>
                <tr>
                    <td className="c1"><Placeholder sm={10} /></td>
                    <td className="c2">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c3">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c4"><Placeholder sm={8} /> <Placeholder sm={11} /> <Placeholder sm={10} />
                    <Placeholder sm={9} /> <Placeholder bg="primary" sm={8} /></td>
                    <td className="c5"><Placeholder sm={7} /></td>
                </tr>
            </tbody>
        </table>;
        if(this.props.listName==="opera_minora"){
            placeholderTable = <table className="operaBox" style={{width:"100%"}}>
            <tbody>
                <tr>
                    <td className="c1_min"><Placeholder sm={8} /></td>
                    <td className="c2_min"><Placeholder sm={10} /></td>
                    <td className="c5_min"><Placeholder bg="primary" sm={4} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={8} /></td>
                    <td className="c2_min"><Placeholder sm={11} /></td>
                    <td className="c5_min"><Placeholder sm={4} /><br /><Placeholder sm={2} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={7} /></td>
                    <td className="c2_min"><Placeholder sm={8} /></td>
                    <td className="c5_min"></td>
                </tr>
                <tr>
                    <td className="c1_min"></td>
                    <td className="c2_min"><Placeholder sm={11} /></td>
                    <td className="c5_min"><Placeholder sm={5} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={5} /></td>
                    <td className="c2_min"><Placeholder sm={7} /></td>
                    <td className="c5_min"><Placeholder sm={4} /></td>
                </tr>
                <tr>
                    <td className="c1_min"></td>
                    <td className="c2_min"><Placeholder sm={8} /></td>
                    <td className="c5_min"><Placeholder sm={4} /></td>
                </tr>
                <tr>
                    <td className="c1_min"></td>
                    <td className="c2_min"><Placeholder sm={8} /></td>
                    <td className="c5_min"><Placeholder sm={6} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={8} /></td>
                    <td className="c2_min"><Placeholder sm={10} /></td>
                    <td className="c5_min"></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={8} /></td>
                    <td className="c2_min"><Placeholder sm={7} /></td>
                    <td className="c5_min"><Placeholder sm={5} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={8} /></td>
                    <td className="c2_min"><Placeholder sm={11} /></td>
                    <td className="c5_min"><Placeholder sm={6} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={8} /></td>
                    <td className="c2_min"><Placeholder sm={10} /></td>
                    <td className="c5_min"><Placeholder sm={3} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={8} /></td>
                    <td className="c2_min"><Placeholder sm={10} /></td>
                    <td className="c5_min"><Placeholder sm={3} bg="primary" /></td>
                </tr>
                <tr>
                    <td className="c1_min"></td>
                    <td className="c2_min"><Placeholder sm={11} /></td>
                    <td className="c5_min"><Placeholder sm={8} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={2} /></td>
                    <td className="c2_min"><Placeholder sm={6} /></td>
                    <td className="c5_min"></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={7} /></td>
                    <td className="c2_min"><Placeholder sm={7} /></td>
                    <td className="c5_min"><Placeholder sm={5} bg="primary" /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={8} /></td>
                    <td className="c2_min"><Placeholder sm={10} /></td>
                    <td className="c5_min"><Placeholder sm={4} bg="primary" /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={8} /></td>
                    <td className="c2_min"><Placeholder sm={8} /></td>
                    <td className="c5_min"><Placeholder sm={5} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={2} /></td>
                    <td className="c2_min"><Placeholder sm={7} /></td>
                    <td className="c5_min"><Placeholder sm={6} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={4} /></td>
                    <td className="c2_min"><Placeholder sm={9} /></td>
                    <td className="c5_min"><Placeholder sm={5} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={8} /></td>
                    <td className="c2_min"><Placeholder sm={10} /></td>
                    <td className="c5_min"><Placeholder sm={3} /></td>
                </tr>
                <tr>
                    <td className="c1_min"></td>
                    <td className="c2_min"><Placeholder sm={11} /></td>
                    <td className="c5_min"><Placeholder sm={11} /></td>
                </tr>
                <tr>
                    <td className="c1_min"></td>
                    <td className="c2_min"><Placeholder sm={8} /></td>
                    <td className="c5_min"><Placeholder sm={5} /></td>
                </tr>
                <tr>
                    <td className="c1_min"></td>
                    <td className="c2_min"><Placeholder sm={10} /></td>
                    <td className="c5_min"><Placeholder sm={4} /></td>
                </tr>
                <tr>
                    <td className="c1_min"><Placeholder sm={4} /></td>
                    <td className="c2_min"><Placeholder sm={7} /></td>
                    <td className="c5_min"><Placeholder sm={3} /></td>
                </tr>
            </tbody>
        </table>;
        } else if(this.props.listName==="tll_index"){
            placeholderTable = <table className="operaBox" style={{width:"100%"}}>
            <tbody>
                <tr>
                    <td className="c1_tll"><Placeholder sm={10} /></td>
                    <td className="c2_tll"><Placeholder sm={10} /></td>
                    <td className="c3_tll"></td>
                    <td className="c4_tll"><Placeholder sm={10} /></td>
                    <td className="c5_tll"></td>
                </tr>
                <tr>
                    <td className="c1_tll">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c2_tll">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c3_tll"></td>
                    <td className="c4_tll">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /><br />&nbsp;&nbsp;&nbsp;
                    <Placeholder sm={8} /></td>
                    <td className="c5_tll">&nbsp;&nbsp;&nbsp;<Placeholder sm={9} /><br />&nbsp;&nbsp;&nbsp;<Placeholder sm={3} /></td>
                </tr>
                <tr>
                    <td className="c1_tll">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c2_tll">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /></td>
                    <td className="c3_tll"></td>
                    <td className="c4_tll">&nbsp;&nbsp;&nbsp;<Placeholder sm={10} /><br />&nbsp;&nbsp;&nbsp;
                    <Placeholder sm={8} /></td>
                    <td className="c5_tll"></td>
                </tr>
            </tbody>
        </table>;
        }
        let toolKitMenu = [
            ["opera-Listen aktualisieren", async ()=>{  
                if(window.confirm("Soll die opera-Liste aktualisiert werden? Der Prozess dauert ca. 30 Sekunden.")){
                    await arachne.exec("opera_update");
                    await this.props.getLst();
                }
            }]
        ];
        if(arachne.access("o_edit")){
            toolKitMenu.push(["Neuer Autor erstellen", async ()=>{
                if(window.confirm("Soll ein neuer Autor erstellt werden? Er heisst '+NEUER AUTOR'")){
                    const newId = await arachne.author.save({full:"+Neuer Autor", abbr:"+Neuer Autor", abbr_sort: "+Neuer Autor", in_use: 1});
                    await arachne.work.save({full:"Neues Werk", abbr:"Neues Werk", abbr_sort: "Neues Werk", author_id: newId, is_maior: 1, in_use: 1});
                    if(window.confirm("Ein neuer Autor wurde erstellt. Soll die opera-Liste aktualisiert werden?")){
                        await arachne.exec("opera_update");
                        await this.props.getLst();

                    }
                }
            }]);
            toolKitMenu.push(["Neues Werk erstellen", async ()=>{
                if(window.confirm("Soll ein neues Werk erstellt werden? Das Werk wird ABBO FLOR. zugewiesen.")){
                    const newId = await arachne.work.save({full:"Neues Werk", abbr:"Neues Werk", abbr_sort: "Neues Werk", author_id: 1, is_maior: 1, in_use: 1});
                    if(window.confirm("Ein neues Werk wurde erstellt. Soll die opera-Liste aktualisiert werden?")){
                        await arachne.exec("opera_update");
                        await this.props.getLst();
                    }
                }
            }]);
        }
        return <>
            {tblLst.length===0?null:<Navbar fixed="bottom" bg="light">
                <Container fluid>
                <Navbar.Collapse className="justify-content-start">
                    <OperaSearchBox listName={this.props.listName} setHitIndex={hitIndex=>{this.setState({cHitId: hitIndex})}} setHits={hits=>{this.setState({hits: hits})}} />
                </Navbar.Collapse>
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                        <Form.Control type="text"  style={{textAlign: "right", width: "80px", padding: "2px 5px", marginRight: "20px"}} accessKey="p" placeholder="Seite..." onKeyUp={e=>{
                            if(e.keyCode===13){
                                const box = document.querySelector("div#operaBox_"+e.target.value);
                                if(box){box.scrollIntoView({behavior: "smooth"});}   
                            }
                        }} />
                    </Navbar.Text>
                    <Navbar.Text>
                        <ToolKit menuItems={toolKitMenu} />
                    </Navbar.Text>
                </Navbar.Collapse>
                </Container>
            </Navbar>}
            <div style={{gridArea: this.props.gridArea}}>
                {tblLst.length===0?
                    <div>
                        <Placeholder animation="glow">
                            {placeholderTable}
                        </Placeholder>
                    </div>
                :<div className={"operaBox_"+this.props.listName}>{tblLst}</div>}
            </div>
        </>;
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
    componentDidUpdate(prevProps, prevState){
        if(this.state.hits&&this.state.hits.length>0){
            if(prevState.hitIndex!=this.state.hitIndex){ this.setState({cHitId: this.state.hits[this.state.hitIndex].id}) }
        } else if(this.state.cHitId!=0){this.setState({cHitId: 0})}
        if(this.scrollRef){this.scrollRef.current.scrollIntoView({behavior: "smooth", block: "center"})}
    }
}
function OperaSearchBox(props){
    const [hits, setHits] = useState([]);
    const [hitIndex, setHitIndex] = useState(0);
    const [query, setQuery] = useState("");
    useEffect(()=>{
        if(hits.length>0){props.setHitIndex(hits[hitIndex].id)}
    }, [hits, hitIndex]);
    useEffect(()=>{props.setHits(hits)}, [hits]);

    const gotoNextResult = step => {
        if(step===1){
            if(hitIndex+1===hits.length){setHitIndex(0)}
            else{setHitIndex(hitIndex+1)}
        } else if (step===-1){
            if(hitIndex===0){setHitIndex(hits.length-1)}
            else{setHitIndex(hitIndex-1)}
        } else if (step===0){
            const el = document.querySelector(".searchHit");
            el.scrollIntoView({behavior: "smooth", block: "center"});
        }
        
    };
    return <>
    <Navbar.Text>
        <Form.Control type="text" style={{padding: "2px 5px"}} accessKey="s" placeholder="Suche nach Zitiertitel..." onKeyUp={async e=>{
            if(e.keyCode === 13){
                if(e.target.value===""){//reset search
                    setHits([]);
                } else if(e.target.value!=query){// new search
                    const nHits = await arachne[props.listName].search([{c: "search", o: "=", v: `*${e.target.value}*`}], {select: ["id"]});
                    if(nHits.length>0){
                        setQuery(e.target.value);
                        setHitIndex(0);
                        setHits(nHits);
                    }else{
                        setHits([]);
                    }
                } else {// goto next result
                    gotoNextResult(1);
                }
            }
        }} />
    </Navbar.Text>
    {hits.length>0&&<Navbar.Text>
        <div style={{display:"flex", marginLeft: "20px", border: "1px solid var(--bs-gray-200)"}}>
            <Button size="sm" variant="outline-dark" style={{borderRadius: "0.2rem 0 0 0.2rem"}} onClick={()=>{gotoNextResult(-1)}} disabled={hits.length===1?true:false}><FontAwesomeIcon icon={faBackward} style={{fontSize: "14px"}} /></Button>
            <div style={{borderBottom: "1px solid var(--bs-gray-600)", borderTop: "1px solid var(--bs-gray-600)", padding: "5px 15px", margin: "0", cursor: "pointer"}} onClick={()=>{gotoNextResult(0)}}>{hitIndex+1} / {hits.length}</div>
            <Button size="sm" variant="outline-dark"  style={{borderRadius: "0 0.2rem 0.2rem 0"}} onClick={()=>{gotoNextResult(1)}} disabled={hits.length===1?true:false}><FontAwesomeIcon icon={faForward} style={{fontSize: "12px"}} /></Button>
        </div>
    </Navbar.Text>}
</>;
}
class Opera extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            selectionDetail: null,
            cTrLst: [],
        }
    }
    render(){
        return <>
            <Container className="mainBody">
                <OperaBox
                    getLst={async ()=>{this.getLst()}}
                    cTrLst={this.state.cTrLst}
                    listName={this.props.listName}
                    currentElements={this.state.currentElements}
                    count={this.state.count}
                    currentPage={this.state.currentPage}
                    pageMax={this.state.pageMax}
                    gridArea={(this.state.selectionDetail)?"2/1/2/2":"2/1/2/3"}
                    showDetail={item => {
                        this.setState({item: item});
                    }}
                />
            </Container>
            {arachne.access("o_edit")&&this.state.item?<OperaAside item={this.state.item} onUpdate={()=>{this.setState({item: null})}} onClose={()=>{this.setState({item: null})}} onReload={async ()=>{this.setState({item: null});await this.getLst()}} />:null}
        </>;
    }
    componentDidMount(){this.getLst()}
    componentDidUpdate(prevProps){
        if(this.props.listName!=prevProps.listName){this.getLst()}
        if(this.scrollRef){this.scrollRef.current.scrollIntoView({behavior: "smooth", block: "center"})}
    }
    async getLst(){
        this.setState({cTrLst: []});
        const oMax = await arachne[this.props.listName].getAll({count: true});
        const oLst = await arachne[this.props.listName].getAll();
        const trLst = this.createOperaLists(oLst, this.props.listName);
        this.setState({cTrLst: trLst, oMax: Math.floor(oMax[0]["count"]/this.resultsOnPage)+1, currentPage: 1});
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
                    let cURL = "/site/argos/"+editionsId[iE];
                    let arrow = "";
                    if(editionsURL&&editionsURL[iE]!=""){
                        cURL=editionsURL[iE];
                        arrow = <span> <FontAwesomeIcon style={{fontSize:"14px"}} icon={faExternalLinkAlt} /></span>
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
                <td key="3" className="c4"><span dangerouslySetInnerHTML={parseHTML(o.bibliography)}></span><ul className="noneLst">{editionLst}</ul></td>,
                <td key="4" className="c5" dangerouslySetInnerHTML={parseHTML(o.comment)}></td>
            ]});
            } else if(listName==="opera_minora"){
                trLst.push({o: o, data: [
                <td key="0" className="c1_min" dangerouslySetInnerHTML={parseHTML(o.date_display)}></td>,
                <td key="1" className="c2_min" dangerouslySetInnerHTML={parseHTML(o.citation)}></td>,
                <td key="2" className="c5_min"><span dangerouslySetInnerHTML={parseHTML(o.bibliography)}></span><ul className="noneLst">{editionLst}</ul></td>
            ]});
            } else if(listName==="tll_index"){
                let leftPad = null;
                if(o.author_id>0){leftPad = "2rem"}
                trLst.push({o: o, data: [
                   <td key="0" className="c1_tll" style={{paddingLeft: leftPad}} dangerouslySetInnerHTML={parseHTML(o.date_display)}></td>,
                   <td key="1" className="c2_tll" style={{paddingLeft: leftPad}} dangerouslySetInnerHTML={parseHTML(o.abbr)}></td>,
                   <td key="2" className="c3_tll" style={{paddingLeft: leftPad}} dangerouslySetInnerHTML={parseHTML(o.ref)}></td>,
                   <td key="3" className="c4_tll" style={{paddingLeft: leftPad}} dangerouslySetInnerHTML={parseHTML(o.full)}></td>,
                   <td key="4" className="c5_tll" style={{paddingLeft: leftPad}} dangerouslySetInnerHTML={parseHTML(o.bibliography)}></td>,
                ]});
            } else {
                throw new Error("listname unknown!")
            }
        }
        return trLst;
    }
}

export { Opera };