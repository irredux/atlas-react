import { Row, Col, Form, Container } from "react-bootstrap";
import React, { useState } from "react";

import { arachne } from "./arachne.js";
import { StatusButton } from "./elements.js";

function Account(){
    const [firstName, setFirstName] = useState(arachne.me.first_name);
    const [lastName, setLastName] = useState(arachne.me.last_name);
    const [email, setEmail] = useState(arachne.me.email);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [zWidth, setZWidth] = useState(arachne.options.z_width);
    const [actionKey, setActionKey] = useState(arachne.options.action_key);
    const [openExternally, setOpenExternally]=useState(arachne.options.openExternally);
    const displaySettings = [
        <Row key={1} className="mb-2">
            <Col xs={2}>Breite der Zettel:</Col>
            <Col><Form.Range min="400" max="600" size="sm" value={zWidth} onChange={e=>{
                arachne.setOptions("z_width", e.target.value);
                arachne.setOptions("z_height", 350/500*parseInt(e.target.value));
                setZWidth(e.target.value);
            }}/></Col>
        </Row>,
        <Row key={2} className="mb-2">
            <Col xs={4}>Öffnen der Ressourcen (Zettel im Editor):</Col>
            <Col><Form.Select size="sm" value={openExternally} onChange={e=>{arachne.setOptions("openExternally", parseInt(e.target.value));setOpenExternally(e.target.value)}}>
                    <option value="0">im gleichen Fenster</option>
                    <option value="1">nebeneinander</option>
                    <option value="2">in Echo</option>
                </Form.Select></Col>
        </Row>
    ];
    return <Container style={{padding: "0 10% 0 10%"}}>
        <Row><Col><h3>Persönliche Daten</h3></Col></Row>
        <Row className="mb-2">
            <Col xs={2}>Vorname:</Col>
            <Col><Form.Control type="text" size="sm" value={firstName} onChange={e=>{setFirstName(e.target.value)}} /></Col>
        </Row>
        <Row className="mb-2">
            <Col xs={2}>Nachname:</Col>
            <Col><Form.Control type="text" size="sm" value={lastName} onChange={e=>{setLastName(e.target.value)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col xs={2}>Email-Adresse:</Col>
            <Col><Form.Control type="text" size="sm" value={email} onChange={e=>{setEmail(e.target.value)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col xs={2}></Col>
            <Col><StatusButton value="speichern" onClick={async ()=>{
                    await arachne.user.save({
                        id: arachne.me.id,
                        first_name: firstName,
                        last_name: lastName,
                        email: email,
                    });
                    const reUser = await arachne.getUser();
                    arachne.me = reUser;
                    return {status: 1};
                }} /></Col>
        </Row>


        <Row><Col><h3>Passwort</h3></Col></Row>
        <Row className="mb-2">
            <Col xs={2}>altes Passwort:</Col>
            <Col><Form.Control type="password" size="sm" value={oldPassword} onChange={e=>{setOldPassword(e.target.value)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col xs={2}>neues Passwort:</Col>
            <Col><Form.Control type="password" size="sm" value={newPassword} onChange={e=>{setNewPassword(e.target.value)}} /></Col>
        </Row>
        <Row className="mb-4">
            <Col xs={2}></Col>
            <Col><StatusButton value="speichern" onClick={async ()=>{
                    await arachne.user.save({
                        id: arachne.me.id,
                        old_password: oldPassword,
                        new_password: newPassword
                    });
                    return {status: 1};
                }} /></Col>
        </Row>


        <Row><Col><h3>Darstellung und Benutzung</h3></Col></Row>
        <Row className="mb-4">
            <Col xs={4}>Funktionstaste für Tastenkürzel</Col>
            <Col>
                <Form.Select size="sm" value={actionKey} onChange={e=>{arachne.setOptions("action_key", e.target.value);setActionKey(e.target.value)}}>
                    <option value="alt">Alt</option>
                    <option value="ctrl">Strg</option>
                    <option value="cmd">Befehlstaste</option>
                </Form.Select>
                <small>Eine Liste mit Tastenkürzeln finden Sie <a className="text-primary" rel="noreferrer" href="https://gitlab.lrz.de/haeberlin/dmlw/-/wikis/06-Argos#tastenkürzel" target="_blank">hier</a>.</small>
            </Col>
        </Row>
        {displaySettings}
    </Container>;
}

export { Account };