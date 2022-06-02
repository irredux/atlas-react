import { useEffect, useLayoutEffect, useState, useRef } from "react";
import { Button, Container, Col, Form, Navbar, Offcanvas, Row, ListGroup } from "react-bootstrap";
import { faTextSlash, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./../arachne.js";
import { AutoComplete, SelectMenu, StatusButton, ToolKit, parseHTML, useIntersectionObserver, useShortcuts, sleep } from "./../elements.js"

function saveNewPageLocally(edition_id, scan_id){
    if(localStorage.getItem("argos_currentPages")){
        let savedPages = JSON.parse(localStorage.getItem("argos_currentPages"));
        if(savedPages.find(p=>p.edition_id===edition_id)){
            localStorage.setItem("argos_currentPages", JSON.stringify(savedPages.map(p=>{
                if(p.edition_id!==edition_id){return p}
                else{return {edition_id: edition_id, scan_id: scan_id}}
            })));
        }else{
            savedPages.push({edition_id: edition_id, scan_id: scan_id});
            localStorage.setItem("argos_currentPages", JSON.stringify(savedPages));
        }
        
    }else{
        localStorage.setItem("argos_currentPages", JSON.stringify([{edition_id: edition_id, scan_id: scan_id}]))
    }
}
function storeEdition(id, label, opus="???"){
    let editions = localStorage.getItem("editions");
    if(editions){
        editions = JSON.parse(editions);
        editions = editions.filter(e=>{if(e.id!==id){return true;}else{return false;}})
        if(editions.length>15){editions.splice(14)}
        editions.unshift({id: id, label: label, opus: opus});
    } else {editions = [{id: id, label: label, opus: opus}]}
    localStorage.setItem("editions", JSON.stringify(editions))
}
function getEditions(){
    const editions = localStorage.getItem("editions");
    if (editions){return JSON.parse(editions);}
    else{return [];}
}
function Edition(props){
    const [aspectRatio, setAspectRatio] = useState("0.5")
    const [sideMenu, setSideMenu] = useState(null);
    const [query, setQuery] = useState(arachne.options.argos_query);
    useEffect(()=>{arachne.setOptions("argos_query", query)},[query]);
    const [queryResults, setQueryResults] = useState([]);
    const [queryResultIndex, setQueryResultIndex] = useState(0);
    const [ressource, setRessource] = useState(null);
    const [mode, setMode] = useState(arachne.options.argos_mode); // 0=scans only; 1=scan+text; 2=text only
    useEffect(()=>{arachne.setOptions("argos_mode", mode)}, [mode]);
    const [fullTxt, setFullTxt] = useState(false); // true if there are full texts in editions
    const [pages, setPages] = useState([]);
    const [scrollPos, setScrollPos] = useState(0);
    const [scrollLock, setScrollLock] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [componentIsLoaded, setComponentIsLoaded] = useState(false);
    const [zoom, setZoom] = useState(arachne.options.argos_zoom);
    useEffect(()=>{arachne.setOptions("argos_zoom", zoom)},[zoom]);
    const shortCutLst = [
        ["ACTION+ESC", ()=>{props.loadMain(null, null)}],
        ["ACTION+q", ()=>{setSideMenu(null)}],
        ["ACTION+e", ()=>{sideMenu==="ressource"?setSideMenu(null):setSideMenu("ressource")}],
        ["ACTION+s", ()=>{sideMenu==="scans"?setSideMenu(null):setSideMenu("scans")}],
        ["ACTION+o", ()=>{sideMenu==="opera"?setSideMenu(null):setSideMenu("opera")}],
        ["ACTION+i", ()=>{sideMenu==="content"?setSideMenu(null):setSideMenu("content")}],
        ["ACTION+b", ()=>{setEditMode(!editMode)}],
        ["ACTION+f", ()=>{
            const el = document.getElementById("searchInput");
            if(el){el.focus()}
        }],
        ["Alt+ArrowRight", ()=>{
            if(queryResults.length>queryResultIndex+1){
                setQueryResultIndex(queryResultIndex+1)
            }else{
                setQueryResultIndex(0)
            }
        }],
        ["Alt+ArrowLeft", ()=>{
            if(0<=queryResultIndex-1){
                setQueryResultIndex(queryResultIndex-1)
            }else{
                setQueryResultIndex(queryResults.length-1)
            }
        }],
        //[queryResultIndex, setQueryResultIndex]
        ["CTRL+1", ()=>{setMode(0)}],
        ["CTRL+2", ()=>{setMode(1)}],
        ["CTRL+3", ()=>{setMode(2)}],
        ["CTRL+,", ()=>{setZoom(zoom-5)}],
        ["CTRL+.", ()=>{setZoom(zoom+5)}],
    ];
    useShortcuts(shortCutLst, false);
    useEffect(()=>{ // onload (?)
        const fetchData = async ()=>{
            const newRessource = await arachne.edition.get({id: props.resId});
            setRessource(newRessource[0]);
            setAspectRatio(newRessource[0].aspect_ratio?`${newRessource[0].aspect_ratio}`:"0.6")
            let nPages = await arachne.scan_lnk.get({edition_id: props.resId});
            nPages = nPages.sort((a, b) => b.filename < a.filename);
            setPages(nPages);
            if(localStorage.getItem("argos_currentPages")){
                const currentPage = JSON.parse(localStorage.getItem("argos_currentPages")).find(p=>p.edition_id===props.resId);
                if(currentPage){
                    scrollPageIntoView(currentPage.scan_id);
                }
            }
            await sleep(400);
            setComponentIsLoaded(true);
        };
        fetchData();
    },[props.resId]);
    useEffect(()=>{
        let hasFullTxt = false;
        for(const p of pages){if(p.full_text!==null&&p.full_text!==""){hasFullTxt=true;break}}
        if(hasFullTxt){
            setFullTxt(true);
        }else{
            setFullTxt(false);
            if(mode!=0){setMode(0)}
        }
    }, [pages]);
    useEffect(()=>{
        if(fullTxt&&query.length>0){
            const fLst = pages.filter(r=>r.full_text&&r.full_text.search(query)>-1);
            setQueryResults(fLst);
            setQueryResultIndex(0);
            if(mode===0){setMode(1)}
        }else{
            setQueryResults([]);
            setQueryResultIndex(0);
        }
    },[fullTxt, query]);
    useEffect(()=>{if(componentIsLoaded&&queryResults.length>0){scrollPageIntoView(queryResults[queryResultIndex].id)}}, [queryResultIndex, queryResults]);
    const scrollPageIntoView = async (id)=>{
        console.log(id)
        await sleep(100);
        const element = document.getElementById(`p_${id}`);
        if(element){
            element.scrollIntoView();
        }else{console.log("page not found:", id)}
    };
    return <>
    <Container onScroll={e=>{if(scrollLock===false){setScrollLock(true);setScrollPos(e.target.scrollTop);setTimeout(()=>{setScrollLock(false)},500);}}} style={{position: "fixed", top: "60px", left:"0", right: "0", bottom: "60px", overflow: "scroll"}} fluid>
    {pages.map(p=>{return <Row key={p.scan_id}><Col align="center"><Image aspectRatio={aspectRatio} editMode={editMode} query={query} mode={mode} zoom={zoom} scrollPos={scrollPos} page={p} ressource={ressource} /></Col></Row>;})}
    </Container>
    <NavBarBottom scrollPageIntoView={p=>{scrollPageIntoView(p)}} setEditMode={()=>{setEditMode(!editMode)}} fullTxt={fullTxt} setSideMenu={m=>{setSideMenu(m)}} query={query} setQuery={q=>{setQuery(q)}} queryResults={queryResults} queryResultIndex={queryResultIndex} setQueryResultIndex={i=>{setQueryResultIndex(i)}} mode={mode} setMode={m=>{setMode(m)}} zoom={zoom} setZoom={z=>{setZoom(z)}} pages={pages} />
    <SideMenu ressource={ressource} pages={pages} item={sideMenu} setSideMenu={m=>{setSideMenu(m)}} />
    </>;
}
function SideMenu(props){
    return <Offcanvas show={props.item?true:false} onHide={()=>{props.setSideMenu(null)}} placement="end">
        <Offcanvas.Header closeButton>
            <Offcanvas.Title>
            {props.item==="opera"&&"Angaben aus der opera-Liste"}
            {props.item==="ressource"&&`Ressource (ID: ${props.ressource.id})`}
            {props.item==="scans"&&"Scan-Seiten zuweisen"}
            </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            {props.item==="opera"&&<SideOpera ressource={props.ressource} />}
            {props.item==="ressource"&&<SideEdition ressource={props.ressource} />}
            {props.item==="scans"&&<SideScans pages={props.pages} ressource={props.ressource} />}
            {props.item==="content"&&<SideContent setSideMenu={v=>{props.setSideMenu(v)}} pages={props.pages} ressource={props.ressource} />}
        </Offcanvas.Body>
    </Offcanvas>;
}
function SideContent(props){
    return <Container>
        <Row className="mb-4"><Col><h2>Inhaltsverzeichnis</h2></Col></Row>
        <Row className="mb-3"><Col xs={1}></Col><Col><ListGroup variant="flush">
            {props.pages.map(p=>{return <ListGroup.Item style={{textAlign: "center", color:p.body_matter?"inherit":"var(--bs-gray-500)"}} key={p.id} action onClick={()=>{
                const el = document.getElementById(`p_${p.scan_id}`);
                el.scrollIntoView({behavior: "auto", block: "start"});
                props.setSideMenu(null);
            }}>{parseInt(p.filename)>0?parseInt(p.filename):p.filename}</ListGroup.Item>;})}
        </ListGroup></Col><Col xs={1}></Col></Row>
    </Container>;
}
function SideScans(props){
    const [scans, setScans] = useState([]);
    const [pages, setPages] = useState(props.pages.map(p=>{return p.scan_id}));
    useEffect(()=>{
        const fetchData = async ()=>{
            const nScans = await arachne.scan.get({path: props.ressource.path});
            setScans(nScans);
        };
        fetchData();
    }, []);
    const togglePage = id=>{
        if(pages.includes(id)){ setPages(pages.filter(p=>p!=id)) }
        else{ setPages(pages.concat([id])) }
    };
    return <Container>
        <Row className="mb-2"><Col>Dateipfad: <code>{props.ressource.path}</code></Col></Row>
        <Row className="mb-4"><Col><small>Einzelne Seiten können mit einem Klick markiert werden. Mehrere Seiten können mit einer Bewegung der Maus und dem gleichzeitigen Gedrückthalten der {arachne.me.selectKey}-Taste aktiviert werden.</small></Col></Row>
        <Row className="mb-3"><Col><ListGroup>
            {scans.map(s=>{return <ListGroup.Item className="mb-1" key={s.id} active={pages.includes(s.id)?true:false} onMouseEnter={e=>{if((arachne.me.selectKey==="cmd"&&e.metaKey)||(arachne.me.selectKey==="ctrl"&&e.ctrlKey)){togglePage(s.id)}}} onClick={()=>{togglePage(s.id)}} action>{s.filename}</ListGroup.Item>;})}
        </ListGroup></Col></Row>
        <Row className="mb-3"><Col align="right">Auswahl: {pages.length}</Col></Row>
        <Row><Col><StatusButton onClick={async ()=>{
                // delete old links
                if(props.pages.length>0){ await arachne.scan_lnk.delete(props.pages.map(p=>{return p.id})) }
                // create new links
                if(pages.length>0){
                    let newLnks = pages.sort();
                    newLnks = newLnks.map(i=>{return {edition_id: props.ressource.id, scan_id: i}});
                    await arachne.scan_lnk.save(newLnks);
                }                        
                return {status: 1};
        }} value="speichern" /></Col></Row>
        
    </Container>;
}
function SideOpera(props){
    const [work, setWork] = useState({});
    const [author, setAuthor] = useState({});
    useEffect(()=>{
        const fetchData = async ()=>{
            const nWork = await arachne.work.get({id: props.ressource.work_id});
            setWork(nWork[0]);
            const nAuthor = await arachne.author.get({id: nWork[0].author_id});
            setAuthor(nAuthor[0]);
        };
        fetchData();
    }, [props.ressource]);
    return <Container>
        <Row className="mb-2"><Col dangerouslySetInnerHTML={parseHTML(work.date_display?work.date_display:author.date_display)}></Col></Row>
        <Row className="mb-2"><Col xs={5}><b><aut>{work.author_display?work.author_display:author.abbr}</aut></b></Col><Col dangerouslySetInnerHTML={parseHTML(work.author_display?null:author.full)}></Col></Row>
        <Row className="mb-4"><Col xs={5}><b style={{marginLeft: "10px"}} dangerouslySetInnerHTML={parseHTML(work.abbr)}></b></Col><Col><span style={{marginLeft: "10px"}} dangerouslySetInnerHTML={parseHTML(work.full)}></span></Col></Row>
        <Row className="mb-2"><Col><i dangerouslySetInnerHTML={parseHTML(work.bibliography?work.bibliography:author.bibliography)}></i></Col></Row>
        <Row><Col><small dangerouslySetInnerHTML={parseHTML(work.citation?work.citation:author.citation)}></small> <small dangerouslySetInnerHTML={parseHTML(work.txt_info?work.txt_info:author.txt_info)}></small></Col></Row>
    </Container>;
}
function SideEdition(props){
    const [id, setId] = useState(props.ressource.id);
    const [ressource, setRessource] = useState(props.ressource.ressource);
    const [work_id, setWork_id] = useState(props.ressource.work_id);
    const [ac_web, setAc_web] = useState(props.ressource.ac_web);
    const [editor, setEditor] = useState(props.ressource.editor);
    const [year, setYear] = useState(props.ressource.year);
    const [volume, setVolume] = useState(props.ressource.volume);
    const [volCont, setVolCont] = useState(props.ressource.vol_cont);
    const [serie, setSerie] = useState(props.ressource.serie);
    const [location, setLocation] = useState(props.ressource.location);
    const [library, setLibrary] = useState(props.ressource.library);
    const [signature, setSignature] = useState(props.ressource.signature);
    const [comment, setComment] = useState(props.ressource.comment);
    const [path, setPath] = useState(props.ressource.path);
    const [url, setUrl] = useState(props.ressource.url);
    const [aspect_ratio, setAspectRatio] = useState(props.ressource.aspect_ratio);
    const [bibliography_preview, setBibliography_preview] = useState(null);

    useEffect(()=>{
        const fetchData = async ()=>{
            if(work_id>0){
                let bibliography = await arachne.work.get({id: work_id}, {select: ["bibliography"]});
                if(bibliography.length > 0){setBibliography_preview(bibliography[0].bibliography)}
                else {setBibliography_preview(null)}
            }
        };
        fetchData();
    },[work_id]);
    return <Container>
        <Row className="mb-2">
            <Col xs={3}>Werk:</Col>
            <Col><AutoComplete  value={ac_web?ac_web:""} tbl="work" searchCol="ac_web" returnCol="ac_web" onChange={(value, id)=>{setAc_web(value);setWork_id(id)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={3}><small>Alter Dateiname:</small></Col>
            <Col>{props.ressource.dir_name}</Col>
        </Row>
        {bibliography_preview&&<Row className="mb-4">
            <Col xs={3} style={{backgroundColor: "var(--bs-gray-100"}}><small>Bibl. Angaben:</small></Col>
            <Col style={{fontSize: "90%", backgroundColor: "var(--bs-gray-100"}}>{bibliography_preview}</Col>
        </Row>}
        <Row className="mb-2">
            <Col xs={3}>Ressource:</Col>
            <Col><SelectMenu options={[[0, "Edition (relevant)"], [1, "Edition (veraltet)"], [2, "Handschrift"], [3, "Alter Druck (relevant)"], [4, "Alter Druck (veraltet)"], [5, "Sonstiges"]]} value={ressource?ressource:""} onChange={e=>{setRessource(parseInt(e.target.value))}} /></Col>
        </Row>
        {ressource===0||ressource===1||ressource===5?[
            <Row key="0" className="mb-2">
                <Col xs={3}>Editor:</Col>
                <Col><input type="text" style={{width: "100%"}} value={editor?editor:""} onChange={e=>{setEditor(e.target.value)}} /></Col>
            </Row>,
            <Row key="1" className="mb-2">
                <Col xs={3}>Jahr:</Col>
                <Col><input type="text" style={{width: "100%"}} value={year?year:""} onChange={e=>{setYear(e.target.value)}} /></Col>
            </Row>,
            <Row key="2" className="mb-2">
                <Col xs={3}>Band:</Col>
                <Col><input type="text" style={{width: "100%"}} value={volume?volume:""} onChange={e=>{setVolume(e.target.value)}} /></Col>
            </Row>,
            <Row key="3" className="mb-2">
                <Col xs={3}>Bandinhalt:</Col>
                <Col><input type="text" style={{width: "100%"}} value={volCont?volCont:""} onChange={e=>{setVolCont(e.target.value)}} /></Col>
            </Row>,
            <Row key="4" className="mb-4">
                <Col xs={3}>Reihe:</Col>
                <Col><SelectMenu options={[[0, ""], [1, "Migne PL"], [2, "ASBen."], [3, "ASBoll."], [4, "AnalBoll."], [5, "Mon. Boica"], [6, "Ma. Schatzverzeichnisse"], [7, "Ma. Bibliothekskataloge"]]} value={serie?serie:""} onChange={e=>{setSerie(parseInt(e.target.value))}} /></Col>
            </Row>,
        ]:null}
        {ressource===2?[
            <Row key="5" className="mb-2">
                <Col xs={3}>Stadt:</Col>
                <Col><input type="text" style={{width: "100%"}} value={location?location:""} onChange={e=>{setLocation(e.target.value)}} /></Col>
            </Row>,
            <Row key="6" className="mb-2">
                <Col xs={3}>Bibliothek:</Col>
                <Col><input type="text" style={{width: "100%"}} value={library?library:""} onChange={e=>{setLibrary(e.target.value)}} /></Col>
            </Row>,
            <Row key="7" className="mb-4">
                <Col xs={3}>Signatur:</Col>
                <Col><input type="text" style={{width: "100%"}} value={signature?signature:""} onChange={e=>{setSignature(e.target.value)}} /></Col>
            </Row>,
        ]:null}
        {ressource===3||ressource===4?[
            <Row key="8" className="mb-2">
                <Col xs={3}>Drucker:</Col>
                <Col><input type="text" style={{width: "100%"}} value={editor?editor:""} onChange={e=>{setEditor(e.target.value)}} /></Col>
            </Row>,
            <Row key="9" className="mb-2">
                <Col xs={3}>Ort:</Col>
                <Col><input type="text" style={{width: "100%"}} value={location?location:""} onChange={e=>{setLocation(e.target.value)}} /></Col>
            </Row>,
            <Row key="10" className="mb-4">
                <Col xs={3}>Jahr:</Col>
                <Col><input type="text" style={{width: "100%"}} value={year?year:""} onChange={e=>{setYear(e.target.value)}} /></Col>
            </Row>,
        ]:null}
        <Row className="mb-2">
            <Col xs={3}>Kommentar:</Col>
            <Col><textarea style={{width: "250px", height: "100px"}} value={comment?comment:""} onChange={e=>{setComment(e.target.value)}}></textarea></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={3}>Dateipfad:</Col>
            <Col><input type="text" style={{width: "100%"}} value={path?path:""} onChange={e=>{setPath(e.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={3}>Link:<br /><small>(externe Quellen)</small></Col>
            <Col><input type="text" style={{width: "100%"}} value={url?url:""} onChange={e=>{setUrl(e.target.value)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col xs={3}>Seiten-verhältnis:</Col>
            <Col><input type="text" style={{width: "100%"}} value={aspect_ratio?aspect_ratio:""} onChange={e=>{setAspectRatio(e.target.value.substring(0,5))}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col><StatusButton value="speichern" onClick={async ()=>{
                if((ressource===0||ressource===1||ressource===5)&&(!editor||!year)){
                    return {status: false, error: "Geben Sie den Editor und das Jahr ein."};
                } else {
                    await arachne.edition.save({
                        id: id,
                        work_id: work_id,
                        ressource: ressource,
                        editor: editor,
                        year: year,
                        volume: volume,
                        vol_cont: volCont,
                        serie: serie,
                        comment: comment,
                        location: location,
                        library: library,
                        signature: signature,
                        path: path,
                        url: url,
                        aspect_ratio: aspect_ratio
                    });
                    return {status: true};
                }
            }} />
            </Col>
        </Row>
    </Container>;
}
function Image(props){
    const width = props.zoom;
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef(null);
    const [img, setImg] = useState(null);
    useIntersectionObserver({
        target: imgRef,
        onIntersect: ([{ intersectionRatio, isIntersecting }], observerElement) => {
            if (isIntersecting&&!isVisible) {
                setIsVisible(true);
            }
            if(intersectionRatio>0.1){
                document.getElementById("currentPageField").value = isNaN(props.page.filename)?props.page.filename:parseInt(props.page.filename);
                saveNewPageLocally(props.page.edition_id, props.page.scan_id);
                observerElement.unobserve(imgRef.current);
            }
        }
      });
      useEffect(()=>{
          if(isVisible){
                const fetchData = async ()=>{
                    setImg(await arachne.getScan(props.page.scan_id));
                }
                fetchData();
                
          }else{
              setImg(null);
          }
      },[isVisible]);
    return <Row id={`p_${props.page.scan_id}`} className="mb-4 px-5">{props.mode<2?<Col><div ref={imgRef} style={{width: props.mode===0?`${width}%`:props.page.body_matter?"100%":"50%",aspectRatio: props.aspectRatio, boxShadow: "0 5px 10px var(--bs-gray-300)", borderRadius: "3px", overflow: "hidden"}}><img style={{width: "100%", height: "100%"}} src={img} alt={props.page.filename}></img></div></Col>:null}{props.mode>0&&(props.page.body_matter||props.editMode)?<Col><TextBlock editMode={props.editMode} ressource={props.ressource} page={props.page} query={props.query} /></Col>:null}</Row>;
}
function TextBlock(props){
    const [cols, setCols] = useState(null);
    const [textEdit, setTextEdit] = useState(false);
    const [bodyMatter, setBodyMatter] = useState(props.page.body_matter);
    const [pageText, setPageText] = useState(props.page.full_text);
    const [textChangesSaved, setTextChangesSaved] = useState(0) // 0 = no changes; 1 = changes, but not jet saved; 2 = changes saved
    const containerRef = useRef(null);
    useEffect(()=>{
        if(pageText){
            let fullText = props.query?pageText.replace(new RegExp(`(${props.query})`, "gi"), "<mark>$1</mark>"):pageText;
            fullText = fullText.replace(/-\n([^ ]*) /g, "$1\n"); // replace words separated at end of line.
            fullText = fullText.replace(/(\d+\.)/g, "</p><p><b>$1</b>");
            fullText = fullText.replace(/</g, "&lt;").replace(/>/g, "&gt;")
            fullText = `<p>${fullText}</p>`;
            fullText = fullText.replace(/\n/g, "<br />");
            

            const colDelimiter = fullText.indexOf("$$$$$");
            if(colDelimiter>-1){
                setCols([
                    <Col key="0" style={{textAlign: "justify", fontSize: "0.9rem"}} dangerouslySetInnerHTML={parseHTML(fullText.substring(0, colDelimiter))}></Col>,
                    <Col key="1" style={{textAlign: "justify", fontSize: "0.9rem"}} dangerouslySetInnerHTML={parseHTML(fullText.substring(colDelimiter+9))}></Col>
                ]);
            }else{
                setCols([<Col key="0" style={{textAlign: "justify", fontSize: "1rem", color: props.page.auto_text===1?"var(--bs-gray-500)":"inherit"}} dangerouslySetInnerHTML={parseHTML(fullText)}></Col>]);
            }
        }else{setCols([<Col key="0"></Col>])}
    },[pageText,props.editMode,props.query]);
    return <Container className={props.editMode?"bg-light":null} ref={containerRef} style={{position: "relative", width: "100%", minHeight: "100%", boxShadow: "0 5px 10px var(--bs-gray-300)", borderRadius: "3px", overflow: "hidden", padding: "60px 40px"}}>
        <Row className="mb-4">
            <Col style={{textAlign: "left"}}>{props.editMode?<><Button size="sm" onClick={async ()=>{
                await arachne.scan.save({id: props.page.scan_id, body_matter: bodyMatter===1?0:1, full_text: "", ocr_auto: "", ocr_auto_LENGTH: 0});
                setBodyMatter(bodyMatter===1?0:1);
                setPageText("");
            }}><FontAwesomeIcon icon={faTextSlash} /></Button> {bodyMatter===1?<Button className="ml-3"size="sm" onClick={()=>{setTextEdit(!textEdit)}}><FontAwesomeIcon icon={faPencil} /></Button>:null}</>:null}</Col>
            <Col dangerouslySetInnerHTML={parseHTML(props.ressource.opus)}></Col>
            <Col align="right">{isNaN(props.page.filename)?props.page.filename:parseInt(props.page.filename)}</Col>
        </Row>
            {bodyMatter?
                textEdit?
                <Form.Control className="pageTextEdit" style={{position: "absolute", height: "90%", width: "90%", border:textChangesSaved===1?"3px solid var(--bs-warning)":textChangesSaved===2?"3px solid var(--bs-success)":"inherit"}} as="textarea" value={pageText} onChange={e=>{
                    setPageText(e.target.value);
                    if(textChangesSaved!==1){setTextChangesSaved(1)};
                }} onBlur={async e=>{
                    if(textChangesSaved===1){
                        await arachne.scan.save({id: props.page.scan_id, full_text: e.target.value, ocr_auto: "", ocr_auto_LENGTH: 0});
                        setTextChangesSaved(2)
                    };
                }} />:
                pageText?<Row>{cols}</Row>:<Row><Col><i>Es ist noch kein Fließtext verfügbar.</i></Col></Row>
                :<Row><Col><i>Es gibt keinen lateinischen Text auf dieser Seite.</i></Col></Row>
            } 
    </Container>;
}
function NavBarBottom(props){
    const [gotoPageError, setGotoPageError] = useState(null);
    let items = [
        ["opera-Angaben", ()=>{props.setSideMenu("opera")}],
        ["Inhaltsverzeichnis", ()=>{props.setSideMenu("content")}]
    ];
    if(arachne.access("e_edit")){items.push(["Ressource bearbeiten", ()=>{props.setSideMenu("ressource")}])}
    if(arachne.access("l_edit")){items.push(["Scan-Seiten zuweisen", ()=>{props.setSideMenu("scans")}])}
    if(arachne.access("e_edit")){items.push(["Bearbeitungsmodus", ()=>{props.setEditMode()}])}
    if(props.fullTxt===true){
        items.push(["Nur Text", ()=>{props.setMode(2)}]);
        items.push(["Scans&Text", ()=>{props.setMode(1)}]);
        items.push(["Nur Scans", ()=>{props.setMode(0)}]);
    }
    const gotoLastResult = ()=>{
        if(props.queryResults.length===1){
            props.scrollPageIntoView(props.queryResults[props.queryResultIndex].id)
        }else if(props.queryResultIndex>0){
            props.setQueryResultIndex(props.queryResultIndex-1);
        }else{
            props.setQueryResultIndex(props.queryResults.length-1);
        }
    };
    const gotoNextResult = ()=>{
        if(props.queryResults.length===1){
            props.scrollPageIntoView(props.queryResults[props.queryResultIndex].id)
        }else if(props.queryResultIndex+1===props.queryResults.length){
            props.setQueryResultIndex(0)
        }else{
            props.setQueryResultIndex(props.queryResultIndex+1)
        }
    };
    return <Navbar fixed="bottom" bg="light">
        <Container fluid>
            <Navbar.Collapse className="justify-content-start">
                {props.fullTxt&&<Navbar.Text>
                    <Form.Control size="sm" type="text" id="searchInput" placeholder="Suche im Band..." value={props.query} onChange={e=>{props.setQuery(e.target.value)}} onKeyUp={e=>{if(e.keyCode===13){gotoNextResult()}}} />
                </Navbar.Text>}
                {props.fullTxt&&props.queryResults.length>0&&<Navbar.Text style={{marginLeft: "10px"}}>
                    <div id="navBox" style={{display: "flex", marginRight: "20px"}}>
                        <Button style={{borderRadius: "0.2rem 0 0 0.2rem"}} variant="secondary" size="sm" onClick={()=>{gotoLastResult()}}>&lt;</Button>
                        <div style={{borderBottom: "1px solid var(--bs-gray-600)", borderTop: "1px solid var(--bs-gray-600)", padding: "5px 10px", margin: "0"}}> <input style={{
                            width: "50px",
                            border: "none",
                            boxShadow: "none",
                            padding: 0,
                            margin: 0,
                            textAlign: "right",
                            background: "none",
                            color: " var(--bs-gray-600)",
                        }}
                        type="text" value={props.queryResultIndex+1} onChange={e=>{if(e.target.value!=""&&!isNaN(e.target.value)){props.setQueryResultIndex(parseInt(e.target.value)-1)}}} /> von {props.queryResults.length}</div>
                        <Button  style={{borderRadius: "0 0.2rem 0.2rem 0"}} variant="secondary" size="sm" onClick={()=>{gotoNextResult()}}>&gt;</Button>
                    </div>
                </Navbar.Text>}
                {props.fullTxt&&props.queryResults.length===0&&props.query.length>0&&<Navbar.Text style={{marginLeft: "10px"}}>
                    <small className="text-danger">Keine Stellen gefunden!</small>
                </Navbar.Text>}
            </Navbar.Collapse>
            <Navbar.Collapse>
                <Navbar.Text>
                    Seite <input type="text" id="currentPageField" 
                    onChange={()=>{setGotoPageError(null)}}
                    onKeyDown={e=>{
                        if(e.keyCode===13){
                            e.preventDefault();
                            const currentFilename = isNaN(e.target.value)?e.target.value:e.target.value.padStart(4, "0");
                            const currentPage = props.pages.find(p=>p.filename===currentFilename);
                            if(currentPage){
                                setGotoPageError(null);props.scrollPageIntoView (currentPage.scan_id)
                            }else{setGotoPageError(<span className="text-danger">Seite nicht gefunden!</span>)}
                        }
                    }} /> {gotoPageError}
                </Navbar.Text>

                <Navbar.Text>
                    
                </Navbar.Text>

            </Navbar.Collapse>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                    {props.mode===0&&<Form.Range style={{position: "relative", top: "7px", marginRight: "10px", width:"400px"}} min="45" max="95" value={props.zoom} onChange={e=>{props.setZoom(parseInt(e.target.value))}} className="slider" />}
                    {items.length>0?<ToolKit menuItems={items} />:null}
                </Navbar.Text>
            </Navbar.Collapse>
        </Container>
    </Navbar>;
}
export { storeEdition, getEditions, Edition, saveNewPageLocally };