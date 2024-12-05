<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Cellular Automata Explorer | Beading with Algorithms</title><meta name="description" content="Cellular Automata Explorer | Beading with Algorithms"><meta name="author" content="Gwen Fisher and Roger Antonsen"><meta name="viewport" content="width=device-width,initial-scale=1"><meta property="og:site_name" content="Cellular Automata Explorer | Beading with Algorithms"><meta name="twitter:site" content="Cellular Automata Explorer | Beading with Algorithms"><meta property="og:title" content="Cellular Automata Explorer | Beading with Algorithms"><meta name="twitter:title" content="Cellular Automata Explorer | Beading with Algorithms"><meta name="description" content="Cellular Automata Explorer | Beading with Algorithms"><meta property="og:description" content="Cellular Automata Explorer | Beading with Algorithms"><meta name="twitter:description" content="Cellular Automata Explorer | Beading with Algorithms"><meta property="og:image" content="favicon/image.png"><meta name="twitter:image" content="favicon/image.png"><meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0"><link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png"><link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png"><link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png"><link rel="manifest" href="favicon/site.webmanifest"><link rel="stylesheet" href="styles.css"><script src="lib.js"></script></head><body> <?php
  // $filterPart = array_keys($_GET)[0];
  $file = file('files/colors.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  $colors = array();
  foreach ($file as $line) {
    if (substr($line, 0, 1) !== "/") {
      $strings = explode(':', $line);
      $colornumber = $strings[0];
      $colorname = $strings[1];
      $code = $strings[2];
      $list = explode('&', $code);
      $colorcodes = [];
      foreach ($list as $item) {
        $parts = explode("=", $item);
        if (count($parts) == 2) {
          $colorcodes[$parts[0]] = $parts[1];
        }
      }
      $colors[] = ['colornumber' => $colornumber, 'colorname' => $colorname, 'code' => $code, 'colorcodes' => $colorcodes];
    }
  }
  ?> <?php foreach ($colors as $color) : ?> <div class="flex justify-center"> <?php
      $colornumber = $color['colornumber'];
      ?> <div class="flex flex-col"><div class="flex justify-center w-full p-4 mt-8 text-3xl bg-white"> <?= $color['colorname'] ?> (<?= $colornumber ?>)</div><div class="flex flex-row w-full"> <?php foreach ($color['colorcodes'] as $index => $code) : ?> <input hidden type="color" id="color-<?= $colornumber ?>-<?= $index ?>" name="color-<?= $colornumber ?>-<?= $index ?>" value="<?= $code ?>"> <?php endforeach; ?> </div><div class="flex flex-row w-full"><div class="color" data-id="color-<?= $colornumber ?>-c0f" data-color="<?= $color['colorcodes']['c0f'] ?>"></div><div class="color" data-id="color-<?= $colornumber ?>-c1f" data-color="<?= $color['colorcodes']['c1f'] ?>"></div><div class="color" data-id="color-<?= $colornumber ?>-c2f" data-color="<?= $color['colorcodes']['c2f'] ?>"></div><div class="color" data-id="color-<?= $colornumber ?>-c3f" data-color="<?= $color['colorcodes']['c3f'] ?>"></div><div class="color" data-id="color-<?= $colornumber ?>-c4f" data-color="<?= $color['colorcodes']['c4f'] ?>"></div><div class="color" data-id="color-<?= $colornumber ?>-c5f" data-color="<?= $color['colorcodes']['c5f'] ?>"></div></div> <?php for ($i = 0; $i <= 10; $i++) : ?> <div class="flex flex-row w-full"><div class="lerpcolor" data-amount="<?= $i ?>" data-colorid="color-<?= $colornumber ?>-c0-<?= $i ?>" data-colorfrom="color-<?= $colornumber ?>-c0f" data-colorto="color-<?= $colornumber ?>-c0t"></div><div class="lerpcolor" data-amount="<?= $i ?>" data-colorid="color-<?= $colornumber ?>-c1-<?= $i ?>" data-colorfrom="color-<?= $colornumber ?>-c1f" data-colorto="color-<?= $colornumber ?>-c1t"></div><div class="lerpcolor" data-amount="<?= $i ?>" data-colorid="color-<?= $colornumber ?>-c2-<?= $i ?>" data-colorfrom="color-<?= $colornumber ?>-c2f" data-colorto="color-<?= $colornumber ?>-c2t"></div><div class="lerpcolor" data-amount="<?= $i ?>" data-colorid="color-<?= $colornumber ?>-c3-<?= $i ?>" data-colorfrom="color-<?= $colornumber ?>-c3f" data-colorto="color-<?= $colornumber ?>-c3t"></div><div class="lerpcolor" data-amount="<?= $i ?>" data-colorid="color-<?= $colornumber ?>-c4-<?= $i ?>" data-colorfrom="color-<?= $colornumber ?>-c4f" data-colorto="color-<?= $colornumber ?>-c4t"></div><div class="lerpcolor" data-amount="<?= $i ?>" data-colorid="color-<?= $colornumber ?>-c5-<?= $i ?>" data-colorfrom="color-<?= $colornumber ?>-c5f" data-colorto="color-<?= $colornumber ?>-c5t"></div></div> <?php endfor; ?> <div class="flex flex-row w-full"><div class="color" data-id="color-<?= $colornumber ?>-c0t" data-color="<?= $color['colorcodes']['c0t'] ?>"></div><div class="color" data-id="color-<?= $colornumber ?>-c1t" data-color="<?= $color['colorcodes']['c1t'] ?>"></div><div class="color" data-id="color-<?= $colornumber ?>-c2t" data-color="<?= $color['colorcodes']['c2t'] ?>"></div><div class="color" data-id="color-<?= $colornumber ?>-c3t" data-color="<?= $color['colorcodes']['c3t'] ?>"></div><div class="color" data-id="color-<?= $colornumber ?>-c4t" data-color="<?= $color['colorcodes']['c4t'] ?>"></div><div class="color" data-id="color-<?= $colornumber ?>-c5t" data-color="<?= $color['colorcodes']['c5t'] ?>"></div></div><input id="color-<?= $colornumber ?>" class="w-full p-2 text-xs bg-gray-300 border outline-none" value="<?= $color['code'] ?>"></div></div> <?php endforeach; ?> </body><script>let canvases = {};
  let lerpcanvases = {};
  let colorpickers = {};

  function setup() {
    for (let picker of selectAll("input")) {
      picker.input(updateFromColorPickers);
      colorpickers[picker.elt.id] = picker;
    }
    for (let div of selectAll('.color')) {
      cnv = createGraphics(200, 50);
      cnv.parent(div);
      cnv.background(colorpickers[div.elt.dataset.id].value());
      cnv.show();
      cnv.mouseClicked(colorPressed);
      canvases[div.elt.dataset.id] = cnv;
    }
    for (let div of selectAll('.lerpcolor')) {
      cnv = createGraphics(200, 10);
      cnv.parent(div);
      cnv.show();
      lerpcanvases[div.elt.dataset.colorid] = cnv;
    }
    updateLerpColors();
  }

  function updateFromColorPickers(e) {
    let colorToBeUpdated = e.target.id;
    let newColorValue = e.target.value;
    canvases[colorToBeUpdated].background(newColorValue);
    updateLerpColors(colorToBeUpdated.slice(0, -1));
    updateCode(colorToBeUpdated.slice(0, -4));
  }

  function updateCode(id) {
    let inputtext = select("#" + id);
    inputtext.elt.value = createCode(id)
  }

  function createCode(id) {
    let result = "";
    let inputs = selectAll("input[type=color]")
    for (let input of inputs) {
      if (input.elt.id.includes(id + "-")) {
        result += input.elt.id.replace(id + "-", "") + "=" + input.elt.value + "&";
      }
    }

    return result.slice(0, -1);
  }

  function updateLerpColors(id) {
    for (let cnv in lerpcanvases) {
      if (id === undefined || cnv.includes(id)) {
        let data = lerpcanvases[cnv].parent().dataset;
        let colorfromid = data.colorfrom;
        let colortoid = data.colorto;
        let amount = data.amount / 10;
        let colorfrom = color(colorpickers[colorfromid].value());
        let colorto = color(colorpickers[colortoid].value());
        let lerpedcolor = lerpColor(colorfrom, colorto, amount);
        lerpcanvases[cnv].background(lerpedcolor);
      }
    }
  }

  function colorPressed(event) {
    let inputthing = select('#' + event.target.parentElement.dataset.id);
    inputthing.elt.click();
  }</script></html>