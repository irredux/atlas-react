import { Accordion, Form, Navbar, Container, Offcanvas, Placeholder, Button, Dropdown, Row, Col } from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { faExternalLinkAlt, faForward, faBackward, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./../arachne.js";
import { AutoComplete, parseHTML, SelectMenu, ToolKit, StatusButton, sleep } from "./../elements.js";

function OperaAsideTLL(props){
    const [auctor, setAuctor]=useState(null);
    const [opus, setOpus]=useState(null);
    const [locus, setLocus]=useState(null);

    const [refLst, setRefLst]=useState(null); // tblName, searchCol/ReturnCol
    const [refName, setRefName]=useState(null);

    const [sortAuctorAfterId, setSortAuctorAfterId]=useState(null);
    const [sortAuctorAfterIdInital, setSortAuctorAfterIdInital]=useState(null);
    const [sortOpusAfterValue, setSortOpusAfterValue]=useState(null);
    const [sortOpusAfterId, setSortOpusAfterId]=useState(null);
    const [sortOpusAfterIdInital, setSortOpusAfterIdInital]=useState(null);
    const [sortLocusAfterValue, setSortLocusAfterValue]=useState(null);
    const [sortLocusAfterId, setSortLocusAfterId]=useState(null);
    const [sortLocusAfterIdInital, setSortLocusAfterIdInital]=useState(null);

    const [sameLinePossibleOpus, setSameLinePossibleOpus]=useState(false);
    const [sameLinePossibleLocus, setSameLinePossibleLocus]=useState(false);

    const [auctoresSelect, setAuctoresSelect]=useState([]);
    const [operaSelect, setOperaSelect]=useState([]);
    useEffect(()=>{
        const fetchSelectLst=async()=>{
            if(props.item.auctor_id||props.item.opus_id){
                const newAuctoresLst = await arachne.auctores.getAll({select: ["id", "auctor"], order: ["sort_nr"]});
                setAuctoresSelect(newAuctoresLst.map(a=>[a.id, a.auctor]));
            }
            if(props.item.opus_id||props.item.locus_id){
                const newOperaLst = await arachne.opera.get({id: props.item.opus_id}, {select: ["id", "opus"]});
                setOperaSelect(newOperaLst.map(o=>[o.id, o.opus]));
            }
        }
        const fetchAuctor=async()=>{
            const newAuctor = await arachne.auctores.get({id: props.item.auctor_id});
            setAuctor(newAuctor[0]);
            const auctorAbove = await arachne.auctores.search([{c: "sort_nr", o: "=", v: newAuctor[0].sort_nr-1}], {select: ["id"]});
            if(auctorAbove.length>0){
                setSortAuctorAfterId(auctorAbove[0].id);
                setSortAuctorAfterIdInital(auctorAbove[0].id);
            }else{
                setSortAuctorAfterId(null);
                setSortAuctorAfterIdInital(null);
            }
        };
        const fetchOpus=async()=>{
            const newOpus = await arachne.opera.get({id: props.item.opus_id});
            setOpus(newOpus[0]);
            const sameLineOpera = await arachne.opera.get({auctor_id: newOpus[0].auctor_id, same_line: 1}, {select: ["id"]});
            if(sameLineOpera.length>0&&sameLineOpera[0].id!==props.item.opus_id){setSameLinePossibleOpus(false)}
            else{setSameLinePossibleOpus(true)}
            const opusAbove = await arachne.opera.search([{c: "sort_nr", o: "=", v: newOpus[0].sort_nr-1}], {select: ["id", "opus"]});
            if(opusAbove.length>0){
                setSortOpusAfterValue(opusAbove[0].opus);
                setSortOpusAfterId(opusAbove[0].id);
                setSortOpusAfterIdInital(opusAbove[0].id);
            }else{
                setSortOpusAfterValue(null);
                setSortOpusAfterId(null);
                setSortOpusAfterIdInital(null);
            }
        };
        const fetchLocus=async()=>{
            const newLocus = await arachne.loci.get({id: props.item.locus_id});
            setLocus(newLocus[0]);
            const sameLineLoci = await arachne.loci.get({opus_id: newLocus[0].opus_id, same_line: 1}, {select: ["id"]});
            if(sameLineLoci.length>0&&sameLineLoci[0].id!==props.item.locus_id){setSameLinePossibleLocus(false)}
            else{setSameLinePossibleLocus(true)}
        };
        if(props.item.auctor_id){fetchAuctor()}else{setAuctor(null)}
        if(props.item.opus_id){fetchOpus()}else{setOpus(null)}
        if(props.item.locus_id){fetchLocus()}else{setLocus(null)}
        fetchSelectLst();
    }, [props.item]);
    const saveValue=(obj, key, val)=>{
        if(obj==="a"){
            let newAuctor = {...auctor};
            newAuctor[key] = val!==""?val:null;
            setAuctor(newAuctor);
        }else if(obj==="o"){
            let newOpus={...opus};
            newOpus[key] = val!==""?val:null;
            setOpus(newOpus);
        }else if(obj==="l"){
            let newLocus = {...locus};
            newLocus[key] = val!==""?val:null;
            setLocus(newLocus);
        }else{
            throw new Error(`table ${obj} in saveValue() not found.`);
        }
    }
    const saveValues=(obj, lst)=>{
        if(obj==="a"){
            let newAuctor = {...auctor};
            lst.forEach(k=>{newAuctor[k[0]] = k[1]!==""?k[1]:null});
            setAuctor(newAuctor);
        }else if(obj==="o"){
            let newOpus = {...opus};
            lst.forEach(k=>{newOpus[k[0]] = k[1]!==""?k[1]:null});
            setOpus(newOpus);
        }else if(obj==="l"){
            let newLocus = {...locus};
            lst.forEach(k=>{newLocus[k[0]] = k[1]!==""?k[1]:null});
            setLocus(newLocus);
        }else{
            throw new Error(`Table '${obj}' in saveValues() not found.`)
        }
    }
    return <Offcanvas show={true} placement="end" scroll={true} backdrop={false} onHide={()=>{props.onClose()}}>
        <Offcanvas.Header closeButton>
            <Offcanvas.Title></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            <Accordion defaultActiveKey="0">
                {auctor&&<Accordion.Item eventKey="0">
                    <Accordion.Header>auctor <span style={{marginLeft: "10px", fontSize: "75%"}}>(ID: {auctor.id})</span></Accordion.Header>
                    <Accordion.Body>
                        <Container>
                            <Row>Name:</Row><Row className="mb-2"><input style={{width: "100%"}} type="text" value={auctor.auctor?auctor.auctor:""} onChange={e=>{saveValue("a", "auctor", e.target.value)}} /></Row>
                            <Row>Ordungszahl:</Row><Row className="mb-2"><input type="text" value={auctor.ord?auctor.ord:""} onChange={e=>{saveValue("a", "ord", e.target.value)}} /></Row>
                            <Row><span style={{padding: "0"}}>Sortierung: <small>unterhalb von...</small></span></Row><Row className="mb-2">
                                <SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={auctoresSelect} value={sortAuctorAfterId?sortAuctorAfterId:""} onChange={e=>{setSortAuctorAfterId(e.target.value)}} />
                            </Row>
                            <Row>Datierung:</Row><Row className="mb-4"><input type="text" value={auctor.date_display?auctor.date_display:""} onChange={e=>{saveValue("a", "date_display", e.target.value)}} /></Row>
                            <Row><i style={{padding: "0"}}>explicatio:</i></Row><Row className="mb-2"><textarea onChange={e=>{saveValue("a", "explicatio", e.target.value)}} value={auctor.explicatio?auctor.explicatio:""}></textarea></Row>
                            <Row><i style={{padding: "0"}}>editiones:</i></Row><Row className="mb-4"><textarea onChange={e=>{saveValue("a", "editiones", e.target.value)}} value={auctor.editiones?auctor.editiones:""}></textarea></Row>
                            <Row>In Benutzung:</Row><Row className="mb-4"><SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={[["", "Nein"], [1, "Ja"]]} value={auctor.in_use?auctor.in_use:""} onChange={e=>{saveValue("a", "in_use", e.target.value)}} /></Row>
                            {opus===null&&<><Row>Referenz-Text:</Row><Row className="mb-2"><input type="text" value={auctor.ref_text?auctor.ref_text:""} onChange={e=>{
                                    if(e.target.value===""){
                                        saveValues("a", [
                                                ["ref_id", null],
                                                ["ref_type", null],
                                                ["ref_text", e.target.value]
                                            ]);
                                    }else{saveValue("a", "ref_text", e.target.value)}
                                }} /></Row></>}
                            {auctor.ref_text&&<><Row>Referenz-Typ:</Row><Row className="mb-2"><SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={[["", ""], [1, "auctor"], [2, "opus"], [3, "locus"]]} value={auctor.ref_type?auctor.ref_type:""} onChange={e=>{
                                            saveValue("a", "ref_type", e.target.value);
                                            if(e.target.value==="1"){setRefLst(["auctores", "auctor"])}
                                            else if(e.target.value==="2"){setRefLst(["opera_ac", "ac_web"])}
                                            else if(e.target.value==="3"){setRefLst(["loci_ac", "ac_web"])}
                                            else{setRefLst(null)}
                                        }} /></Row></>}
                            {auctor.ref_text&&refLst&&<><Row>Referenz:</Row><Row className="mb-2"><AutoComplete  style={{left: "-10px", padding: "0", width: "310px", height: "30px", position: "relative"}} onChange={(value, id)=>{setRefName(value);saveValue("a", "ref_id", id)}} value={refName?refName:""} tbl={refLst[0]}  searchCol={refLst[1]} returnCol={refLst[1]} /></Row></>}
                            <Row className="mt-4"><Col><StatusButton onClick={async()=>{
                                console.log(auctor);
                                await arachne.auctores.save({...auctor});
                                if(sortAuctorAfterIdInital!==sortAuctorAfterId&&sortAuctorAfterId!==null){await arachne.exec("SortIndex", false, ["auctores", auctor.id,sortAuctorAfterId])}
                                return {status: 1};
                            }} value="speichern" /></Col><Col><Button variant="danger" onClick={async()=>{
                                if(window.confirm("Soll der auctor wirklich gelöscht werden? Alle verknüpften opera und loci werden ebenfalls gelöscht!")){
                                    const delOpera = await arachne.opera.get({auctor_id: auctor.id});
                                    let delLociLst = [];
                                    for(const delOpus of delOpera){
                                        const delLoci = await arachne.loci.get({opus_id: delOpus.id}, {select: ["id"]});
                                        delLociLst = delLociLst.concat(delLoci.map(d=>d.id));
                                    }
                                    await arachne.loci.delete(delLociLst);
                                    await arachne.opera.delete(delOpera.map(o=>o.id));
                                    await arachne.auctores.delete(auctor.id);
                                    props.onClose();
                                    alert("Löschen erfolgreich. Aktualisieren Sie den Index, damit die gelöschten Einträge verschwinden.")
                                }
                            }}>löschen</Button></Col></Row>
                        </Container>
                    </Accordion.Body>
                </Accordion.Item>}
                {opus&&<Accordion.Item eventKey="1">
                    <Accordion.Header>opus <span style={{marginLeft: "10px", fontSize: "75%"}}>(ID: {opus.id})</span></Accordion.Header>
                    <Accordion.Body>
                        <Container>
                        <Row>Name:</Row><Row className="mb-2"><input style={{width: "100%"}} type="text" value={opus.opus?opus.opus:""} onChange={e=>{saveValue("o", "opus", e.target.value)}} /></Row>
                        <Row>Ordungszahl:</Row><Row className="mb-2"><input type="text" value={opus.ord?opus.ord:""} onChange={e=>{saveValue("o", "ord", e.target.value)}} /></Row>
                        <Row className="mb-2">
                            <Col style={{padding: "0"}}>Sortierung: <small>unterhalb von...</small></Col></Row><Row className="mb-2">
                                <AutoComplete style={{left: "-10px", padding: "0", width: "310px", height: "30px", position: "relative"}} onChange={(value, id)=>{setSortOpusAfterValue(value);setSortOpusAfterId(id)}} value={sortOpusAfterValue?sortOpusAfterValue:""} tbl="opera_ac"  searchCol="ac_web" returnCol="ac_web" />
                        </Row>
                        <Row>Datierung:</Row><Row className="mb-4"><input type="text" value={opus.date_display?opus.date_display:""} onChange={e=>{saveValue("o", "date_display", e.target.value)}} /></Row>
                        <Row className="mb-2"><span style={{padding: 0}}><i>auctor</i>:</span></Row>
                                <Row className="mb-2"><SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={auctoresSelect} value={opus.auctor_id?opus.auctor_id:""} />
                            </Row>
                        {sameLinePossibleOpus&&<><Row><span style={{padding: 0}}>Mit <i>auctor</i> auf einer Zeile?</span></Row><Row><SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={[[0, "Nein"], [1, "Ja"]]} value={opus.same_line?opus.same_line:0} onChange={e=>{saveValue("o", "same_line", e.target.value)}} />
                        </Row></>}
                        <Row className="mt-4"><span style={{padding: 0}}><i>explicatio</i>:</span></Row><Row className="mb-2"><textarea onChange={e=>{saveValue("o", "explicatio", e.target.value)}} value={opus.explicatio?opus.explicatio:""}></textarea></Row>
                        <Row><span style={{padding: 0}}><i>editiones</i>:</span></Row><Row className="mb-4"><textarea onChange={e=>{saveValue("o", "editiones", e.target.value)}} value={opus.editiones?opus.editiones:""}></textarea></Row>
                        <Row><span style={{padding: 0}}>In Benutzung:</span></Row><Row className="mb-4"><SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={[["", "Nein"], [1, "Ja"]]} value={opus.in_use?opus.in_use:""} onChange={e=>{saveValue("o", "in_use", e.target.value)}} /></Row>
                        <Row>Referenz-Text:</Row><Row className="mb-2"><input type="text" value={opus.ref_text?opus.ref_text:""} onChange={e=>{
                                    if(e.target.value===""){
                                        saveValues("o", [
                                                ["ref_id", null],
                                                ["ref_type", null],
                                                ["ref_text", e.target.value]
                                            ]);
                                    }else{saveValue("o", "ref_text", e.target.value)}
                                }} /></Row>
                        {opus.ref_text&&<><Row>Referenz-Typ:</Row><Row className="mb-2"><SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={[["", ""], [1, "auctor"], [2, "opus"], [3, "locus"]]} value={opus.ref_type?opus.ref_type:""} onChange={e=>{
                                saveValue("o", "ref_type", e.target.value);
                                if(e.target.value==="1"){setRefLst(["auctores", "auctor"])}
                                else if(e.target.value==="2"){setRefLst(["opera_ac", "ac_web"])}
                                else if(e.target.value==="3"){setRefLst(["loci_ac", "ac_web"])}
                                else{setRefLst(null)}
                            }} /></Row></>}
                        {opus.ref_text&&refLst&&<><Row>Referenz:</Row><Row className="mb-2"><AutoComplete style={{left: "-10px", padding: "0", width: "310px", height: "30px", position: "relative"}} onChange={(value, id)=>{setRefName(value);saveValue("o", "ref_id", id)}} value={refName?refName:""} tbl={refLst[0]}  searchCol={refLst[1]} returnCol={refLst[1]} /></Row></>}
                        <Row className="mt-4"><Col><StatusButton onClick={async()=>{
                            console.log(opus);
                            await arachne.opera.save({...opus});
                            if(sortOpusAfterIdInital!==sortOpusAfterId&&sortOpusAfterId!==null){await arachne.exec("SortIndex", false, ["opera", opus.id,sortOpusAfterId])}
                            return {status: 1};
                        }} value="speichern" /></Col><Col><Button variant="danger" onClick={async()=>{
                            if(window.confirm("Soll das opus wirklich gelöscht werden? Alle verknüpften loci werden ebenfalls gelöscht!")){
                                const delLoci = await arachne.loci.get({opus_id: opus.id}, {select: ["id"]});
                                await arachne.loci.delete(delLoci.map(l=>l.id));
                                await arachne.opera.delete(opus.id);
                                props.onClose();
                                alert("Löschen erfolgreich. Aktualisieren Sie den Index, damit die gelöschten Einträge verschwinden.")
                            }
                        }}>löschen</Button></Col></Row>
                        </Container>
                    </Accordion.Body>
                </Accordion.Item>}
                {locus&&<Accordion.Item eventKey="2">
                    <Accordion.Header>locus <span style={{marginLeft: "10px", fontSize: "75%"}}>(ID: {locus.id})</span></Accordion.Header>
                    <Accordion.Body>
                        <Container>
                            <Row>Name:</Row><Row className="mb-2"><input type="text" value={locus.locus?locus.locus:""} onChange={e=>{saveValue("l", "locus", e.target.value)}} /></Row>
                            <Row>Ordungszahl:</Row><Row className="mb-2"><input type="text" value={locus.ord?locus.ord:""} onChange={e=>{saveValue("l", "ord", e.target.value)}} /></Row>
                            <Row>
                                <span style={{padding: 0}}>Sortierung: <small>unterhalb von...</small></span></Row>
                                <Row className="mb-2">
                                    <AutoComplete style={{left: "-10px", padding: "0", width: "310px", height: "30px", position: "relative"}} onChange={(value, id)=>{setSortLocusAfterValue(value);setSortLocusAfterId(id)}} value={sortLocusAfterValue?sortLocusAfterValue:""} tbl="loci"  searchCol="locus" returnCol="locus" />
                            </Row>
                            <Row>Datierung:</Row><Row className="mb-4"><input type="text" value={locus.date_display?locus.date_display:""} onChange={e=>{saveValue("l", "date_display", e.target.value)}} /></Row>
                            <Row>
                                <span style={{padding: 0}}>verknüpftes <i>opus</i>:</span></Row>
                                <Row><SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={operaSelect} value={locus.opus_id?locus.opus_id:""} />
                            </Row>
                            {sameLinePossibleLocus&&<><Row className="mt-2">
                            <span style={{padding: 0}}>Mit <i>opus</i> auf einer Zeile?</span></Row>
                            <Row><SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={[[0, "Nein"], [1, "Ja"]]} value={locus.same_line?locus.same_line:0} onChange={e=>{saveValue("l", "same_line", e.target.value)}} />
                            </Row></>}
                            <Row className="mt-4"><span style={{padding: 0}}><i>explicatio</i>:</span></Row><Row className="mb-2"><textarea onChange={e=>{saveValue("l", "explicatio", e.target.value)}} value={locus.explicatio?locus.explicatio:""}></textarea></Row>
                            <Row><span style={{padding: 0}}><i>editiones</i>:</span></Row><Row className="mb-4"><textarea onChange={e=>{saveValue("l", "editiones", e.target.value)}} value={locus.editiones?locus.editiones:""}></textarea></Row>
                            <Row>In Benutzung:</Row><Row className="mb-4"><SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={[["", "Nein"], [1, "Ja"]]} value={locus.in_use?locus.in_use:""} onChange={e=>{saveValue("l", "in_use", e.target.value)}} /></Row>
                            <Row>Referenz-Text:</Row><Row className="mb-2"><input type="text" value={locus.ref_text?locus.ref_text:""} onChange={e=>{
                                        if(e.target.value===""){
                                            saveValues("l", [
                                                    ["ref_id", null],
                                                    ["ref_type", null],
                                                    ["ref_text", e.target.value]
                                                ]);
                                        }else{saveValue("l", "ref_text", e.target.value)}
                                    }} /></Row>
                            {locus.ref_text&&<><Row>Referenz-Typ:</Row><Row className="mb-2"><SelectMenu style={{width: "100%", height: "30px", padding: "0px 10px 0 10px"}} options={[["", ""], [1, "auctor"], [2, "opus"], [3, "locus"]]} value={locus.ref_type?locus.ref_type:""} onChange={e=>{
                                    saveValue("l", "ref_type", e.target.value);
                                    if(e.target.value==="1"){setRefLst(["auctores", "auctor"])}
                                    else if(e.target.value==="2"){setRefLst(["opera_ac", "ac_web"])}
                                    else if(e.target.value==="3"){setRefLst(["loci_ac", "ac_web"])}
                                    else{setRefLst(null)}
                                }} /></Row></>}
                            {locus.ref_text&&refLst&&<><Row>Referenz:</Row><Row className="mb-2"><AutoComplete style={{left: "-10px", padding: "0", width: "310px", height: "30px", position: "relative"}} onChange={(value, id)=>{setRefName(value);saveValue("l", "ref_id", id)}} value={refName?refName:""} tbl={refLst[0]}  searchCol={refLst[1]} returnCol={refLst[1]} /></Row></>}
                            <Row className="mt-4"><Col><StatusButton onClick={async()=>{
                                console.log(locus);
                                await arachne.loci.save({...locus});
                                if(sortLocusAfterIdInital!==sortLocusAfterId&&sortLocusAfterId!==null){await arachne.exec("SortIndex", false, ["loci", locus.id,sortLocusAfterId])}
                                return {status: 1};
                            }} value="speichern" /></Col><Col><Button variant="danger" onClick={async()=>{
                                if(window.confirm("Soll der locus wirklich gelöscht werden?")){
                                    await arachne.loci.delete(locus.id);
                                    props.onClose();
                                    alert("Löschen erfolgreich. Aktualisieren Sie den Index, damit der gelöschte Eintrag verschwindet.")
                                }
                            }}>löschen</Button></Col></Row>
                        </Container>
                    </Accordion.Body>
                </Accordion.Item>}
            </Accordion>
        </Offcanvas.Body>
    </Offcanvas>;
}
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
            [`${this.props.listName==="tll_index"?"Index":"opera-Listen"} aktualisieren`, async ()=>{  
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
                    const nHits = await arachne[props.listName].search([{c: "search", o: "=", v: `${e.target.value}*`}], {select: ["id"]});
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
            {arachne.project_name==="mlw"&&arachne.access("o_edit")&&this.state.item?<OperaAside item={this.state.item} onUpdate={()=>{this.setState({item: null})}} onClose={()=>{this.setState({item: null})}} onReload={async ()=>{this.setState({item: null});await this.getLst()}} />:null}
            {arachne.project_name==="tll"&&arachne.access("o_edit")&&this.state.item?<OperaAsideTLL item={this.state.item} onUpdate={()=>{this.setState({item: null})}} onClose={()=>{this.setState({item: null})}} onReload={async ()=>{this.setState({item: null});await this.getLst()}} />:null}
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
        const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
          <span
            style={{cursor: "pointer"}}
            ref={ref}
            onClick={(e) => {
              e.preventDefault();
              onClick(e);
            }}
          >
            {children}
            <FontAwesomeIcon style={{color: "#4d565f", marginLeft: "5px"}} icon={faCaretDown} />
          </span>
        ));
        let trLst = [];
        let i = 0;
        for(const o of oLst){
            let editionLst = [];
            if(o.editions_id){
                const editionsId = JSON.parse(o.editions_id);
                const editionsURL = JSON.parse(o.editions_url);
                const editionsLabel = JSON.parse(o.editions_label);
                for(let iE = 0; iE < editionsId.length; iE++){
                    let cURL = `/${arachne.project_name}/argos/${editionsId[iE]}`;
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
                const abbr = o.work_id>0&&o.author_id===null?`<span>&nbsp;&nbsp;&nbsp;${o.abbr}</span>`:`<aut>${o.abbr}</aut>`;
                const full =  o.viaf_id!==null||o.gq_work_id!==null||o.gq_author_id!=null?<Dropdown>
                    <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                        <span dangerouslySetInnerHTML={parseHTML(o.work_id>0&&o.author_id===null?`<span>&nbsp;&nbsp;&nbsp;${o.full}</span>`:o.full)}></span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {o.same_line===1?<>
                            {o.gq_author_id!==null&&o.gq_author_id!==null&&<Dropdown.Item eventKey="1" onClick={()=>{window.open(`https://geschichtsquellen.de/autor/${o.gq_author_id}`, "_blank")}}>Geschichtsquelle <small>(Autor)</small></Dropdown.Item>}
                            {o.gq_work_id!==null&&o.gq_work_id!==null&&<Dropdown.Item eventKey="2" onClick={()=>{window.open(`https://geschichtsquellen.de/werk/${o.gq_work_id}`, "_blank")}}>Geschichtsquelle <small>(Werk)</small></Dropdown.Item>}
                        </>:null}
                        {o.same_line!==1&&o.gq_author_id!==null&&<Dropdown.Item eventKey="3" onClick={()=>{window.open(`https://geschichtsquellen.de/autor/${o.gq_author_id}`, "_blank")}}>Geschichtsquelle</Dropdown.Item>}
                        {o.same_line!==1&&o.gq_work_id!==null&&<Dropdown.Item eventKey="4" onClick={()=>{window.open(`https://geschichtsquellen.de/werk/${o.gq_work_id}`, "_blank")}}>Geschichtsquelle</Dropdown.Item>}
                        {o.viaf_id!==null?<Dropdown.Item eventKey="5" onClick={()=>{window.open(`https://viaf.org/viaf/${o.viaf_id}`, "_blank")}}>VIAF</Dropdown.Item>:null}
                    </Dropdown.Menu>
                </Dropdown>:<span dangerouslySetInnerHTML={parseHTML(o.work_id>0&&o.author_id===null?`<span>&nbsp;&nbsp;&nbsp;${o.full}</span>`:o.full)}></span>
                trLst.push({o: o, data: [
                <td key="0" className="c1" dangerouslySetInnerHTML={parseHTML(o.date_display)}></td>,
                <td key="1" className="c2" dangerouslySetInnerHTML={parseHTML(abbr)}></td>,
                <td key="2" className="c3">{full}</td>,
                <td key="3" className="c4"><span dangerouslySetInnerHTML={parseHTML(o.bibliography)}></span><ul className="noneLst">{editionLst}</ul></td>,
                <td key="4" className="c5" dangerouslySetInnerHTML={parseHTML(o.comment)}></td>
            ]});
            } else if(listName==="opera_minora"){
                const cit =  o.gq_work_id!==null||o.gq_author_id!=null?<Dropdown>
                    <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                        <span dangerouslySetInnerHTML={parseHTML(o.citation)}></span>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {o.gq_author_id!==null&&<Dropdown.Item eventKey="1" onClick={()=>{window.open(`https://geschichtsquellen.de/autor/${o.gq_author_id}`, "_blank")}}>Geschichtsquelle <small>(Autor)</small></Dropdown.Item>}
                        {o.gq_work_id!==null&&<Dropdown.Item eventKey="2" onClick={()=>{window.open(`https://geschichtsquellen.de/werk/${o.gq_work_id}`, "_blank")}}>Geschichtsquelle <small>(Werk)</small></Dropdown.Item>}
                    </Dropdown.Menu>
                </Dropdown>:<span dangerouslySetInnerHTML={parseHTML(o.citation)}></span>
                trLst.push({o: o, data: [
                <td key="0" className="c1_min" dangerouslySetInnerHTML={parseHTML(o.date_display)}></td>,
                <td key="1" className="c2_min">{cit}</td>,
                <td key="2" className="c5_min"><span dangerouslySetInnerHTML={parseHTML(o.bibliography)}></span><ul className="noneLst">{editionLst}</ul></td>
            ]});
            } else if(listName==="tll_index"){
                let classNameTxt = "c0_tll";
                let leftPad = null;
                let abbrComponent=null;
                if(o.auctor_id!==null){
                    classNameTxt += ` a_${o.auctor_id}`;
                    abbrComponent = <aut style={{color: "blue"}}>{o.auctor}</aut>;
                }
                if(o.opus_id!==null){
                    classNameTxt += ` o_${o.opus_id}`;
                    abbrComponent = <>{abbrComponent!==null?<>{abbrComponent} </>:null}<span style={{color: "green"}}>{o.opus}</span></>;
                    leftPad = o.auctor_id!==null?leftPad:"2rem";
                }
                if(o.locus_id!=null){
                    classNameTxt += ` l_${o.locus_id}`;
                    if(o.locus!==""&&o.locus!==null){ // opera always have loci.
                       abbrComponent = <>{abbrComponent!==null?<>{abbrComponent} </>:null}<span style={{color: "red"}}> {o.locus}</span></>;
                        leftPad = o.opus_id!==null?leftPad:"4rem"; 
                    }
                }
                if(o.in_use!==1){
                    abbrComponent = <><span style={{color: "orange"}}>[</span>{abbrComponent}<span style={{color: "orange"}}>]</span></>;
                }
                trLst.push({o: o, data: [
                   <td key="0" className={classNameTxt} dangerouslySetInnerHTML={parseHTML(o.ord)}></td>,
                   <td key="1" className="c1_tll" style={{paddingLeft: leftPad}} dangerouslySetInnerHTML={parseHTML(o.date_display)}></td>,
                   <td key="2" className="c2_tll" style={{paddingLeft: leftPad}}>{abbrComponent}</td>,
                   <td key="3" className="c3_tll" style={{paddingLeft: leftPad}}><span onClick={()=>{
                    const el = document.querySelector(`.${o.ref_target}`);
                    if(el){el.scrollIntoView({behavior: "auto", block: "center"})}
                   }} style={{textDecoration: o.ref_target?"underline":"", cursor: o.ref_target?"pointer":"default"}} dangerouslySetInnerHTML={parseHTML(o.ref_text)}></span></td>,
                   <td key="4" className="c4_tll" style={{paddingLeft: leftPad}} dangerouslySetInnerHTML={parseHTML(o.explicatio)}></td>,
                   <td key="5" className="c5_tll" style={{paddingLeft: leftPad}}><div dangerouslySetInnerHTML={parseHTML(o.editiones)}></div><ul className="noneLst">{editionLst}</ul></td>,
                ]});
            } else {
                throw new Error("listname unknown!")
            }
        }
        return trLst;
    }
}

export { Opera };