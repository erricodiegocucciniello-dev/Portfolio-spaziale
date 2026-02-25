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
// 3. CANVAS BACKGROUND PARTICLES (Spazio/Stelle)
// ==========================================
const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Colori neon per le stelle/particelle
const colors = ['#00f3ff', '#9d00ff', '#ffffff', '#0ff'];

// Configurazione base particelle
const config = {
    particleCount: 150, // Numero di stelle
    maxSpeed: 0.5,
    minSize: 0.5,
    maxSize: 2.5
};

// Adatta il canvas alla finestra
function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

// Classe Particella
class Particle {
    constructor() {
        this.reset();
        // Distribuzione iniziale semi-casuale su tutto lo schermo anche in altezza
        this.y = Math.random() * height;
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * (config.maxSize - config.minSize) + config.minSize;
        // Movimento dominato verso l'alto (come bolle) o in diagonale
        this.vx = (Math.random() - 0.5) * config.maxSpeed;
        this.vy = (Math.random() - 0.5) * config.maxSpeed - 0.2; // Tendenza a salire
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.opacity = Math.random() * 0.5 + 0.2; // Opacità base
        this.twinkleSpeed = Math.random() * 0.05 + 0.01;
        this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // "Twinkling" effect (pulsazione luce)
        this.opacity += this.twinkleSpeed * this.twinkleDir;
        if (this.opacity >= 1 || this.opacity <= 0.1) {
            this.twinkleDir *= -1;
        }

        // Se esce dallo schermo, rinasce dal lato opposto
        if (this.y < 0) {
            this.y = height;
            this.x = Math.random() * width;
        } else if (this.y > height) {
            this.y = 0;
            this.x = Math.random() * width;
        }

        if (this.x < 0) {
            this.x = width;
            this.y = Math.random() * height;
        } else if (this.x > width) {
            this.x = 0;
            this.y = Math.random() * height;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);

        // Aggiungi sfuocatura o bagliore neon
        ctx.shadowBlur = this.size * 5;
        ctx.shadowColor = this.color;

        ctx.fillStyle = `rgba(${hexToRgb(this.color)}, ${this.opacity})`;
        ctx.fill();
        ctx.closePath();
    }
}

// Helper: Converte HEX in RGB per l'opacità
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : '255, 255, 255';
}

// Inizializza Sistema
function initParticles() {
    particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }
}

// Loop di Animazione
function animateParticles() {
    // Pulisci il frame precedente, lasciando una leggera scia (trail effect)
    ctx.fillStyle = 'rgba(10, 10, 18, 0.4)'; // Colore di fondo del body con opacità
    ctx.fillRect(0, 0, width, height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Connetti linee tra particelle vicine (Effetto Rete/Costellazione)
    connectParticles();

    requestAnimationFrame(animateParticles);
}

function connectParticles() {
    let opacityValue = 1;
    for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
            let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x))
                + ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));

            // Distanza limite per tracciare la linea
            if (distance < (width / 10) * (height / 10)) {
                opacityValue = 1 - (distance / 20000);
                if (opacityValue > 0) {
                    ctx.strokeStyle = `rgba(0, 243, 255, ${opacityValue * 0.2})`; // Linee azzurre trasparenti
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }
}

// Event Listeners per il Canvas
window.addEventListener('resize', () => {
    resizeCanvas();
    initParticles();
});

// Avvio
resizeCanvas();
initParticles();
animateParticles();

// ==========================================
// 4. INTERAZIONE MOUSE (Opzionale: repulsione/attrazione sulle stelle)
// ==========================================
let mouse = {
    x: null,
    y: null,
    radius: 100
}

window.addEventListener('mousemove', function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// Aggiungi l'interazione del mouse alla funzione update() delle particelle
// modificando leggermente il comportamento se vicino al cursore.
const originalUpdate = Particle.prototype.update;
Particle.prototype.update = function () {
    originalUpdate.call(this); // Chiama logica base

    // Interazione col mouse
    let dx = mouse.x - this.x;
    let dy = mouse.y - this.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < mouse.radius) {
        // Allontana le particelle dal mouse (Repulsione)
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;

        // Puoi invertire il segno se preferisci l'attrazione
        this.x -= forceDirectionX * 2;
        this.y -= forceDirectionY * 2;
    }
};

window.addEventListener('mouseout', function () {
    mouse.x = undefined;
    mouse.y = undefined;
});

// ==========================================
// 5. GESTIONE PDB RESEARCH BOX
// ==========================================
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
