import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { faSun, faMoon } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { arachne } from "./arachne.js";
import { SelectMenu } from "./elements.js";

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
                    <input type="range" min="400" max="600" value={this.state.z_width} className="slider" id="zettelWidthRange" onChange={e=>{arachne.setOptions("z_width", e.target.value);this.setState({z_width: e.target.value})}} />
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
        let zettelBox = <div>Inhalt wird geladen...</div>;
        if(this.state.zettel_process){
            let zettelCharts = [];

            // bearbeitungsstand
            const zettel_process_data = {
                labels: Object.keys(this.state.zettel_process),
                datasets: [
                  {
                    label: '',
                    data: Object.values(this.state.zettel_process),
                    backgroundColor: ['#114B79', '#347F9F', '#8FC9D9', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#065A82', '#61A4BC', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            };
            zettelCharts.push(<div key="1" style={{width: "500px", height: "500px"}}><h4>nach Bearbeitungsstand</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={zettel_process_data} /></div>);
            
            // zetteltyp
            const zettel_types_data = {
                labels: Object.keys(this.state.zettel_types),
                datasets: [
                  {
                    label: '',
                    data: Object.values(this.state.zettel_types),
                    backgroundColor: ['#ffea00', '#009d00', '#e8413d', '#0000ed', '#7700cf', '#61b2b9', '#a6a6a6'],
                    borderColor: ['#c4b400', '#004f00', '#C11B17', '#0000A0', '#4B0082', '#3f888f', 'gray'],
                    borderWidth: 1,
                  },
                ],
            };

            zettelCharts.push(<div key="2" style={{width: "500px", height: "500px"}}><h4>nach Farbe</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={zettel_types_data} /></div>);

            // erstelldatum
            const zettel_created_data = {
                labels: Object.keys(this.state.zettel_created),
                datasets: [
                  {
                    label: '',
                    data: Object.values(this.state.zettel_created),
                    backgroundColor: ['#114B79', '#347F9F'],
                    borderColor: ['#1B3B6F', '#065A82'],
                    borderWidth: 1,
                  },
                ],
            };
            zettelCharts.push(<div key="3" style={{gridArea: "2/1/2/3", width: "100%", height: "400px"}}><h4>nach Erstelldatum</h4><Bar options={{aspectRatio: false, plugins: {legend:{display: false}}}} data={zettel_created_data} /></div>);

            // änderungsdatum
            const zettel_changed_data = {
                labels: Object.keys(this.state.zettel_changed),
                datasets: [
                  {
                    label: '',
                    data: Object.values(this.state.zettel_changed),
                    backgroundColor: ['#D2EFF4'],
                    borderColor: ['#1B3B6F'],
                    borderWidth: 1,
                    fill: true,
                  },
                ],
            };
            zettelCharts.push(<div key="4" style={{gridArea: "3/1/3/3", width: "100%", height: "400px"}}><h4>nach Änderungsdatum</h4><Line options={{aspectRatio: false, plugins: {legend:{display: false}}}} data={zettel_changed_data} /></div>);

            zettelBox = <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "600px 500px 500px"}}>{zettelCharts}</div>;
        }

        // lemma
        let lemmaBox = <div>Inhalt wird geladen...</div>;
        if(this.state.lemma_letters){
            let lemmaCharts = [];
            // nach Buchstaben
            const lemma_letters_data = {
                labels: Object.keys(this.state.lemma_letters),
                datasets: [
                  {
                    label: '',
                    data: Object.values(this.state.lemma_letters),
                    backgroundColor: ['#114B79', '#347F9F', '#8FC9D9', '#D2EFF4', '#EAF2F3'],
                    borderColor: ['#1B3B6F', '#065A82', '#61A4BC', '#BCEDF6', '#E8F1F2'],
                    borderWidth: 1,
                  },
                ],
            };
            lemmaCharts.push(<div key="1" style={{width: "500px", height: "500px"}}><h4>nach Buchstaben</h4><Pie options={{plugins: {legend:{display: false}}}} data={lemma_letters_data} /></div>);

            // Colors
            const lemma_colors_data = {
                labels: Object.keys(this.state.lemma_colors),
                datasets: [
                  {
                    label: '',
                    data: Object.values(this.state.lemma_colors),
                    backgroundColor: ['#ffea00', '#009d00', '#e8413d', '#0000ed', '#7700cf', '#61b2b9', '#a6a6a6'],
                    borderColor: ['#c4b400', '#004f00', '#C11B17', '#0000A0', '#4B0082', '#3f888f', 'gray'],
                    borderWidth: 1,
                  },
                ],
            };
            lemmaCharts.push(<div key="2" style={{width: "500px", height: "500px"}}><h4>nach Farbe</h4><Pie options={{plugins: {legend:{position: "bottom"}}}} data={lemma_colors_data} /></div>);

            lemmaBox = <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "600px"}}>{lemmaCharts}</div>;
        }
        
        const styleBody = {
            boxShadow: "0px 2px 7px rgb(217, 217, 217)",
            padding: "40px 5% 20px 5%",
            textAlign: "center",
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
            default:
                mainBody = <div>Tab nicht erkannt!</div>;
        }
        const styleBox = {
            "padding": "10px 10px 10px 10px"
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
            </div>
            {mainBody}
        </div>);
    }
    componentDidMount(){
        const getZettel = async () => {
            const zettels = await arachne.zettel.getAll({select: ["konkordanz_id", "lemma_id", "farbe", "c_date", "u_date"]});
            // process
            let process = {
                "Lemma&Sigel": zettels.filter(z => (z.konkordanz_id>0&&z.lemma_id>0)).length,
                "nur Lemma": zettels.filter(z => !(z.konkordanz_id>0)&&z.lemma_id>0).length,
                "nur Sigel":  zettels.filter(z => z.konkordanz_id>0&&!(z.lemma_id>0)).length
            }
            process["ohne Verknüpfung"] = zettels.length - Object.values(process).reduce((previousValue, currentValue) => previousValue+currentValue);

            let types = {
                gelb: zettels.filter(z => z.farbe==="gelb").length,
                grün: zettels.filter(z => z.farbe==="grün").length,
                rot: zettels.filter(z => z.farbe==="rot").length,
                blau: zettels.filter(z => z.farbe==="blau").length,
                lila: zettels.filter(z => z.farbe==="lila").length,
                türkis: zettels.filter(z => z.farbe==="türkis").length,
            }
            types["ohne Farbe"] = zettels.length-Object.values(types).reduce((previousValue, currentValue)=>previousValue+currentValue);
            
            // created + changed
            const range = (start, stop) => Array.from({ length: (stop-start)+1}, (_, i) => start + (i));
            let created = {};
            let changed = {};
            let years = range(2021, new Date(Date.now()).getFullYear());
            for(const year of years){
                let months = range(1,12);
                if(year===new Date(Date.now()).getFullYear()){
                    months = range(1, new Date(Date.now()).getMonth()+1);
                }
                for(const month of months){
                    created[`${year}-${month}`] = zettels.filter(z => new Date(z.c_date).getFullYear()===year&&new Date(z.c_date).getMonth()+1===month).length;
                    changed[`${year}-${month}`] = zettels.filter(z => new Date(z.u_date).getFullYear()===year&&new Date(z.u_date).getMonth()+1===month).length;
                }
            }
            this.setState({zettel_process: process, zettel_types: types, zettel_created: created, zettel_changed: changed});
        };
        getZettel();

        
        const getLemmata = async () => {
            const lemmata = await arachne.lemma.getAll({select: ["lemma", "farbe"]});

            // letter
            let letters = {"A":0, "B":0, "C":0, "D":0, "E":0, "F":0, "G":0, "H":0, "I":0, "K":0, "L":0, "M":0, "N":0, "O":0, "P":0, "Q":0, "R":0, "S":0, "T":0, "U":0, "V":0, "X":0, "Y":0, "Z":0};
            for(const letter of Object.keys(letters)){
                letters[letter] = lemmata.filter(l => l.lemma.substring(0,1).toUpperCase()===letter).length;
            }
            letters.Rest = lemmata.length - Object.values(letters).reduce((previousValue, currentValue) => previousValue+currentValue);

            // color
            let colors = {
                gelb: lemmata.filter(z => z.farbe==="gelb").length,
                grün: lemmata.filter(z => z.farbe==="grün").length,
                rot: lemmata.filter(z => z.farbe==="rot").length,
                blau: lemmata.filter(z => z.farbe==="blau").length,
                lila: lemmata.filter(z => z.farbe==="lila").length,
                türkis: lemmata.filter(z => z.farbe==="türkis").length,
            }
            colors["ohne Farbe"] = lemmata.length-Object.values(colors).reduce((previousValue, currentValue)=>previousValue+currentValue);
            this.setState({lemma_letters: letters, lemma_colors: colors});
        };
        getLemmata();

        /*
        const getRessources = async () => {
            const scans = await arachne.scan.getAll({select: ["full_text"]});
            let fullTexts = {
                "mit Volltext": scans.filter(s => s.full_text!=null&&s.full_tet!="").length
            }
            fullTexts["ohne Volltext"] = scans.length - Object.values(fullTexts).reduce((previousValue, currentValue) => previousValue+currentValue);
            this.setState({ressource_work: 1, ressource_fullTexts: fullTexts});
        }
        getRessources();*/
    }
}

class Server extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            tab: "accounts",
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
            case "accounts":
                styleBody.display = "block";
                let userRows = [];
                // online: 30*60*1000 = 1800000
                for(const user of this.state.users){
                    userRows.push(<tr key={user.id}><td>{user.first_name} {user.last_name}</td><td>{JSON.parse(user.access).join(", ")}</td><td>{user.agent}</td><td>{Date.now()-new Date(user.session_last_active)<1800000?<FontAwesomeIcon icon={faSun} color="gold" style={{fontSize: "25px", marginLeft: "20px"}} />:<FontAwesomeIcon icon={faMoon} color="silver" style={{fontSize: "20px", marginLeft: "20px"}} />}</td></tr>)
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
                {arachne.access("admin")?<div style={this.state.tab==="accounts"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "accounts"})}}>Kontenverwaltung</div>:null}
            </div>
            {mainBody}
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
class Import extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            tab: "zettel",
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
                <div style={this.state.tab==="zettel"?styleTabActive:styleTab} onClick={()=>{this.setState({tab: "zettel"})}}>Zettel</div>
            </div>
            {mainBody}
        </div>);
    }
    componentDidMount(){
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

export { Account, Import, Server, Statistics };