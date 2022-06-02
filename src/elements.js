// Version 3.1 - 04.03.2022
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { faBan, faPlusCircle, faMinusCircle, faCheckCircle, faCloudMoon, faTimesCircle, faSyncAlt, faCat, faDog, faRecycle, faTrashAlt, faEllipsisV, faSearch, faCheck, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { Offcanvas, Alert, ButtonGroup, Button, Form, Modal, ListGroup, OverlayTrigger, Popover, Accordion, Spinner } from "react-bootstrap";
import DOMPurify from "dompurify";

import { arachne } from "./arachne.js";

function ask(question){
    const event = new CustomEvent('msg', {detail: {q: question}});
    document.body.dispatchEvent(event);
}

function Message(props){
    const [inputTxt, setInputTxt] = useState(props.input)
    const [selectValue, setSelectValue] = useState(props.dropDown&&props.dropDown.length>0?props.dropDown[0][0]:null);
    const [status, setStatus] = useState()
    useEffect(()=>{setInputTxt(props.input)}, [props.input])
    useEffect(()=>{setSelectValue(props.dropDown&&props.dropDown.length>0?props.dropDown[0][0]:null)}, [props.dropDown])
    useEffect(()=>{setStatus(null)}, [props.show])
    return <Modal show={props.show} onHide={()=>{props.onReplay(false)}} backdrop="static">
    <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
    </Modal.Header>

    <Modal.Body>
        <p>{props.msg}</p>
        {props.input!=null?<Form.Control size="sm" type="text" placeholder="..." value={inputTxt} onChange={e=>(setInputTxt(e.target.value))} />:null}
        {props.dropDown?<Form.Select size="sm" onChange={e=>{setSelectValue(e.target.value)}}>{props.dropDown.map(d=><option key={d[0]} value={d[0]}>{d[1]}</option>)}</Form.Select>:null}
    </Modal.Body>

    <Modal.Footer>
        <Button variant="secondary" onClick={()=>{props.onReplay(false)}}>Abbrechen</Button>
        <Button variant="primary" onClick={()=>{
            setStatus(<Spinner style={{marginLeft: "10px"}} animation="border" size="sm" />)
            let replay = true;
            if(props.input!=null){replay=inputTxt}
            else if(props.dropDown!=null){replay=selectValue};
            props.onReplay(replay);
            }}>OK{status}</Button>
    </Modal.Footer>
</Modal>;
}
function sqlDate(s){ // s = sql date string
    return new Date(
        parseInt(s.substring(0, 4)), // year
        (parseInt(s.substring(5, 7))-1), // month index
        parseInt(s.substring(8, 10)), // day
        parseInt(s.substring(11, 13)),
        parseInt(s.substring(14, 16)),
        parseInt(s.substring(17, 19)),
        s.length>19?parseInt(s.substring(20, 23)):0
    );
}

async function sleep(milliseconds){await new Promise((resolve, reject)=>{setTimeout(()=>{resolve()}, milliseconds)})}

function useIsMounted(){
    const isMountedRef = useRef(true);
    const isMounted = useCallback(()=>isMountedRef.current, []);
    
    useEffect(()=>{
        return () => void (isMountedRef.current = false);
    }, []);
    return isMounted;
}
function StatusButton(props){
    const [status, setStatus] = useState(null);
    const [style, setStyle] = useState({display: "inline-block"});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [variant, setVariant] = useState(props.variant?props.variant:"primary");
    const isMounted = useIsMounted();
    useEffect(()=>{
        let newStyle = props.style;
        if(newStyle){newStyle.display = "inline-block"}
        else{newStyle = {display: "inline-block"}}
        setStyle(newStyle);
    }, [props.style]);

    return <div style={style} className={props.className}><Button size={props.size?props.size:null} variant={variant} onClick={async ()=>{
        setStatus(<Spinner style={{marginLeft: "10px"}} animation="border" size="sm" />);
        const re = await props.onClick();
        if(isMounted()&&re){
            if(re.status===true||re.status===1){
                setStatus(<FontAwesomeIcon style={{marginLeft: "10px"}} icon={faCheck} />);
                setVariant("success");
                setSuccess(re.success);
            } else if(re.status===0){
                setStatus(<FontAwesomeIcon style={{marginLeft: "10px"}} icon={faBan} />);
                setVariant("warning");
            } else { // false || -1
                setStatus(<FontAwesomeIcon style={{marginLeft: "10px"}} icon={faExclamationTriangle} />);
                setVariant("danger");
                setError(re.error);
            }
            await sleep(re.error||re.success?4000:2000);
            if(isMounted()){
                setVariant(props.variant?props.variant:"primary");
                setStatus(null);
                setError(null);
                setSuccess(null);
            }
        }
    }}>{props.value}{status}</Button><div className="mt-2 text-danger">{error}</div><div className="mt-2 text-success">{success}</div></div>;
}
function SearchHint(props){
    return <Alert style={{marginTop: "150px", textAlign: "center"}} variant="dark">
        Starten Sie eine neue Suche, indem Sie unten links auf <FontAwesomeIcon icon={faSearch} /> klicken.
    </Alert>;
}
function ToolKit(props){
    const [active, setActive] = useState(null);
    const isMounted = useIsMounted();

    let cKey = -1;
        let menuItems = [];
        for(const item of props.menuItems){
            cKey ++;
            menuItems.push(<ListGroup.Item key={cKey} id={cKey} variant="light" onClick={async e=>{
                setActive(parseInt(e.target.id));
                await item[1]();
                if(isMounted()){
                    setActive(null);
                    document.body.click();
                }
            }} action>
                {item[0]}{active===cKey?<Spinner size="sm" style={{marginLeft: "5px"}} animation="border" />:null}
            </ListGroup.Item>);
        }    
    return <OverlayTrigger
        trigger="click"
        placement={props.direction==="down"?"bottom":"top"}
        rootClose={true}
        overlay={
            <Popover>
                <Popover.Body>
                    <ListGroup variant="flush">
                        {menuItems}
                    </ListGroup>
                </Popover.Body>
            </Popover>
        }
    ><Button variant="dark" size="sm"><FontAwesomeIcon id="mainAddButton" icon={faEllipsisV} /></Button></OverlayTrigger>;
}

class SearchInput extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            id: this.props.itemId,
            c:  this.props.c,
            o:  this.props.o,
            v: this.props.v,
        }
        this.item = props.item;
    }
    render(){
        let options = [];
        for(const o of this.props.searchOptions){
            options.push(<option key={o[0]} value={o[0]}>{o[1]}</option>);
        }
        return (
        <div className="searchInput">
            <select style={{width: "100px", marginRight: "5px", border: "none", color: "#284b63"}} value={this.state.c} onChange={e=>{this.setState({c: e.target.value})}}>
                {options}
            </select>
            <select style={{width: "40px", marginRight: "5px", border: "none", color: "#284b63"}} value={this.state.o} onChange={e=>{this.setState({o: e.target.value})}}>
                <option value="=">=</option>
                <option value="!=">≠</option>
                <option value=">">&gt;</option>
                <option value=">=">≥</option>
                <option value="<">&lt;</option>
                <option value="<=">≤</option>
            </select>
            <input type="text" placeholder="..."  style={{width: "100px", marginRight: "22px", border:"none"}} onKeyUp={e=>{if(e.keyCode===13){this.props.clickButton()}}} value={this.state.v} onChange={e=>{this.setState({v: e.target.value})}} />
            <FontAwesomeIcon color="LightGray" icon={faMinusCircle} onClick={
                () => {this.props.removeSearchFields(this.props.itemId)}} />
        </div>
        );
    }
    componentDidUpdate(prevProps, prevState){
        if(prevState.c!=this.state.c||prevState.o!=this.state.o||prevState.v!=this.state.v){
            this.props.changeItem(this.state);
        }
    }
}

function SearchBox(props){
    const [showSearch, setShowSearch] = useState(false);
    const [error, setError] = useState(null);
    const [firstID, setfID] = useState(null);
    const [lastID, setlID] = useState (null);
    const [searchType, setSearchType] = useState(props.presetOptions?JSON.parse(props.presetOptions[0][0]):null); // preset type
    const [forcedUpdate, setForcedUpdate] = useState(false); // SHOULD BE REMOVED!

    const [sOrder, setSOrder] = useState(JSON.parse(props.sortOptions[0][0]));
    const [nextID, setNextID] = useState(1);
    const [searchFields, setSearchFields] = useState([{id: 0, c:props.searchOptions[0][0], o:"=", v:""}]);

    const txtStyle = {boxShadow: "none", width: "100px", padding: "0px 5px", margin: "0px"};

    const errorMsg = <Alert variant="danger" style={{padding: "5px"}}>Bitte tragen Sie gültige IDs ein!</Alert>;
    useEffect(()=>{
        if(props.presetOptions){ setSearchType(JSON.parse(props.presetOptions[0][0])) }
    }, [showSearch]);
    useEffect(() => {
        let storedItems = localStorage.getItem("searchBox_"+props.boxName);
        if(props.setupItems){
            /*
            setSearchFields(props.setupItems);
            setNextID(props.setupItems.length);
            setForcedUpdate(true);
            */
        } else if(storedItems){
            storedItems = JSON.parse(storedItems);
            setSearchFields(storedItems[0]);
            setNextID(storedItems[1]);
            setSOrder(storedItems[2]);
            setForcedUpdate(true);
            //this.setState({forceSearch: true, searchFields: storedItems[0], nextID: storedItems[1] , sOrder: storedItems[2]});
        }
    }, []);
    useEffect(() => {
        if(props.setupItems){
            setSearchFields(props.setupItems);
            setNextID(props.setupItems.length);
            setForcedUpdate(true);
        }
    }, [props.setupItems]);

    useEffect(()=>{
        if(forcedUpdate){
            setForcedUpdate(false);
            sendQuery();
        }
    }, [forcedUpdate]);

    const removeSearchFields = id => { setSearchFields(searchFields.filter(s => s.id!==id)) };
    const addSearchFields = () => {
        let nSearchFields = searchFields;
        nSearchFields.push({
            id: nextID,
            c: props.searchOptions[0][0],
            o: "=",
            v: ""
        });
        setNextID(nextID+1);
        setSearchFields(nSearchFields);
    };
    const sendQuery = () => {
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
            localStorage.setItem("searchBox_"+props.boxName, JSON.stringify([searchFields, nextID, sOrder]));
            props.searchQuery(exportSF, sOrder);
            setShowSearch(false);
        } else {setError(<Alert variant="danger" style={{padding: "5px"}}>Geben Sie einen Suchtext ein!</Alert>)}
    };
    let cSF = [];
    for(const sF of searchFields){
        cSF.push(<SearchInput searchOptions={props.searchOptions} removeSearchFields={id => {removeSearchFields(id)}} itemId={sF.id} key={sF.id} c={sF.c} o={sF.o} v={sF.v} clickButton={sendQuery} changeItem={item=>{
            setSearchFields(searchFields.map(s=>{if(s.id===item.id){return item}else{return s}}));
        }} />);
    }

    return <>
        <ButtonGroup>
            <Button style={{width: "300px"}} variant="outline-dark" disabled>{props.status?props.status:""}</Button>
            <Button variant="dark" accessKey="s" onClick={()=>setShowSearch(true)}><FontAwesomeIcon icon={faSearch} /></Button>
        </ButtonGroup>
        <Modal show={showSearch} onHide={()=>setShowSearch(false)} centered={true} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Suche</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div accessKey="w" onClick={()=>{setShowSearch(false)}} hidden />
                <Accordion defaultActiveKey="search">
                    <Accordion.Item eventKey="search">
                        <Accordion.Header>normale Suche</Accordion.Header>
                        <Accordion.Body>
                            <div className="searchBox d-flex flex-wrap">
                                {cSF}
                                <FontAwesomeIcon color="LightGray" icon={faPlusCircle} style={{color: "var(--mainColor)", position: "relative", top: "6px", fontSize: "25px", cursor: "pointer"}}  onClick={() => {setError(null);addSearchFields()}}
                                />
                            </div>
                            <div>
                                {error}
                                <Button variant="primary" onClick={sendQuery}>anwenden</Button>
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    {props.presetOptions&&<Accordion.Item eventKey="preset">
                        <Accordion.Header>voreingestellte Suche</Accordion.Header>
                        <Accordion.Body>
                            <p>
                                Um eine voreingestellte Suche auszuführen, geben Sie die ID des ersten Zettels und die ID des letzten Zettels ein, wählen Sie die Art der Suche und klicken Sie auf "anwenden".
                            </p>
                            <p>
                                ID von <input type="text" style={txtStyle} onChange={e=>{
                                if(e.target.value.match(/\D/)==null){
                                    setError(null);
                                    setfID(e.target.value);
                                }else{
                                    setError(errorMsg)
                                    setfID(null);
                                }
                            }} /> bis <input type="text" style={txtStyle} onChange={e=>{
                                if(e.target.value.match(/\D/)==null){
                                    setError(null);
                                    setlID(e.target.value);
                                }else{
                                    setError(errorMsg)
                                    setlID(null);
                                }
                            }} />
                            </p>
                            <p>
                                Typ: <SelectMenu  style={{width: "200px", marginLeft: "15px", display: "inline-block"}} options={props.presetOptions} onChange={e=>{setSearchType(JSON.parse(e.target.value))}} />
                            </p>
                            {error}
                            <Button variant="primary" onClick={()=>{
                                if(firstID&&lastID){
                                    let newSearchFields = searchType;
                                    newSearchFields.push({id: 0, c: "id", o: ">=", v: firstID});
                                    newSearchFields.push({id: 1, c: "id", o: "<=", v: lastID});
                                    setSearchFields(newSearchFields);
                                    setForcedUpdate(true);
                                } else {
                                    setError(errorMsg);
                                }
                            }}>
                                anwenden
                            </Button>
                        </Accordion.Body>
                    </Accordion.Item>}
                </Accordion>
            </Modal.Body>
            <Modal.Footer>
                <div style={{float: "right", marginTop: "10px", marginRight: "20px"}}>
                    <span style={{marginLeft: "30px", marginRight: "10px"}} className="minorTxt">sortieren nach</span>
                    <SelectMenu style={{display: "inline-block", width: "100px", padding: "0px"}} value={JSON.stringify(sOrder)} options={props.sortOptions} onChange={event=>{setSOrder(JSON.parse(event.target.value))}} />
                </div>
            </Modal.Footer>
        </Modal>
    </>;
}

class Navigator extends React.Component{
    constructor(props){
        super(props);
        this.state = {currentPage: this.props.currentPage};
    }
    render(){
        return <div id="navBox" style={{display: "flex", marginRight: "20px"}}>
                <Button style={{borderRadius: "0.2rem 0 0 0.2rem"}} variant="secondary" size="sm" onClick={()=>{window.scrollTo(0,0);this.loadPage(-1)}} disabled={this.state.currentPage===1?true:false}>&lt;</Button>
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
                type="text" value={this.state.currentPage} onChange={e=>{this.setState({currentPage: e.target.value})}} onKeyUp={e=>{
                    if(e.keyCode===13){
                        if(!isNaN(e.target.value)){
                            window.scrollTo(0, 0);
                            this.loadPage(parseInt(e.target.value)-this.props.currentPage);
                        } else {
                            this.setState({currentPage: this.props.currentPage});
                        }
                    }
                }} /> von {this.props.maxPage}</div>
                <Button  style={{borderRadius: "0 0.2rem 0.2rem 0"}} variant="secondary" size="sm" onClick={()=>{window.scrollTo(0,0);this.loadPage(1)}} disabled={this.state.currentPage===this.props.maxPage?true:false}>&gt;</Button>
            </div>;
        
    }
    componentDidUpdate(prevProps){
        if(prevProps.currentPage!=this.props.currentPage){
            this.setState({currentPage: this.props.currentPage})
        }
    }
    loadPage(move){
        if(this.props.currentPage+move>0&&this.props.currentPage+move<=this.props.maxPage){
            this.props.loadPage(this.props.currentPage+move);
        } else {
            this.setState({currentPage: this.props.currentPage});
        }
    }
}
class Status extends React.Component{
    constructor(props){
        super(props);
        this.state = {id: this.props.status.id, visible: false}
        this.timeOutHandle = null;
    }
    render(){
        if(this.state.visible){
            let style={
                position: "fixed",
                bottom: "30px",
                left: "30px",
                /*backgroundColor: "white",*/
                boxShadow: "0 2px 5px #d9d9d9",
                transition: "opacity 0.5s",
                opacity: "1",
                borderRadius: "3px",
                overflow: "hidden",
                zIndex: 9000000
            };
            let statusTxt = "";
            let statusSymbol = null;
            switch(this.state.type){
                case "searching":
                    statusSymbol = <div style={{display: "inline-block", backgroundColor:"#246EB9"}}><FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", fontSize:"40px"}} icon={faSyncAlt} spin /></div>;
                    statusTxt = "Suche läuft...";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    break;
                case "found":
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#4CB944", fontSize:"40px"}} icon={faDog} />;
                    statusTxt = "Einträge gefunden!";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        if(this.statusBox.current!=null){
                            this.statusBox.current.style.opacity = "0";
                            setTimeout(()=>{this.setState({visible: false})}, 500);
                        }
                    }, 3000);
                    break;
                case "notFound":
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#353535", fontSize:"40px"}} icon={faCat} />;
                    statusTxt = "Keine Einträge gefunden!";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        if(this.statusBox.current!=null){
                            this.statusBox.current.style.opacity = "0";
                            setTimeout(()=>{this.setState({visible: false})}, 500);
                        }
                    }, 3000);
                    break;
                case "saved":
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#4CB944", fontSize:"40px"}} icon={faCheckCircle} />;
                    statusTxt = "Speichern erfolgreich.";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        if(this.statusBox.current!=null){
                            this.statusBox.current.style.opacity = "0";
                            setTimeout(()=>{this.setState({visible: false})}, 500);
                        }
                    }, 2000);
                    break;
                case "error":
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#F06543", fontSize:"40px"}} icon={faTimesCircle} />;
                    statusTxt = "Ein Fehler ist aufgetreten.";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        if(this.statusBox.current!=null){
                            this.statusBox.current.style.opacity = "0";
                            setTimeout(()=>{this.setState({visible: false})}, 500);
                        }
                    }, 3000);
                    break;
                case "saving":
                    statusTxt = "Einträge werden gespeichert.";
                    statusSymbol = <div style={{display: "inline-block", backgroundColor:"#246EB9"}}><FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", fontSize:"40px"}} icon={faSyncAlt} spin /></div>;
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = null;
                    break;
                case "deleting":
                    statusTxt = "Eintrag wird gelöscht.";
                    statusSymbol = <div style={{display: "inline-block", backgroundColor:"#246EB9"}}><FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", fontSize:"40px"}} icon={faRecycle} spin /></div>;
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = null;
                    break;
                case "deleted":
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#F06543", fontSize:"40px"}} icon={faTrashAlt} />;
                    statusTxt = "Löschen erfolgreich.";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        if(this.statusBox.current!=null){
                            this.statusBox.current.style.opacity = "0";
                            setTimeout(()=>{this.setState({visible: false})}, 500);
                        }
                    }, 2000);
                    break;
                default:
                    statusTxt = "Programm arbeitet.";
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#F5EE9E", fontSize:"40px"}} icon={faCloudMoon} />;
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        if(this.statusBox.current!=null){
                            this.statusBox.current.style.opacity = "0";
                            setTimeout(()=>{this.setState({visible: false})}, 500);
                        }
                    }, 2000);
            }
            if(this.state.value!=null){statusTxt=this.state.value}
            return null;
            //return <div ref={this.statusBox} style={style}  className="mainColors">{statusSymbol}<span style={{position:"relative", top: "-10px", padding: "10px 20px"}}>{statusTxt}</span></div>;
        } else {
            return null;
        }
    }
    componentDidUpdate(){
        if(this.props.status.id!=this.state.id){
            this.setState({id: this.props.status.id, visible: true, type: this.props.status.type, value: this.props.status.value});
        }
    }
}
class SelectMenu extends React.Component{
    render(){
        let options = [];
        for(const op of this.props.options){
            options.push(<option key={op[0]} value={op[0]}>{op[1]}</option>)
        }
        return <Form.Select className={this.props.classList} value={this.props.value} style={this.props.style} onChange={event=>{this.props.onChange(event)}}>
            {options}
        </Form.Select>;
/*<select className={this.props.classList} value={this.props.value} style={{width:"100%"}} onChange={event=>{this.props.onChange(event)}}>
    {options}
</select>*/
    }
}
class AutoComplete extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            options: [],
            currentOptionId: null,
            userSelected: false
        };
    }
    render(){
        let optionsBoxStyle = {
            position: "absolute",
            boxShadow: "0 1px 5px #d9d9d9",
            padding: "10px 15px",
            zIndex: 1000000
        };
        let optionsElement = [];
        if(this.state.options.length>0&&this.state.userSelected===false){
            let i = -1;
            for(const option of this.state.options){
                i++;
                optionsElement.push(<div key={option.id} id={i} data-id={option.id} data-value={option[this.props.returnCol]} onClick={e=>{this.props.onChange(e.target.dataset.value, e.target.dataset.id);this.setState({userSelected: true})}} style={{cursor: "default", color: this.state.currentOptionId===i?"#2364AA":"inherit"}}>{option[this.props.returnCol]}</div>);
            }
        }
        return <div>
            <input style={this.props.style} type="text" value={this.props.value} onBlur={()=>{setTimeout(()=>{this.setState({userSelected: true})},300)}} onChange={e=>{this.changeInputValue(e.target.value)}} onKeyDown={e=>{this.changeSelectedOption(e)}} />
            {optionsElement.length>0?<div style={optionsBoxStyle} className="mainColors">{optionsElement}</div>:null}
        </div>;
    }
    async changeInputValue(newValue){
        this.props.onChange(newValue, null);
        if(newValue!=""){
            let query = {};
            query[this.props.searchCol] = newValue+"*";
            const newOptions = await arachne[this.props.tbl].get(query, {select: ["id", this.props.returnCol], limit:10, order: [this.props.searchCol]});
            this.setState({currentOptionId: newOptions.length>0?0:null, options: newOptions, userSelected: false});
        } else {
            // empty string;
            this.setState({currentOptionId: null, options: [], userSelected: false});
        }
    }
    changeSelectedOption(e){
        if(e.keyCode===38&&this.state.currentOptionId>0){
            // up
            this.setState({currentOptionId: this.state.currentOptionId-1});
        } else if (e.keyCode===40&&this.state.currentOptionId<this.state.options.length-1){
            // down
            this.setState({currentOptionId: this.state.currentOptionId+1});
        } else if (e.keyCode===13){
            // enter
            this.props.onChange(this.state.options[this.state.currentOptionId][this.props.returnCol], this.state.options[this.state.currentOptionId].id);
            this.setState({userSelected: true});
        }
    }
}

class SelectorWrapper extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return <div className={"selectWrapper"+(this.props.isSelected==="1"?" selMarked":"")} style={{display:"block", transition:"box-shadow 0.3s", margin: "10px 5px", marginLeft: "auto", marginRight: "auto", width: arachne.options.z_width+"px", minHeight: arachne.options.z_height+"px", borderRadius: "7px"}} id={this.props.children.props.id} ref={this.element} onClick={event=>{event.stopPropagation()}} onMouseUp={event=>{this.props.onSelect(this.props.children, {shift: event.shiftKey, meta: event.metaKey, ctrl: event.ctrlKey})}}>{this.props.children}</div>;
    }
}
class Selector  extends React.Component{
    constructor(props){
        super(props);
        let style = {display: "block", textAlign: "center"}
        if(this.props.multiSelect){
            style.userSelect = 'none';
            style.msUserSelect = 'none';
            style.WebkitUserSelect = 'none';
        }
        this.state = {currentId: 0, ids: [], style: style};
        /*
        if(onEdit!=null){this.ctn.querySelectorAll(selector).forEach(function(e){
                e.classList.add("selEditable");
        })}*/
    }
    render(){
        let children = React.Children.map(this.props.children, child => {
            return <SelectorWrapper isSelected={this.state.ids.includes(child.props.id)?"1":"0"} onSelect={(e, keys)=>{this.select(e, keys)}}>{child}</SelectorWrapper>;
        })
        return <div
            style={this.state.style}
            className={this.props.className}
            onClick={
                ()=>{
                    this.select(null, {});
                }}
        >
        {children}
        </div>;
    }
    select(element, keys){
        if(element===null){
            this.setState({currentId: 0, ids: []});
            this.props.selectCallback(null, {currentId: 0, ids: []});
        } else {
            const targetId = element.props.id;
            if(this.props.multiSelect&&keys.shift){
                //multiselect
                let inRange = false;
                let newIds = [];
                React.Children.forEach(this.props.children, child => {
                    if(inRange==false&&(child.props.id===targetId||child.props.id===this.state.currentId)){
                        // start of range
                        inRange = true;
                        newIds.push(child.props.id);
                    } else if(inRange&&(child.props.id!==targetId&&child.props.id!==this.state.currentId)){
                        // in range
                        newIds.push(child.props.id);
                    } else if(inRange){
                        // end of range
                        inRange = false;
                        newIds.push(child.props.id);
                    }
                });
                this.setState({currentId: targetId, ids: newIds});
                this.props.selectCallback(element, {currentId: targetId, ids: newIds});
            } else if(this.props.multiSelect&&(arachne.me.selectKey==="cmd"&&keys.meta||arachne.me.selectKey==="ctrl"&&keys.ctrl)){
                // select/deselect while keeping selection
                let newIds = this.state.ids;
                if(newIds.includes(targetId)){
                    newIds = newIds.filter(itemId => itemId!=targetId);
                } else {newIds.push(targetId)}
                this.setState({currentId: targetId, ids: newIds});
                this.props.selectCallback(element, {currentId: targetId, ids: newIds});
            } else {
                // single select
                this.setState({currentId: targetId, ids: [targetId]});
                this.props.selectCallback(element, {currentId: targetId, ids: [targetId]});
            }
        }
    }
    componentDidUpdate(prevProps){
        if(prevProps.preset!==this.props.preset){
            setTimeout(()=>{
                let el = document.querySelector("div.selMarked");
            if(el){el.scrollIntoView({behavior: "smooth", block: "center"})};
            }, 300);
            this.setState({currentId: this.props.preset[0], ids: this.props.preset});
        }
    }
}

function parseHTML(i, replaceEntities=true){
    // parses masked HTML tags and purifies them.
    if(i==null){
        return {__html: null};
    }else{
        if(replaceEntities){
            return {__html: DOMPurify.sanitize(i.replace(/&lt;/g, "<").replace(/&gt;/g, ">"), { ADD_TAGS: ["aut", "gruen", "gelb", "rot", "blau"] })};
        }else{
            return {__html: DOMPurify.sanitize(i, { ADD_TAGS: ["aut", "gruen", "gelb", "rot", "blau"] })};
        }

    }
}
function parseHTMLPreview(i){
    // creates preview of HTML tags.
    if(i==null){
        return "";
    }else{
        return i.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    }
}
function Aside(props){
    const [show, setShow] = useState(true);
    useEffect(()=>{
        if(props.show){setShow(true)}
        else{setShow(false)}
    },[props.show]);
    return <Offcanvas show={show} onHide={()=>{props.onClose()}} placement="end" scroll={true} backdrop={false}>
        <Offcanvas.Header closeButton>
            <Offcanvas.Title></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
            {props.children}
        </Offcanvas.Body>
    </Offcanvas>;
}

const useIntersectionObserver = ({
    target,
    onIntersect,
    threshold = [0, 0.25, 0.5, 0.75, 1],//0.1,
    rootMargin = "0px"
  }) => {
    useEffect(() => {
            const observer = new IntersectionObserver(onIntersect, {
                rootMargin,
                threshold
            });
            const current = target.current;
            if(current){
                observer.observe(current);
                return () => {
                    observer.unobserve(current);
                };
            }
    });
};

function useShortcuts(callback, debug=false){
    const handleKeyUp = useCallback(e => {
        if(debug){console.log("key press:", e.key)}
        for(const item of callback){
            const keyCombo = item[0].split("+");
            let found = true;
            for(const w of keyCombo){
                if(w==="ACTION"&&(
                    (arachne.options.action_key==="alt"&&e.altKey) ||
                    (arachne.options.action_key==="ctrl"&&e.ctrlKey) ||
                    (arachne.options.action_key==="cmd"&&e.metaKey)
                )){found=true} // arachne action key
                else if(w==="CTRL"&&e.ctrlKey){found=true}
                else if(w==="SHIFT"&&e.shiftKey){found=true}
                else if(w==="CMD"&&e.metaKey){found=true}
                else if(w==="ESC"&&e.keyCode===27){found=true}
                else if(w==="0"&&e.keyCode===48){found=true}
                else if(w==="1"&&e.keyCode===49){found=true}
                else if(w==="2"&&e.keyCode===50){found=true}
                else if(w==="3"&&e.keyCode===51){found=true}
                else if(w==="4"&&e.keyCode===52){found=true}
                else if(w==="5"&&e.keyCode===53){found=true}
                else if(w==="6"&&e.keyCode===54){found=true}
                else if(w==="7"&&e.keyCode===55){found=true}
                else if(w==="8"&&e.keyCode===56){found=true}
                else if(w==="9"&&e.keyCode===57){found=true}
                else if(w==="a"&&e.keyCode===65){found=true}
                else if(w==="b"&&e.keyCode===66){found=true}
                else if(w==="c"&&e.keyCode===67){found=true}
                else if(w==="d"&&e.keyCode===68){found=true}
                else if(w==="e"&&e.keyCode===69){found=true}
                else if(w==="f"&&e.keyCode===70){found=true}
                else if(w==="g"&&e.keyCode===71){found=true}
                else if(w==="h"&&e.keyCode===72){found=true}
                else if(w==="i"&&e.keyCode===73){found=true}
                else if(w==="j"&&e.keyCode===74){found=true}
                else if(w==="k"&&e.keyCode===75){found=true}
                else if(w==="l"&&e.keyCode===76){found=true}
                else if(w==="m"&&e.keyCode===77){found=true}
                else if(w==="n"&&e.keyCode===78){found=true}
                else if(w==="o"&&e.keyCode===79){found=true}
                else if(w==="p"&&e.keyCode===80){found=true}
                else if(w==="q"&&e.keyCode===81){found=true}
                else if(w==="r"&&e.keyCode===82){found=true}
                else if(w==="s"&&e.keyCode===83){found=true}
                else if(w==="t"&&e.keyCode===84){found=true}
                else if(w==="u"&&e.keyCode===85){found=true}
                else if(w==="v"&&e.keyCode===86){found=true}
                else if(w==="w"&&e.keyCode===87){found=true}
                else if(w==="x"&&e.keyCode===88){found=true}
                else if(w==="y"&&e.keyCode===89){found=true}
                else if(w==="z"&&e.keyCode===90){found=true}
                else if(w==="<"&&e.keyCode===60){found=true}
                else if(w===">"&&e.shiftKey&&e.keyCode===60){found=true}
                else if(w==="."&&e.keyCode===190){found=true}
                else if(w===","&&e.keyCode===188){found=true}
                else if(w==="ArrowLeft"&&e.keyCode===37){found=true}
                else if(w==="ArrowUp"&&e.keyCode===38){found=true}
                else if(w==="ArrowRight"&&e.keyCode===39){found=true}
                else if(w==="ArrowDown"&&e.keyCode===40){found=true}
                else{found=false}
                if(!found){break;}
            }
            if(found){item[1]();break;};
        }
    }, [callback]);
    useEffect(() => {
        window.addEventListener("keyup", handleKeyUp);
        return () => {window.removeEventListener("keyup", handleKeyUp)};
    }, [handleKeyUp]);
}

export { Navigator, parseHTML, parseHTMLPreview, SearchBox, SearchInput, Status, SelectMenu, Selector, ToolKit, AutoComplete, Aside, SearchHint, StatusButton, sleep, sqlDate, Message, useIntersectionObserver, useShortcuts };