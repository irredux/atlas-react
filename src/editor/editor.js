import { useEffect, useState, useRef } from "react";
import { Button, ButtonGroup, Dropdown, Table, Badge, Card, Col, Form, Container, Navbar, Nav, Row, Modal, Accordion, Stack, Spinner, Offcanvas, Tabs, Tab } from "react-bootstrap";
import { arachne } from "./../arachne.js";
import { AutoComplete, SearchInput, ToolKit, useIntersectionObserver, Message, useShortcuts, sleep } from "./../elements.js"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faMinusCircle, faTimesCircle, faRotate, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { ZettelBox } from "./zettel.js";
import { OutlineBox } from "./outline.js";
import { ExportBox } from "./export.js";

function Editor(props){
    const [mode, setMode] = useState("zettel")
    const [project, setProject] = useState(null);
    const [articles, setArticles] = useState([]);
    const [articlesLst, setArticlesLst] = useState([]); // because react only checks shallow copies!
    const [collapsedArticlesLst, setCollapsedArticlesLst] = useState([])
    const [filterLst, setFilterLst] = useState([]);
    const [filterTags, setFilterTags] = useState([]);
    const [toolKitItems, setToolKitItems] = useState([]);
    const [limitFilterResults,setLimitFilterResults] = useState(false);
    //const [showMenuLeft, setShowMenuLeft] = useState(false);
    const [sectionsMenuActiveTabKey, setSectionsMenuActiveTabKey] = useState(null);
    const [showImport, setShowImport] = useState(false);
    const [changeZettelWork, setChangeZettelWork] = useState({})
    const scSetup = [
        ["ACTION+ESC", ()=>{props.loadMain(null, null)}],
        ["ACTION+f", ()=>{if(mode==="zettel"){setSectionsMenuActiveTabKey("filter")}}],
        ["ACTION+t", ()=>{if(mode==="zettel"){setSectionsMenuActiveTabKey("tags")}}],
        ["ACTION+i", ()=>{if(mode==="zettel"){setShowImport(!showImport)}}],
        ["ACTION+r", ()=>{if(mode==="zettel"){setFilterLst([]);updateSections()}}],
        ["ACTION+1", ()=>{setMode("zettel")}],
        ["ACTION+2", ()=>{setMode("outline")}],
        ["ACTION+3", ()=>{setMode("export")}],
        ["ACTION+n", ()=>{if(mode==="zettel"){setChangeZettelWork({value: "", id: 0, section_id: 0})}else if(mode==="outline"){createNewArticle()}}]
    ];
    useShortcuts(scSetup, false);
    useEffect(()=>{
        if(mode==="zettel"){setToolKitItems([
            [`Zettel importieren (${arachne.options.action_key.toUpperCase()}+I)`, ()=>{setShowImport(true)}],
            [`Seitenleiste einblenden (${arachne.options.action_key.toUpperCase()}+F/T)`, ()=>{setSectionsMenuActiveTabKey("filter")}],
            [`Filter neu laden (${arachne.options.action_key.toUpperCase()}+R)`, ()=>{setFilterLst([]);updateSections()}],
            [`Neue Stelle erstellen (${arachne.options.action_key.toUpperCase()}+N)`, ()=>{setChangeZettelWork({value: "", id: 0, section_id: 0})}],
        ])}
        else if(mode==="outline"){setToolKitItems([
            [`Neuer Artikel erstellen (${arachne.options.action_key.toUpperCase()}+N)`, ()=>{createNewArticle()}],
        ])}
        else{setToolKitItems([])}
    },[mode])
    const updateArticles = inArticles => {
        setArticles(inArticles);
        const returnChildIds = (parentId, depth) => {
            const childArticles = inArticles.filter(a=>a.parent_id===parentId&&a.type<900).sort((a,b)=>a.sort_nr>b.sort_nr);
            let returnLst = [];
            childArticles.forEach(a=>{
                returnLst.push(`${depth}-${a.id}`)
                if(!collapsedArticlesLst.includes(a.id)){
                    const newChildLst = returnChildIds(a.id, depth+1);
                    if(newChildLst.length>0){returnLst=returnLst.concat(newChildLst)}
                }
            });
            return returnLst;
        };
        setArticlesLst(returnChildIds(0,0));
    };
    useEffect(()=>{
        updateArticles(articles);
    }, [collapsedArticlesLst])
    useEffect(()=>{
        const fetchData = async ()=>{
            const newProject = await arachne.project.get({id: props.resId})
            setProject(newProject[0])
            const newArticles = await arachne.article.get({project_id: props.resId});
            updateArticles(newArticles);
        };
        fetchData();
        updateSections();
    }, []);
    const deleteArticle = async(id)=>{
        if(window.confirm("Soll die Gruppe wirklich gelöscht werden? Alle Untergruppen werden ebenfalls gelöscht.")){
            const getChildIds = id=>{
                let returnIds = [id];
                const childIds = articles.filter(a=>a.parent_id===id).map(a=>a.id);
                childIds.forEach(a=>{returnIds=returnIds.concat(getChildIds(a))})
                return returnIds;
            }
            const artIdLst = getChildIds(id);

            let sectionLst = [];
            for(const artId of artIdLst){ // can we use an user-side list here?
                const newSectionsId = await arachne.sections.get({article_id:artId}, {select: ["id"]});
                newSectionsId.forEach(s=>sectionLst.push({id: s.id, article_id: null}));
            }
            //console.log(sectionLst);
            await arachne.article.delete(artIdLst);
            await arachne.sections.save(sectionLst);
            updateArticles(articles.filter(a=>!artIdLst.includes(a.id)));
        }
    }
    const createNewArticle = async (newArt={}) =>{
        let newArticle = newArt;
        newArticle.type = 0;
        newArticle.project_id = project.id;
        newArticle.parent_id = 0;
        newArticle.name = newArticle.name?newArticle.name:"Neue Gruppe";
        newArticle.sort_nr = newArticle.sort_nr?newArticle.sort_nr:articles.length>0?Math.max(...articles.filter(a=>a.parent_id===0).map(a=>a.sort_nr))+1:1;
        const newId=await arachne.article.save(newArticle);
        newArticle.id = newId;
        let newArticles = articles.map(i=>i); // necessary?
        newArticles.push(newArticle);
        updateArticles(newArticles);
    };
    const changeArticle=a=>{
        updateArticles(articles.map(l=>{
            if(l.id!==a.id){return l}
            else{
                return {...l, ...a}
            }
        }));
    };
    const dropArticle = async (id, parent_id, sort_nr) => {
        let newArticles = articles;

        // close gap in old position
        const currentArticle = articles.find(a=>a.id===id);
        let save_old_lst = articles.filter(a=>a.parent_id===currentArticle.parent_id&&a.sort_nr>currentArticle.sort_nr).map(a=>{return {id: a.id, sort_nr: a.sort_nr-1}});
        save_old_lst.forEach(a=>{ // is there a faster way?
            const i = newArticles.findIndex(na=>na.id===a.id);
            //newArticles[i].parent_id = parent_id;
            newArticles[i].sort_nr = a.sort_nr;
        });
        // make gap in new position
        const save_new_lst = newArticles.filter(a=>a.parent_id===parent_id&&a.sort_nr>=sort_nr).map(a=>{return {id: a.id, parent_id: parent_id, sort_nr: a.sort_nr+1}});
        save_new_lst.push({id: id, parent_id: parent_id, sort_nr: sort_nr});
        save_new_lst.forEach(a=>{ // is there a faster way?
            const i = newArticles.findIndex(na=>na.id===a.id);
            newArticles[i].parent_id = parent_id;
            newArticles[i].sort_nr = a.sort_nr;
        });
        await arachne.article.save(save_new_lst.concat(save_old_lst.filter(a=>save_new_lst.findIndex(b=>a.id===b.id)===-1)));
        updateArticles(newArticles);
    };
    const toggleCollapse = aId => {
        if(collapsedArticlesLst.includes(aId)){setCollapsedArticlesLst(collapsedArticlesLst.filter(a=>a!==aId))}
        else{setCollapsedArticlesLst(collapsedArticlesLst.concat([aId]))}
    };

    const updateSections = async () => {
        let foundSections = await arachne.sections.get({project_id: props.resId}, {select: ["id"]});
        if(filterTags.length === 0){
            setFilterLst(foundSections.map(s=>s.id));
        } else {
            const allTags = await arachne.tags.get({project_id: props.resId}, {select: ["id"]});
            const allTagLnks = await arachne.tag_lnks.get({tag_id: allTags.map(at=>at.id)});
            foundSections = foundSections.map(fs=>{
                fs.tags = allTagLnks.filter(atl=>atl.section_id===fs.id).map(atl=>atl.tag_id);
                return fs;
            });
            for(const filter of filterTags){
                if(filter.exclude){foundSections = foundSections.filter(fs=>!fs.tags.includes(filter.id))}
                else{foundSections = foundSections.filter(fs=>fs.tags.includes(filter.id))}
            }
            setFilterLst(foundSections.map(s=>s.id));
        }
    };
    let modeBox = null;
    switch(mode){
        case "zettel":
            modeBox = <ZettelBox changeZettelWork={changeZettelWork} setChangeZettelWork={setChangeZettelWork} setLimitFilterResults={v=>{setLimitFilterResults(v)}} showImport={showImport} sectionsMenuActiveTabKey={sectionsMenuActiveTabKey} filterTags={filterTags} setFilterTags={newTags=>{setFilterTags(newTags)}} setSectionsMenuActiveTabKey={m=>{setSectionsMenuActiveTabKey(m)}} setShowImport={v=>{setShowImport(v)}} project={project} filterLst={filterLst} updateSections={(force=false)=>{if(force){setFilterLst([])};updateSections()}} />;
            break;
        case "outline":
            modeBox = <OutlineBox deleteArticle={deleteArticle} createNewArticle={createNewArticle} changeArticle={changeArticle} project={project} dropArticle={(a,b,c)=>{dropArticle(a,b,c)}} articlesLst={articlesLst} articles={articles} collapsedArticlesLst={collapsedArticlesLst} toggleCollapse={a=>{toggleCollapse(a)}} />;
            break;
        case "export":
            modeBox = <ExportBox project={project} />;
            break;
        default:
        modeBox = <div>Modus '{mode}' nicht gefunden.</div>;
    }
    return <>
    <Message show={Object.keys(changeZettelWork).length>0?true:false} title="verknpft. Werk auswählen" msg="Mit welchem Werk soll die Stelle verknüpft werden?" AutoComplete={{value: changeZettelWork.value, id: changeZettelWork.id, tbl: "work", searchCol: "ac_web", returnCol: "ac_web"}} onReplay={async e=>{
            if(e){
                let nValues = {work_id: e.id}  

                if(changeZettelWork.section_id>0){
                    nValues.id = changeZettelWork.section_id;
                    const cSection = await arachne.sections.get({id: changeZettelWork.section_id}, {select: ["ref"]});
                    if(cSection[0]["ref"]!=e.value&&window.confirm("Soll auch der Zitiertitel geändert werden?")){
                        nValues.ref = e.value+";";
                    }
                }else{
                    const cWork = await arachne.work.get({id: e.id}, {select: ["date_sort"]})
                    nValues.ref = e.value+";";
                    nValues.project_id = project.id;                  
                    nValues.user_id = project.user_id;
                    nValues.shared_id = project.shared_id;
                    nValues.date_sort = cWork[0]["date_sort"];
                }             
                const rId = await arachne.sections.save(nValues);
                if(changeZettelWork.section_id===0){
                    sleep(300).then(()=>{
                        const el = document.getElementById(`s_${rId}`);
                        if(el){el.scrollIntoView({behavior: "auto", block: "center"})}
                    });
                    
                }
                updateSections(true);
            }
            setChangeZettelWork({});
        }} />
    <Navbar bg="dark" variant="dark" fixed="top" style={{top: "0px"}}>
        <Container fluid style={{height: "40px"}}>
            <Navbar.Brand style={{cursor: "pointer"}} onClick={e=>{props.loadMain(e, null)}}>Editor</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                <Nav style={{fontSize: "110%"}}>
                    <Nav.Link className="text-white" style={{textDecoration: mode==="zettel"?"underline":null}} onClick={()=>{setMode("zettel")}}>Stellen</Nav.Link>
                    <Navbar.Text style={{width: "80px", borderBottom: "3px solid white", height: "25px"}}></Navbar.Text>
                    <Nav.Link className="text-white" style={{textDecoration: mode==="outline"?"underline":null}} onClick={()=>{setMode("outline")}}>Gliederung</Nav.Link>
                    <Navbar.Text style={{width: "80px", borderBottom: "3px solid white", height: "25px"}}></Navbar.Text>
                    <Nav.Link className="text-white" style={{textDecoration: mode==="export"?"underline":null}} onClick={()=>{setMode("export")}}>Export</Nav.Link>
                </Nav>
                <Nav>
                    <Navbar.Text><ToolKit menuItems={toolKitItems} direction={"down"} /></Navbar.Text>
                </Nav>
            </Navbar.Collapse>
        </Container>
    </Navbar>
    {project!=null?<Container style={{marginTop: "120px"/*position: "absolute", overflow: "scroll", backgroundColor: "red", padding:"10px 0 10px 0", top: "56px", bottom: "80px"*/}} fluid>
        {modeBox}
    </Container>:<Container><Row>Project wird geladen...</Row></Container>}
    </>;
}
export { Editor }