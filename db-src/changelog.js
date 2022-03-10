import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { Alert, Container } from "react-bootstrap";

function  ChangeLog(){
    return <Container>
        {/*<Alert variant="info">
            <Alert.Heading>Beta X.Y</Alert.Heading>
            <i>X. Y 2022</i>
            <p>TEXT</p>
        </Alert>*/}
        <Alert variant="info">
            <Alert.Heading>Beta 12.7</Alert.Heading>
            <i>26. Februar 2022</i>
            <p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
            <ul>
                <li>Änderungen beim Zettel-Upload: Buchstaben U/V und I/J wurden zusammengefasst.</li>
                <li>Korrekturen bei der Zitiertitel-Suche der opera-Listen.</li>
                <li>Korrekturen beim Upload von Scan-Bildern.</li>
            </ul>
        </Alert>
        <Alert variant="secondary">
            <Alert.Heading>Beta 12.6</Alert.Heading>
            <i>23. Februar 2022</i>
            <p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
            <ul>
                <li>Suche in opera-Listen funktioniert wieder.</li>
                <li>Korrektur bei der voreingestellten Suche.</li>
                <li>Links auf Wiki angepasst.</li>
            </ul>
        </Alert>
        <Alert variant="secondary">
            <Alert.Heading>Beta 12.5</Alert.Heading>
            <i>18. Februar 2022</i>
            <p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
            <ul>
                <li>ocr-Funktionen des Servers in Modul "archimedes.py" verschoben.</li>
                <li>Darstellung der Detailansicht für Ressourcen und Sekundärliteratur überarbeitet.</li>
                <li>Neuladen der Ansicht beim Löschen von Elementen.</li>
                <li>Opera-Listen werden automatisch neu geladen, wenn die Listen auf dem Server aktualisiert wurden oder wenn Autoren oder Werke erstellt oder gelöscht wurden.</li>
                <li>Altes Benachrichtigungssystem (StatusBox) entfernt.</li>
            </ul>
        </Alert>
        <Alert variant="secondary">
            <Alert.Heading>Beta 12.4</Alert.Heading>
            <i>15. Februar 2022</i>
            <p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
            <ul>
                <li>Grösse der abgebildeten Wörter begrenzt auf digitalen und gescannten Zetteln.</li>
                <li>Wiki-Anleitung für das Hochladen der Zettel verlinkt.</li>
                <li>Zettel-Reihenfolge beim Hochladen stimmt jetzt auch mit Chrome.</li>
                <li>Veraltete Daten und Links von früherer Version entfernt.</li>
            </ul>
        </Alert>
        <Alert variant="secondary">
            <Alert.Heading>Beta 12.3</Alert.Heading>
            <i>14. Februar 2022</i>
            <p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
            <ul>
                <li>ocr-Verfahren für neue Zettel überarbeitet (s. Einstellungen &gt; Server) und automatische Typ-Erkennung aktiviert.</li>
                <li>Konto-Verwaltung überarbeitet (löschen von Accounts jetzt möglich).</li>
            </ul>
        </Alert>
        <Alert variant="secondary">
            <Alert.Heading>Beta 12.2</Alert.Heading>
            <i>13. Februar 2022</i>
            <p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
            <ul>
                <li><Alert.Link href="https://gitlab.lrz.de/haeberlin/dmlw/-/issues/194">Issue #194</Alert.Link></li>
                <li>"Details ein-/ausblenden" unter "speichern" und "speichern&weiter" verschoben.</li>
                <li>Kleiner Fehler bei Stapelverabeitung behoben (Änderugnen wurde nicht angezeigt).</li>
                <li>Mit "X" kann die Detailansicht in der Zettel-DB geschlossen werden.</li>
                <li>Wenn ein neues Wort in der Zettel-DB erstellt wurde, wird es automatisch mit dem aktuellen Zettel verknüpft.</li>
                <li>Man kann nun aus der Stapel-Ansicht neue Wörter erstellen.</li>
                <li>Die Hilfe zum Erstellen von Wörtern wird nun auch in der Wortliste angezeigt.</li>
                <li>Import-Formulare überarbeitet und verbessert.</li>
            </ul>
        </Alert>
        <Alert variant="secondary">
            <Alert.Heading>Beta 12.1</Alert.Heading>
            <i>11. Februar 2022</i>
            <p>Kleine Verbesserungen in Darstellung und Benutzung:</p>
            <ul>
                <li>Mit einem Klick auf den Wortansatz in der Wortliste wird die Zettel-Datenbank geöffnet und die mit diesem Wort verknüpften Zettel angezeigt.</li>
                <li>Suchfelder in Wortliste hinzugefügt: "Wörterbücher", "Kommentar", "Zahlzeichen", "im Wörterbuch (MLW)", "Stern", "Fragezeichen".</li>
                <li>Verbesserung des Fehlers mit "speichern&weiter".</li>
                <li>"Lemmaliste" in "Wortliste" umbenannt. Ebenso "Lemma" in "Wort" (usw.).</li>
                <li>Kontextmenü <FontAwesomeIcon icon={faEllipsisV} /> der opera-Listen: Alle sollen nun die Listen aktualisieren können.</li>
                <li>opera-Listen können nicht mehr von "Einstellungen"-&gt;"Server" aktualisiert werden.</li>
                <li>Die Statistiken können nur noch über das Kontextmenü <FontAwesomeIcon icon={faEllipsisV} /> unter "Einstellungen"-&gt;"Statistik" aktualisiert werden.</li>
                <li>Alle Links sollten mit CTRL/CMD+Klick in einem neuen Fenster/Tab geöffnet werden können.</li>
                <li>Dark-Mode deaktiviert (wird später wieder eingeführt).</li>
            </ul>
        </Alert>
        <Alert variant="secondary">
        <Alert.Heading>Beta 12.0</Alert.Heading>
        <i>9. Februar 2022</i>
        <p>Neues Design und Steuerelemente mit <Alert.Link target="_blank" href="https://react-bootstrap.github.io">Bootstrap</Alert.Link>. Die Suchfunktion befindet sich links unten auf der Seite (<FontAwesomeIcon icon={faSearch} />).</p>
        </Alert>
    </Container>;
    
}

export { ChangeLog };