# -*- coding: utf-8 -*-
"""Turn newprod/ filename stems into a {brand, name} catalogue."""
import io, json, re

BRANDS = [  # longest first — "christiandior" must win over "dior"
 ("yvessaintlaurent","Yves Saint Laurent"),("vancleefarpels","Van Cleef & Arpels"),
 ("jeanpaulgaultier","Jean Paul Gaultier"),("narcisorodriguez","Narciso Rodriguez"),
 ("carolinaherrera","Carolina Herrera"),("parfumsdemarly","Parfums de Marly"),
 ("atelierdesors","Atelier des Ors"),("christiandior","Dior"),("dolcegabbana","Dolce & Gabbana"),
 ("emporioarmani","Emporio Armani"),("tizianaterenzi","Tiziana Terenzi"),
 ("alfreddunhill","Dunhill"),("pacorabanne","Paco Rabanne"),("viktorrolf","Viktor & Rolf"),
 ("montblanc","Mont Blanc"),("boucheron","Boucheron"),("trussardi","Trussardi"),
 ("nasomatto","Nasomatto"),("valentino","Valentino"),("hugoboss","Hugo Boss"),
 ("burberry","Burberry"),("davidoff","Davidoff"),("eliesaab","Elie Saab"),
 ("givenchy","Givenchy"),("guerlain","Guerlain"),("monegal","Ramon Monegal"),
 ("moschino","Moschino"),("nishane","Nishane"),("amouage","Amouage"),("lancome","Lancome"),
 ("montale","Montale"),("mancera","Mancera"),("versace","Versace"),("bentley","Bentley"),
 ("bvlgari","Bvlgari"),("cartier","Cartier"),("dunhill","Dunhill"),("lalique","Lalique"),
 ("nicolai","Parfums de Nicolai"),("chanel","Chanel"),("armani","Armani"),("gucci","Gucci"),
 ("hermes","Hermes"),("prada","Prada"),("coach","Coach"),("chloe","Chloe"),
 ("mouage","Amouage"),("dior","Dior"),("paco","Paco Rabanne"),
]

VOCAB = """eau de du des la le les l pour homme femme woman women man men for her him his
noir noire black blue bleu white blanc blanche rouge red gold golden green rose roses roseoudh
oud aoud oudh musk musc musky intense intensive intensely extreme extremes absolu absolute
absolutely elixir essence parfum parfums parfume toilette sport night nuit jour day collection
collector edition limited exclusif privee prive sheer blush bloom blooming blossom dream dreams
spirit legend lady my the and in on to is it its because stronger with you free freeze love
lovely story nomade absolu chance vive tendre coco mademoiselle gabrielle allure sensuelle
no n bad boy good girl chic dot drama herrera baiser vole declaration santos hypnotic poison
new york platinum floral adventure champion cool water hot sea pacific summer rush zino dolce
vita dune fahrenheit forever ever higher energy jadore joy injoy pure sauvage peony shine
intenso light blue only one century essentiel now forever
girl of shine nuit noor couture royal in white amarige ange demon dahlia divin le nectar
gentleman boisee hot insense ultramarine linterdit irresistible very organza pi xeryus
fresh bamboo envy me guilty memoire dune odeur mon bloom of merveilles elixir des jour
dhermes absolu kelly caleche terre twilly poivree bottled unlimited dark deep just different
orange xx xy icon racing jasmin marzipane classique beau scandal so jubilation k amethyst
amethyste eclat exquise azalee amour living lion reve dinfini satine hypnose idole lintense
vie est belle magie miracle o dazur tresor trsor folie alafolie panthere petite robe autre
levriero donna cafe orchid vanille violet line to velvet wild fruits python windwood
sand thea pearl pink greedy jasmine chocolate cedrat boise cocovanille hindu kush indian
lemon flowers garden prestigium blackgold blueaoud roses miss absolutely amber candy
femme leau splash infusions iris cedre luna rossa carbon jeans bright crystal fraiche eros
flame lhomme oriental versense yellow diamond bonbon flowerbomb nectar spicebomb vip party
fever opium floral shock neon nuit blanche cinema libre manifesto paris parisienne
brit london mr beat touch aqva divina omnia coral goldea splendida magnolia sensuel
212 nyc sexy invictus onyx million ultraviolet xs excess olympa olympe aqua lucky
imperatrice reverie california bois diris arethusa cas vele myland myname myscent riflesso
uomo red delicate acqua valentina myrrh assoluto voce viva born roma donna
first oudline greedy mukhallat starry tropical wood soleil capri powder flowers emblem
individuel presence signature leather memo brutus ortoparisi hacivat kiss incense chinawhite
fleur florale poudree bleunoir extreme sublime lovestory reflection beach hut
rushwhiteedition momentum azure infinite quatre en jaipur bouquet bracelet patchouli dangkor
arabians queen lagoon lime lune si passione perfecto by seli mab spices woods marly delina
lautre parfait berberanza rosesberberanza tract musc immortel selima abs""".split()
VOCAB = VOCAB + """di gio gioia code profondo si indigo armes xxv xx unlimited edition sublime privee vip nyc intenso attract poivree twilly caleche kelly terre new york dreams platinum blush coach adventure champion zino sea pacific summer hypnotic poison girl pure joy adore jadore dolce vita dune fahrenheit forever ever higher energy sauvage peony shine only k imperatrice te so essentiel girl now shine white noor couture royal saab elie amarige ange demon dahlia divin nectar gentleman boisee insense ultramarine linterdit irresistible live very organza pi xeryus rouge hot bamboo bloom ambrosia fiori nettare envy me guilty absolute memoire odeur guerlain mon rose merveilles elixir jour hermes absolu bottled dark deep red just different orange xx xy icon racing dunhill jasmins marzipane classique beau scandal jubilation amethyst eclat exquise azalee amour living lion reve infini satine hypnose idole tresor folie panthere petite robe autre donna cafe orchid vanille violet velvet wild fruits python windwood hindu kush indian lemon garden prestigium miss absolutely blooming amber candy femme leau splash infusions cedre luna rossa carbon jeans bright crystal fraiche eros flame lhomme oriental versense yellow diamond bonbon flowerbomb spicebomb nectar opium shock neon blanche cinema libre manifesto paris parisienne brit london mr beat touch aqva divina omnia coral goldea splendida magnolia sensuel 212 sexy invictus onyx million ultraviolet xs excess olympea aqua lucky reverie california bois iris arethusa cas vele riflesso uomo delicate acqua valentina myrrh assoluto voce viva born roma first mukhallat starry tropical soleil capri powder emblem individuel presence signature leather memo brutus parisi hacivat kiss incense china fleur florale poudree bleu narciso reflection beach hut momentum azure infinite quatre en jaipur bouquet bracelet patchouli angkor arabians queen lagoon lime lune passione marly delina exclusif parfait berberanza musc immortel selima cedrat boise coco mademoiselle allure sport extreme tendre vive chance gabrielle nomade story love stronger freeze because its you in with lady legend spirit night myland myname myscent black rose blackrose""".split()
VOCAB = sorted(set(w for w in VOCAB if w), key=len, reverse=True)
VSET = set(VOCAB)
MAXW = max(len(w) for w in VOCAB)

def split_words(s):
    """Fewest-pieces split preferring known words; unknown runs stay whole."""
    n = len(s)
    INF = 10**6
    cost = [INF]*(n+1); back = [None]*(n+1); cost[0] = 0
    for i in range(1, n+1):
        for j in range(max(0, i-MAXW), i):
            piece = s[j:i]
            if cost[j] >= INF: continue
            if piece in VSET:  c = cost[j] + 1
            elif piece.isdigit(): c = cost[j] + 1
            else:              c = cost[j] + 40 + len(piece)   # penalise unknown
            if c < cost[i]: cost[i] = c; back[i] = j
    if cost[n] >= INF: return [s]
    out, i = [], n
    while i > 0:
        j = back[i]; out.append(s[j:i]); i = j
    return out[::-1]

SMALL = {"de","du","des","la","le","les","of","for","en","in","the","and","d","dune","dhermes"}
def titlecase(words):
    out = []
    for k, w in enumerate(words):
        if w.isdigit(): out.append(w)
        elif k > 0 and w in SMALL: out.append(w)
        else: out.append(w[:1].upper() + w[1:])
    return " ".join(out)


OVERRIDE = {
 "lapantherenoirabsolu":       ("Cartier","La Panthere Noir Absolu"),
 "limperatrice3100":           ("Dolce & Gabbana","L'Imperatrice 3"),
 "morrocanleathermemoparis":   ("Memo Paris","Moroccan Leather"),
 "ortoparisibrutus":           ("Orto Parisi","Brutus"),
 "mouagejubilationxxv":        ("Amouage","Jubilation XXV"),
 "jubilation25womanamouage":   ("Amouage","Jubilation 25 Woman"),
 "armaniacquadigioiaforwoman": ("Armani","Acqua di Gioia for Woman"),
 "armaniacquadigioprofondoeau":("Armani","Acqua di Gio Profondo"),
 "armanicodeabsolupourfemme":  ("Armani","Code Absolu pour Femme"),
 "armanieaudarmes":            ("Armani","Eau d'Armes"),
 "si100armanispassione":       ("Armani","Si Passione"),
 "si100armanisirosesignature": ("Armani","Si Rose Signature"),
 "youintenselyarmani":         ("Armani","You Intensely"),
 "bentleyinfiniterushwhiteedition": ("Bentley","Infinite Rush White Edition"),
 "burberrymrburberryindigo":   ("Burberry","Mr Burberry Indigo"),
 "chaneln22":                  ("Chanel","No 22"),
 "chanelno5":                  ("Chanel","No 5"),
 "woodspices100":              ("Mancera","Wood & Spices"),
 "selimabvlgari":              ("Bvlgari","Selima"),
 "s120manceraaouds":           ("Mancera","Aoud S"),
 "m780yvessaintlaurentm7oudabsolu": ("Yves Saint Laurent","M7 Oud Absolu"),
 "boisdiris75vancleefarpelscollectionextraordinaireboisdiris":
     ("Van Cleef & Arpels","Collection Extraordinaire Bois d'Iris"),
 "californiareverie75vancleefarpelscollectionextraordinairecaliforniareverie":
     ("Van Cleef & Arpels","Collection Extraordinaire California Reverie"),
 "roserouge75vancleefarpelscollectionextraordinaireroserouge":
     ("Van Cleef & Arpels","Collection Extraordinaire Rose Rouge"),
 "vancleefarpelscollectionextraordinairerevedencens":
     ("Van Cleef & Arpels","Collection Extraordinaire Reve d'Encens"),
 "exclusif75parfumsdemarlydelinaexclusif": ("Parfums de Marly","Delina Exclusif"),
 "blackperfectobylapetiterobenoireguerlain":
     ("Guerlain","La Petite Robe Noire Black Perfecto"),
 "lapetiterobenoireguerlain":  ("Guerlain","La Petite Robe Noire"),
 "monguerlainintenseguerlain": ("Guerlain","Mon Guerlain Intense"),
 "guerlainmonguerlainbloomofrose": ("Guerlain","Mon Guerlain Bloom of Rose"),
 "joybydiorintensedior":       ("Dior","Joy Intense"),
 "monegalatractonemusk100":    ("Ramon Monegal","Attract One Musk"),
 "muscimmortelatelierdesors":  ("Atelier des Ors","Musc Immortel"),
 "levrierocollection100trussardidonnaintense": ("Trussardi","Donna Intense"),
 "iconracingalfreddunhill":    ("Dunhill","Icon Racing"),
 "freshcouturemoschino":       ("Moschino","Fresh Couture"),
 "goldfreshcouturemoschino":   ("Moschino","Gold Fresh Couture"),
 "pinkfreshcouturemoschino":   ("Moschino","Pink Fresh Couture"),
 "k100dolcegabbanak":          ("Dolce & Gabbana","K"),
 "jasminsmarzipane100lancomejasminsmarzipane": ("Lancome","Jasmins Marzipane"),
 "lautreoud100lancomelautreoud": ("Lancome","L'Autre Oud"),
 "oudbouquet100lancomeoudbouquet": ("Lancome","Oud Bouquet"),
 "parfaitderoses100lancomeparfaitderoses": ("Lancome","Parfait de Roses"),
 "rosesberberanza100lancomerosesberberanza": ("Lancome","Roses Berberanza"),
 "lancomelanuittrsor":         ("Lancome","La Nuit Tresor"),
 "lancomelanuittresoralafolie":("Lancome","La Nuit Tresor a la Folie"),
 "vip100carolinaherrera212vip":("Carolina Herrera","212 VIP"),
 "vipcarolinaherrera212vip":   ("Carolina Herrera","212 VIP"),
 "vipcarolinaherrera212vipblack": ("Carolina Herrera","212 VIP Black"),
 "vip21230carolinaherrera212viprose": ("Carolina Herrera","212 VIP Rose"),
 "vip80carolinaherrera212vippartyfeverlimitededition":
     ("Carolina Herrera","212 VIP Party Fever"),
 "ch100carolinaherrerachleau": ("Carolina Herrera","CH L'Eau"),
 "ch100carolinaherrerachlimitededition": ("Carolina Herrera","CH Limited Edition"),
 "ch100carolinaherrerachprivee": ("Carolina Herrera","CH Privee"),
 "chcarolinaherrerach":        ("Carolina Herrera","CH"),
 "chcarolinaherrerachsublimeeau": ("Carolina Herrera","CH Sublime Eau"),
 "carolinaherreraherrera":     ("Carolina Herrera","Herrera"),
 "hugobossno1":                ("Hugo Boss","No 1"),
 "nishanehacivat":             ("Nishane","Hacivat"),
 "nasomattochinawhite":        ("Nasomatto","China White"),
 "pacorabanneolympa":          ("Paco Rabanne","Olympea"),
 "pacorabanneolympaonyxcollectoredition": ("Paco Rabanne","Olympea Onyx Collector Edition"),
 "pacorabanneolympeaaqua":     ("Paco Rabanne","Olympea Aqua"),
 "versacepourhommeoudnoireaudeparfume": ("Versace","Pour Homme Oud Noir"),
 "hermestwillydhermseaupoivree": ("Hermes","Twilly d'Hermes Eau Poivree"),
 "narcisorodrigueznarcisopoudree": ("Narciso Rodriguez","Narciso Poudree"),
 "trussardiuomotheredtrussardi": ("Trussardi","Uomo The Red"),
 "givenchydahliadivinlenectarcollectoreditionintense":
     ("Givenchy","Dahlia Divin Le Nectar Intense"),
 "givenchydahliadivinlenectarde": ("Givenchy","Dahlia Divin Le Nectar"),
 "davidoffcoolwatersearosedetoilette": ("Davidoff","Cool Water Sea Rose"),
 "davidoffcoolwatersearosepacificsummereditiondetoilette":
     ("Davidoff","Cool Water Sea Rose Pacific Summer"),
 "redjeansversace":            ("Versace","Red Jeans"),
 "pacorabanneinvictusonyxcollectoredition": ("Paco Rabanne","Invictus Onyx Collector Edition"),
 "dolcegabbanatheonlyone2":    ("Dolce & Gabbana","The Only One 2"),
 "tizianaterenzigoldroseoudh": ("Tiziana Terenzi","Gold Rose Oudh"),
 "pradalesinfusionsdepradairiscedre": ("Prada","Les Infusions de Prada Iris Cedre"),
 "boucheronpatchoulidangkor":  ("Boucheron","Patchouli d'Angkor"),
 "gucciguccibamboo":           ("Gucci","Bamboo"),
}

def parse(stem):
    if stem in OVERRIDE:
        b, n = OVERRIDE[stem]; return {"b": b, "n": n}

    best = None
    for key, disp in BRANDS:
        idx = stem.find(key)
        if idx < 0: continue
        if best is None or len(key) > len(best[0]): best = (key, disp, idx)
    if not best: return None
    key, disp, idx = best
    after  = stem[idx+len(key):]
    while after.startswith(key): after = after[len(key):]
    before = stem[:idx]
    rest = after if len(after) >= 3 else before
    rest = re.sub(r'^\d+', '', rest)                 # drop leading size/SKU digits
    if not rest: rest = before or after
    words = split_words(rest)
    return {"b": disp, "n": titlecase(words)}

stems = [l.strip() for l in io.open("stems.txt", encoding="utf-8") if l.strip()]
rows, unmatched = [], []
for st in stems:
    r = parse(st)
    if r and r["n"]: rows.append(r)
    else: unmatched.append(st)

seen, uniq = set(), []
for r in rows:
    k = (r["b"], r["n"].lower())
    if k in seen: continue
    seen.add(k); uniq.append(r)
uniq.sort(key=lambda r: (r["b"], r["n"]))

io.open("catalog.json","w",encoding="utf-8").write(json.dumps(uniq, ensure_ascii=False))
print("parsed:", len(uniq), "| unmatched:", len(unmatched))
if unmatched: print("UNMATCHED:", unmatched)
print()
for r in uniq[:45]: print("  ", r["b"], "|", r["n"])
