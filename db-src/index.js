// Version 1.0 20.02.2022

import React from "react";
import ReactDOM from "react-dom";

import "./index.scss";

import { arachne } from "./arachne.js";
import { LoginScreen, AccountCreate } from "./login.js";
import { arachneTbls, MainBody, MainNavBar } from "./mainContent.js";

class App extends React.Component {
    constructor(props){
        super(props);
        const maxWinWidth = 1;
        // check here, if Login-Screen needs to be shown, or not!
        let mainMenuPos = 1;
        if(window.innerWidth<maxWinWidth){mainMenuPos = 0}
        const urlQueries = new URLSearchParams(window.location.search);
        this.state = {mode: "login", res: urlQueries.get("site")?urlQueries.get("site"):null, resId: null, mainMenuPos: mainMenuPos, status: {}};
        window.addEventListener("resize", () => {
            if(window.innerWidth<maxWinWidth){this.setState({mainMenuPos: 0})}
            else{this.setState({mainMenuPos: 1})}
        });
        window.addEventListener("arachneError", e=>{
            if(e.detail.status===401){
                alert("Der Server hat die Zugangsdaten abgelehnt. Melden Sie sich neu an!");
                //this.newStatus("error", "Der Server hat die Zugangsdaten abgelehnt. Melden Sie sich neu an!");
            } else {
                alert("Die Verbindung zum Server ist unterbrochen.");
                //this.newStatus("error", "Die Verbindung zum Server ist unterbrochen.");
            }
        });
        this.tbls = arachneTbls();
    }
    loadMain(e, res, resId){
        if(res==="logout"){
            const logoutFunction = async () => {
                let reStatus = await arachne.close();
            if(reStatus===200){
                this.setState({
                    mode: "login",
                    res: null
                });
            } else {
                this.newStatus("error", `Ein Fehler ist beim Abmelden aufgetreten. Fehler-Code ${reStatus}.`);
            }
            }
            logoutFunction();
        } else {
            if((e!=null&&arachne.me.selectKey==="cmd"&&e.metaKey)||(e!=null&&arachne.me.selectKey==="ctrl"&&e.ctrlKey)){window.open(`/?site=${res?res:""}`, "_blank")}
            else{this.setState({res: res, resId: resId})}
        };
    }
    render(){
        if(this.state.mode==="main"){
            // login succeeded!
            let main = <MainBody res={this.state.res} resId={this.state.resId} loadMain={(...params)=>{this.loadMain(...params)}} />;
            return (
                <div style={{marginTop: "70px", marginBottom: "100px"}}>
                    <MainNavBar res={this.state.res} resId={this.state.resId} loadMain={(...params)=>{this.loadMain(...params)}} />
                    {main}
                </div>
            );
        } else if (this.state.mode==="create"){
            return <AccountCreate setMode={mode=>{this.setState({mode: mode})}} />;
        } else {
            return <LoginScreen setMode={mode=>{this.setState({mode: mode})}} login={(e, p)=>{this.login(e, p)}} />
        }
    }
    componentDidMount(){
        const checkSession = async () => {
            const test = await arachne.getUser();
            if(test){
                await arachne.open(this.tbls);
                this.setState({mode: "main"});
            }
        }
        checkSession();
    }
    async login(email, password){
        if(email!==""&&password!==""){
            let re = await arachne.login(email, password, this.tbls);
            if(re){
                this.setState({mode: "main"});
                return {status: 1};
            } else {
                return {status: -1, error: "Die Login-Daten waren falsch."};
            }
        }else{return {status: -1, error: "Geben Sie eine gültige Email-Adresse und Passwort ein!"};}
    }
}

/* ************************************************** */
ReactDOM.render(
    <App />,
    document.getElementById("root")
);