// VERSION 1 - 03.11.2021

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
        // options = {count:true|false, limit:100, offset:100, select:[], order:[]}
        let url = `${this.url}/data/${this.tblName}?query=${JSON.stringify(query)}`;
        if(options.count===true){url += "&count=1"}
        if(options.limit){url += "&limit="+options.limit}
        if(options.offset){url += "&offset="+options.offset}
        if(options.select){url += "&select="+JSON.stringify(options.select)}
        if(options.order){url += "&order="+JSON.stringify(options.order)}
        url = encodeURI(url);
        return await fetch(url, {headers: {"Authorization": `Bearer ${this.key}`}})
        .then(re => {
            if(re.status === 200){return re.json()}
            else{
                let errorEvent = new CustomEvent("arachneError", {detail: {method: "search", status: re.status}});
                window.dispatchEvent(errorEvent);
            }
        });
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
        } else {
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
        let localOptions = localStorage.getItem("dmlwOptions");
        if(localOptions){
            localOptions = JSON.parse(localOptions);
            this.options = {z_width: localOptions.z_width?localOptions.z_width:500};
        } else {
            this.options = {z_width: 500};
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
        });
        if(re.status === 200){
            this.key = await re.text();
            return this.open(tbls);
        }else{
            return false;
        }
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
    }
    async getUser(){
        const reUser = await fetch(this.url+"/session",
             {headers: {
                 "Authorization": `Bearer ${this.key}`
                }});
        if(reUser.status === 200){return await reUser.json();}
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
        if(re.status != 201){
            alert("Ein Fehler ist aufgetreten! Bitte überprüfen Sie die hochgeladenen Zettel.");
            throw "Error: Fehler beim Zettel-Upload!";
        }
    }
    async exec(mode){
        const re = await fetch(this.url+"/exec/"+mode, {method: "GET", 
        headers: {"Authorization": `Bearer ${this.key}`}
        });
        return re.status;
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
}

let arachne = new Arachne();

export { arachne };