import React from "react";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCat } from "@fortawesome/free-solid-svg-icons";

import "./index.css";

import { arachne } from "./arachne.js";
import { Status } from "./elements.js";
import { Argos } from "./argos.js";

class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {mode: "login", status: {}};
        window.addEventListener("arachneError", e=>{
            if(e.detail.status===401){
                this.newStatus("error", "Der Server hat die Zugangsdaten abgelehnt. Melden Sie sich neu an!");
            } else {
                this.newStatus("error", "Die Verbindung zum Server ist unterbrochen.");
            }
        });
        this.tbls = ["edition", "lemma", "opera_maiora", "opera_minora", "scan", "scan_lnk", "work", "zettel", "user"];
    }
    render(){
        if(this.state.mode==="main"){
            // login succeeded!
            let main = <Argos edition={this.state.edition} status={(type,value)=>{this.newStatus(type, value)}} />;
            return (
                <div>
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
                    boxShadow: "0 1.2px 6px #3c6e71"
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
                    boxShadow: "0 1.2px 6px #3c6e71"
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
        // set edition/page
        const urlQueries = new URLSearchParams(window.location.search);
        this.setState({
            edition: urlQueries.get("edition")?urlQueries.get("edition"):1,
            page: urlQueries.get("page")?urlQueries.get("page"):null
        });
        // check session
        const checkSession = async () => {
            const test = await arachne.getUser();
            if(test){
                await arachne.open(this.tbls);
                this.setState({mode: "main"});
            }
        }
        checkSession();
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
