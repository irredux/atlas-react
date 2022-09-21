import { Alert, Container } from "react-bootstrap";
import { arachne } from "./arachne.js";
import { useState } from "react";

function  ChangeLog(){
    arachne.changeLog = arachne.changeLog.sort((a,b)=>a.date<b.date);
    arachne.changeLog = arachne.changeLog.filter(a=>(a.project===undefined||a.project===arachne.project_name));
    const [displayAll, setDisplayAll] = useState(arachne.changeLog.length>5?false:true);
    const formatDate = d=>{
        const numToMonth = {
            "01": "Januar",
            "02": "Februar",
            "03": "März",
            "04": "April",
            "05": "Mai",
            "06": "Juni",
            "07": "Juli",
            "08": "August",
            "09": "September",
            "10": "Oktober",
            "11": "November",
            "12": "Dezember",
        };
        return `${d.substring(8,10)}. ${numToMonth[d.substring(5,7)]} ${d.substring(0,4)}`;
    };
    return <Container>
        {arachne.changeLog.map((c,i)=>{if(displayAll||i<5){return <Alert key={i} variant={i===0?"primary":"secondary"}><Alert.Heading>{c.title}</Alert.Heading><i>{formatDate(c.date)}</i>{c.description}</Alert>}else{return null}})}
        {displayAll?null:<Alert style={{cursor: "pointer", marginTop: "100px", textAlign: "center"}} variant="secondary" onClick={()=>{setDisplayAll(true)}}>Alle Änderungen anzeigen.</Alert>}
    </Container>;
    
}

export { ChangeLog };