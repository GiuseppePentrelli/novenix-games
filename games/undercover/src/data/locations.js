// The location deck. Every non-spy player is dealt a location plus a flavor
// role from that location's list; the spy sees neither.
export const LOCATIONS = [
  {
    id: 'stazione-spaziale',
    name: 'Stazione Spaziale',
    roles: ['Comandante', 'Ingegnere di bordo', 'Astrofisica', 'Pilota', 'Medico di bordo', 'Tecnico delle comunicazioni'],
  },
  {
    id: 'sottomarino',
    name: 'Sottomarino',
    roles: ['Capitano', 'Sonarista', 'Motorista', 'Cuoco di bordo', 'Nostromo', 'Radiotelegrafista'],
  },
  {
    id: 'casino-clandestino',
    name: 'Casinò clandestino',
    roles: ['Croupier', 'Buttafuori', 'Contabile in nero', 'Cantante del locale', 'Giocatore d’azzardo', 'Barista', 'Investigatore sotto copertura'],
  },
  {
    id: 'museo-arte',
    name: 'Museo d’arte',
    roles: ['Curatrice', 'Guardia notturna', 'Restauratore', 'Guida turistica', 'Mecenate', 'Ladro d’arte'],
  },
  {
    id: 'set-cinematografico',
    name: 'Set cinematografico',
    roles: ['Regista', 'Attrice protagonista', 'Truccatore', 'Stuntman', 'Sceneggiatrice', 'Fonico', 'Produttore'],
  },
  {
    id: 'nave-crociera',
    name: 'Nave da crociera',
    roles: ['Capitano', 'Animatore di bordo', 'Cameriera di cabina', 'Chef', 'Musicista della band', 'Passeggero VIP', 'Medico di bordo', 'Fotografo ufficiale'],
  },
  {
    id: 'base-militare-segreta',
    name: 'Base militare segreta',
    roles: ['Generale', 'Soldato semplice', 'Ingegnere missilistico', 'Addetto alle comunicazioni', 'Medico militare', 'Cuoco della mensa', 'Pilota di elicotteri'],
  },
  {
    id: 'circo-itinerante',
    name: 'Circo itinerante',
    roles: ['Domatore di leoni', 'Trapezista', 'Clown', 'Domatrice di cavalli', 'Mangiafuoco', 'Addetto alla biglietteria', 'Direttore del circo'],
  },
  {
    id: 'villaggio-olimpico',
    name: 'Villaggio olimpico',
    roles: ['Atleta di sollevamento pesi', 'Allenatore', 'Giornalista sportivo', 'Fisioterapista', 'Arbitro', 'Volontario'],
  },
  {
    id: 'nave-pirata',
    name: 'Nave pirata',
    roles: ['Capitano', 'Nostromo', 'Cannoniere', 'Vedetta', 'Cuoco di bordo', 'Prigioniero', 'Cartografo'],
  },
  {
    id: 'grand-hotel',
    name: 'Grand Hotel',
    roles: ['Direttore dell’hotel', 'Concierge', 'Cameriera ai piani', 'Chef pasticcere', 'Ospite facoltoso', 'Facchino', 'Pianista del bar'],
  },
  {
    id: 'stazione-sciistica',
    name: 'Stazione sciistica',
    roles: ['Maestro di sci', 'Gestore degli impianti', 'Turista principiante', 'Soccorritore alpino', 'Barista dello chalet', 'Noleggiatore di sci'],
  },
  {
    id: 'ambasciata',
    name: 'Ambasciata',
    roles: ['Ambasciatore', 'Console', 'Interprete', 'Guardia di sicurezza', 'Funzionario del visto', 'Autista diplomatico'],
  },
  {
    id: 'scuola-di-magia',
    name: 'Scuola di magia',
    roles: ['Preside della scuola', 'Insegnante di pozioni', 'Studentessa del primo anno', 'Bibliotecario', 'Custode', 'Allenatore di duelli'],
  },
  {
    id: 'fiera-di-paese',
    name: 'Fiera di paese',
    roles: ['Giostraio', 'Venditore di zucchero filato', 'Sindaco del paese', 'Musicista della banda', 'Giudice della gara di torte', 'Addetto al tiro a segno'],
  },
  {
    id: 'studio-televisivo',
    name: 'Studio televisivo',
    roles: ['Conduttore', 'Regista', 'Truccatrice', 'Autore dei testi', 'Tecnico delle luci', 'Ospite in collegamento', 'Produttore esecutivo'],
  },
  {
    id: 'parco-safari',
    name: 'Parco safari',
    roles: ['Guida del safari', 'Veterinario', 'Fotografo naturalista', 'Turista in fuoristrada', 'Guardiacaccia', 'Autista del jeep'],
  },
  {
    id: 'miniera-oro',
    name: 'Miniera d’oro',
    roles: ['Capo minatore', 'Geologo', 'Cercatore d’oro', 'Ingegnere delle gallerie', 'Cuoco del campo', 'Mulattiere'],
  },
  {
    id: 'isola-deserta',
    name: 'Isola deserta',
    roles: ['Naufrago', 'Capitano della nave affondata', 'Esperto di sopravvivenza', 'Radioamatore', 'Pescatore', 'Costruttore di zattere'],
  },
  {
    id: 'monastero-montagna',
    name: 'Monastero di montagna',
    roles: ['Abate', 'Monaco copista', 'Novizio', 'Erborista del monastero', 'Pellegrino', 'Campanaro'],
  },
  {
    id: 'aeroporto-internazionale',
    name: 'Aeroporto internazionale',
    roles: ['Pilota', 'Assistente di volo', 'Controllore di volo', 'Doganiere', 'Bagagliere', 'Passeggero in transito', 'Addetto al check-in'],
  },
  {
    id: 'ristorante-stellato',
    name: 'Ristorante stellato',
    roles: ['Chef stellato', 'Sommelier', 'Sous-chef', 'Cameriere di sala', 'Critico gastronomico', 'Lavapiatti', 'Maître'],
  },
  {
    id: 'reality-show',
    name: 'Set di un reality show',
    roles: ['Concorrente', 'Autore del programma', 'Cameraman', 'Opinionista in studio', 'Addetto al montaggio', 'Presentatore'],
  },
  {
    id: 'palazzo-presidenziale',
    name: 'Palazzo presidenziale',
    roles: ['Presidente', 'Capo della sicurezza', 'Portavoce', 'Consigliere', 'Maggiordomo', 'Giornalista accreditato', 'Autista presidenziale'],
  },
  {
    id: 'laboratorio-segreto',
    name: 'Laboratorio segreto',
    roles: ['Direttore del laboratorio', 'Ricercatrice', 'Tecnico di laboratorio', 'Cavia volontaria', 'Addetto alla sicurezza', 'Informatico'],
  },
  {
    id: 'treno-notturno',
    name: 'Treno notturno',
    roles: ['Capotreno', 'Controllore', 'Passeggero della cuccetta', 'Addetto al vagone ristorante', 'Contrabbandiere', 'Detective a bordo'],
  },
]

export function pickLocation() {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
}

export function pickRoles(location, count) {
  const shuffled = [...location.roles].sort(() => Math.random() - 0.5)
  const roles = []
  for (let i = 0; i < count; i++) {
    roles.push(shuffled[i % shuffled.length])
  }
  return roles
}
