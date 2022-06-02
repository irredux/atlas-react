import { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { arachne } from "./../arachne";

function OutlineBox(props){
    const [dragObjectId, setDragObjectId] = useState(null);
    const devider = {
        borderTop: "4px dotted transparent",
        margin: "0 20px",
        height: "10px"
    }
    const displayArticles = (a, depth) => {
        return <div key={a.id} style={{marginLeft: `${25*depth}px`}}>
            <div
                style={devider}
                onDrop={e=>{props.dropArticle(dragObjectId, a.parent_id, a.sort_nr);e.target.style.borderColor="transparent"}}
                onDragOver={e=>{e.preventDefault();e.target.style.borderColor="var(--bs-primary)"}}
                onDragLeave={e=>{e.target.style.borderColor="transparent"}}
            ></div>
            <ArticleBox articles={props.articles} a={a} dragObjectId={dragObjectId} setDragObjectId={id=>{setDragObjectId(id)}} dropArticle={(a,b,c)=>{props.dropArticle(a,b,c)}} collapsed={props.collapsedArticlesLst.includes(a.id)} toogleCollapse={a=>{props.toogleCollapse(a)}} />
        </div>;
    };
    return <>
        <Container fluid>
            <Row>
                <Col></Col>
                <Col xs="8" style={{textAlign: "right", cursor: "pointer"}}>Artikelkopf</Col>
                <Col></Col>
            </Row>
            <Row>
                <Col></Col>
                <Col xs="8" style={{paddingBottom: "15px", marginBottom: "15px", borderBottom: "1px solid black"}}></Col>
                <Col></Col>
            </Row>
            <Row>
                <Col></Col>
                <Col xs="8" style={{textAlign: "right", cursor: "pointer"}}>Bedeutungen</Col>
                <Col></Col>
            </Row>
            <Row>
                <Col></Col>
                <Col xs="8">
                    {props.articlesLst.map(a=>displayArticles(props.articles.find(b=>b.id===parseInt(a.split("-")[1])), a.split("-")[0]))}
                </Col>
                <Col></Col>
            </Row>
        </Container>
    </>;
}
function ArticleBox(props){
    const [displaySections, setDisplaySections] = useState(false);

    const dblClickCallback = e => {
        const target = e.target.closest(".articleBox");
        const el = target.getElementsByClassName("articleBoxName")[0];
        el.contentEditable = true;
        el.focus();
    };
    return <><div
        className="articleBox"
        id={`articleBox_${props.a.id}`}
        draggable
        onDragStart={()=>{props.setDragObjectId(props.a.id)}}
        onDrop={e=>{if(props.dragObjectId!==props.a.id){props.dropArticle(props.dragObjectId, props.a.id, 1)}; e.target.style.borderColor="transparent"}}
        onDragOver={e=>{e.preventDefault();if(props.dragObjectId!==props.a.id){e.target.style.borderColor="var(--bs-primary)"}}}
        onDragLeave={e=>{e.target.style.borderColor="transparent"}}
        tabIndex="0"
        onClick={e=>{e.target.focus()}}
        onDoubleClick={e=>{dblClickCallback(e)}}
        onKeyDown={e=>{
            if(e.target.className==="articleBox"){
                if(e.keyCode!==9){e.preventDefault()}
                if(e.keyCode===13){
                    dblClickCallback(e);
                }else if(e.keyCode===37&&e.shiftKey){ // left+shift
                    if(props.a.parent_id>0){
                        const parentArticle = props.articles.find(a=>a.id===props.a.parent_id);
                        props.dropArticle(props.a.id, parentArticle.parent_id, parentArticle.sort_nr+1);
                    }
                    
                }else if(e.keyCode===37){ // left
                    props.toogleCollapse(props.a.id);
                }else if(e.keyCode===38&&e.shiftKey){ // up+shift
                    let previousArticles = props.articles.filter(a=>a.parent_id===props.a.parent_id&&a.sort_nr<props.a.sort_nr).sort((a,b)=>a.sort_nr>b.sort_nr);
                    if(previousArticles.length>0){
                        props.dropArticle(props.a.id, props.a.parent_id, previousArticles[previousArticles.length-1].sort_nr);
                    }
                }else if(e.keyCode===38){ // up
                    const articleBoxes = document.getElementsByClassName("articleBox");
                    for(let i = 0; i<articleBoxes.length;i++){
                        if(articleBoxes[i].id === e.target.id){
                            if(i===0){articleBoxes[articleBoxes.length-1].focus()}
                            else{articleBoxes[i-1].focus()}
                            break;
                        }
                    }
                }else if(e.keyCode===39&&e.shiftKey){ // right+shift
                    let previousArticles = props.articles.filter(a=>a.parent_id===props.a.parent_id&&a.sort_nr<props.a.sort_nr).sort((a,b)=>a.sort_nr>b.sort_nr);
                    if(previousArticles.length>0){
                        const previousArticleChildren = props.articles.filter(a=>a.parent_id===previousArticles[previousArticles.length-1].id).sort((a,b)=>a.sort_nr>b.sort_nr);
                        if(previousArticleChildren.length>0){props.dropArticle(props.a.id, previousArticles[previousArticles.length-1].id, previousArticleChildren[previousArticleChildren.length-1].sort_nr+1)}
                        else{props.dropArticle(props.a.id, previousArticles[previousArticles.length-1].id, 1)}
                    }
                }else if(e.keyCode===39){ // right
                    if(displaySections){setDisplaySections(false)}
                    else{setDisplaySections(true)}
                }else if(e.keyCode===40&&e.shiftKey){ // down+shift
                    const nextArticle = props.articles.find(a=>a.parent_id===props.a.parent_id&&a.sort_nr>props.a.sort_nr);
                    if(nextArticle){props.dropArticle(props.a.id, props.a.parent_id, props.a.sort_nr+1)};
                }else if(e.keyCode===40){ // down
                    const articleBoxes = document.getElementsByClassName("articleBox");
                    for(let i = 0; i<articleBoxes.length;i++){
                        if(articleBoxes[i].id === e.target.id){
                            if(i===articleBoxes.length-1){articleBoxes[0].focus()}
                            else{articleBoxes[i+1].focus()}
                            break;
                        }
                    }
                }
            }
        }}
    >{props.a.sort_nr}. <span
        className="articleBoxName"
        onBlur={async e=>{
            e.target.contentEditable=false;
            e.target.parentElement.focus();
            await arachne.article.save({id: props.a.id, name: e.target.innerText})
        }}
        onKeyDown={e=>{
            if(e.keyCode===13){
                e.preventDefault();
                e.target.blur();
            }
        }}
    >{props.a.name}</span> {/*<i>({props.a.id})</i>*/}{props.collapsed?<span className="text-primary" style={{marginLeft: "15px"}}>...</span>:null}</div>
    {displaySections?<div className="ArticleBoxSections">
        ABBO FLOR. calc. 1,2 "bla bla...."
    </div>:null}
    </>;
}
export { OutlineBox }