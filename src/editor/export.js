import { useState, useEffect } from "react";
import { arachne } from "./../arachne";

function ExportBox(props){
	const [exportTxt, setExportTxt] = useState("");
	useEffect(()=>{
		const fetchData=async()=>{
			let exportLst = [];
			const articles = await arachne.article.get({project_id: props.project.id});
			const sections = await arachne.sections.get({project_id: props.project.id});
			const getArticle = (article, depth) => {
				if(depth===0){
					exportLst.push(`BEDEUTUNG ${article.name}`);
				}else if(depth===1){
					exportLst.push(`    UNTER_BEDEUTUNG ${article.name}`);
				}else if(depth===2){
					exportLst.push(`        UNTER_UNTER_BEDEUTUNG ${article.name}`);
				}else{
					exportLst.push(`${"    ".repeat(depth)}${"U".repeat(depth)}_BEDEUTUNG ${article.name}`);
				}
				sections.filter(s=>s.article_id===article.id).forEach(s=>exportLst.push(`${"    ".repeat(depth+1)}* ${s.ref} "${s.text?s.text:""}"`))
				articles.filter(a=>a.parent_id===article.id).forEach(a=>{getArticle(a,depth+1)});
			}
			articles.filter(a=>a.parent_id===0).forEach(a=>{getArticle(a,0)});
			exportLst.push(`AUTORIN ${arachne.me.last_name}`)
			setExportTxt(exportLst.join("\n"));

		};
		fetchData();
	}, []);
	return <div>
		<textarea className="exportTextBox" value={exportTxt} onChange={()=>{}}></textarea>
	</div>;
}

export { ExportBox }