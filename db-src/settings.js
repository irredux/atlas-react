import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./arachne.js";
import { SelectMenu } from "./elements.js";
import { render } from "@testing-library/react";

class Account extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            firstName: arachne.me.first_name,
            lastName: arachne.me.last_name,
            eMail: arachne.me.email,
            user: arachne.me,
            oldPassword: null,
            newPassword: null,
            z_width: arachne.options.z_width,
            };
    }
    render(){
        return <div style={{margin: "0 20px"}}>
            <h3>Persönliche Daten</h3>
            <div style={{
                padding: "0 20px",
                display: "grid",
                gridTemplateColumns: "200px 400px",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                
                <div>Vorname:</div><div><input style={{width: "100%"}} type="text" value={this.state.firstName} onChange={e=>{this.setState({firstName:e.target.value})}}/></div>
                <div>Nachname:</div><div><input style={{width: "100%"}} type="text" value={this.state.lastName} onChange={e=>{this.setState({lastName:e.target.value})}}/></div>
                <div>Email-Adresse:</div><div><input style={{width: "100%"}} type="text" value={this.state.user.email} onChange={e=>{this.setState({eMail:e.target.value})}}/></div>
                <div></div><div><input type="button" value="speichern" onClick={async ()=>{
                    this.props.status("saving");
                    await arachne.user.save({
                        id: arachne.me.id,
                        first_name: this.state.firstName,
                        last_name: this.state.lastName,
                        email: this.state.eMail,
                    });
                    const reUser = await arachne.getUser();
                    arachne.me = reUser;
                    this.props.status("saved");
        
                }} /></div>
            </div>
            <h3>Passwort</h3>
            <div style={{
                padding: "0 20px",
                display: "grid",
                gridTemplateColumns: "200px 400px",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                
                <div>altes Passwort:</div><div><input style={{width: "100%"}} type="password" onChange={e=>{this.setState({oldPassword:e.target.value})}}/></div>
                <div>neues Passwort:</div><div><input style={{width: "100%"}} type="password" onChange={e=>{this.setState({newPassword:e.target.value})}}/></div>
                <div></div><div><input type="button" value="speichern" onClick={async ()=>{
                    this.props.status("saving");
                    await arachne.user.save({
                        id: arachne.me.id,
                        old_password: this.state.oldPassword,
                        new_password: this.state.newPassword
                    });
                    this.props.status("saved");
        
                }} /></div>
            </div>
            <h3>Darstellung der Webseite</h3>
            <div style={{
                padding: "0 20px",
                display: "grid",
                gridTemplateColumns: "200px 400px",
                rowGap: "10px",
                margin: "50px 0"
            }}>
                
                <div>Breite der Zettel:</div>
                <div>
                    <input type="range" min="400" max="600" value={this.state.z_width} className="slider" id="zettelWidthRange" onChange={e=>{arachne.setOptions("z_width", e.target.value);arachne.setOptions("z_height", 350/500*parseInt(e.target.value));this.setState({z_width: e.target.value})}} />
                </div>
            </div>
        </div>;
    }
}

class Statistics extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            tab: "lemma",
            zettel_process: null,
            lemma_letters: null,
            ressource_work: null,
        };
    }
    render(){
        // zettel
        let zettelBox = null;
        if(this.state.zettel_process){
            let zettelCharts = [];

            // process
            const zettel_process_data = {
                labels: ["abgeschlossen", "nur Lemma", "unbearbeitet"],
                datasets: [
                  {
                    label: '# of Votes',
                    data: this.state.zettel_process,
                    backgroundColor: ['#114B79', '#347F9F', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#065A82', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            };
            
            zettelCharts.push(<div key="1" style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Bearbeitungsstand</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={zettel_process_data} /></div>);
            
            // zetteltype
            const zettel_types_data = {
                labels: ["verzetteltes Material", "Exzerpt", "Index", "Literatur", "Index (unkl. Werk)", "Notiz", "kein Typ"],
                datasets: [
                  {
                    label: '# of Votes',
                    data: this.state.zettel_types,
                    backgroundColor: ['#114B79', '#347F9F', '#8FC9D9', '#D2EFF4', '#EAF2F3', '#EFEFEF', '#FFFFFF'],
                    borderColor: ['#1B3B6F', '#065A82', '#61A4BC', '#BCEDF6', '#E8F1F2', '#EEEEEE', "#EFEFEF"],
                    borderWidth: 1,
                  },
                ],
            };
            zettelCharts.push(<div key="2" style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Typen</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={zettel_types_data} /></div>);

            // created in years
            const zettel_created_data = {
                labels: ["2020", "2021"],
                datasets: [
                    {
                        label: 'verändert',
                        data: this.state.zettel_changed,
                        backgroundColor: ['#114B79'],
                        borderColor: ['#114B79'],
                        borderWidth: 1,
                        /*fill: true,*/
                        type: 'line',
                    },
                    {
                        label: 'erstellt',
                        data: this.state.zettel_created,
                        backgroundColor: ['#347F9F'],
                        borderColor: ['#347F9F'],
                        borderWidth: 1,
                    },
                ],
            };
            zettelCharts.push(<div key="3" style={{marginBottom: "80px", width: "100%", height: "400px"}}><h4>nach Jahren</h4><Bar options={{aspectRatio: false, plugins: {legend:{display: true, position: "bottom"}}}} data={zettel_created_data} /></div>);

            // created in current year
            const zettel_created_current_data = {
                labels: ["Jan.", "Feb.", "Mär.", "Apr.", "Mai", "Jun.", "Jul.", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."],
                datasets: [
                    {
                        label: 'verändert',
                        data: this.state.zettel_changed_current,
                        backgroundColor: ['#114B79'],
                        borderColor: ['#114B79'],
                        borderWidth: 1,
                        /*fill: true,*/
                        type: 'line',
                    },
                    {
                        label: 'bearbeitet',
                        data: this.state.zettel_created_current,
                        backgroundColor: ['#347F9F'],
                        borderColor: ['#347F9F'],
                        borderWidth: 1,
                    },
                ],
            };
            zettelCharts.push(<div key="4" style={{marginBottom: "80px", width: "100%", height: "400px"}}><h4>in diesem Jahr</h4><Bar options={{aspectRatio: false, plugins: {legend:{display: true, position: "bottom"}}}} data={zettel_created_current_data} /></div>);
            
            zettelBox = <div>{zettelCharts}</div>;
        }

        // lemma
        let lemmaBox = null;
        if(this.state.lemma_letters){
            let lemmaCharts = [];
            // nach Buchstaben
            const lemma_letters_data = {
                labels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z"],
                datasets: [
                  {
                    label: '',
                    data: this.state.lemma_letters,
                    backgroundColor: ['#114B79', '#347F9F', '#8FC9D9', '#D2EFF4', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#065A82', '#61A4BC', '#BCEDF6', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            };
            lemmaCharts.push(<div key="1" style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Buchstaben</h4><Pie options={{plugins: {legend:{display: false, position: "bottom"}}}} data={lemma_letters_data} /></div>);

            // Filtern der Lemma nach Typ (in MLW)
            const lemma_mlw_data = {
                labels: ["relevant", "nicht relevant"],
                datasets: [
                  {
                    label: '',
                    data: this.state.lemma_mlw,
                    backgroundColor: ['#114B79', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            };
            lemmaCharts.push(<div key="2" style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>nach Relevanz fürs Wörterbuch</h4><Pie options={{plugins: {legend:{display: true, position: "bottom"}}}} data={lemma_mlw_data} /></div>);

            lemmaBox = <div style={{display: "flex", flexWrap: "wrap"}}>{lemmaCharts}</div>;
        }
        
        // ressources
        let ressourceBox = null;
        if(this.state.ressource_work){
            let ressourceCharts = [];
            // Werke mit/ohne Ressourcen - Werk mit/ohne Edition: Nach Ressource-Typ sortieren.

            // Volltexte pro Scans
            console.log(this.state.ressource_work);
            const ressource_work_data = {
                labels: ["mit Volltext und pdf", "nur mit pdf", "ohne pdf und Volltext"],
                datasets: [
                  {
                    label: '',
                    data: this.state.ressource_work,
                    backgroundColor: ['#114B79', '#347F9F', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#065A82', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            };
            ressourceCharts.push(<div key="1" style={{margin: "auto", marginBottom: "80px", width: "450px", height: "450px"}}><h4>Werke nach Volltext und pdfs</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={ressource_work_data} /></div>);

            ressourceBox = <div style={{display: "flex", flexWrap: "wrap"}}>{ressourceCharts}</div>;
        }
        
        const styleBody = {
            boxShadow: "0px 2px 7px rgb(217, 217, 217)",
            padding: "40px 10% 20px 10%",
            display: "block",
        }
        let mainBody = <div style={styleBody}></div>;
        switch(this.state.tab){
            case "lemma":
                mainBody = <div style={styleBody}>{lemmaBox}</div>;
                break;
            case "zettel":
                mainBody = <div style={styleBody}>{zettelBox}</div>;
                break;
                case "ressource":
                    mainBody = <div style={styleBody}>{ressourceBox}</div>;
                    break;
            default:
                mainBody = <div>Tab nicht erkannt!</div>;
        }
        const styleBox = {
            "padding": "20px 10% 0 10%"
        }
        const styleHeader = {
            display: "flex",
            justifyContent: "space-evenly",
            padding: "10px 20px"

        }
        const styleTab = {padding: "5px 10px", cursor: "default"};
        const styleTabActive = {padding: "5px 10px", borderBottom: "1px solid red", cursor: "default"};
        return (<div style={styleBox}>
            <div style={styleHeader}>
                <div style={this.state.tab==="lemma"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "lemma"})}}>Lemma</div>
                <div style={this.state.tab==="zettel"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "zettel"})}}>Zettel</div>
                <div style={this.state.tab==="ressource"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "ressource"})}}>Werke und Ressourcen</div>
            </div>
            {mainBody}
            <div style={{color: "lightgray", float: "right", marginTop: "20px", fontSize: "14px"}}>Stand: {this.state.last_updated}</div>
        </div>);
    }
    componentDidMount(){
        const getNumbers = async () => {
            const numbers = await arachne.statistics.getAll();
            console.log(numbers);
            this.setState({
                last_updated: JSON.parse(numbers.find(i => i.name === "last_updated").data),
                zettel_process: JSON.parse(numbers.find(i => i.name === "zettel_process").data),
                zettel_types: JSON.parse(numbers.find(i => i.name === "zettel_type").data),
                zettel_created: JSON.parse(numbers.find(i => i.name === "zettel_created").data),
                zettel_changed: JSON.parse(numbers.find(i => i.name === "zettel_changed").data),
                zettel_created_current: JSON.parse(numbers.find(i => i.name === "zettel_created_current").data),
                zettel_changed_current: JSON.parse(numbers.find(i => i.name === "zettel_changed_current").data),
                lemma_letters: JSON.parse(numbers.find(i => i.name === "lemma_letter").data),
                lemma_mlw: JSON.parse(numbers.find(i => i.name === "lemma_mlw").data),
                ressource_work: JSON.parse(numbers.find(i => i.name === "ressource_work").data)
            });
        }
        getNumbers();
    }
}

class Server extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            tab: "updateOpera",
            users: []
        };
    }
    render(){
        const styleBody = {
            boxShadow: "0px 2px 7px rgb(217, 217, 217)",
            padding: "40px 10% 20px 10%",
            display: "grid",
            gridTemplateColumns: "200px auto",
            gridTemplateRows: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr auto",
            gridGap: "15px"
        }
        let mainBody = <div style={styleBody}></div>;
        switch(this.state.tab){
            case "updateOpera":
                styleBody.gridTemplateRows = "1fr 1fr";
                mainBody = <div style={styleBody}>
                    <div style={{gridArea:"1/1/1/3", textAlign: "justify"}}>Damit Änderungen in den <i>opera</i>-Listen oder Änderungen in den Ressourcen in den Listen sichtbar werden, müssen sie auf dem Server aktualisiert werden. Dieser Prozess kann 30 Sekunden bis 1 Minute dauern.<br /><b>Wechseln oder schließen Sie nicht die Ansicht, während die Aktualisierung ausgeführt wird.</b></div>
                    <div style={{gridArea:"2/2/2/3", textAlign:"right"}}><input type="button" value="opera-Listen aktualisieren" onClick={async ()=>{
                        this.props.status("saving", "Aktualisierung wird ausgeführt.");
                        //const reStatus = await arachne.exec("opera_maiora_update");
                        const reStatus = await arachne.exec("opera_update");
                        if(reStatus===200){this.props.status("saved", "Aktualisierung erfolgreich.")}
                        else{this.props.status("error", "Die Aktualisierung war nicht erfolgreich.")}
                    }} /></div>
                </div>;
                break;
            case "updateStatistics":
                styleBody.gridTemplateRows = "1fr 1fr";
                mainBody = <div style={styleBody}>
                    <div style={{gridArea:"1/1/1/3", textAlign: "justify"}}>Um die Zahlen in der Statistik-Ansicht zu aktualisieren, müssen sie auf dem Server neu berechnet werden. Dieser Prozess kann 30 Sekunden bis 1 Minute dauern.<br /><b>Wechseln oder schließen Sie nicht die Ansicht, während die Aktualisierung ausgeführt wird.</b></div>
                    <div style={{gridArea:"2/2/2/3", textAlign:"right"}}><input type="button" value="Statistik aktualisieren" onClick={async ()=>{
                        this.props.status("saving", "Aktualisierung wird ausgeführt.");
                        const reStatus = await arachne.exec("statistics_update");
                        if(reStatus===200){this.props.status("saved", "Aktualisierung erfolgreich.")}
                        else{this.props.status("error", "Die Aktualisierung war nicht erfolgreich.")}
                    }} /></div>
                </div>;
                break;
            case "accounts":
                styleBody.display = "block";
                let userRows = [];
                // online: 30*60*1000 = 1800000
                for(const user of this.state.users){
                    userRows.push(<tr key={user.id} onDoubleClick={e=>{e.stopPropagation();this.setState({item: user})}}><td>{user.first_name} {user.last_name}</td><td>{JSON.parse(user.access).join(", ")}</td><td>{user.agent}</td><td>{Date.now()-new Date(user.session_last_active)<1800000?<FontAwesomeIcon icon={faSun} color="gold" style={{fontSize: "25px", marginLeft: "20px"}} />:<FontAwesomeIcon icon={faMoon} color="silver" style={{fontSize: "20px", marginLeft: "20px"}} />}</td></tr>)
                }
                mainBody = <div style={styleBody}><table className="minorTxt" width="100%"><tbody>{userRows}</tbody></table></div>;
                break;
            default:
                mainBody = <div>Tab nicht erkannt!</div>;
        }
        const styleBox = {
            "padding": "20px 20% 0 20%"
        }
        const styleHeader = {
            display: "flex",
            justifyContent: "space-evenly",
            padding: "10px 20px"

        }
        const styleTab = {
            padding: "5px 10px",
            cursor: "default"
        }
        const styleTabActive = {
            padding: "5px 10px",
            borderBottom: "1px solid red",
            cursor: "default"
        }
        return (<div style={styleBox} onDoubleClick={()=>{this.setState({item: null})}}>
            <div style={styleHeader}>
                <div style={this.state.tab==="updateOpera"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "updateOpera"})}}>Opera-Listen</div>
                <div style={this.state.tab==="updateStatistics"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "updateStatistics"})}}>Statistiken</div>
                {arachne.access("admin")?<div style={this.state.tab==="accounts"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "accounts"})}}>Kontenverwaltung</div>:null}
            </div>
            {mainBody}
            {this.state.item?<ServerAside status={this.props.status}  item={this.state.item} onUpdate={ids=>{alert("Ansicht updaten!")}} />:null}
        </div>);
    }
    componentDidMount(){
        if(arachne.access("admin")){
            const loadUsers = async () => {
                const newUsers = await arachne.user.getAll({order: ["last_name"]});
                this.setState({users: newUsers});
            };
            loadUsers();
        }
    }
}
class ServerAside extends React.Component{
    constructor(props){
        super(props);
        this.state = {access: JSON.parse(this.props.item.access)};
    }
    render(){
        const rights = {
            "auth": "Profil aktiviert",
            "admin": "Adminrechte",
            "o_view": "Kommentarspalte (opera-Listen)",
            "o_edit": "opera-Listen bearbeiten",
            "z_add": "Zettel importieren",
            "z_edit": "Zettel bearbeiten",
            "l_edit": "Lemma-Liste bearbeiten",
            "library": "Zugriff auf Bibliothek",
            "e_edit": "Bibliothek bearbeiten",
            "setup": "Zugriff auf Datenbanksetup",
            "module": "Zugriff über Python-Modul",
            "editor": "Zugriff auf Lemmastrecken-Editor",
            "comment": "Zugriff auf Kommentarfunktion",
            "comment_moderator": "Kommentare moderieren"
        };
        let rightList = [];
        for(const [right, description] of Object.entries(rights)){
            let marked = "";
            if(this.state.access.includes(right)){marked = "accessMarked"}
            rightList.push(<div key={right} className={marked} onClick={()=>{
                let nAccess = this.state.access;
                if(nAccess.includes(right)){
                    nAccess = nAccess.map(i => {if(i!=right){return i}});
                } else {
                    nAccess.push(right);
                }
                this.setState({access: nAccess});
            }}>{description}</div>);
        }

        return <div style={{
            position: "fixed",
            overflow: "scroll",
            top: 0,
            bottom: 0,
            right: 0,
            width: "400px",
            padding: "25px 15px 10px 15px",
            boxShadow: "rgb(60, 110, 113) 0px 0px 2px"
        }} className="mainColors">
            <h3>{this.props.item.first_name} {this.props.item.last_name}</h3>
            <div>Am {this.props.item.session_last_active} zuletzt online.</div>
            <div style={{border: "1px solid black", margin: "10px 0", padding: "10px"}}>{this.props.item.agent}</div>
            <h4>Rechte</h4>
            <div className="accessBox">{rightList}</div>
            <div><input type="button" style={{float: "right", marginTop: "20px"}} value="speichern" onClick={()=>{
                this.props.status("saving");
                arachne.user.save({
                    id: this.props.item.id,
                    access: JSON.stringify(this.state.access)
                })
                this.props.status("saved");
            }} /></div>
        </div>;
    }
    componentDidUpdate(prevProps){
        if(prevProps.item.id!=this.props.item.id){
            this.setState({access: JSON.parse(this.props.item.access)});
        }
    }
}
class Import extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            tab: "res",
            workLst: [],
            pathLst: [],
            scanWork: 1,
            scanType: 0,
            scanEditor: null,
            scanYear: null,
            scanVolume: null,
            scanVolumeContent: null,
            scanSerie: null,
            scanLibrary: null,
            scanLocation: null,
            scanSignature: null,
            scanFiles: null,
            ocrRessource: 1,
            ocrFiles: null,
            zettelLetter: "A",
            zettelFiles: null,
            zettelEditors: [[arachne.me.id, arachne.me.last_name]],
            zettelEditorSelected: arachne.me.id,
        };
    }
    render(){
        const styleBody = {
            boxShadow: "0px 2px 7px rgb(217, 217, 217)",
            padding: "40px 10% 20px 10%",
            display: "grid",
            gridTemplateColumns: "200px auto",
            gridTemplateRows: "1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr auto",
            gridGap: "15px"
        }
        let mainBody = <div style={styleBody}></div>;
        switch(this.state.tab){
            case "res":
                mainBody = <div style={styleBody}>
                    <div style={{gridArea: "1/1/1/2"}}>Werk:</div>
                    <div style={{gridArea: "1/2/1/3"}}><SelectMenu options={this.state.workLst} onChange={e=>{this.setState({scanWork: e.target.value})}} /></div>
                    <div style={{gridArea: "2/1/2/2"}}>Ressource:</div>
                    <div style={{gridArea: "2/2/2/3"}}><SelectMenu options={[[0, "Edition (relevant)"], [1, "Edition (veraltet)"], [2, "Handschrift"], [3, "Alter Druck (relevant)"], [4, "Alter Druck (veraltet)"], [5, "Sonstiges"]]} onChange={e=>{this.setState({scanType: parseInt(e.target.value)})}} /></div>
                    {this.state.scanType===0||this.state.scanType===1||this.state.scanType===5?[
                        <div key="0" style={{gridArea: "3/1/3/2"}}>Editor:</div>,
                        <div key="1" style={{gridArea: "3/2/3/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanEditor: e.target.value})}} /></div>,
                        <div key="2" style={{gridArea: "4/1/4/2"}}>Jahr:</div>,
                        <div key="3" style={{gridArea: "4/2/4/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanYear: e.target.value})}} /></div>,
                        <div key="4" style={{gridArea: "5/1/5/2"}}>Band:</div>,
                        <div key="5" style={{gridArea: "5/2/5/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanVolume: e.target.value})}} /></div>,
                        <div key="6" style={{gridArea: "6/1/6/2"}}>Bandinhalt:</div>,
                        <div key="7" style={{gridArea: "6/2/6/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanVolumeContent: e.target.value})}} /></div>,
                        <div key="8" style={{gridArea: "7/1/7/2"}}>Reihe:</div>,
                        <div key="9" style={{gridArea: "7/2/7/3"}}><SelectMenu options={[[0, ""], [1, "Migne PL"], [2, "ASBen."], [3, "ASBoll."], [4, "AnalBoll."], [5, "Mon. Boica"], [6, "Ma. Schatzverzeichnisse"], [7, "Ma. Bibliothekskataloge"]]} onChange={e=>{this.setState({scanSerie: parseInt(e.target.value)})}} /></div>
                    ]:null}
                    {this.state.scanType===2?[
                        <div key="0" style={{gridArea: "3/1/3/2"}}>Stadt:</div>,
                        <div key="1" style={{gridArea: "3/2/3/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanLocation: e.target.value})}} /></div>,
                        <div key="2" style={{gridArea: "4/1/4/2"}}>Bibliothek:</div>,
                        <div key="3" style={{gridArea: "4/2/4/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanLibrary: e.target.value})}} /></div>,
                        <div key="4" style={{gridArea: "5/1/5/2"}}>Signatur:</div>,
                        <div key="5" style={{gridArea: "5/2/5/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanSignature: e.target.value})}} /></div>
                    ]:null}
                    {this.state.scanType===3||this.state.scanType===4?[
                        <div key="0" style={{gridArea: "3/1/3/2"}}>Drucker:</div>,
                        <div key="1" style={{gridArea: "3/2/3/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanEditor: e.target.value})}} /></div>,
                        <div key="2" style={{gridArea: "4/1/4/2"}}>Ort:</div>,
                        <div key="3" style={{gridArea: "4/2/4/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanLocation: e.target.value})}} /></div>,
                        <div key="4" style={{gridArea: "5/1/5/2"}}>Jahr:</div>,
                        <div key="5" style={{gridArea: "5/2/5/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanYear: e.target.value})}} /></div>,
                    ]:null}
                    <div style={{gridArea: "9/1/9/2"}}>Dateipfad:</div>
                    <div style={{gridArea: "9/2/9/3"}}><input type="text" style={{width: "96%"}} onChange={e=>{this.setState({scanPath: e.target.value})}} /></div>
                    <div style={{gridArea: "10/1/10/2"}}>.png-Dateien:</div>
                    <div style={{gridArea: "10/2/10/3"}}><input type="file" name="files" accept="image/png" multiple onChange={e=>{this.setState({scanFiles: e.target.files})}} /></div>
                    <div style={{gridArea: "12/2/12/3"}}><input type="button" value="hochladen" onClick={async ()=>{
                        if(this.state.scanFiles==null){
                            this.props.status("error", "Geben Sie Dateien zum Hochladen an.");
                        } else if((this.state.scanType===0||this.state.scanType===1||this.state.scanType===5)&&(!this.state.scanEditor||!this.state.scanYear)){
                            this.props.status("error", "Geben Sie den Editor und das Jahr ein.");
                        } else if(this.state.scanPath&&this.state.scanWork){
                            this.props.status("saving", "Die Dateien werden hochgeladen.");
                            // create new edition
                            const newEditionId = await arachne.edition.save({
                                work_id: this.state.scanWork,
                                ressource: this.state.scanType,
                                editor: this.state.scanEditor,
                                year: this.state.scanYear,
                                volume: this.state.scanVolume,
                                vol_cont: this.state.scanVolumeContent,
                                serie: this.state.scanSerie,
                                location: this.state.scanLocation,
                                library: this.state.scanLibrary,
                                signature: this.state.scanSignature,
                                path: this.state.scanPath,
                                url: "",
                            });
                            console.log("new edition id:", newEditionId);
                            // upload files
                            if(newEditionId>0){
                                let uploadForm = new FormData();
                                uploadForm.append("edition_id", newEditionId);
                                uploadForm.append("path", this.state.scanPath);
                                const fLength = this.state.scanFiles.length;
                                for(let i=0; i<fLength; i++){uploadForm.append("files", this.state.scanFiles[i])}
                                const re = await arachne.importScans(uploadForm);
                                if(re.status===400){this.props.status("error", "Fehler beim Hochladen der Dateien.")}
                                else if(re.body.length==1){this.props.status("saved", "Das Hochladen war erfolgreich. Eine Datei wurde übersprungen (s. Konsole).");console.log(`Bereits auf dem Server und deshalb übersprungen: ${re.body.join(", ")}`)}
                                else if(re.body.length>0){this.props.status("saved", `Das Hochladen war erfolgreich. ${re.body.length} Dateien wurden übersprungen (s. Konsole).`);console.log(`Bereits auf dem Server und deshalb übersprungen: ${re.body.join(", ")}`)}
                                else{this.props.status("saved", "Das Hochladen war erfolgreich.")}
                            } else {
                                this.props.status("error", "Edition konnte nicht erstellt werden.");
                            }
                        } else{this.props.status("error", "Geben Sie einen gültigen Pfad ein!")}                    
                    }} /></div>
                </div>;
                break;
            case "ocr":
                styleBody.gridTemplateRows = "1fr 1fr 1fr 1fr auto";
                mainBody = <div style={styleBody}>
                    <div>Ressource:</div>
                    <div><SelectMenu options={this.state.pathLst} onChange={async e=>{this.setState({ocrRessource: e.target.value})}} /></div>
                    <div>.txt-Dateien:</div>
                    <div><input type="file" accept="text/plain" multiple onChange={e=>{this.setState({ocrFiles: e.target.files})}} /></div>
                    <div style={{gridArea:"4/2/4/3"}}><input type="button" value="hochladen" onClick={async ()=>{
                        if(this.state.ocrFiles==null){
                            this.props.status("error", "Geben Sie Dateien zum Hochladen an.");
                        }else if(this.state.ocrRessource==null){
                            this.props.status("error", "Wählen Sie einen Ordner aus.");
                        }else{
                            this.props.status("saving", "Die Dateien werden hochgeladen.");
                            const scanLst = await arachne.scan.get({path: this.state.ocrRessource}, {select: ["id", "filename"]});
                            console.log(scanLst);
                            let missLst = [];
                            let saveLst = [];
                            for(const file of this.state.ocrFiles){
                                const fName = file.name.substring(0,file.name.length-4);
                                const cScan = scanLst.find(i => i.filename == fName);
                                if(cScan){
                                    console.log(cScan);
                                    const fileTxt = await file.text();
                                    saveLst.push({id: cScan.id, full_text: fileTxt});
                                } else {
                                    missLst.push(file.name);
                                }
                            }
                            if(saveLst.length>0){await arachne.scan.save(saveLst)}
                            if(missLst.length>1){this.props.status("saved", `Dateien wurden hochgeladen. ${missLst.length} Dateien konnten nicht zugewiesen werden (s. Konsole).`);console.log(`übersprungene Dateien: ${missLst.join(", ")}`)}
                            else if(missLst.length==1){this.props.status("saved", "Dateien wurden hochgeladen. 1 Datei konnte nicht zugewiesen werden (s. Konsole).");console.log(`übersprungene Dateien: ${missLst.join(", ")}`)}
                            else{this.props.status("saved", "Dateien wurden hochgeladen.");}
                        }
                    }} /></div>
                </div>;
                break;
            case "zettel":
                styleBody.gridTemplateRows = "1fr 1fr 1fr 1fr 1fr auto";
                mainBody = <div style={styleBody}>
                    <div>Buchstabe:</div>
                    <div><SelectMenu options={[["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"], ["F", "F"], ["G", "G"], ["H", "H"], ["I", "I"], ["J", "J"], ["K", "K"], ["L", "L"], ["M", "M"], ["N", "N"], ["O", "O"], ["P", "P"], ["Q", "Q"], ["R", "R"], ["S", "S"], ["T", "T"], ["U", "U"], ["V", "V"], ["W", "W"], ["X", "X"], ["Y", "Y"], ["Z", "Z"]]} onChange={e=>{this.setState({zettelLetter: e.target.value})}} /></div>
                    <div>erstellt von:</div>
                    <div><SelectMenu options={this.state.zettelEditors} onChange={e=>{this.setState({zettelEditorSelected: e.target.value})}} /></div>
                    <div>Dateien:</div>
                    <div><input type="file" accept="image/jpeg" multiple onChange={e=>{this.setState({zettelFiles: e.target.files})}} /></div>
                    <div style={{gridArea:"4/2/4/3"}}><input type="button" value="hochladen" onClick={async ()=>{
                        if(this.state.zettelFiles==null){
                            this.props.status("error", "Geben Sie Dateien zum Hochladen an.");
                        }else{
                            this.props.status("saving", "Die Dateien werden vorbereitet.");
                            const maxItem= 100;
                            let cItemCount = maxItem;
                            let cUploadIndex = -1;
                            let uploadGroup = [];
                            const fLength = this.state.zettelFiles.length;
                            // prepare upload groups
                            for(let i=0; i<fLength; i++){
                                if(cItemCount >= maxItem){
                                    cItemCount = 0;
                                    cUploadIndex ++;
                                    uploadGroup.push(new FormData());
                                    uploadGroup[cUploadIndex].append("letter", this.state.zettelLetter);
                                    uploadGroup[cUploadIndex].append("type", "0");
                                    uploadGroup[cUploadIndex].append("user_id_id", this.state.zettelEditorSelected);
                                }
                                cItemCount ++;
                                uploadGroup[cUploadIndex].append("files", this.state.zettelFiles[i]);
                            }
                            // loop through groups and upload!
                            this.props.status("saving", "Die Dateien werden hochgeladen.");
                            for(const uItem of uploadGroup){
                                await arachne.importZettel(uItem);
                            }

                            this.props.status("saved", "Dateien wurden hochgeladen.");
                        }
                    }} /></div>
                </div>;
                break;
            default:
                mainBody = <div>Tab nicht gefunden.</div>;
        }
        const styleBox = {
            "padding": "20px 20% 0 20%"
        }
        const styleHeader = {
            display: "flex",
            justifyContent: "space-evenly",
            /*border: "1px solid white",*/
            padding: "10px 20px"

        }
        const styleTab = {
            padding: "5px 10px",
            cursor: "default"
        }
        const styleTabActive = {
            padding: "5px 10px",
            borderBottom: "1px solid red",
            cursor: "default"
        }
        return (<div style={styleBox}>
            <div style={styleHeader}>
                <div style={this.state.tab==="res"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "res"})}}>Ressource</div>
                <div style={this.state.tab==="ocr"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "ocr"})}}>ocr-Dateien</div>
                <div style={this.state.tab==="zettel"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "zettel"})}}>Zettel</div>
            </div>
            {mainBody}
        </div>);
    }
    componentDidMount(){
        const loadOptions = async () => {
            const works = await arachne.work.get({in_use: 1}, {select: ["id", "ac_web"], order: ["ac_web"]});
            let newWorkLst = [];
            for(const work of works){
                newWorkLst.push([work.id, work.ac_web]);
            }
            this.setState({workLst: newWorkLst});
            const paths = await arachne.scan_paths.getAll({select: ["path"], order: ["path"]});
            let newPathLst = [];
            for(const path of paths){
                newPathLst.push([path.path, path.path]);
            }
            this.setState({pathLst: newPathLst, ocrRessource: newPathLst[0][0]});

        }
        loadOptions();

        if(arachne.access("admin")){
            arachne.user.getAll({order: ["last_name"]}).then(users=>{
                let userLst = [];
                for(const user of users){
                    userLst.push([user.id, user.last_name]);
                }
                this.setState({zettelEditors: userLst});
            }).catch(e=>{throw e});
        }
    }
}
class Help extends React.Component{
    render(){
        return (
    <div style={{padding: "20px 40px"}}>
        <p>
        <a href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/00-Start">Hilfe und Informationen</a> zu dMLW finden Sie auf unsererer <a href="https://gitlab.lrz.de/haeberlin/dmlw">GitLab-Seite</a>.</p>
        <p>Informationen zu der aktuellen Version von dMLW und den Veränderungen finden Sie <a href="https://gitlab.lrz.de/haeberlin/dmlw/-/blob/master/CHANGELOG.md">in unserem Changelog</a>.</p>
        <p>Informationen zum Wörterbuch-Projekt auf <a href="www.mlw.badw.de">www.mlw.badw.de</a></p> 
    </div>
        );
    }
}

export { Account, Help, Import, Server, Statistics };