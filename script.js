// ==========================================
// 1. GESTIONE MENU MOBILE (Hamburger)
// ==========================================
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Chiudi il menu quando si clicca su un link
document.querySelectorAll('.nav-links li a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// ==========================================
// 2. SCROLL ANIMATIONS (Intersection Observer)
// ==========================================
const scrollElements = document.querySelectorAll('.scroll-anim');

const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend);
};

const displayScrollElement = (element) => {
    element.classList.add('visible');
};

const hideScrollElement = (element) => {
    element.classList.remove('visible'); // Rimuovi se vuoi che l'animazione si ripeta scendendo e salendo
};

const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
        if (elementInView(el, 1.15)) {
            displayScrollElement(el);
        } else {
            // Decommenta la riga sotto se vuoi che gli elementi si nascondano quando escono dalla vista
            // hideScrollElement(el); 
        }
    })
}

// Inizializza al caricamento per gli elementi già visibili
window.addEventListener('load', handleScrollAnimation);
// Aggiungi l'evento di scroll
window.addEventListener('scroll', () => {
    handleScrollAnimation();
});


// ==========================================
// 3. BACKGROUND 3D DNA (Three.js)
// ==========================================
const dnaContainer = document.getElementById('dna-container');

// Setup base Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
dnaContainer.appendChild(renderer.domElement);

// Gruppo che conterrà tutto il DNA per poterlo ruotare facilmente
const dnaGroup = new THREE.Group();
scene.add(dnaGroup);

// Materiali (Light Mode: Azzurri chiari, semitrasparenti)
const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x0ea5e9, // Azzurro Tech
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.2,
    transparent: true,
    opacity: 0.8,
    shininess: 100
});

const linkMaterial = new THREE.MeshPhongMaterial({
    color: 0x8b5cf6, // Lilla Pieno
    emissive: 0x8b5cf6,
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: 0.5,
    shininess: 50
});

// Geometrie
const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const linkGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 16);

// Creazione del filamento
const numBasePairs = 40;
const heightOffset = 0.6;
const radius = 2;
const angleOffset = 0.3; // Quanto ruota ogni step per fare l'elica

for (let i = 0; i < numBasePairs; i++) {
    const y = (i - numBasePairs / 2) * heightOffset;
    const angle = i * angleOffset;

    // Posizioni sfera 1
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;

    // Posizioni sfera 2 (opposta)
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;

    // Mesh Sfera 1
    const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere1.position.set(x1, y, z1);
    dnaGroup.add(sphere1);

    // Mesh Sfera 2
    const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere2.position.set(x2, y, z2);
    dnaGroup.add(sphere2);

    // Connettore tra le due sfere (Cilindro)
    const link = new THREE.Mesh(linkGeometry, linkMaterial);

    // Posizione al centro tra le due sfere
    link.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);

    // Orientamento del cilindro per collegarle
    link.lookAt(x1, y, z1);
    // Il lookAt orienta l'asse Z, ruotiamo di 90 gradi per allineare l'asse Y (default cylinder axis)
    link.rotateX(Math.PI / 2);

    dnaGroup.add(link);
}

// Luci
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Posizione Camera
camera.position.z = 15;
camera.position.x = 8; // Offset per metterlo un po' a lato dietro il testo
camera.lookAt(0, 0, 0);

// ==========================================
// 4. INTERAZIONE MOUSE & ANIMAZIONE
// ==========================================
let targetRotationX = 0;
let targetRotationY = 0;
let mouseX = 0;
let mouseY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX) * 0.001;
    mouseY = (event.clientY - windowHalfY) * 0.001;
});

// Animation Loop
const animate = function () {
    requestAnimationFrame(animate);

    // Rotazione costante (Elica che gira)
    dnaGroup.rotation.y += 0.005;

    // Rotazione target dipendente dal mouse
    targetRotationY = mouseX * 0.5;
    targetRotationX = mouseY * 0.5;

    // Lerp per movimento fluido inseguendo il mouse
    dnaGroup.rotation.y += (targetRotationY - window.mouseXLerp || 0) * 0.05;
    dnaGroup.rotation.x += (targetRotationX - window.mouseXLerpx || 0) * 0.05;

    // Salvataggio stato temporaneo per il lerp manuale
    window.mouseXLerp = (window.mouseXLerp || 0) + (targetRotationY - (window.mouseXLerp || 0)) * 0.05;
    window.mouseXLerpx = (window.mouseXLerpx || 0) + (targetRotationX - (window.mouseXLerpx || 0)) * 0.05;

    // Leggero float up/down
    dnaGroup.position.y = Math.sin(Date.now() * 0.001) * 0.5;

    renderer.render(scene, camera);
};

animate();

// Resize Handler
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// ==========================================
// 5. GESTIONE PDB RESEARCH BOX
// ==========================================

// ==========================================
// 6. PUBMED LIVE PULSE
// ==========================================

// Immagini scientifiche dinamiche da Unsplash (ambito biomedico/lab)
const SCIENCE_IMAGES = [
    'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80', // lab petri
    'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80', // DNA strand
    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80', // neuron
    'https://images.unsplash.com/photo-1614935151651-0bea6508db6b?w=600&q=80', // molecules
    'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?w=600&q=80', // microscope
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&q=80', // biotech lab
];

function getRandomScienceImage(seed) {
    return SCIENCE_IMAGES[seed % SCIENCE_IMAGES.length];
}

function truncate(str, max) {
    if (!str) return 'N/D';
    return str.length > max ? str.substring(0, max) + '…' : str;
}

function buildPubMedCard(article, index) {
    const { pmid, title, authors, journal, pubDate, abstract } = article;
    const imgUrl = getRandomScienceImage(index + pmid % 6);
    const pubMedUrl = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

    return `
        <article class="pubmed-card glass-panel" onclick="window.open('${pubMedUrl}', '_blank')" role="link" tabindex="0" aria-label="Leggi articolo: ${title}">
            <div class="pubmed-card-img" style="background-image: url('${imgUrl}');">
                <span class="live-badge"><span class="live-dot"></span>LIVE</span>
            </div>
            <div class="pubmed-card-body">
                <p class="pubmed-journal">${truncate(journal, 55)}</p>
                <h3 class="pubmed-title">${truncate(title, 110)}</h3>
                <p class="pubmed-authors">${truncate(authors, 70)}</p>
                <p class="pubmed-date">${pubDate}</p>
                <div class="pubmed-read-more">
                    <span>Leggi su PubMed</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
            </div>
        </article>
    `;
}

async function fetchPubMedArticles() {
    const grid = document.getElementById('pubmed-grid');
    if (!grid) return;

    const QUERY = 'bioinformatics';
    const RETMAX = 3;
    const BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';

    try {
        // Step 1: esearch — recupera gli ID degli ultimi 3 articoli
        const searchUrl = `${BASE}esearch.fcgi?db=pubmed&term=${encodeURIComponent(QUERY)}&sort=pub+date&retmax=${RETMAX}&retmode=json`;
        const searchRes = await fetch(searchUrl);
        if (!searchRes.ok) throw new Error('Errore esearch');
        const searchData = await searchRes.json();
        const ids = searchData.esearchresult?.idlist;
        if (!ids || ids.length === 0) throw new Error('Nessun articolo trovato');

        // Step 2: efetch — recupera i dettagli XML degli articoli
        const fetchUrl = `${BASE}efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
        const fetchRes = await fetch(fetchUrl);
        if (!fetchRes.ok) throw new Error('Errore efetch');
        const xmlText = await fetchRes.text();

        // Step 3: Parsing XML
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, 'application/xml');
        const articles = xml.querySelectorAll('PubmedArticle');

        const parsed = Array.from(articles).map((art, i) => {
            const getTag = (el, tag) => el.querySelector(tag)?.textContent?.trim() || '';

            const pmid = getTag(art, 'PMID');
            const title = getTag(art, 'ArticleTitle') || 'Titolo non disponibile';

            // Autori
            const authorNodes = art.querySelectorAll('Author');
            const authors = Array.from(authorNodes).slice(0, 3).map(a => {
                const last = getTag(a, 'LastName');
                const init = getTag(a, 'Initials');
                return last ? `${last} ${init}`.trim() : '';
            }).filter(Boolean).join(', ') + (authorNodes.length > 3 ? ' et al.' : '');

            const journal = getTag(art, 'Title') || getTag(art, 'ISOAbbreviation') || 'Journal';
            const year = getTag(art, 'Year') || getTag(art, 'MedlineDate') || '';
            const month = getTag(art, 'Month') || '';
            const pubDate = [month, year].filter(Boolean).join(' ');

            return { pmid, title, authors, journal, pubDate };
        });

        // Step 4: Render cards
        grid.innerHTML = parsed.map((art, i) => buildPubMedCard(art, i)).join('');

    } catch (err) {
        console.error('PubMed fetch error:', err);
        grid.innerHTML = `
            <div class="pubmed-error glass-panel">
                <p>⚠️ Impossibile connettersi a PubMed in questo momento.</p>
                <a href="https://pubmed.ncbi.nlm.nih.gov/?term=bioinformatics&sort=pubdate" target="_blank" class="btn-neon-blue btn-small" style="display:inline-block;margin-top:1rem;">Apri PubMed direttamente</a>
            </div>
        `;
    }
}

// Avvia il fetch PubMed quando la pagina è pronta
window.addEventListener('load', fetchPubMedArticles);


const analyzeBtn = document.getElementById('analyze-btn');
const pdbInput = document.getElementById('pdb-input');
const pdbLoading = document.getElementById('pdb-loading');
const pdbResult = document.getElementById('pdb-result');

if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
        let query = pdbInput.value.trim().toUpperCase();
        if (!query) return;

        // Reset UI
        pdbResult.classList.add('hidden');
        pdbLoading.classList.remove('hidden');

        try {
            let pdbId = query;
            if (query.length > 4) {
                // Semplice ricerca REST su RCSB PDB per termine
                const searchResponse = await fetch(`https://search.rcsb.org/rcsbsearch/v2/query?json={"query":{"type":"terminal","service":"text","parameters":{"value":"${query}"}},"return_type":"entry","request_options":{"paginate":{"start":0,"rows":1}}}`);
                if (searchResponse.ok) {
                    const searchData = await searchResponse.json();
                    if (searchData.result_set && searchData.result_set.length > 0) {
                        pdbId = searchData.result_set[0].identifier;
                    } else {
                        throw new Error('Proteina non trovata.');
                    }
                }
            }

            // Fetch info principali usando l'ID PDB
            const response = await fetch(`https://data.rcsb.org/rest/v1/core/entry/${pdbId}`);

            if (!response.ok) throw new Error('Dati non trovati nel PDB.');

            const data = await response.json();

            // Estrazione dati
            const title = data.struct?.title || 'Titolo non disponibile';
            const residues = data.rcsb_entry_info?.deposited_polymer_monomer_count || 'N/D';

            // Per l'organismo proviamo un paio di percorsi comuni nel JSON del PDB
            let organism = 'N/D';
            if (data.rcsb_entity_source_organism && data.rcsb_entity_source_organism.length > 0) {
                organism = data.rcsb_entity_source_organism[0].ncbi_scientific_name;
            } else if (data.rcsb_entity_host_organism && data.rcsb_entity_host_organism.length > 0) {
                organism = data.rcsb_entity_host_organism[0].ncbi_scientific_name;
            }

            // Costruisci l'HTML del risultato
            pdbResult.innerHTML = `
                <h4>Risultato per: <span style="color:#fff">${pdbId.toUpperCase()}</span></h4>
                <p><strong>Nome:</strong> <span title="${title}">${title.length > 50 ? title.substring(0, 50) + '...' : title}</span></p>
                <p><strong>Residui totali:</strong> <span style="color:#0ff">${residues}</span></p>
                <p><strong>Organismo:</strong> ${organism}</p>
            `;

            // Simuliamo un pizzico di delay (1.5s) per far godere l'animazione spaziale
            setTimeout(() => {
                pdbLoading.classList.add('hidden');
                pdbResult.classList.remove('hidden');
            }, 1000);

        } catch (error) {
            setTimeout(() => {
                pdbLoading.classList.add('hidden');
                pdbResult.innerHTML = `
                    <h4 style="color:#ff0055; text-shadow: 0 0 10px rgba(255,0,85,0.5);">Errore Spaziale</h4>
                    <p style="color:#fff;">Impossibile recuperare i dati. Verifica l'ID PDB o prova con <strong>1A8M</strong>.</p>
                `;
                pdbResult.classList.remove('hidden');
            }, 1000);
        }
    });

    // Supporto per tasto invio
    pdbInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            analyzeBtn.click();
        }
    });
}
