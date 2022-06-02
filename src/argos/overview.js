import { Button, Container, Col, Navbar, Row, Table, InputGroup, FormControl, DropdownButton, Dropdown } from "react-bootstrap";
import { useEffect, useState } from "react";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./../arachne.js";
import { storeEdition, Settings } from "./edition.js";
import { parseHTML, Navigator, useShortcuts } from "./../elements.js";

function Overview(prop){
    const [fullTextLst, setFullTextLst] = useState([]);
    const [editionHits, setEditionHits] = useState([]);
    const [opera, setOpera] = useState([]);
    const [operaCount, setOperaCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [query, setQuery] = useState("");
    const shortCutLst = [
        ["ACTION+f", ()=>{
            const el = document.getElementById("searchInput");
            if(el){el.focus()}
        }],
        ["ACTION+ArrowRight", ()=>{
            if(Math.ceil(operaCount/30)>=currentPage+1){
                setCurrentPage(currentPage+1);
            }else{setCurrentPage(1)}
        }],
        ["ACTION+ArrowLeft", ()=>{
            if(0<currentPage-1){
                setCurrentPage(currentPage-1)
            }else{
                setCurrentPage(Math.ceil(operaCount/30))
            }
        }],
    ];
    useShortcuts(shortCutLst, false);
    useEffect(()=>{
        const fetchData = async ()=>{
            let operaCount = null;
            let nFullTxtLst = [];
            let nEditionHits = [];
            if(query!=""){ // search
                operaCount = await arachne.scan_opera.search([{c:"search",o:"=", v:`${query}*`}], {count: true})
            }else{operaCount = await arachne.scan_opera.getAll({count: true})} // display all
            setOperaCount(operaCount[0].count);
            setEditionHits(nEditionHits);
            setFullTextLst(nFullTxtLst);
            setCurrentPage(1);
        };
        fetchData();
    }, [query]);
    useEffect(()=>{
        const fetchData = async ()=>{
            let newOpera = []
            if(query!=""){
                newOpera = await arachne.scan_opera.search([{c:"search",o:"=", v:`${query}*`}], {limit: 30, offset: (currentPage-1)*30})
            }else{newOpera = await arachne.scan_opera.getAll({limit: 30, offset: (currentPage-1)*30})}
            setOpera(newOpera);
        };
        fetchData();
    }, [query, currentPage, fullTextLst])
    const openEdition = (e, id, label, opus)=>{
        storeEdition(id, label, opus);
        prop.loadMain(e, "edition", id);
    };
    return <><Container>
        <Row><Col xs={1}></Col><Col><Table><thead><tr><th width="40%">Zitiertitel</th><th width="30%">relevant</th><th width="15%">veraltet</th><th width="15%">Sonstiges</th></tr></thead><tbody>{opera.map(o =>{
            const label = JSON.parse(o.editions_label);
            const id = JSON.parse(o.editions_id);
            const url = JSON.parse(o.editions_url);
            const type = JSON.parse(o.editions_type);
            let editions=[];
            if(label&&label.length===id.length&&id.length===url.length){
                let i = -1;
                editions = id.map(id=>{
                    const hits = editionHits.filter(h=>h===parseInt(id)).length;
                    i++;
                    return {id: id, label: label[i], url: url[i], type: type[i], hits: hits}
                })
            }
            if(editionHits.length>0){editions = editions.filter(f=>f.hits>0)}
            return <tr style={{color: o.in_use?null:"var(--bs-gray-500)", backgroundColor: o.in_use?null:"var(--bs-gray-100)"}} key={o.id}><td dangerouslySetInnerHTML={parseHTML(o.citation)}></td><td>{editions.map(e=>{if(e.type===0||e.type===3){return <div key={e.id}><a href={e.url?e.url:"#"} target={e.url?"_blank":""} className={e.url?"link-warning":"link-primary"} onClick={ev=>{if(!e.url){openEdition(ev, e.id, e.label, o.search)}}}>{e.label}{editionHits.length>0?" ("+e.hits+")":null}</a></div>;}})}</td><td>{editions.map(e=>{if(e.type===1||e.type===4){return <div key={e.id}><a href={e.url?e.url:"#"} target={e.url?"_blank":""} onClick={ev=>{if(!e.url){openEdition(ev, e.id, e.label, o.search)}}}>{e.label}</a></div>;}})}</td><td>{editions.map(e=>{if(e.type===2||e.type===5){return <div key={e.id}><a href={e.url?e.url:"#"} target={e.url?"_blank":""} onClick={ev=>{if(!e.url){openEdition(ev, e.id, e.label, o.search)}}}>{e.label}</a></div>;}})}</td></tr>})}</tbody></Table></Col><Col xs={1}></Col></Row>
    </Container>
    <NavBarBottom operaCount={operaCount} currentPage={currentPage} setCurrentPage={p=>{setCurrentPage(p)}} setQuery={q=>{setQuery(q)}} />
    </>;
};

function NavBarBottom(props){
    const [queryTxt, setQueryTxt] = useState("")
    return <Navbar fixed="bottom" bg="light">
        <Container fluid>
            <Navbar.Collapse className="justify-content-start">
                <Navbar.Text>
                    <InputGroup>
                        <FormControl placeholder="Nach Zitiertitel suchen..." id="searchInput" onChange={e=>{setQueryTxt(e.target.value)}} value={queryTxt} onKeyUp={e=>{if(e.keyCode===13){props.setQuery(queryTxt)}}} />
                        <Button variant="dark" onClick={()=>{props.setQuery(queryTxt)}}><FontAwesomeIcon icon={faSearch} /></Button>
                        {/*<DropdownButton variant="outline-secondary" title="Zitiertitel" align="end">
                            <Dropdown.Item href="#">Zitiertiel</Dropdown.Item>
                            <Dropdown.Item href="#">Volltext</Dropdown.Item>
</DropdownButton>*/}
                    </InputGroup>
                </Navbar.Text>
            </Navbar.Collapse>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                {props.operaCount>0?
                <Navigator loadPage={newPage=>{props.setCurrentPage(newPage)}} currentPage={props.currentPage} maxPage={Math.ceil(props.operaCount/30)} />
                :null}
                </Navbar.Text>
                <Navbar.Text>
                    {/*arachne.access("z_edit")&&<ToolKit menuItems={[
                            ["neuer Zettel erstellen", async ()=>{
                                if(window.confirm("Soll ein neuer Zettel erstellt werden?")){
                                    const newId = await arachne.zettel.save({type: 2, txt: "Neuer Zettel"});
                                    this.setState({setupItems: [{id: 0, c: "id", o: "=", v:newId}]});
                                }
                            }]
                        ]} />*/}
                </Navbar.Text>
            </Navbar.Collapse>
        </Container>
    </Navbar>;
}

export { Overview };