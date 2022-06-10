import { Card, Row, Col, Container, Spinner, Accordion, ListGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useEffect } from "react";
import 'chart.js/auto';


import { arachne } from "./../arachne.js";
import { parseHTML, sleep } from "./../elements.js";

let fetchIndexBoxData;
let IndexBoxDetail;

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
            ({ fetchIndexBoxData, IndexBoxDetail } = await import(`./../content/${props.PROJECT_NAME}.js`));
            setWordLst(await fetchIndexBoxData());
            setQuery("");
        };
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
            <div className="indexBoxDetail">{detailId?<IndexBoxDetail lemma_id={detailId} />:null}</div>
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