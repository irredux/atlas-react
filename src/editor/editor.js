import { useEffect, useState, useRef } from "react";
import { Button, ButtonGroup, Dropdown, Table, Badge, Card, Col, Form, Container, Navbar, Nav, Row, Modal, Accordion, Stack, Spinner, Offcanvas, Tabs, Tab } from "react-bootstrap";
import { arachne } from "./../arachne.js";
import { AutoComplete, SearchInput, ToolKit, useIntersectionObserver, Message, useShortcuts } from "./../elements.js"
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
    const [limitFilterResults,setLimitFilterResults] = useState(false);
    const [showMenuLeft, setShowMenuLeft] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const scSetup = [
        ["CTRL+ESC", ()=>{props.loadMain(null, null)}],
        ["CTRL+f", ()=>{setShowMenuLeft(!showMenuLeft)}],
        ["CTRL+i", ()=>{setShowImport(!showImport)}],
        ["CTRL+r", ()=>{setFilterLst([]);updateSections()}],
        ["CTRL+1", ()=>{setMode("zettel")}],
        ["CTRL+2", ()=>{setMode("outline")}],
        ["CTRL+3", ()=>{setMode("export")}],
        ["CTRL+n", ()=>{createNewArticle()}]
    ];
    useShortcuts(scSetup, false);
    const ToolKitItems = [
        ["Zettel importieren", ()=>{setShowImport(true)}],
        ["Seitenleiste ein-/ausblenden", ()=>{setShowMenuLeft(true)}],
        ["Filter neu laden", ()=>{setFilterLst([]);updateSections()}],
        ["Neuer Artikel erstellen", ()=>{createNewArticle()}]
    ];
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
    const createNewArticle = async (newArt={}) =>{
        let newArticle = newArt;
        newArticle.project_id = project.id;
        newArticle.parent_id = 0;
        newArticle.name = newArticle.name?newArticle.name:"Neue Gruppe";
        newArticle.sort_nr = newArticle.sort_nr?newArticle.sort_nr:articles.length>0?Math.max(...articles.filter(a=>a.parent_id===0).map(a=>a.sort_nr))+1:1;
        const newId=await arachne.article.save(newArticle);
        newArticle.id = newId;
        let newArticles = articles;
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
    const toogleCollapse = aId => {
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
            modeBox = <ZettelBox setLimitFilterResults={v=>{setLimitFilterResults(v)}} showImport={showImport} showMenuLeft={showMenuLeft} filterTags={filterTags} setFilterTags={newTags=>{setFilterTags(newTags)}} setShowMenuLeft={()=>{setShowMenuLeft(false)}} setShowImport={v=>{setShowImport(v)}} project={project} filterLst={filterLst} updateSections={()=>{updateSections()}} />;
            break;
        case "outline":
            modeBox = <OutlineBox createNewArticle={createNewArticle} changeArticle={changeArticle} project={project} dropArticle={(a,b,c)=>{dropArticle(a,b,c)}} articlesLst={articlesLst} articles={articles} collapsedArticlesLst={collapsedArticlesLst} toogleCollapse={a=>{toogleCollapse(a)}} />;
            break;
        case "export":
            modeBox = <ExportBox project={project} />;
            break;
        default:
        modeBox = <div>Modus '{mode}' nicht gefunden.</div>;
    }
    return <>
    <Navbar bg="dark" variant="dark" fixed="top" style={{top: "0px"}}>
        <Container fluid style={{height: "40px"}}>
            <Navbar.Brand style={{cursor: "pointer"}} onClick={e=>{props.loadMain(e, null)}}>Editor</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                <Nav style={{fontSize: "110%"}}>
                    <Nav.Link className="text-white" style={{textDecoration: mode==="zettel"?"underline":null}} onClick={()=>{setMode("zettel")}}>Zettel</Nav.Link>
                    <Navbar.Text style={{width: "80px", borderBottom: "3px solid white", height: "25px"}}></Navbar.Text>
                    <Nav.Link className="text-white" style={{textDecoration: mode==="outline"?"underline":null}} onClick={()=>{setMode("outline")}}>Gliederung</Nav.Link>
                    <Navbar.Text style={{width: "80px", borderBottom: "3px solid white", height: "25px"}}></Navbar.Text>
                    <Nav.Link className="text-white" style={{textDecoration: mode==="export"?"underline":null}} onClick={()=>{setMode("export")}}>Export</Nav.Link>
                </Nav>
                <Nav>
                    <Navbar.Text><ToolKit menuItems={ToolKitItems} direction={"down"} /></Navbar.Text>
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