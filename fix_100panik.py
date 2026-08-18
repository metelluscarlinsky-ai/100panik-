import os, re, shutil

# ===== 1. Backups =====
if not os.path.exists('backup'):
    os.makedirs('backup')
for fname in ['assets/css/style.css', 'pages/index.html', 'pages/boutik.html']:
    if os.path.exists(fname):
        shutil.copy(fname, 'backup/' + os.path.basename(fname))
print("Backups done")

# ===== 2. Modify CSS: nouvelle palette =====
css_path = 'assets/css/style.css'
with open(css_path, 'r') as f:
    css = f.read()

# Remplacer les variables de couleur dans :root
# On remplace chaque ancienne valeur par la nouvelle
replacements_css = {
    '#E63946': '#A0522D',  # wouj -> marron
    '#B71C1C': '#5C3A21',  # rouge foncé -> marron foncé
    '#0A2472': '#3E2723',  # bleu profond -> brun foncé
    '#1E90FF': '#6D4C41',  # bleu électrique -> brun moyen
    '#00B4D8': '#8D6E63',  # cyan -> marron gris
    '#FFD700': '#D4A373',  # or -> doré doux
    '#0B1D3A': '#3E2723',  # ancien navy -> brun
    '#050912': '#F5F0E6',  # fond corps -> crème
    '#0A1128': '#EBE0D0',  # fond section -> beige clair
    '#111827': '#E0D5C5',  # carte -> beige moyen
    '#030509': '#D9CBB8',  # footer -> beige foncé
}
for old, new in replacements_css.items():
    css = css.replace(old, new)

# Ajuster les textes : passer de blanc à brun foncé
css = css.replace('color: var(--blan);', 'color: #3E2723;')
css = css.replace('color: var(--gri-klè);', 'color: #5C3A21;')
# Garder boutons lisibles
css = css.replace('.btn-primè { background: var(--gradient-panik); color: var(--blan);',
                  '.btn-primè { background: var(--gradient-panik); color: #F5F0E6;')
css = css.replace('.btn-segondè { background: rgba(255, 255, 255, 0.08); color: var(--blan);',
                  '.btn-segondè { background: rgba(255,255,255,0.5); color: #3E2723;')
# Assurer que le fond du body reste crème
css = css.replace('background: var(--black);', 'background: #F5F0E6;')

# Ajouter CSS pour intro (si pas déjà présent)
if '#introOverlay' not in css:
    css += '''

/* ===== INTRO OVERLAY (Index uniquement) ===== */
#introOverlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: #F5F0E6;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: opacity 0.8s ease, visibility 0.8s ease;
}
#introOverlay.hidden {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}
.intro-logo {
  width: 200px;
  height: auto;
  animation: introLogoAnim 2.5s ease-in-out infinite;
}
@keyframes introLogoAnim {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.05) rotate(-3deg); }
  50% { transform: scale(1.1) rotate(3deg); }
  75% { transform: scale(1.02) rotate(-1deg); }
}
.intro-title {
  font-family: var(--font-titr);
  font-size: 2.8rem;
  color: #3E2723;
  margin-top: 30px;
  text-transform: uppercase;
  letter-spacing: 0.4em;
  animation: fadeInText 1.5s ease-out;
}
.intro-sub {
  color: #8D6E63;
  margin: 15px 0 40px;
  font-size: 0.9rem;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  animation: fadeInText 2.5s ease-out;
}
@keyframes fadeInText {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
'''
with open(css_path, 'w') as f:
    f.write(css)
print("CSS mis à jour")

# ===== 3. Retirer intro de toutes les pages sauf index.html =====
intro_pattern = re.compile(r'<div id="introOverlay">.*?</div>\s*</div>\s*</div>', re.DOTALL)
intro_script_pattern = re.compile(r'<script>.*?INTRO_DURATION.*?</script>', re.DOTALL)

pages_dir = 'pages'
for filename in os.listdir(pages_dir):
    if not filename.endswith('.html'):
        continue
    path = os.path.join(pages_dir, filename)
    with open(path, 'r') as f:
        content = f.read()
    original = content
    # Retirer tout intro si page != index
    if filename != 'index.html':
        content = intro_pattern.sub('', content)
        content = intro_script_pattern.sub('', content)
    # Pour index, on nettoie d'abord les anciens, on les remettra après
    else:
        content = intro_pattern.sub('', content)
        content = intro_script_pattern.sub('', content)
    if content != original:
        with open(path, 'w') as f:
            f.write(content)
        print(f"Intro retirée de {filename}")

# ===== 4. Ajouter l'intro à index.html (10s) =====
index_path = os.path.join(pages_dir, 'index.html')
with open(index_path, 'r') as f:
    content = f.read()

intro_html = '''
<!-- INTRO OVERLAY (Index only) -->
<div id="introOverlay">
  <img src="../assets/images/logo-100panik.jpg" alt="100PANIK" class="intro-logo">
  <h1 class="intro-title">100<span style="color:#A0522D;">PANIK</span></h1>
  <p class="intro-sub">When the world panics, style stays calm</p>
</div>
'''

intro_script = '''
<script>
window.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('introOverlay');
  if (overlay) {
    const INTRO_DURATION = 10000; // 10 secondes (modifier pour plus)
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.8s ease';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 800);
    }, INTRO_DURATION);
  }
});
</script>
'''

# Insérer après <body>
if 'id="introOverlay"' not in content:
    content = content.replace('<body>', '<body>\n' + intro_html, 1)
# Insérer script avant </body>
if 'INTRO_DURATION' not in content:
    content = content.replace('</body>', intro_script + '\n</body>', 1)

with open(index_path, 'w') as f:
    f.write(content)
print("Intro ajoutée à index.html (10s)")

print("\n✅ Terminé ! Couleur crème/marron appliquée, intro uniquement sur la page d'accueil.")
