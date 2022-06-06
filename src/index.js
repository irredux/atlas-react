import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import "./index.scss";

import { arachne } from "./arachne.js";
import { LoginScreen, AccountCreate } from "./login.js";

let arachneTbls;
let MainBody;
let MainNavBar;

function App(){
    const [mode, setMode] = useState(null);
    const [res, setRes] = useState(null);
    const [resId, setResId] = useState(null);
    const urlQueries = new URLSearchParams(window.location.search);
    const APP_NAME = ["db", "argos", "editor", "echo"].includes(urlQueries.get("app"))?urlQueries.get("app"):"db"
    const PROJECT_NAME = ["mlw", "dom"].includes(urlQueries.get("project"))?urlQueries.get("project"):"mlw"
    arachne.project_name = PROJECT_NAME;
    let windowTitle = "";
    switch(PROJECT_NAME){
        case "mlw":
            windowTitle = "dMLW";
            break;
        case "dom":
            windowTitle = "dDOM";
            break;
        default:
            windowTitle = "???";
    }
    switch(APP_NAME){
        case "db":
            windowTitle += "";
            break;
        case "argos":
            windowTitle += " - Argos";
            break;
        case "editor":
            windowTitle += " - Editor";
            break;
        case "echo":
            windowTitle += " - Echo";
            break;
        default:
            windowTitle += " - ???"
    }
    document.title= windowTitle;
    
    useEffect(()=>{
        const loadAsync = async () => {
            // load modules
            ({ MainBody, MainNavBar } = await import(`./${APP_NAME}/mainContent.js`));
            ({ arachneTbls } = await import(`./content/${PROJECT_NAME}.js`));
            // checkSession
            if(await arachne.getUser()){
                await arachne.open(arachneTbls());
                setMode("main");
            }else{setMode("login")}
        }
        window.addEventListener("arachneError", e=>{
            if(e.detail.status===401){
                alert("Der Server hat die Zugangsdaten abgelehnt. Melden Sie sich neu an!");
            } else {
                alert("Die Verbindung zum Server ist unterbrochen.");
            }
        });
        if(urlQueries.get("site")){setRes(urlQueries.get("site"))}
        loadAsync();
    }, []);
    const sendLogin = async (email, password) => {
        if(email!==""&&password!==""){
            let re = await arachne.login(email, password, arachneTbls());
            if(re){
                setMode("main");
                return {status: 1};
            } else {
                return {status: -1, error: "Die Login-Daten waren falsch."};
            }
        }else{return {status: -1, error: "Geben Sie eine gültige Email-Adresse und Passwort ein!"};}
    };
    const loadMain = (e, nRes, nResId) => {
        if(nRes==="logout"){
            const logoutFunction = async () => {
                let reStatus = await arachne.close();
                if(reStatus===200){
                    setMode("login");
                    setRes(null);
                } else {
                    //this.newStatus("error", `Ein Fehler ist beim Abmelden aufgetreten. Fehler-Code ${reStatus}.`);
                }
            }
            logoutFunction();
        }else{
            if((e!=null&&arachne.me.selectKey==="cmd"&&e.metaKey)||(e!=null&&arachne.me.selectKey==="ctrl"&&e.ctrlKey)){window.open(`/?site=${nRes?nRes:""}&id=${nResId?nResId:""}`, "_blank")}
            else{
                setRes(nRes);
                setResId(nResId);
            }
        };
    };
    let mainScreen = null;
    switch(mode){
        case "login":
            mainScreen = <LoginScreen setMode={mode=>{setMode(mode)}} login={(e, p)=>{sendLogin(e, p)}} />;
            break;
        case "main":
            mainScreen = <div style={{marginTop: "70px", marginBottom: "100px"}}>
                    <MainNavBar PROJECT_NAME={PROJECT_NAME} res={res} resId={resId} loadMain={(...params)=>{loadMain(...params)}} />
                    <MainBody PROJECT_NAME={PROJECT_NAME} res={res} resId={resId} loadMain={(...params)=>{loadMain(...params)}} />
                </div>;
            break;
        case "create":
            mainScreen = <AccountCreate setMode={mode=>{setMode(mode)}} />;
            break;
        default:
            mainScreen = <div></div>;
    }
    return mainScreen;
}

const root = createRoot(document.getElementById("root"))
root.render(<App />);