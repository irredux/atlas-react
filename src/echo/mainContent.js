import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";

import { arachne } from "./../arachne.js";


function MainBody(props){
    arachne.changeLog = dbChangeLog;
    let main = null;
    switch(props.res){
        case null:
            main = <Overview loadMain={(...params)=>{props.loadMain(...params)}} />;
            break;
        default:
            main = <div>Unbekannter Menü-Punkt: "{props.res}"</div>;
    }
    return <>
        {main}
        
    </>;
}
function MainNavBar(props){
    return <></>;
}
const dbChangeLog = [
    {
        title: "Beta 1.0",
        date: "2022-06-05",
        description: <><p>Beta Version online!</p></>
    },
]
function Overview(props){
	const [url, setURL]=useState("");
	const bc = new BroadcastChannel("echo");
	bc.onmessage = e=>{
		if(e.data.type==="hello"&&e.data.msg==="echo"){
			bc.postMessage({type: "hello", msg: "back"});
		}else if(e.data.type==="edition"){
			setURL(e.data.url);
		}
	};
	useEffect(()=>{bc.postMessage({type: "hello", msg: "world"})},[]);
	return <div><iframe height="100%" width="100%" style={{position: "absolute", "top": 0, "bottom": 0, "left": 0, "right": 0}} src={url}></iframe></div>;
}

export { MainBody, MainNavBar };