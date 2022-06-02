import { Container, Col, Row, Modal, Button, Table, Tabs, Tab, Dropdown, Navbar } from "react-bootstrap";
import { useEffect, useState } from "react";
import { getSettings, setSetting } from "./mainContent.js";

import { arachne } from "./../arachne.js";
import { Message, ToolKit } from "./../elements.js";

function Overview(props){
    const [sortName, setSortName] = useState(getSettings().projectSort);
    const [renameId, setRenameId] = useState(0);
    const [shareId, setShareId] = useState(0);
    const [renameName, setRenameName] = useState("");
    const [activeProjects, setActiveProjects] = useState([]);
    const [archiveProjects, setArchiveProjects] = useState([]);
    const [sharedProjects, setSharedProjects] = useState([]);
    const [userLst, setUserLst] = useState([]);
    useEffect(()=>{
        refreshPage();
    }, [sortName]);
    useEffect(()=>{
        const fetchData = async () => {
            await refreshPage();
            const users = await arachne.user.getAll({order: ["last_name"]});
            setUserLst(users.map(u=>[u.id, `${u.first_name} ${u.last_name}`]))
        };
        fetchData();
    }, [])
    const refreshPage = async ()=>{
        setActiveProjects(await arachne.project.get({user_id: arachne.me.id, status: 1}, {order: [sortName]}));
        setArchiveProjects(await arachne.project.get({status: 2}, {order: [sortName]}));
        setSharedProjects(await arachne.project.get({shared_id: arachne.me.id}, {order: [sortName]}));
    };
    const deleteProject = async id => {
        if(window.confirm(`Soll das Projekt mit der ID '${id}' wirklich gelöscht werden? Dieser Schritt kann nicht rückgängig gemacht werden.`)){
            //article
            const articleLst = await arachne.article.get({project_id: id});
            if(articleLst.length>0){await arachne.article.delete(articleLst.map(a=>a.id))}
            //zettelLnk
            const zettelLst = await arachne.sections.get({project_id: id});
            if(zettelLst.length>0){await arachne.sections.delete(zettelLst.map(z=>z.id))}
            //project
            await arachne.project.delete(id)
            await refreshPage();
        }
    };
    const copyProject = async oldProjectId => {
        // copy project
        let oldProject = await arachne.project.get({id: oldProjectId});
        oldProject = oldProject[0];
        delete oldProject.id;
        oldProject.shared_id = null;
        oldProject.name = `${oldProject.name}  (Kopie)`;
        const newProjectId = await arachne.project.save(oldProject);
        //copy zettelLnk
        const zettelLnk = await arachne.sections.get({project_id: oldProjectId});
        for(const z of zettelLnk){
            delete z.id;
            z.project_id = newProjectId;
            z.shared_id = null;
            await arachne.sections.save(z)
        }
        //copy article + zettelLnk
        const articleLst = await arachne.article.get({project_id: oldProjectId});
        for(const a of articleLst){
            const oldArticleId = a.id;
            delete a.id;
            a.project_id = newProjectId;
            a.shared_id = null;
            const newArticleId = await arachne.article.save(a);
            const zettelLnk = await arachne.sections.get({project_id: newProjectId, article_id: oldArticleId});
            for(const z of zettelLnk){
                z.article_id = newArticleId;
                await arachne.sections.save(z)
            }
        }
        await refreshPage();
    };
    const shareProject = async (newUserId, projectId) => {
        // to un-share project: newUserId = null
        let shared_id = null
        let user_id = null

        if(newUserId){
            const oldUserId = await arachne.project.get({id:projectId},{select: ["user_id"]})
            user_id = newUserId
            shared_id = oldUserId[0].user_id
        }else{
            const oldUserId = await arachne.project.get({id:projectId},{select: ["shared_id"]})
            shared_id = null
            user_id = oldUserId[0].shared_id
        }
        await arachne.project.save({id: projectId, shared_id: shared_id, user_id: user_id});
        const articleLst = await arachne.article.get({project_id: projectId});
        //copy zettelLnk
        for(const a of articleLst){
            a.user_id = user_id;
            a.shared_id = shared_id;
            const newArticleId = await arachne.article.save(a);
        }
        const zettelLnk = await arachne.sections.get({project_id: projectId});
        for(const z of zettelLnk){
            z.user_id = user_id;
            z.shared_id = shared_id;
            await arachne.sections.save(z)
        }
        await refreshPage();
    };
    return <>
        <Message show={renameId>0?true:false} title="Projekt umbenennen" msg="Geben Sie einen neuen Namen für das Projekt ein:" input={renameName} onReplay={async e=>{if(e!=-1 && e!=""){
            await arachne.project.save({id: renameId, name: e})
            await refreshPage();
        };
        setRenameId(0);
        }} />
        <Message show={shareId>0?true:false} title="Projekt freigeben" msg="Wem wollen Sie das Projekt freigeben?" dropDown={userLst} onReplay={async e=>{
            await shareProject(e, shareId);
            setShareId(0);
        }} />
        <Container>
        <Tabs defaultActiveKey="active">
            <Tab eventKey="active" title="aktive Projekte">
                <Container className="m-4" style={{width: "auto"}}>
                    <Table width="100%" hover>
                        <thead>
                            <tr><th width="30%">Name</th><th width="20%"></th><th width="20%">Änderungsdatum</th><th width="20%">Erstelldatum</th><th width="10%"></th></tr>
                        </thead>
                        <tbody>
                            {activeProjects.map(p => {
                                let editMenu = [
                                    ["umbenennen", ()=>{ 
                                        setRenameName(p.name);
                                        setRenameId(p.id);
                                    }],
                                    ["kopieren", async ()=>{copyProject(p.id)}],
                                    ["ins Archiv", async ()=>{await arachne.project.save({id: p.id, status:2});await refreshPage();}],
                                    ["freigeben", ()=>{setShareId(p.id)}]
                                ];
                                if(p.shared_id>0){
                                    editMenu = [
                                        ["umbenennen", ()=>{ 
                                            setRenameName(p.name);
                                            setRenameId(p.id);
                                        }],
                                        ["kopieren", async ()=>{copyProject(p.id)}],
                                        ["freigabe beenden", async ()=>{await shareProject(null, p.id)}]
                                    ];
                                }
                                return <ProjectRow
                                key={p.id}
                                p={p}
                                openProject={()=>{props.loadMain(null, "editor", p.id)}}
                                editMenu={editMenu}
                                deleteProject={async i=>{await deleteProject(i)}}
                            />;})}
                        </tbody>
                    </Table>
                </Container>
            </Tab>
            <Tab eventKey="archive" title="Archiv" disabled={archiveProjects.length===0?true:false}>
                <Container className="m-4" style={{width: "auto"}}>
                    <Table width="100%" hover>
                        <thead>
                            <tr><th width="30%">Name</th><th width="20%"></th><th width="20%">Änderungsdatum</th><th width="20%">Erstelldatum</th><th width="10%"></th></tr>
                        </thead>
                        <tbody>
                            {archiveProjects.map(p => {
                                return <ProjectRow
                                key={p.id}
                                openProject={null}
                                p={p}
                                editMenu={[
                                    ["zu den aktiven Projekten", async ()=>{await arachne.project.save({id: p.id, status:1});await refreshPage();}],
                                ]}
                                deleteProject={async i=>{await deleteProject(i)}}
                            />;
                            })}
                        </tbody>
                    </Table>
                </Container>
            </Tab>
            <Tab eventKey="shared" title="freigegebene Projekte" disabled={sharedProjects.length===0?true:false}>
                <Container className="m-4" style={{width: "auto"}}>
                    <Table width="100%" hover>
                        <thead>
                            <tr><th width="30%">Name</th><th width="20%">freigegeben</th><th width="20%">Änderufrengsdatum</th><th width="20%">Erstelldatum</th><th width="10%"></th></tr>
                        </thead>
                        <tbody>
                            {sharedProjects.map(p => {return <ProjectRow
                                key={p.id}
                                p={p}
                                editMenu={[
                                    ["nicht mehr freigeben", ()=>{shareProject(null, p.id)}]
                                ]}
                            />;})}
                        </tbody>
                    </Table>
                </Container>
            </Tab>
        </Tabs>
        </Container>
        <NavBarBottom refreshPage={async ()=>{await refreshPage();}} setSortName={e=>setSortName(e)} />
    </>
};

function ProjectRow(props){
    const [showEdit, setShowEdit] = useState(false)
    const [shared, setShared] = useState();
    const [isShared, setIsShared] = useState(false);
    useEffect(()=>{
        const getUserName = async id=>{
            const userName = await arachne.user.get({id: id});
            setShared(`${userName[0].first_name} ${userName[0].last_name}`);
        };
        if(props.p.shared_id>0&&props.p.status===4){getUserName(props.p.user_id)}
        else if(props.p.shared_id>0&&props.p.status===1){getUserName(props.p.shared_id);setIsShared(true)}
    },[]);
    return <tr style={{height: "49px"}} className={isShared?"text-primary":null} onMouseEnter={()=>{setShowEdit(true)}} onMouseLeave={()=>{setShowEdit(false)}}><td><b style={{cursor: props.openProject?"pointer":"default"}} onClick={()=>{if(props.openProject){props.openProject(props.p.id)}}}>{props.p.name}</b></td><td>{shared}</td><td>{props.p.u_date.substring(0, 16)}</td><td>{props.p.c_date.substring(0, 16)}</td><td>
    <Dropdown style={{display: showEdit?"block":"none"}}>
        <Dropdown.Toggle size="sm" variant="outline-primary">bearbeiten</Dropdown.Toggle>
        <Dropdown.Menu variant="dark">
            {props.editMenu.map(e=>{return <Dropdown.Item key={e[0]} onClick={()=>{e[1]()}}>{e[0]}</Dropdown.Item>;})}
            {props.deleteProject?<>
                <Dropdown.Divider />
                <Dropdown.Item onClick={()=>{props.deleteProject(props.p.id)}}>löschen</Dropdown.Item>
            </>:null}
        </Dropdown.Menu>
    </Dropdown>
    </td></tr>;
}
function NavBarBottom(props){
    const [showSort, setShowSort] = useState(false);
    const ToolKitItems = [
        ["Sortieren nach", ()=>{setShowSort(true)}],
        ["neues Projekt erstellen", async ()=>{
            if(window.confirm("Soll ein neues Projekt erstellt werden?")){
                await arachne.project.save({name: "Neues Projekt", user_id: arachne.me.id, status: 1});
                await props.refreshPage();
            }
        }],
    ];
    return <Navbar fixed="bottom" bg="light">
        <Message show={showSort} title="Sortierung der Projekte" msg="Wie sollen die Projekte sortiert werden? Nach ..." dropDown={[
            ["name", "Name"],
            ["u_date", "Änderungsdatum"],
            ["c_date", "Erstelldatum"],
        ]} onReplay={async e=>{
            setSetting("projectSort", e);
            props.setSortName(e);
            setShowSort(false);
        }} />
        <Container fluid>
            <Navbar.Collapse className="justify-content-start"></Navbar.Collapse>
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                    <ToolKit menuItems={ToolKitItems} />
                </Navbar.Text>
            </Navbar.Collapse>
        </Container>
    </Navbar>;
}

export { Overview };