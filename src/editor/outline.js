import { useState, useEffect } from "react";
import { Alert, Spinner, Modal, Card, Col, Container, Form, Row, FormControl, InputGroup, Dropdown, DropdownButton } from "react-bootstrap";
import { arachne } from "./../arachne";
import { parseHTML } from "./../elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { RessourcesButtons, TagBox } from "./zettel.js";

const defaultArticleHeadFields = [
    [900, "LEMMA"],
    [901, "VEL"],
    [902, "GRAMMATIK"],
    [903, "ETYMOLOGIE"],
    [904, "SCHREIBWEISE"],
    [905, "FORM"],
    [906, "STRUKTUR"],
    [907, "GEBRAUCH"],
    [908, "METRIK"],
    [909, "VERWECHSELBAR"],
];
function OutlineBox(props){
    const [displayHead, setDisplayHead] = useState(true);
    const [displayBody, setDisplayBody] = useState(true);
    const [dragObjectId, setDragObjectId] = useState(null);
    const [articleHeadFields, setArticleHeadFields] = useState([]);
    const [articleHeadSelect, setArticleHeadSelect] = useState("");
    const [articleHeadSelectId, setArticleHeadSelectId] = useState(null);
    const devider = {
        borderTop: "4px dotted transparent",
        margin: "0 20px",
        height: "10px"
    }
    useEffect(()=>{
        const articleTypes = props.articles.map(a=>a.type);
        setArticleHeadFields(defaultArticleHeadFields.filter(d=>!articleTypes.includes(d[0])));
    }, [props.articles]);
    useEffect(()=>{if(articleHeadFields.length>0){setArticleHeadSelect(articleHeadFields[0][1]);setArticleHeadSelectId(articleHeadFields[0][0])}}, [articleHeadFields]);
    const displayArticles = (a, depth) => {
        return <div key={a.id} style={{marginLeft: `${25*depth}px`}}>
            <div
                style={devider}
                onDrop={e=>{props.dropArticle(dragObjectId, a.parent_id, a.sort_nr);e.target.style.borderColor="transparent"}}
                onDragOver={e=>{e.preventDefault();e.target.style.borderColor="var(--bs-primary)"}}
                onDragLeave={e=>{e.target.style.borderColor="transparent"}}
            ></div>
            <ArticleBox deleteArticle={props.deleteArticle} changeArticle={props.changeArticle} project={props.project} articles={props.articles} a={a} dragObjectId={dragObjectId} setDragObjectId={id=>{setDragObjectId(id)}} dropArticle={(a,b,c)=>{props.dropArticle(a,b,c)}} collapsed={props.collapsedArticlesLst.includes(a.id)} toggleCollapse={a=>{props.toggleCollapse(a)}} />
        </div>;
    };
    return <Container className="outlineBox" fluid>
            <Row className="mb-3">
                <Col></Col>
                <Col xs="8" style={{userSelect: "none", textAlign: "right", cursor: "pointer", color: "var(--bs-gray-500)"}} onClick={()=>{setDisplayHead(!displayHead)}}>{displayHead?null:<><FontAwesomeIcon icon={faAngleDown} /> </>}Artikelkopf</Col>
                <Col></Col>
            </Row>
            {displayHead?<>
                {props.articles.filter(a=>a.type>=900).sort((a,b)=>a.type>b.type).map(a=><Row key={a.id}>
                    <Col></Col>
                    <Col xs="8">
                    <div style={{display: "flex", marginBottom: "20px"}}>
                        <div style={{width: "200px", fontWeight: "bold"}}>{defaultArticleHeadFields.find(d=>d[0]===a.type)[1]}</div>
                        <input value={a.name} onChange={e=>{props.changeArticle({id: a.id, name: e.target.value})}}
                            onBlur={async(e)=>{await arachne.article.save({id: a.id, name: e.target.value})}} style={{width: "100%", outline: "none", border: "none", borderBottom: "1px solid var(--bs-gray-500)"}} type="text" />
                    </div>
                  </Col>
                    <Col></Col>
                </Row>)}
                
                {articleHeadFields.length>0?<Row>
                    <Col></Col>
                    <Col xs="8">
                    <InputGroup className="mb-3">
                        <DropdownButton
                            style={{width: "165px"}} 
                            variant="outline-secondary"
                            title={articleHeadSelect}
                            id="input-group-dropdown-1"
                        >
                            {articleHeadFields.map(f=><Dropdown.Item onClick={()=>{setArticleHeadSelect(f[1]);setArticleHeadSelectId(f[0])}} key={f[0]} value={f[0]}>{f[1]}</Dropdown.Item>)}
                        </DropdownButton>
                        <FormControl onKeyUp={e=>{
                            if(e.keyCode===13){
                                props.createNewArticle({type: articleHeadSelectId, name: e.target.value, sort_nr: -1});
                                setArticleHeadFields(articleHeadFields.filter(d=>d[0]!==articleHeadSelectId));
                                e.target.value = "";
                            }
                        }} />
                    </InputGroup>
                    </Col>
                    <Col></Col>
                    
                </Row>:null}
            </>:null}
            <Row>
                <Col></Col>
                <Col xs="8" style={{paddingBottom: "15px", marginBottom: "15px", borderBottom: "1px solid var(--bs-gray-500)"}}></Col>
                <Col></Col>
            </Row>
            <Row>
                <Col></Col>
                <Col xs="8" style={{userSelect: "none", textAlign: "right", cursor: "pointer", color: "var(--bs-gray-500)"}} onClick={()=>{setDisplayBody(!displayBody)}}>{displayBody?null:<><FontAwesomeIcon icon={faAngleDown} /> </>}Stellen</Col>
                <Col></Col>
            </Row>
            {displayBody?<><Row>
                <Col></Col>
                <Col xs="8">
                    {props.articlesLst.map(a=>displayArticles(props.articles.find(b=>b.id===parseInt(a.split("-")[1])), a.split("-")[0]))}
                </Col>
                <Col></Col>
            </Row>
            {props.articles.filter(a=>a.type<900).length===0&&<Row className="mt-4"><Col></Col><Col>
                            <Alert tabIndex="0" variant="secondary" style={{padding: "8px 16px", fontSize: "90%", textAlign: "center", cursor: "pointer"}} onKeyDown={e=>{if(e.keyCode===13){props.createNewArticle()}}} onClick={()=>{props.createNewArticle()}}>Eine neue Bedeutung hinzufügen <small>({arachne.options.action_key.toUpperCase()}+N)</small></Alert>
                        </Col><Col></Col></Row>}
            </>:null}
        </Container>;
}
function ArticleBox(props){
    const [displaySections, setDisplaySections] = useState(false);
    const [sectionCount, setSectionCount] = useState(0);
    useEffect(()=>{
        const fetchData=async()=>{
            const sCount = await arachne.sections.get({article_id: props.a.id}, {count: true});
            setSectionCount(sCount[0].count)
        };
        fetchData();
    },[]);
    const dblClickCallback = e => {
        const target = e.target.closest(".articleBox");
        const el = target.getElementsByClassName("articleBoxName")[0];
        el.contentEditable = true;
        el.focus();
    };
    return <><div
        className="articleBox"
        id={`articleBox_${props.a.id}`}
        draggable
        onDragStart={()=>{props.setDragObjectId(props.a.id)}}
        onDrop={e=>{if(props.dragObjectId!==props.a.id){props.dropArticle(props.dragObjectId, props.a.id, 1)}; e.target.style.borderColor="transparent"}}
        onDragOver={e=>{e.preventDefault();if(props.dragObjectId!==props.a.id){e.target.style.borderColor="var(--bs-primary)"}}}
        onDragLeave={e=>{e.target.style.borderColor="transparent"}}
        tabIndex="0"
        onClick={e=>{e.target.focus()}}
        onDoubleClick={e=>{dblClickCallback(e)}}
        onKeyDown={e=>{
            if(e.target.className==="articleBox"){
                if(e.keyCode!==9){e.preventDefault()}
                if(e.keyCode===8||e.keyCode===46){ // delete
                    props.deleteArticle(props.a.id);
                }else if(e.keyCode===13){
                    dblClickCallback(e);
                }else if(e.keyCode===37&&e.shiftKey){ // left+shift
                    if(props.a.parent_id>0){
                        const parentArticle = props.articles.find(a=>a.id===props.a.parent_id);
                        props.dropArticle(props.a.id, parentArticle.parent_id, parentArticle.sort_nr+1);
                    }
                    
                }else if(e.keyCode===37&&e.shiftKey===false){ // left
                    const children = props.articles.filter(a=>a.parent_id===props.a.id);
                    if(children.length>0){props.toggleCollapse(props.a.id)}
                }else if(e.keyCode===38&&e.shiftKey){ // up+shift
                    let previousArticles = props.articles.filter(a=>a.parent_id===props.a.parent_id&&a.sort_nr<props.a.sort_nr).sort((a,b)=>a.sort_nr>b.sort_nr);
                    if(previousArticles.length>0){
                        props.dropArticle(props.a.id, props.a.parent_id, previousArticles[previousArticles.length-1].sort_nr);
                    }
                }else if(e.keyCode===38&&e.shiftKey===false){ // up
                    const articleBoxes = document.getElementsByClassName("articleBox");
                    for(let i = 0; i<articleBoxes.length;i++){
                        if(articleBoxes[i].id === e.target.id){
                            if(i===0){articleBoxes[articleBoxes.length-1].focus()}
                            else{articleBoxes[i-1].focus()}
                            break;
                        }
                    }
                }else if(e.keyCode===39&&e.shiftKey){ // right+shift
                    let previousArticles = props.articles.filter(a=>a.parent_id===props.a.parent_id&&a.sort_nr<props.a.sort_nr).sort((a,b)=>a.sort_nr>b.sort_nr);
                    if(previousArticles.length>0){
                        const previousArticleChildren = props.articles.filter(a=>a.parent_id===previousArticles[previousArticles.length-1].id).sort((a,b)=>a.sort_nr>b.sort_nr);
                        if(previousArticleChildren.length>0){props.dropArticle(props.a.id, previousArticles[previousArticles.length-1].id, previousArticleChildren[previousArticleChildren.length-1].sort_nr+1)}
                        else{props.dropArticle(props.a.id, previousArticles[previousArticles.length-1].id, 1)}
                    }
                }else if(e.keyCode===39&&e.shiftKey===false){ // right
                    setDisplaySections(!displaySections);
                }else if(e.keyCode===40&&e.shiftKey){ // down+shift
                    const nextArticle = props.articles.find(a=>a.parent_id===props.a.parent_id&&a.sort_nr>props.a.sort_nr);
                    if(nextArticle){props.dropArticle(props.a.id, props.a.parent_id, props.a.sort_nr+1)};
                }else if(e.keyCode===40&&e.shiftKey===false){ // down
                    const articleBoxes = document.getElementsByClassName("articleBox");
                    for(let i = 0; i<articleBoxes.length;i++){
                        if(articleBoxes[i].id === e.target.id){
                            if(i===articleBoxes.length-1){articleBoxes[0].focus()}
                            else{articleBoxes[i+1].focus()}
                            break;
                        }
                    }
                }
            }
        }}
    >{props.a.sort_nr}. <span
        className="articleBoxName"
        onBlur={async e=>{
            e.target.contentEditable=false;
            e.target.parentElement.focus();
            await arachne.article.save({id: props.a.id, name: e.target.innerText})
            props.changeArticle({id: props.a.id, name: e.target.innerText});
        }}
        onKeyDown={e=>{
            if(e.keyCode===13){
                e.preventDefault();
                e.target.blur();
            }
        }}
    >{props.a.name}</span> {sectionCount>0?<small className="text-primary" style={{marginLeft: "20px"}}>{sectionCount}</small>:null}{props.collapsed?<span className="text-primary" style={{marginLeft: "15px"}}>...</span>:null}</div>
    {displaySections?<ArticleBoxSections articles={props.articles} setSectionCount={setSectionCount} setSectionDetailId={id=>{props.setSectionDetailId(id)}} inputMode={1} project={props.project} articleId={props.a.id} />:null}
    </>;
}
function ArticleBoxSections(props){
    const [sections, setSections] = useState([]);
    const [inputMode, setInputMode] = useState(0);
    const [inputValue, setInputValue] = useState("");
    const [acLst, setACLst] = useState([]);
    const [currentFocus, setCurrentFocus] = useState(0);
    const [sectionDetailId, setSectionDetailId] = useState(0);
    const [tagLst, setTagLst] = useState([]);
    const [hasFocus, setHasFocus] = useState(false);
    const [loading, setLoading] = useState(false);
    useEffect(()=>{loadSections()}, []);
    useEffect(()=>{loadACLst()},[inputValue, inputMode, hasFocus, tagLst]);
    const loadACLst=async()=>{
        if(hasFocus){
            if(inputMode<3){
                let allSections = await arachne.sections.get({project_id: props.project.id})
                allSections = allSections.filter(a=>(inputMode===0&&!(a.article_id>0)||(inputMode===1&&a.article_id===props.articleId)||(inputMode===2))&&a.ref!==null&&a.ref.toLowerCase().indexOf(inputValue.toLowerCase())>-1);
                allSections = allSections.map(a=>{
                    return {id: a.id, type: "section", name: `${a.ref}; ${a.text!==null?a.text.substring(0, 10):""}...`, articleName: inputMode===2&&a.article_id!==props.articleId?props.articles.find(a=>a.id===props.articleId).name:null}
                });
                const currentTags = tagLst.map(t=>t.id) // could be moved outside loop
                let allTags = await arachne.tags.get({project_id: props.project.id, display: 1});
                allTags = allTags.filter(a=>((inputMode===0&&currentTags.indexOf(a.id)===-1)||(inputMode===1&&currentTags.indexOf(a.id)>-1)||(inputMode===2))&&a.name.toLowerCase().indexOf(inputValue.toLowerCase())>-1);
                allTags = allTags.map(t=>{return {id: t.id, type: "tag", name: t.name}});
                allSections = allSections.concat(allTags);
                allSections.sort((a,b)=>a.name.toLowerCase()>b.name.toLowerCase());
                setACLst(allSections);
            }else{
                if(inputValue.length>3){
                    setLoading(true);
                    setACLst([]);
                    const pages = await arachne.scan_lnk.search([{c: "full_text", o: "LIKE", v:`%${inputValue}%`}], {limit: "10", select: ["id", "edition_id", "full_text", "ac_web"]});
                    let pages_from_sections = [];
                    pages.forEach(p=>{
                        let loopCount = 0
                        for(const hit of p.full_text.matchAll(new RegExp(inputValue, "g"))){
                            pages_from_sections.push({
                                id: `${p.id}-${loopCount}`,
                                edition_id: p.edition_id,
                                type: "full_text",
                                ac_web: p.ac_web,
                                name: `...${p.full_text.substring(hit.index-100, hit.index+hit.length+100)}...`
                            })
                            loopCount ++;
                        }
                    })
                    setACLst(pages_from_sections);
                    setLoading(false);
                }else{
                    setACLst([]);
                }
            }
        }
    }
    const addSections=async(item)=>{
        // also: removes section if inputMode === 1
        if(item.type==="tag"){
            if(inputMode===0||(inputMode===2&&tagLst.map(t=>t.id).indexOf(item.id)===-1)){
                await arachne.tag_lnks.save({tag_id: item.id, article_id: props.articleId});
                const sectionLst = await arachne.tag_lnks.search([{c: "tag_id", o: "=", v: item.id}, {c: "section_id", o: ">", v: 0}], {select: ["section_id"]});
                await arachne.sections.save(sectionLst.map(s=>{return {id: s.section_id, article_id: props.articleId}}));
            }else if(inputMode===1){
                const tagLnk = await arachne.tag_lnks.get({tag_id: item.id, article_id: props.articleId}, {select: ["id"]});
                await arachne.tag_lnks.delete(tagLnk[0].id);
                const sectionLst = await arachne.tag_lnks.search([{c: "tag_id", o: "=", v: item.id}, {c: "section_id", o: ">", v: 0}], {select: ["section_id"]});
                await arachne.sections.save(sectionLst.map(s=>{return {id: s.section_id, article_id: null}}));
            }
        } else if(item.type==="full_text"){
            // add full-text
            const edition = await arachne.edition.get({id: item.edition_id}, {select: ["work_id"]});
            const work = await arachne.work.get({id: edition[0].work_id}, {select: ["date_sort"]})
            await arachne.sections.save({
                project_id: props.project.id,
                ref: item.ac_web,
                text: item.name,
                date_sort: work[0].date_sort,
                user_id: props.project.user_id,
                shared_id: props.project.shared_id,
                work_id: edition[0].work_id,
                article_id: props.articleId
            });
            setACLst([]);
        }else{
            // add section
            let saveValue = true;
            if(inputMode===2&&item.articleName!==null){
                const allSectionTags = await arachne.tag_lnks.get({section_id: item.id}, {select: ["tag_id"]});
                for(const sectionTag of allSectionTags){
                    const articleTag = await arachne.tag_lnks.search([{c: "tag_id", o: "=", v: sectionTag.tag_id}, {c: "article_id", o: ">", v: 0}]);
                    if(articleTag.length>0){
                        alert("Achtung: Die Stelle wurde durch ein Schlagwort automatisch zugewiesen. Entfernen Sie es von der Stelle, um sie dieser Bedeutung zuweisen zu können.");
                        saveValue = false;
                        break;
                    }
                }
            }
            if(saveValue){await arachne.sections.save({id: item.id, article_id: inputMode===1?null:props.articleId})}
        }
        await loadSections();
        await loadACLst();
    };
    const loadSections=async()=>{
        const articleSections = await arachne.sections.get({article_id: props.articleId}, {order: ["date_sort"]});
        setSections(articleSections);
        props.setSectionCount(articleSections.length);
        const articleTagLnkLst = await arachne.tag_lnks.get({article_id: props.articleId}, {select: ["tag_id"]});
        let articleTagLst = [];
        for(const atl of articleTagLnkLst){
            const newTag=await arachne.tags.get({id: atl.tag_id});
            articleTagLst.push(newTag[0]);
        }

        setTagLst(articleTagLst.sort((a,b)=>a.name>b.name));
    };
    const onKeyDown=e=>{
        if(e.keyCode===9&&acLst.length===1){
            e.preventDefault();
            //createNewTag(acTags[0].name);
        }else if(e.keyCode===27){ // esc
            setInputValue("");
            setACLst([]);
        }else if(e.keyCode===190&&e.target.value===""){ // .
            e.preventDefault();
            if(inputMode!==2){setInputMode(2)}
            else{setInputMode(0)}
        }else if(e.keyCode===173&&e.target.value===""){ // -
            e.preventDefault();
            if(inputMode!==1){setInputMode(1)}
            else{setInputMode(0)}
        }else if(e.keyCode===60&&e.shiftKey===false&&e.target.value===""){ // <
            e.preventDefault();
            if(inputMode!==3){setInputMode(3)}
            else{setInputMode(0)}
        }else if (e.keyCode===40) { //down
            e.preventDefault();
            if(acLst.length>0){
                if(currentFocus+1 >= acLst.length){setCurrentFocus(0)}
                else{setCurrentFocus(currentFocus+1)}
            }else{e.target.parentNode.parentNode.firstChild.firstChild.focus()}
        } else if (e.keyCode===38) { //up
            e.preventDefault();
            if(acLst.length>0){
                if (currentFocus-1 < 0){setCurrentFocus(acLst.length - 1)}
                else{setCurrentFocus(currentFocus-1)}
            }else{e.target.parentNode.parentNode.firstChild.lastChild.focus()}
        } else if (e.keyCode===13) {
            e.preventDefault();
            addSections(acLst[currentFocus]);
        }
    }
    let borderStyle = "0.5px solid #ced4da"
    let backgroundColor = "white"
    if(inputMode===1){
        borderStyle = "1px solid var(--bs-yellow)"
        backgroundColor = "#ffecb1"
    }else if(inputMode===2){
        borderStyle = "1px solid var(--bs-teal)"
        backgroundColor = "#e2f7ed"
    }else if(inputMode===3){
        borderStyle = "1px solid #074297"
        backgroundColor = "#e6f0fe"
    }
    return <>
    <SectionDetailEdit project={props.project} handleClose={()=>{loadSections();setSectionDetailId(0)}} sectionDetailId={sectionDetailId} />
    <div className="ArticleBoxSections">
        <div className="outlineSectionTagBox">{tagLst.map(t=><div key={t.id} className="outlineSectionTags" style={{backgroundColor: t.color}}>{t.name}</div>)}</div>
        <div>{sections.map(s=><SectionBox key={s.id} s={s} setSectionDetailId={setSectionDetailId} loadSections={loadSections} articleTagLst={tagLst} />)}</div>
        <div style={{width:"100%", position: "relative", display: "inline-block"}}>
            <input className="tagBoxOutlineSection" value={inputValue} onChange={e=>{setInputValue(e.target.value)}} onFocus={()=>{setHasFocus(true)}} onBlur={()=>{setHasFocus(false);setInputValue("");setACLst([]);/*if(!props.inputMode){props.setInputMode()}*/}} type="text" onKeyDown={e=>{onKeyDown(e)}} />{loading?<Spinner style={{position: "absolute", top: "12px", right: "4px"}} variant="primary" animation="border" size="sm" />:null}
            {acLst.length>0&&<div className="autocomplete-items" style={{border: borderStyle}}>
                {acLst.map((t,i)=>
                    <div key={t.id} style={{fontWeight: t.type==="tag"?"bold":null, fontStyle: t.type==="tag"?"italic":null, backgroundColor: backgroundColor, border: borderStyle}} onMouseDown={async ()=>{await addSections(t)}} className={i===currentFocus?"autocomplete-active":""}>
                        {t.ac_web?<><b>{t.ac_web}</b>:</>:null}
                        <p style={{marginLeft: t.ac_web?"15px":null}} dangerouslySetInnerHTML={parseHTML(t.name.replace(new RegExp(`(${inputValue})`, "gi"), "<u>$1</u>"))}></p>
                        {t.articleName?<small>{t.articleName}</small>:null}
                    </div>)}
            </div>}
        </div>

    </div></>;
}
function SectionBox(props){
    const [tagLst, setTagLst] = useState([]);
    useEffect(()=>{
        const fetchData = async()=>{
            const tagLnks = await arachne.tag_lnks.get({section_id: props.s.id}, {select: ["tag_id"]});
            let newTags = [];
            for (const tl of tagLnks){
                const t = await arachne.tags.get({id: tl.tag_id, display: 1});
                if(t.length>0){newTags.push(t[0])}
            }
            newTags.sort((a,b)=>a.name.toLowerCase()>b.name.toLowerCase());
            setTagLst(newTags);
        }
        fetchData();
    }, []);
    return <div key={props.s.id} className="sectionBox" tabIndex="0" onClick={e=>{
            e.target.closest(".sectionBox").focus();
        }} onKeyDown={e=>{
            if(e.keyCode===8||e.keyCode===46){ // remove from article
                // check if section is connected by tag!
                const tagNameLst = tagLst.map(t=>t.name);
                if(props.articleTagLst.filter(a=>tagNameLst.includes(a.name)).length>0){
                    alert("Diese Stelle kann nicht einzeln entfernt werden. Entfernen Sie das Schlagwort, um die Stelle zu entfernen.")
                } else if(window.confirm("Soll die Stelle von der Bedeutung entfernt werden?")){
                    arachne.sections.save({id: props.s.id, article_id: null});
                    props.loadSections();
                }
            }else if(e.keyCode===38){ // up
                e.preventDefault();
                if(e.target.previousSibling){e.target.previousSibling.focus()}
                else(e.target.parentNode.parentNode.lastChild.lastChild.focus())
            }else if(e.keyCode===40){ // down
                e.preventDefault();
                if(e.target.nextSibling){e.target.nextSibling.focus()}
                else{e.target.parentNode.parentNode.lastChild.lastChild.focus()}
                
            }else if(e.keyCode===13){
                e.preventDefault();
                props.setSectionDetailId(props.s.id);
            }
        }}><span className="sectionBoxTitle">{props.s.ref}</span> {props.s.text}
        <div className="outlineSectionTagBox">{tagLst.map(t=><div key={t.id} className="outlineSectionTags" style={{backgroundColor: t.color}}>{t.name}</div>)}</div>
    </div>;
}
function SectionDetailEdit(props) {
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
    useEffect(()=>{setImg(section.img+`${verso?"v":""}.jpg`)}, [verso]);
    useEffect(()=>{if(props.sectionDetailId>0){loadSection();if(document.getElementById("sectionDetailEditFirstInput")){document.getElementById("sectionDetailEditFirstInput").focus()}}}, [props.sectionDetailId]);
    const loadSection = async () =>{
        const newSection = await arachne.sections.get({id: props.sectionDetailId});
        setImg(arachne.url+newSection[0].img+`${verso?"v":""}.jpg`);
        setReference(newSection[0].ref);
        setText(newSection[0].text);
        setComment(newSection[0].comment);
        if(newSection[0].comment!==null&&newSection[0].comment!==""){setShowComment(true)}
        setSection(newSection[0]);
        // load ressources
        setRessources(await arachne.edition.get({work_id: newSection[0].work_id}, {select: ["id", "label", "url"]}));
    };
    const loadTags =  async () =>{
        let cAllTags = await arachne.tags.get({project_id: props.project.id});
        const cTagLnks = await arachne.tag_lnks.get({section_id: props.sectionDetailId});
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
    return <Modal show={props.sectionDetailId>0} onHide={props.handleClose} size="xl">
        <Modal.Header closeButton>
            <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Card className="largeScreen" id={"s_"+props.sectionDetailId} style={{ margin: "auto" }}>
                <Card.Img style={{aspectRatio: "10/7"}} variant="top" src={img} />
                <Card.Body>
                    <div style={{position: "absolute", top:"5px", left: "10px", right: "430px", opacity: "0.5"}}><a onClick={()=>{setVerso(!verso)}} title="Zettel drehen"><FontAwesomeIcon icon={faRotate} /></a></div>
                    <Row className="mb-2"><Col><Form.Control id="sectionDetailEditFirstInput" placeholder="Zitiertitel..." size="sm" type="text" value={reference?reference:""} onChange={e=>{setReference(e.target.value)}} onBlur={async e=>{await arachne.sections.save({id: props.sectionDetailId, ref: e.target.value})}} /></Col><Col style={{textAlign: "right"}} xs={4}><RessourcesButtons setRessourceView={url=>{props.setRessourceView(url)}} ressources={ressources} /></Col></Row>
                
                    <Form.Control placeholder="Text der Stelle..." as="textarea" rows={3} style={{fontSize: "95%"}} value={text?text:""} onChange={e=>{setText(e.target.value)}} onBlur={async e=>{await arachne.sections.save({id: props.sectionDetailId, text: e.target.value})}} />
                    {showComment?<div><Form.Control className="mt-2" placeholder="Schreiben Sie einen Kommentar..." as="textarea" rows={3} style={{fontSize: "95%"}} value={comment?comment:""} onChange={e=>{setComment(e.target.value)}} onBlur={async e=>{await arachne.sections.save({id: props.sectionDetailId, comment: e.target.value})}} /></div>:<div style={{textAlign: "right"}}><a style={{fontSize: "90%"}} className="link-secondary" onClick={()=>{setShowComment(true)}}>Kommentar hinzufügen</a></div>}
                    <TagBox centerSection={()=>{}} loadTags={async ()=>{await loadTags()}} tags={tags} project={props.project} s={section} unusedTags={unusedTags} />
                </Card.Body>
            </Card>
        </Modal.Body>
        {/*<Modal.Footer></Modal.Footer>*/}
    </Modal>;
}
export { OutlineBox, defaultArticleHeadFields }