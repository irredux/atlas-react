import { Card, Row, Col, Container, Spinner, Accordion, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import 'chart.js/auto';
import { Bar } from "react-chartjs-2";

import { arachne } from "./../arachne.js";
import { parseHTML, sleep } from "./../elements.js";

function Zettel(props){
    const [verso, setVerso] = useState("");
    const [editions, setEditons] = useState([]);

    useEffect(()=>{
        const fetchData=async()=>{
            if(props.z.work_id>0){
                const newEditions = await arachne.edition.get({work_id: props.z.work_id}, {select: ["id", "label", "url"]});
                let editionsLst = [];
                for(const e of newEditions){
                    editionsLst.push(<ListGroup.Item key={e.id}><a href={e.url===""?`/site/argos/${e.id}`:e.url} target="_blank" rel="noreferrer">{e.label}</a></ListGroup.Item>);
                }
                setEditons(editionsLst)
            }
        };
        fetchData();
    }, []);
    return <Card style={{width: "30rem"}} className="mb-3">
        <FontAwesomeIcon style={{position: "absolute", top: "12px", right: "10px"}} onClick={()=>{if(verso===""){setVerso("v")}else{setVerso("")}}} icon={faSync} />
        <Card.Header style={{height: "41px"}} dangerouslySetInnerHTML={parseHTML(props.z.opus)}></Card.Header>
        <Card.Img variant="bottom" src={`${arachne.url}${props.z.img_path}${verso}.jpg`} />
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
    const [timeLineData, setTimeLineData] = useState([]);
    useEffect(()=>{
        const fetchData=async()=>{
            setLemma(null);
            setVZettels(null);
            setEZettels(null);
            setIZettels(null);
            setRZettels(null);
            const newLemma = await arachne.lemma.get({id: props.lemma_id});
            setLemma(newLemma[0]);
            const nVZettel = await arachne.zettel.get({lemma_id: props.lemma_id, type: 1}, {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id", "date_sort", "date_own"]});
            setVZettels(nVZettel);
            const nEZettel = await arachne.zettel.get({lemma_id: props.lemma_id, type: 2}, {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id", "date_sort", "date_own"]});
            setEZettels(nEZettel);
            const nIZettel = await arachne.zettel.search([{c: "lemma_id", o: "=", v: props.lemma_id}, {c: "type", o: ">=", v: "3"}, {c: "type", o: "<=", v: "6"}, {c: "type", o: "!=", v: "4"}], {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id", "date_sort", "date_own"]})
            setIZettels(nIZettel);
            setTimeLineData(nVZettel.concat(nEZettel.concat(nIZettel)))
            setRZettels(await arachne.zettel.search([{c: "lemma_id", o: "=", v: props.lemma_id}, {c: "type", o: ">=", v: "4"}, {c: "type", o: "!=", v: "6"}], {order: ["date_sort","date_type"], select: ["id", "opus", "img_path", "work_id"]}));
        };
        fetchData();
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
                    <Accordion.Item eventKey="s">
                        <Accordion.Header>Statistik</Accordion.Header>
                        <Accordion.Body>
                            <div style={{width: "70%", margin: "auto"}}>
                                <Bar options={{aspectRatio: false, plugins: {legend:{display: true, position: "bottom"}}}} data={{
                                    labels: ["6. Jh.","7. Jh.","8. Jh.","9. Jh.","10. Jh.","11. Jh.","12. Jh.","13. Jh.",],
                                    datasets: [
                                        {
                                            label: 'Anzahl Zettel',
                                            data: [
                                                timeLineData.filter(t=>t.date_sort<600).length,
                                                timeLineData.filter(t=>t.date_sort>599&&t.date_sort<700).length,
                                                timeLineData.filter(t=>t.date_sort>699&&t.date_sort<800).length,
                                                timeLineData.filter(t=>t.date_sort>799&&t.date_sort<900).length,
                                                timeLineData.filter(t=>t.date_sort>899&&t.date_sort<1000).length,
                                                timeLineData.filter(t=>t.date_sort>999&&t.date_sort<1100).length,
                                                timeLineData.filter(t=>t.date_sort>1099&&t.date_sort<1200).length,
                                                timeLineData.filter(t=>t.date_sort>1199).length,
                                            ],
                                            backgroundColor: ['#347F9F'],
                                            borderColor: ['#347F9F'],
                                            borderWidth: 1,
                                        },
                                    ],
                                }} />
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="v">
                        <Accordion.Header>verzetteltes Material&nbsp;{vZettels?<span>({vZettels.length})</span>:<Spinner size="sm" animation="border" />}</Accordion.Header>
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
    const WORD_COUNT = 100;
    const SCROLL_BOUND = 500;
    const [query, setQuery]=useState(null);
    const [words, setWords] = useState([]);
    const [detailId, setDetailId] = useState(null);
    const [resultLst, setResultLst]=useState([]);
    const [resultCurrentId, setResultCurrentId] = useState(0);

    const [wordLst, setWordLst] = useState([]); // contains all words
    useEffect(()=>{
        const fetchData=async()=>{
            let wl = await arachne.lemma.getAll({select: ["id", "lemma", "lemma_display"], order: ["lemma"]})
            wl=wl.map(w=>{return {id: w.id, lemma_display: w.lemma_display, lemma: w.lemma.toLowerCase()}})
            setWordLst(wl)
            setQuery("");
        }
        fetchData();
    },[])

    useEffect(()=>{
        if(query!==null&&query!==""){
            const lowQuery = query.toLowerCase();
            const queryLength = query.length;
            const results=wordLst.filter(w=>w.lemma.substring(0,queryLength)===lowQuery);
            setResultLst(results);
            if(results.length>0){setResultCurrentId(results[0].id)};
        }else if(query===""){
            setResultLst([]);
            setResultCurrentId(0);
        }
    }, [query]);

    useEffect(()=>{
        if(resultLst.length>0){
            const cIndex = wordLst.findIndex(w=>w.id===resultCurrentId);

            const wordsBefore = wordLst.slice(cIndex-WORD_COUNT>=0?cIndex-WORD_COUNT:0,cIndex);
            const wordsAfter = wordLst.slice(cIndex, cIndex+WORD_COUNT);
            setWords(wordsBefore.concat(wordsAfter));
            //setDetailId(resultCurrentId);
            const scrollToHit = async()=>{
                await sleep(200);
                const hit = document.querySelector(".indexBox_result_hit");
                if(hit){hit.scrollIntoView({block: "center", behavior: "auto"})}
            }
            scrollToHit();
        }else{
            setWords(wordLst.slice(0,WORD_COUNT));
        }
    }, [resultLst,resultCurrentId]);

    const loadMoreWords=(e)=>{
        if(e.target.scrollHeight-e.target.scrollTop-e.target.offsetHeight<SCROLL_BOUND){//bottom
            const after = getWordsAfter();
            setWords(words.concat(after))
        }else if(e.target.scrollTop<SCROLL_BOUND){
            const before = getWordsBefore()            
            setWords(before.concat(words));
        }
    }
    const getWordsBefore = ()=>{
        const firstId = wordLst.findIndex(w=>w.id===words[0].id);
        return wordLst.slice(firstId-WORD_COUNT>=0?firstId-WORD_COUNT:0, firstId);
    };
    const getWordsAfter=()=>{
        const lastId = wordLst.findIndex(w=>w.id===words[words.length-1].id);
        return wordLst.slice(lastId+1, lastId+1+WORD_COUNT);
    };
    if(wordLst.length>0){
        return <Container className="mainBody">
            <div className="indexBoxLst">
                <input type="text" style={{width: "100%", margin: "10px 0px 10px 0"}} value={query} onChange={e=>{setQuery(e.target.value)}} onKeyDown={e=>{
                    if(e.keyCode===13&e.shiftKey){ //backwards
                        const lastIndex = resultLst.findIndex(r=>r.id===resultCurrentId);
                        if(lastIndex===0){setResultCurrentId(resultLst[resultLst.length-1].id)}
                        else{setResultCurrentId(resultLst[lastIndex-1].id)}
                    }else if(e.keyCode===9){
                        e.preventDefault();
                        setDetailId(resultCurrentId);
                    }else if(e.keyCode===13){
                        const lastIndex = resultLst.findIndex(r=>r.id===resultCurrentId);
                        if(lastIndex+1<resultLst.length){setResultCurrentId(resultLst[lastIndex+1].id)}
                        else{setResultCurrentId(resultLst[0].id)}
                    }else if(e.keyCode===27){
                        setQuery("");
                    }
                }} />
                <div>{resultLst.length>0?<small style={{float: "right"}}><span style={{marginRight: "15px"}}>{resultLst.findIndex(r=>r.id===resultCurrentId)+1}<span style={{margin: "0 3px 0 3px"}}>/</span>{resultLst.length} </span><FontAwesomeIcon style={{marginRight: "5px"}} icon={faAngleLeft} onClick={()=>{
                        const lastIndex = resultLst.findIndex(r=>r.id===resultCurrentId);
                        if(lastIndex===0){setResultCurrentId(resultLst[resultLst.length-1].id)}
                        else{setResultCurrentId(resultLst[lastIndex-1].id)}
                }} /><FontAwesomeIcon style={{marginRight: "3px"}} icon={faAngleRight} onClick={()=>{
                        const lastIndex = resultLst.findIndex(r=>r.id===resultCurrentId);
                        if(lastIndex+1<resultLst.length){setResultCurrentId(resultLst[lastIndex+1].id)}
                        else{setResultCurrentId(resultLst[0].id)}
                }}/></small>:null}</div>
                <ListGroup variant="flush" className="indexBoxLstResultBox" onScroll={e=>{loadMoreWords(e)}}>
                    {words.map(w=><ListGroup.Item className={resultCurrentId===w.id?"indexBox_result_hit":resultLst.map(r=>r.id).includes(w.id)?"indexBox_result":null} action onClick={()=>{setDetailId(w.id)}} key={w.id} dangerouslySetInnerHTML={parseHTML(w.lemma_display)}></ListGroup.Item>)}
                </ListGroup>
            </div>
            <div className="indexBoxDetail">{detailId?<Detail lemma_id={detailId} />:null}</div>
        </Container>;
    }else{
        return <div>Daten werden geladen...</div>;
    }
}//
/*
    
    //const [resultIndex, setResultIndex]=useState(0);
    

useEffect(()=>{
        const fetchData=async()=>{
            if(query!=""){
                const results = await arachne.lemma.get({lemma: `${query}*`}, {select: ["id", "lemma"], order: ["lemma"]});
                //if(!results.map(r=>r.id).includes(resultCurrentId)){setResultIndex(0)}
                // if hit is also in new resultLst, it shouldnt be reset!
                setResultCurrentId(results[0].id);
                setResultCurrentWord(results[0].lemma)
                setResultLst(results);
            }
        }
        fetchData();
    },[query]);
    useEffect(()=>{
        const fetchData=async()=>{
            const AllBefore = await arachne.lemma.search([{c: "lemma", o: "<", v: resultCurrendWord}], {count: true});
            const before = await arachne.lemma.search([{c: "lemma", o: "<", v: resultCurrendWord}], {select: ["id", "lemma_display", "lemma"], order: ["lemma"], limit: WORD_COUNT, offset: AllBefore[0].count-WORD_COUNT>0?AllBefore[0].count-WORD_COUNT:0});
            const after = await arachne.lemma.search([{c: "lemma", o: ">=", v: resultCurrendWord}], {select: ["id", "lemma_display", "lemma"], order: ["lemma"], limit: (WORD_COUNT+1)});
            setWords(before.concat(after));
            await sleep(200);
            const hit = document.querySelector(".indexBox_result_hit");
            hit.scrollIntoView({block: "center", behavior: "auto"});
        };
        fetchData();
    }, [resultCurrentId])
    const loadMoreWords=async(e)=>{
        if(e.target.scrollHeight-e.target.scrollTop-e.target.offsetHeight<SCROLL_BOUND){//bottom
            let after = await getWordsAfter(words[words.length-1].lemma);
            setWords(words.concat(after))
            after = await getWordsAfter(words[words.length-1].lemma);
            setWords(words.concat(after))
        }else if(e.target.scrollTop<SCROLL_BOUND){
            let before = await getWordsBefore(words[0].lemma)            
            setWords(before.concat(words));
            before = await getWordsBefore(words[0].lemma)            
            setWords(before.concat(words));
        }
    }
    const getWordsBefore = async(word)=>{
            const AllBefore = await arachne.lemma.search([{c: "lemma", o: "<", v: word}], {count: true});
            return await arachne.lemma.search([{c: "lemma", o: "<", v: word}], {select: ["id", "lemma_display", "lemma"], order: ["lemma"], limit: WORD_COUNT, offset: AllBefore[0].count-WORD_COUNT>0?AllBefore[0].count-WORD_COUNT:0});
    };
    const getWordsAfter=async(word)=>{
        return await arachne.lemma.search([{c: "lemma", o: ">", v: word}], {select: ["id", "lemma_display", "lemma"], order: ["lemma"], limit: WORD_COUNT});
    };
*/
export { IndexBox };