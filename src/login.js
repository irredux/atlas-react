// Version 1.0 20.02.2022
import React, { useState } from "react";
import { Container, Row, Col, Form, FloatingLabel } from "react-bootstrap";

import { arachne } from "./arachne.js";
import { StatusButton, sleep } from "./elements.js";

function LoginScreen(props){
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    return <Container className="d-flex justify-content-center">
        <Form className="loginForm">
            <Row><Col className="d-flex justify-content-center"><h1 variant="primary">Login</h1></Col></Row>
            <Row>
                <Form.Group>
                    <FloatingLabel label="Email">
                        <Form.Control type="email" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
                    </FloatingLabel>
                </Form.Group>
            </Row>
            <Row className="mt-2">
                <Form.Group>
                    <FloatingLabel label="Passwort">
                        <Form.Control type="password" placeholder="Passwort" onChange={e=>setPassword(e.target.value)} />
                    </FloatingLabel>
                </Form.Group>
            </Row>
            <Row className="mt-3">
                <Col><small>Noch kein Konto? Klicken Sie <a className="text-primary" onClick={()=>{props.setMode("create")}}>hier</a>.</small></Col>

                <Col className="col-sm-5 d-flex justify-content-end">
                    <StatusButton variant="primary" type="submit" value="anmelden" onClick={async ()=>{
                        const re = await props.login(email, password);
                        return re;
                        }} />
                    </Col>
                
            </Row>
        </Form>
    </Container>;
}

function AccountCreate(props){
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return <Container className="d-flex justify-content-center">
        <Form className="loginForm">
            <Row><Col className="d-flex justify-content-center"><h1 variant="primary">Konto erstellen</h1></Col></Row>
            <Row className="mb-2">
                <Form.Group>
                    <FloatingLabel label="Vorname">
                        <Form.Control name="firstName" type="text" placeholder="Vorname" onChange={e=>setFirstName(e.target.value)} />
                    </FloatingLabel>
                </Form.Group>
            </Row>
            <Row className="mb-2">
                <Form.Group>
                    <FloatingLabel label="Nachname">
                        <Form.Control name="lastName" type="text" placeholder="Nachname" onChange={e=>setLastName(e.target.value)} />
                    </FloatingLabel>
                </Form.Group>
            </Row>
            <Row className="mb-2">
                <Form.Group>
                    <FloatingLabel label="E-Mail">
                        <Form.Control name="email" type="email" placeholder="E-Mail" onChange={e=>setEmail(e.target.value)} />
                    </FloatingLabel>
                </Form.Group>
            </Row>
            <Row className="mb-4">
                <Form.Group>
                    <FloatingLabel label="Passwort">
                        <Form.Control name="password" type="password" placeholder="Passwort" onChange={e=>setPassword(e.target.value)} />
                    </FloatingLabel>
                </Form.Group>
            </Row>
            <Row>
                <Col sm={6}></Col>
                <Col sm={2}style={{marginTop: "8px"}} ><a className="text-secondary" onClick={()=>{props.setMode("login")}}>zurück</a></Col>
                <Col><StatusButton value="registrieren" onClick={async ()=>{
    if(firstName&&lastName&&email&&password){
        const status = await arachne.createAccount({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
        });
        switch(status){
            case 201:
                sleep(2000).then(()=>{props.setMode("login")});
                return {status: 1, success: "Der Account wurde erfolgreich erstellt."};
                break;
            case 409:
                return {status: -1, error: "Die Email-Adresse wird bereits verwendet."};
                break;
            case 406:
                return {status: -1, error: "Bitte füllen Sie alle Felder aus."}
                break;
            default:
                return {status: -1, error: "Die Registrierung is fehlgeschlagen. Versuchen Sie es erneut."};
        }
    } else {return {status: -1, error: "Bitte füllen Sie alle Felder aus!"};}
    
    
}}/></Col></Row>
        </Form>
    </Container>;
}
/*
<div style={{gridArea: "8/3/8/4"}}> </div>
*/
export { LoginScreen, AccountCreate };