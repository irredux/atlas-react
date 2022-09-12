import { useState, useEffect } from "react";
import { arachne } from "./../arachne";
import { defaultArticleHeadFields } from "./outline.js";
import { Button, ButtonGroup, Dropdown, Table, Badge, Card, Col, Form, Container, Navbar, Nav, Row, Modal, Accordion, Stack, Spinner, Offcanvas, Tabs, Tab } from "react-bootstrap";
import { parseHTML } from "./../elements";

function ExportBox(props){
	const [exportTxt, setExportTxt] = useState("");
	const [exportComment, setExportComment] = useState(true);
	const [exportTags, setExportTags] = useState(true);
	const [preview, setPreview] = useState(null);
	const [loadPreview, setLoadPreview] = useState(0); // 0 = not jet loaded; 1 = loading; 2 = loaded.
	useEffect(()=>{
		const fetchData=async()=>{
			let exportLst = [];
			const articles = await arachne.article.get({project_id: props.project.id});
			const sections = await arachne.sections.get({project_id: props.project.id});
			let tags = [];
			let tag_lnks = [];
			if(exportTags){
				tags = await arachne.tags.get({project_id: props.project.id});
				tag_lnks = await arachne.tag_lnks.get({project_id: props.project.id});
			}
			exportLst=exportLst.concat(articles.filter(a=>a.type>=900).map(a=>`${defaultArticleHeadFields.find(d=>d[0]===a.type)[1]} ${a.name}`))
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
				sections.filter(s=>s.article_id===article.id).forEach(s=>{
					let tagLst = [];
					if(exportTags){
						tagLst = tag_lnks.filter(tl=>tl.section_id===s.id).map(tl=>tags.find(t=>t.id===tl.tag_id).name);
					}
					exportLst.push(`${"    ".repeat(depth+1)}* ${s.ref} "${s.text?s.text:""}"${tagLst.length>0?" // "+tagLst.join(", "):""}`);
					if(exportComment&&s.comment){exportLst.push(`${"    ".repeat(depth+2)}/*\n${"    ".repeat(depth+3)}${s.comment.replace(new RegExp("\n", "g"), `\n${"    ".repeat(depth+3)}`)}\n${"    ".repeat(depth+2)}*/`)}
				});

				articles.filter(a=>a.parent_id===article.id).forEach(a=>{getArticle(a,depth+1)});
			}
			articles.filter(a=>a.parent_id===0&&a.type<900).forEach(a=>{getArticle(a,0)});
			exportLst.push(`AUTORIN ${arachne.me.last_name}`)
			setExportTxt(exportLst.join("\n"));

			//get preview
			setLoadPreview(1);
			const exportTxt = exportLst.join("\n");
			const previewResponse = await arachne.exec("mlw_preview", true, exportTxt);
			//console.log(previewResponse[0].html)
			setPreview(previewResponse);
			setLoadPreview(2);
		};
		fetchData();
	}, [exportComment, exportTags]);
	return <Container>
		<Tabs defaultActiveKey="text" className="mb-4">
			<Tab eventKey="text" title="Exporttext">
				<Row className="mb-4">
					<Col style={{padding: "0 10em 0 10em"}}>
						<Form.Check
		                    type="switch"
		                    id="custom-switch"
		                    label="Kommentare in Export aufnehmen."
		                    checked={exportComment}
		                    value={exportComment}
		                    onChange={e=>{setExportComment(!exportComment)}}
		                />
		                <Form.Check
		                    type="switch"
		                    id="custom-switch"
		                    label="Tags in Export aufnehmen."
		                    checked={exportTags}
		                    value={exportTags}
		                    onChange={e=>{setExportTags(!exportTags)}}
		                />
					</Col>
					<Col>
						<Button>.mlw-Datei herunterladen</Button>
					</Col>
				</Row>
				<Row>
					<Col></Col>
					<Col xs={11}><textarea className="exportTextBox" value={exportTxt} onChange={()=>{}}></textarea></Col>
					<Col></Col>
				</Row>
			</Tab>
			{loadPreview>0&&<Tab eventKey="preview" title={<span>Vorschau{loadPreview===1?<Spinner style={{marginLeft: "10px"}} variant="primary" animation="border" size="sm" />:null}</span>}>
				<Row><Col><div>
					<iframe style={{width: "100%", height: "500px"}} srcdoc={preview}></iframe>
				</div></Col></Row>
			</Tab>}
		</Tabs>
	</Container>;
}

export { ExportBox }