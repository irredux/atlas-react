import { useEffect, useState, useRef } from "react";
import { Button, ButtonGroup, Dropdown, Table, Badge, Card, Col, Form, Container, Row, Modal, Accordion, Stack, Offcanvas, Tabs, Tab } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear, faPlusCircle, faMinusCircle, faTimesCircle, faPenToSquare, faTrashCan } from "@fortawesome/free-solid-svg-icons";

import { arachne } from "./../arachne.js";
import { AutoComplete, SearchInput, StatusButton, useIntersectionObserver, Message, sleep } from "./../elements.js"

function ZettelBox(props){
    const [currentZettel, setCurrentZettel] = useState("?")
    const [wideScreen, setWideScreen] = useState(true);
    const [splitView, setSplitView] = useState(false);
    const [splitViewURL, setSplitViewURL] = useState("");
    const setRessourceView = url => {
        if(!splitView){setSplitView(true)}
        setSplitViewURL(url)
    }
    useEffect(()=>{
        const resizeObserver = new ResizeObserver(entries=>{
            if(wideScreen===true&&entries[0].contentRect.width<1000){
                setWideScreen(false)
            }
            if(wideScreen===false&&entries[0].contentRect.width>=1000){
                setWideScreen(true)
            }
        });
        resizeObserver.observe(document.getElementById("cardBox"));
        return ()=>{if(document.getElementById("cardBox")){resizeObserver.unobserve(document.getElementById("cardBox"))}};
    },[wideScreen]);
    return <>
    <ImportZettel updateArticles={props.updateArticles} show={props.showImport} project={props.project} onReplay={e=>{
            if(e){props.updateSections()};
            props.setShowImport(false);
        }} />
    <Container fluid>
        <Row>
            <Col id="cardBox">
                <Stack gap={5}>
                    {props.filterLst.map(sId=><SectionCard setChangeZettelWork={props.setChangeZettelWork} updateSections={props.updateSections} wideScreen={wideScreen} setRessourceView={url=>{setRessourceView(url)}} project={props.project} sId={sId} key={sId} />)}
                </Stack>
            </Col>
            {splitView?<Col>
            <iframe src={splitViewURL} style={{position: "fixed", top:"0px", left: "50%", height: "100%", width: "50%"}}></iframe>
            <FontAwesomeIcon icon={faTimesCircle} style={{color: "var(--bs-danger)", fontSize:"24px", zIndex:"99999999", position: "fixed", top: "80px", right: "30px"}} onClick={()=>{setSplitView(false)}} />
            </Col>:null}
        </Row>
    </Container>
    {<MenuLeft setLimitFilterResults={v=>{props.setLimitFilterResults(v)}} setActiveTabKey={props.setSectionsMenuActiveTabKey} activeTabKey={props.sectionsMenuActiveTabKey} project={props.project} filterTags={props.filterTags} setFilterTags={newTags=>{props.setFilterTags(newTags)}} tagLst={props.tagLst} show={props.sectionsMenuActiveTabKey!=null} onHide={()=>{props.setSectionsMenuActiveTabKey(null)}} updateSections={()=>{props.updateSections()}} />}
    <div style={{fontSize: "95%", position: "fixed", display: "flex", justifyContent:"space-between", bottom: "0px", left: 0, right: 0, backgroundColor: "#f8f9fa", padding: "5px 20px"}}>
        <div style={{display: "flex", justifyContent:"space-around", gap: "10px"}}>{props.filterTags&&props.filterTags.length>0?props.filterTags.map(t=><div style={{cursor: "default", backgroundColor: t.exclude?"rgb(248,248,248)":t.color, fontWeight: "bold", color: t.exclude?t.color:"rgba(255,255,255, 0.8)", border: `1px solid ${t.color}`, margin: "1px 2px", padding: "1px 10px 1px 13px", borderRadius: "18px"}}>{t.name}</div>):<div style={{color: "gray"}}><small><i>kein Filter</i></small></div>}</div>
        <div><input style={{background: "none", border: "none", outline: "none", width: "60px", textAlign: "right"}} id="editor_zettel_current_active" value={currentZettel} onChange={e=>{setCurrentZettel(e.target.value)}} onKeyUp={e=>{
            if(e.keyCode===13){
                const els = document.getElementsByClassName("editor_zettel_card");
                if(els[parseInt(currentZettel)-1]){els[parseInt(currentZettel)-1].scrollIntoView({behavior: "auto", block: "center"})}
            }
        }} /> / {props.filterLst.length}</div>
    </div>
    </>;
}
function MenuLeft(props){
    const [tags, setTags] = useState([]);
    const [renameId, setRenameId] = useState(0);
    const [renameName, setRenameName] = useState("");

    useEffect(()=>{
        if(props.show){loadTags()}
    }, [props.show]);
    const loadTags = async ()=>{
        const allTags = await arachne.tags.get({project_id: props.project.id});
        let enhancedTags = []
        for(let tag of allTags){
            const tagCount = await arachne.tag_lnks.get({tag_id: tag.id}, {count: true});
            tag.sections = tagCount[0].count;
            enhancedTags.push(tag);
        }
        setTags(enhancedTags);
    };
    const deleteTag = async tag=>{
        if(window.confirm(`Soll das Schlagwort '${tag.name}' wirklich gelöscht werden? Es wird aus allen Stellen entfernt!`)){
            const oldTagLnks = await arachne.tag_lnks.get({tag_id: tag.id}, {select: ["id"]});
            await arachne.tag_lnks.delete(oldTagLnks.map(t=>t.id));
            await arachne.tags.delete(tag.id);
            await loadTags();
        }
    };
    return <Offcanvas show={props.show} backdrop={false} scroll={true} onHide={()=>{props.onHide()}}>
    <Offcanvas.Header closeButton>
      <Offcanvas.Title></Offcanvas.Title>
    </Offcanvas.Header>
    <Offcanvas.Body>
        <Message show={renameId>0?true:false} title="Schlagwort umbenennen" msg="Geben Sie einen neuen Namen für das Schlagwort ein:" input={renameName} onReplay={async e=>{
            const tagNames = tags.map(t=>t.name.toLowerCase());
            if(e!=-1&&e!=""){
                if(tagNames.includes(e.toLowerCase())){
                    alert(`Der Name '${e}' wird bereits verwendet!`)
                }else{
                    await arachne.tags.save({id: renameId, name: e});
                    await loadTags();
                }
            };
            setRenameId(0);
        }} />
        <Tabs defaultActiveKey="filter" className="mb-3" activeKey={props.activeTabKey} onSelect={k=>{props.setActiveTabKey(k)}}>
            <Tab eventKey="filter" title="Filter">
                <Container>
                    <Row className="mb-3"><Col><FilterBox filterTags={props.filterTags} setFilterTags={newTags=>{props.setFilterTags(newTags)}} project={props.project} /></Col></Row>
                    <Row className="mb-4"><Col></Col><Col><Button style={{width: "100%"}} onClick={()=>{props.updateSections()}}>Zettel filtern</Button></Col></Row>
                </Container>
            </Tab>
            <Tab eventKey="tags" title="Schlagworte">
                <Table>
                    <tbody>
                        {tags.map(t=><tr key={t.id}>
                            <td><Form.Control
                                style={{display: "inline"}}
                                size="sm"
                                type="color"
                                id="exampleColorInput"
                                defaultValue={t.color}
                                title="Choose your color"
                                onChange={async e=>{await arachne.tags.save({id: t.id, color: e.target.value});await loadTags()}}
                            /></td>
                            <td><b style={{marginLeft: "10px", color: t.color, cursor: "pointer"}} onClick={()=>{props.setFilterTags([t]);props.setActiveTabKey("filter")}}>{t.name}</b></td>
                            <td>{t.sections}</td>
                            <td><FontAwesomeIcon icon={faPenToSquare} style={{cursor: "pointer", color: "var(--bs-primary)"}} onClick={()=>{setRenameName(t.name);setRenameId(t.id)}} /></td>
                            <td><FontAwesomeIcon icon={faTrashCan} style={{cursor: "pointer", color: "var(--bs-primary)"}} onClick={()=>{deleteTag(t)}} /></td>
                        </tr>)}
                    </tbody>
                </Table>
            </Tab>
        </Tabs>
    </Offcanvas.Body>
  </Offcanvas>;
}
function SectionCard(props){
    const [ressources, setRessources] = useState([]);
    const [showComment, setShowComment] = useState(false);
    const [comment, setComment] = useState("");
    const [img, setImg] = useState(null);
    const [reference, setReference] = useState("");
    const [text, setText] = useState("");
    const [verso, setVerso] = useState(false);
    const [tags, setTags] = useState([]);
    const [unusedTags, setUnusedTags] = useState([]);
    const [section, setSection] = useState({});
    const [isVisible, setIsVisible] = useState(false);

    const refImg = useRef();
    const centerSection = () =>{document.getElementById("s_"+props.sId).scrollIntoView({block: "center"})};
    useIntersectionObserver({
      target: refImg,
      onIntersect: ([{ isIntersecting }], observerElement) => {
        if (isIntersecting) {
          setIsVisible(true);
          observerElement.unobserve(refImg.current);
        }
      }
    });
    useEffect(()=>{
        if(isVisible){
            loadSection();
            loadTags();
        }else{
            setImg(null);
            setTags([]);
        }
    },[isVisible]);
    useEffect(()=>{if(isVisible){setImg(arachne.url+section.img+`${verso?"v":""}.jpg`)}}, [verso]);
    const loadSection = async () =>{
        const newSection = await arachne.sections.get({id: props.sId});
        if(newSection[0].img){setImg(arachne.url+newSection[0].img+`${verso?"v":""}.jpg`)}
        else{setImg(null)}
        setReference(newSection[0].ref);
        setText(newSection[0].text);
        setComment(newSection[0].comment);
        if(newSection[0].comment!=null&&newSection[0].comment!=""){setShowComment(true)}
        setSection(newSection[0]);
        // load ressources
        setRessources(await arachne.edition.get({work_id: newSection[0].work_id}, {select: ["id", "label", "url"]}));
    };
    const loadTags =  async()=>{
        let cAllTags = await arachne.tags.get({project_id: props.project.id});
        const cTagLnks = await arachne.tag_lnks.get({section_id: props.sId});
        let newTags = [];
        for(const cTagLnk of cTagLnks){
            const newTagIndex = cAllTags.findIndex(t=>t.id===cTagLnk.tag_id);
            if(newTagIndex===-1){throw "ERROR! CANNOT FIND TAG INDEX!"}
            else{
                newTags.push(cAllTags[newTagIndex]);
                cAllTags.splice(newTagIndex,1);
            }
        }
        setUnusedTags(cAllTags);
        setTags(newTags);
    };
    const openZettelDB = () =>{
        localStorage.setItem(arachne.project_name+"_searchBox_zettel",`[[{"id":0,"c":"id","o":"=","v":"${section.zettel_id}"}],1,["id"]]`);
        window.open(`/static/index.html?project=${arachne.project_name}&app=db&site=zettel`);
    }//style={{ width: '80%', maxWidth: "600px", margin: "auto" }}>
    return <Card ref={refImg} className={props.wideScreen?"largeScreen editor_zettel_card":"editor_zettel_card"} id={"s_"+props.sId} style={{ width: "80%", margin: "auto" }} onFocus={e=>{
        const el = document.getElementById("editor_zettel_current_active");
        if(el){
            const allCards = document.getElementsByClassName("editor_zettel_card");
            for(let i = 0; i<allCards.length;i++){
                if(allCards[i].id==="s_"+props.sId){
                    el.value = i+1;
                    break;
                }
            }
        }
        }}>
        {img?<Card.Img style={{aspectRatio: "10/7"}} variant="top" src={img} />:null}
        <Card.Body className="editor_zettel_CardBox">
            <Row className="mb-3" style={{marginBottom: "47px"}}><Col><Form.Control placeholder="Zitiertitel..." onFocus={()=>{centerSection()}} size="sm" type="text" value={reference?reference:""} onChange={e=>{setReference(e.target.value)}} onBlur={async e=>{await arachne.sections.save({id: props.sId, ref: e.target.value})}} /></Col></Row>
            <Row className="mb-3">
                <Col>
                    <Form.Control placeholder="Text der Stelle..." onFocus={()=>{centerSection()}} as="textarea" rows={3} style={{minHeight: "120px",fontSize: "95%"}} value={text?text:""} onChange={e=>{setText(e.target.value)}} onBlur={async e=>{await arachne.sections.save({id: props.sId, text: e.target.value})}} />
                    </Col>
            </Row>
            {showComment?<Row className="mb-3">
                <Col><Form.Control className="mt-2" placeholder="Schreiben Sie einen Kommentar..." onFocus={()=>{centerSection()}} as="textarea" rows={3} style={{fontSize: "95%"}} value={comment?comment:""} onChange={e=>{setComment(e.target.value)}} onBlur={async e=>{await arachne.sections.save({id: props.sId, comment: e.target.value})}} /></Col>
            </Row>:null}
            <Row style={{marginBottom: "47px"}}>
                <Col>
            <TagBox isVisible={isVisible} loadTags={async ()=>{await loadTags()}} tags={tags} project={props.project} s={section} unusedTags={unusedTags} centerSection={()=>{centerSection()}} />
            </Col>
            </Row>
            <div style={{display: "flex", justifyContent: "flex-end", gap: "15px", margin: "0 0.4rem 0 0.4rem", position: "absolute",  bottom: "10px", left: "10px", right: "10px"}}>
            <RessourcesButtons setRessourceView={url=>{props.setRessourceView(url)}} ressources={ressources} />
            <Dropdown>
                <Dropdown.Toggle tabIndex="-1" variant="outline-secondary">
                    <FontAwesomeIcon icon={faGear} />
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={()=>{openZettelDB()}}>Zettel bearbeiten</Dropdown.Item>
                    <Dropdown.Item onClick={()=>{setVerso(!verso)}}>Zettel drehen</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={async()=>{
                        const acWork = await arachne.work.get({id: section.work_id}, {select: ["ac_web"]})
                        props.setChangeZettelWork({value: acWork[0].ac_web, id:section.work_id, section_id: props.sId});
                    }}>verknpft. Werk ändern</Dropdown.Item>
                    <Dropdown.Item onClick={()=>{setShowComment(true)}}>Kommentar hinzufügen</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={async()=>{
                        let vals = await arachne.sections.get({id: props.sId});
                        delete vals.id;
                        const newId = await arachne.sections.save(vals);
                        props.updateSections(true);
                        await sleep(300);
                        const el = document.getElementById(`s_${newId}`);
                        if(el){el.scrollIntoView({behavior: "auto", block: "center"})}
                    }}>Stelle duplizieren</Dropdown.Item>
                    <Dropdown.Item onClick={async ()=>{if(window.confirm("Soll die Stelle aus dem Projekt entfernt werden? Alle Änderungen gehen verloren.")){await arachne.sections.delete(props.sId);props.updateSections()}}} className="text-danger">Stelle löschen</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            {/*<DropdownButton tabIndex="-1" variant="outline-secondary" id="dropdown-basic-button" title={<FontAwesomeIcon icon={faGear} />}>
                            
                        </DropdownButton>*/}
            </div>
        </Card.Body>
    </Card>;
}
function RessourcesButtons(props){
    const [button, setButton] = useState(null);
    const [selected, setSelected] = useState(null);
    const openRessource = (url) => {
        console.log(url);
        switch(arachne.options.openExternally){
            case 0:
                props.setRessourceView(url);
                break;
            case 1:
                window.open(url);
                break;
            case 2:
                arachne.sendEcho({type: "edition", url: url});
                break;
            default:
                props.setRessourceView(url);
        }
    }
    useEffect(()=>{
        if(props.ressources.length===0){setButton(null)}
        else if(props.ressources.length===1){setButton(<Button tabIndex="-1" size="sm" variant="outline-dark" onClick={()=>{openRessource(props.ressources[0].url===null||props.ressources[0].url===""?`/static/index.html?project=${arachne.project_name}&app=argos&site=edition&id=${props.ressources[0].id}`:props.ressources[0].url)}}>{props.ressources[0].label}</Button>)}
        else{
            setSelected(props.ressources[0]);
        }
    }, [props.ressources]);
    useEffect(()=>{
        if(selected!=null){
            setButton(<Dropdown as={ButtonGroup}>
                <Button size="sm" variant="outline-dark" style={{width: "100%"}} onClick={()=>{openRessource(selected.url===null||selected.url===""?`/static/index.html?project=${arachne.project_name}&app=argos&site=edition&id=${selected.id}`:selected.url)}}>{selected.label}</Button>
                <Dropdown.Toggle split size="sm" variant="dark" id="dropdown-split-basic" />
                <Dropdown.Menu>
                    {props.ressources.map(r=><Dropdown.Item key={r.id} onClick={()=>{setSelected(r)}}>{r.label}</Dropdown.Item>)}
                </Dropdown.Menu>
            </Dropdown>);
        }
    }, [selected])
    return button;
}
function FilterBox(props){
    const [inputMode, setInputMode] = useState(0); // 0 = normal; 1 = remove; 2 = exclude
    useEffect(()=>{
    },[props.filterTags]);
    const removeTag = t => {props.setFilterTags(props.filterTags.filter(ft=>ft.id!==t.id))}
    const addTag = async tName => {
        let newTags = structuredClone(props.filterTags); // deep copy
        const newTag = await arachne.tags.get({project_id: props.project.id, name: tName});
        if(inputMode===2){newTag[0].exclude=true}
        newTags.push(newTag[0])
        props.setFilterTags(newTags);
    }
    let borderStyle = "1px solid #ced4da"
    let backgroundColor = null
    if(inputMode===1){
        borderStyle = "1px solid var(--bs-yellow)"
        backgroundColor = "#ffecb1"
    }else if(inputMode===2){
        borderStyle = "1px solid var(--bs-teal)"
        backgroundColor = "#e2f7ed"
    }
    return <div className="mt-2" id="filter_box" style={{border: borderStyle, backgroundColor: backgroundColor,padding: "2px 5px", display: "flex", alignContent: "flex-start", alignItems: "flex-start", flexWrap: "wrap", minHeight: "220px", borderRadius: "0.25rem", fontSize: "100%"}} onClick={()=>{
        let tb = document.getElementById("filter_box");
        tb.children[tb.children.length-1].children[0].focus()
        }}>
            {props.filterTags.map(t=><FilterTag key={t.id} t={t} removeTag={t=>{removeTag(t)}} />)}
            <FilterBoxInput inputMode={inputMode} setInputMode={v=>{setInputMode(v)}} tags={props.filterTags} addTag={addTag} removeTag={t=>{removeTag(t)}} project={props.project} />
    </div>;
}
function FilterBoxInput(props){
    const [inputValue, setInputValue] = useState("");
    const [acTags, setACTags] = useState([]);
    const [currentFocus, setCurrentFocus] = useState(-1);
    const loadACTags = async ()=>{
        if(props.inputMode===0||props.inputMode===2){
            const currentTags = props.tags.map(t=>t.name);
            const newACTags = await arachne.tags.get({project_id: props.project.id});
            let currentACTags = newACTags.filter(t=>!currentTags.includes(t.name));
            if(inputValue===""){setACTags(currentACTags)}
            else{setACTags(currentACTags.filter(t=>t.name.toLowerCase().indexOf(inputValue.toLowerCase())>-1))}
        }else{
            if(inputValue===""){setACTags(props.tags)}
            else{setACTags(props.tags.filter(t=>t.name.toLowerCase().indexOf(inputValue.toLowerCase())>-1))}
        }
        setCurrentFocus(-1);
    };
    useEffect(()=>{
        if(acTags.length>0||inputValue!==""){loadACTags()}
    }, [props.tags,inputValue,props.inputMode]);
    const onKeyDown = e=>{
        if(e.keyCode===13&&acTags.length===1){
            e.preventDefault();
            createNewTag(acTags[0].name);
        }else if(e.keyCode===27&&acTags.length>0){ // esc
            e.preventDefault();
            setACTags([]);
        }else if(e.keyCode===190&&e.target.value===""){ // .
            e.preventDefault();
            if(props.inputMode!==2){props.setInputMode(2)}
            else{props.setInputMode(0)}
        }else if(e.keyCode===173&&e.target.value===""){ // -
            e.preventDefault();
            if(props.inputMode!==1){props.setInputMode(1)}
            else{props.setInputMode(0)}
        }else if (e.keyCode===40) { //down
            if(currentFocus+1 >= acTags.length){setCurrentFocus(0)}
            else{setCurrentFocus(currentFocus+1)}
        } else if (e.keyCode===38) { //up
            if (currentFocus-1 < 0){setCurrentFocus(acTags.length - 1)}
            else{setCurrentFocus(currentFocus-1)}
        } else if (e.keyCode===13) {
            e.preventDefault();
            if (currentFocus > -1) {
                createNewTag(acTags[currentFocus].name);
            } else if(e.target.value!=="") {
                createNewTag(e.target.value);
            }
        }
    };
    const createNewTag = async (newTag, exitInput=false) =>{
        if(props.inputMode===0||props.inputMode===2){ // save new tag
            if(!props.tags.find(t=>t.name.toLowerCase()===newTag.toLowerCase())){
                await props.addTag(newTag);
                if(props.inputMode===2){props.setInputMode(0)}
            }
        }else{ // remove existing tag
            const existingTag = props.tags.find(t=>t.name.toLowerCase()===newTag.toLowerCase());
            if(existingTag){
                props.removeTag(existingTag);
                props.setInputMode(0);
            }
        }
        setInputValue("");
        if(exitInput){setACTags([])}
        else{loadACTags()}
    };
    let borderStyle = "#ced4da"
    let backgroundColor = null
    if(props.inputMode===1){
        borderStyle = "var(--bs-yellow)"
        backgroundColor = "#ffecb1"
    }else if(props.inputMode===2){
        borderStyle = "var(--bs-teal)"
        backgroundColor = "#e2f7ed"
    }
    return <div style={{width:"300px", position: "relative", display: "inline-block"}}>
        <input value={inputValue} onChange={e=>{setInputValue(e.target.value)}} onFocus={()=>{loadACTags()}} onBlur={()=>{setInputValue("");setACTags([]);if(props.inputMode>0){props.setInputMode(0)}}} type="text" style={{background: "none", outline: "none", border: "none", margin: "1px 2px", padding: "4px 10px"}} onKeyDown={e=>{onKeyDown(e)}} />
    {acTags.length>0&&<div className="autocomplete-items" style={{borderColor: borderStyle}}>
        {acTags.map((t,i)=><div key={t.id} style={{backgroundColor: backgroundColor, borderColor: borderStyle}} onMouseDown={async ()=>{await createNewTag(t.name, true)}} className={i===currentFocus?"autocomplete-active":""}>{t.name}</div>)}
    </div>}
    </div>;
}
function FilterTag(props){
    return <div style={{cursor: "default", backgroundColor: props.t.exclude?"rgb(248,248,248)":props.t.color, fontWeight: "bold", color: props.t.exclude?props.t.color:"rgba(255,255,255, 0.8)", border: `1px solid ${props.t.color}`, margin: "1px 2px", padding: "3px 15px 3px 18px", borderRadius: "18px"}}>
        {props.t.name}
        <FontAwesomeIcon onClick={async e=>{
            e.stopPropagation();
            props.removeTag(props.t);
            }} style={{cursor: "pointer", margin: "4px 0 0 9px"}} icon={faMinusCircle} />
    </div>;
}
function TagBox(props){
    const [inputMode, setInputMode] = useState(true);
    return <div className="mt-2" id={"tagBox_"+props.s.id} style={{border: inputMode?"1px solid #ced4da":"1px solid var(--bs-yellow)", backgroundColor: inputMode?null:"#ffecb1",padding: "2px 5px", display: "flex", alignItems: "flex-start", flexWrap: "wrap", minHeight: "110px", borderRadius: "0.25rem", fontSize: "100%"}} onClick={e=>{
        const inputEl = e.target.querySelector("input")
        if(inputEl){inputEl.focus()};
        }}>
        {props.isVisible&&props.tags.map(t=><Tag key={t.id} t={t} sectionId={props.s.id} loadTags={async ()=>{await props.loadTags()}} />)}
        <TagBoxInput inputMode={inputMode} setInputMode={v=>{setInputMode(!inputMode)}} project={props.project} tags={props.tags} loadTags={async ()=>{await props.loadTags()}} sectionId={props.s.id} centerSection={()=>{props.centerSection()}} />
    </div>;
}
function TagBoxInput(props){
    const [hasFocus, setHasFocus] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [acTags, setACTags] = useState([]);
    const [currentFocus, setCurrentFocus] = useState(-1);
    const loadACTags = async (iValue)=>{
        if(props.inputMode){
            const currentTags = props.tags.map(t=>t.name);
            const newACTags = await arachne.tags.get({project_id: props.project.id});
            let currentACTags = newACTags.filter(t=>!currentTags.includes(t.name));
            if(iValue===""){setACTags(currentACTags.sort((a,b)=>a.name.toLowerCase()>b.name.toLowerCase()))}
            else{setACTags(currentACTags.filter(t=>t.name.toLowerCase().indexOf(iValue.toLowerCase())>-1).sort((a,b)=>a.name.toLowerCase()>b.name.toLowerCase()))}
        }else{
            if(iValue===""){setACTags(props.tags.sort((a,b)=>a.name.toLowerCase()>b.name.toLowerCase()))}
            else{setACTags(props.tags.filter(t=>t.name.toLowerCase().indexOf(iValue.toLowerCase())>-1).sort((a,b)=>a.name.toLowerCase()>b.name.toLowerCase()))}
        }
        setCurrentFocus(-1);
    };
    useEffect(()=>{
        if(hasFocus){loadACTags(inputValue)};
        //if(acTags.length>0||inputValue!==""){loadACTags(inputValue)}
    }, [hasFocus,props.tags,inputValue,props.inputMode]);
    const onKeyDown = e=>{
        if(e.keyCode===13&&acTags.length===1){
            e.preventDefault();
            createNewTag(acTags[0].name);
        }else if(e.keyCode===27){ // esc
            setACTags([]);
        }else if(e.keyCode===190&&e.target.value===""){ // .
            e.preventDefault();
        }else if(e.keyCode===173&&e.target.value===""){ // -
            e.preventDefault();
            props.setInputMode();
        }else if (e.keyCode===40) { //down
            if(currentFocus+1 >= acTags.length){setCurrentFocus(0)}
            else{setCurrentFocus(currentFocus+1)}
        } else if (e.keyCode===38) { //up
            if (currentFocus-1 < 0){setCurrentFocus(acTags.length - 1)}
            else{setCurrentFocus(currentFocus-1)}
        } else if (e.keyCode===13) {
            e.preventDefault();
            if (currentFocus > -1) {
                createNewTag(acTags[currentFocus].name);
            } else if(e.target.value!=="") {
                createNewTag(e.target.value);
            }
        }
    };
    const createNewTag = async (newTag, exitInput=false) =>{ //also: removes tag!
        if(props.inputMode){ // save new tag
            if(!props.tags.find(t=>t.name.toLowerCase()===newTag.toLowerCase())){
                const inTags = acTags.find(t=>t.name.toLowerCase()===newTag.toLowerCase());
                let tagId = 0;
                if(inTags){ // create new tag_lnk
                    tagId = inTags.id;
                    await arachne.tag_lnks.save({tag_id: inTags.id, section_id: props.sectionId, project_id: props.project.id});
                }else{ // create new
                    const newTagId = await arachne.tags.save({
                        name: newTag,
                        color: colorPicker(),
                        project_id: props.project.id,
                        user_id: props.project.user_id,
                        shared_id: props.project.shared_id,
                    });
                    tagId = newTagId;
                    await arachne.tag_lnks.save({tag_id: newTagId, section_id: props.sectionId, project_id: props.project.id});
                }
                const articleWithTag = await arachne.tag_lnks.search([{c: "tag_id", o: "=", v: tagId}, {c: "article_id", o: ">", v: 0}],{select: ["article_id"]})
                if(articleWithTag.length>0){await arachne.sections.save({id: props.sectionId, article_id: articleWithTag[0].article_id})}
                await props.loadTags();
            }
        }else{ // remove existing tag
            const existingTag = props.tags.find(t=>t.name.toLowerCase()===newTag.toLowerCase());
            if(existingTag){
                const currentTagLnk = await arachne.tag_lnks.get({tag_id: existingTag.id, section_id: props.sectionId});
                await arachne.tag_lnks.delete(currentTagLnk[0].id)
                const articleWithTag = await arachne.tag_lnks.search([{c: "tag_id", o: "=", v: existingTag.id}, {c: "article_id", o: ">", v: 0}],{select: ["article_id"]})
                if(articleWithTag.length>0){await arachne.sections.save({id: props.sectionId, article_id: null})}
                await props.loadTags();
                props.setInputMode();
            }
        }
        setInputValue("");
        setACTags([]);
        /*
        if(exitInput){}
        else{
            setTimeout(()=>{loadACTags("")}, 500);
            //sleep(1000).then(()=>{})
        }*/
    };
    return <div style={{width:"300px", position: "relative", display: "inline-block"}}>
        <input value={inputValue} onChange={e=>{setInputValue(e.target.value)}} onFocus={()=>{setHasFocus(true);props.centerSection()}} onBlur={()=>{setHasFocus(false);setInputValue("");setACTags([]);if(!props.inputMode){props.setInputMode()}}} type="text" style={{background: "none", outline: "none", border: "none", margin: "1px 2px", padding: "4px 10px"}} onKeyDown={e=>{onKeyDown(e)}} />
    {acTags.length>0&&<div className="autocomplete-items" style={{borderColor: props.inputMode?null:"var(--bs-yellow)"}}>
        {acTags.map((t,i)=><div key={t.id} style={{backgroundColor: props.inputMode?null:"#ffecb1", borderColor: props.inputMode?null:"var(--bs-yellow)"}} onMouseDown={async ()=>{await createNewTag(t.name, true)}} className={i===currentFocus?"autocomplete-active":""}>{t.name}</div>)}
    </div>}
    </div>;
}
function Tag(props){
    return <div style={{cursor: "default", backgroundColor: props.t.color, fontWeight: "bold", color: "rgba(255,255,255, 0.8)", margin: "1px 2px", padding: "3px 15px 3px 18px", borderRadius: "18px"}}>
        {props.t.name}
        <FontAwesomeIcon onClick={async e=>{
            e.stopPropagation();
            const cTagLnk = await arachne.tag_lnks.get({tag_id: props.t.id, section_id: props.sectionId}, {select: ["id"]});
            await arachne.tag_lnks.delete(cTagLnk[0].id);
            await props.loadTags();
            }} style={{cursor: "pointer", margin: "4px 0 0 9px"}} icon={faMinusCircle} />
    </div>;
}
function ImportZettel(props){
    const [mode, setMode] = useState("lemma")
    const [lemma, setLemma] =useState("");
    const [SF, setSF] = useState(null);
    const [lemmaId, setLemmaId] = useState(null);
    const [lemmaZettelCount, setLemmaZettelCount] = useState(0);
    const [zettelZettelCount, setZettelZettelCount] = useState(0);
    const [searchFields, setSearchFields] = useState([]);
    const [nextID, setNextID] = useState(1);
    const [importZettelText, setImportZettelText] = useState(false);
    useEffect(()=>{
        const fetchData = async () => {
            if(lemmaId){
                const count = await arachne.zettel.get({lemma_id: lemmaId}, {count: true});
                setLemmaZettelCount(count[0].count);
            }else{setLemmaZettelCount(0)}
        };
        fetchData();
    }, [lemmaId]);

    const searchOptions = [
        ["lemma", "Wort"],
        ["type", "Typ"],
        ["id", "ID"],
        ["ac_web", "Werk"],
        ["date_type", "Datum-Typ"],
        ["date_own", "eigenes Sortierdatum"],
        ["date_own_display", "eigenes Anzeigedatum"],
    ];
    const removeSearchFields = id => { setSearchFields(searchFields.filter(s => s.id!==id)) };
    const addSearchFields = () => {
        let nSearchFields = searchFields;
        nSearchFields.push({
            id: nextID,
            c: searchOptions[0][0],
            o: "=",
            v: ""
        });
        setNextID(nextID+1);
        setSearchFields(nSearchFields);
    };
    const sendQuery = async () => {
        let exportSF = [];
        for(const sF of searchFields){
            if(sF.v !== ""){
                exportSF.push({
                    c: sF.c,
                    o: sF.o,
                    v: sF.v
                });
            }
        }

        if(exportSF.length > 0){
            setSF(exportSF);
            const count = await arachne.zettel.search(exportSF, {count:true});
            setZettelZettelCount(count[0].count);
        } else {setZettelZettelCount(0)}
    };
    let cSF = [];
    for(const sF of searchFields){
        cSF.push(<SearchInput searchOptions={searchOptions} removeSearchFields={id => {removeSearchFields(id)}} itemId={sF.id} key={sF.id} c={sF.c} o={sF.o} v={sF.v} clickButton={sendQuery} changeItem={item=>{
            setSearchFields(searchFields.map(s=>{if(s.id===item.id){return item}else{return s}}));
        }} />);
    }

    return <Modal show={props.show} size="lg" onHide={()=>{props.onReplay(false)}} backdrop="static">
        <Modal.Header closeButton>
            <Modal.Title>Zettel importieren</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Container>
                <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0" onClick={()=>{setMode("lemma")}}>
                        <Accordion.Header>Wort-Liste</Accordion.Header>
                        <Accordion.Body>
                        <AutoComplete style={{width: "100%"}} onChange={(value, id)=>{setLemmaId(id);setLemma(value)}} value={lemma} tbl="lemma" searchCol="lemma" returnCol="lemma_ac" />
                        {lemmaZettelCount>0?<Badge pill bg="success" className="mt-2">{lemmaZettelCount} Zettel gefunden.</Badge>:null}
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1" onClick={()=>{setMode("zettel")}}>
                        <Accordion.Header>Zettel-Datenbank</Accordion.Header>
                        <Accordion.Body>
                        <div className="searchBox d-flex flex-wrap">
                            {cSF}
                            <FontAwesomeIcon color="LightGray" icon={faPlusCircle} style={{color: "var(--mainColor)", position: "relative", top: "6px", fontSize: "25px", cursor: "pointer"}}  onClick={() => {addSearchFields()}}
                            />
                        </div>
                        <div style={{textAlign: "right"}}>{zettelZettelCount>0?<Badge pill bg="success" className="mt-2" style={{marginRight: "15px"}}>{zettelZettelCount} Zettel gefunden.</Badge>:null}<Button variant="light" onClick={()=>{sendQuery()}}>Suchen</Button></div>
                        </Accordion.Body>
                    </Accordion.Item>
                    </Accordion>
            </Container>
        </Modal.Body>
        <Modal.Footer>
            <Form.Check
                style={{position: "absolute", left: "30px"}}
                type="switch"
                id="custom-switch"
                label="Zettel-Text importieren (experimentell)"
                onChange={e=>{setImportZettelText(e.target.checked)}}
            />
            <Button variant="secondary" onClick={()=>{props.onReplay(false)}}>Abbrechen</Button>
            <StatusButton variant="primary" onClick={async(progress)=>{
                const select = ["id", "ac_web", "img_path", "date_sort", "txt", "type", "work_id", "ocr_text_corr", "ocr_text"];
                let zettelLst = [];
                progress(0);
                if(mode==="lemma"){
                    zettelLst=await arachne.zettel.get({lemma_id: lemmaId}, {select: select});
                    const lemmaArticle=await arachne.article.get({project_id: props.project.id, type: 900});
                    console.log(lemmaArticle);
                    if(lemmaArticle.length===0){
                        await arachne.article.save({name: lemma.replace(/<.*?>/g, ""), project_id: props.project.id, type: 900})
                        const newArticles = await arachne.article.get({project_id: props.project.id});
                        props.updateArticles(newArticles);
                    }
                }
                else{zettelLst=await arachne.zettel.search(SF, {select:select})}
                let tagObj = {};
                const currentTags = await arachne.tags.get({project_id: props.project.id});
                currentTags.forEach(t=>{tagObj[t.name]=t.id});
                let zettel_save_lst = []
                let tag_lnks_save_lst = []
                progress(25);
                for(const z of zettelLst){
                    const cmnts = await arachne.comment.get({zettel_id: z.id}, {select: ["comment", "user"]});
                    zettel_save_lst.push({
                        zettel_id: z.id,
                        project_id: props.project.id,
                        ref: z.ac_web,
                        text: z.txt?z.txt:(z.ocr_text_corr&&importZettelText)?z.ocr_text_corr:(z.ocr_text&&importZettelText)?z.ocr_text:null,
                        comment: cmnts.length>0?cmnts.map(c=>`${c.user}:\n${c.comment}\n`).join("\n\n"):null,
                        date_sort: z.date_sort===0?9999:z.date_sort,
                        img: z.img_path,
                        user_id: props.project.user_id,
                        shared_id: props.project.shared_id,
                        work_id: z.work_id,
                    });
                    let typeTag = "unbekannter Zetteltyp";
                    if(z.type===1){typeTag="verzettelt"}
                    else if(z.type===2){typeTag="Exzerpt"}
                    else if(z.type===3){typeTag="Index"}
                    else if(z.type===6){typeTag="Index (unkl. Werk)"}
                    else if(z.type===7){typeTag="Notiz"}
                    if(typeTag){
                        if(!Object.keys(tagObj).includes(typeTag)){
                            const newTagId = await arachne.tags.save({
                                name: typeTag,
                                color: colorPicker(),
                                project_id: props.project.id,
                                user_id: props.project.user_id,
                                shared_id: props.project.shared_id,
                            });
                            tagObj[typeTag] = newTagId;
                        }
                        tag_lnks_save_lst.push({
                            tag_id: tagObj[typeTag],
                            //section_id: newSecId,
                            user_id: props.project.user_id,
                            shared_id: props.project.shared_id,
                            project_id: props.project.id,
                        });
                    }
                }
                progress(50);
                const newSecIds = await arachne.sections.save(zettel_save_lst);
                tag_lnks_save_lst = tag_lnks_save_lst.map((t,i)=>{
                    t.section_id = newSecIds[i];
                    return t;
                });
                progress(75);
                await arachne.tag_lnks.save(tag_lnks_save_lst);
                progress(100);
                props.onReplay(true);
            }} disabled={(mode==="lemma"&&lemmaZettelCount>0)||(mode==="zettel"&&zettelZettelCount>0)?false:true} value="Zettel laden" />
        </Modal.Footer>
    </Modal>;
}
function colorPicker(){
    const colors = [
        "#023FA5","#7D87A5","#BEC1D4","#D6BCC0","#BB7784","#8E063B",
        "#4A6FE3","#8595E1","#B5BBE3","#E6AFB9","#E07B91","#D33F6A",
        "#11C638","#8DD593","#C6DEC7","#EAD3C6","#F0B98D","#EF9708",
        "#0FCFC0","#9CDED6","#D5EAE7","#F3E1EB","#F6C4E1","#F79CD4",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}
export { ZettelBox, RessourcesButtons, TagBox };