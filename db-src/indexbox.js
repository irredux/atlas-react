import { Card, Form, Row, Col, Button, Navbar, Offcanvas, Container, Placeholder, Spinner, Accordion, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";

import { arachne } from "./arachne.js";
import { Navigator, parseHTML, SearchBox, SelectMenu, Selector, AutoComplete, ToolKit, SearchHint, StatusButton } from "./elements.js";

function Zettel(props){
    const [verso, setVerso] = useState("");
    const [editions, setEditons] = useState([]);

    useEffect(async ()=>{
        if(props.z.work_id>0){
            const newEditions = await arachne.edition.get({work_id: props.z.work_id}, {select: ["id", "label", "url"]});
            let editionsLst = [];
            for(const e of newEditions){
                editionsLst.push(<ListGroup.Item key={e.id}><a href={e.url===""?`/site/viewer/${e.id}`:e.url} target="_blank">{e.label}</a></ListGroup.Item>);
            }
            setEditons(editionsLst)
        }
    }, []);
    return <Card style={{width: "30rem"}} className="mb-3">
        <FontAwesomeIcon style={{position: "absolute", top: "12px", right: "10px"}} onClick={()=>{if(verso===""){setVerso("v")}else{setVerso("")}}} icon={faSync} />
        <Card.Header style={{height: "41px"}} dangerouslySetInnerHTML={parseHTML(props.z.opus)}></Card.Header>
        <Card.Img variant="bottom" src={`${props.z.img_path}${verso}.jpg`} />
        {/*<Card.Img variant="bottom" src={`http://localhost:8080${props.z.img_path}${verso}.jpg`} />*/}
        <Card.Body>
            <Card.Text><ListGroup horizontal>{editions}</ListGroup></Card.Text>
        </Card.Body>
    </Card>;
}
function Detail(props){
    const [lemma, setLemma] = useState(null);
    const [vZettels, setVZettels] = useState(null);
    const [eZettels, setEZettels] = useState(null);
    const [iZettels, setIZettels] = useState(null);
    const [rZettels, setRZettels] = useState(null);

    useEffect(async ()=>{
        setLemma(null);
        setVZettels(null);
        setEZettels(null);
        setIZettels(null);
        setRZettels(null);
        const newLemma = await arachne.lemma.get({id: props.lemma_id});
        setLemma(newLemma[0]);
        setVZettels(await arachne.zettel.get({lemma_id: props.lemma_id, type: 1}, {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id"]}));
        setEZettels(await arachne.zettel.get({lemma_id: props.lemma_id, type: 2}, {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id"]}));
        setIZettels(await arachne.zettel.search([{c: "lemma_id", o: "=", v: props.lemma_id}, {c: "type", o: ">=", v: "3"}, {c: "type", o: "<=", v: "6"}, {c: "type", o: "!=", v: "4"}], {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id"]}));
        setRZettels(await arachne.zettel.search([{c: "lemma_id", o: "=", v: props.lemma_id}, {c: "type", o: ">=", v: "4"}, {c: "type", o: "!=", v: "6"}], {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id"]}));
    }, [props.lemma_id])
    return (lemma?<>
        <h1 dangerouslySetInnerHTML={parseHTML(lemma.lemma_display)}></h1>
        <Container>
            {lemma.dicts&&<Row>
                <Col xs={2}>Wörterbücher:</Col>
                <Col dangerouslySetInnerHTML={parseHTML(lemma.dicts)}></Col>
            </Row>}
            {lemma.comment&&<Row className="mb-4">
                <Col xs={2}>Kommentar:</Col>
                <Col dangerouslySetInnerHTML={parseHTML(lemma.comment)}></Col>
            </Row>}
            <Row>
                <Col>
                    <Accordion defaultActiveKey="">
                    <Accordion.Item eventKey="v">
                        <Accordion.Header>verzetteles Material&nbsp;{vZettels?<span>({vZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{vZettels?vZettels.map(z=>{return <Zettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="e">
                        <Accordion.Header>Exzerpt-Zettel&nbsp;{eZettels?<span>({eZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{eZettels?eZettels.map(z=>{return <Zettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="i">
                        <Accordion.Header>Index-Zettel&nbsp;{iZettels?<span>({iZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{iZettels?iZettels.map(z=>{return <Zettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="r">
                        <Accordion.Header>restliche Zettel&nbsp;{rZettels?<span>({rZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
                        <Accordion.Body>
                            <Container className="d-flex flex-wrap justify-content-center">{rZettels?rZettels.map(z=>{return <Zettel key={z.id} z={z} />;}):null}</Container></Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                </Col>
            </Row>
        </Container>
    </>:null);
}
function IndexBox(props){
    const [words, setWords] = useState(<Placeholder animation="glow">
        <ListGroup.Item><Placeholder sm={8} /></ListGroup.Item>
        <ListGroup.Item><Placeholder sm={8} /></ListGroup.Item>
        <ListGroup.Item><Placeholder sm={8} /></ListGroup.Item>
        <ListGroup.Item><Placeholder sm={8} /></ListGroup.Item>
        <ListGroup.Item><Placeholder sm={8} /></ListGroup.Item>
        <ListGroup.Item><Placeholder sm={8} /></ListGroup.Item>
    </Placeholder>);
    const [detailId, setDetailId] = useState(null);

    useEffect(async ()=>{
        const words_raw = await arachne.lemma.getAll({select: ["id", "lemma_display"], order: ["lemma"]});
        let newWords = [];
        for(const w of words_raw){
            newWords.push(<ListGroup.Item action onClick={async ()=>{
                setDetailId(w.id);
            }} key={w.id} dangerouslySetInnerHTML={parseHTML(w.lemma_display)}></ListGroup.Item>);
        }
        setWords(newWords);
    }, []);
    return <Container className="mainBody">
        <Row>
            <Col xs={3} style={{height: "calc(100vh - 180px)", overflow: "scroll"}}>
                <ListGroup variant="flush">
                    {words}
                </ListGroup>
            </Col>
            <Col style={{height: "calc(100vh - 180px)", overflow: "scroll"}}>
                {detailId?<Detail lemma_id={detailId} />:null}
            </Col>
        </Row>
    </Container>
}

export { IndexBox };