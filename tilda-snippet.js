/*
TILDA INTEGRATION SNIPPET
=========================

Incolla questo codice nel tuo blocco HTML/JS su Tilda.
Puoi aggiungerlo in fondo allo script esistente che gestisce la scorecard.

Questa funzione formatta il risultato ignorando le risposte grezze per 
mantenere l'URL compatto, codifica il payload e redirige all'app React su Netlify.
*/

function getAnswerLabel(answer) {
    if (!answer) return "";
    if (typeof answer === "string") return answer;
    if (answer.label) return answer.label;
    if (answer.value) return answer.value;
    if (answer.text) return answer.text;
    return "";
}

function redirectNetlifyReport(data) {
    if (!data || !data.user || !data.user.name || !data.dimensions) {
        console.error("Dati mancanti per la generazione del report.");
        // Facoltativamente mostra un alert all'utente
        return;
    }

    if (typeof data.overall !== 'number' || data.overall < 0 || data.overall > 100) {
        console.error("Overall score mancante o invalido");
        return;
    }
    
    var requiredDims = ['clarity', 'acquisition', 'operations', 'margins', 'asset', 'readiness'];
    for (var i = 0; i < requiredDims.length; i++) {
        var dim = requiredDims[i];
        if (!data.dimensions[dim] || typeof data.dimensions[dim].score !== 'number' || typeof data.dimensions[dim].yes !== 'number') {
            console.error("Dati dimensione mancanti o invalidi:", dim);
            return;
        }
        if (data.dimensions[dim].score < 0 || data.dimensions[dim].score > 10 || data.dimensions[dim].yes < 0 || data.dimensions[dim].yes > 7) {
            console.error("Dati dimensione fuori range:", dim);
            return;
        }
    }
    
    // Mappatura pulita delle 6 dimensioni (score 0-10, yes 0-7)
    var dimensioniReact = {
        clarity: { score: data.dimensions.clarity.score, yes: data.dimensions.clarity.yes },
        acquisition: { score: data.dimensions.acquisition.score, yes: data.dimensions.acquisition.yes },
        operations: { score: data.dimensions.operations.score, yes: data.dimensions.operations.yes },
        margins: { score: data.dimensions.margins.score, yes: data.dimensions.margins.yes },
        asset: { score: data.dimensions.asset.score, yes: data.dimensions.asset.yes },
        readiness: { score: data.dimensions.readiness.score, yes: data.dimensions.readiness.yes }
    };

    // Creazione del payload compatto. 
    // NON inviamo 'answers' grezze o logic di 'profile'/'fascia' calcolate da Tilda.
    // L'app Netlify (React) ricalcolerà Profilo, Fascia, Stage, Forze e Priorità.
    var payload = {
        name: data.user.name,
        company: data.user.company || "",
        email: data.user.email || "",
        metadata: {
            businessType: getAnswerLabel(data.answers && data.answers.Q1),
            revenueRange: getAnswerLabel(data.answers && data.answers.Q2)
        },
        overall: data.overall,
        dimensions: dimensioniReact
    };

    // Encode base64 + encodeURIComponent per uso sicuro in query string
    var encodedPayload = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    var urlSafePayload = encodeURIComponent(encodedPayload);
    
    // URL DI DESTINAZIONE (Modifica con l'URL di produzione Netlify)
    var NETLIFY_URL = "https://scorecard.davidedileo.it/report"; 
    
    // REDIREZIONE
    window.location.href = NETLIFY_URL + "?result=" + urlSafePayload;
}

/* 
Esempio di come chiamarlo dentro submitScorecard in Tilda,
DOPO aver fatto la chiamata email/webhook (se presente):

async function submitScorecard() {
    // ... validazione ...
    // ... calculateScores() ...
    
    // Se usi Web3Forms o altro, aspetta che finisca
    // await sendDataToWebhook(result); 
    
    // REDIRIGI A NETLIFY (Invece di mostrare la UI dei risultati su Tilda)
    redirectNetlifyReport(result);
}
*/
