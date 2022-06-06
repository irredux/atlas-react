// VERSION 1.5 - 2.06.2022

class ArachneTable {
    constructor(tblName, url, key){
        this.tblName = tblName;
        this.url = url;
        this.key = key;
    }
    async getAll(options={}){
        return await this.search([{c:"id", o:">", v:0}], options);
    }
    async get(query, options={}){
        let qLst = [];
        for(const key in query){qLst.push({c: key, o:"=", v:query[key]})}
        return await this.search(qLst, options);
    }
    async search(query, options={}){
        let url = `${this.url}/${options.export?"export":"data"}/${this.tblName}?query=${JSON.stringify(query)}`;
        if(options.count===true){url += "&count=1"}
        if(options.limit){url += "&limit="+options.limit}
        if(options.offset){url += "&offset="+options.offset}
        if(options.select){url += "&select="+JSON.stringify(options.select)}
        if(options.order){url += "&order="+JSON.stringify(options.order)}
        if(options.group){url += "&group="+options.group}
        url = encodeURI(url);
        const re = await fetch(url, {headers: {"Authorization": `Bearer ${this.key}`}});
        if(re.status === 200){
            if(options.export){return re.text()}
            else{return re.json()}
        }else{
            let errorEvent = new CustomEvent("arachneError", {detail: {method: "search", status: re.status}});
            window.dispatchEvent(errorEvent);
        }
        
    }
    async delete(rowId){
        let url = `${this.url}/data/${this.tblName}/${rowId}`;
        let data = null;
        if(Array.isArray(rowId)){
            url = `${this.url}/data_batch/${this.tblName}`;
            data = JSON.stringify(rowId);
        }
        const response = await fetch(url, {
            method: "delete",
            headers: {
                "Authorization": `Bearer ${this.key}`,
                "Content-Type": "application/json",
            },
            body: data
        });
        if(response.status===200){
            return true;
        } else {
            let errorEvent = new CustomEvent("arachneError", {detail: {method: "delete", status: response.status}});
            window.dispatchEvent(errorEvent);
        }
    }

    async save(newValues){
        // newValues is an object containing col/values as key/value pairs.
        // when no id is given, a new entry will be created.
        // for batch saving: newValues = [{col: val}, {col. val}, ...]
        let method = "POST";
        let url = "";
        let rId = 1;
        if(Array.isArray(newValues)){
            url = `${this.url}/data_batch/${this.tblName}`;
        } else {
            url = `${this.url}/data/${this.tblName}`;
            rId = newValues.id;
            if(newValues.id!=null){
                url += `/${newValues.id}`;
                method = "PATCH";
                delete newValues.id;
            }
        }
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${this.key}`
            },
            body: JSON.stringify(newValues)
        });
        if(response.status===201 && method==="POST"){
            if(Array.isArray(newValues)){return await rId}
            else {return parseInt(await response.text())}
        } else if(response.status===200 && method==="PATCH"){
            return rId;
        } else if(Array.isArray(newValues)){
            return true;
        } else {
            console.log("response status:", response.status)
            let errorEvent = new CustomEvent("arachneError", {detail: {method: "save", status: response.status}});
                window.dispatchEvent(errorEvent);
            //throw new Error(`ARACHNE: entry not saved. Status: ${response.status}`);
        }
    }
}

class Arachne {
    constructor(url=""){
        if(url===""&&window.location.origin==="http://localhost:3000"){this.url = "http://localhost:8080"}
        else{this.url=url}
        this.key = null;
        this.me = null;
        
        // load local options for displaying in current browser
        this.options = {
            z_width: 500,
            z_height: 350,
            action_key: "alt",
            argos_mode: 0,
            argos_query: "",
            argos_zoom: 70,
            openExternally: 0, // 0 = open in same window, 1 = open externally, 2 = open in echo.
        };
        let localOptions = localStorage.getItem("dmlwOptions");
        if(localOptions){
            localOptions = JSON.parse(localOptions);
            Object.entries(localOptions).forEach(e=>{this.options[e[0]] = e[1]});
        }
    }
    setOptions(name, value){
        this.options[name] = value;
        localStorage.setItem("dmlwOptions", JSON.stringify(this.options))
    }
    async login(user, password, tbls=null){
        // opens a connection to the server and creates a session key
        let re = await fetch(this.url+"/session", {
            "method": "post",
            headers: {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({user: user, password: password})
        }).catch(e=>{return {status: 500}});
        if(re.status === 200){
            this.key = await re.text();
            return this.open(tbls);
        }
        return false;
    }
    async open(tbls=null){
        const reUser = await this.getUser();
        if(reUser){
            this.me = reUser;
            this.me.selectKey = 'ctrl';
            if (navigator.appVersion.indexOf('Mac') > -1){this.me.selectKey = 'cmd';}
        }
        else {return false;}

        if(tbls == null){tbls = await this.tables()}
        for(const tbl of tbls){this[tbl] = new ArachneTable(tbl, this.url, this.key)}
        return true;
    }
    async close(){
        this.key = null;
        let re = await fetch(this.url+"/session", {"method": "delete"});
        return re.status;
    }
    async getUser(){
        const reUser = await fetch(this.url+"/session",
             {headers: {
                 "Authorization": `Bearer ${this.key}`
                }});
        if(reUser.ok&&reUser.status === 200){return await reUser.json();}
        else {return false;}
    }
    async createAccount(data){
        const re = await fetch(this.url+"/data/user", {method: "POST", 
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)});
        return re.status;
    }

    async importScans(newForm){
        const re = await fetch(this.url+"/file/scan", {method: "POST", 
        headers: {"Authorization": `Bearer ${this.key}`},
            body: newForm
        });
        return {status: re.status, body: await re.json()};
    }
    async importZettel(newForm){
        const re = await fetch(this.url+"/file/zettel", {method: "POST", body: newForm,
            headers: {"Authorization": `Bearer ${this.key}`}});
        if(re.status!==201){
            alert("Ein Fehler ist aufgetreten! Bitte überprüfen Sie die hochgeladenen Zettel.");
            throw "Error: Fehler beim Zettel-Upload!";
        } else {return await re.json();}
    }
    async exec(mode, body=false){
        const re = await fetch(this.url+"/exec/"+mode, {method: "GET", 
        headers: {"Authorization": `Bearer ${this.key}`}
        });
        if(body){return await re.json()}
        else{return re.status;}
    }
    access(rights){
        if(this.me){
            if(typeof rights === "string"){rights=JSON.parse(`["${rights}"]`)}
            return rights.every(r => this.me.access.includes(r));
        }else{return false;}
    }
    async getScan(scanId){
        const newImg = await fetch(`${this.url}/file/scan/${scanId}`, {headers: {"Authorization": `Bearer ${this.key}`}}).then(re => re.blob());
        let nURL = URL.createObjectURL(newImg);
        return nURL;
    }
    async sendEcho(data){
        const isOnline = await new Promise((resolve, reject)=>{
            const bc = new BroadcastChannel("echo");
            bc.onmessage = e => {
                if(e.data.type==="hello"&&e.data.msg==="back"){resolve(true)}
            };
            bc.postMessage({type: "hello", msg: "echo"});
            setTimeout(()=>{resolve(false)},500);

        });
        if(isOnline){
            const bc = new BroadcastChannel("echo");
            bc.postMessage(data);
        }else{
            const isOpened= await new Promise((resolve, reject)=>{
                const bc = new BroadcastChannel("echo");
                bc.onmessage = e => {
                    if(e.data.type==="hello"&&e.data.msg==="world"){resolve(true)}
                }
                window.open(`/?project=${this.project_name}&app=echo`, "_blank");
                setTimeout(()=>{resolve(false)},1000);
            });
            if(isOpened){
                const bc = new BroadcastChannel("echo");
                bc.postMessage(data);
            }
            else{throw "Cannot connect to echo."}
        }
    }
}

let arachne = new Arachne();

export { arachne };