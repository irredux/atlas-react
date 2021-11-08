import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { faPlusCircle, faMinusCircle, faAngleUp, faAngleDown, faCheckCircle, faCloudMoon, faTimesCircle, faSyncAlt, faCat, faDog } from "@fortawesome/free-solid-svg-icons";
import DOMPurify from "dompurify";

import { arachne } from "./arachne.js";

class SearchInput extends React.Component{
    constructor(props){
        super(props);
        this.item = props.item;
    }
    render(){
        let options = [];
        for(const o of this.props.searchOptions){
            options.push(<option key={o[0]} value={o[0]}>{o[1]}</option>);
        }
        return (
        <div className="searchFields mainColors" style={{boxShadow: "rgb(217, 217, 217) 0px 0px 2px", marginRight: "10px", marginBottom: "10px", padding: "10px 15px 10px 15px"}}>
            <select style={{width: "100px", marginRight: "0px", border: "none", color: "#284b63"}}>
                {options}
            </select>
            <select style={{width: "40px", marginRight: "0px", border: "none", color: "#284b63"}}>
                <option value="=">=</option>
                <option value="!=">≠</option>
                <option value=">">&gt;</option>
                <option value=">=">≥</option>
                <option value="<">&lt;</option>
                <option value="<=">≤</option>
            </select>
            <input type="text" placeholder="..."  style={{width: "100px", marginRight: "22px", border:"none"}} onKeyUp={e=>{if(e.keyCode===13){this.props.clickButton()}}} />
            <FontAwesomeIcon color="LightGray" icon={faMinusCircle} onClick={
                () => {this.props.removeSearchFields(this.props.item.id)}} />
        </div>
        );
    }
}
class SearchBox extends React.Component{
    constructor(props){
        super(props);
        this.queryTxt = "";
        this.state = {nextID: 1, searchFields: [{id: 0, c:"lemma", o:"=", v:""}]};
        this.sOrder = null;
    }
    render(){
        let cSF = [];
        for(const sF of this.state.searchFields){
            cSF.push(<SearchInput searchOptions={this.props.searchOptions} removeSearchFields={id => {this.removeSearchFields(id)}} item={sF} key={sF.id} clickButton={()=>{this.sendQuery()}} />);
        }
        return <div style={{gridArea: this.props.gridArea}}>
            <div className="searchBox">
                {cSF}
                <FontAwesomeIcon color="LightGray" icon={faPlusCircle} style={{color: "var(--mainColor)", position: "relative", top: "-5px", fontSize: "25px"}}  onClick={() => {this.addSearchFields()}}
                 />
            </div>
            <div style={{float: "right", marginTop: "10px", marginRight: "20px"}}>
            <input type="button" value="suchen" onClick={() => {this.sendQuery()}} />
            <span style={{marginLeft: "50px", marginRight: "10px"}} className="minorTxt">sortieren:</span><SelectMenu style={{display: "inline-block", width: "100px"}} options={this.props.sortOptions} onChange={event=>{this.sOrder = JSON.parse(event.target.value)}} />
            </div>
        </div>
    }

    removeSearchFields(id){
        const nSearchFields = this.state.searchFields.filter(s => s.id!==id);
        this.setState({searchFields: nSearchFields});
    }
    addSearchFields(){
        let nSearchFields = this.state.searchFields;
        nSearchFields.push({
            id: this.state.nextID,
            c: "lemma",
            o: "=",
            v: ""
        });
        this.setState({nextID: (this.state.nextID+1), searchFields: nSearchFields});
    }
    sendQuery(){
        let exportSF = [];
        const searchFields = document.querySelectorAll(".searchFields");
        for(const sF of searchFields){
            if(sF.children[2].value !== ""){
                exportSF.push({
                    c: sF.children[0].value,
                    o: sF.children[1].value,
                    v: sF.children[2].value
                });
            }
        }
        if(exportSF.length > 0){this.props.searchQuery(exportSF, this.sOrder)} 
        else {alert("Geben Sie einen Suchtext ein!")}
    }
}

class Navigator extends React.Component{
    constructor(props){
        super(props);
        this.state = {currentPage: this.props.currentPage};
    }
    render(){
        /* <span contentEditable="true" onChange={e=>{
                        console.log("blupp", e.target.textContent);
                    }}>{this.props.currentPage}</span> */
        return <div id="navBox">
                <div id="navScreen" onClick={()=>{window.scrollTo(0,0)}}><FontAwesomeIcon icon={faAngleUp} /></div>
                <div id="navPage">
                    <span onClick={()=>{window.scrollTo(0,0);this.loadPage(-1)}}>&lt;</span>
                    <span id="navSelect"> <input style={{
                        width: "30px",
                        border: "none",
                        boxShadow: "none",
                        padding: 0,
                        margin: 0,
                        textAlign: "right"
                    }}
                    type="text" value={this.state.currentPage} onChange={e=>{this.setState({currentPage: e.target.value})}} onBlur={e=>{
                        if(!isNaN(e.target.value)){
                            window.scrollTo(0, 0);
                            this.loadPage(parseInt(e.target.value)-this.props.currentPage);
                        } else {
                            this.setState({currentPage: this.props.currentPage});
                        }
                    }} /> von {this.props.maxPage}</span>
                    <span onClick={()=>{window.scrollTo(0,0);this.loadPage(1)}}>&gt;</span>
                </div>
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
        this.statusBox = React.createRef();
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
                    statusSymbol = <div style={{display: "inline-block", backgroundColor:"#246EB9"}}><FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", fontSize:"40px"}} icon={faSyncAlt} spin /></div>;
                    statusTxt = "Suche läuft...";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    break;
                case "found":
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#4CB944", fontSize:"40px"}} icon={faDog} />;
                    statusTxt = "Einträge gefunden!";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        this.statusBox.current.style.opacity = "0";
                        setTimeout(()=>{this.setState({visible: false})}, 500);
                    }, 3000);
                    break;
                case "notFound":
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#353535", fontSize:"40px"}} icon={faCat} />;
                    statusTxt = "Keine Einträge gefunden!";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        this.statusBox.current.style.opacity = "0";
                        setTimeout(()=>{this.setState({visible: false})}, 500);
                    }, 3000);
                    break;
                case "saved":
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#4CB944", fontSize:"40px"}} icon={faCheckCircle} />;
                    statusTxt = "Speichern erfolgreich.";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        this.statusBox.current.style.opacity = "0";
                        setTimeout(()=>{this.setState({visible: false})}, 500);
                    }, 2000);
                    break;
                case "error":
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#F06543", fontSize:"40px"}} icon={faTimesCircle} />;
                    statusTxt = "Ein Fehler ist aufgetreten.";
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        this.statusBox.current.style.opacity = "0";
                        setTimeout(()=>{this.setState({visible: false})}, 500);
                    }, 3000);
                    break;
                case "saving":
                    statusTxt = "Einträge werden gespeichert.";
                    statusSymbol = <div style={{display: "inline-block", backgroundColor:"#246EB9"}}><FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", fontSize:"40px"}} icon={faSyncAlt} spin /></div>;
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = null;
                    break;
                default:
                    statusTxt = "Programm arbeitet.";
                    statusSymbol = <FontAwesomeIcon color="#FDFFFC" style={{padding: "3px", backgroundColor:"#F5EE9E", fontSize:"40px"}} icon={faCloudMoon} />;
                    if(this.timeOutHandle!=null){clearTimeout(this.timeOutHandle)};
                    this.timeOutHandle = setTimeout(()=>{
                        this.statusBox.current.style.opacity = "0";
                        setTimeout(()=>{this.setState({visible: false})}, 500);
                    }, 2000);
            }
            if(this.state.value!=null){statusTxt=this.state.value}
            return <div ref={this.statusBox} style={style}  className="mainColors">{statusSymbol}<span style={{position:"relative", top: "-10px", padding: "10px 20px"}}>{statusTxt}</span></div>;
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
        return (
        <div style={this.props.style}>
            <select className={this.props.classList} value={this.props.value} style={{width:"100%"}} onChange={event=>{this.props.onChange(event)}}>
                {options}
            </select>
            <div style={{pointerEvents:"none", textAlign:"right", margin: "-26px 10px 0 0"}}><FontAwesomeIcon color="LightGray" icon={faAngleDown} /></div>
        </div>);
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
                optionsElement.push(<div key={option.id} id={i} data-id={option.id} data-value={option[this.props.col]} onClick={e=>{this.props.onChange(e.target.dataset.value, e.target.dataset.id);this.setState({userSelected: true})}} style={{cursor: "default", color: this.state.currentOptionId===i?"#2364AA":"inherit"}}>{option[this.props.col]}</div>);
            }
        }
        return <div>
            <input type="text" value={this.props.value} onBlur={()=>{setTimeout(()=>{this.setState({userSelected: true})},300)}} onChange={e=>{this.changeInputValue(e.target.value)}} onKeyDown={e=>{this.changeSelectedOption(e)}} />
            {optionsElement.length>0?<div style={optionsBoxStyle} className="mainColors">{optionsElement}</div>:null}
        </div>;
    }
    async changeInputValue(newValue){
        this.props.onChange(newValue, null);
        if(newValue!=""){
            let query = {};
            query[this.props.col] = newValue+"*";
            const newOptions = await arachne[this.props.tbl].get(query, {select: ["id", this.props.col], limit:10, order: [this.props.col]});
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
            this.props.onChange(this.state.options[this.state.currentOptionId][this.props.col], this.state.options[this.state.currentOptionId].id);
            this.setState({userSelected: true});
        }
    }
}

class SelectorWrapper extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        return <div className={"selectWrapper"+(this.props.isSelected==="1"?" selMarked":"")} style={{transition:"box-shadow 0.3s", margin: "10px 5px"}} id={this.props.children.props.id} ref={this.element} onClick={event=>{event.stopPropagation();/*console.log(this.props.children.props)*/}} onMouseUp={event=>{this.props.onSelect(this.props.children, {shift: event.shiftKey, meta: event.metaKey, ctrl: event.ctrlKey})}}>{this.props.children}</div>;
    }
}
class Selector  extends React.Component{
    constructor(props){
        super(props);
        let style = {}
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
                    this.setState({currentId: targetId, ids: newIds});
                    this.props.selectCallback(element, {currentId: targetId, ids: newIds});
                });
            } else if(this.props.multiSelect&&(arachne.me.selectKey==="cmd"&&keys.meta||arachne.me.selectKey==="ctrl"&&keys.ctrl)){
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
        if(prevProps.preset!=this.props.preset){
            //console.log(this.state.currentId);
            setTimeout(()=>{
                let el = document.querySelector("div.selMarked");
            if(el){el.scrollIntoView({behavior: "smooth", block: "center"})};
            }, 300);
            this.setState({ids: this.props.preset});
        }
    }
}

function parseHTML(i){
    // parses masked HTML tags and purifies them.
    if(i==null){
        return {__html: null};
    }else{
        return {__html: DOMPurify.sanitize(i.replace(/&lt;/g, "<").replace(/&gt;/g, ">"), { ADD_TAGS: ["aut", "gruen", "gelb", "rot", "blau"] })};
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
export { Navigator, parseHTML, parseHTMLPreview, SearchBox, Status, SelectMenu, Selector, AutoComplete };