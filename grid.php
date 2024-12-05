<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Cellular Automata Explorer | Beading with Algorithms</title><meta name="description" content="Cellular Automata Explorer | Beading with Algorithms"><meta name="author" content="Gwen Fisher and Roger Antonsen"><meta name="viewport" content="width=device-width,initial-scale=1"><meta property="og:site_name" content="Cellular Automata Explorer | Beading with Algorithms"><meta name="twitter:site" content="Cellular Automata Explorer | Beading with Algorithms"><meta property="og:title" content="Cellular Automata Explorer | Beading with Algorithms"><meta name="twitter:title" content="Cellular Automata Explorer | Beading with Algorithms"><meta name="description" content="Cellular Automata Explorer | Beading with Algorithms"><meta property="og:description" content="Cellular Automata Explorer | Beading with Algorithms"><meta name="twitter:description" content="Cellular Automata Explorer | Beading with Algorithms"><meta property="og:image" content="favicon/image.png"><meta name="twitter:image" content="favicon/image.png"><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0"><link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png"><link rel="manifest" href="favicon/site.webmanifest"><link href="https://fonts.googleapis.com/css?family=Gloria+Hallelujah" rel="stylesheet"><link rel="stylesheet" href="https://maxst.icons8.com/vue-static/landings/line-awesome/font-awesome-line-awesome/css/all.min.css"><link rel="stylesheet" href="styles.css"><script src="lib.js"></script></head><body> <?php
  $filterPart = array_keys($_GET)[0] ?? 'all';
  $file = file('files/patterns.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  $patterns = array();
  $prefixes = array();
  foreach ($file as $line) {
    if (substr(trim($line), 0, 2) !== "//") {
      $strings = explode(':', $line);
      $shortcode = trim($strings[0], '"');
      $name = trim($strings[1], '"');
      $prefix = explode('_', $name)[0];
      if (!in_array($prefix, $prefixes)) {
        $prefixes[] = $prefix;
      }
      $desc = trim($strings[2], '"');
      $code = $strings[3];
      $infoFilename = "images/beading-" . $shortcode . ".txt"; //  . "-" . $name
      if (file_exists($infoFilename)) {
        $infoString = file_get_contents($infoFilename);
      } else {
        $infoString = "";
      }
      $patterns[] = ["shortcode" => $shortcode, "prefix" => $prefix, "name" => $shortcode . "-" . $name, "desc" => $desc, "code" => $code, "infoString" => $infoString];
    }
  }
  ?> <div class="flex items-center justify-center w-full space-x-4"><a class="p-2" href="<?= $_SERVER["PHP_SELF"] ?>?all">all</a> <?php foreach ($prefixes as $prefix) : ?> <a class="p-2" href="<?= $_SERVER["PHP_SELF"] ?>?<?= $prefix ?>"><?= $prefix ?></a> <?php endforeach; ?> </div><div id="container" class="flex flex-wrap justify-center w-screen h-screen"> <?php foreach ($patterns as $pattern) : ?> <?php if ($filterPart === $pattern["prefix"] || $filterPart === "all") : ?> <div class="max-w-sm m-4 border"><div class="flex flex-col h-full outline-none"><div class="w-full p-2 font-mono text-xs text-black whitespace-normal bg-gray-300">Pattern: <span class="text-black">[<?= $pattern["shortcode"] ?>] <?= $pattern["desc"] ?></span></div><div class="w-full p-2 font-mono text-xs text-black whitespace-normal bg-gray-200">Filename: <span class="text-black">beading-<?= $pattern["name"] ?></span></div><div class="w-full p-2 font-mono text-xs text-black whitespace-normal bg-gray-100">Files: <a target="_blank" class="text-blue-500" href="images/beading-<?= $pattern["shortcode"] ?>.png">pattern+rule</a>, <a target="_blank" class="text-blue-500" href="images/beading-<?= $pattern["shortcode"] ?>-pattern.png">pattern</a>, <a target="_blank" class="text-blue-500" href="images/beading-<?= $pattern["shortcode"] ?>-rule.png">rule</a></div><a href="<?= dirname($_SERVER['PHP_SELF']) ?>?<?= $pattern["code"] ?>" target="_blank" class="flex flex-col h-full outline-none"><div><img class="object-contain" src="images/t/beading-<?= $pattern["shortcode"] ?>.t.png" alt=""></div></a></div></div> <?php endif; ?> <?php endforeach; ?> </div></body></html>