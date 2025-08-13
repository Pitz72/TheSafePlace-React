/**
 * StoryScreen.tsx — Introduzione alla storia
 * Usa PaginatedInfoPage (scorrimento). Se in futuro migri a UniversalInfoPage,
 * allinea la tipografia a text-[28px] + leading-relaxed + mb-4 e rivedi la paginazione.
 */
import React from 'react';
import PaginatedInfoPage from './PaginatedInfoPage';

const StoryScreen: React.FC = () => {
  const content = [
    <p key="s1" className="text-[175%] leading-relaxed"><strong className="text-phosphor-400 text-5xl font-mono tracking-wider glow-phosphor-bright text-shadow-phosphor-bright animate-glow">L'Eco del Silenzio</strong></p>,
    <p key="s2" className="text-[175%] leading-relaxed">Il mondo che Ultimo conosceva era fatto di sussurri e acciaio freddo, di lezioni impartite da un padre con occhi stanchi ma mani salde. Diciassette anni vissuti all'ombra di una catastrofe che aveva inghiottito il passato, lasciando solo echi distorti: la "Guerra Inespressa", il "Grande Silenzio".</p>,
    <p key="s3" className="text-[175%] leading-relaxed">Della madre, Ultimo conservava solo un calore sbiadito nel petto, un nome quasi dimenticato. Il "prima" era una favola raccontata a bassa voce, un sogno di cieli azzurri e città luminose, così diverso dai grigiori malati e dalle rovine scheletriche che ora graffiavano l'orizzonte dell'Europa Centrale.</p>,
    <p key="s4" className="text-[175%] leading-relaxed">Suo padre gli aveva insegnato a leggere i segni del vento carico di polveri tossiche, a distinguere il fruscio di una bestia mutata da quello innocuo delle lamiere contorte, a trovare acqua dove sembrava esserci solo aridità. Ogni giorno era una lezione di sopravvivenza, ogni notte un monito sulla fragilità della vita.</p>,
    <p key="s5" className="text-[175%] leading-relaxed">Poi, anche il padre era partito. Una missione avvolta nel mistero, un addio affrettato con la promessa di un ritorno che tardava troppo. Le scorte lasciate con cura si assottigliavano, e con esse la speranza. Rimaneva solo un messaggio frammentario, l'ultima eco della voce paterna: "...trova il Safe Place, Ultimo. È la nostra unica possibilità..."</p>,
    <p key="s6" className="text-[175%] leading-relaxed">Ora, il silenzio è il suo unico compagno. Davanti a lui, un viaggio disperato attraverso un continente irriconoscibile, armato solo degli insegnamenti paterni e di una mappa verso un luogo che potrebbe essere leggenda, trappola, o forse, davvero, salvezza. Il peso della solitudine è grande, ma la volontà di onorare la memoria del padre, e la primordiale necessità di vivere, lo spingono a muovere il primo passo in quel mondo ostile. Il Safe Place attende, da qualche parte oltre la desolazione.</p>
  ];

  return (
    <PaginatedInfoPage
      title="INTRODUZIONE ALLA STORIA"
      content={content}
    />
  );
};

export default StoryScreen;