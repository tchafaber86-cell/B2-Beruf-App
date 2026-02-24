export default function Datenschutz() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "20px" }}>
      <h1>Datenschutzerklärung</h1>

      <h2>1. Verantwortlicher</h2>
      <p>
        Verantwortlich für diese App „BerufsDeutsch – Selbstlern-App“ ist:
        <br />
        Ebon Tchamou
        <br />
        Würzburger Str. 77 Bielefeld
        <br />
        E-Mail: tchafaber@yahoo.fr
      </p>

      <h2>2. Verarbeitete Daten</h2>
      <p>Im Rahmen der Nutzung der App werden folgende Daten verarbeitet:</p>
      <ul>
        <li>E-Mail-Adresse (bei Registrierung/Login)</li>
        <li>Von Nutzerinnen und Nutzern eingegebene Texte</li>
        <li>Bewertungs- und Analyseergebnisse</li>
        <li>Technische Nutzungsdaten (z. B. Zeitstempel)</li>
      </ul>

      <h2>3. Zweck der Datenverarbeitung</h2>
      <p>
        Die Verarbeitung erfolgt zur Durchführung von Schreibtrainings,
        zur KI-gestützten Textanalyse, zur Speicherung von Lernergebnissen
        sowie zur Verbesserung der App-Funktionalität.
      </p>

      <h2>4. Hosting und Datenverarbeitung</h2>
      <p>
        Die App nutzt Supabase als Cloud-Datenbankanbieter.
        Die Daten werden auf sicheren Servern gespeichert.
      </p>
      <p>
        Datenschutzerklärung von Supabase:
        https://supabase.com/privacy
      </p>

      <h2>5. Weitergabe von Daten</h2>
      <p>
        Es erfolgt keine Weitergabe personenbezogener Daten an Dritte zu
        Werbezwecken.
      </p>

      <h2>6. Speicherdauer</h2>
      <p>
        Die Daten werden gespeichert, solange ein Nutzerkonto besteht
        oder bis eine Löschung beantragt wird.
      </p>

      <h2>7. Rechte der Nutzer</h2>
      <p>
        Nutzer haben gemäß DSGVO das Recht auf Auskunft, Berichtigung,
        Löschung, Einschränkung der Verarbeitung sowie Datenübertragbarkeit.
        Anfragen können per E-Mail gestellt werden.
      </p>

      <h2>8. Sicherheit</h2>
      <p>
        Die Datenübertragung erfolgt verschlüsselt über HTTPS.
      </p>

      <p style={{ marginTop: 40 }}>
        Stand: Februar 2026
      </p>
    </main>
  );
}