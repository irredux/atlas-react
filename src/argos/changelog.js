import { Alert, Container } from "react-bootstrap";

function  ChangeLog(){
    return <Container>
        {/*<Alert variant="info">
            <Alert.Heading>Beta X.Y</Alert.Heading>
            <i>X. Y 2022</i>
            <p>TEXT</p>
        </Alert>*/}
        <Alert variant="info">
            <Alert.Heading>Beta 1.3</Alert.Heading>
            <i>18. Mai 2022</i>
            <p>Volltextsuche angepasst und Shortcut-Taste über Einstellungen veränderbar.</p>
        </Alert>
        <Alert variant="secondary">
            <Alert.Heading>Beta 1.2</Alert.Heading>
            <i>14. April 2022</i>
            <p>Shortcuts hinzugefügt.</p>
        </Alert>
        <Alert variant="secondary">
            <Alert.Heading>Beta 1.1</Alert.Heading>
            <i>31. März 2022</i>
            <p>Korrektur des Seitenverhältnisses (auch über "Ressource bearbeiten" veränderbar).</p>
        </Alert>
        <Alert variant="secondary">
            <Alert.Heading>Beta 1.0</Alert.Heading>
            <i>26. Februar 2022</i>
            <p>Erste Version des neuen Scan-Viewers ist online.</p>
        </Alert>
    </Container>;
}

export { ChangeLog };