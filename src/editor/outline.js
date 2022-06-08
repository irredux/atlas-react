import { useState, useEffect } from "react";
import { Modal, Card, Col, Container, Form, Row, FormControl, InputGroup, Dropdown, DropdownButton } from "react-bootstrap";
import { arachne } from "./../arachne";
import { parseHTML } from "./../elements";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { RessourcesButtons, TagBox } from "./zettel.js";

function OutlineBox(props){
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
            <ArticleBox changeArticle={props.changeArticle} project={props.project} articles={props.articles} a={a} dragObjectId={dragObjectId} setDragObjectId={id=>{setDragObjectId(id)}} dropArticle={(a,b,c)=>{props.dropArticle(a,b,c)}} collapsed={props.collapsedArticlesLst.includes(a.id)} toogleCollapse={a=>{props.toogleCollapse(a)}} />
        </div>;
    };
    return <Container className="outlineBox" fluid>
            <Row>
                <Col></Col>
                <Col xs="8" style={{textAlign: "right", cursor: "pointer"}}>Artikelkopf</Col>
                <Col></Col>
            </Row>
            {articleHeadFields.length>0?<Row>
                <Col></Col>
                <Col>
                <InputGroup className="mb-3">
                    <DropdownButton
                    variant="outline-secondary"
                    title={articleHeadSelect}
                    id="input-group-dropdown-1"
                    >
                        {articleHeadFields.map(f=><Dropdown.Item onClick={()=>{setArticleHeadSelect(f[1]);setArticleHeadSelectId(f[0])}} key={f[0]} value={f[0]}>{f[1]}</Dropdown.Item>)}
                    </DropdownButton>
                    <FormControl onKeyUp={e=>{
                        if(e.keyCode===13){
                        console.log({type: articleHeadSelectId, name: e.target.value});
                        e.target.value = "";
                        }
                    }} />
                </InputGroup>
                </Col>
                <Col></Col>
                
            </Row>:null}
            <Row>
                <Col></Col>
                <Col xs="8" style={{paddingBottom: "15px", marginBottom: "15px", borderBottom: "1px solid black"}}></Col>
                <Col></Col>
            </Row>
            <Row>
                <Col></Col>
                <Col xs="8" style={{textAlign: "right", cursor: "pointer"}}>Stellen</Col>
                <Col></Col>
            </Row>
            <Row>
                <Col></Col>
                <Col xs="8">
                    {props.articlesLst.map(a=>displayArticles(props.articles.find(b=>b.id===parseInt(a.split("-")[1])), a.split("-")[0]))}
                </Col>
                <Col></Col>
            </Row>
        </Container>;
}
function ArticleBox(props){
    const [displaySections, setDisplaySections] = useState(false);

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
                if(e.keyCode===13){
                    dblClickCallback(e);
                }else if(e.keyCode===37&&e.shiftKey){ // left+shift
                    if(props.a.parent_id>0){
                        const parentArticle = props.articles.find(a=>a.id===props.a.parent_id);
                        props.dropArticle(props.a.id, parentArticle.parent_id, parentArticle.sort_nr+1);
                    }
                    
                }else if(e.keyCode===37&&e.shiftKey===false){ // left
                    props.toogleCollapse(props.a.id);
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
                    if(displaySections){setDisplaySections(false)}
                    else{setDisplaySections(true)}
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
    >{props.a.name}</span> {/*<i>({props.a.id})</i>*/}{props.collapsed?<span className="text-primary" style={{marginLeft: "15px"}}>...</span>:null}</div>
    {displaySections?<ArticleBoxSections setSectionDetailId={id=>{props.setSectionDetailId(id)}} inputMode={1} project={props.project} articleId={props.a.id} />:null}
    </>;
}
function ArticleBoxSections(props){
    const [sections, setSections] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [acLst, setACLst] = useState([]);
    const [currentFocus, setCurrentFocus] = useState(0);
    const [sectionDetailId, setSectionDetailId] = useState(0);
    const [tagLst, setTagLst] = useState([]);
    useEffect(()=>{loadSections()}, []);
    useEffect(()=>{loadACLst()},[inputValue]);
    const loadACLst=async()=>{
        if(inputValue!==""){
            let allSections = await arachne.sections.get({project_id: props.project.id})
            allSections = allSections.filter(a=>a.ref!==null&&a.ref.toLowerCase().indexOf(inputValue.toLowerCase())>-1);
            allSections = allSections.map(a=>{return {id: a.id, type: "section", name: `${a.ref}; ${a.text!==null?a.text.substring(0, 10):""}...`}});
            let allTags = await arachne.tags.get({project_id: props.project.id});
            allTags = allTags.filter(a=>a.name.toLowerCase().indexOf(inputValue.toLowerCase())>-1);
            allTags = allTags.map(t=>{return {id: t.id, type: "tag", name: t.name}});
            allSections = allSections.concat(allTags);
            allSections.sort((a,b)=>a.name.toLowerCase()>b.name.toLowerCase());
            setACLst(allSections);
        }else if(acLst.length>0){
            setACLst([]);
        }
    }
    const addSections=async(item)=>{
        if(item.type==="tag"){
            const tagLnks = await arachne.tag_lnks.get({tag_id: item.id});
            await arachne.sections.save(tagLnks.map(t=>{return {id: t.section_id, article_id: props.articleId}}));
            await loadSections();
        }else{
            await arachne.sections.save({id: item.id, article_id: props.articleId});
            await loadSections();
        }
    };
    const loadSections=async()=>{
        const articleSections = await arachne.sections.get({article_id: props.articleId}, {order: ["date_sort"]});
        setSections(articleSections);
        const tagLnkLst = [];
        for(const s of articleSections){
            const tagLnks = await arachne.tag_lnks.get({section_id: s.id});
            tagLnks.forEach(t=>{if(!tagLnkLst.includes(t.tag_id)){tagLnkLst.push(t.tag_id)}});
        }
        const newTags = [];
        for (const tl of tagLnkLst){
            const newTag = await arachne.tags.get({id: tl});
            if(newTag[0]){newTags.push(newTag[0])}
        }
        setTagLst(newTags);
    };
    const onKeyDown=e=>{
        if(e.keyCode===9&&acLst.length===1){
            e.preventDefault();
            //createNewTag(acTags[0].name);
        }else if(e.keyCode===27){ // esc
            setInputValue("");
            //setACLst([]);
        }else if(e.keyCode===190&&e.target.value===""){ // .
            e.preventDefault();
            //if(props.inputMode!==1){props.setInputMode(1)}
            //else{props.setInputMode(0)}
        }else if(e.keyCode===173&&e.target.value===""){ // -
            e.preventDefault();
            //if(props.inputMode!==2){props.setInputMode(2)}
            //else{props.setInputMode(0)}
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
    return <>
    <SectionDetailEdit project={props.project} handleClose={()=>{loadSections();setSectionDetailId(0)}} sectionDetailId={sectionDetailId} />
    <div className="ArticleBoxSections">
        <div className="outlineSectionTagBox">{tagLst.map(t=><div className="outlineSectionTags" style={{backgroundColor: t.color}}>{t.name}</div>)}</div>
        <div>{sections.map(s=><SectionBox s={s} setSectionDetailId={setSectionDetailId} />)}</div>
        <div style={{width:"100%", position: "relative", display: "inline-block"}}>
            <input className="tagBoxOutlineSection" value={inputValue} onChange={e=>{setInputValue(e.target.value)}} onFocus={()=>{loadACLst()}} onBlur={()=>{setInputValue("");setACLst([]);/*if(!props.inputMode){props.setInputMode()}*/}} type="text" onKeyDown={e=>{onKeyDown(e)}} />
            {acLst.length>0&&<div className="autocomplete-items" style={{borderColor: props.inputMode?null:"var(--bs-yellow)"}}>
                {acLst.map((t,i)=><div key={t.id} style={{fontWeight: t.type==="tag"?"bold":null, fontStyle: t.type==="tag"?"italic":null, backgroundColor: props.inputMode?null:"#ffecb1", borderColor: props.inputMode?null:"var(--bs-yellow)"}} onMouseDown={async ()=>{await addSections(t)}} className={i===currentFocus?"autocomplete-active":""} dangerouslySetInnerHTML={parseHTML(t.name.replace(new RegExp(`(${inputValue})`, "gi"), "<u>$1</u>"))}></div>)}
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
                const t = await arachne.tags.get({id: tl.tag_id});
                newTags.push(t[0]);
            }
            newTags.sort((a,b)=>a.name.toLowerCase()>b.name.toLowerCase());
            setTagLst(newTags);
        }
        fetchData();
    }, []);
    return <div key={props.s.id} className="sectionBox" tabIndex="0" onClick={e=>{
            e.target.closest(".sectionBox").focus();
        }} onKeyDown={e=>{
            if(e.keyCode===38){ // up
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
        <div className="outlineSectionTagBox">{tagLst.map(t=><div className="outlineSectionTags" style={{backgroundColor: t.color}}>{t.name}</div>)}</div>
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
        //console.log(newSection[0].img+`${verso?"v":""}.jpg`);
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
export { OutlineBox }