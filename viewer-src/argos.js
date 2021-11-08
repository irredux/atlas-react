import React from "react";
import { faColumns, faImage, faKeyboard, faBars, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { arachne } from "./arachne";
import { parseHTML } from "./elements";

class Argos extends React.Component{
    constructor(props){
        super(props);
        this.state = {mode: "img", imgURL: null, fullTextEdit: false, scanLst: [], scanLstSelected: [], contentMode: "pages", scansInPath: []};
        window.addEventListener("keyup", e=>{
            if(e.keyCode===37&&this.state.cIndex>0){
                // left
                this.setState({cIndex: this.state.cIndex-1});
            } else if (e.keyCode===39&&this.state.cIndex<this.state.scanLst.length-1){
                // right
                this.setState({cIndex: this.state.cIndex+1})
            }
        });
    }
    render(){
        let contentMenuLst = [];
        if(this.state.contentMenu){
            let i = -1;
            for(const scan of this.state.scanLst){
                i ++;
                contentMenuLst.push(<li key={i}>{scan.full_text?<FontAwesomeIcon icon={faKeyboard} style={{fontSize: "10px", margin: "0 5px 1px 0"}} />:null}<a id={i} style={{color: this.state.scanLstSelected.includes(scan.id)?"red":"inherit"}} onClick={e=>{
                    this.setState({cIndex: parseInt(e.target.id), contentMenu: false});
                }}>{isNaN(scan.filename)?scan.filename:parseInt(scan.filename)}</a></li>);
            }
        }
        let mainStyle = {
            margin: "20px 40px 65px 40px",
            display: "grid",
            gridTemplateColumns: this.state.mode==="img"||this.state.mode==="text"?"1fr":"1fr 1fr",
            gridTemplateRows: "1fr",
            columnGap: "20px",
        }
        let fullTxtBox = <i>Kein Fließtext verfügbar.</i>;
        if(this.state.txt&&!this.state.fullTextEdit){
            fullTxtBox = <span style={{fontSize: "18px"}} dangerouslySetInnerHTML={parseHTML(this.state.txt.replace(new RegExp(`${this.state.currentQuery}`, "g"), `<mark>${this.state.currentQuery}</mark>`).replace(/\n/g, "<br />"))}></span>;
        } else if(this.state.fullTextEdit){
            fullTxtBox = <textarea style={{outline: "none", resize: "none", width: "100%", height: "500px"}} value={this.state.txt?this.state.txt:""} onChange={e=>{this.setState({txt: e.target.value})}} onBlur={e=>{
                this.props.status("saving");
                arachne.scan.save({id: this.state.scanLst[this.state.cIndex].scan_id, full_text: e.target.value});
                this.props.status("saved");
            }}></textarea>;
        }
        let sideMenu = null;
        if(this.state.contentMode==="pages"){
            sideMenu = <div>
                {arachne.access("e_edit")?<FontAwesomeIcon className="editButton" style={{position: "absolute", top: "10px", right: "10px", fontSize: "15px"}} icon={faEdit} onClick={()=>{this.setState({contentMode: "edit"})}} />:null}
                <h4>Inhalt</h4>
                <ul style={{listStyleType: "none", margin: "0", padding: "0"}}>{contentMenuLst}</ul>
                <div style={{height: "70px"}}></div>
                <div className="mainColors" style={{position: "fixed", bottom: "42px", left: "0", width: "180px", borderTop: "0.5px solid gray", padding: "4px 5px"}}><input type="text" style={{margin: "3px 1px", padding: "0", boxShadow: "none", width: "170px"}} onKeyUp={async e=>{
                    if(e.keyCode===13){
                        const results = await arachne.scan_lnk.search([{c: "edition_id", o: "=", v: this.props.edition},{c: "full_text", o: "=", v: `*${e.target.value}*`}], {select: ["id"]});
                        this.setState({currentQuery: e.target.value, scanLstSelected: results.map(r => r.id)});
                    }
                }} /></div>
            </div>;
        } else if (this.state.contentMode==="edit"){
            let allScanLst = [];
            let i = 0;
            console.log(this.state.scanLst);
            for(const allScan of this.state.scansInPath){
                i++;
                allScanLst.push(<div key={i} style={{color: this.state.scanLst.findIndex(i=>i.scan_id===allScan.id)>-1?"red":"black"}}>{allScan.filename}</div>);
            }
            sideMenu = <div>
                {arachne.access("e_edit")?<FontAwesomeIcon className="editButton" style={{position: "absolute", top: "10px", right: "10px", fontSize: "15px"}} icon={faEdit} onClick={()=>{this.setState({contentMode: "pages"})}} />:null}
                <input type="text" style={{fontSize: "12px"}} value={this.state.path} onChange={e=>{this.setState({path: e.target.value})}} />
                {allScanLst}
            </div>;
        }
        return <div>
            <main style={mainStyle}>
                {this.state.imgURL&&(this.state.mode==="img"||this.state.mode==="split")&&<div style={{boxShadow: "0 2px 3px gray"}}><img src={this.state.imgURL} style={{width: "100%"}}></img></div>}
                {(this.state.mode==="text"||this.state.mode==="split")&&<div style={{boxShadow: "0 2px 3px gray", padding: "20px 40px", position: "relative"}}>
                    <div className="minorTxt" style={{textAlign: "center", marginBottom: "30px"}}><span dangerouslySetInnerHTML={parseHTML(this.state.title)}></span><span style={{float: "right"}}>{this.state.page}</span></div>
                    
                    <div style={{textAlign: "justify"}}>{fullTxtBox}</div>{arachne.access("e_edit")?< FontAwesomeIcon icon={faEdit} style={{position: "absolute", "bottom": "10px", right: "10px", color: "gray"}} onClick={()=>{if(this.state.fullTextEdit){this.setState({fullTextEdit: false})}else{this.setState({fullTextEdit: true})}}} />:null}
                    </div>
                    }
                    {this.state.cIndex>0?<div className="leftArrow" onClick={()=>{this.setState({cIndex: this.state.cIndex-1})}}></div>:null}
                    {this.state.cIndex<this.state.scanLst.length-1?<div className="rightArrow"  onClick={()=>{this.setState({cIndex: this.state.cIndex+1})}}></div>:null}
            </main>
            {this.state.contentMenu?<div className="mainColors" style={{position: "fixed", top: "0", left: "0", bottom: "0", width: "150px", boxShadow: "0 0 2px gray", padding: "20px 20px", overflow: "scroll"}}>
                {sideMenu}
            </div>:null}
            <footer className="mainColors" style={{position: "fixed", bottom: "0", right: "0", left: "0", boxShadow: "0 0 2px gray", display: "grid", gridTemplateColumns:"1fr 1fr"}}>
                <div><FontAwesomeIcon icon={faBars} style={{fontSize: "30px", margin: "5px 0 2px 25px"}} onClick={()=>{this.state.contentMenu?this.setState({contentMenu: false}):this.setState({contentMenu: true})}} /></div>
                <div style={{textAlign: "right"}}>
                    <FontAwesomeIcon icon={faImage} style={{fontSize: "35px", margin: "5px 25px 3px 0"}} onClick={()=>{this.setState({mode:"img"})}} />
                    <FontAwesomeIcon icon={faColumns} style={{fontSize: "30px", margin: "0 20px 5px 0"}} onClick={()=>{this.setState({mode:"split"})}} />
                    <FontAwesomeIcon icon={faKeyboard} style={{fontSize: "33px", margin: "0 30px 4px 0"}} onClick={()=>{this.setState({mode:"text"})}} />
                </div>
            </footer>
        </div>;
    }
    componentDidMount(){
        const setupEdition = async () => {
            // get edition
            const edition = await arachne.edition.get({id: this.props.edition});

            // get scans
            let scanLst = await arachne.scan_lnk.get({edition_id: this.props.edition});
            scanLst = scanLst.sort((a, b) => b.filename < a.filename);
            const title = `${edition[0].opus.replace(" <cit></cit>", "")} (${edition[0].label})`;
            this.setState({title: title, path: edition[0].path, edition: edition[0], scanLst: scanLst, cIndex: scanLst.length-1});
        }
        setupEdition();
    }
    componentDidUpdate(prevProps, prevState){
        if(prevState.cIndex!=this.state.cIndex){
            // update current page!
            if(this.state.scanLst.length>0){
                arachne.getScan(this.state.scanLst[this.state.cIndex].scan_id).then(img=>{
                    this.setState({imgURL: img, txt: this.state.scanLst[this.state.cIndex].full_text, page: isNaN(this.state.scanLst[this.state.cIndex].filename)?this.state.scanLst[this.state.cIndex].filename:parseInt(this.state.scanLst[this.state.cIndex].filename)});
                }).catch(e=>{throw e});    
            }            
        }
        if(prevState.contentMode==="pages"&&this.state.contentMode==="edit"){
            const getAllScans = async () => {
                const scans = await arachne.scan.get({path: this.state.path});
                this.setState({scansInPath: scans});
            }
            getAllScans();
        }
    }
}

export { Argos };