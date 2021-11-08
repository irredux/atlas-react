import React from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCat } from "@fortawesome/free-solid-svg-icons";

import "./index.css";

import { arachne } from "./arachne.js";
import { Status } from "./elements.js";
import { Lemma } from "./lemma.js";
import { Opera } from "./opera.js";
import { Ressource, SekLit } from "./ressources.js";
import { Account, Help, Import, Server, Statistics } from "./settings.js";
import { Zettel } from "./zettel.js";
import { Editor } from "./editor.js";

const colors = {shadow: "#3c6e71"}

class MainMenu extends React.Component{
    constructor(props){
        super(props);
        const menuLst = {
            "Zettel- und Wortmaterial": {
                visible: false, 
                items: {
                    "Zettel-Datenbank": "zettel",
                    "Lemmaliste": "lemma",
                    /*"Volltext-Suche": "fulltext",*/
            }},
            "Verzeichnisse": {
                visible: false, 
                items: {
                    "opera-maiora":"maiora",
                    "opera-minora":"minora",
                    "Ressourcen":"ressources",
                    "Sekundärliteratur":"seklit",
            }},
            "Editor": {
                visible: false, 
                items:
                {"Projektübersicht":"overview"}
            },
            "Einstellungen": {
                visible: false, 
                items: {
                    "Hilfe":"help",
                    "Konto":"account",
                    "Server": "server",
                    "Import": "import",
                    "Statistiken":"stats",
                    "abmelden":"logout",
            }}
        };
        this.state = {menuEntries: menuLst, currentSubmenu: null};
    }
    render(){
        let style = {
            position: "fixed",
            top: 0,
            left: 0,
            boxShadow: `0 0 2px ${colors.shadow}`,
            padding: "10px 15px",
            zIndex: 2000000,
        };
        let menuEntries = [];
        if(this.props.onTop===1){
            // top menu
            style.right = 0;
            style.display = "flex";
            style.position = "absolute";
            style.justifyContent = "space-evenly";
            let keyCount = -1;
            for(const mainEntry in this.state.menuEntries){
                keyCount ++;
                let subMenu = "";
                const subMenuStyle = {
                    position: "absolute",
                    boxShadow: "rgb(60, 110, 113) 0px 0px 2px",
                    top: "43px",
                    padding: "10px 25px",
                    marginLeft: "-10px"
                }
                if(this.state.currentSubmenu===mainEntry){
                    let subMenuEntries = [];
                    for(const subEntry in this.state.menuEntries[mainEntry].items){
                        subMenuEntries.push(<div key={subEntry} style={{margin: "10px 0 10px 10px"}} onClick={()=>{
                            this.setState({currentSubmenu: ""});
                            this.props.loadMain(this.state.menuEntries[mainEntry].items[subEntry]);
                        }}><span style={{cursor:"pointer"}}>{subEntry}</span></div>);
                    }
                    subMenu = <div key={subMenuEntries}  className="mainColors" style={subMenuStyle}>{subMenuEntries}</div>;
                }
                menuEntries.push(
                <div key={keyCount}>
                    <span style={{cursor:"pointer"}} onClick={() => {
                        if(this.state.currentSubmenu === mainEntry){this.setState({currentSubmenu: null})}
                        else{this.setState({currentSubmenu: mainEntry})}
                    }}>{mainEntry}</span>
                    {subMenu}
                </div>);
                //<div style={{display: "none"}}>{this.state.menuEntries[mainEntry]}</div>
            }
        } else {
            // side menu
            //style.display = "block";
            style.transition = "left 0.5s";
            if(this.state.hidden){style.left = "-290px"}
            style.bottom = "0";
            style.width = "300px";
            let keyCount = -1;
            for(const mainEntry in this.state.menuEntries){
                menuEntries.push(<div key={mainEntry} style={{marginTop: "15px", cursor:"default"}}>{mainEntry}</div>);
                for(const subEntry in this.state.menuEntries[mainEntry].items){
                    keyCount ++;
                    menuEntries.push(<div key={subEntry} style={{marginLeft: "15px", display: "inline-block", cursor:"pointer"}} onClick={()=>{
                        this.props.loadMain(this.state.menuEntries[mainEntry].items[subEntry]);
                    }}>{subEntry}</div>);
                    menuEntries.push(<br key={keyCount} />);
                }
            }

        }
        return (
        <nav className="mainColors" style={style} onClick={() => {
            if(this.props.onTop!==1){
                if(this.state.hidden){this.setState({hidden: false})}
                else{this.setState({hidden: true})}
            }
        }}>
            {menuEntries}            
        </nav>);
    }
}
class App extends React.Component {
    constructor(props){
        const maxWinWidth = 1000;
        super(props);
        // check here, if Login-Screen needs to be shown, or not!
        let mainMenuPos = 1;
        if(window.innerWidth<maxWinWidth){mainMenuPos = 0}
        this.state = {mode: "login", res: null, mainMenuPos: mainMenuPos, status: {}};
        window.addEventListener("resize", () => {
            if(window.innerWidth<maxWinWidth){this.setState({mainMenuPos: 0})}
            else{this.setState({mainMenuPos: 1})}
        });
        window.addEventListener("arachneError", e=>{
            if(e.detail.status===401){
                this.newStatus("error", "Der Server hat die Zugangsdaten abgelehnt. Melden Sie sich neu an!");
            } else {
                this.newStatus("error", "Die Verbindung zum Server ist unterbrochen.");
            }
        });
        this.tbls = ["author", "edition", "lemma", "opera_maiora", "opera_minora", "scan", "scan_lnk", "work", "zettel", "user", "seklit", "project", "article", "zettel_lnk", "statistics", "scan_paths"];
    }
    loadMain(res){
        if(res==="logout"){
            arachne.close();
            this.setState({
                mode: "login",
                res: null
            });
        } else {
            this.setState({res: res});
        };
    }
    render(){
        if(this.state.mode==="main"){
            // login succeeded!
            let main = null;
            switch(this.state.res){
                case null:
                    break;
                case "overview":
                    main = <Editor status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                case "ressources":
                    main = <Ressource status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                case "seklit":
                    main = <SekLit status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                case "stats":
                    main = <Statistics status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                case "server":
                    main = <Server status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                case "lemma":
                    main = <Lemma status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                case "maiora":
                    main = <Opera listName="opera_maiora" status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                case "minora":
                    main = <Opera listName="opera_minora" status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                case "help":
                    main = <Help />;
                    break;
                case "import":
                    main = <Import status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                case "zettel":
                    main = <Zettel status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                case "account":
                    main = <Account status={(type,value)=>{this.newStatus(type, value)}} />;
                    break;
                default:
                    main = <div>Unbekannter Menü-Punkt {this.state.res}</div>;
            }
            return (
                <div style={(this.state.mainMenuPos===1)?{marginTop: "60px"}:{marginLeft: "40px"}}>
                    <MainMenu onTop={this.state.mainMenuPos} loadMain={res => {this.loadMain(res)}} />
                    {main}
                    <Status status={this.state.status} />
                </div>
            );
        } else if (this.state.mode==="create"){
            return(<div style={{
                position: "absolute",
                display: "grid",
                height: "100%",
                width: "100%",
                gridTemplateColumns: "1fr 2fr 1fr",
                gridTemplateRows: "1fr 2fr 1fr"
                }}>
                    <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gridTemplateRows: "auto 100px 50px 50px 50px 50px 50px auto",
                    gridColumn: "2",
                    gridRow: "2",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    boxShadow: `0 1.2px 6px ${colors.shadow}`
                }}>
                    <h1 style={{textAlign: "center", gridArea: "2/2/2/4"}}>Konto erstellen</h1>
                    <span style={{gridArea: "3/2/3/3"}}>Vorname:</span>
                    <div style={{gridArea: "3/3/3/4"}}><input type="text" value={this.state.createFirstName?this.state.createFirstName:""} onChange={e=>{this.setState({createFirstName: e.target.value})}} /></div>
                    <span style={{gridArea: "4/2/4/3"}}>Nachname:</span>
                    <div style={{gridArea: "4/3/4/4"}}><input type="text" value={this.state.createLastName?this.state.createLastName:""} onChange={e=>{this.setState({createLastName: e.target.value})}} /></div>
                    <span style={{gridArea: "5/2/5/3"}}>E-Mail:</span>
                    <div style={{gridArea: "5/3/5/4"}}><input type="text" value={this.state.createEmail?this.state.createEmail:""} onChange={e=>{this.setState({createEmail: e.target.value})}} /></div>
                    <span style={{gridArea: "6/2/6/3"}}>Passwort:</span>
                    <div style={{gridArea: "6/3/6/4"}}><input type="password" value={this.state.createPassword?this.state.createPassword:""} onChange={e=>{this.setState({createPassword: e.target.value})}} /></div>
                    <div style={{gridArea: "8/3/8/4"}}><input type="button" value="registrieren" onClick={async ()=>{
                        if(this.state.createFirstName&&this.state.createFirstName&&this.state.createEmail&&this.state.createPassword){
                            this.newStatus("saving");
                            const data = {
                                first_name: this.state.createFirstName,
                                last_name: this.state.createLastName,
                                email: this.state.createEmail,
                                password: this.state.createPassword
                            }
                            const status = await arachne.createAccount(data);
                            switch(status){
                                case 201:
                                    this.newStatus("saved", "Der Account wurde erfolgreich erstellt.")
                                    setTimeout(()=>{this.setState({mode: "login"})}, 2100);
                                    break;
                                case 409:
                                    this.newStatus("error", "Die Email-Adresse ist bereits vorhanden.");
                                    break;
                                case 406:
                                    this.newStatus("error", "Bitte füllen Sie alle Felder aus.");
                                    break;
                                default:
                                    this.newStatus("error", "Die Registrierung is fehlgeschlagen. Versuchen Sie es erneut.");
                            }
                        } else {this.newStatus("error", "Bitte füllen Sie alle Felder aus!")}
                        
                      
                    }}/> <span className="minorTxt" style={{marginLeft: "20px"}}><a onClick={()=>{this.setState({mode: "login"})}}>zurück</a></span></div>
                    
                    <span style={{gridArea: "7/2/7/3"}}></span>
                </div>
                <Status status={this.state.status} />
            </div>);
        } else {
            return (
            <div style={{
                position: "absolute",
                display: "grid",
                height: "100%",
                width: "100%",
                gridTemplateColumns: "1fr 2fr 1fr",
                gridTemplateRows: "1fr 2fr 1fr"
                }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gridTemplateRows: "auto 100px 50px 50px 50px 25px 50px auto",
                    gridColumn: "2",
                    gridRow: "2",
                    padding: "10px 15px",
                    borderRadius: "5px",
                    boxShadow: `0 1.2px 6px ${colors.shadow}`
                }}>
                    <h1 style={{textAlign: "center", gridArea: "2/2/2/4"}}>dMLW</h1>
                    <span style={{gridArea: "3/2/3/3"}}>Email:</span>
                    <div style={{gridArea: "3/3/3/4"}}>
                    <input type="text" name="email" style={{width:"300px"}} />
                    </div>
                    
                    <span style={{gridArea: "4/2/4/3"}}>Passwort:</span>
                    <div style={{gridArea: "4/3/4/4"}}>
                    <input type="password" name="password" style={{width:"300px"}} />
                    </div>
                    <div style={{gridArea: "5/3/5/4"}}>
                    <input type="submit" value="anmelden" onClick={() => {this.login()}} />
                    </div>
                    <span style={{gridArea: "7/2/7/4"}} className="minorTxt">Noch kein Konto? Klicken Sie <a onClick={()=>{this.setState({mode:"create"})}}>hier</a>.</span>
                </div>
                <div className="cat">
                <FontAwesomeIcon color="black" icon={faCat} />
                </div>
            </div>);
        }
    }
    componentDidMount(){
        const checkSession = async () => {
            const test = await arachne.getUser();
            if(test){
                await arachne.open(this.tbls);
                this.setState({mode: "main"});
            }
        }
        checkSession();
    }
    async login(){
        const email = document.querySelector("input[name=email]").value;
        const password = document.querySelector("input[name=password]").value;
        if(email!==""&&password!==""&&await arachne.login(email, password, this.tbls)){
            this.setState({mode: "main"});
        } else {
            alert("Geben Sie eine gültige Email-Adresse und Passwort ein!");
        }
    }
    newStatus(type, value=null){
        this.setState({status: {
            id: Date.now(),
            visible: true,
            type: type,
            value: value
        }});
    }
}

/* ************************************************** */
ReactDOM.render(
    <App />,
    document.getElementById("root")
);