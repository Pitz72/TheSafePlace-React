# Documento di Protezione Anti-Regressione v0.2.8
## Codename: The Standard Page

**Obiettivo:** Questo documento formalizza lo standard di layout e funzionalità per tutte le pagine informative testuali e paginabili del gioco. L'introduzione del componente riutilizzabile `PaginatedInfoPage.tsx` è un progresso architetturale chiave che deve essere preservato.

---

### **Regola 1: Utilizzo Obbligatorio del Template Standard**

-   **Descrizione:** Qualsiasi schermata a schermo intero il cui scopo primario è visualizzare una quantità significativa di testo paginabile (es. Storia, Istruzioni, Crediti, Game Over) DEVE utilizzare il componente `PaginatedInfoPage.tsx`. Non devono essere create implementazioni di layout o paginazione duplicate.
-   **Test di Verifica:**
    1. Ispezionare il codice sorgente di qualsiasi nuova pagina informativa.
    2. Verificare che il componente principale esportato sia un wrapper attorno a `<PaginatedInfoPage ... />`.
    3. La logica di layout (flexbox, larghezze, ecc.) e di paginazione (`useEffect`, `useState` per `currentPage`) NON deve essere presente nel file della schermata specifica (es. `CreditsScreen.tsx`), ma deve essere ereditata dal template.

### **Regola 2: Coerenza del Layout e Stile**

-   **Descrizione:** Tutte le pagine che utilizzano il template `PaginatedInfoPage` DEVONO presentare un layout e uno stile coerenti.
-   **Test di Verifica:**
    1. Navigare tra la schermata "Storia" e "Istruzioni".
    2. **Comportamento Atteso:** Entrambe le schermate devono mostrare un box di testo con le seguenti caratteristiche identiche:
        - Larghezza dell'85% rispetto al suo contenitore.
        - Assenza di un bordo esplicito.
        - Centratura orizzontale.
        - Posizionamento verticale identico.
        - Dimensione del font del corpo del testo identica (`text-4xl`).

### **Regola 3: Funzionalità della Paginazione**

-   **Descrizione:** La paginazione deve funzionare in modo affidabile e identico su tutte le pagine che la implementano.
-   **Test di Verifica:**
    1. Accedere a una pagina informativa con più pagine di testo (es. "Storia").
    2. **Comportamento Atteso:**
        - L'indicatore "Pagina X di Y" deve mostrare il numero corretto di pagine totali, calcolato dinamicamente in base al contenuto e all'altezza del contenitore.
        - I tasti Freccia Destra/`D` devono avanzare alla pagina successiva, se disponibile.
        - I tasti Freccia Sinistra/`A` devono tornare alla pagina precedente, se disponibile.
        - Il contenuto testuale deve scorrere verticalmente in modo fluido per mostrare la pagina corrente.

---

Queste regole assicurano che il sistema di pagine informative rimanga standardizzato, manutenibile e visivamente coerente. Ogni deviazione da questo standard deve essere considerata una regressione.
