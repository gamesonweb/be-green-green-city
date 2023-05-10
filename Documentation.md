# Documentation Green City

## But du jeu

Le but du jeu est de gagner le plus de points possible.
Il y a 3 types de points :
* La monnaie "Green City" (GC)
* La "greenness"
* La population

Chaque bâtiment "green" fait gagner des points, et chaque bâtiment polluant fait perdre des points. Placer un bâtiment coûte de l'argent, mais en rapporte par la suite. Toutes les 10 secondes, tous les bâtiments placés par le joueur rapportent de l'argent et ajoutent ou enlèvent des points de greenness et de population. Des particules sont également émises des bâtiments qui produisent de l'argent.

Remarque : par manque de temps, nous n'avons pas pu développer davantage notre jeu. Nous aurions voulu ajouter beaucoup plus de bâtiments, par exemple des écoles, hôpitaux, centrales nucléaires, centrales à charbon, centrales hydroélectriques, usines, etc.

L'idée était que chaque bâtiment aie sa particularité. Par exemple, pour les centrales nucléaires, elles sont green mais coûtent cher et font fuir la population (donc la construction d'une centrale nucléaire enlève des points de population). Les écoles font augmenter la population, les hôpitaux aussi, les centrales à charbon et usines font perdre des points de greenness, etc.

## Contrôles

Le jeu se joue entièrement au clavier. Les deux joueurs peuvent jouer simultanément. Les deux plateaux sont affichés côte à côte, pour que chaque joueur puisse observer la progression de son adversaire.

Joueur 1 (partie gauche de l'écran) :
* `z`, `s`, `q`, `d` : faire tourner le plateau / sélectionner une case (en mode construction)
* `z`, `s` : choisir un bâtiment à construire (après avoir activé le placement d'un bâtiment)
* `v` : activer/désactiver le mode construction
* `c` : (uniquement en mode construction) ouvrir le menu des bâtiments / placer le bâtiment sélectionné
* `w` : changer le niveau de zoom

Joueur 2 (partie droite de l'écran) :
* `↑`, `↓`, `←`, `→` : faire tourner le plateau / sélectionner une case (en mode construction)
* `↑`, `↓` : choisir un bâtiment à construire (après avoir activé le placement d'un bâtiment)
* `m` : activer/désactiver le mode construction
* `l` : (uniquement en mode construction) ouvrir le menu des bâtiments / placer le bâtiment sélectionné
* `o` : changer le niveau de zoom
