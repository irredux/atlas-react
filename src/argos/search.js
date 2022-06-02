import { useState, useEffect } from "react";
import { Button, Col, Container, Form, Navbar, Row, Spinner, Table, InputGroup } from "react-bootstrap";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./../arachne";
import { Navigator, parseHTML } from "./../elements.js"
import { storeEdition, saveNewPageLocally } from "./edition.js"

function SearchBox(props){
    const resultsProPage = 5;
    const [query, setQuery] = useState("");
    const [resultLabel, setResultLabel] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [maxPage, setMaxPage] = useState(0);
    const [results, setResults] = useState([]);
    const [searchAutoText, setSearchAutoText] = useState(false);
    const searchQuery = ()=>{
        if(query===""){
            setResults([]);
        }else{
            const fetchData = async ()=>{
                setResultLabel(<Spinner variant="primary" animation="border" />);
                const newResultsCount = await arachne.fulltext_search_view.search([{c:"full_text",o:"=", v:`*${query}*`}, {c: "auto_text", o: searchAutoText?">=":"=", v: 0}], {select: ["work_id"], group: "work_id"});
                setResultLabel(`${newResultsCount.length} Werke gefunden.`);
                setMaxPage(Math.floor(newResultsCount.length/resultsProPage)+1)
                loadPage(1);
            };
            fetchData();
        }
    };
    const loadPage = async newPage => {
        setCurrentPage(newPage);
        setResults([]);
        const newResults = await arachne.fulltext_search_view.search([{c:"full_text",o:"=", v:`*${query}*`}, {c: "auto_text", o: searchAutoText?">=":"=", v: 0}], {select: ["work_id", "opus"], group: "work_id", offset: (newPage-1)*resultsProPage, limit:resultsProPage});
        setResults(newResults);
    };
    return <>
        <Navbar fixed="bottom" bg="light">
            <Container fluid>
                <Navbar.Collapse className="justify-content-end">
                    <Navbar.Text>
                    {maxPage>0?
                    <Navigator loadPage={newPage=>{loadPage(newPage)}} currentPage={currentPage} maxPage={maxPage} />
                    :null}
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <Container>
            <Row>
                <Col>
                    <InputGroup>
                        <Form.Control type="text" id="searchInput" placeholder="Suche..." value={query} onChange={e=>{setQuery(e.target.value)}} onKeyUp={e=>{if(e.keyCode===13){searchQuery()}}} />
                        <Button style={{padding: "6px 40px"}} onClick={()=>{searchQuery()}}><FontAwesomeIcon icon={faSearch} /></Button>
                    </InputGroup>
                    
                </Col>
            </Row>
            <Row className="mt-2">
                <Col>{resultLabel}</Col>
                <Col></Col>
                <Col>
                    <Form.Check
                        type="switch"
                        id="custom-switch"
                        label="automatisch generierte Texte berücksichtigen"
                        checked={searchAutoText}
                        value={searchAutoText}
                        onChange={e=>{setSearchAutoText(e.target.checked)}}
                    />
                </Col>
            </Row>
            {results.length>0?<Row><Col>
                {results.map(r=><ResultRow searchAutoText={searchAutoText} key={r.work_id} loadMain={(...params)=>{props.loadMain(...params)}} query={query} work={r} />)}
            </Col></Row>:null}
        </Container>
    </>;
}
function ResultRow(props){
    const [sections, setSections] = useState([]);
    const [sectionsCount, setSectionsCount] = useState(-1);
    useEffect(()=>{
        const fetchData = async () => {
            const newPages = await arachne.fulltext_search_view.search([{c:"full_text",o:"=", v:`*${props.query}*`}, {c: "auto_text", o: props.searchAutoText?">=":"=", v: 0}, {c: "work_id", o: "=", v: props.work.work_id}], {select: ["full_text", "auto_text", "page", "edition_id", "scan_id", "opus", "ac_web", "label"]});
            const lengthOfText = 150;
            let newSections = [];
            let newSectionsCount = -1
            newPages.forEach(p=>{
                const maxHits = [...p.full_text.matchAll(props.query)].length;
                let currentIndex = -1;
                for(let i=0;i<maxHits;i++){
                    newSectionsCount += 1;
                    currentIndex = p.full_text.indexOf(props.query, currentIndex+1);
                    newSections.push({
                        id: newSectionsCount,
                        scan_id: p.scan_id,
                        auto_text: p.auto_text,
                        edition_id: p.edition_id,
                        opus: p.opus,
                        ac_web: p.ac_web,
                        label: p.label,

                        page: p.page,
                        section: <span>... {p.full_text.substring(currentIndex-lengthOfText,currentIndex)}<strong className="text-primary">{props.query}</strong>{p.full_text.substring(currentIndex+props.query.length,currentIndex+props.query.length+lengthOfText)} ...</span>
                    });
                }
            });
            setSections(newSections);
            setSectionsCount(newSectionsCount);
        };
        fetchData();
    }, []);
    return <>
        {sections.length>0?<><h4 className="mt-4" style={{borderTop: "1px solid var(--bs-secondary)", paddingTop: "20px"}}><span dangerouslySetInnerHTML={parseHTML(props.work.opus)}></span>{sectionsCount>-1?<i style={{fontSize: "70%"}}>({sectionsCount+1})</i>:null}</h4></>:null}
        {sections.length>0?sections.map(s=><div key={s.id} className="mb-3"><div style={{cursor: "pointer"}} onClick={e=>{
            saveNewPageLocally(s.edition_id, s.scan_id);
            storeEdition(s.edition_id, s.label, s.ac_web);
            arachne.setOptions("argos_mode", 1);
            arachne.setOptions("argos_query", props.query);
            props.loadMain(e, "edition", s.edition_id);
        }}><b>Seite {isNaN(s.page)?s.page:parseInt(s.page)}:</b>{s.auto_text?<small style={{fontStyle: "italic"}} className="text-danger">&nbsp;(auto)</small>:null}</div><div style={{marginLeft: "20px"}}>{s.section}</div></div>):<div><Spinner variant="primary" size="sm" animation="border" /></div>}
    </>;
}

export { SearchBox }