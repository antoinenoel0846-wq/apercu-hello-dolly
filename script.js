/* L'état d'avant-animation est posé PAR le script : sans JS, la page est
   complète et lisible. */
(function(){
  var bougePas = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Filet sous l'en-tête une fois la page déroulée */
  var entete = document.getElementById('entete');
  var surveille = function(){
    entete.classList.toggle('posee', window.scrollY > 12);
  };
  surveille();
  window.addEventListener('scroll', surveille, {passive:true});

  if (bougePas) return;

  /* Apparitions discrètes, une seule fois.
     Le héros n'en fait pas partie : ce qui est déjà à l'écran au chargement
     doit être net tout de suite, pas en train d'apparaître. */
  var cibles = document.querySelectorAll('.repere, .article, .carte-fin, .retouches > .page > *, .atelier > .page > *, .rayon, .pratique > .page > *');
  cibles.forEach(function(el, i){
    el.style.opacity = '0';
    el.style.transform = 'translateY(14px)';
    el.classList.add('apparait');
  });
  /* Léger décalage à l'intérieur d'un même groupe */
  document.querySelectorAll('.grille, .reperes .page, .grille-rayons').forEach(function(groupe){
    Array.prototype.forEach.call(groupe.children, function(enfant, i){
      enfant.dataset.rang = i;
    });
  });

  /* Un simple test au défilement, pas d'IntersectionObserver : un lien
     d'ancre qui saute par-dessus une section laisserait sinon cette
     section invisible pour toujours. Ici, tout ce qui est passé au-dessus
     du bas de l'écran est montré, sauté ou non. */
  var restants = Array.prototype.slice.call(cibles);
  var enAttente = false;

  function montre(){
    enAttente = false;
    var limite = window.innerHeight * 0.92;
    restants = restants.filter(function(el){
      if (el.getBoundingClientRect().top > limite) return true;
      el.style.transitionDelay = ((+el.dataset.rang || 0) * 55) + 'ms';
      el.style.opacity = '1';
      el.style.transform = 'none';
      return false;
    });
    if (!restants.length) {
      window.removeEventListener('scroll', planifie);
      window.removeEventListener('resize', planifie);
    }
  }
  function planifie(){
    if (enAttente) return;
    enAttente = true;
    requestAnimationFrame(montre);
  }

  window.addEventListener('scroll', planifie, {passive:true});
  window.addEventListener('resize', planifie);
  /* Le navigateur saute à l'ancre (ou restaure la position) APRÈS ce script :
     on repasse une fois au chargement, sinon la section d'arrivée reste vide. */
  window.addEventListener('load', planifie);
  window.addEventListener('hashchange', planifie);
  setTimeout(planifie, 200);
  montre();
})();

/* ════════════════════════════════════════════════════════════════
   FICHE PRODUIT — ne s'exécute que si la page en contient une
   ════════════════════════════════════════════════════════════════ */
(function(){
  var ajouter = document.getElementById('ajouter');
  if (!ajouter) return;

  var compteur = document.getElementById('compteur-panier');
  var boutonPanier = document.getElementById('bouton-panier');
  var message = document.getElementById('message-panier');
  var barre = document.getElementById('barre-achat');
  var ajouterBarre = document.getElementById('ajouter-barre');
  var dansLePanier = false;

  function metAuPanier(){
    if (dansLePanier) return;
    dansLePanier = true;

    var total = (+compteur.textContent || 0) + 1;
    compteur.textContent = total;
    boutonPanier.setAttribute('aria-label', 'Mon panier, ' + total + ' pièces');

    ajouter.textContent = 'Dans le panier';
    ajouter.disabled = true;
    ajouter.style.opacity = '.55';
    ajouter.style.cursor = 'default';
    if (ajouterBarre){ ajouterBarre.textContent = 'Ajoutée'; ajouterBarre.disabled = true; ajouterBarre.style.opacity = '.55'; }

    message.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>' +
                        'Ajoutée au panier.';
  }

  ajouter.addEventListener('click', metAuPanier);
  if (ajouterBarre) ajouterBarre.addEventListener('click', metAuPanier);

  /* La barre du bas n'apparaît que lorsque le bouton principal est sorti de l'écran */
  if (barre){
    var regarde = function(){
      var r = ajouter.getBoundingClientRect();
      /* Seulement une fois le bouton principal dépassé : avant, la barre
         doublerait un bouton que la personne n'a pas encore vu. */
      barre.classList.toggle('montree', r.bottom < 0);
    };
    regarde();
    window.addEventListener('scroll', regarde, {passive:true});
    window.addEventListener('resize', regarde);
  }

  /* Les points sous la galerie, sur mobile */
  var galerie = document.querySelector('.galerie');
  var points = document.querySelectorAll('.indice-galerie span');
  if (galerie && points.length){
    galerie.addEventListener('scroll', function(){
      var vues = galerie.querySelectorAll('figure');
      if (!vues.length) return;
      var centre = galerie.scrollLeft + galerie.clientWidth / 2;
      var actif = 0, mieux = Infinity;
      Array.prototype.forEach.call(vues, function(f, i){
        var milieu = f.offsetLeft + f.offsetWidth / 2;
        var ecart = Math.abs(milieu - centre);
        if (ecart < mieux){ mieux = ecart; actif = i; }
      });
      Array.prototype.forEach.call(points, function(p, i){
        p.style.background = i === actif ? 'var(--vert)' : 'var(--trait)';
      });
    }, {passive:true});
  }
})();
