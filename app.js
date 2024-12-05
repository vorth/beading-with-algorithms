"use strict";
const verbose = !true;
const vverbose = !true;
const vvverbose = !true;
let mobile;
function preload() {
  if (vverbose) console.log("preload");
  font = loadFont("fonts/Prestige.ttf");
  preloadedStrings = loadStrings("files/patterns.txt");
  preloadedColorStrings = loadStrings("files/colors.txt");
}
function windowResized() {
  let w = select("#pattern").elt.offsetWidth;
  let h = select("#pattern").elt.offsetHeight;
  resizeCanvas(w, h);
  updateVisualDimensions();
  currentPattern.placeRuleModules();
  draw(false);
}
function setup() {
  noCanvas();
  if (vverbose) console.log("setup() start:");
  setUpViewportFix();
  mobile = isMobile();
  initNames();
  preloadedStrings = preloadedStrings.filter(
    (s) => s !== "" && s.charAt(0) !== "/",
  );
  preloadedColorStrings = preloadedColorStrings.filter(
    (s) => s !== "" && s.charAt(0) !== "/",
  );
  noColorSets = preloadedColorStrings.length;
  pixelDensity(2);
  colorMode(HSB, 255, 255, 255, 255);
  textFont(font);
  let w = select("#pattern").elt.offsetWidth;
  let h = select("#pattern").elt.offsetHeight;
  if (verbose) console.log("windowResized ........... " + w + " " + h);
  canvas = createCanvas(w, h);
  canvas.parent("pattern");
  canvas.mouseClicked(canvasMousePressed);
  updateVisualDimensions();
  setParametersFromURL();
  ready = true;
  if (vverbose) console.log("  => end setup()");
  noLoop();
}
function updateVisualDimensions() {
  patternBoxX = .05 * width;
  patternBoxY = .01 * height;
  patternBoxW = .9 * width;
  patternBoxH = .58 * height;
  ruleBoxX = .05 * width;
  ruleBoxY = .6 * height;
  ruleBoxW = .9 * width;
  ruleBoxH = .39 * height;
  fullBoxX = .05 * width;
  fullBoxY = .01 * height;
  fullBoxW = .9 * width;
  fullBoxH = .98 * height;
}
function setColors(newNumberOfColors) {
  if (vverbose) console.log("setColors(" + newNumberOfColors + ") start:");
  let currentCompression = ruleCompression;
  ruleCompression = getRuleCompressionShortString(0);
  currentPattern.createRuleModules();
  if (newNumberOfColors < colors) {
    const repeats = colors - newNumberOfColors;
    for (let n = 0; n < repeats; n++) {
      colors = colors - 1;
      refreshGlobalSeed();
      currentPattern.decreaseColors();
    }
  } else {
    const repeats = newNumberOfColors - colors;
    for (let n = 0; n < repeats; n++) {
      colors = colors + 1;
      colorMapping.push(colors - 1);
      currentPattern.increaseColors(colors - 2);
    }
  }
  ruleCompression = currentCompression;
  currentPattern.createRuleModules();
  currentPattern.placeRuleModules();
  refreshGlobalSeed();
  createColorsets();
  updateColorSchemeCanvas();
  initializePatternsAndDraw();
  if (vverbose) console.log("  => setColors() end.");
}
function increaseColors(c) {
  if (vverbose) console.log("increaseColors(" + c + ") start:");
  if (vverbose) console.log("colors = " + colors);
  if (c === undefined) c = colors - 1;
  if (colors < maxColor) {
    let currentCompression = ruleCompression;
    ruleCompression = getRuleCompressionShortString(0);
    currentPattern.createRuleModules();
    colors = colors + 1;
    colorMapping.push(colors - 1);
    currentPattern.increaseColors(c);
    ruleCompression = currentCompression;
    currentPattern.createRuleModules();
    currentPattern.placeRuleModules();
    for (let radio of selectAll("input[name='radioColors']")) {
      if (radio.elt.dataset.colors == colors) radio.elt.checked = true;
    }
    refreshGlobalSeed();
    createColorsets();
    updateColorSchemeCanvas();
    initializePatternsAndDraw();
  }
  if (vverbose) console.log("  => increaseColors() end.");
}
function decreaseColors() {
  if (vverbose) console.log("decreaseColors() start:");
  if (colors > 2) {
    colors = colors - 1;
    refreshGlobalSeed();
    currentPattern.decreaseColors();
    for (let radio of selectAll("input[name='radioColors']")) {
      if (radio.elt.dataset.colors == colors) radio.elt.checked = true;
    }
    createColorsets();
    updateColorSchemeCanvas();
    initializePatternsAndDraw();
  }
  if (vverbose) console.log("  => decreaseColors() end.");
}
function initSize(splitOnC) {
  if (vverbose) console.log("initSize() start:");
}
function initSizeOld(splitOnC) {
  if (vverbose) console.log("initSize() start:");
  let newArrayRule = new Array(int(pow(colors, neighbors))).fill(0);
  if (vverbose) console.log("  initSize: " + "newStartArrayRule initialized:");
  if (vverbose) console.log("  initSize: " + newArrayRule);
  let prevArrayRule;
  if (patterns !== undefined) prevArrayRule = currentPattern.arrayRule;
  else prevArrayRule = newArrayRule;
  if (vverbose) {
    console.log("initSize: " + "making sure previous rule is transferred");
  }
  if (vverbose) console.log("  initSize: " + "prevArrayRule is currently:");
  if (vverbose) console.log("  initSize: " + prevArrayRule);
  let newValues = newArrayRule.length - prevArrayRule.length;
  if (newValues > 0) {
    if (vverbose) console.log("  initSize: " + "we have more colors");
    if (splitOnC === undefined) splitOnC = colors - 2;
    for (let left = 0; left < colors; left++) {
      for (let above = 0; above < colors; above++) {
        for (let right = 0; right < colors; right++) {
          let prevLeft = left === colors - 1 ? splitOnC : left;
          let prevAbove = above === colors - 1 ? splitOnC : above;
          let prevRight = right === colors - 1 ? splitOnC : right;
          let oldNeighborhoodIndex = (colors - 1) * (colors - 1) * prevLeft +
            (colors - 1) * prevAbove + prevRight;
          let newNeighborhoodIndex = colors * colors * left + colors * above +
            right;
          newArrayRule[newNeighborhoodIndex] =
            prevArrayRule[oldNeighborhoodIndex];
        }
      }
    }
  } else if (newValues < 0) {
    if (vverbose) console.log("  initSize: " + "we have less colors");
    let arraySize = min(newArrayRule.length, prevArrayRule.length);
    for (let left = 0; left < colors; left++) {
      for (let above = 0; above < colors; above++) {
        for (let right = 0; right < colors; right++) {
          let prevLeft = left;
          let prevAbove = above;
          let prevRight = right;
          let oldNeighborhoodIndex = (colors + 1) * (colors + 1) * prevLeft +
            (colors + 1) * prevAbove + prevRight;
          let neighborhoodIndex = colors * colors * left + colors * above +
            right;
          newArrayRule[neighborhoodIndex] =
            prevArrayRule[oldNeighborhoodIndex] % colors;
        }
      }
    }
  } else {
    if (vverbose) {
      console.log("  initSize: " + "we have the same number of colors");
    }
    newArrayRule = prevArrayRule;
  }
  if (vverbose) console.log("initSize: " + " => " + newArrayRule);
  prevArrayRule = newArrayRule;
  if (colorMapping.length < colors) colorMapping.push(colors - 1);
  else if (colorMapping.length > colors) {
    colorMapping = colorMapping.filter((item) => item < colors);
  }
  if (vverbose) console.log("  => end initSize()");
}
function updateVisualStyle() {
  if (vverbose) console.log("updateVisualStyle() start:");
  if (visualStyle === "bead") {
    bRatio = staggered ? .75 : 1.5;
    beadSpacingW = .94;
    beadSpacingH = .94;
    beadRoundness = staggered ? .3 : .1;
    borderWidth = 0;
    borderBrightness = defaultBorderBrightness;
  } else if (visualStyle === "realistic") {
    bRatio = staggered ? .75 : 1.5;
    beadSpacingW = .9;
    beadSpacingH = .9;
    beadRoundness = .45;
  } else if (visualStyle === "hexagons") {
    bRatio = sqrt(3) / 2;
    beadSpacingW = 1;
    beadSpacingH = 1;
    beadRoundness = 0;
  } else if (visualStyle === "apples") {
    bRatio = staggered ? sqrt(3) / 2 : 1;
    beadSpacingW = 1;
    beadSpacingH = 1;
    beadRoundness = 0;
  } else if (visualStyle === "rectangles") {
    bRatio = .81;
    beadSpacingW = 1;
    beadSpacingH = 1;
    beadRoundness = 0;
  } else if (visualStyle === "squares") {
    bRatio = 1;
    beadSpacingW = 1;
    beadSpacingH = 1;
    beadRoundness = 0;
  } else if (visualStyle === "scales") {
    bRatio = staggered ? .5 : 1.5;
    beadSpacingW = 1;
    beadSpacingH = staggered ? .5 : 1;
    beadRoundness = 0;
  } else if (visualStyle === "diamonds") {
    bRatio = staggered ? .5 : 1;
    beadSpacingW = 1;
    beadSpacingH = staggered ? .5 : 1;
    beadRoundness = 0;
  }
  sliderBratio.value(bRatio);
  select("#sliderBratioValue").html(bRatio);
  sliderBeadSpacingW.value(beadSpacingW);
  select("#sliderBeadSpacingWValue").html(beadSpacingW);
  sliderBeadSpacingH.value(beadSpacingH);
  select("#sliderBeadSpacingHValue").html(beadSpacingH);
  sliderBeadRoundness.value(beadRoundness);
  select("#sliderBeadRoundnessValue").html(beadRoundness);
  if (vverbose) console.log("  => end updateVisualStyle()");
}
function refreshPatternsAndDraw() {
  if (vverbose) console.log("refreshPatternsAndDraw()");
  if (gridLayout) { for (let pattern of patterns) pattern.initPattern(); }
  else currentPattern.initPattern();
  if (ready) draw();
  if (vverbose) console.log("  => end refreshPatternsAndDraw()");
}
function initializePatternsAndDraw() {
  if (vverbose) console.log("initializePatternsAndDraw() start:");
  patterns = [];
  if (comparisonLayout === "two" || comparisonLayout === "three") {
    patterns.push(currentPattern);
    let ARPattern = new Pattern();
    stringDescription = currentPattern.shortStringDescription;
    ARPattern.setRuleModules(currentPattern.ruleModules);
    patterns.push(ARPattern);
    for (let module of ARPattern.ruleModules) {
      let tempSet = module.leftSet;
      module.leftSet = module.aboveSet;
      module.aboveSet = module.rightSet;
      module.rightSet = tempSet;
      for (let neighborhood of module.neighborhoods) {
        let temp = neighborhood.left;
        neighborhood.left = neighborhood.above;
        neighborhood.above = neighborhood.right;
        neighborhood.right = temp;
      }
    }
    ARPattern.setArrayRuleFromRuleModules();
    if (comparisonLayout === "three") {
      let nonStaggeredPattern = new Pattern();
      stringDescription = currentPattern.shortStringDescription;
      nonStaggeredPattern.setRuleModules(currentPattern.ruleModules);
      nonStaggeredPattern.placeRuleModules();
      nonStaggeredPattern.setArrayRuleFromRuleModules();
      patterns.push(nonStaggeredPattern);
    }
  } else if (gridLayout) {
    if (vverbose) {
      console.log("initializePatternsAndDraw: " + "we are in grid layout");
    }
    numberOfPatterns = gridColumns * gridRows;
    patterns.push(currentPattern);
    if (vverbose) console.log("   adding pattern " + 0);
    if (vverbose) console.log(currentPattern.ruleModules);
    if (currentPattern.ruleModules.length === 0) {
      currentPattern.createRuleModules();
      currentPattern.placeRuleModules();
    }
    let filterCounter = 0;
    while (patterns.length < numberOfPatterns) {
      filterCounter++;
      if (filterCounter % 100 == 0) {
        if (verbose) {
          console.log(
            filterCounter + " patterns searched; " + patterns.length +
              " found.",
          );
        }
      }
      if (filterCounter > 1e4 && patterns.length < 2) break;
      let candidatePattern = new Pattern();
      candidatePattern.setRuleModules(currentPattern.ruleModules);
      candidatePattern.placeRuleModules();
      candidatePattern.setArrayRuleFromRuleModules();
      if (vverbose) console.log("   creating pattern ");
      if (vverbose) console.log(candidatePattern.ruleModules);
      candidatePattern.incrementNextFromRulemodules();
      currentPattern = candidatePattern;
      if (filterFewEquivalents || filterOnePerEquivalenceClass) {
        let equivalentPatterns = currentPattern.getEquivalentPatterns();
        if (
          filterOnePerEquivalenceClass &&
          equivalentPatterns[0][0] !== currentPattern.getRuleModulesCode()
        ) continue;
        if (
          filterFewEquivalents &&
          equivalentPatterns.length === factorial(colors)
        ) {
          if (verbose) {
            console.log(
              "skipping " + equivalentPatterns.map((x) => x[0] + " "),
            );
          }
          continue;
        }
      }
      if (filterPeriodTwo && currentPattern.period === 2) continue;
      if (filterPeriodFour && currentPattern.period === 4) continue;
      if (filterPeriodSix && currentPattern.period === 6) continue;
      if (filterPersistent && currentPattern.colorsUsed < colors) continue;
      if (filterClosed && currentPattern.closedOnSubset.length === 0) continue;
      if (filterSemiClosed && currentPattern.semiclosedOnSubset.length === 0) {
        continue;
      }
      if (filterNotSemiClosed && !currentPattern.isNotSemiClosed()) continue;
      if (filterColorSplit && currentPattern.colorSplit.length === 0) continue;
      if (filterNotColorSplit && currentPattern.colorSplit.length !== 0) {
        continue;
      }
      patterns.push(currentPattern);
    }
    currentPattern = patterns[0];
  } else {
    numberOfPatterns = 1;
    if (analysisMode) currentPattern.analyzeArrayRule();
  }
  if (ready) draw();
  if (vverbose) console.log("  => end initializePatternsAndDraw()");
}
function getTimeString() {
  return str(year()) + ("0" + str(month())).slice(-2) +
    ("0" + str(day())).slice(-2) + "_" + ("0" + str(hour())).slice(-2) +
    ("0" + str(minute())).slice(-2) + ("0" + str(second())).slice(-2);
}
function screenshotDirect() {
  if (verbose) console.log("------------ screenshotDirect ------------");
  render();
  saveBeadingCanvasAfterRender(getTimeString(), false);
  draw(false);
}
function screenshotAllLayouts() {
  if (verbose) console.log("------------ screenshotAllLayouts ------------");
  let rememberWidth = width;
  let rememberHeight = height;
  resizeCanvas(renderWidth, renderHeight);
  updateVisualDimensions();
  currentPattern.placeRuleModules();
  if (comparisonLayout || gridLayout) {
    render();
    saveBeadingCanvasAfterRender(false, false);
  } else {
    let layoutNumber = getMainLayoutNumber(mainLayout);
    for (let i = 0; i < mainLayouts.length; i++) {
      render();
      saveBeadingCanvasAfterRender(false, i === 0 ? true : false);
      let n = (layoutNumber + i + 1) % mainLayouts.length;
      mainLayout = getMainLayoutShortString(n);
      currentPattern.placeRuleModules();
    }
  }
  resizeCanvas(rememberWidth, rememberHeight);
  updateVisualDimensions();
  currentPattern.placeRuleModules();
  draw(false);
}
function generateAll() {
  generatingAll = true;
  ready = true;
  if (vverbose) console.log("generateAll start:");
  for (let i = 0; i < preloadedStrings.length; i++) {
    let textAndRule = split(preloadedStrings[i], ":");
    let shortCode = textAndRule[0].slice(1, -1);
    let shortStringDescription = textAndRule[1].slice(1, -1);
    if (verbose) console.log(shortStringDescription);
    let ch = split(shortStringDescription, "_");
    if (true || ch[1] === "ch05") {
      if (verbose) console.log("---- Pattern " + i);
      setPreloadedPattern(i);
      screenshotAllLayouts();
    }
  }
  generatingAll = !true;
}
function draw(callUpdateURL = true) {
  let okToDraw = true;
  if (animateColors) {
    let currentMillis = millis();
    if (currentMillis - animationLastStartMillis > animationPeriod) {
      animationLastStartMillis = currentMillis;
      animationFrameCount++;
    } else {
      if (vverbose) console.log("------------ breaking ------------");
      okToDraw = false;
    }
  }
  if (okToDraw) {
    if (vverbose) console.log("------------ drawing ------------");
    render();
  }
  if (!animateColors && poppingNow == false && callUpdateURL) {
    updateURL();
    updateInfoStrings();
  }
  if (vverbose) console.log("    _____________end draw_______________________");
}
function saveBeadingCanvasAfterRender(timeString, sidecarfile = false) {
  if (vverbose) console.log("saveBeadingCanvasAfterRender");
  let codeString;
  let shortString;
  let typeString;
  if (
    currentPattern.shortCode !== undefined && currentPattern.shortCode !== ""
  ) codeString = "-" + currentPattern.shortCode;
  else codeString = "";
  if (
    currentPattern.shortStringDescription !== undefined &&
    currentPattern.shortStringDescription !== ""
  ) shortString = "-" + currentPattern.shortStringDescription;
  else {shortString = "-" + colors + "c-" +
      currentPattern.ruleModuleNextsToString();}
  if (gridLayout) {
    if (codeString == "") {
      typeString = "-grid-" + gridColumns + "x" + gridRows;
    } else typeString = "";
  } else {typeString = comparisonLayout
      ? "-comparison"
      : mainLayout == "pattern+rule"
      ? ""
      : "-" + mainLayout;}
  let fileName = "beading" + codeString;
  if (verbose) console.log("Saving image: " + fileName + ".png");
  saveCanvas(canvas, fileName + typeString, "png");
  if (sidecarfile) {
    if (verbose) console.log("Saving sidecar file for " + fileName);
    let strings = [getInfoString()];
    saveStrings(strings, fileName, "txt");
  }
}
function render() {
  if (vverbose) console.log("start: render()");
  clear();
  if (showBoundingBox) {
    noFill();
    strokeWeight(2);
    stroke(0, 100);
    rect(0, 0, width, height);
  }
  if (ready) {
    push();
    colorMode(HSB);
    if (comparisonLayout === "two" || comparisonLayout === "three") {
      if (vverbose) console.log(" we are in comparisonLayout");
      let cW = width / (comparisonLayout === "two" ? 2 : 3);
      let cH = height;
      let ratio = .95;
      let textH = 15;
      let w = ratio * cW;
      let h = ratio * cH - textH;
      let hPad = 0 * .5 * (cW - w);
      let vPad = 0 * .25 * (cH - h);
      staggered = true;
      updateVisualStyle();
      patterns[0].show(0 * cW + hPad, 0 * cH + vPad, w, h);
      staggered = true;
      updateVisualStyle();
      patterns[1].initPattern();
      patterns[1].show(1 * cW + hPad, 0 * cH + vPad, w, h);
      if (comparisonLayout === "three") {
        staggered = !true;
        updateVisualStyle();
        patterns[2].initPattern();
        patterns[2].show(2 * cW + hPad, 0 * cH + vPad, w, h);
        staggered = true;
        updateVisualStyle();
      }
    } else if (gridLayout) {
      let cW = width / gridColumns;
      let cH = height / gridRows;
      let ratio = .95;
      let textH = 15;
      let w = ratio * cW;
      let h = ratio * cH - textH;
      let hPad = 0 * .5 * (cW - w);
      let vPad = 0 * .25 * (cH - h);
      for (let i = 0; i < patterns.length; i++) {
        let c = i % gridColumns;
        let r = floor(i / gridColumns);
        let x = c * cW;
        let y = r * cH;
        patterns[i].show(x + hPad, y + vPad, w, h);
        if (showGridText) {
          fill(0);
          noStroke();
          textAlign(CENTER, BOTTOM);
          textFont(font);
          text(
            patterns[i].ruleModuleNextsToString(),
            x + hPad + w / 2,
            y + vPad + cH - (staggered ? 10 : 8),
          );
        }
      }
    } else {if (mainLayout === "pattern+rule") {
        currentPattern.show(patternBoxX, patternBoxY, patternBoxW, patternBoxH);
        currentPattern.showRule(ruleBoxX, ruleBoxY, ruleBoxW, ruleBoxH);
      } else if (mainLayout === "pattern") {
        currentPattern.show(fullBoxX, fullBoxY, fullBoxW, fullBoxH);
      } else if (mainLayout === "rule") {
        currentPattern.showRule(fullBoxX, fullBoxY, fullBoxW, fullBoxH);
      }}
    pop();
  }
  if (vverbose) console.log("  end: render()");
}
function setPreloadedPattern(n) {
  if (vverbose) console.log("setPreloadedPattern: " + n);
  gridLayout = false;
  resetToggles();
  setParametersFromString(preloadedStrings[n]);
}
function updateSelectors() {
  if (vverbose) console.log("updateSelectors() start:");
  var elemSelect = document.querySelectorAll("select");
  if (vverbose) console.log("  => end updateSelectors()");
}
class ColorSet {
  constructor(id, a, b, c, d, e, f, ta, tb, tc, td, te, tf, t) {
    this.index = id;
    this.infoString = t;
    this.myColors = [];
    this.myColors[0] = a;
    this.myColors[1] = b;
    this.myColors[2] = c;
    this.myColors[3] = d;
    this.myColors[4] = e;
    this.myColors[5] = f;
    this.toColors = [];
    this.toColors[0] = ta;
    this.toColors[1] = tb;
    this.toColors[2] = tc;
    this.toColors[3] = td;
    this.toColors[4] = te;
    this.toColors[5] = tf;
    for (let i = 0; i < 6; i++) {
      for (let m = 1; m < colorModulo; m++) {
        this.myColors[i + m * 6] = lerpColor(
          this.myColors[i],
          this.toColors[i],
          m / (colorModulo - 1),
        );
      }
    }
  }
  getText() {
    return this.infoString;
  }
  toURL() {
    let result = "";
    result += "&c0f=" + this.myColors[0].toString("#rrggbb").slice(1);
    result += "&c1f=" + this.myColors[1].toString("#rrggbb").slice(1);
    result += "&c2f=" + this.myColors[2].toString("#rrggbb").slice(1);
    result += "&c3f=" + this.myColors[3].toString("#rrggbb").slice(1);
    result += "&c4f=" + this.myColors[4].toString("#rrggbb").slice(1);
    result += "&c5f=" + this.myColors[5].toString("#rrggbb").slice(1);
    result += "&c0t=" + this.toColors[0].toString("#rrggbb").slice(1);
    result += "&c1t=" + this.toColors[1].toString("#rrggbb").slice(1);
    result += "&c2t=" + this.toColors[2].toString("#rrggbb").slice(1);
    result += "&c3t=" + this.toColors[3].toString("#rrggbb").slice(1);
    result += "&c4t=" + this.toColors[4].toString("#rrggbb").slice(1);
    result += "&c5t=" + this.toColors[5].toString("#rrggbb").slice(1);
    return result;
  }
  get(i) {
    if (vvverbose) console.log("ColorSet.get(" + i + ")");
    return this.myColors[i];
  }
  getTo(i) {
    return this.toColors[i];
  }
}
function createColorsets(setAsCurrentSet) {
  if (vverbose) console.log("createColorsets() start:");
  periodColor = color(0, 200, 200);
  if (!colorMappingActive) colorMapping = [...Array(colors).keys()];
  customColorSet = new ColorSet(
    -1,
    color(customColorValuesFrom[0]),
    color(customColorValuesFrom[1]),
    color(customColorValuesFrom[2]),
    color(customColorValuesFrom[3]),
    color(customColorValuesFrom[4]),
    color(customColorValuesFrom[5]),
    color(customColorValuesTo[0]),
    color(customColorValuesTo[1]),
    color(customColorValuesTo[2]),
    color(customColorValuesTo[3]),
    color(customColorValuesTo[4]),
    color(customColorValuesTo[5]),
    "Custom Color",
  );
  if (vverbose) console.log("  createColorsets: " + "CustomColorSet:");
  if (vverbose) console.log(customColorSet);
  colorSets = [];
  for (let line of preloadedColorStrings) {
    let parts = split(trim(line), ":");
    let number = parseInt(parts[0]);
    let name = trim(parts[1]);
    let parameters = split(parts[2], "&");
    colorSets[number] = new ColorSet(
      number,
      color(getValue("c0f", parameters)),
      color(getValue("c1f", parameters)),
      color(getValue("c2f", parameters)),
      color(getValue("c3f", parameters)),
      color(getValue("c4f", parameters)),
      color(getValue("c5f", parameters)),
      color(getValue("c0t", parameters)),
      color(getValue("c1t", parameters)),
      color(getValue("c2t", parameters)),
      color(getValue("c3t", parameters)),
      color(getValue("c4t", parameters)),
      color(getValue("c5t", parameters)),
      name,
    );
  }
  if (vverbose) console.log("  createColorsets: " + "colorSets:");
  if (vverbose) console.log(colorSets);
  if (vverbose) console.log("colorSetIndexFromURL = " + colorSetIndexFromURL);
  if (setAsCurrentSet !== undefined && setAsCurrentSet !== -1) {
    if (vverbose) {
      console.log(
        "  createColorsets: " + "Setting currentColorSet: colorSets[" +
          setAsCurrentSet + "]",
      );
    }
    currentColorSet = colorSets[setAsCurrentSet];
  } else if (customColors) {
    if (vverbose) {
      console.log(
        "  createColorsets: " + "Setting currentColorSet: customColorSet",
      );
    }
    currentColorSet = customColorSet;
  } else if (currentColorSet !== undefined && currentColorSet.index !== -1) {
    if (vverbose) {
      console.log(
        "  createColorsets: " +
          "Setting currentColorSet: colorSets[currentColorSet.index]",
      );
    }
    currentColorSet = colorSets[currentColorSet.index];
  } else {
    if (vverbose) {
      console.log(
        "  createColorsets: " +
          "Setting currentColorSet: colorSets[colorSetIndexFromURL]",
      );
    }
    currentColorSet = colorSets[colorSetIndexFromURL];
  }
  if (vverbose) console.log("  createColorsets: " + "currentColorSet:");
  if (vverbose) console.log(currentColorSet);
  if (vverbose) console.log("  => end createColorsets()");
}
function cycleColor(c, index, cap) {
  let colorChangeConstant = 50;
  let h = int(hue(c));
  let s = int(saturation(c));
  let b = int(brightness(c));
  let newh = h;
  let news = s;
  let newb = b;
  if (s == 0) {
    if (b < 128) newb = b + int(map(index, 0, cap, 0, 128));
    else newb = b - int(map(index, 0, cap, 0, 128));
  } else newh = (h + int(colorChangeConstant * index / cap)) % 256;
  return color(newh, news, newb);
}
function setColor(s, c, r) {
  if (vvverbose) console.log("setColor " + s + " " + c + " " + r);
  if (s == -1) {
    noFill();
    noStroke();
  } else {
    if (altColorMode) {
      currentFill = currentColorSet.get(
        maxColor * (r % colorModulo) + colorMapping[s],
      );
    } else currentFill = currentColorSet.get(colorMapping[s]);
    fill(currentFill);
    stroke(currentFill);
  }
}
function hsb(h, s, b) {
  return color(h * 255 / 360, s * 255 / 100, b * 255 / 100);
}
const renderWidth = 3e3;
const renderHeight = 3e3;
let defaultVisualStyle = "rectangles";
let defaultDirectional = false;
let defaultColumns = 30;
let defaultRows = 64;
let defaultColors = 3;
let defaultColorSetIndex = 0;
let defaultAltColorMode = false;
let defaultColorModulo = 4;
let defaultGridLayout = false;
let defaultGridColumns = 4;
let defaultGridRows = 4;
let defaultShowGridText = true;
let defaultSeedType = "random";
let defaultSeedPeriod = 6;
let defaultBorderWidth = 3;
let defaultBorderBrightness = 128;
let defaultMainLayout = "pattern+rule";
let defaultModuleSorting = "lex";
let defaultRuleCompression = "none";
let defaultStartShape = "normal";
let ruleNames, patterns, currentPattern, globalSeed, name, helpString;
let globalToggles = [];
let seedChangeCount, errorCount = 0;
let preloadedStrings;
let preloadedCounter;
let preloadedColorStrings;
let animateColors = !true;
let animationPeriod = 100;
let animationLastStartMillis = 0;
let animationFrameCount = 0;
let staggered = true;
let extravverbose = true;
let saveAll = !true;
let saveAllGrids = !true;
let savePDF = true;
let varyRandom = !true;
let randomRules = !true;
let showBorder = !true;
let showShadow = !true;
let showBoundingBox = !true;
let showRuleModuleBorder = !true;
let markInactiveComponents = !true;
let takeSingleScreenshot = !true;
let takeAllScreenshots = !true;
let mainLayout = defaultMainLayout;
let moduleSorting;
let startShape;
let ruleCompression;
let showArrow = true;
let wrapping = true;
let showWrappingColumnLeft = !true;
let showWrappingColumnRight = !true;
let filterPeriodic = !true;
let filterSymmetric = !true;
let filterTotalistic = !true;
let filterPeriodTwo = !true;
let filterPeriodFour = !true;
let filterPeriodSix = !true;
let filterPersistent = !true;
let filterFewEquivalents = !true;
let filterOnePerEquivalenceClass = !true;
let filterClosed = !true;
let filterSemiClosed = !true;
let filterNotSemiClosed = !true;
let filterColorSplit = !true;
let filterNotColorSplit = !true;
let gridLayout = defaultGridLayout;
let fixedRuleModules = !true;
let comparisonLayout = !true;
let generatingAll = !true;
let showGridText = defaultShowGridText;
let directional = defaultDirectional;
let showPeriod = !true;
let periodColor;
let searching = !true;
let viewMode = 1;
let viewModes = 2;
let bRatio;
let beadRoundness = .3;
let beadSpacingW = .95;
let beadSpacingH = .95;
let borderWidth;
let borderBrightness;
let fullBoxX, fullBoxY, fullBoxW, fullBoxH;
let patternBoxX, patternBoxY, patternBoxW, patternBoxH;
let ruleBoxX, ruleBoxY, ruleBoxW, ruleBoxH;
let startArrayRule;
let ruleFromString;
let startTotalisticArrayRule;
let totalisticMode = !true;
let analysisThreshold = 5;
let altColorMode = !true;
let colorSets, customColorSet, currentColorSet;
let colorSetIndexFromURL;
let colorModulo;
let noColorSets;
let colorMapping, colorMappingActive;
let customColors = !true;
let customColorValuesFrom = [];
let customColorValuesTo = [];
let gridColumns = defaultGridColumns;
let gridRows = defaultGridRows;
let showCounters = !true;
let showPercentages = !true;
let columns, rows, colors;
let neighbors = 3;
let minColor = 2;
let maxColor = 6;
let seedType;
let seedPeriod = 6;
let periodLimit = 3;
let shortCode;
let shortStringDescription;
let stringDescription;
let numericRule, numberOfPatterns, font;
let ready = false;
let upwards = false;
let poppingNow = false;
let currentFill;
let canvas;
let visualStyle = defaultVisualStyle;
let showThread = !false;
let showRuleToggler = !true;
let analysisMode = true;
let ourMouseIsPressed = !true;
function initNames() {
  if (vverbose) console.log("initNames() start:");
  ruleNames = new Map();
  ruleNames.set(165, "Roots (L-R: Same 1 | Different 0)");
  ruleNames.set(90, "Roots (L-R: Same 0 | Different 1)");
  ruleNames.set(150, "Groovy Checkers");
  ruleNames.set(151, "Buds and Vines");
  ruleNames.set(22, "Buds and Vines");
  ruleNames.set(60, "Triangle Party (LA-: Same 0 | Different 1)");
  ruleNames.set(195, "Triangle Party (LA-: Same 1 | Different 0)");
  ruleNames.set(102, "Triangle Party (-AR: Same 0 | Different 1)");
  ruleNames.set(153, "Triangle Party (-AR: Same 1 | Different 0)");
  ruleNames.set(23, "Minority Wins");
  ruleNames.set(232, "Majority Wins");
  ruleNames.set(152, "Big Sails - 1 bit from Triangle Party");
  ruleNames.set(230, "Big Sails - 1 bit from Triangle Party");
  ruleNames.set(194, "Big Sails - 1 bit from Triangle Party");
  ruleNames.set(54, "Stained Glass");
  ruleNames.set(147, "Stained Glass");
  ruleNames.set(89, "Praying Mantis");
  ruleNames.set(101, "Praying Mantis");
  ruleNames.set(156, "Vertical Stripes with Triangles");
  ruleNames.set(198, "Vertical Stripes with Triangles");
  ruleNames.set(57, "Feather Stitch Stripe");
  ruleNames.set(99, "Feather Stitch Stripe");
  ruleNames.set(127, "Dot Arrays");
  ruleNames.set(1, "Dot Arrays");
  ruleNames.set(33, "Dot Arrays with Strands");
  ruleNames.set(123, "Dot Arrays with Strands");
  ruleNames.set(19, "(Dot Arrays with Crashing Diagonal Lines)");
  ruleNames.set(55, "(Dot Arrays with Crashing Diagonal Lines)");
  ruleNames.set(39, "(Dot Arrays with Single Diagonal Lines)");
  ruleNames.set(27, "(Dot Arrays with Single Diagonal Lines)");
  ruleNames.set(53, "(Dot Arrays with Single Diagonal Lines)");
  ruleNames.set(83, "(Dot Arrays with Single Diagonal Lines)");
  ruleNames.set(111, "(Eventually Dot Arrays - 1 bit from)");
  ruleNames.set(9, "(Eventually Dot Arrays - 1 bit from)");
  ruleNames.set(65, "(Eventually Dot Arrays - 1 bit from 1)");
  ruleNames.set(125, "(Eventually Dot Arrays - 1 bit from)");
  ruleNames.set(126, "(Eventually Dot Arrays - 1 bit from)");
  ruleNames.set(129, "(Eventually Dot Arrays - 1 bit from 1)");
  ruleNames.set(193, "(Eventually Dot Arrays - 2 bit from)");
  ruleNames.set(124, "(Eventually Dot Arrays - 2 bit from)");
  ruleNames.set(35, "(Eventually Horizontal Parallell Signals - 1 bit from)");
  ruleNames.set(59, "(Eventually Horizontal Parallell Signals - 1 bit from)");
  ruleNames.set(115, "(Eventually Horizontal Parallell Signals - 1 bit from)");
  ruleNames.set(105, "Picket Fence");
  ruleNames.set("[01101001]", "Picket Fence");
  ruleNames.set(108, "Vertical Stripes with Dot Arrays");
  ruleNames.set(201, "Vertical Stripes with Dot Arrays");
  ruleNames.set(73, "Vertical Stripes with Dot Arrays");
  ruleNames.set(109, "Vertical Stripes with Dot Arrays");
  ruleNames.set(51, "Horizontal Parallell Signals = Above Loses");
  ruleNames.set(204, "Vertical Stripes == Above Wins");
  ruleNames.set(76, "(Eventually Vertical Stripes - 1 bit from 204)");
  ruleNames.set(140, "(Eventually Vertical Stripes - 1 bit from 204)");
  ruleNames.set(236, "(Eventually Vertical Stripes - 1 bit from 204)");
  ruleNames.set(220, "(Eventually Vertical Stripes - 1 bit from 204)");
  ruleNames.set(196, "(Eventually Vertical Stripes - 1 bit from 204)");
  ruleNames.set(136, "(Eventually Vertical Stripes - 1 bit from 204)");
  ruleNames.set(206, "(Eventually Vertical Stripes - 1 bit from 204)");
  ruleNames.set(205, "(Eventually Vertical Stripes - 1 bit from 204)");
  ruleNames.set(200, "(Eventually Vertical Stripes - 1 bit from 204)");
  ruleNames.set(78, "(Eventually Vertical Stripes - 2 bit from 204)");
  ruleNames.set(68, "(Eventually Vertical Stripes - 2 bit from 204)");
  ruleNames.set(72, "(Eventually Vertical Stripes - 2 bit from 204)");
  ruleNames.set(12, "(Eventually Vertical Stripes - 2 bit from 204)");
  ruleNames.set(223, "(Single Straight Lines)");
  ruleNames.set(4, "(Single Straight Lines)");
  ruleNames.set(5, "(Eventually Single Straight Lines - 1 bit from 4)");
  ruleNames.set(222, "(Eventually Single Straight Lines - 1 bit from 223)");
  ruleNames.set(16, "(Single Diagonal Lines)");
  ruleNames.set(24, "(Single Diagonal Jagged Lines 1 - 1 bit from 16)");
  ruleNames.set(247, "(Single Diagonal Lines)");
  ruleNames.set(231, "(Single Diagonal Jagged Lines - 1 bit from 247)");
  ruleNames.set(2, "(Single Diagonal Lines)");
  ruleNames.set(66, "(Single Diagonal Jagged Lines - 1 bit from 2)");
  ruleNames.set(191, "(Single Diagonal Lines)");
  ruleNames.set(189, "(Single Diagonal Jagged Lines - 1 bit from 191)");
  ruleNames.set(
    6,
    "(Single Diagonal and Straight Lines - 1 bit from both 2 and 4)",
  );
  ruleNames.set(
    159,
    "(Single Diagonal and Straight Lines - 1 bit from both 223 and 191)",
  );
  ruleNames.set(226, "A Fight for Domination");
  ruleNames.set(184, "A Fight for Domination");
  ruleNames.set(18, "Crashing Diagonal Lines");
  ruleNames.set(183, "Crashing Diagonal Lines");
  ruleNames.set(
    146,
    "Crashing Diagonal Stripes - 1 bit from Crashing Diagonal Lines",
  );
  ruleNames.set(
    182,
    "Crashing Diagonal Stripes - 1 bit from Crashing Diagonal Lines",
  );
  ruleNames.set(0, "Mono");
  ruleNames.set(128, "(Eventually Mono - 1 bit from 0)");
  ruleNames.set(64, "(Eventually Mono - 1 bit from 0)");
  ruleNames.set(32, "(Eventually Mono - 1 bit from 0)");
  ruleNames.set(8, "(Eventually Mono - 1 bit from 0)");
  ruleNames.set(160, "(Eventually Mono - 2 bit from 0)");
  ruleNames.set(136, "(Eventually Mono - 2 bit from 0)");
  ruleNames.set(192, "(Eventually Mono - 2 bit from 0)");
  ruleNames.set(96, "(Eventually Mono - 2 bit from 0)");
  ruleNames.set(224, "(Eventually Mono - 3 bit from 0)");
  ruleNames.set(255, "Mono");
  ruleNames.set(254, "(Eventually Mono - 1 bit from 255)");
  ruleNames.set(253, "(Eventually Mono - 1 bit from 255)");
  ruleNames.set(251, "(Eventually Mono - 1 bit from 255)");
  ruleNames.set(239, "(Eventually Mono - 1 bit from 255)");
  ruleNames.set(250, "(Eventually Mono - 2 bit from 255)");
  ruleNames.set(238, "(Eventually Mono - 2 bit from 0");
  ruleNames.set(252, "(Eventually Mono - 2 bit from 255)");
  ruleNames.set(249, "(Eventually Mono - 2 bit from 255)");
  ruleNames.set(248, "(Eventually Mono - 3 bit from 255)");
  ruleNames.set(240, "Left Wins");
  ruleNames.set(15, "Left Loses");
  ruleNames.set(170, "Right Wins");
  ruleNames.set(85, "Right Loses");
  if (vverbose) console.log("  => end initNames()");
}
let visualStyles = [
  [0, "bead", "Bead"],
  [1, "hexagons", "Hexagons"],
  [2, "rectangles", "Rectangles"],
  [3, "squares", "Squares"],
  [4, "scales", "Scales"],
  [5, "diamonds", "Diamonds"],
  [6, "realistic", "Realistic"],
  [7, "apples", "Apple cores"],
];
let noVisualStyles = visualStyles.length;
function getVisualStyleNumber(n) {
  for (let s of visualStyles) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[0];
  }
  return 0;
}
function getVisualStyleShortString(n) {
  if (vverbose) console.log("getVisualStyleShortString: " + n);
  for (let s of visualStyles) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[1];
  }
  return defaultVisualStyle;
}
function getVisualStyleLongString(n) {
  for (let s of visualStyles) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[2];
  }
  return defaultVisualStyle;
}
let seedTypes = [
  [0, "random", "Random"],
  [1, "single", "Single One"],
  [2, "random-symmetric", "Random Symmetric"],
  [3, "bands", "Bands"],
  [4, "all-zero", "All Zero"],
  [5, "periodic", "Periodic"],
  [6, "all-one", "All One"],
  [7, "explicit", "Explicit"],
  [8, "periodic-explicit", "Periodic Explicit"],
];
function getSeedTypeNumber(n) {
  for (let s of seedTypes) if (s[0] == n || s[1] == n || s[2] == n) return s[0];
  return 0;
}
function getSeedTypeShortString(n) {
  for (let s of seedTypes) if (s[0] == n || s[1] == n || s[2] == n) return s[1];
  return "random";
}
function getSeedTypeLongString(n) {
  for (let s of seedTypes) if (s[0] == n || s[1] == n || s[2] == n) return s[2];
  return "Random";
}
let mainLayouts = [[0, "pattern+rule", "Pattern and rule"], [
  1,
  "pattern",
  "Pattern only",
], [2, "rule", "Rule only"]];
function getMainLayoutNumber(n) {
  for (let s of mainLayouts) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[0];
  }
  return 0;
}
function getMainLayoutShortString(n) {
  for (let s of mainLayouts) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[1];
  }
  return mainLayouts[0][1];
}
function getMainLayoutLongString(n) {
  for (let s of mainLayouts) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[2];
  }
  return mainLayouts[0][2];
}
function nextMainLayout() {
  let currentNumber = getMainLayoutNumber(mainLayout);
  let nextNumber = (currentNumber + 1) % mainLayouts.length;
  let nextLayout = getMainLayoutLongString(nextNumber);
  return nextLayout;
}
let startShapes = [[0, "normal", "Normal"], [
  2,
  "acuteright",
  "Acute right",
]];
function getStartShapeNumber(n) {
  for (let s of startShapes) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[0];
  }
  return 0;
}
function getStartShapeShortString(n) {
  for (let s of startShapes) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[1];
  }
  return startShapes[0][1];
}
function getStartShapeLongString(n) {
  for (let s of startShapes) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[2];
  }
  return startShapes[0][2];
}
let moduleSortings = [
  [0, "lex", "Lexicographical"],
  [1, "multiset", "Multiset priority"],
  [2, "compression", "Compression priority"],
  [3, "totalistic", "Total value priority"],
  [4, "majoritycount", "Majority color count priority"],
  [5, "output", "Output"],
];
function getModuleSortingNumber(n) {
  for (let s of moduleSortings) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[0];
  }
  return 0;
}
function getModuleSortingShortString(n) {
  for (let s of moduleSortings) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[1];
  }
  return moduleSortings[0][1];
}
function getModuleSortingLongString(n) {
  for (let s of moduleSortings) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[2];
  }
  return moduleSortings[0][2];
}
let ruleCompressions = [
  [0, "none", "None"],
  [1, "onlywildcard", "Only Wildcard Compression"],
  [2, "onlyone", "Only One Compression"],
  [3, "onlymultiset", "Only Multiset Compression"],
  [4, "onlyfullmultiset", "Only Full Multiset Compression"],
  [5, "onlytotalistic", "Only Totalistic Compression"],
  [6, "findsame", "Find-Same Compression"],
  [7, "max", "Maximal Compression"],
];
function getRuleCompressionNumber(n) {
  for (let s of ruleCompressions) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[0];
  }
  return 0;
}
function getRuleCompressionShortString(n) {
  for (let s of ruleCompressions) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[1];
  }
  return ruleCompressions[0][1];
}
function getRuleCompressionLongString(n) {
  for (let s of ruleCompressions) {
    if (s[0] == n || s[1] == n || s[2] == n) return s[2];
  }
  return ruleCompressions[0][2];
}
class CoverSearch {
  constructor(items) {
    this.items = items;
    this.options = this.defineOptions(items);
    if (vverbose) console.log(this.options);
    this.numberOfOptions = 0;
    this.counter = 0;
    this.items.sort();
    this.addItems(this.items);
    this.options.sort((a, b) => a.length < b.length).map(
      (option) => this.addOption(option),
    );
    this.solutionCounter = 0;
    this.selectedSolution = 0;
    this.bestSolutionLength = items.length;
    this.currentSolution = [];
    this.solutions = [];
    this.findallsolutions();
    if (vverbose) {
      console.log(
        "Found " + this.solutions.length + " solutions with " +
          this.bestSolutionLength + " items.",
      );
    }
    if (verbose) this.printSolutions();
  }
  defineOptions(items) {
    const N = colors;
    let options = [];
    for (let n = 0; n < N; n++) {
      let domain = items.filter((x) => x[3] == n);
      if (vverbose) {
        console.log(
          "  There are " + domain.length + " items with output " + n + ": " +
            stringit(domain),
        );
      }
      let currentOptions = domain.map(
        (x) =>
          x.substr(0, 3).split("").join("·") + "→" + x.substr(3, 1) + ":" + x,
      );
      if (vverbose) {
        console.log(
          "    Starting with " + currentOptions.length + " singleton options.",
        );
      }
      options = options.concat(currentOptions);
      while (currentOptions.length > 0) {
        let candidateOptions = currentOptions.flatMap(
          (option) => this.extendOption(option, domain, N),
        );
        currentOptions = [...new Set(candidateOptions)];
        options = options.concat(currentOptions);
        if (vverbose) {
          console.log(
            "      Checking " + candidateOptions.length + " => adding " +
              currentOptions.length + " => " + options.length + " options.",
          );
        }
      }
      let groups = groupBy(
        domain,
        (x) => x.substr(0, 3).split("").sort().join("") + x.substr(3, 4),
      );
      if (vverbose) console.log("groups");
      if (vverbose) console.log(groups);
      let filteredGroups = Object.entries(groups).filter(
        ([a, b]) =>
          new Set(a.substring(0, 3)).size === 2 && new Set(b).size === 3 ||
          new Set(a.substring(0, 3)).size === 3 && new Set(b).size === 6,
      );
      if (vverbose) console.log("filteredGroups");
      if (vverbose) console.log(filteredGroups);
      let multisetOptions = filteredGroups.map(
        ([x, b]) =>
          "{" + x.substring(0, 3) + "}" + "→" + x.substring(3, 1) + ":" +
          b.join("-"),
      );
      options = options.concat(multisetOptions);
    }
    if (vverbose) {
      console.log(
        "Defined " + options.length + " options: " + stringit(options),
      );
    }
    if (vverbose) console.log(options);
    return options;
  }
  extendOption(option, domain) {
    let result = [];
    let optionName = option.split(":")[0];
    let optionParts = option.split(":")[1].split("-");
    if (verbose) console.log("      Finding extensions of " + stringit(option));
    let lastitem = optionParts[optionParts.length - 1];
    for (let i = 0; i < 3; i++) {
      for (
        let largerValue = +lastitem[i] + 1; largerValue < colors; largerValue++
      ) {
        let nextItems = optionParts.map(
          (item) => this.replace(item, i, largerValue),
        );
        nextItems = [...new Set(nextItems)];
        if (verbose) {
          console.log(
            "            Result of applying change to all elements of option: " +
              stringit(nextItems),
          );
        }
        if (!nextItems.every((x) => domain.includes(x))) {
          if (verbose) {
            console.log(
              "              ... contains element not in the domain.",
            );
          }
          continue;
        }
        let candidate = [...new Set(optionParts.concat(nextItems).sort())].join(
          "-",
        );
        let args = optionName.split("→")[0].split("·");
        args[i] = args[i] + largerValue;
        let name = args.join("·") + "→" + optionName.split("→")[1];
        candidate = name + ":" + candidate;
        if (verbose) {
          console.log(
            "              Adding candidate " + stringit(candidate) + ".",
          );
        }
        result.push(candidate);
        if (verbose) {
          console.log(
            "              Result now has " + result.length + " options.",
          );
        }
      }
    }
    if (verbose) {
      console.log(
        "            Returning " + result.length + " options: " +
          stringit(result),
      );
    }
    return result;
  }
  findPermutations(option) {
    return stringPermutations(option);
  }
  stringPermutations = (str) => {
    if (str.length <= 2) {
      return str.length === 2
        ? [str, str[1] + str[0]]
        : [str];
    }
    return str.split("").reduce(
      (acc, letter, i) =>
        acc.concat(
          stringPermutations(str.slice(0, i) + str.slice(i + 1)).map((val) =>
            letter + val),
        ),
      [],
    );
  };
  stringit(A) {
    if (typeof A === "string") return A;
    return "[" + A.map((x) => {
      if (Array.isArray(x)) return stringit(x);
      else return str(x);
    }).join(" ") + "]";
  }
  replace(str, index, char) {
    return str.substr(0, index) + char + str.substr(index + 1);
  }
  addItems(strings) {
    if (vverbose) console.log("  Adding items:  " + strings);
    this.header = new Node(-1, -1, "");
    this.nodes = [];
    this.nodes.push(this.header);
    this.header.leftmost = true;
    if (typeof str === "string") strings = strings.split(" ");
    strings.map((name, column) => this.nodes.push(new Node(column, -1, name)));
    this.nodes[this.nodes.length - 1].rightmost = true;
    for (let n = 1; n < this.nodes.length; n++) {
      let node = this.nodes[n];
      let left = this.nodes[n - 1];
      let right = this.nodes[(n + 1) % this.nodes.length];
      node.right = right;
      left.right = node;
      node.left = left;
      right.left = node;
    }
  }
  findallsolutions(k = 0) {
    this.counter++;
    if (this.header.right == this.header) this.registerSolution(k);
    else if (k < this.bestSolutionLength && this.counter < 1e6) {
      let column = this.header.right;
      let branching = column.length;
      let candidate = column.right;
      while (candidate !== this.header) {
        if (candidate.length < branching) {
          branching = candidate.length;
          column = candidate;
        }
        candidate = candidate.right;
      }
      if (verbose) console.log("cover " + column.name);
      this.cover(column);
      let down = column.down;
      if (verbose) {
        console.log(
          " starting with row = " + down.row + " (level = " + k + ")",
        );
      }
      while (down != column) {
        this.currentSolution[k] = down;
        let right = down.right;
        while (right != down) {
          if (verbose) console.log("  cover " + right.columnobject.name);
          this.cover(right.columnobject);
          right = right.right;
        }
        if (verbose) console.log("   this.findallsolutions " + (k + 1));
        this.findallsolutions(k + 1);
        if (verbose) console.log("   => continuing");
        down = this.currentSolution[k];
        column = down.columnobject;
        let left = down.left;
        while (left != down) {
          if (verbose) console.log("  uncover " + left.columnobject.name);
          this.uncover(left.columnobject);
          left = left.left;
        }
        down = down.down;
        if (verbose) console.log(" going to the next row = " + down.row);
      }
      if (verbose) console.log("uncover " + column.name);
      this.uncover(column);
    }
  }
  registerSolution(K) {
    this.solutionCounter++;
    if (K < this.bestSolutionLength) {
      this.bestSolutionLength = K;
      this.solutions = [];
      let result = this.solutionToString(K);
      this.solutions.push(result);
      if (vverbose) {
        console.log(
          "--- Solutions with " + this.bestSolutionLength + " items:",
        );
      }
      if (vverbose) {
        console.log(
          "[" + this.solutions.length + "] K=" + this.bestSolutionLength +
            ": " + result,
        );
      }
    } else if (K == this.bestSolutionLength) {
      let result = this.solutionToString(K);
      this.solutions.push(result);
      if (vverbose) {
        console.log(
          "[" + this.solutions.length + "] K=" + this.bestSolutionLength +
            ": " + result,
        );
      }
    }
  }
  solutionToString(K) {
    let result = "";
    for (let k = 0; k < K; k++) {
      let node = this.currentSolution[k];
      result += node.name + ":";
      result += node.columnobject.name;
      let right = node.right;
      while (right != node) {
        result += "-";
        result += right.columnobject.name;
        right = right.right;
      }
      result += " | ";
    }
    result = result.slice(0, -3);
    return result;
  }
  cover(node) {
    this.unlinkLeftRight(node);
    let down = node.down;
    while (down != node) {
      let right = down.right;
      while (right != down) {
        this.unlinkUpDown(right);
        right.columnobject.length -= 1;
        right = right.right;
      }
      down = down.down;
    }
  }
  uncover(node) {
    let up = node.up;
    while (up != node) {
      let left = up.left;
      while (left != up) {
        left.columnobject.length += 1;
        this.linkUpDown(left);
        left = left.left;
      }
      up = up.up;
      this.linkUpDown(up);
    }
    this.linkLeftRight(node);
  }
  unlinkLeftRight(node) {
    node.alive = !true;
    node.right.left = node.left;
    node.left.right = node.right;
  }
  linkLeftRight(node) {
    node.alive = true;
    node.left.right = node;
    node.right.left = node;
  }
  unlinkUpDown(node) {
    node.alive = !true;
    node.down.up = node.up;
    node.up.down = node.down;
  }
  linkUpDown(node) {
    node.alive = true;
    node.up.down = node;
    node.down.up = node;
  }
  printSolutions() {
    let counter = 0;
    let result = "";
    for (let solution of this.solutions) {
      let parts = solution.split(" | ");
      result += "[" + counter + "]: ";
      for (let part of parts) result += part.split(":")[0] + " | ";
      result = result.slice(0, -3);
      result += "\n";
      counter++;
    }
    if (vverbose) console.log(result);
  }
  addOption(option) {
    if (vverbose) console.log("  Adding option: " + option);
    let optionName, items;
    if (typeof option === "string") {
      if (option.includes(":")) {
        optionName = option.split(":")[0];
        option = option.split(":")[1].split("-");
      }
    }
    items = option.map((name) => this.getNodeByName(name));
    if (items.includes(false)) {
      if (vverbose) console.log("... ignored (contains non-item)");
      errorMode = true;
      return;
    }
    this.newNodes = [];
    let column = 0;
    for (let node of items) {
      let newNode = new Node(column++, this.numberOfOptions, optionName);
      node.up.down = newNode;
      newNode.up = node.up;
      node.up = newNode;
      newNode.down = node;
      newNode.columnobject = node;
      node.length += 1;
      this.newNodes.push(newNode);
    }
    for (let n = 0; n < this.newNodes.length; n++) {
      let node = this.newNodes[n];
      let left =
        this.newNodes[(n + this.newNodes.length - 1) % this.newNodes.length];
      let right = this.newNodes[(n + 1) % this.newNodes.length];
      node.right = right;
      left.right = node;
      node.left = left;
      right.left = node;
      if (n == 0) node.leftmost = true;
      if (n == this.newNodes.length - 1) node.rightmost = true;
    }
    this.numberOfOptions++;
    this.nodes.push(...this.newNodes);
  }
  getNodeByName(name) {
    for (let node of this.nodes) if (name == node.name) return node;
    return false;
  }
}
class Node {
  constructor(column, row, name) {
    this.left = this;
    this.right = this;
    this.up = this;
    this.down = this;
    this.columnobject = this;
    this.row = row;
    this.leftmost = !true;
    this.rightmost = !true;
    this.highlighted = !true;
    this.alive = true;
    this.column = column;
    this.name = name;
    this.length = 0;
  }
  show() {
    let start = this;
    while (start.leftmost == !true) start = start.left;
    stroke(0);
    strokeWeight(cellSize * .002);
    if (
      this.currentSolution.includes(start) &&
      this.currentSolution.indexOf(start) < search.k
    ) fill(0, 200, 200, 100);
    else if (this.alive) fill(255);
    else noFill();
    rectMode(CENTER);
    rect(this.cx, this.cy, this.d);
    if (this.row == search.row && search.row != -1) {
      noStroke();
      fill(0, 200, 200, 100);
      ellipse(this.cx, this.cy, this.d * .1);
    }
    if (this.alive) fill(0);
    else noFill();
    noStroke();
    ellipse(this.ulx, this.uly, dotRatio * this.d);
    ellipse(this.urx, this.ury, dotRatio * this.d);
    ellipse(this.dlx, this.dly, dotRatio * this.d);
    ellipse(this.drx, this.dry, dotRatio * this.d);
    ellipse(this.lux, this.luy, dotRatio * this.d);
    ellipse(this.ldx, this.ldy, dotRatio * this.d);
    ellipse(this.rux, this.ruy, dotRatio * this.d);
    ellipse(this.rdx, this.rdy, dotRatio * this.d);
    noStroke();
    fill(this.alive ? 0 : 60);
    textSize(this.d * .3);
    textAlign(CENTER, CENTER);
    textFont(font);
    text(this.name, this.cx, this.cy);
  }
  showArrows() {
    if (this.right == this.header || this.rightmost || this.right == this) {
      drawHalfArrow(this.rux, this.ruy, true, 1, -0, 0, this.d * .34);
      drawHalfArrow(
        this.right.lux,
        this.right.luy,
        !true,
        -1,
        -0,
        PI,
        this.d * .34,
      );
    } else drawArrow(this.rux, this.ruy, this.right.lux, this.right.luy, -.02);
    if (this == this.header || this.leftmost || this.left == this) {
      drawHalfArrow(this.ldx, this.ldy, true, 1, -0, PI, this.d * .34);
      drawHalfArrow(
        this.left.rdx,
        this.left.ldy,
        !true,
        -1,
        -0,
        0,
        this.d * .34,
      );
    } else drawArrow(this.ldx, this.ldy, this.left.rdx, this.left.rdy, -.02);
    if (this.down.row == -1) {
      drawHalfArrow(this.drx, this.dry, true, 1, -0, PI / 2, this.d * .34);
      drawHalfArrow(
        this.down.urx,
        this.down.ury,
        !true,
        -1,
        -0,
        -PI / 2,
        this.d * .34,
      );
    } else drawArrow(this.drx, this.dry, this.down.urx, this.down.ury, -.02);
    if (this.columnobject == this) {
      drawHalfArrow(this.ulx, this.uly, true, 1, -0, -PI / 2, this.d * .34);
      drawHalfArrow(
        this.up.dlx,
        this.up.dly,
        !true,
        -1,
        -0,
        PI / 2,
        this.d * .34,
      );
    } else drawArrow(this.ulx, this.uly, this.up.dlx, this.up.dly, -.02);
  }
}
window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("keydown", function (e) {
    if (e.key == "PageDown" || e.key == "PageUp") e.preventDefault();
  });
  document.querySelectorAll(".rantonse-button > *").forEach((b) => {
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
    });
  });
  document.querySelectorAll(".rantonse-button").forEach((b) => {
    if (b.classList.contains("closed")) {
      b.nextElementSibling.classList.add("hidden");
    }
    b.addEventListener("click", (e) => {
      let panel = e.target.nextElementSibling;
      if (
        panel.classList.contains("block") || !panel.classList.contains("hidden")
      ) {
        b.classList.remove("open");
        b.classList.add("closed");
        panel.classList.add("hidden");
      } else {
        b.classList.remove("closed");
        b.classList.add("open");
        panel.classList.remove("hidden");
      }
    });
  });
});
window.addEventListener("popstate", popFunction, false);
window.addEventListener("wheel", (e) => {
  mouseWheeled(e);
});
window.addEventListener("keydown", function (e) {
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) e.preventDefault();
}, false);
function popFunction() {
  if (verbose) console.log("===> popFunction");
  poppingNow = true;
  setParametersFromURL();
  createColorsets(colorSetIndexFromURL);
  updateVisualStyle();
  initSize();
  if (seedType !== "explicit" && seedType !== "periodic-explicit") {
    randomizeGlobalSeed();
  }
  initializePatternsAndDraw();
  poppingNow = false;
}
function setUpViewportFix() {
  function updateRealViewportDimensions() {
    document.documentElement.style.setProperty(
      "--maxvh",
      window.innerHeight + "px",
    );
  }
  updateRealViewportDimensions();
  const eventTypes = [
    "scroll",
    "resize",
    "fullscreenchange",
    "fullscreenerror",
    "touchcancel",
    "touchend",
    "touchmove",
    "touchstart",
    "mozbrowserscroll",
    "mozbrowserscrollareachanged",
    "mozbrowserscrollviewchange",
    "mozbrowserresize",
    "MozScrolledAreaChanged",
    "mozbrowserresize",
    "orientationchange",
  ];
  eventTypes.forEach(function (type) {
    window.addEventListener(type, (event) => updateRealViewportDimensions());
  });
}
function isMobile() {
  let mobile = false;
  if ("maxTouchPoints" in navigator) mobile = navigator.maxTouchPoints > 0;
  else if ("msMaxTouchPoints" in navigator) {
    mobile = navigator.msMaxTouchPoints > 0;
  } else {
    var mQ = window.matchMedia && matchMedia("(pointer:coarse)");
    if (mQ && mQ.media === "(pointer:coarse)") mobile = !!mQ.matches;
    else if ("orientation" in window) mobile = true;
    else {
      var UA = navigator.userAgent;
      mobile = /\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
        /\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
    }
  }
  return mobile;
}
let extraOnSides = 0;
function periodRange(wOff, hOff, cW, cH, fromRow, toRow, hOffset, leftSide) {
  line(
    wOff + (leftSide ? -1 : 1) * extraOnSides * cW,
    hOff + ((staggered ? hOffset : 0) + fromRow) * (staggered ? .5 : 1) * cH,
    wOff + (leftSide ? -1 : 1) * extraOnSides * cW,
    hOff + ((staggered ? hOffset : 0) + toRow) * (staggered ? .5 : 1) * cH,
  );
}
function periodText(
  wOff,
  hOff,
  cW,
  cH,
  fromRow,
  toRow,
  period,
  hOffset,
  leftSide,
) {
  if (vverbose) console.log("periodText: " + period);
  if (leftSide) textAlign(RIGHT, CENTER);
  else textAlign(LEFT, CENTER);
  textSize(20);
  fill(0);
  noStroke();
  let hStart = hOff +
    ((staggered ? hOffset : 0) + fromRow) * (staggered ? .5 : 1) * cH;
  let hEnd = hOff +
    ((staggered ? hOffset : 0) + toRow) * (staggered ? .5 : 1) * cH;
  let hMid = hStart + (hEnd - hStart) / 2;
  text(str(period), wOff + .2 * (leftSide ? -1 : 1) * cW, hMid);
}
function periodMark(wOff, hOff, cW, cH, fromRow) {
  if (staggered) {
    let maxC = columns + (showWrappingColumnRight ? 1 : 0) +
      (showWrappingColumnLeft ? 1 : 0);
    for (let c = 0; c < maxC; c++) {
      line(
        wOff + c * cW,
        hOff + ((showWrappingColumnLeft ? c + 1 : c) % 2 + fromRow) * .5 * cH,
        wOff + (1 + c) * cW,
        hOff + ((showWrappingColumnLeft ? c + 1 : c) % 2 + fromRow) * .5 * cH,
      );
      if (c < maxC - 1) {
        if ((c + 2) % 2 == 0) {
          line(
            wOff + (1 + c) * cW,
            hOff + (0 + fromRow) * .5 * cH,
            wOff + (1 + c) * cW,
            hOff + (1 + fromRow) * .5 * cH,
          );
        } else {line(
            wOff + (1 + c) * cW,
            hOff + (0 + fromRow) * .5 * cH,
            wOff + (1 + c) * cW,
            hOff + (1 + fromRow) * .5 * cH,
          );}
      }
    }
  } else {line(
      wOff + 0 * cW,
      hOff + (fromRow - 0) * 1 * cH,
      wOff +
        (columns + (showWrappingColumnLeft ? 1 : 0) +
            (showWrappingColumnRight ? 1 : 0) + 0) * cW,
      hOff + (fromRow - 0) * 1 * cH,
    );}
}
function showRulePicker() {
  let w = 200;
  let h = 200;
  let cW = .7 * (w / 3);
  let cH = cW / bRatio;
  let hOff = (h - cH * 2) / 2;
  let wOff = (w - cW * 3) / 2;
  let c = 1;
  let r = 1;
  let tx = wOff + c * cW;
  let ty = hOff + r * (staggered ? .5 : c % 2 == 0 ? 0 : .5) * cH;
  let bx = tx + .5 * cW;
  let by = ty + .5 * cH;
  let bW = cW * beadSpacingW;
  let bH = cH * beadSpacingH;
  stroke(0, 36, 182);
  strokeWeight(cW * .02);
  setColor(1, 0, 0);
  bead(bx, by, bW, bH, bW * beadRoundness);
}
function bead(x, y, w, h, roundness, row) {
  push();
  translate(x, y);
  if (visualStyle === "hexagons") drawHex(0, 0, w, h, roundness, row);
  else if (visualStyle === "apples") drawApples(0, 0, w, h, roundness, row);
  else if (visualStyle === "scales") drawScale(0, 0, w, h, roundness, row);
  else if (visualStyle === "diamonds") drawDiamond(0, 0, w, h, roundness, row);
  else if (visualStyle === "realistic") {
    drawNiceBead(0, 0, w, h, roundness, row);
  } else {
    rectMode(CENTER);
    rect(-.1, -.1, w + .2, h + .2, roundness);
    rectMode(CORNER);
  }
  if (showBoundingBox) {
    stroke(0, 255, 255);
    noFill();
    strokeWeight(1);
    rect(-w / 2, -h / 2, w, h);
  }
  pop();
}
function drawNiceBead(x, y, w, h, roundness, row) {
  rectMode(CENTER);
  noStroke();
  rect(0, 0, w + .2, h + .2, roundness);
  noFill();
  let N = 10;
  for (let n = 0; n < N; n++) {
    stroke(80, map(n, 0, N, 100, 0));
    strokeWeight(w * borderWidth * map(n, 0, N, .01, .05));
    let inset = w * map(n, 0, N, .01, .3);
    rect(0, 0, w - inset, h - inset, roundness);
  }
  rectMode(CORNER);
}
function drawHex(x, y, w, h, roundness, row) {
  beginShape();
  if (staggered) {
    let xOff = w / 3;
    vertex(xOff, -h / 2);
    vertex(2 * xOff, 0);
    vertex(xOff, h / 2);
    vertex(-xOff, h / 2);
    vertex(-2 * xOff, 0);
    vertex(-xOff, -h / 2);
  } else {
    let xOff = w / 3;
    let dirt = directional && row % 2 == 0 ? -1 : 1;
    vertex(dirt * (-xOff / 2 + 2 * xOff), -h / 2);
    vertex(dirt * (-xOff / 2 + xOff), 0);
    vertex(dirt * (-xOff / 2 + 2 * xOff), h / 2);
    vertex(dirt * (-xOff / 2 + -xOff), h / 2);
    vertex(dirt * (-xOff / 2 + -2 * xOff), 0);
    vertex(dirt * (-xOff / 2 + -xOff), -h / 2);
  }
  endShape(CLOSE);
}
function drawApples(x, y, w, h, roundness, row) {
  let C = .551915024494;
  let D = staggered ? 2 * h * sqrt(3) / 3 : h * sqrt(2);
  ellipse(0, 0, D, D);
}
function drawScale(x, y, w, h, roundness, row) {
  let C = .551915024494;
  if (staggered) {
    beginShape();
    vertex(-w, 0);
    bezierVertex(-w, h * C, -w * C, h, 0, h);
    bezierVertex(w * C, h, w, h * C, w, 0);
    bezierVertex(w * (1 - C), 0, 0, -h * (1 - C), 0, -h);
    bezierVertex(0, -h * (1 - C), -w * (1 - C), 0, -w, 0);
    endShape(CLOSE);
  } else {
    beginShape();
    vertex(w / 2, -h / 2);
    bezierVertex(w / 2, -h / 2, w / 2, h / 2, w / 2, h / 2);
    bezierVertex(w / 2, (1 + C) * h / 2, C * w / 2, h, 0, h);
    bezierVertex(-C * w / 2, h, -w / 2, (1 + C) * h / 2, -w / 2, h / 2);
    bezierVertex(-w / 2, h / 2, -w / 2, -h / 2, -w / 2, -h / 2);
    bezierVertex(-w / 2, (-1 + C) * h / 2, -C * w / 2, 0, 0, 0);
    bezierVertex(C * w / 2, 0, w / 2, -h / 2 + C * h / 2, w / 2, -h / 2);
    endShape(CLOSE);
  }
}
function drawDiamond(x, y, w, h, roundness, row) {
  if (staggered) {
    beginShape();
    vertex(-w, 0);
    vertex(0, h);
    vertex(w, 0);
    vertex(0, -h);
    endShape(CLOSE);
  } else {
    rectMode(CENTER);
    rect(-.1, -.1, w + .2, h + .2, roundness);
    rectMode(CORNER);
  }
}
function rulebead(x, y, w, h, roundness, row) {
  push();
  translate(x, y);
  rectMode(CENTER);
  rect(0, 0, w, h, roundness);
  rectMode(CORNER);
  pop();
}
function rulebeadPart(N, total, x, y, w, h, roundness, row) {
  let unitH = h / total;
  push();
  translate(x - w / 2, y - h / 2);
  rect(0, N * unitH, w, unitH, .5 * roundness);
  pop();
}
function inBead(mx, my, x, y, w, h) {
  return x - w / 2 <= mx && mx <= x + w / 2 && y - h / 2 <= my &&
    my <= y + h / 2;
}
let guiInitialized = false;
let checkboxAlternatingColors;
let checkboxShowPeriod;
let checkboxShowBorder;
let checkboxShowCounters;
let checkboxShowPercentage, showPercentageDiv;
let checkboxMarkInactive;
let checkboxFixedRuleModules;
let checkboxDirectional;
let checkboxStaggered;
let checkboxWrapping;
let checkboxUpwards;
let checkboxThread;
let checkboxArrow;
let checkboxShowWrappingColumnLeft;
let checkboxShowWrappingColumnRight;
let checkboxGridLayout;
let checkboxTotalisticMode;
let checkboxSymmetricFilter;
let checkboxTotalisticFilter;
let checkboxPeriodTwoFilter;
let checkboxPeriodFourFilter;
let checkboxPeriodSixFilter;
let checkboxPersistentFilter;
let checkboxNoEquivalentsFilter;
let checkboxOnePerEquivalenceClassFilter;
let checkboxClosedFilter;
let checkboxSemiClosedFilter;
let checkboxNotSemiClosedFilter;
let checkboxColorSplitFilter;
let checkboxNotColorSplitFilter;
let checkboxAnimateColors;
let checkboxShowGridText;
let sliderColumns, sliderColumnsValue, sliderColumnsP;
let sliderRows, sliderRowsValue, sliderRowsP;
let sliderColors, sliderColorsSpan, sliderColorsP;
let sliderSeedPeriod, sliderSeedPeriodValue, sliderSeedPeriodOptions;
let inputShortCode;
let modalShortCode;
let selectSeed, selectSeedSpan;
let selectColorScheme, selectColorSchemeSpan;
let selectVisualStyle, selectVisualStyleSpan;
let selectMainLayout, selectMainLayoutDiv;
let selectModuleSorting, selectModuleSortingDiv;
let selectRuleCompression, selectRuleCompressionDiv;
let selectStartShape, selectStartShapeDiv;
let colorPicker0from,
  colorPicker1from,
  colorPicker2from,
  colorPicker3from,
  colorPicker4from,
  colorPicker5from;
let colorPicker0to,
  colorPicker1to,
  colorPicker2to,
  colorPicker3to,
  colorPicker4to,
  colorPicker5to;
let buttonRandom;
let buttonRandomSeed;
let buttonRandomize;
let buttonAdvanceByTwo;
let buttonAdvanceByTwenty;
let buttonRuleExpand;
let buttonClearErrors;
let buttonPatternDiv, buttonRuleDiv;
let buttonResetFilters;
let headingAdvanced;
let headingModes;
let headingFilters;
let headingVisuals;
let headingRules;
let sliderBeadRoundness,
  sliderBeadRoundnessValue,
  sliderBeadRoundnessSpan,
  sliderBeadRoundnessP;
let sliderBeadSpacingW,
  sliderBeadSpacingWValue,
  sliderBeadSpacingWSpan,
  sliderBeadSpacingWP;
let sliderBeadSpacingH,
  sliderBeadSpacingHValue,
  sliderBeadSpacingHSpan,
  sliderBeadSpacingHP;
let sliderBratioP,
  sliderBratioValue,
  sliderBratioPValue,
  sliderBratioSpan,
  sliderBratio;
let sliderModulo, sliderModuloValue, sliderModuloRange, sliderModuloDiv;
let sliderColorPermutation, sliderColorPermutationP, sliderColorPermutationSpan;
let sliderBorderWidthP, sliderBorderWidthSpan;
let sliderBorderBrightnessP, sliderBorderBrightnessSpan;
let sliderLayoutColumns,
  sliderLayoutRows,
  sliderLayoutColumnsValue,
  sliderLayoutRowsValue;
let gridLayoutDiv;
let borderOptions;
let sliderBorderWidth, sliderBorderWidthValue;
let sliderBorderBrightness, sliderBorderBrightnessValue;
let colorSchemeCanvas;
let colorSchemeCanvasWidth = 250;
let colorSchemeCanvasHeight = 60;
let colorSchemeCanvasHeightFull = colorSchemeCanvasHeight;
let colorSchemeCanvasHeightHalf = colorSchemeCanvasHeight / 2;
let statusLineTop;
function initalizeGui() {
  if (vverbose) console.log("initalizeGui() start:");
  statusLineTop = select("#statusLineTop");
  statusLineTop.elt.addEventListener("click", (e) => {
    preloadedCounter = undefined;
    statusLineTop.elt.innerHTML = "";
    draw(false);
  });
  inputShortCode = select("#shortCode");
  modalShortCode = select("#modalShortCode");
  modalShortCode.elt.addEventListener("change", (e) => {
    if (modalShortCode.elt.checked) {
      inputShortCode.elt.value = "";
      inputShortCode.elt.focus();
    }
  });
  for (let radio of selectAll("input[name='radioColors']")) {
    if (radio.elt.dataset.colors == colors) radio.elt.checked = true;
    else radio.elt.checked = !true;
    radio.elt.addEventListener("click", (e) => {
      setColors(e.target.dataset.colors);
    });
  }
  sliderColumnsValue = select("#columnsValue");
  sliderColumns = select("#sliderColumnRange");
  sliderColumns.input(toggleSliderColumns);
  sliderRowsValue = select("#rowsValue");
  sliderRows = select("#sliderRowRange");
  sliderRows.input(toggleSliderRows);
  buttonRandom = select("#buttonRandom");
  buttonRandom.mousePressed(toggleRandom);
  buttonRandomSeed = select("#buttonRandomSeed");
  buttonRandomSeed.mousePressed(toggleRandomSeed);
  selectSeed = select("#selectSeed");
  for (let s of seedTypes) selectSeed.option(s[2], s[2]);
  selectSeed.changed(toggleSelectSeed);
  sliderSeedPeriodOptions = select("#sliderSeedPeriodOptions");
  sliderSeedPeriod = select("#sliderSeedPeriod");
  sliderSeedPeriodValue = select("#sliderSeedPeriodValue");
  sliderSeedPeriod.input(toggleSliderSeedPeriod);
  checkboxStaggered = select("#checkboxStaggered");
  checkboxStaggered.changed(toggleStaggered);
  selectMainLayout = select("#selectMainLayout");
  for (let s of mainLayouts) selectMainLayout.option(s[2], s[2]);
  selectMainLayout.changed(toggleSelectMainLayout);
  select("#colorSchemeCanvas").elt.innerHTML = "";
  colorSchemeCanvas = createGraphics(
    colorSchemeCanvasWidth,
    colorSchemeCanvasHeight,
  );
  colorSchemeCanvas.parent("#colorSchemeCanvas");
  colorSchemeCanvas.mouseClicked(colorSchemeCanvasMousePressed);
  colorPicker0from = createColorPicker("#000000");
  colorPicker0from.id("colorpicker0from");
  colorPicker0from.input(updateFromColorPickers);
  colorPicker0from.parent("#colorSchemeCanvas");
  colorPicker0from.class("hidden");
  colorPicker0to = createColorPicker("#000000");
  colorPicker0to.id("colorpicker0to");
  colorPicker0to.input(updateFromColorPickers);
  colorPicker0to.parent("#colorSchemeCanvas");
  colorPicker0to.class("hidden");
  colorPicker1from = createColorPicker("#000000");
  colorPicker1from.id("colorpicker1from");
  colorPicker1from.input(updateFromColorPickers);
  colorPicker1from.parent("#colorSchemeCanvas");
  colorPicker1from.class("hidden");
  colorPicker1to = createColorPicker("#000000");
  colorPicker1to.id("colorpicker1to");
  colorPicker1to.input(updateFromColorPickers);
  colorPicker1to.parent("#colorSchemeCanvas");
  colorPicker1to.class("hidden");
  colorPicker2from = createColorPicker("#000000");
  colorPicker2from.id("colorpicker2from");
  colorPicker2from.input(updateFromColorPickers);
  colorPicker2from.parent("#colorSchemeCanvas");
  colorPicker2from.class("hidden");
  colorPicker2to = createColorPicker("#000000");
  colorPicker2to.id("colorpicker2to");
  colorPicker2to.input(updateFromColorPickers);
  colorPicker2to.parent("#colorSchemeCanvas");
  colorPicker2to.class("hidden");
  colorPicker3from = createColorPicker("#000000");
  colorPicker3from.id("colorpicker3from");
  colorPicker3from.input(updateFromColorPickers);
  colorPicker3from.parent("#colorSchemeCanvas");
  colorPicker3from.class("hidden");
  colorPicker3to = createColorPicker("#000000");
  colorPicker3to.id("colorpicker3to");
  colorPicker3to.input(updateFromColorPickers);
  colorPicker3to.parent("#colorSchemeCanvas");
  colorPicker3to.class("hidden");
  colorPicker4from = createColorPicker("#000000");
  colorPicker4from.id("colorpicker4from");
  colorPicker4from.input(updateFromColorPickers);
  colorPicker4from.parent("#colorSchemeCanvas");
  colorPicker4from.class("hidden");
  colorPicker4to = createColorPicker("#000000");
  colorPicker4to.id("colorpicker4to");
  colorPicker4to.input(updateFromColorPickers);
  colorPicker4to.parent("#colorSchemeCanvas");
  colorPicker4to.class("hidden");
  colorPicker5from = createColorPicker("#000000");
  colorPicker5from.id("colorpicker5from");
  colorPicker5from.input(updateFromColorPickers);
  colorPicker5from.parent("#colorSchemeCanvas");
  colorPicker5from.class("hidden");
  colorPicker5to = createColorPicker("#000000");
  colorPicker5to.id("colorpicker5to");
  colorPicker5to.input(updateFromColorPickers);
  colorPicker5to.parent("#colorSchemeCanvas");
  colorPicker5to.class("hidden");
  selectColorScheme = select("#selectColorScheme");
  for (let i = 0; i < colorSets.length; i++) {
    selectColorScheme.option(colorSets[i].getText(), colorSets[i].getText());
  }
  selectColorScheme.changed(toggleSelectColorScheme);
  selectVisualStyle = select("#selectVisualStyle");
  for (let s of visualStyles) selectVisualStyle.option(s[2], s[2]);
  selectVisualStyle.changed(toggleSelectVisualStyle);
  checkboxAlternatingColors = select("#checkboxAlternatingColors");
  checkboxAlternatingColors.changed(toggleAlternatingColors);
  sliderModuloDiv = select("#sliderModuloDiv");
  sliderModuloValue = select("#sliderModuloValue");
  sliderModuloRange = select("#sliderModuloRange");
  sliderModuloRange.input(toggleSliderModulo);
  checkboxAnimateColors = select("#checkboxAnimateColors");
  checkboxAnimateColors.changed(toggleAnimateColors);
  checkboxThread = select("#checkboxThread");
  checkboxThread.changed(toggleThread);
  checkboxArrow = select("#checkboxArrow");
  checkboxArrow.changed(toggleArrow);
  checkboxShowBorder = select("#checkboxShowBorder");
  checkboxShowBorder.changed(toggleShowBorder);
  borderOptions = select("#borderOptions");
  sliderBorderWidth = select("#sliderBorderWidth");
  sliderBorderWidthValue = select("#sliderBorderWidthValue");
  sliderBorderWidth.input(toggleSliderBorderWidth);
  sliderBorderBrightness = select("#sliderBorderBrightness");
  sliderBorderBrightnessValue = select("#sliderBorderBrightnessValue");
  sliderBorderBrightness.input(toggleSliderBorderBrightness);
  sliderBeadRoundness = select("#sliderBeadRoundness");
  sliderBeadRoundnessValue = select("#sliderBeadRoundnessValue");
  sliderBeadRoundness.input(toggleSliderBeadRoundness);
  sliderBeadSpacingW = select("#sliderBeadSpacingW");
  sliderBeadSpacingWValue = select("#sliderBeadSpacingWValue");
  sliderBeadSpacingW.input(toggleSliderBeadSpacingW);
  sliderBeadSpacingH = select("#sliderBeadSpacingH");
  sliderBeadSpacingHValue = select("#sliderBeadSpacingHValue");
  sliderBeadSpacingH.input(toggleSliderBeadSpacingH);
  sliderBratio = select("#sliderBratio");
  sliderBratioValue = select("#sliderBratioValue");
  sliderBratio.input(toggleSliderBratio);
  selectRuleCompression = select("#selectRuleCompression");
  for (let s of ruleCompressions) selectRuleCompression.option(s[2], s[2]);
  selectRuleCompression.changed(toggleSelectRuleCompression);
  selectModuleSorting = select("#selectModuleSorting");
  for (let s of moduleSortings) selectModuleSorting.option(s[2], s[2]);
  selectModuleSorting.changed(toggleSelectModuleSorting);
  checkboxFixedRuleModules = select("#checkboxFixedRuleModules");
  checkboxFixedRuleModules.changed(toggleFixedRuleModules);
  buttonRandomize = select("#buttonRandomize");
  buttonRandomize.mousePressed(toggleRandomize);
  checkboxMarkInactive = select("#checkboxMarkInactive");
  checkboxMarkInactive.changed(toggleMarkInactive);
  checkboxShowCounters = select("#checkboxShowCounters");
  checkboxShowCounters.changed(toggleShowCounters);
  checkboxShowPercentage = select("#checkboxShowPercentage");
  checkboxShowPercentage.changed(toggleShowPercentages);
  showPercentageDiv = select("#showPercentageDiv");
  buttonRuleExpand = select("#expandRule");
  buttonRuleExpand.elt.addEventListener("click", (e) => {
    toggleRuleExpand();
  });
  checkboxGridLayout = select("#checkboxGridLayout");
  checkboxGridLayout.changed(toggleGridLayout);
  gridLayoutDiv = select("#gridLayoutDiv");
  sliderLayoutColumns = select("#sliderLayoutColumns");
  sliderLayoutColumnsValue = select("#sliderLayoutColumnsValue");
  sliderLayoutColumns.input(toggleSliderLayoutColumns);
  sliderLayoutRows = select("#sliderLayoutRows");
  sliderLayoutRowsValue = select("#sliderLayoutRowsValue");
  sliderLayoutRows.input(toggleSliderLayoutRows);
  checkboxShowGridText = select("#checkboxShowGridText");
  checkboxShowGridText.changed(toggleShowGridText);
  buttonResetFilters = select("#buttonResetFilters");
  buttonResetFilters.mousePressed(resetFilters);
  checkboxPeriodTwoFilter = select("#checkboxRemovePeriodTwo", filterPeriodTwo);
  checkboxPeriodTwoFilter.changed(togglePeriodTwoFilter);
  checkboxPeriodFourFilter = select(
    "#checkboxRemovePeriodFour",
    filterPeriodFour,
  );
  checkboxPeriodFourFilter.changed(togglePeriodFourFilter);
  checkboxPeriodSixFilter = select("#checkboxRemovePeriodSix", filterPeriodSix);
  checkboxPeriodSixFilter.changed(togglePeriodSixFilter);
  checkboxPersistentFilter = select(
    "#checkboxRequirePersistence",
    filterPersistent,
  );
  checkboxPersistentFilter.changed(togglePersistentFilter);
  checkboxNoEquivalentsFilter = select(
    "#checkboxRequireFewerEquivalents",
    filterFewEquivalents,
  );
  checkboxNoEquivalentsFilter.changed(toggleNoEquivalentsFilter);
  checkboxOnePerEquivalenceClassFilter = select(
    "#checkboxRemoveEquivalents",
    filterOnePerEquivalenceClass,
  );
  checkboxOnePerEquivalenceClassFilter.changed(
    toggleOnePerEquivalenceClassFilter,
  );
  checkboxClosedFilter = select("#checkboxRequireClosed", filterClosed);
  checkboxClosedFilter.changed(toggleClosedFilter);
  checkboxSemiClosedFilter = select(
    "#checkboxRequireSemiclosed",
    filterSemiClosed,
  );
  checkboxSemiClosedFilter.changed(toggleSemiClosedFilter);
  checkboxNotSemiClosedFilter = select(
    "#checkboxRequireNotSemiclosed",
    filterNotSemiClosed,
  );
  checkboxNotSemiClosedFilter.changed(toggleNotSemiClosedFilter);
  checkboxColorSplitFilter = select(
    "#checkboxRequireColorSplit",
    filterColorSplit,
  );
  checkboxColorSplitFilter.changed(toggleColorSplitFilter);
  checkboxNotColorSplitFilter = select(
    "#checkboxRequireNotColorSplit",
    filterNotColorSplit,
  );
  checkboxNotColorSplitFilter.changed(toggleNotColorSplitFilter);
  buttonClearErrors = select("#buttonClearToggles");
  buttonClearErrors.mousePressed(toggleClearErrors);
  buttonAdvanceByTwo = select("#buttonAdvanceByTwo");
  buttonAdvanceByTwo.mousePressed(function () {
    advanceCurrentPattern(1);
    draw();
  });
  buttonAdvanceByTwenty = select("#buttonAdvanceByTwenty");
  buttonAdvanceByTwenty.mousePressed(function () {
    advanceCurrentPattern(10);
    draw();
  });
  checkboxShowWrappingColumnLeft = select("#checkboxShowWrappingColumnLeft");
  checkboxShowWrappingColumnLeft.changed(toggleShowWrappingColumnLeft);
  checkboxShowWrappingColumnRight = select("#checkboxShowWrappingColumnRight");
  checkboxShowWrappingColumnRight.changed(toggleShowWrappingColumnRight);
  checkboxShowPeriod = select("#checkboxShowPeriod");
  checkboxShowPeriod.changed(toggleShowPeriod);
  checkboxDirectional = select("#checkboxDirectional");
  checkboxDirectional.changed(toggleDirectional);
  checkboxWrapping = select("#checkboxWrapping");
  checkboxWrapping.changed(toggleWrapping);
  selectStartShape = select("#selectStartShape");
  for (let s of startShapes) selectStartShape.option(s[2], s[2]);
  selectStartShape.changed(toggleSelectStartShape);
  checkboxUpwards = select("#checkboxUpwards");
  checkboxUpwards.changed(toggleUpwards);
  guiInitialized = true;
  if (vverbose) console.log("  => end initalizeGui()");
}
function refreshGui() {
  if (vverbose) console.log("initalizeGui() start:");
  for (let radio of selectAll("input[name='radioColors']")) {
    if (radio.elt.dataset.colors == colors) radio.elt.checked = true;
    else radio.elt.checked = !true;
  }
  sliderColumnsValue.html(columns);
  sliderColumns.elt.value = columns;
  sliderRowsValue.html(rows);
  sliderRows.elt.value = rows;
  selectSeed.value(getSeedTypeLongString(seedType));
  sliderSeedPeriodValue.html(seedPeriod);
  sliderSeedPeriod.elt.value = seedPeriod;
  if (seedType == "periodic" || seedType == "periodic-explicit") {
    sliderSeedPeriodOptions.show();
  }
  checkboxStaggered.elt.checked = staggered;
  selectMainLayout.value(getMainLayoutLongString(mainLayout));
  if (customColors) transferCurrentColorSetToColorPickers();
  updateColorSchemeCanvas();
  selectColorScheme.value(currentColorSet.getText());
  selectVisualStyle.value(getVisualStyleLongString(visualStyle));
  checkboxAlternatingColors.elt.checked = altColorMode;
  sliderModuloValue.html(colorModulo);
  sliderModuloRange.elt.value = colorModulo;
  if (altColorMode) sliderModuloDiv.show();
  else {
    sliderModuloDiv.hide();
    checkboxAnimateColors.hide();
  }
  setCheckboxValue(checkboxThread, showThread);
  setCheckboxValue(checkboxArrow, showArrow);
  setCheckboxValue(checkboxShowBorder, showBorder);
  if (showBorder) borderOptions.show();
  sliderBorderWidth.elt.value = borderWidth;
  sliderBorderWidthValue.html(borderWidth);
  sliderBorderBrightness.elt.value = borderBrightness;
  sliderBorderBrightnessValue.html(borderBrightness);
  sliderBeadRoundness.elt.value = beadRoundness;
  sliderBeadRoundnessValue.html(sliderBeadRoundness);
  sliderBeadSpacingW.elt.value = beadSpacingW;
  sliderBeadSpacingWValue.html(sliderBeadSpacingW);
  sliderBeadSpacingH.elt.value = beadSpacingH;
  sliderBeadSpacingHValue.html(sliderBeadSpacingH);
  sliderBratio.elt.value = bRatio;
  sliderBratioValue.html(sliderBratio);
  selectRuleCompression.value(getRuleCompressionLongString(ruleCompression));
  selectModuleSorting.value(getModuleSortingLongString(moduleSorting));
  checkboxFixedRuleModules.elt.checked = fixedRuleModules;
  checkboxMarkInactive.elt.checked = markInactiveComponents;
  checkboxShowCounters.elt.checked = showCounters;
  checkboxShowPercentage.elt.checked = showPercentages;
  if (showCounters) showPercentageDiv.show();
  checkboxGridLayout.elt.checked = gridLayout;
  if (gridLayout) gridLayoutDiv.show();
  setCheckboxValue(checkboxShowGridText, showGridText);
  sliderLayoutColumns.elt.value = gridColumns;
  sliderLayoutRows.elt.value = gridRows;
  sliderLayoutColumnsValue.html(gridColumns);
  sliderLayoutRowsValue.html(gridRows);
  checkboxPeriodTwoFilter.elt.checked = filterPeriodTwo;
  checkboxPeriodFourFilter.elt.checked = filterPeriodFour;
  checkboxPeriodSixFilter.elt.checked = filterPeriodSix;
  checkboxPersistentFilter.elt.checked = filterPersistent;
  checkboxNoEquivalentsFilter.elt.checked = filterFewEquivalents;
  checkboxOnePerEquivalenceClassFilter.elt.checked =
    filterOnePerEquivalenceClass;
  checkboxClosedFilter.elt.checked = filterClosed;
  checkboxSemiClosedFilter.elt.checked = filterSemiClosed;
  checkboxNotSemiClosedFilter.elt.checked = filterNotSemiClosed;
  checkboxColorSplitFilter.elt.checked = filterColorSplit;
  checkboxNotColorSplitFilter.elt.checked = filterNotColorSplit;
  checkboxShowWrappingColumnLeft.elt.checked = showWrappingColumnLeft;
  checkboxShowWrappingColumnRight.elt.checked = showWrappingColumnRight;
  checkboxShowPeriod.elt.checked = showPeriod;
  checkboxDirectional.elt.checked = directional;
  checkboxWrapping.elt.checked = wrapping;
  selectStartShape.value(getStartShapeLongString(startShape));
  checkboxUpwards.elt.checked = upwards;
}
function toggleMarkInactive() {
  markInactiveComponents = !markInactiveComponents;
  analysisMode = markInactiveComponents;
  if (analysisMode) currentPattern.analyzeArrayRule();
  draw();
}
function toggleFixedRuleModules() {
  fixedRuleModules = !fixedRuleModules;
  setCheckboxValue(checkboxFixedRuleModules, fixedRuleModules);
  refreshPatternsAndDraw();
}
function toggleDirectional() {
  directional = !directional;
  refreshPatternsAndDraw();
}
function toggleStaggered() {
  staggered = !staggered;
  resetToggles();
  if (staggered) columns = columns - columns % 2;
  updateVisualStyle();
  sliderBratio.value(bRatio);
  select("#sliderBratioValue").html(bRatio);
  refreshPatternsAndDraw();
}
function toggleWrapping() {
  wrapping = !wrapping;
  refreshPatternsAndDraw();
}
function toggleUpwards() {
  upwards = !upwards;
  draw();
}
function toggleShowWrappingColumnLeft() {
  showWrappingColumnLeft = !showWrappingColumnLeft;
  draw();
}
function toggleShowWrappingColumnRight() {
  showWrappingColumnRight = !showWrappingColumnRight;
  draw();
}
function toggleShowPeriod() {
  showPeriod = !showPeriod;
  draw();
}
function toggleArrow() {
  showArrow = !showArrow;
  draw();
}
function toggleShowBorder() {
  showBorder = !showBorder;
  if (showBorder) borderOptions.show();
  else borderOptions.hide();
  draw();
}
function toggleAlternatingColors() {
  altColorMode = !altColorMode;
  updateColorSchemeCanvas();
  if (altColorMode) {
    sliderModuloDiv.show();
    checkboxAnimateColors.show();
  } else {
    sliderModuloDiv.hide();
    checkboxAnimateColors.hide();
  }
  draw();
}
function toggleSelectSeed() {
  if (vverbose) console.log("toggleSelectSeed");
  seedType = getSeedTypeShortString(selectSeed.value());
  if (vverbose) console.log("    seedType: " + seedType);
  if (seedType == "periodic" || seedType == "periodic-explicit") {
    sliderSeedPeriodOptions.show();
  } else sliderSeedPeriodOptions.hide();
  if (seedType == "explicit" || seedType == "periodic-explicit") {
    setGlobalSeedFromPattern(currentPattern);
  } else randomizeGlobalSeed();
  if (gridLayout) {
    for (let n = 0; n < numberOfPatterns; n++) {
      patterns[n].initSeed();
      patterns[n].calculateRows();
    }
  } else {
    currentPattern.initSeed();
    currentPattern.calculateRows();
  }
  draw();
}
function toggleSelectColorScheme() {
  colorMapping = [...Array(colors).keys()];
  colorMappingActive = !true;
  let item = selectColorScheme.value();
  for (let i = 0; i < noColorSets; i++) {
    if (item == colorSets[i].getText()) {
      currentColorSet = colorSets[i];
      customColors = false;
      break;
    }
  }
  updateColorSchemeCanvas();
  draw();
}
function toggleSelectVisualStyle() {
  visualStyle = getVisualStyleShortString(selectVisualStyle.value());
  updateVisualStyle();
  draw();
}
function toggleSelectMainLayout() {
  if (!gridLayout) {
    mainLayout = getMainLayoutShortString(selectMainLayout.value());
    currentPattern.placeRuleModules();
    draw();
  }
}
function toggleSelectModuleSorting() {
  moduleSorting = getModuleSortingShortString(selectModuleSorting.value());
  currentPattern.sortRuleModules();
  currentPattern.placeRuleModules();
  draw();
}
function toggleSelectStartShape() {
  startShape = getStartShapeShortString(selectStartShape.value());
  refreshPatternsAndDraw();
}
function toggleSelectRuleCompression() {
  ruleCompression = getRuleCompressionShortString(
    selectRuleCompression.value(),
  );
  currentPattern.createRuleModules();
  currentPattern.placeRuleModules();
  draw();
}
function toggleSliderColumns() {
  let val = sliderColumns.value();
  columns = val - val % 2;
  sliderColumnsValue.html(columns);
  updateSeedSizes();
  refreshPatternsAndDraw();
}
function toggleSliderRows() {
  let val = sliderRows.value();
  rows = val - val % 2;
  sliderRowsValue.html(rows);
  updateSeedSizes();
  refreshPatternsAndDraw();
}
function toggleSliderBeadRoundness() {
  beadRoundness = sliderBeadRoundness.value();
  sliderBeadRoundnessValue.html(beadRoundness);
  draw();
}
function toggleSliderBeadSpacingW() {
  beadSpacingW = sliderBeadSpacingW.value();
  sliderBeadSpacingWValue.html(beadSpacingW);
  draw();
}
function toggleSliderBeadSpacingH() {
  beadSpacingH = sliderBeadSpacingH.value();
  select("#sliderBeadSpacingHValue").html(beadSpacingH);
  draw();
}
function toggleSliderBratio() {
  bRatio = sliderBratio.value();
  sliderBratioValue.html(bRatio);
  draw();
}
function toggleSliderBorderWidth() {
  borderWidth = sliderBorderWidth.value();
  select("#sliderBorderWidthValue").html(borderWidth);
  draw();
}
function toggleSliderBorderBrightness() {
  borderBrightness = sliderBorderBrightness.value();
  sliderBorderBrightnessValue.html(borderBrightness);
  updateURL();
  draw();
}
function toggleRandom() {
  fixedRuleModules = !true;
  setCheckboxValue(checkboxFixedRuleModules, fixedRuleModules);
  currentPattern.setArrayRule(randomRule());
  randomizeGlobalSeed();
  if (gridLayout) initializePatternsAndDraw();
  draw();
}
function toggleRandomSeed() {
  seedType = getSeedTypeShortString(getNumber(keyCode));
  selectSeed.value(getSeedTypeLongString(seedType));
  toggleSelectSeed();
}
function toggleRandomize() {
  fixedRuleModules = true;
  setCheckboxValue(checkboxFixedRuleModules, fixedRuleModules);
  setRandomRuleFromModules();
  if (gridLayout) initializePatternsAndDraw();
  else refreshPatternsAndDraw();
}
function toggleRuleExpand() {
  if (vverbose) console.log("toggleRuleExpand");
  selectRuleCompression.value(getRuleCompressionLongString(ruleCompression));
  updateSelectors();
  fixedRuleModules = true;
  currentPattern.expandRuleModules();
  currentPattern.placeRuleModules();
  draw();
}
function toggleShowCounters() {
  showCounters = !showCounters;
  if (showCounters) showPercentageDiv.show();
  else showPercentageDiv.hide();
  draw();
}
function toggleShowPercentages() {
  showPercentages = !showPercentages;
  draw();
}
function toggleSliderModulo() {
  colorModulo = sliderModuloRange.value();
  if (sliderModuloRange.value() == 100) colorModulo = rows;
  sliderModuloValue.html(colorModulo);
  createColorsets();
  draw();
}
function toggleGridLayout() {
  gridLayout = !gridLayout;
  if (gridLayout) gridLayoutDiv.show();
  else gridLayoutDiv.hide();
  initializePatternsAndDraw();
}
function toggleSliderLayoutColumns() {
  gridColumns = sliderLayoutColumns.value();
  sliderLayoutColumnsValue.html(gridColumns);
  initializePatternsAndDraw();
}
function toggleSliderLayoutRows() {
  gridRows = sliderLayoutRows.value();
  sliderLayoutRowsValue.html(gridRows);
  initializePatternsAndDraw();
}
function toggleShowGridText() {
  showGridText = getCheckboxValue(checkboxShowGridText);
  refreshPatternsAndDraw();
}
function resetFilters() {
  filterPeriodTwo = false;
  filterPeriodFour = false;
  filterPeriodSix = false;
  filterPersistent = false;
  filterFewEquivalents = false;
  filterOnePerEquivalenceClass = false;
  filterClosed = false;
  filterSemiClosed = false;
  filterNotSemiClosed = false;
  filterColorSplit = false;
  filterNotColorSplit = false;
  refreshGui();
  initializePatternsAndDraw();
}
function togglePeriodTwoFilter() {
  filterPeriodTwo = getCheckboxValue(checkboxPeriodTwoFilter);
  initializePatternsAndDraw();
}
function togglePeriodFourFilter() {
  filterPeriodFour = getCheckboxValue(checkboxPeriodFourFilter);
  initializePatternsAndDraw();
}
function togglePeriodSixFilter() {
  filterPeriodSix = getCheckboxValue(checkboxPeriodSixFilter);
  initializePatternsAndDraw();
}
function togglePersistentFilter() {
  filterPersistent = getCheckboxValue(checkboxPersistentFilter);
  initializePatternsAndDraw();
}
function toggleNoEquivalentsFilter() {
  filterFewEquivalents = getCheckboxValue(checkboxNoEquivalentsFilter);
  initializePatternsAndDraw();
}
function toggleOnePerEquivalenceClassFilter() {
  filterOnePerEquivalenceClass = getCheckboxValue(
    checkboxOnePerEquivalenceClassFilter,
  );
  initializePatternsAndDraw();
}
function toggleClosedFilter() {
  filterClosed = getCheckboxValue(checkboxClosedFilter);
  initializePatternsAndDraw();
}
function toggleSemiClosedFilter() {
  filterSemiClosed = getCheckboxValue(checkboxSemiClosedFilter);
  initializePatternsAndDraw();
}
function toggleNotSemiClosedFilter() {
  filterNotSemiClosed = getCheckboxValue(checkboxNotSemiClosedFilter);
  initializePatternsAndDraw();
}
function toggleColorSplitFilter() {
  filterColorSplit = getCheckboxValue(checkboxColorSplitFilter);
  initializePatternsAndDraw();
}
function toggleNotColorSplitFilter() {
  filterNotColorSplit = getCheckboxValue(checkboxNotColorSplitFilter);
  initializePatternsAndDraw();
}
function toggleAnimateColors() {
  animateColors = !animateColors;
  if (animateColors) {
    animationFrameCount = 0;
    loop();
  } else noLoop();
}
function toggleSliderSeedPeriod() {
  seedPeriod = sliderSeedPeriod.value();
  sliderSeedPeriodValue.html(seedPeriod);
  if (gridLayout) {
    for (let n = 0; n < numberOfPatterns; n++) {
      patterns[n].initSeed();
      patterns[n].calculateRows();
    }
  } else {
    currentPattern.initSeed();
    currentPattern.calculateRows();
  }
  draw();
}
function toggleClearErrors() {
  resetToggles();
  draw();
}
function toggleThread() {
  showThread = !showThread;
  draw();
}
function colorSchemeCanvasMousePressed(event) {
  if (vverbose) console.log("colorSchemeCanvasMousePressed");
  let x = event.offsetX;
  if (vverbose) console.log("    mouseX = " + x);
  let index = floor(colors * x / colorSchemeCanvasWidth);
  if (pressedKey(SHIFT)) {
    if (vverbose) {
      console.log("    colorMapping is now " + arrayToString(colorMapping));
    }
    if (vverbose) console.log("    incrementing index " + index);
    colorMappingActive = incrementMapping(colorMapping, index, colors);
    if (vverbose) {
      console.log("    colorMapping is now " + arrayToString(colorMapping));
    }
    updateColorSchemeCanvas();
    draw();
  } else {
    let index = colorMapping[floor(colors * x / colorSchemeCanvasWidth)];
    if (!customColors) {
      transferCurrentColorSetToColorPickers();
      customColors = true;
    }
    if (altColorMode) {
      let y = event.offsetY;
      if (y < colorSchemeCanvasHeightHalf) {
        document.getElementById("colorpicker" + index + "from").click();
      } else document.getElementById("colorpicker" + index + "to").click();
    } else document.getElementById("colorpicker" + index + "from").click();
  }
}
function transferCurrentColorSetToColorPickers() {
  colorPicker0from.value(currentColorSet.get(0).toString("#rrggbb"));
  colorPicker1from.value(currentColorSet.get(1).toString("#rrggbb"));
  colorPicker2from.value(currentColorSet.get(2).toString("#rrggbb"));
  colorPicker3from.value(currentColorSet.get(3).toString("#rrggbb"));
  colorPicker4from.value(currentColorSet.get(4).toString("#rrggbb"));
  colorPicker5from.value(currentColorSet.get(5).toString("#rrggbb"));
  colorPicker0to.value(currentColorSet.getTo(0).toString("#rrggbb"));
  colorPicker1to.value(currentColorSet.getTo(1).toString("#rrggbb"));
  colorPicker2to.value(currentColorSet.getTo(2).toString("#rrggbb"));
  colorPicker3to.value(currentColorSet.getTo(3).toString("#rrggbb"));
  colorPicker4to.value(currentColorSet.getTo(4).toString("#rrggbb"));
  colorPicker5to.value(currentColorSet.getTo(5).toString("#rrggbb"));
}
function transferColorPickersToCustomColors() {
  if (vverbose) console.log("Transfer from color pickers to custom colors.");
  customColorValuesFrom[0] = colorPicker0from.value();
  customColorValuesFrom[1] = colorPicker1from.value();
  customColorValuesFrom[2] = colorPicker2from.value();
  customColorValuesFrom[3] = colorPicker3from.value();
  customColorValuesFrom[4] = colorPicker4from.value();
  customColorValuesFrom[5] = colorPicker5from.value();
  customColorValuesTo[0] = colorPicker0to.value();
  customColorValuesTo[1] = colorPicker1to.value();
  customColorValuesTo[2] = colorPicker2to.value();
  customColorValuesTo[3] = colorPicker3to.value();
  customColorValuesTo[4] = colorPicker4to.value();
  customColorValuesTo[5] = colorPicker5to.value();
}
function updateFromColorPickers() {
  if (!ourMouseIsPressed) {
    transferColorPickersToCustomColors();
    currentColorSet = customColorSet;
    selectColorScheme.value("Custom Color");
    updateSelectors();
    createColorsets();
    updateColorSchemeCanvas();
    draw();
  }
}
function updateColorSchemeCanvas() {
  if (vverbose) console.log("updateColorSchemeCanvas() start:");
  colorSchemeCanvas.background(0, 0, 255);
  colorSchemeCanvas.style("margin", "2px 0");
  colorSchemeCanvas.style("border", "1px solid #000000");
  if (altColorMode) {
    for (let i = 0; i < colors; i++) {
      let x = i * colorSchemeCanvasWidth / colors;
      colorSchemeCanvas.noStroke();
      colorSchemeCanvas.fill(currentColorSet.get(colorMapping[i]));
      colorSchemeCanvas.rect(
        x,
        0,
        colorSchemeCanvasWidth / colors,
        colorSchemeCanvasHeightHalf,
      );
      colorSchemeCanvas.fill(currentColorSet.getTo(colorMapping[i]));
      colorSchemeCanvas.rect(
        x,
        colorSchemeCanvasHeightHalf,
        colorSchemeCanvasWidth / colors,
        colorSchemeCanvasHeightHalf,
      );
      colorSchemeCanvas.fill(
        brightness(currentColorSet.get(colorMapping[i])) < 128 ? 255 : 0,
      );
      colorSchemeCanvas.textFont(font);
      colorSchemeCanvas.textSize(18);
      colorSchemeCanvas.textAlign(CENTER, CENTER);
      colorSchemeCanvas.text(
        i,
        x + .5 * colorSchemeCanvasWidth / colors,
        .25 * colorSchemeCanvasHeightFull,
      );
    }
    colorSchemeCanvas.show();
  } else {
    for (let i = 0; i < colors; i++) {
      let x = i * colorSchemeCanvasWidth / colors;
      colorSchemeCanvas.noStroke();
      colorSchemeCanvas.fill(currentColorSet.get(colorMapping[i]));
      colorSchemeCanvas.rect(
        x,
        0,
        colorSchemeCanvasWidth / colors,
        colorSchemeCanvasHeightFull,
      );
      colorSchemeCanvas.fill(
        brightness(currentColorSet.get(colorMapping[i])) < 128 ? 255 : 0,
      );
      colorSchemeCanvas.textFont(font);
      colorSchemeCanvas.textSize(18);
      colorSchemeCanvas.textAlign(CENTER, CENTER);
      colorSchemeCanvas.text(
        i,
        x + .5 * colorSchemeCanvasWidth / colors,
        .5 * colorSchemeCanvasHeightFull,
      );
    }
    colorSchemeCanvas.show();
  }
  if (vverbose) console.log("  => end updateColorSchemeCanvas()");
}
function mouseWheeled(e) {
  let x = mouseX;
  let y = mouseY;
  if (!gridLayout) {
    if (mainLayout === "pattern+rule") {
      if (
        between(x, ruleBoxX, ruleBoxX + ruleBoxW) &&
        between(y, ruleBoxY, ruleBoxY + ruleBoxH)
      ) currentPattern.dealWithMouseWheeled(x, y, e);
    } else if (mainLayout === "rule") {
      if (
        between(x, fullBoxX, fullBoxX + fullBoxW) &&
        between(y, fullBoxY, fullBoxY + fullBoxH)
      ) {
        currentPattern.dealWithMouseWheeled(x, y, e);
        draw();
      }
    }
  }
}
function canvasMousePressed() {
  let x = mouseX;
  let y = mouseY;
  if (!gridLayout) {
    if (mainLayout === "pattern+rule") {
      if (
        between(x, patternBoxX, patternBoxX + patternBoxW) &&
        between(y, patternBoxY, patternBoxY + patternBoxH)
      ) {
        let mappedX = map(
          x,
          patternBoxX,
          patternBoxX + patternBoxW,
          0,
          patternBoxW,
        );
        let mappedY = map(
          y,
          patternBoxY,
          patternBoxY + patternBoxH,
          0,
          patternBoxH,
        );
        currentPattern.toggleCellInPosition(
          mappedX,
          mappedY,
          patternBoxW,
          patternBoxH,
        );
        draw();
      } else if (
        between(x, ruleBoxX, ruleBoxX + ruleBoxW) &&
        between(y, ruleBoxY, ruleBoxY + ruleBoxH)
      ) currentPattern.dealWithMousePressed(x, y);
    } else if (mainLayout === "pattern") {
      if (
        between(x, fullBoxX, fullBoxX + fullBoxW) &&
        between(y, fullBoxY, fullBoxY + fullBoxH)
      ) {
        let mappedX = map(x, fullBoxX, fullBoxX + fullBoxW, 0, fullBoxW);
        let mappedY = map(y, fullBoxY, fullBoxY + fullBoxH, 0, fullBoxH);
        currentPattern.toggleCellInPosition(
          mappedX,
          mappedY,
          fullBoxW,
          fullBoxH,
        );
        draw();
      }
    } else if (mainLayout === "rule") {
      if (
        between(x, fullBoxX, fullBoxX + fullBoxW) &&
        between(y, fullBoxY, fullBoxY + fullBoxH)
      ) {
        currentPattern.dealWithMousePressed(x, y);
        draw();
      }
    }
  } else {
    let C = floor(x / (width / gridColumns));
    let R = floor(y / (height / gridRows));
    let N = C + R * gridColumns;
    currentPattern = patterns[N];
    if (currentPattern == undefined) return;
    gridLayout = false;
    setCheckboxValue(checkboxGridLayout, false);
    gridLayoutDiv.hide();
    initializePatternsAndDraw();
  }
}
function updateInfoStrings() {
  statusLineTop.elt.innerHTML = "";
  if (
    currentPattern !== undefined && currentPattern.shortCode !== undefined &&
    currentPattern.shortCode !== ""
  ) statusLineTop.elt.innerHTML += currentPattern.shortCode;
  if (
    currentPattern !== undefined &&
    currentPattern.shortStringDescription !== undefined &&
    currentPattern.shortStringDescription !== ""
  ) {
    statusLineTop.elt.innerHTML += " | " +
      currentPattern.shortStringDescription;
  }
  if (
    currentPattern !== undefined &&
    currentPattern.stringDescription !== undefined &&
    currentPattern.stringDescription !== ""
  ) statusLineTop.elt.innerHTML += " | " + currentPattern.stringDescription;
  if (preloadedCounter !== undefined && preloadedCounter !== "") {
    statusLineTop.elt.innerHTML += " | " + preloadedCounter;
  }
  if (!gridLayout) {
    let infoString = getInfoString();
    select("#infopanel").html(infoString);
  } else {
    let infoString = "";
    infoString += "<span class='infotitle'>Rule: </span>" +
      "<span class='infocontent'>Multiple rules</span><br/>" + "";
    select("#infopanel").html(infoString);
  }
}
function wrap(toWrap, wrapper) {
  wrapper = wrapper || document.createElement("div");
  toWrap.parentNode.appendChild(wrapper);
  return wrapper.appendChild(toWrap);
}
function setCheckboxValue(elem, value) {
  if (elem.elt !== undefined && elem.elt.checked !== undefined) {
    elem.elt.checked = value;
  } else elem.child()[0].children[0].checked = value;
}
function getCheckboxValue(elem) {
  if (vvverbose) console.log("getCheckboxValue()");
  if (vvverbose) console.log("    returning " + elem.child()[0].checked);
  if (elem.elt !== undefined && elem.elt.checked !== undefined) {
    return elem.elt.checked;
  } else return elem.child()[0].children[0].checked;
}
let flags = {};
function isNumeric(key) {
  return 48 <= key && key <= 57;
}
function getNumber(key) {
  return key - 48;
}
function pressedKey(key) {
  return flags[key];
}
function pressedArrow() {
  return keyCode == LEFT_ARROW || keyCode == RIGHT_ARROW ||
    keyCode == UP_ARROW || keyCode == DOWN_ARROW;
}
function pressedMetaKey() {
  return pressedKey(CONTROL) || pressedKey(ALT) || pressedKey(OPTION) ||
    pressedKey(224);
}
function pressedChar(c) {
  return flags[unchar(c)];
}
function keyReleased() {
  flags[keyCode] = false;
}
function keyPressed() {
  flags[keyCode] = true;
  if (verbose) {
    console.log(
      "keyTyped: keyCode = " + keyCode + " / key = " + key +
        " / key.charCodeAt(0) = " + key.charCodeAt(0),
    );
  }
  if (modalShortCode.elt.checked) {
    if (key == "Escape") modalShortCode.elt.checked = false;
    else if (key == "Enter") {
      modalShortCode.elt.checked = false;
      setParametersFromShortCode(inputShortCode.elt.value);
    }
    return;
  } else {if (key == "Enter") {
      modalShortCode.elt.checked = true;
      inputShortCode.elt.value = "";
      inputShortCode.elt.focus();
    }}
  if (key == "Meta") return;
  if (pressedChar("L")) {
    let num = parseInt(key);
    if (0 <= num && num < maxColor && colors < maxColor) {
      increaseColors(parseInt(key));
    }
  } else if (pressedChar("J")) {
    if (key == "1" || key == "2" || key == "3" || key == "4") {
      if (key == "1") {
        for (let module of currentPattern.ruleModules) {
          let tempSet = module.leftSet;
          module.leftSet = module.aboveSet;
          module.aboveSet = module.rightSet;
          module.rightSet = tempSet;
          for (let neighborhood of module.neighborhoods) {
            let temp = neighborhood.left;
            neighborhood.left = neighborhood.above;
            neighborhood.above = neighborhood.right;
            neighborhood.right = temp;
          }
        }
      } else if (key == "2") {
        for (let module of currentPattern.ruleModules) {
          let tempSet = module.leftSet;
          module.leftSet = module.aboveSet;
          module.aboveSet = tempSet;
          for (let neighborhood of module.neighborhoods) {
            let temp = neighborhood.left;
            neighborhood.left = neighborhood.above;
            neighborhood.above = temp;
          }
        }
      } else if (key == "3") {
        for (let module of currentPattern.ruleModules) {
          let tempSet = module.leftSet;
          module.leftSet = module.rightSet;
          module.rightSet = tempSet;
          for (let neighborhood of module.neighborhoods) {
            let temp = neighborhood.left;
            neighborhood.left = neighborhood.right;
            neighborhood.right = temp;
          }
        }
      } else if (key == "4") {
        for (let module of currentPattern.ruleModules) {
          let tempSet = module.rightSet;
          module.rightSet = module.aboveSet;
          module.aboveSet = tempSet;
          for (let neighborhood of module.neighborhoods) {
            let temp = neighborhood.right;
            neighborhood.right = neighborhood.above;
            neighborhood.above = temp;
          }
        }
      }
      currentPattern.setArrayRuleFromRuleModules();
      currentPattern.createRuleModules();
      currentPattern.placeRuleModules();
      refreshPatternsAndDraw();
    } else if (key == "2") {
    } else if (key == "3") {
    } else if (key == "4") {
    } else if (key == "5") {
    } else if (key == "6") {
    } else if (key == "7") {
    } else if (key == "8") {
    } else if (key == "9") {
    } else if (key == "0") {
    }
  } else if (pressedChar("D")) {
    if (key == "1") {
      columns = 8 - 2;
      rows = 16;
    } else if (key == "2") {
      columns = 16 - 2;
      rows = 8;
    } else if (key == "3") {
      columns = 16 - 2;
      rows = 32;
    } else if (key == "4") {
      columns = 32 - 2;
      rows = 16;
    } else if (key == "5") {
      columns = 32 - 2;
      rows = 64;
    } else if (key == "6") {
      columns = 64 - 2;
      rows = 32;
    } else if (key == "7") {
      columns = 64 - 2;
      rows = 128;
    } else if (key == "8") {
      columns = 128 - 2;
      rows = 64;
    } else if (key == "9") {
      columns = 128 - 2;
      rows = 256;
    } else if (key == "0") {
      columns = 256 - 2;
      rows = 128;
    }
    if (int(key) < 10) {
      sliderColumnsValue.html(columns);
      sliderRowsValue.html(rows);
      sliderRows.value(rows);
      sliderColumns.value(columns);
      randomizeGlobalSeed();
      refreshPatternsAndDraw();
    }
    if (keyCode == UP_ARROW) {
      rows = max(2, rows - (staggered ? 2 : 1) * (pressedKey(SHIFT) ? 10 : 1));
      sliderRows.value(rows);
      sliderRowsValue.html(rows);
      refreshPatternsAndDraw();
    } else if (keyCode == DOWN_ARROW) {
      rows = rows + (staggered ? 2 : 1) * (pressedKey(SHIFT) ? 10 : 1);
      sliderRows.value(rows);
      sliderRowsValue.html(rows);
      refreshPatternsAndDraw();
    } else if (keyCode == LEFT_ARROW) {
      columns = max(
        4,
        columns - (staggered ? 2 : 1) * (pressedKey(SHIFT) ? 10 : 1),
      );
      sliderColumns.value(columns);
      sliderColumnsValue.html(columns);
      updateSeedSizes();
      refreshPatternsAndDraw();
    } else if (keyCode == RIGHT_ARROW) {
      columns = columns + (staggered ? 2 : 1) * (pressedKey(SHIFT) ? 10 : 1);
      sliderColumns.value(columns);
      sliderColumnsValue.html(columns);
      updateSeedSizes();
      refreshPatternsAndDraw();
    }
  } else if (pressedChar("R")) {
    if (!pressedMetaKey()) {
      if (pressedKey(SHIFT)) toggleRandom();
      else toggleRandomize();
    }
  } else if (pressedChar("A")) {
    if (keyCode == UP_ARROW) {
      advanceCurrentPattern(pressedKey(SHIFT) ? 10 : 1);
      draw();
    }
  } else if (key == "g") {
    if (vverbose) console.log("Toggling grid layout.");
    toggleGridLayout();
    setCheckboxValue(checkboxGridLayout, gridLayout);
  } else if (key === "=") {
    if (verbose) console.log("=");
    if (comparisonLayout === "two") comparisonLayout = "three";
    else if (comparisonLayout === "three") comparisonLayout = false;
    else comparisonLayout = "two";
    initializePatternsAndDraw();
  } else if (key == "c") increaseColors();
  else if (key == "C") decreaseColors();
  else if (key == "b") {
    toggleShowBorder();
    setCheckboxValue(checkboxShowBorder, showBorder);
  } else if (key == "o") {
    if (vverbose) console.log(currentColorSet);
    currentColorSet = colorSets[(currentColorSet.index + 1) % noColorSets];
    customColors = false;
    if (vverbose) console.log(selectColorScheme);
    selectColorScheme.value(currentColorSet.getText());
    updateSelectors();
    toggleSelectColorScheme();
  } else if (key == "O") {
    currentColorSet =
      colorSets[(currentColorSet.index + noColorSets - 1) % noColorSets];
    customColors = false;
    selectColorScheme.value(currentColorSet.getText());
    updateSelectors();
    toggleSelectColorScheme();
  } else if (key == "P") {
    colorMappingActive = nextPermutation(colorMapping);
    if (vverbose) console.log("colorMapping:");
    if (vverbose) console.log(colorMapping);
    updateColorSchemeCanvas();
    draw();
  } else if (key == "v") {
    let visualStyleNo = (getVisualStyleNumber(selectVisualStyle.value()) + 1) %
      noVisualStyles;
    visualStyle = getVisualStyleShortString(visualStyleNo);
    selectVisualStyle.value(getVisualStyleLongString(visualStyle));
    updateSelectors();
    updateVisualStyle();
    draw();
  } else if (key == "V") {
    let visualStyleNo =
      (getVisualStyleNumber(selectVisualStyle.value()) + noVisualStyles - 1) %
      noVisualStyles;
    visualStyle = getVisualStyleShortString(visualStyleNo);
    selectVisualStyle.value(getVisualStyleLongString(visualStyle));
    updateSelectors();
    updateVisualStyle();
    draw();
  } else if (key == "n") {
    altColorMode = !altColorMode;
    setCheckboxValue(checkboxAlternatingColors, altColorMode);
    updateColorSchemeCanvas();
    if (altColorMode) sliderModuloDiv.show();
    else sliderModuloDiv.hide();
    createColorsets();
    draw();
  } else if (key == "N") {
    animateColors = !animateColors;
    setCheckboxValue(checkboxAnimateColors, animateColors);
    updateColorSchemeCanvas();
    if (animateColors) {
      animationFrameCount = 0;
      altColorMode = true;
      setCheckboxValue(checkboxAlternatingColors, altColorMode);
      sliderModuloDiv.show();
      checkboxAnimateColors.show();
      colorModulo = rows;
      sliderModuloRange.elt.value = colorModulo;
      sliderModuloValue.html(colorModulo);
      createColorsets();
      loop();
    } else noLoop();
  } else if (key == "y") {
    colorModulo = colorModulo + 1;
    sliderModuloValue.html(colorModulo);
    sliderModuloRange.elt.value = colorModulo;
    createColorsets();
    draw();
  } else if (key == "Y") {
    if (vverbose) console.log("Y");
    colorModulo = max(2, colorModulo - 1);
    sliderModuloValue.html(colorModulo);
    sliderModuloRange.elt.value = colorModulo;
    createColorsets();
    draw();
  } else if (key == "T") {
    toggleThread();
    setCheckboxValue(checkboxThread, showThread);
  } else if (key == "t") {
    selectMainLayout.value(nextMainLayout());
    updateSelectors();
    toggleSelectMainLayout();
  } else if (key == "q") {
    showBoundingBox = !showBoundingBox;
    draw();
  } else if (key == "(") {
    showWrappingColumnLeft = !showWrappingColumnLeft;
    setCheckboxValue(checkboxShowWrappingColumnLeft, showWrappingColumnLeft);
    draw();
  } else if (key == ")") {
    showWrappingColumnRight = !showWrappingColumnRight;
    setCheckboxValue(checkboxShowWrappingColumnRight, showWrappingColumnRight);
    draw();
  } else if (key == "u") {
    toggleUpwards();
    setCheckboxValue(checkboxUpwards, upwards);
    draw();
  } else if (key == "I") {
    toggleDirectional();
    setCheckboxValue(checkboxDirectional, directional);
  } else if (key == "S") {
    toggleStaggered();
    setCheckboxValue(checkboxStaggered, staggered);
  } else if (key == "w") {
    toggleWrapping();
    setCheckboxValue(checkboxWrapping, wrapping);
  } else if (key == "e") {
    if (vverbose) console.log("e");
    resetToggles();
    refreshPatternsAndDraw();
  } else if (key == "x") {}
  else if (key == "X") {
    emptyURL();
    setup();
    draw();
  } else if (key == "Y") {
    currentPattern.applyDual();
    refreshPatternsAndDraw();
  } else if (key == "i") {
    toggleMarkInactive();
    setCheckboxValue(checkboxMarkInactive, markInactiveComponents);
    draw();
  } else if (key == "p") {
    toggleShowPeriod();
    setCheckboxValue(checkboxShowPeriod, showPeriod);
    if (showPeriod) {
      if (gridLayout) {
        for (let n = 0; n < numberOfPatterns; n++) {
          patterns[n].calculateRows();
        }
      } else currentPattern.calculateRows();
    }
    draw();
  } else if (key == "m") {
    let ruleCompressionNo =
      (getRuleCompressionNumber(selectRuleCompression.value()) + 1) %
      ruleCompressions.length;
    ruleCompression = getRuleCompressionShortString(ruleCompressionNo);
    selectRuleCompression.value(getRuleCompressionLongString(ruleCompression));
    toggleSelectRuleCompression();
    draw();
  } else if (key == "M") {
    let ruleCompressionNo =
      (getRuleCompressionNumber(selectRuleCompression.value()) +
        ruleCompressions.length - 1) % ruleCompressions.length;
    ruleCompression = getRuleCompressionShortString(ruleCompressionNo);
    selectRuleCompression.value(getRuleCompressionLongString(ruleCompression));
    toggleSelectRuleCompression();
    draw();
  } else if (key == "G") toggleRuleGeneralizedCompress();
  else if (key == " ") toggleRuleExpand();
  else if (key == ".") {
    toggleShowCounters();
    setCheckboxValue(checkboxShowCounters, showCounters);
  } else if (key == ",") {
    toggleShowPercentages();
    setCheckboxValue(checkboxShowPercentage, showPercentages);
  } else if (key == "+") {
    analysisThreshold++;
    currentPattern.analyzeArrayRule();
    draw();
  } else if (key == "-") {
    analysisThreshold = max(analysisThreshold - 1, 1);
    currentPattern.analyzeArrayRule();
    draw();
  } else if (key == "z") screenshotDirect();
  else if (key == "Z") screenshotAllLayouts();
  else if (isNumeric(keyCode)) {
    seedType = getSeedTypeShortString(getNumber(keyCode));
    selectSeed.value(getSeedTypeLongString(seedType));
    toggleSelectSeed();
  } else if (pressedArrow()) {
    let activeModules = false;
    for (let ruleModule of currentPattern.ruleModules) {
      if (ruleModule.active === true) {
        if (keyCode == UP_ARROW || keyCode == RIGHT_ARROW) {
          ruleModule.incrementNext();
          activeModules = true;
        } else if (keyCode == DOWN_ARROW || keyCode == LEFT_ARROW) {
          ruleModule.decrementNext();
          activeModules = true;
        }
      }
    }
    if (activeModules) {
      currentPattern.setArrayRuleFromRuleModules();
      startArrayRule = currentPattern.arrayRule;
      draw();
    } else {if (keyCode == UP_ARROW || keyCode == RIGHT_ARROW) {
        currentPattern.incrementNextFromRulemodules();
        currentPattern.setArrayRuleFromRuleModules();
        initializePatternsAndDraw();
      } else if (keyCode == DOWN_ARROW || keyCode == LEFT_ARROW) {
        currentPattern.decrementNextFromRulemodules();
        currentPattern.setArrayRuleFromRuleModules();
        initializePatternsAndDraw();
      }}
  } else if (keyCode == ESCAPE) {
    if (vverbose) console.log("ESCAPE");
    for (let ruleModule of currentPattern.ruleModules) {
      if (ruleModule.active === true) ruleModule.active = false;
    }
    draw();
  } else if (key == ">") currentPattern.printInfo();
  else if (key == "PageUp" || key == "PageDown") {
    if (preloadedCounter !== undefined) {
      preloadedCounter =
        (preloadedCounter + preloadedStrings.length +
          (key == "PageUp" ? -1 : 1)) % preloadedStrings.length;
      setPreloadedPattern(preloadedCounter);
    } else {if (gridLayout) {
        if (key == "PageDown") {
          currentPattern = patterns[patterns.length - 1];
          initializePatternsAndDraw();
        } else history.back();
      } else {
        preloadedCounter = key == "PageUp" ? preloadedStrings.length - 1 : 0;
        setPreloadedPattern(preloadedCounter);
      }}
    if (vverbose) {
      console.log(
        "    preloadedCounter = " + preloadedCounter +
          "   preloadedStrings.length = " + preloadedStrings.length,
      );
    }
    if (vverbose) {
      console.log(
        "Setting parameters from string : " +
          preloadedStrings[preloadedCounter],
      );
    }
    if (vverbose) console.log(preloadedStrings[preloadedCounter]);
  } else if (keyCode == UP_ARROW || keyCode == DOWN_ARROW) {}
  else if (key == "@") currentPattern.createRuleModulesFromNextSolution();
  else if (key == "ø") {
    let startShapeNo =
      (getStartShapeNumber(selectStartShape.value()) + startShapes.length - 1) %
      startShapes.length;
    startShape = getStartShapeShortString(startShapeNo);
    selectStartShape.value(getStartShapeLongString(startShape));
    initializePatternsAndDraw();
  } else if (key == "æ") {
    let startShapeNo = (getStartShapeNumber(selectStartShape.value()) + 1) %
      startShapes.length;
    startShape = getStartShapeShortString(startShapeNo);
    selectStartShape.value(getStartShapeLongString(startShape));
    initializePatternsAndDraw();
  }
}
function thue(n) {
  if (n == 0) return 1;
  else {if (n % 2 == 0) return thue(n / 2);
    else return 1 - thue((n - 1) / 2);}
}
function multisetValue(left, above, right) {
  let multiset = sort([left, above, right]);
  return colors * colors * multiset[0] + colors * multiset[1] + multiset[2];
}
function fac(N) {
  if (N === 0) return 1;
  else return fac(N - 1) * N;
}
function binom(N, K) {
  return fac(N) / (fac(N - K) * fac(K));
}
function between(x, x1, x2) {
  return x1 <= x && x <= x2;
}
function swap(data, left, right) {
  let temp = data[left];
  data[left] = data[right];
  data[right] = temp;
  return data;
}
function reversePart(data, left, right) {
  if (vverbose) {
    console.log(
      "    reversing " + arrayToString(data) + " from " + left + " to " +
        right + " (inclusive)",
    );
  }
  while (left < right) {
    let temp = data[left];
    data[left++] = data[right];
    data[right--] = temp;
  }
  return data;
}
function isSame(type, neighborhood, next) {
  if (type == "LR") {
    return neighborhood[0] == neighborhood[2] &&
      neighborhood[0] !== neighborhood[1];
  } else if (type == "LA") {
    return neighborhood[0] == neighborhood[1] &&
      neighborhood[0] !== neighborhood[2];
  } else if (type == "AR") {
    return neighborhood[1] == neighborhood[2] &&
      neighborhood[0] !== neighborhood[1];
  } else if (type == "LAR") {
    return neighborhood[0] == neighborhood[1] &&
      neighborhood[1] == neighborhood[2];
  } else if (type == "DIFF") {
    return neighborhood[0] != neighborhood[1] &&
      neighborhood[1] != neighborhood[2] && neighborhood[0] != neighborhood[2];
  }
}
function nextPermutation(data) {
  if (data.length <= 1) return data;
  let last = data.length - 2;
  while (last >= 0) {
    if (data[last] < data[last + 1]) break;
    last--;
  }
  if (last < 0) {
    reverse(data, 0, data.length - 1);
    return false;
  }
  let nextGreater = data.length - 1;
  for (let i = data.length - 1; i > last; i--) {
    if (data[i] > data[last]) {
      nextGreater = i;
      break;
    }
  }
  data = swap(data, nextGreater, last);
  data = reversePart(data, last + 1, data.length - 1);
  return true;
}
function incrementMapping(mapping, index, mod) {
  mapping[index] = (mapping[index] + 1) % mod;
  let active = false;
  for (let n = 0; n < mapping.length; n++) {
    if (mapping[n] != n) {
      active = true;
      break;
    }
  }
  return active;
}
function arrayEquals(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) if (a[i] !== b[i]) return false;
  return true;
}
function arrayLessthan(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length != b.length) return false;
  for (var i = 0; i < a.length; ++i) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}
function factorial(num) {
  var rval = 1;
  for (var i = 2; i <= num; i++) rval = rval * i;
  return rval;
}
function arraySubset(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  for (var i = 0; i < a.length; ++i) if (!b.includes(a[i])) return false;
  return true;
}
function arrayMap(A, m) {
  let result = [];
  for (let n of A) result.push(m[n]);
  return result;
}
function stringMap(p, m) {
  let result = "";
  for (let c of p) result += str(m[int(c)]);
  return result;
}
function neigborhoodEquals(a, b) {
  return a.left === b.left && a.above === b.above && a.right === b.right;
}
function neigborhoodInSet(a, Bs) {
  for (let b of Bs) if (neigborhoodEquals(a, b)) return true;
  return false;
}
function neigborhoodsSubsetOf(As, Bs) {
  for (let a of As) if (!neigborhoodInSet(a, Bs)) return false;
  return true;
}
function expandGeneralNeighborhood(leftSet, aboveSet, rightSet) {
  let result = [];
  for (let l of leftSet) {
    for (let a of aboveSet) {
      for (let r of rightSet) result.push({ left: l, above: a, right: r });
    }
  }
}
function getAllSubsets(theArray) {
  return theArray.reduce(
    (subsets, value) => subsets.concat(subsets.map((set) => [value, ...set])),
    [[]],
  );
}
function collapseColor(color, setOfColors) {
  if (setOfColors.includes(color)) return setOfColors[0];
  return color;
}
function getAllThreeTuples() {
  let result = [];
  for (let left = 0; left < colors; left++) {
    for (let above = 0; above < colors; above++) {
      for (let right = 0; right < colors; right++) {
        result.push([left, above, right]);
      }
    }
  }
  return result;
}
function getElementWithHighestFrequency(array) {
  if (array.length == 0) return null;
  var modeMap = {};
  var maxEl = array[0], maxCount = 1;
  for (var i = 0; i < array.length; i++) {
    var el = array[i];
    if (modeMap[el] == null) modeMap[el] = 1;
    else modeMap[el]++;
    if (modeMap[el] > maxCount) {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return { element: maxEl, frequency: maxCount };
}
function getNumberWithHighestFrequency(array, minimumfrequency = 1) {
  let element = Object.entries(groupBy(array, (x) => x)).filter(
    (a) => a[1].length >= minimumfrequency,
  ).sort((a, b) => b[1].length - a[1].length);
  if (element.length > 0) return +element[0][0];
  else return undefined;
}
function groupBy(x, f) {
  return x.reduce((previousValue, currentValue, currentIndex) => {
    (previousValue[f(currentValue, currentIndex, x)] ||= []).push(currentValue);
    return previousValue;
  }, {});
}
class Pattern {
  constructor() {
    if (verbose) console.log("new Pattern() start:");
    seedChangeCount = 0;
    this.period = -1;
    this.colorsUsed = colors;
    this.neighborhoods = int(pow(colors, neighbors));
    this.ruleModules = [];
    this.chosenSolution = 0;
    if (verbose) console.log("  => end new Pattern()");
  }
  initPattern() {
    if (verbose) console.log("initPattern() start:");
    this.stringDescription = stringDescription;
    if (!generatingAll) stringDescription = "";
    this.shortStringDescription = shortStringDescription;
    if (!generatingAll) shortStringDescription = "";
    this.shortCode = shortCode;
    if (!generatingAll) shortCode = "";
    this.reversible = this.reversibleCheck();
    this.symmetric = isSymmetric(this.arrayRule);
    this.totalistic = isTotalistic(this.arrayRule);
    this.persistent = isPersistent(this.arrayRule);
    this.multiset = isMultiset(this.arrayRule);
    this.ofLRtype = isOfLRtype(this.arrayRule);
    this.colorSplit = colorSplitCheck(this.arrayRule);
    this.closedOnSubset = closedRuleCheck(this.arrayRule, false);
    this.semiclosedOnSubset = closedRuleCheck(this.arrayRule, true);
    this.initSeed();
    this.calculateRows();
    this.countColors();
    if (!gridLayout && !fixedRuleModules) {
      if (vverbose) {
        console.log("No rule modules present: must create rule modules.");
      }
      this.createRuleModules();
      this.placeRuleModules();
    }
    if (verbose) console.log("  => end initPattern");
  }
  setArrayRule(newArrayRule) {
    if (vverbose) {
      console.log(
        "Pattern: " + "setArrayRule(" + formatRule(newArrayRule) + ")",
      );
    }
    this.arrayRule = newArrayRule;
    this.initPattern();
    if (vverbose) console.log("  => end Pattern: setArrayRule");
  }
  setRuleModules(sourceModules) {
    if (vverbose) console.log("setRuleModules() start:");
    if (vverbose) console.log(sourceModules);
    this.ruleModules = [];
    for (let module of sourceModules) this.ruleModules.push(module.copy());
    setCheckboxValue(checkboxFixedRuleModules, fixedRuleModules);
    if (vverbose) console.log("  => end setRuleModules");
  }
  getRuleModulesCode() {
    let result = "";
    for (let module of this.ruleModules) result += str(module.next);
    return result;
  }
  ruleModuleNextsToString() {
    let result = "";
    for (let module of this.ruleModules) result += str(module.next);
    return result;
  }
  getRuleModulesCodeFull() {
    let result = "";
    for (let module of this.ruleModules) result += str(module.toString());
    return result;
  }
  applyColorMapping(m) {
    if (vverbose) console.log("applyColorMapping");
    for (let ruleModule of this.ruleModules) ruleModule.applyColorMapping(m);
    this.sortRuleModules();
    this.setArrayRuleFromRuleModules(true);
  }
  getEquivalentPatterns() {
    if (verbose) console.log("getEquivalentPatterns");
    let result = [];
    let currentlist = [...Array(colors).keys()];
    let rulePartOfUrl = "?" + window.location.href.split("?")[1];
    result.push([this.getRuleModulesCode(), rulePartOfUrl]);
    while (nextPermutation(currentlist)) {
      if (vverbose) console.log("currentlist is " + currentlist);
      let candidatePattern = new Pattern();
      candidatePattern.setRuleModules(currentPattern.ruleModules);
      candidatePattern.applyColorMapping(currentlist);
      let code = candidatePattern.getRuleModulesCode();
      if (!result.some((pair) => pair[0] === code)) {
        let newUrl = rulePartOfUrl;
        newUrl = newUrl.replace(
          /rule=\[(.*?)\]/,
          "rule=" + ruleToString(candidatePattern),
        );
        newUrl = newUrl.replace(
          /seed=\[(.*?)\]/,
          (match, p1, offset, string) =>
            "seed=[" + stringMap(p1, currentlist) + "]",
        );
        result.push([code, newUrl]);
      }
    }
    result.sort((a, b) => a[0] > b[0]);
    if (verbose) console.log("  => end getEquivalentPatterns");
    return result;
  }
  getEquivalentPatternsString() {
    let equivalentPatterns = this.getEquivalentPatterns();
    if (colors >= 5) return "(not available for 5+ colors)";
    let result = "";
    for (let P of equivalentPatterns) {
      result += "<br><span class='font-mono'><a href='/" + P[1] + "'>" + P[0] +
        "</a></span>";
    }
    return result;
  }
  analyzeArrayRule() {
    if (vverbose) {
      console.log("analyzeArrayRule() start: " + formatRule(this.arrayRule));
    }
    this.componentStatus = [];
    for (let i = 0; i < this.arrayRule.length; i++) this.componentStatus[i] = 0;
    let rs = analysisThreshold;
    let cs = 2 * rs;
    let N = int(pow(colors, cs - 1));
    let grid = [];
    for (let n = 0; n < N; n++) {
      for (let c = 1; c < cs; c++) {
        grid[c + c % 2 * columns] = floor(n / int(pow(colors, c))) % colors;
      }
      for (let r = 2; r <= rs; r++) {
        for (let c = r; c < cs - (r - 1); c = c + 2) {
          let nb = colors * colors * grid[c - 1 + (r - 1) * columns] +
            colors * grid[c + columns * (staggered ? r - 2 : r - 1)] +
            grid[c + 1 + columns * (r - 1)];
          grid[c + columns * r] = this.arrayRule[nb];
          if (r == rs) {
            this.componentStatus[nb] = this.componentStatus[nb] + 1;
          }
        }
      }
    }
    if (vverbose) console.log("    => end analyzeArrayRule()");
  }
  initSeed() {
    this.seed = [];
    if (seedType == "random") {
      if (vvverbose) console.log("    setting seed from random seed");
      for (let c = 0; c < columns; c++) this.seed[c] = globalSeed[c];
    } else if (seedType == "single") {
      let middle = columns / 2 - columns / 2 % 2;
      for (let c = 0; c < columns; c++) this.seed[c] = c == middle ? 1 : 0;
    } else if (seedType == "random-symmetric") {
      let middle = columns / 2 - (staggered ? columns / 2 % 2 == 0 ? 1 : 0 : 0);
      for (let c = 0; c < columns; c++) {
        if (staggered) {
          let i = globalSeed[abs(c - middle)];
          this.seed[c] = i;
        } else {if (c < middle) this.seed[c] = globalSeed[c];
          else this.seed[c] = globalSeed[columns - c - 1];}
      }
    } else if (seedType == "bands") {
      let bandW = columns / (2 * colors - 2);
      for (let c = 0; c < columns; c++) {
        if (c < 1 * bandW) this.seed[c] = 0;
        else if (c < 2 * bandW) this.seed[c] = 1;
        else if (c < 3 * bandW) this.seed[c] = 0;
        else if (c < 4 * bandW) this.seed[c] = 2 % colors;
        else if (c < 5 * bandW) this.seed[c] = 0;
        else if (c < 6 * bandW) this.seed[c] = 3 % colors;
        else this.seed[c] = 0;
      }
    } else if (seedType == "all-zero") {
      for (let c = 0; c < columns; c++) this.seed[c] = 0;
    } else if (seedType == "all-one") {
      for (let c = 0; c < columns; c++) this.seed[c] = 1;
    } else if (seedType == "thue") {
      for (let c = 0; c < columns; c++) this.seed[c] = thue(c);
    } else if (seedType == "every-fourth") {
      for (let c = 0; c < columns; c++) this.seed[c] = c % 4 == 0 ? 1 : 0;
    } else if (seedType == "periodic") {
      for (let c = 0; c < seedPeriod; c++) this.seed[c] = globalSeed[c];
      for (let c = seedPeriod; c < columns; c++) {
        this.seed[c] = this.seed[c % seedPeriod];
      }
    } else if (seedType == "explicit") {
      if (vvverbose) console.log("    setting seed from explicit seed");
      if (vvverbose) console.log(globalSeed);
      for (let c = 0; c < columns; c++) this.seed[c] = globalSeed[c];
    } else if (seedType == "periodic-explicit") {
      for (let c = 0; c < seedPeriod; c++) this.seed[c] = globalSeed[c];
      for (let c = seedPeriod; c < columns; c++) {
        this.seed[c] = this.seed[c % seedPeriod];
      }
    }
    if (seedChangeCount > 0) {
      error("test");
      for (let c = 0; c < columns; c++) {
        let t = globalToggles[c + columns * (c % 2)];
        if (typeof t != "undefined") this.seed[c] = (this.seed[c] + t) % colors;
      }
    }
  }
  calculateRows() {
    if (verbose) console.log("calculateRows() start:");
    if (vverbose) console.log("    colors = " + colors);
    if (vverbose) console.log("    checking errorCount = " + errorCount);
    this.states = [];
    this.neigborhoodCount = new Array(int(pow(colors, neighbors))).fill(0);
    this.neigborhoodCountTotal = 0;
    if (startShape == "acuteright") {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          if (!staggered || (c + r) % 2 == 0) {
            if (r < columns - c) this.states[c + columns * r] = 0;
            else if (r == columns - c) {
              this.states[c + columns * r] = this.seed[c];
            }
          }
        }
      }
    } else {for (let r = 0; r < (!staggered || this.ofLRtype ? 1 : 2); r++) {
        for (let c = 0; c < columns; c++) {
          if (!staggered || (c + r) % 2 == 0) {
            if (!wrapping && (c == 0 || c == columns - 1)) {
              this.states[c + columns * r] = 0;
            } else this.states[c + columns * r] = this.seed[c];
          }
        }
      }}
    for (let r = !staggered || this.ofLRtype ? 1 : 2; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (!staggered || (c + r) % 2 == 0) {
          if (startShape == "acuteright" && r <= columns - c) {
            continue;
          }
          let left, above, right;
          left = this.states[(c + columns - 1) % columns + columns * (r - 1)];
          above = this.ofLRtype
            ? 0
            : this.states[c + columns * (r - (staggered ? 2 : 1))];
          right = this.states[(c + 1) % columns + columns * (r - 1)];
          let neighborhoodIndex = 0;
          if (!directional || r % 2 == 0) {
            neighborhoodIndex = colors * colors * left + colors * above + right;
          } else {neighborhoodIndex = colors * colors * right + colors * above +
              left;}
          if (!wrapping && (c == 0 || c == columns - 1)) {
            this.states[c + columns * r] = 0;
          } else {
            this.states[c + columns * r] = this.arrayRule[neighborhoodIndex];
            this.neigborhoodCount[neighborhoodIndex] =
              this.neigborhoodCount[neighborhoodIndex] + 1;
          }
          if (errorCount > 0) {
            if (vverbose) {console.log(
                "    APPLYING ERRORS -----------------------",
              );}
            if (typeof globalToggles[c + columns * r] !== "undefined") {
              this.states[c + columns * r] =
                (this.states[c + columns * r] +
                  globalToggles[c + columns * r]) % colors;
            }
          } else if (vvverbose) console.log("errorCount = " + errorCount);
        }
      }
    }
    let neigborhoodCountTotal = 0;
    for (let i = 0; i < this.arrayRule.length; i++) {
      this.neigborhoodCountTotal += this.neigborhoodCount[i];
    }
    if (true || showPeriod) this.findPeriod();
    if (filterPeriodic) {
      ok = true;
      for (let P = 1; P < periodLimit; P++) {
        for (let shift = -3; shift <= 3; shift++) {
          for (let r = 2 * P; r < rows; r = r + 2) {
            let identical = true;
            for (let c = 0; c < columns; c++) {
              if (
                this.states[c + columns * (r + c % 2)] !=
                  this
                    .states[
                      (c + columns + shift) % columns +
                      columns * (r + c % 2 - 2 * P)
                    ]
              ) {
                identical = false;
              }
            }
            if (identical == true) ok = false;
          }
        }
      }
    }
    if (vverbose) console.log("Pattern.states: ");
    if (vverbose) console.log(this.states);
    if (verbose) console.log("    => end calculateRows");
  }
  countColors() {
    let colorsUsedInLastHalf = [];
    for (let r = rows / 2; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if (!staggered || (c + r) % 2 == 0) {
          if (
            colorsUsedInLastHalf.indexOf(this.states[c + columns * r]) === -1
          ) colorsUsedInLastHalf.push(this.states[c + columns * r]);
        }
      }
    }
    this.colorsUsed = colorsUsedInLastHalf.length;
  }
  setTotalisticArrayRule(newTotalisticArrayRule) {
    if (vverbose) {
      console.log(
        "setTotalisticArrayRule(" + formatRule(newTotalisticArrayRule) + ")",
      );
    }
    this.totalisticRule = newTotalisticArrayRule;
    this.arrayRule = createArrayRuleFromTotalisticArrayRule(
      this.totalisticRule,
    );
    this.initPattern();
    if (vverbose) console.log("    => end setTotalisticArrayRule");
  }
  resetSeedChanges() {
    if (vverbose) console.log("resetSeedChanges() start:");
    for (let c = 0; c < columns; c++) {
      let t = globalToggles[c + columns * (c % 2)];
      if (typeof t != "undefined" && t > 0) {
        if (vverbose) console.log("    resetting seed " + c + " with " + t);
        globalToggles[c + columns * (c % 2)] = 0;
        seedChangeCount -= t;
      }
    }
    if (vverbose) console.log("    => end resetSeedChanges()");
  }
  findPeriod() {
    this.periodFrom = 0;
    this.periodTo = 0;
    let startRow = 0;
    if (errorCount > 0) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          if (typeof globalToggles[c + columns * r] != "undefined") {
            startRow = r + (staggered ? r % 2 : 1);
          }
        }
      }
    } else startRow = 0;
    for (
      let currentRow = startRow;
      currentRow < rows;
      currentRow = currentRow + (staggered ? 2 : 1)
    ) {
      let foundMatch = false;
      for (let r = currentRow + 2; r < rows; r = r + (staggered ? 2 : 1)) {
        let identical = true;
        for (let c = 0; c < columns; c++) {
          if (
            this.states[c + columns * (currentRow + (staggered ? c % 2 : 0))] !=
              this.states[c + columns * (r + (staggered ? c % 2 : 0))]
          ) {
            identical = false;
            break;
          } else {}
          if (!identical) break;
        }
        if (identical == true) {
          foundMatch = true;
          this.periodFrom = currentRow;
          this.periodTo = r;
          this.period = this.periodTo - this.periodFrom;
          break;
        } else {}
        if (foundMatch) break;
      }
      if (foundMatch) break;
    }
  }
  setArrayRuleFromRuleModules(supressInit) {
    if (vverbose) {
      console.log("setArrayRuleFromRuleModules(" + supressInit + "): ");
    }
    let newArrayRule = new Array(int(pow(colors, neighbors))).fill(0);
    for (let left = 0; left < colors; left++) {
      for (let above = 0; above < colors; above++) {
        for (let right = 0; right < colors; right++) {
          let neighborhoodIndex = colors * colors * left + colors * above +
            right;
          newArrayRule[neighborhoodIndex] = this.getNextFromRuleModules(
            left,
            above,
            right,
          );
        }
      }
    }
    if (vverbose) console.log("    => end setArrayRuleFromRuleModules()");
    if (vverbose) console.log("    return: " + newArrayRule);
    this.arrayRule = newArrayRule;
    if (supressInit !== true) this.initPattern();
  }
  findRuleModule(inputString, ruleModules) {
    for (let m of ruleModules) {
      if (m.matches(...inputString.split("").map((x) => +x))) return m;
    }
    return null;
  }
  getNextFromRuleModules(left, above, right) {
    if (vvverbose) {
      console.log(
        "  getNextFromRuleModules: " + left + " " + above + " " + right,
      );
    }
    for (let m of this.ruleModules) {
      let result = m.getNext(left, above, right);
      if (result !== false) {
        if (vvverbose) console.log("    result: " + result);
        return result;
        break;
      } else if (vvverbose) console.log("    result: " + result);
    }
  }
  placeRuleModules() {
    if (vverbose) console.log("placeRuleModules() start:");
    if (vvverbose) console.log(this.ruleModules);
    let x, y, w, h;
    if (mainLayout === "rule") {
      x = fullBoxX;
      y = fullBoxY;
      w = fullBoxW;
      h = fullBoxH;
    } else {
      x = ruleBoxX;
      y = ruleBoxY;
      w = ruleBoxW;
      h = ruleBoxH;
    }
    let noModules = this.ruleModules.length;
    let allSquare = this.ruleModules.reduce(
      (result, module) => result && module.moduleType !== "totalistic",
      true,
    );
    if (vvverbose) console.log("    noModules = " + noModules);
    if (vvverbose) console.log("    allSquare = " + allSquare);
    let noColumns;
    if (moduleSorting == "majoritycount" && noModules > 8) {}
    else {if (noModules <= 8) noColumns = noModules;
      else if (noModules === 9) noColumns = 3;
      else if (noModules === 10) noColumns = 5;
      else if (noModules === 12) noColumns = 6;
      else if (noModules === 14) noColumns = 7;
      else if (noModules === 16) noColumns = 8;
      else if (noModules === 20) noColumns = 10;
      else if (noModules === 21) noColumns = 7;
      else if (noModules === 24) noColumns = 8;
      else if (noModules === 27) noColumns = 9;}
    if (allSquare && noModules < 9) {
      let boxW = min(h * .5, w / noColumns);
      let boxH = boxW;
      let extraSpace = (w - boxW * noColumns) / 2;
      for (let i = 0; i < noModules; i++) {
        let thisC = i % noColumns;
        let thisR = floor(i / noColumns);
        let rcX = extraSpace + x + boxW * thisC;
        let rcY = y + boxH * thisR;
        this.ruleModules[i].setDimensions(rcX, rcY, boxW, boxH);
      }
      return;
    }
    if (allSquare && noModules === 10) {
      noColumns = 4;
      let noRows = 3;
      let boxW = w / noColumns;
      let boxH = boxW;
      let extraSpace = 0;
      if (boxH * noRows > h) {
        boxH = h / noRows;
        boxW = boxH;
        extraSpace = (w - boxW * noColumns) / 2;
      }
      for (let i = 0; i < 9; i++) {
        let thisC = i % 3;
        let thisR = floor(i / 3);
        let rcX = extraSpace + x + boxW * thisC;
        let rcY = y + boxH * thisR;
        this.ruleModules[i].setDimensions(rcX, rcY, boxW, boxH);
      }
      let thisC = 3;
      let thisR = 2;
      let rcX = extraSpace + x + boxW * thisC;
      let rcY = y + boxH * thisR;
      this.ruleModules[9].setDimensions(rcX, rcY, boxW, boxH);
      return;
    }
    if (allSquare && noColumns > 0) {
      let boxW = w / noColumns;
      let boxH = boxW;
      let noRows = noModules / noColumns;
      let extraSpace = 0;
      if (boxH * noRows > h) {
        boxH = h / noRows;
        boxW = boxH;
        extraSpace = (w - boxW * noColumns) / 2;
      }
      for (let i = 0; i < noModules; i++) {
        let thisC = i % noColumns;
        let thisR = floor(i / noColumns);
        let rcX = extraSpace + x + boxW * thisC;
        let rcY = y + boxH * thisR;
        this.ruleModules[i].setDimensions(rcX, rcY, boxW, boxH);
      }
      return;
    }
    let rect_ratio = allSquare ? 1 : 1.5;
    let ratio = w / h / rect_ratio;
    let nrows1 = 1;
    let ncols1 = Math.ceil(noModules / nrows1);
    while (nrows1 * ratio < ncols1) {
      nrows1++;
      ncols1 = Math.ceil(noModules / nrows1);
    }
    let cell_size1 = h / nrows1;
    let ncols2 = 1;
    let nrows2 = Math.ceil(noModules / ncols2);
    while (ncols2 < nrows2 * ratio) {
      ncols2++;
      nrows2 = Math.ceil(noModules / ncols2);
    }
    let cell_size2 = w / ncols2 / rect_ratio;
    let nrows, ncols, cell_size;
    let boxW, boxH;
    if (cell_size1 < cell_size2) {
      nrows = nrows2;
      ncols = ncols2;
      cell_size = cell_size2;
    } else {
      nrows = nrows1;
      ncols = ncols1;
      cell_size = cell_size1;
    }
    boxW = rect_ratio * cell_size;
    boxH = cell_size;
    let padW = (w - boxW * ncols) / (ncols + 1);
    let padH = (h - boxH * nrows) / (nrows + 1);
    for (let i = 0; i < noModules; i++) {
      let thisC = i % ncols;
      let thisR = floor(i / ncols);
      let rcX = x + boxW * thisC + padW * (thisC + 1);
      let rcY = y + boxH * thisR + padH * (thisR + 1);
      this.ruleModules[i].setDimensions(rcX, rcY, boxW, boxH);
    }
    if (vverbose) console.log("    => end placeRuleModules()");
  }
  expandRuleModules() {
    if (vverbose) {
      console.log("Expanding rule modules that are marked as active.");
    }
    if (vvverbose) console.log(this.ruleModules.slice());
    let activeMatch;
    for (let i = 0; i < this.ruleModules.length; i++) {
      if (this.ruleModules[i].active === true) {
        activeMatch = i;
        break;
      }
    }
    if (activeMatch === undefined) {}
    else {
      let module = this.ruleModules[activeMatch];
      module.active = false;
      let newModules = [];
      if (vverbose) console.log("    neigborhoods = ");
      if (vverbose) console.log(module.getNeighborhoods());
      for (let n of module.getNeighborhoods()) {
        if (vverbose) console.log("    adding:");
        if (vverbose) console.log(n);
        let ruleModule = new RuleModule(this);
        ruleModule.setOrdinaryNeighborhood([n.left], [n.above], [n.right]);
        ruleModule.addNeighborhood(n.left, n.above, n.right);
        newModules.push(ruleModule);
      }
      if (vvverbose) console.log("    new rule modules: ");
      if (vvverbose) console.log(newModules);
      if (newModules.length > 0) {
        if (vvverbose) console.log("    replacing with ordinary rule modules");
        if (vvverbose) console.log(this.ruleModules.slice());
        this.ruleModules.splice(activeMatch, 1, ...newModules);
        if (vvverbose) console.log(this.ruleModules.slice());
        this.expandRuleModules();
      }
    }
    if (vvverbose) console.log(this.ruleModules.slice());
    if (vverbose) console.log("    => end expandRuleModules()");
  }
  getOrdinaryRuleModules() {
    let ordinaryRuleModules = [];
    for (let left = colors - 1; left >= 0; left--) {
      for (let above = colors - 1; above >= 0; above--) {
        for (let right = colors - 1; right >= 0; right--) {
          let ruleModule = new RuleModule(this);
          ruleModule.setOrdinaryNeighborhood([left], [above], [right]);
          ruleModule.addNeighborhood(left, above, right);
          ordinaryRuleModules.push(ruleModule);
        }
      }
    }
    return ordinaryRuleModules;
  }
  multisetCompress(ruleModules, multisetType, index) {
    if (vvverbose) {
      console.log(
        "multisetCompress() start: index = " + index + " multisetType = " +
          multisetType,
      );
    }
    if (vvverbose) console.log(ruleModules.slice());
    if (vvverbose) console.log(ruleModules.slice()[index]);
    if (index >= ruleModules.length) {
      if (vvverbose) console.log("    returning: ");
      if (vvverbose) console.log(ruleModules);
      return ruleModules;
    }
    let candidate = ruleModules[index];
    if (!candidate.isOrdinary()) {
      if (vvverbose) {
        console.log("    this is a non-ordinary module and aborting " + index);
      }
      return this.multisetCompress(ruleModules, multisetType, index + 1);
    }
    let currentOrdinaryModuleMatches = [];
    for (let j = 0; j < ruleModules.length; j++) {
      if (vvverbose) console.log("    checking " + j);
      if (
        ruleModules[j].matches(
          candidate.leftSet[0],
          candidate.aboveSet[0],
          candidate.rightSet[0],
          multisetType,
        )
      ) {
        if (j < index) {
          if (vvverbose) {
            console.log(
              "    found multiset with index " + j + " and aborting " + index,
            );
          }
          return this.multisetCompress(ruleModules, multisetType, index + 1);
        } else if (j > index) {
          if (ruleModules[j].isOrdinary()) {
            if (vvverbose) {
              console.log("    adding to currentOrdinaryModuleMatches");
            }
            currentOrdinaryModuleMatches.push(j);
            if (vvverbose) {
              console.log("    currentOrdinaryModuleMatches are: ");
              console.log(currentOrdinaryModuleMatches.slice());
            }
          } else {
            if (vvverbose) {
              console.log(
                "    found multiset match with non-ordinary " + j +
                  " and aborting " + index,
              );
            }
            return this.multisetCompress(ruleModules, multisetType, index + 1);
          }
        }
      }
    }
    if (vvverbose) {
      console.log("    currentOrdinaryModuleMatches are: ");
      console.log(currentOrdinaryModuleMatches.slice());
    }
    if (currentOrdinaryModuleMatches.length === 0) {
      if (vvverbose) console.log("    there are no matches, so we abort");
      candidate.moduleType = "multiset";
      candidate.multisetType = multisetType;
      return this.multisetCompress(ruleModules, multisetType, index + 1);
    }
    if (vvverbose) {
      console.log(
        "      checking that currentOrdinaryModuleMatches are consistent",
      );
    }
    for (let m of currentOrdinaryModuleMatches) {
      if (vvverbose) {
        console.log(
          "        comparing candidate.next = " + candidate.next +
            " to ruleModules[m].next = " + ruleModules[m].next,
        );
      }
      if (candidate.next != ruleModules[m].next) {
        if (vvverbose) console.log("    not the same. Aborting.");
        return this.multisetCompress(ruleModules, multisetType, index + 1);
      }
    }
    if (vvverbose) {
      console.log(
        "    COMPRESSING " + currentOrdinaryModuleMatches + " with index " +
          index,
      );
    }
    candidate.moduleType = "multiset";
    candidate.multisetType = multisetType;
    if (vvverbose) {
      console.log(
        "    cleaning up and deleting modules that are now subsumed by the new module",
      );
    }
    for (var i = currentOrdinaryModuleMatches.length - 1; i >= 0; i--) {
      let module = ruleModules[currentOrdinaryModuleMatches[i]];
      candidate.addNeighborhood(
        module.leftSet[0],
        module.aboveSet[0],
        module.rightSet[0],
      );
      ruleModules.splice(currentOrdinaryModuleMatches[i], 1);
    }
    if (vvverbose) console.log("    ruleModules are now:");
    if (vvverbose) console.log(ruleModules);
    if (vvverbose) console.log("multisetCompress() end");
    return this.multisetCompress(ruleModules, multisetType, index + 1);
  }
  createRuleModules() {
    if (vverbose) console.log("createRuleModules() start:");
    if (this.totalistic) {
      this.ruleModules = [];
      let neighborhoods = (colors - 1) * this.totalistic.length + 1;
      for (let neighborhood = 0; neighborhood < neighborhoods; neighborhood++) {
        let module = new RuleModule(this);
        module.setTotalisticNeighborhood(neighborhood, this.totalistic);
        this.ruleModules.push(module);
      }
      this.sortRuleModules();
      if (ruleCompression === "onlytotalistic") return;
    }
    let candidates = [];
    candidates.push(this.getOrdinaryRuleModules());
    if (ruleCompression === "none") {
      this.ruleModules = candidates[0];
      this.sortRuleModules();
      return;
    }
    if (ruleCompression === "findsame") {
      candidates.push(this.findSameCompression(this.getOrdinaryRuleModules()));
    }
    if (ruleCompression === "onlyone") {
      candidates.push(
        this.explicitCompressOnSet(
          this.getOrdinaryRuleModules(),
          [...Array(colors).keys()],
          0,
          true,
          0,
        ),
      );
      candidates.push(
        this.explicitCompressOnSet(
          this.getOrdinaryRuleModules(),
          [...Array(colors).keys()],
          1,
          true,
          0,
        ),
      );
      candidates.push(
        this.explicitCompressOnSet(
          this.getOrdinaryRuleModules(),
          [...Array(colors).keys()],
          2,
          true,
          0,
        ),
      );
    }
    if (ruleCompression === "max" || ruleCompression === "onlywildcard") {
      let allSubsets = getAllSubsets([...Array(colors).keys()]).filter(
        (x) => x.length > 1,
      ).sort((A, B) => B.length - A.length);
      let compression = this.getOrdinaryRuleModules();
      this.ruleCompressions = new CoverSearch(compression.map((m) =>
        m.toCode())).solutions;
      this.ruleCompressions.sort(
        (a, b) =>
          this.scoreRuleCompressionCode(b) - this.scoreRuleCompressionCode(a),
      );
      console.log(
        "there are " + this.ruleCompressions.length + " compressions",
      );
      this.chosenSolution = 0;
      compression = this.compressFromCover(0, compression);
      candidates.push(compression);
    }
    if (ruleCompression === "onlyfullmultiset") {
      candidates.push(
        this.multisetCompress(this.getOrdinaryRuleModules(), "LAR", 0),
      );
    } else if (
      ruleCompression === "max" || ruleCompression === "onlymultiset"
    ) {
      candidates.push(
        this.multisetCompress(this.getOrdinaryRuleModules(), "LR", 0),
      );
      candidates.push(
        this.multisetCompress(this.getOrdinaryRuleModules(), "LAR", 0),
      );
      candidates.push(
        this.multisetCompress(this.getOrdinaryRuleModules(), "LA", 0),
      );
      candidates.push(
        this.multisetCompress(this.getOrdinaryRuleModules(), "AR", 0),
      );
    }
    if (vverbose) {
      console.log("Choosing best of " + candidates.length + " candidates.");
    }
    candidates.sort((a, b) => {
      if (a.length === b.length) {
        return this.numberOfMultisets(b) - this.numberOfMultisets(a);
      } else return a.length - b.length;
    });
    this.ruleModules = candidates[0];
    this.sortRuleModules();
    if (vverbose) console.log("    => end createRuleModules()");
  }
  scoreRuleCompressionCode(str) {
    let result = 0;
    let solutionOptions = str.split(" | ");
    for (let opt of solutionOptions) {
      let solutionNeigborhood = opt.split(":")[0].split("→")[0];
      if (
        solutionNeigborhood.charAt(0) == "{" &&
        solutionNeigborhood.charAt(solutionNeigborhood.length - 1) == "}"
      ) result = result + 1;
      else {
        let parts = solutionNeigborhood.split("·");
        for (let part of parts) if (part.length > 2) result = result + 1;
      }
    }
    return result;
  }
  createRuleModulesFromNextSolution() {
    this.chosenSolution = (this.chosenSolution + 1) %
      this.ruleCompressions.length;
    console.log("switching to solution " + this.chosenSolution);
    this.ruleModules = this.compressFromCover(
      this.chosenSolution,
      this.getOrdinaryRuleModules(),
    );
    this.sortRuleModules();
    this.placeRuleModules();
    draw();
  }
  compressFromCover(n, ruleModules) {
    if (vverbose) console.log("compressFromCover " + n);
    if (
      this.ruleCompressions == undefined ||
      this.ruleCompressions[n] == undefined
    ) return;
    let result = [];
    let solutionOptions = this.ruleCompressions[n].split(" | ");
    for (let opt of solutionOptions) {
      let solutionItems = opt.split(":")[1].split("-");
      let modules = [];
      for (let solution of solutionItems) {
        let module = this.findRuleModule(solution.substring(0, 3), ruleModules);
        modules.push(module);
      }
      let moreGeneralRuleModule = new RuleModule(this);
      let solutionNeigborhood = opt.split(":")[0].split("→")[0];
      if (vverbose) console.log(solutionNeigborhood);
      if (
        solutionNeigborhood.charAt(0) == "{" &&
        solutionNeigborhood.charAt(solutionNeigborhood.length - 1) == "}"
      ) {
        solutionNeigborhood = solutionNeigborhood.slice(1, -1).split("");
        let leftSet = solutionNeigborhood[0].split("").map((x) => +x);
        let aboveSet = solutionNeigborhood[1].split("").map((x) => +x);
        let rightSet = solutionNeigborhood[2].split("").map((x) => +x);
        moreGeneralRuleModule.setOrdinaryNeighborhood(
          leftSet,
          aboveSet,
          rightSet,
        );
        moreGeneralRuleModule.moduleType = "multiset";
        moreGeneralRuleModule.multisetType = "LAR";
      } else {
        solutionNeigborhood = solutionNeigborhood.split("·");
        let leftSet = solutionNeigborhood[0].split("").map((x) => +x);
        let aboveSet = solutionNeigborhood[1].split("").map((x) => +x);
        let rightSet = solutionNeigborhood[2].split("").map((x) => +x);
        moreGeneralRuleModule.setOrdinaryNeighborhood(
          leftSet,
          aboveSet,
          rightSet,
        );
      }
      moreGeneralRuleModule.updateNeighborhoodsAutomatically();
      result.push(moreGeneralRuleModule);
    }
    return result;
  }
  findAllCompressionsHelper(subsets, compression, candidates, lastSize) {
    if (vverbose) {
      console.log(
        "findAllCompressionsHelper " + subsets.length + " " +
          compression.length + " " + candidates.length + " " + lastSize,
      );
    }
    if (subsets.length == 0) {
      if (compression.length < candidates[0].length) {
        candidates.splice(0, candidates.length);
      }
      candidates.push(compression);
    } else {for (let i = 0; i < subsets.length; i++) {
        let rest = subsets.slice();
        rest.splice(i, 1);
        let subset = subsets[i];
        let nextCompression = this.explicitCompressOnSet(
          compression.slice(),
          subset,
          0,
          false,
          0,
        );
        this.findAllCompressionsHelper(
          rest,
          nextCompression,
          candidates,
          subset.length,
        );
      }}
  }
  findSameCompression(ruleModules) {
    for (let type of ["LR", "LA", "AR", "LAR", "DIFF"]) {
      let sameones = [];
      for (let j = 0; j < ruleModules.length; j++) {
        let n = ruleModules[j];
        if (
          n.moduleType !== "findsame" &&
          isSame(type, [...n.leftSet, ...n.aboveSet, ...n.rightSet], n.next)
        ) sameones.push(j);
      }
      let setOfValues = new Set(sameones.map((n) => ruleModules[n].next));
      if (setOfValues.size === 1) {
        let nextValue = Array.from(setOfValues)[0];
        let moreGeneralRuleModule = new RuleModule(this);
        moreGeneralRuleModule.setFindSameNeighborhood(type, nextValue);
        for (var i = sameones.length - 1; i >= 0; i--) {
          let module = ruleModules[sameones[i]];
          moreGeneralRuleModule.addNeighborhoods(module.getNeighborhoods());
          ruleModules.splice(sameones[i], 1);
          if (vvverbose) console.log("    Removing ");
          if (vvverbose) console.log(module);
        }
        ruleModules.push(moreGeneralRuleModule);
      }
    }
    return ruleModules;
  }
  explicitCompressOnSet(
    ruleModules,
    compressionSet,
    whichSide,
    freezeSide,
    index,
  ) {
    if (whichSide === 3) {
      return this.explicitCompressOnSet(
        ruleModules,
        compressionSet,
        0,
        freezeSide,
        index + 1,
      );
    }
    if (vvverbose) {
      console.log(
        "explicitCompressOnSet() with compressionSet [" + compressionSet +
          "] and index/whichSide " + index + " (" + ruleModules.length + ") " +
          "/ " + (whichSide == 0 ? "above" : whichSide == 1 ? "left" : "right"),
      );
    }
    if (vvverbose) console.log(ruleModules.slice());
    if (vvverbose) console.log(ruleModules.slice()[index]);
    if (index >= ruleModules.length) {
      if (vvverbose) console.log("    => Done. Returning: ");
      if (vvverbose) console.log(ruleModulesToString(ruleModules));
      return ruleModules;
    }
    let candidate = ruleModules[index];
    if (vvverbose) {
      console.log(
        "    Current candidate is ruleModules[" + index + "]: " +
          candidate.toString(),
      );
    }
    if (candidate.moduleType === "multiset") {
      if (vvverbose) {
        console.log(
          "    This is a multiset module, so we skip this module and continue.",
        );
      }
      return this.explicitCompressOnSet(
        ruleModules,
        compressionSet,
        0,
        freezeSide,
        index + 1,
      );
    }
    let matches = [];
    let moreGeneralRuleModule;
    if (whichSide == 0) {
      if (arraySubset(candidate.aboveSet, compressionSet)) {
        if (vvverbose) {
          console.log("    arraySubset(candidate.aboveSet, compressionSet)");
        }
        moreGeneralRuleModule = new RuleModule(this);
        moreGeneralRuleModule.setOrdinaryNeighborhood(
          candidate.leftSet,
          compressionSet.slice(),
          candidate.rightSet,
        );
        if (vvverbose) {
          console.log(
            "      Creating a more general rule module and comparing it to all existing modules: " +
              moreGeneralRuleModule.toString(),
          );
        }
        for (let j = 0; j < ruleModules.length; j++) {
          if (j < index && moreGeneralRuleModule.overlapsWith(ruleModules[j])) {
            if (vvverbose) {
              console.log(
                "        The more general rule module overlaps with a module we are already done with, with index = " +
                  j + ": " + ruleModules[j].toString(),
              );
            }
            if (vvverbose) {
              console.log("        We have looked at this ABOVE before.");
            }
            if (freezeSide) {
              return this.explicitCompressOnSet(
                ruleModules,
                compressionSet,
                0,
                freezeSide,
                index + 1,
              );
            } else {return this.explicitCompressOnSet(
                ruleModules,
                compressionSet,
                1,
                freezeSide,
                index,
              );}
          } else if (
            j >= index && moreGeneralRuleModule.subsumes(ruleModules[j])
          ) {
            matches.push(j);
            if (vvverbose) {
              console.log(
                "        The more general rule module SUBSUMES a module and we are adding it to matches. Matches = " +
                  matches.map((m) => ruleModules[m].toString() + " "),
              );
            }
          }
        }
      }
    } else if (whichSide == 1) {
      if (arraySubset(candidate.leftSet, compressionSet)) {
        if (vvverbose) {
          console.log("    arraySubset(candidate.leftSet, compressionSet)");
        }
        moreGeneralRuleModule = new RuleModule(this);
        moreGeneralRuleModule.setOrdinaryNeighborhood(
          compressionSet.slice(),
          candidate.aboveSet,
          candidate.rightSet,
        );
        if (vvverbose) {
          console.log(
            "      Creating a more general rule module and comparing it to all existing modules: " +
              moreGeneralRuleModule.toString(),
          );
        }
        for (let j = 0; j < ruleModules.length; j++) {
          if (j < index && moreGeneralRuleModule.overlapsWith(ruleModules[j])) {
            if (vvverbose) {
              console.log(
                "        The more general rule module overlaps with a module we are already done with, with index = " +
                  j + ": " + ruleModules[j].toString(),
              );
            }
            if (vvverbose) {
              console.log("        We have looked at this on the LEFT before.");
            }
            if (freezeSide) {
              return this.explicitCompressOnSet(
                ruleModules,
                compressionSet,
                1,
                freezeSide,
                index + 1,
              );
            } else {return this.explicitCompressOnSet(
                ruleModules,
                compressionSet,
                2,
                freezeSide,
                index,
              );}
          } else if (
            j >= index && moreGeneralRuleModule.subsumes(ruleModules[j])
          ) {
            matches.push(j);
            if (vvverbose) {
              console.log(
                "        The more general rule module SUBSUMES a module and we are adding it to matches. Matches = " +
                  matches.map((m) =>
                    ruleModules[m].toString() + " "),
              );
            }
          }
        }
      }
    } else if (whichSide == 2) {
      if (arraySubset(candidate.rightSet, compressionSet)) {
        if (vvverbose) {
          console.log("    arraySubset(candidate.rightSet, compressionSet)");
        }
        moreGeneralRuleModule = new RuleModule(this);
        moreGeneralRuleModule.setOrdinaryNeighborhood(
          candidate.leftSet,
          candidate.aboveSet,
          compressionSet.slice(),
        );
        if (vvverbose) {
          console.log(
            "      Creating a more general rule module and comparing it to all existing modules: " +
              moreGeneralRuleModule.toString(),
          );
        }
        for (let j = 0; j < ruleModules.length; j++) {
          if (j < index && moreGeneralRuleModule.overlapsWith(ruleModules[j])) {
            if (vvverbose) {
              console.log(
                "        The more general rule module overlaps with a module we are already done with, with index = " +
                  j + ": " + ruleModules[j].toString(),
              );
            }
            if (vvverbose) {
              console.log(
                "        We have looked at this on the RIGHT before, so we skip this module and continue.",
              );
            }
            if (freezeSide) {
              return this.explicitCompressOnSet(
                ruleModules,
                compressionSet,
                2,
                freezeSide,
                index + 1,
              );
            } else {return this.explicitCompressOnSet(
                ruleModules,
                compressionSet,
                0,
                freezeSide,
                index + 1,
              );}
          } else if (
            j >= index && moreGeneralRuleModule.subsumes(ruleModules[j])
          ) {
            matches.push(j);
            if (vvverbose) {
              console.log(
                "        The more general rule module SUBSUMES a module and we are adding it to matches. Matches = " +
                  matches.map((m) =>
                    " " + ruleModules[m].toString() + " "),
              );
            }
          }
        }
      }
    }
    if (matches.length <= 1) {
      if (vvverbose) {
        console.log("    There are no matches, so we keep searching.");
      }
      if (freezeSide) {
        return this.explicitCompressOnSet(
          ruleModules,
          compressionSet,
          whichSide,
          freezeSide,
          index + 1,
        );
      } else {return this.explicitCompressOnSet(
          ruleModules,
          compressionSet,
          whichSide + 1,
          freezeSide,
          index,
        );}
    }
    let count = 0;
    for (let i in matches) {
      count += ruleModules[matches[i]].getNeighborhoods().length;
    }
    if (
      moreGeneralRuleModule.leftSet.length *
          moreGeneralRuleModule.aboveSet.length *
          moreGeneralRuleModule.rightSet.length !== count
    ) {
      if (vvverbose) {
        console.log(
          "    There is a neighborhood mismatch, so we keep searching.",
        );
      }
      if (freezeSide) {
        return this.explicitCompressOnSet(
          ruleModules,
          compressionSet,
          whichSide,
          freezeSide,
          index + 1,
        );
      } else {return this.explicitCompressOnSet(
          ruleModules,
          compressionSet,
          whichSide + 1,
          freezeSide,
          index,
        );}
    }
    if (vvverbose) {
      console.log(
        "    We have a generalized module with " + str(matches.length) +
          " matches: " + matches.map((m) =>
            " " + ruleModules[m].toString() + " ") +
          ": " + moreGeneralRuleModule.toString(),
      );
    }
    for (let m of matches) {
      if (candidate.next != ruleModules[m].next) {
        if (vvverbose) {
          console.log(
            "        They do NOT have the same next values, so we skip this module and continue.",
          );
        }
        if (freezeSide) {
          return this.explicitCompressOnSet(
            ruleModules,
            compressionSet,
            whichSide,
            freezeSide,
            index + 1,
          );
        } else {return this.explicitCompressOnSet(
            ruleModules,
            compressionSet,
            whichSide + 1,
            freezeSide,
            index,
          );}
      }
    }
    if (vvverbose) {
      console.log(
        "        They next values are identical, so we can compress and keep the more general module.",
      );
    }
    if (vvverbose) {
      console.log(
        "        Cleaning up and deleting modules that are now subsumed by the more general module.",
      );
    }
    for (var i = matches.length - 1; i >= 0; i--) {
      let module = ruleModules[matches[i]];
      moreGeneralRuleModule.addNeighborhoods(module.getNeighborhoods());
      if (vvverbose) {
        console.log(
          "            Removing " + matches[i] + ": " +
            ruleModules[matches[i]].toString(),
        );
      }
      ruleModules.splice(matches[i], 1);
    }
    ruleModules.splice(index, 0, moreGeneralRuleModule);
    if (vverbose) {
      console.log(
        "            Found a generalization. Length of ruleModules = " +
          ruleModules.length,
      );
    }
    if (vvverbose) console.log(ruleModulesToString(ruleModules.slice()));
    if (vvverbose) {
      console.log("    Finished with the deletion. The rule modules are now:");
    }
    if (vvverbose) console.log(ruleModules.slice());
    if (vvverbose) {
      console.log(
        "    We are finished with this index, so we continue with the next.",
      );
    }
    if (vvverbose) console.log("explicitCompressOnSet() end");
    if (freezeSide) {
      return this.explicitCompressOnSet(
        ruleModules,
        compressionSet,
        whichSide,
        freezeSide,
        index + 1,
      );
    } else {return this.explicitCompressOnSet(
        ruleModules,
        compressionSet,
        whichSide + 1,
        freezeSide,
        index,
      );}
  }
  sortRuleModules() {
    if (moduleSorting === "multiset") {
      if (vverbose) console.log("Sorting rule modules: multiset");
      this.ruleModules.sort((a, b) => b.lessThanMultisetPriority(a));
    } else if (moduleSorting === "lex") {
      if (vverbose) console.log("Sorting rule modules: lex");
      this.ruleModules.sort((a, b) => b.lessThanLexicographically(a));
    } else if (moduleSorting === "compression") {
      if (vverbose) console.log("Sorting rule modules: compression");
      this.ruleModules.sort(
        (a, b) => a.neighborhoods.length < b.neighborhoods.length,
      );
    } else if (moduleSorting === "totalistic") {
      if (vverbose) console.log("Sorting rule modules: totalistic");
      this.ruleModules.sort(
        (a, b) => a.getTotalisticValue() < b.getTotalisticValue(),
      );
    } else if (moduleSorting === "majoritycount") {
      if (vverbose) console.log("Sorting rule modules: majoritycount");
      this.ruleModules.sort((a, b) => b.lessThanMajorityColorCount(a));
    } else if (moduleSorting === "output") {
      if (vverbose) console.log("Sorting rule modules: output");
      this.ruleModules.sort((a, b) => b.lessThanOutput(a));
    }
  }
  numberOfMultisets(ruleModule) {
    if (vvverbose) {
      console.log(ruleModule.filter((x) => x.moduleType === "multiset").length);
    }
    return ruleModule.filter((x) => x.moduleType === "multiset").length;
  }
  incrementNextFromRulemodules() {
    for (let i = this.ruleModules.length - 1; i >= 0; i--) {
      if (this.ruleModules[i].next == colors - 1) this.ruleModules[i].next = 0;
      else {
        this.ruleModules[i].next = this.ruleModules[i].next + 1;
        break;
      }
    }
    this.setArrayRuleFromRuleModules();
  }
  decrementNextFromRulemodules() {
    for (let i = this.ruleModules.length - 1; i >= 0; i--) {
      if (this.ruleModules[i].next == 0) this.ruleModules[i].next = colors - 1;
      else {
        this.ruleModules[i].next = this.ruleModules[i].next - 1;
        break;
      }
    }
    this.setArrayRuleFromRuleModules();
  }
  dealWithMousePressed(x, y) {
    for (let ruleModule of this.ruleModules) {
      let result = ruleModule.dealWithMousePressed(x, y);
      if (result === true) {
        draw();
        break;
      }
    }
  }
  dealWithMouseWheeled(x, y, e) {
    for (let ruleModule of this.ruleModules) {
      let result = ruleModule.dealWithMouseWheeled(x, y, e);
      if (result === true) {
        draw();
        break;
      }
    }
  }
  equals(b) {
    let result = true;
    for (let r = 2; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        if ((c + r) % 2 == 0) {
          if (b.this.states[c + columns * r] != this.states[c + columns * r]) {
            result = false;
            break;
          }
        }
      }
    }
    return result;
  }
  toggleCellInPosition(x, y, w, h) {
    if (vverbose) {
      console.log(
        "toggleCellInPosition() start: " +
          (showWrappingColumnRight ? "R" : "") +
          (showWrappingColumnLeft ? "L" : ""),
      );
    }
    let extraColumns = (showWrappingColumnRight ? 1 : 0) +
      (showWrappingColumnLeft ? 1 : 0);
    let blockHinUnits = staggered ? .5 * (rows + 1) : rows;
    let blockWinUnits = bRatio * (columns + extraColumns);
    let narrow = blockWinUnits / blockHinUnits <= w / h;
    let cW, cH, wOff, hOff;
    if (narrow) {
      cH = h / (blockHinUnits + 2);
      hOff = cH;
      cW = cH * bRatio;
      wOff = (w - cW * (columns + extraColumns)) / 2;
    } else {
      cW = w / (columns + extraColumns + 2);
      wOff = cW;
      cH = cW / bRatio;
      hOff = (h - cH * blockHinUnits) / 2;
    }
    let C = floor(
      map(
        x,
        wOff,
        wOff + (columns + extraColumns) * cW,
        showWrappingColumnLeft ? -1 : 0,
        columns + (showWrappingColumnRight ? 1 : 0),
      ),
    );
    if (showWrappingColumnLeft && C === -1) C = columns - 1;
    if (showWrappingColumnRight && C === columns) C = 0;
    if (vvverbose) console.log("    y   : " + str(y));
    if (vvverbose) {
      console.log("    from: " + str(hOff + (C % 2 == 1 ? .5 * cH : 0)));
    }
    if (vvverbose) {
      console.log(
        "    to  : " + str(hOff + (C % 2 == 1 ? .5 * cH : 0) + rows * cH),
      );
    }
    let R = staggered
      ? upwards
        ? rows -
          2 *
            floor(
              map(
                y,
                hOff + (C % 2 == 0 ? .5 * cH : 0),
                hOff + (C % 2 == 0 ? .5 * cH : 0) + rows * cH,
                0,
                rows,
              ),
            ) -
          (C % 2 == 0 ? 2 : 1)
        : 2 *
            floor(
              map(
                y,
                hOff + (C % 2 == 1 ? .5 * cH : 0),
                hOff + (C % 2 == 1 ? .5 * cH : 0) + rows * cH,
                0,
                rows,
              ),
            ) + C % 2
      : upwards
      ? 0
      : floor(map(y, hOff, hOff + rows * cH, 0, rows));
    if (vvverbose) console.log("    C = " + C + " R = " + R);
    if (0 <= C && C < columns && 0 <= R && R < rows) {
      if (startShape == "acuteright" && R < columns - C) return;
      if (
        !(startShape == "acuteright") &&
          R < (!staggered || this.ofLRtype ? 1 : 2) ||
        startShape == "acuteright" && R == columns - C
      ) {
        if (vvverbose) console.log("    we are in top row(s)");
        if (seedType !== "explicit" && seedType !== "periodic-explicit") {
          setGlobalSeedFromPattern(this);
          seedType = seedType === "periodic" ? "periodic-explicit" : "explicit";
          selectSeed.value(getSeedTypeLongString(seedType));
          updateSelectors();
        }
        if (seedType === "periodic-explicit") {
          for (let n = 0; n < this.seed.length; n++) {
            if (n % seedPeriod === C % seedPeriod) {
              this.seed[n] = (this.seed[n] + 1) % colors;
              globalSeed[n] = this.seed[n];
            }
          }
        } else {
          this.seed[C] = (this.seed[C] + 1) % colors;
          globalSeed[C] = this.seed[C];
        }
      } else {if (typeof globalToggles[C + columns * R] == "undefined") {
          if (vvverbose) {
            console.log(
              "    toggling cell in the calculated part (from undefined to 1)",
            );
          }
          globalToggles[C + columns * R] = 1;
        } else {
          if (vvverbose) {
            console.log(
              "    toggling cell in the calculated part (from number to +1)",
            );
          }
          globalToggles[C + columns * R] =
            (globalToggles[C + columns * R] + 1) % colors;
        }}
      if (R < (!staggered || this.ofLRtype ? 1 : 2)) {}
      else {if (globalToggles[C + columns * R] == 0) errorCount--;
        else if (globalToggles[C + columns * R] == 1) errorCount++;}
      this.calculateRows();
    }
    if (vverbose) console.log("    => end toggleCellInPosition()");
  }
  show(x, y, w, h) {
    if (vverbose) console.log("Pattern.show() start:");
    let extraColumns = (showWrappingColumnRight ? 1 : 0) +
      (showWrappingColumnLeft ? 1 : 0);
    let blockHinUnits = staggered ? .5 * (rows + 1) : rows;
    let blockWinUnits = bRatio * (columns + extraColumns);
    let narrow = blockWinUnits / blockHinUnits <= w / h;
    let cW, cH, wOff, hOff;
    if (narrow) {
      cH = h / (blockHinUnits + 2);
      hOff = cH;
      cW = cH * bRatio;
      wOff = (w - cW * (columns + extraColumns)) / 2;
    } else {
      cW = w / (columns + extraColumns + 2);
      wOff = cW;
      cH = cW / bRatio;
      hOff = (h - cH * blockHinUnits) / 2;
    }
    push();
    translate(x, y);
    if (showBoundingBox) {
      noFill();
      strokeWeight(cW * .03);
      stroke(0, 118);
      rect(0, 0, w, h);
    }
    let rightPos = wOff +
      (1 + columns + (showWrappingColumnLeft ? 1 : 0) +
          (showWrappingColumnRight ? 1 : 0)) * cW;
    let rightPosL = wOff +
      (.75 + columns + (showWrappingColumnLeft ? 1 : 0) +
          (showWrappingColumnRight ? 1 : 0)) * cW;
    let rightPosAlmostL = (rightPos + rightPosL) / 2;
    let rightPosR = wOff +
      (1.25 + columns + (showWrappingColumnLeft ? 1 : 0) +
          (showWrappingColumnRight ? 1 : 0)) * cW;
    let rightPosAlmostR = (rightPos + rightPosR) / 2;
    let startPos = hOff +
      (upwards ? staggered ? rows - 1 : rows - .5 : staggered ? 2 : .5) *
        (staggered ? .5 : 1) * cH;
    let endPos = hOff +
      (upwards ? rows / 2 - 1 : (staggered ? 1 : 0) + rows / 2 + 1) *
        (staggered ? .5 : 1) * cH;
    let endPosAlmost = endPos + (upwards ? 1 : -1) * (staggered ? .5 : 1) * cH;
    let endPosAlmostAlmost = (endPos + endPosAlmost) / 2;
    if (showArrow) {
      strokeWeight(cW * .1);
      stroke(118);
      line(rightPos, startPos, rightPos, endPos);
      bezier(
        rightPosL,
        endPosAlmost,
        rightPos,
        endPosAlmostAlmost,
        rightPos,
        endPos,
        rightPos,
        endPos,
      );
      bezier(
        rightPosR,
        endPosAlmost,
        rightPos,
        endPosAlmostAlmost,
        rightPos,
        endPos,
        rightPos,
        endPos,
      );
    }
    for (
      let c = showWrappingColumnLeft ? -1 : 0;
      c < columns + (showWrappingColumnRight ? 1 : 0);
      c++
    ) {
      for (let r = 0; r < rows; r++) {
        let realColumn = (c + columns) % columns;
        if (!staggered || (c + r) % 2 == 0) {
          if (startShape == "acuteright" && r < columns - c) continue;
          let tx = wOff + (c + (showWrappingColumnLeft ? 1 : 0)) * cW;
          let ty = hOff +
            (upwards ? rows - r - 1 : r) * (staggered ? .5 : 1) * cH;
          let bx = tx + .5 * cW;
          let by = ty + .5 * cH;
          let bW = cW * beadSpacingW * 1;
          let bH = cH * beadSpacingH * 1;
          setColor(
            this.states[realColumn + columns * r],
            realColumn,
            animateColors
              ? (-r + rows + colorModulo + animationFrameCount) % colorModulo
              : r,
          );
          if (showBorder) {
            stroke(borderBrightness);
            strokeWeight(cW * borderWidth * .01);
          } else {
            stroke(currentFill);
            strokeWeight(cW * .003);
          }
          bead(bx, by, bW, bH, bW * beadRoundness, r);
          if (showBoundingBox && vverbose) {
            noStroke();
            textWithAdjustedColor(c + "," + r, bx, by, .4 * bH);
          }
          if (globalToggles[realColumn + columns * r] > 0) {
            if (vvverbose) console.log("   show toggle");
            fill(0, 255, 255);
            stroke(255);
            ellipse(bx, by, .5 * bW, .5 * bW);
          }
        }
      }
    }
    let howNarrow = blockWinUnits / blockHinUnits / (w / h);
    if (showPeriod && this.periodFrom != this.periodTo) {
      strokeCap(PROJECT);
      strokeWeight(.1 * cH);
      stroke(periodColor);
      periodMark(wOff, hOff, cW, cH, this.periodFrom);
      strokeWeight(.1 * cH);
      stroke(periodColor);
      periodRange(
        wOff,
        hOff,
        cW,
        cH,
        this.periodFrom,
        this.periodTo,
        showWrappingColumnLeft ? 1 : 0,
        true,
      );
      strokeWeight(.1 * cH);
      stroke(periodColor);
      periodMark(wOff, hOff, cW, cH, this.periodTo);
      noStroke();
      fill(0);
      periodText(
        wOff + 0 * cW,
        hOff,
        cW,
        cH,
        this.periodFrom,
        this.periodTo,
        this.period,
        showWrappingColumnLeft ? 1 : 0,
        true,
      );
      let nextPeriod = this.periodTo + (this.periodTo - this.periodFrom);
      if (nextPeriod < rows) {
        strokeWeight(.1 * cH);
        stroke(periodColor);
        periodRange(
          wOff + (columns + extraColumns) * cW,
          hOff,
          cW,
          cH,
          this.periodTo,
          nextPeriod,
          showWrappingColumnRight ? 0 : 1,
          false,
        );
        strokeWeight(.1 * cH);
        stroke(periodColor);
        periodMark(wOff, hOff, cW, cH, nextPeriod);
        noStroke();
        fill(0);
        periodText(
          wOff + (0 + columns + extraColumns) * cW,
          hOff,
          cW,
          cH,
          this.periodTo,
          nextPeriod,
          this.period,
          showWrappingColumnRight ? 0 : 1,
          false,
        );
      }
    }
    if (
      showThread && !showWrappingColumnLeft && !showWrappingColumnRight &&
      !upwards && staggered
    ) {
      let inset = .25;
      let wideness = .66;
      let sidegap = .2;
      strokeWeight(.05 * cH);
      noFill();
      stroke(80, 200);
      beginShape();
      for (let r = 0; r < rows - 1; r++) {
        if (r % 2 === 0) {
          if (r === 0) {
            vertex(wOff + (columns - .5) * cW, hOff + .5 * (r + inset) * cH);
            bezierVertex(
              wOff + (columns + (-.5 + sidegap) * .59) * cW,
              hOff + .5 * (r + inset) * cH,
              wOff + (columns + sidegap) * cW,
              hOff + .5 * (r + 1 - .59) * cH,
              wOff + (columns + sidegap) * cW,
              hOff + .5 * (r + 1) * cH,
            );
            bezierVertex(
              wOff + (columns + sidegap) * cW,
              hOff + .5 * (r + 1 + .59) * cH,
              wOff + (columns - (.5 - sidegap) * .59) * cW,
              hOff + .5 * (r + 2 - inset) * cH,
              wOff + (columns - .5) * cW,
              hOff + .5 * (r + 2 - inset) * cH,
            );
          } else {if (r !== rows - 1) {
              bezierVertex(
                wOff + (columns + (-.5 + sidegap) * .59) * cW,
                hOff + .5 * (r + inset) * cH,
                wOff + (columns + sidegap) * cW,
                hOff + .5 * (r + 1 - .59) * cH,
                wOff + (columns + sidegap) * cW,
                hOff + .5 * (r + 1) * cH,
              );
              bezierVertex(
                wOff + (columns + sidegap) * cW,
                hOff + .5 * (r + 1 + .59) * cH,
                wOff + (columns + (-.5 + sidegap) * .59) * cW,
                hOff + .5 * (r + 2 - inset) * cH,
                wOff + (columns - .5) * cW,
                hOff + .5 * (r + 2 - inset) * cH,
              );
            }}
          for (let c = columns - 1; c > 0; c--) {
            if (c % 2 === 1) {
              bezierVertex(
                wOff + (c + 1 - .5 - wideness) * cW,
                hOff + .5 * (r + 2 - inset) * cH,
                wOff + (c - .5 + wideness) * cW,
                hOff + .5 * (r + 1 + inset) * cH,
                wOff + (c - .5) * cW,
                hOff + .5 * (r + 1 + inset) * cH,
              );
            } else {bezierVertex(
                wOff + (c + 1 - .5 - wideness) * cW,
                hOff + .5 * (r + 1 + inset) * cH,
                wOff + (c - .5 + wideness) * cW,
                hOff + .5 * (r + 2 - inset) * cH,
                wOff + (c - .5) * cW,
                hOff + .5 * (r + 2 - inset) * cH,
              );}
          }
          if (r === rows - 2) {
            bezierVertex(
              wOff + (.5 - sidegap) * .59 * cW,
              hOff + .5 * (r + 1 + inset) * cH,
              wOff + (0 - sidegap) * cW,
              hOff + .5 * (r + 2 - .59) * cH,
              wOff + (0 - sidegap) * cW,
              hOff + .5 * (r + 2) * cH,
            );
            bezierVertex(
              wOff + (0 - sidegap) * cW,
              hOff + .5 * (r + 2 + .59) * cH,
              wOff + (.5 - sidegap) * .59 * cW,
              hOff + .5 * (r + 3 - inset) * cH,
              wOff + .5 * cW,
              hOff + .5 * (r + 3 - inset) * cH,
            );
          } else {
            bezierVertex(
              wOff + (.5 - sidegap) * .59 * cW,
              hOff + .5 * (r + 1 + inset) * cH,
              wOff + (0 - sidegap) * cW,
              hOff + .5 * (r + 2 - .59) * cH,
              wOff + (0 - sidegap) * cW,
              hOff + .5 * (r + 2) * cH,
            );
            bezierVertex(
              wOff + (0 - sidegap) * cW,
              hOff + .5 * (r + 2 + .59) * cH,
              wOff + (.5 - sidegap) * .59 * cW,
              hOff + .5 * (r + 3 - inset) * cH,
              wOff + .5 * cW,
              hOff + .5 * (r + 3 - inset) * cH,
            );
          }
        } else {for (let c = 1; c < columns; c++) {
            if (c % 2 === 1) {
              bezierVertex(
                wOff + (c - 1 + .5 + wideness) * cW,
                hOff + .5 * (r + 2 - inset) * cH,
                wOff + (c + .5 - wideness) * cW,
                hOff + .5 * (r + 1 + inset) * cH,
                wOff + (c + .5) * cW,
                hOff + .5 * (r + 1 + inset) * cH,
              );
            } else {bezierVertex(
                wOff + (c - 1 + .5 + wideness) * cW,
                hOff + .5 * (r + 1 + inset) * cH,
                wOff + (c + .5 - wideness) * cW,
                hOff + .5 * (r + 2 - inset) * cH,
                wOff + (c + .5) * cW,
                hOff + .5 * (r + 2 - inset) * cH,
              );}
          }}
      }
      endShape();
    }
    pop();
    if (vverbose) console.log("    => end show()");
  }
  showRule(x, y, w, h) {
    if (showBoundingBox) {
      noFill();
      strokeWeight(1.5);
      stroke(0, 255, 255, 118);
      rect(x, y, w, h);
      if (vverbose) console.log(x + "," + y + "," + w + "," + h);
    }
    for (let ruleModule of this.ruleModules) ruleModule.show(x, y, w, h);
  }
  printInfo() {
    let str = "[";
    for (let left = 0; left < colors; left++) {
      for (let above = 0; above < colors; above++) {
        for (let right = 0; right < colors; right++) {
          let next = this.getNextFromRuleModules(left, above, right);
          str += "[";
          str += left + "," + above + "," + right + "," + next + "]";
          str += ",";
        }
      }
    }
    str = str.slice(0, -1);
    str += "]";
    str = "[";
    for (let m of this.ruleModules) str += m.toString() + ",";
    str = str.slice(0, -1);
    str += "]";
  }
  reversibleCheck() {
    if (vverbose) {
      console.log("reversibleCheck(" + formatRule(this.arrayRule) + ")");
    }
    let result = 1;
    dualRule = [];
    for (let i = 0; i < this.neighborhoods; i++) dualRule[i] = -1;
    let neighborhoodIndex, next, inverseNeighborhoodIndex;
    for (let left = 0; left < colors; left++) {
      for (let above = 0; above < colors; above++) {
        for (let right = 0; right < colors; right++) {
          neighborhoodIndex = colors * colors * left + colors * above + right;
          next = this.arrayRule[neighborhoodIndex];
          inverseNeighborhoodIndex = colors * colors * left + colors * next +
            right;
          if (this.arrayRule[inverseNeighborhoodIndex] != above) {
            result = 0;
          }
          dualRule[inverseNeighborhoodIndex] = above;
        }
      }
    }
    if (vverbose) console.log("    reversibleCheck result: " + result);
    return result;
  }
  applyDual() {
    for (let i = 0; i < this.neighborhoods; i++) {
      if (dualRule[i] != -1) this.arrayRule[i] = dualRule[i];
    }
    this.calculateRows();
  }
  isClosed() {
    for (let rulemodule of this.ruleModules) {
      if (!rulemodule.isClosed()) return false;
    }
    return true;
  }
  isSemiClosed() {
    for (let rulemodule of this.ruleModules) {
      if (!rulemodule.isSemiClosed()) return false;
    }
    return true;
  }
  isNotSemiClosed() {
    for (let rulemodule of this.ruleModules) {
      if (rulemodule.isNotSemiClosed()) return true;
    }
    return false;
  }
  increaseColors(c) {
    if (vverbose) console.log("Pattern.increaseColors(" + c + ") start:");
    for (let rulemodule of this.ruleModules) rulemodule.increaseColors(c);
    this.setArrayRuleFromRuleModules();
    if (vverbose) console.log("  => end Pattern.increaseColors()");
  }
  decreaseColors() {
    if (vverbose) console.log("Pattern.decreaseColors() start:");
    let newArrayRule = new Array(int(pow(colors, neighbors))).fill(0);
    if (vvverbose) console.log("this.arrayRule && newArrayRule:");
    if (vvverbose) console.log(this.arrayRule);
    if (vvverbose) console.log(newArrayRule);
    for (let left = 0; left < colors; left++) {
      for (let above = 0; above < colors; above++) {
        for (let right = 0; right < colors; right++) {
          let prevLeft = left;
          let prevAbove = above;
          let prevRight = right;
          let oldNeighborhoodIndex = (colors + 1) * (colors + 1) * prevLeft +
            (colors + 1) * prevAbove + prevRight;
          let neighborhoodIndex = colors * colors * left + colors * above +
            right;
          if (vvverbose) {
            console.log(
              "  " + left + " " + above + " " + right + " " +
                oldNeighborhoodIndex + " " + neighborhoodIndex + " " +
                this.arrayRule[oldNeighborhoodIndex],
            );
          }
          newArrayRule[neighborhoodIndex] =
            this.arrayRule[oldNeighborhoodIndex] === colors
              ? this.arrayRule[oldNeighborhoodIndex] - 1
              : this.arrayRule[oldNeighborhoodIndex];
        }
      }
    }
    seedChangeCount = 0;
    this.period = -1;
    this.neighborhoods = int(pow(colors, neighbors));
    this.ruleModules = [];
    fixedRuleModules = !true;
    setCheckboxValue(checkboxFixedRuleModules, fixedRuleModules);
    this.setArrayRule(newArrayRule);
    if (vverbose) console.log("newArrayRule: ");
    if (vverbose) console.log(newArrayRule);
    if (vverbose) console.log("  => end Pattern.decreaseColors()");
  }
}
class RuleModule {
  constructor(pattern) {
    this.pattern = pattern;
    this.active = false;
    this.neighborhoods = [];
  }
  setOrdinaryNeighborhood(leftSet, aboveSet, rightSet) {
    if (vvverbose) console.log("RuleModule.setOrdinaryNeighborhood() start:");
    this.moduleType = "ordinary";
    this.leftSet = leftSet;
    this.aboveSet = aboveSet;
    this.rightSet = rightSet;
    this.next =
      this.pattern
        .arrayRule[
          colors * colors * leftSet[0] + colors * aboveSet[0] + rightSet[0]
        ];
    if (vvverbose) console.log(leftSet);
    if (vvverbose) console.log(aboveSet);
    if (vvverbose) console.log(rightSet);
    if (vvverbose) console.log(this.next);
    if (vvverbose) console.log("  => end RuleModule.setOrdinaryNeighborhood()");
  }
  setFindSameNeighborhood(type, next) {
    if (vvverbose) console.log("RuleModule.setFindSameNeighborhood() start:");
    this.moduleType = "findsame";
    this.type = type;
    this.next = next;
  }
  copy() {
    let copy = new RuleModule(this.pattern);
    copy.neighborhoods = JSON.parse(JSON.stringify(this.neighborhoods));
    if (this.moduleType === "ordinary") {
      copy.moduleType = "ordinary";
      copy.next = this.next;
      copy.leftSet = this.leftSet.slice();
      copy.aboveSet = this.aboveSet.slice();
      copy.rightSet = this.rightSet.slice();
    } else if (this.moduleType === "totalistic") {
      copy.moduleType = "totalistic";
      copy.next = this.next;
      copy.totalisticType = this.totalisticType;
      copy.neighborhood = this.neighborhood;
    } else if (this.moduleType === "multiset") {
      copy.moduleType = "multiset";
      copy.next = this.next;
      copy.leftSet = this.leftSet.slice();
      copy.aboveSet = this.aboveSet.slice();
      copy.rightSet = this.rightSet.slice();
      copy.multisetType = this.multisetType;
    } else if (this.moduleType === "findsame") {
      copy.moduleType = "findsame";
      copy.next = this.next;
      copy.type = this.type;
    }
    return copy;
  }
  applyColorMapping(m) {
    if (vverbose) console.log("Rulemodule: applyColorMapping");
    if (this.moduleType !== "totalistic" && this.moduleType !== "findsame") {
      this.leftSet = arrayMap(this.leftSet, m.slice());
      this.aboveSet = arrayMap(this.aboveSet, m.slice());
      this.rightSet = arrayMap(this.rightSet, m.slice());
    }
    this.next = m.slice()[this.next];
    for (let neighborhood of this.neighborhoods) {
      neighborhood.left = m.slice()[neighborhood.left];
      neighborhood.above = m.slice()[neighborhood.above];
      neighborhood.right = m.slice()[neighborhood.right];
    }
  }
  setTotalisticNeighborhood(neighborhood, totalisticType) {
    if (vvverbose) console.log("RuleModule.setTotalisticNeighborhood() start:");
    this.moduleType = "totalistic";
    this.totalisticType = totalisticType;
    this.neighborhood = neighborhood;
    for (let left = 0; left < colors; left++) {
      for (let above = 0; above < colors; above++) {
        for (let right = 0; right < colors; right++) {
          let value = (this.totalisticType.includes("L") ? left : 0) +
            (this.totalisticType.includes("A") ? above : 0) +
            (this.totalisticType.includes("R") ? right : 0);
          if (neighborhood === value) {
            this.addNeighborhood(left, above, right);
            this.next =
              this.pattern
                .arrayRule[colors * colors * left + colors * above + right];
          }
        }
      }
    }
    if (vvverbose) {
      console.log("  => end RuleModule.setTotalisticNeighborhood()");
    }
  }
  setDimensions(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
  hasMonochromaticNeighborhood() {
    return this.leftSet !== undefined && this.aboveSet !== undefined &&
      this.rightSet !== undefined && this.leftSet.length === 1 &&
      this.aboveSet.length === 1 && this.rightSet.length === 1 &&
      this.leftSet[0] === this.aboveSet[0] &&
      this.aboveSet[0] === this.rightSet[0];
  }
  lessThanLexicographically(ruleModule) {
    if (
      this.moduleType === "totalistic" && ruleModule.moduleType === "totalistic"
    ) return this.neighborhood - ruleModule.neighborhood;
    if (
      this.moduleType === "multiset" && ruleModule.moduleType === "multiset"
    ) {
      let thisMultiset = this.getMultiset();
      let otherMultiset = ruleModule.getMultiset();
      return arrayLessthan(thisMultiset, otherMultiset) ? -1 : 1;
    }
    if (
      this.moduleType === "findsame" || ruleModule.moduleType === "findsame"
    ) return this.moduleType === "findsame" ? -1 : 1;
    let thisIndex = colors * colors * max(...this.leftSet) +
      colors * max(...this.aboveSet) + max(...this.rightSet);
    let otherIndex = colors * colors * max(...ruleModule.leftSet) +
      colors * max(...ruleModule.aboveSet) + max(...ruleModule.rightSet);
    return thisIndex - otherIndex;
  }
  lessThanOutput(ruleModule) {
    if (this.next !== ruleModule.next) return this.next - ruleModule.next;
    else return this.lessThanLexicographically(ruleModule);
  }
  lessThanMajorityColorCount(ruleModule) {
    if (
      (this.moduleType === "ordinary" || this.moduleType === "multiset") &&
      ruleModule.moduleType === "ordinary" &&
      ruleModule.moduleType === "multiset"
    ) {
      let thisMultiset = this.getMultiset();
      let otherMultiset = ruleModule.getMultiset();
      let thisElementWithHighestFrequency = getNumberWithHighestFrequency(
        thisMultiset,
      );
      let otherElementWithHighestFrequency = getNumberWithHighestFrequency(
        otherMultiset,
      );
      let thisCount = thisMultiset.reduce(
        (a, v) => v === thisElementWithHighestFrequency ? a + 1 : a,
        0,
      );
      let otherCount = otherMultiset.reduce(
        (a, v) => v === otherElementWithHighestFrequency ? a + 1 : a,
        0,
      );
      if (thisCount > 1 && otherCount > 1) {
        if (
          thisElementWithHighestFrequency !== otherElementWithHighestFrequency
        ) {
          return thisElementWithHighestFrequency -
            otherElementWithHighestFrequency;
        } else {if (thisCount !== otherCount) return thisCount - otherCount;
          else {
            let thisRest = thisMultiset.filter((x) =>
              x !== thisElementWithHighestFrequency)[0];
            let otherRest = thisMultiset.filter((x) =>
              x !== thisElementWithHighestFrequency)[0];
            return thisRest - otherRest;
          }}
      } else if (thisCount === 1) return -1;
      else if (otherCount === 1) return 1;
      else return 0;
    } else return 0;
  }
  getMultiset() {
    if (this.moduleType === "multiset") {
      let multiset = [];
      if (this.multisetType.includes("L")) multiset.push(max(...this.leftSet));
      if (this.multisetType.includes("A")) multiset.push(max(...this.aboveSet));
      if (this.multisetType.includes("R")) multiset.push(max(...this.rightSet));
      multiset = reverse(sort(multiset));
      return multiset;
    } else if (this.moduleType === "ordinary") {
      return [...this.aboveSet, ...this.leftSet, ...this.rightSet];
    }
  }
  lessThanMultisetPriority(ruleModule) {
    if (
      this.moduleType === "totalistic" && ruleModule.moduleType === "totalistic"
    ) return this.neighborhood - ruleModule.neighborhood;
    if (
      this.hasMonochromaticNeighborhood() &&
      ruleModule.hasMonochromaticNeighborhood()
    ) return this.leftSet[0] - ruleModule.leftSet[0];
    else if (this.hasMonochromaticNeighborhood()) return 1;
    else if (ruleModule.hasMonochromaticNeighborhood()) return -1;
    if (
      this.moduleType === "multiset" && ruleModule.moduleType === "multiset"
    ) return 1;
    else if (this.moduleType === "multiset") return 1;
    else if (ruleModule.moduleType === "multiset") return -1;
    return -1;
  }
  sortNeighborhoods() {
    this.neighborhoods.sort((a, b) => {
      if (a.left < b.left) return -1;
      else {if (a.above < b.above) return -1;
        else {if (a.right < b.right) return -1;
          else return 0;}}
    });
  }
  addNeighborhood(leftColor, aboveColor, rightColor) {
    this.neighborhoods.push({
      left: leftColor,
      above: aboveColor,
      right: rightColor,
    });
    this.sortNeighborhoods();
  }
  getNeighborhoods() {
    return this.neighborhoods;
  }
  addNeighborhoods(N) {
    for (let n of N) this.neighborhoods.push(n);
    this.sortNeighborhoods();
  }
  updateNeighborhoodsAutomatically() {
    if (vverbose) {
      console.log("Rulemodule.updateNeighborhoodsAutomatically() start:");
    }
    this.neighborhoods = [];
    for (let l of this.leftSet) {
      for (let a of this.aboveSet) {
        for (let r of this.rightSet) {
          this.neighborhoods.push({ left: l, above: a, right: r });
        }
      }
    }
    this.sortNeighborhoods();
    if (vverbose) console.log(this.neighborhoods);
    if (vverbose) {
      console.log("  => end Rulemodule.updateNeighborhoodsAutomatically()");
    }
  }
  isOrdinary() {
    if (vvverbose) {
      console.log(
        "        isOrdinary(): " + this.leftSet.length + " " +
          this.aboveSet.length + " " + this.rightSet.length,
      );
    }
    if (vvverbose) {
      console.log("        returns " + (this.moduleType === "ordinary"));
    }
    return this.moduleType === "ordinary";
  }
  isClosedOn(set) {
    if (set.includes(this.next)) return true;
    for (let n of this.neighborhoods) {
      if (
        set.includes(n.left) && set.includes(n.above) && set.includes(n.right)
      ) return false;
    }
    return true;
  }
  isClosed() {
    for (let n of this.neighborhoods) {
      if (
        this.next !== n.left && this.next !== n.above && this.next !== n.right
      ) return false;
    }
    return true;
  }
  isSemiClosed() {
    for (let n of this.neighborhoods) {
      if (n.left === n.above && n.above === n.right) continue;
      if (
        this.next !== n.left && this.next !== n.above && this.next !== n.right
      ) return false;
    }
    return true;
  }
  isNotSemiClosed() {
    for (let n of this.neighborhoods) {
      if (n.left === n.above && n.above === n.right) continue;
      if (
        this.next !== n.left && this.next !== n.above && this.next !== n.right
      ) return true;
    }
    return false;
  }
  getNeighborhoodIndex() {
    return this.neighborhoodIndex;
  }
  getNext(left, above, right) {
    if (vvverbose) {
      console.log("getNext, checking: " + left + " " + above + " " + right);
    }
    for (let n of this.neighborhoods) {
      if (left === n.left && above === n.above && right === n.right) {
        if (vvverbose) console.log("    returning: " + this.next);
        return this.next;
      }
    }
    return false;
  }
  incrementNext() {
    if (vverbose) console.log("incrementNext");
    this.next = (this.next + 1) % colors;
  }
  decrementNext() {
    this.next = (this.next + colors - 1) % colors;
  }
  subsumedBy(ruleModule) {
    let value = arraySubset(this.leftSet, ruleModule.leftSet) &&
      arraySubset(this.aboveSet, ruleModule.aboveSet) &&
      arraySubset(this.rightSet, ruleModule.rightSet);
    return value;
  }
  subsumes(ruleModule) {
    let value = arraySubset(ruleModule.leftSet, this.leftSet) &&
      arraySubset(ruleModule.aboveSet, this.aboveSet) &&
      arraySubset(ruleModule.rightSet, this.rightSet);
    return value;
  }
  overlapsWith(ruleModule) {
    let value = false;
    search: for (let l of ruleModule.leftSet) {
      for (let a of ruleModule.aboveSet) {
        for (let r of ruleModule.rightSet) {
          if (this.matches(l, a, r, false)) {
            value = true;
            break search;
          }
        }
      }
    }
    return value;
  }
  getMultisetValue() {
    return multisetValue(this.left, this.above, this.right);
  }
  getTotalisticValue() {
    if (this.moduleType === "totalistic") return this.neighborhood;
    else if (this.moduleType === "findsame") return -1;
    else return this.leftSet[0] + this.aboveSet[0] + this.rightSet[0];
  }
  matchesRuleModule(otherRuleModule) {
    if (this.moduleType === "partial") {
      if (otherRuleModule.moduleType === "partial") {
        return this.partialMatch(left, above, right);
      }
    } else if (this.moduleType === "multiset") {
      return this.multisetMatch(left, above, right);
    } else {return left === this.left && above === this.above &&
        right === this.right;}
  }
  generalizedMatches(Lefts, Aboves, Rights) {
    let result = true;
    if (this.moduleType === "partial") {
      for (let l of Lefts) {
        for (let a of Aboves) {
          for (let r of Rights) if (!this.partialMatch(l, a, r)) return false;
        }
      }
      return this.partialMatch(left, above, right);
    }
  }
  matches(l, a, r, multiSetMatches = false) {
    if (vvverbose) {
      console.log("        matches(): " + l + " " + a + " " + r + " with:");
    }
    if (vvverbose) console.log(this);
    if (multiSetMatches === false && this.moduleType === "multiset") {
      multiSetMatches = this.multisetType;
    }
    if (multiSetMatches !== false) {
      let value;
      if (multiSetMatches === "LA") {
        value = this.leftSet.includes(l) && this.aboveSet.includes(a) ||
          this.leftSet.includes(a) && this.aboveSet.includes(l);
      } else if (multiSetMatches === "AR") {
        value = this.aboveSet.includes(a) && this.rightSet.includes(r) ||
          this.aboveSet.includes(r) && this.rightSet.includes(a);
      } else if (multiSetMatches === "LR") {
        value = this.leftSet.includes(l) && this.rightSet.includes(r) ||
          this.leftSet.includes(r) && this.rightSet.includes(l);
      } else {value =
          this.leftSet.includes(l) && this.aboveSet.includes(a) &&
            this.rightSet.includes(r) ||
          this.leftSet.includes(l) && this.aboveSet.includes(r) &&
            this.rightSet.includes(a) ||
          this.leftSet.includes(a) && this.aboveSet.includes(l) &&
            this.rightSet.includes(r) ||
          this.leftSet.includes(a) && this.aboveSet.includes(r) &&
            this.rightSet.includes(l) ||
          this.leftSet.includes(r) && this.aboveSet.includes(l) &&
            this.rightSet.includes(a) ||
          this.leftSet.includes(r) && this.aboveSet.includes(a) &&
            this.rightSet.includes(l);}
      if (vvverbose) console.log("        returns " + value);
      return value;
    } else {
      let value = this.leftSet.includes(l) && this.aboveSet.includes(a) &&
        this.rightSet.includes(r);
      if (vvverbose) console.log("        returns " + value);
      return value;
    }
  }
  multisetMatch(left, above, right) {
    if (vverbose) {
      console.log(
        "      multisetMatch (" + this.moduleType + "): " + left + " " + above +
          " " + right + " with " + this.left + " " + this.above + " " +
          this.right,
      );
    }
    if (this.moduleType === "partial") {
      let Lefts = this.left < 0 ? [...Array(colors).keys()] : [this.left];
      let Aboves = this.above < 0 ? [...Array(colors).keys()] : [this.above];
      let Rights = this.right < 0 ? [...Array(colors).keys()] : [this.right];
      if (vverbose) {
        console.log(
          "        comparing " + left + " " + above + " " + right + " with [" +
            Lefts + "] [" + Aboves + "] [" + Rights + "]",
        );
      }
      for (let l of Lefts) {
        for (let a of Aboves) {
          for (let r of Rights) {
            if (multisetValue(left, above, right) === multisetValue(l, a, r)) {
              if (vverbose) console.log("        returning true");
              return true;
            }
          }
        }
      }
      if (vverbose) console.log("        returning false");
      return false;
    } else {
      let result =
        multisetValue(left, above, right) ===
          multisetValue(this.left, this.above, this.right);
      if (vverbose) console.log("        returning " + result);
      return result;
    }
  }
  partialMatch(left, above, right) {
    return (left < 0 || this.left < 0 ? true : left === this.left) &&
      (above < 0 || this.above < 0 ? true : above === this.above) &&
      (right < 0 || this.right < 0 ? true : right === this.right);
  }
  dealWithMousePressed(mx, my) {
    if (vverbose) {
      console.log(
        "dealWithMousePressed (in RuleModule)" +
          (pressedKey(SHIFT) ? " with SHIFT key" : ""),
      );
    }
    if (
      this.x <= mx && mx <= this.x + this.w && this.y <= my &&
      my <= this.y + this.h
    ) {
      if (vverbose) console.log("    inside!");
      if (vverbose) console.log(this);
      // if (mobile) {
        this.incrementNext();
        currentPattern.setArrayRuleFromRuleModules();
        startArrayRule = currentPattern.arrayRule;
        draw();
      // } else {if (this.active === false) this.active = true;
      //   else this.active = false;}
      return true;
    }
  }
  dealWithMouseWheeled(mx, my, e) {
    // if (vverbose) {
    //   console.log(
    //     "dealWithMouseWheeled (in RuleModule)" +
    //       (pressedKey(SHIFT) ? " with SHIFT key" : ""),
    //   );
    // }
    // if (
    //   this.x <= mx && mx <= this.x + this.w && this.y <= my &&
    //   my <= this.y + this.h
    // ) {
    //   if (vverbose) console.log("    inside!");
    //   if (vverbose) console.log(this);
    //   if (e.deltaY < 0) this.decrementNext();
    //   else this.incrementNext();
    //   currentPattern.setArrayRuleFromRuleModules();
    //   return true;
    // }
  }
  show() {
    if (vvverbose) console.log("Showing rule module.");
    if (this.active === true) {
      strokeWeight(this.w * .0094);
      if (this.active === true) {
        stroke(0, 100);
        fill(240);
      } else {
        stroke(0, 20);
        fill(255);
      }
      let pad = this.w * .02;
      rect(
        this.x + pad,
        this.y + pad,
        this.w - 2 * pad,
        this.h - 2 * pad,
        this.w * .1,
      );
    }
    let cW = .7 * (this.w / 3) / (this.moduleType === "totalistic" ? 1.5 : 1);
    let cH = cW / .75;
    let bW = cW * .95;
    let bH = cH * .95;
    let hOff = (this.h - cH * 2) / 2;
    let wOff = (this.w - cW * 3) / 2;
    let leftX = this.x + wOff + .3 * cW +
      (this.moduleType === "totalistic" ? -.5 * cW : 0);
    let leftY = this.y + hOff + .5 * cH +
      (this.moduleType === "totalistic" ? -.25 * cH : 0);
    let aboveX = this.x + wOff + 1.5 * cW +
      (this.moduleType === "totalistic" ? -.5 * cW : 0);
    let aboveY = this.y + hOff + .5 * cH +
      (this.moduleType === "totalistic" ? -.25 * cH : 0);
    let rightX = this.x + wOff + 2.7 * cW +
      (this.moduleType === "totalistic" ? -.5 * cW : 0);
    let rightY = this.y + hOff + .5 * cH +
      (this.moduleType === "totalistic" ? -.25 * cH : 0);
    let nextX = this.x + wOff + 1.5 * cW +
      (this.moduleType === "totalistic" ? -.5 * cW : 0);
    let nextY = this.y + hOff + 1.8 * cH +
      (this.moduleType === "totalistic" ? +.25 * cH : 0);
    if (showBoundingBox) {
      noFill();
      strokeWeight(this.w * .0094);
      stroke(0, 118);
      push();
      translate(this.x, this.y);
      line(0, hOff, this.w, hOff);
      line(0, this.h - hOff, this.w, this.h - hOff);
      line(wOff, 0, wOff, this.h);
      line(this.w - wOff, 0, this.w - wOff, this.h);
      pop();
    }
    if (staggered && this.moduleType !== "multiset") {
      leftY += .5 * cH;
      rightY += .5 * cH;
    }
    if (this.moduleType === "multiset") {
      fill(128);
      noStroke();
      textSize(2 * bH);
      textAlign(CENTER, CENTER);
      text("{", leftX - .8 * bW, leftY);
      textAlign(CENTER, CENTER);
      text("}", rightX + .8 * bW, rightY);
    }
    strokeWeight(cW * .02);
    if (this.moduleType === "findsame") {
      noFill();
      stroke(0, 0, 0, 100);
      strokeWeight(cW * borderWidth * .01);
      rulebead(aboveX, aboveY, bW * 2, bH, bW * 0);
      fill(0, 0, 0, 50);
      noStroke();
      currentFill = color(255);
      textWithAdjustedColor(this.type, aboveX, aboveY, bH);
    } else if (this.moduleType === "totalistic") {
      if (this.totalisticType.includes("L")) {
        fill(0, 0, 0, 50);
        noStroke();
        rulebead(leftX, leftY, bW, bH, bW * .3);
      }
      if (this.totalisticType.includes("R")) {
        fill(0, 0, 0, 50);
        noStroke();
        rulebead(rightX, rightY, bW, bH, bW * .3);
      }
      if (this.totalisticType.includes("A")) {
        fill(0, 0, 0, 50);
        noStroke();
        rulebead(aboveX, aboveY, bW, bH, bW * .3);
      }
      currentFill = color(255);
      noStroke();
      textWithAdjustedColor("+", aboveX, aboveY + .75 * cH, bH);
      textWithAdjustedColor("=", rightX + 1 * cW, aboveY + .75 * cH, bH);
      textWithAdjustedColor(
        this.neighborhood,
        rightX + 1.75 * cW,
        aboveY + .75 * cH,
        bH,
      );
    } else {
      let sets = [this.leftSet, this.aboveSet, this.rightSet];
      let colorsPresent = sets.map((x) => x[0]);
      if (vverbose) {
        console.log("from " + colorsPresent + " to " + sets.map((x) => x[0]));
      }
      const lSet = sets[0];
      const aSet = sets[1];
      const rSet = sets[2];
      if (lSet.length === colors) {
        currentFill = color(255);
        noStroke();
        textWithAdjustedColor("?", leftX, leftY, bH);
      } else if (lSet.length === 1) {
        setColor(lSet[0], 0, 0);
        if (showRuleModuleBorder || brightness(currentFill) > 250) {
          stroke(128);
          strokeWeight(cW * borderWidth * .005);
        } else {
          stroke(currentFill);
          strokeWeight(cW * .003);
        }
        if (this.moduleType !== "multiset" || this.multisetType.includes("L")) {
          rulebead(leftX, leftY, bW, bH, bW * .3);
          textWithAdjustedColor(lSet[0], leftX, leftY, bH);
        }
      } else {for (let i = 0; i < lSet.length; i++) {
          setColor(lSet[i], 0, 0);
          if (showRuleModuleBorder || brightness(currentFill) > 250) {
            stroke(128);
            strokeWeight(cW * borderWidth * .005);
          } else {
            stroke(currentFill);
            strokeWeight(cW * .003);
          }
          rulebeadPart(i, lSet.length, leftX, leftY, bW, bH, bW * .3);
          textWithAdjustedColorPart(
            i,
            lSet.length,
            lSet[i],
            leftX,
            leftY,
            bW,
            bH,
          );
        }}
      if (aSet.length === colors) {
        currentFill = color(255);
        noStroke();
        textWithAdjustedColor("?", aboveX, aboveY, bH);
      } else if (aSet.length === 1) {
        setColor(aSet[0], 0, 0);
        if (showRuleModuleBorder || brightness(currentFill) > 250) {
          stroke(128);
          strokeWeight(cW * borderWidth * .005);
        } else {
          stroke(currentFill);
          strokeWeight(cW * .003);
        }
        if (this.moduleType !== "multiset" || this.multisetType.includes("A")) {
          rulebead(aboveX, aboveY, bW, bH, bW * .3);
          textWithAdjustedColor(aSet[0], aboveX, aboveY, bH);
        }
      } else {for (let i = 0; i < aSet.length; i++) {
          setColor(aSet[i], 0, 0);
          if (showRuleModuleBorder || brightness(currentFill) > 250) {
            stroke(128);
            strokeWeight(cW * borderWidth * .005);
          } else {
            stroke(currentFill);
            strokeWeight(cW * .003);
          }
          rulebeadPart(i, aSet.length, aboveX, aboveY, bW, bH, bW * .3);
          textWithAdjustedColorPart(
            i,
            aSet.length,
            aSet[i],
            aboveX,
            aboveY,
            bW,
            bH,
          );
        }}
      if (rSet.length === colors) {
        currentFill = color(255);
        noStroke();
        textWithAdjustedColor("?", rightX, rightY, bH);
      } else if (rSet.length === 1) {
        setColor(rSet[0], 0, 0);
        if (showRuleModuleBorder || brightness(currentFill) > 250) {
          stroke(128);
          strokeWeight(cW * borderWidth * .005);
        } else {
          stroke(currentFill);
          strokeWeight(cW * .003);
        }
        if (this.moduleType !== "multiset" || this.multisetType.includes("R")) {
          rulebead(rightX, rightY, bW, bH, bW * .3);
          textWithAdjustedColor(rSet[0], rightX, rightY, bH);
        }
      } else {for (let i = 0; i < rSet.length; i++) {
          setColor(rSet[i], 0, 0);
          if (showRuleModuleBorder || brightness(currentFill) > 250) {
            stroke(128);
            strokeWeight(cW * borderWidth * .005);
          } else {
            stroke(currentFill);
            strokeWeight(cW * .003);
          }
          rulebeadPart(i, rSet.length, rightX, rightY, bW, bH, bW * .3);
          textWithAdjustedColorPart(
            i,
            rSet.length,
            rSet[i],
            rightX,
            rightY,
            bW,
            bH,
          );
        }}
    }
    setColor(this.next, 0, 0);
    if (showRuleModuleBorder || brightness(currentFill) > 250) {
      stroke(128);
      strokeWeight(cW * borderWidth * .03);
    } else {
      stroke(currentFill);
      strokeWeight(cW * .01);
    }
    rulebead(nextX, nextY, bW*1.2, bH*1.2, bW * .3);
    textWithAdjustedColor(this.next, nextX, nextY, bH);
    let count = 0;
    let componentCount = 0;
    for (let neighborhood of this.neighborhoods) {
      let neighborhoodIndex = colors * colors * neighborhood.left +
        colors * neighborhood.above + neighborhood.right;
      count += currentPattern.neigborhoodCount[neighborhoodIndex];
      componentCount += currentPattern.componentStatus[neighborhoodIndex];
    }
    let totalCount = currentPattern.neigborhoodCountTotal;
    if (markInactiveComponents) {
      if (componentCount == 0) {
        noStroke();
        fill(255, 200);
        rect(this.x, this.y, this.w, this.h);
      }
    }
    if (showCounters) {
      if (showPercentages) {
        let per = 100 * count / totalCount;
        if (per > 100 / pow(colors, neighbors)) fill(0, 255, 255);
        else fill(0);
        textAlign(CENTER, CENTER);
        text(
          "" + nf(per, 0, 2) + "%",
          this.x + this.w / 2,
          this.y + this.h - hOff / 2,
        );
      } else {
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(.5 * bH);
        text("" + count + "", this.x + this.w / 2, this.y + this.h - hOff / 2);
      }
    }
  }
  toString() {
    let str = "";
    str += "[";
    str += "[" + this.leftSet + "],";
    str += "[" + this.aboveSet + "],";
    str += "[" + this.rightSet + "]] => ";
    str += this.next;
    return str;
  }
  toCode() {
    let str = "";
    str += this.leftSet.join("");
    str += this.aboveSet.join("");
    str += this.rightSet.join("");
    str += this.next;
    return str;
  }
  increaseColors(c) {
    if (c === undefined) c = colors - 2;
    if (vverbose) console.log("RuleModule: increaseColors(" + c + ") start:");
    if (vverbose) console.log("colors = " + colors);
    if (vverbose) console.log("old leftSet: " + this.leftSet);
    if (vverbose) console.log("old aboveSet: " + this.aboveSet);
    if (vverbose) console.log("old rightSet: " + this.rightSet);
    if (this.leftSet.includes(c)) this.leftSet.push(colors - 1);
    if (vverbose) console.log("new leftSet: " + this.leftSet);
    if (this.aboveSet.includes(c)) this.aboveSet.push(colors - 1);
    if (vverbose) console.log("new aboveSet: " + this.aboveSet);
    if (this.rightSet.includes(c)) this.rightSet.push(colors - 1);
    if (vverbose) console.log("new rightSet: " + this.rightSet);
    this.updateNeighborhoodsAutomatically();
    if (vverbose) console.log("  => end increaseColors()");
  }
}
function getRuleFromString(str) {
  if (verbose) console.log("getRuleFromString() start: " + str);
  str = decodeURIComponent(str);
  if (vvverbose) console.log("    str is (after decodeURIComponent): " + str);
  if (!isNaN(str)) {
    if (vvverbose) console.log("    str is a number: " + str);
    if (vverbose) console.log("    => end getRuleFromString()");
    return createArrayRuleFromNumber(str);
  } else if (
    str.charAt(0) === "l" && str.charAt(1) === "r" && !isNaN(str.slice(2))
  ) {
    if (vverbose) console.log("    => end getRuleFromString()");
    return createArrayRuleFromNumber(str.slice(2), "lr");
  } else if (str.charAt(0) == "[" && str.charAt(str.length - 1) == "]") {
    if (vvverbose) console.log("    str starts/ends with []");
    str = str.slice(1, -1);
    if (vvverbose) console.log("    rest after stripping [] is: " + str);
    if (vverbose) console.log("    => end getRuleFromString()");
    return stringToArray(str, int(pow(colors, neighbors)), colors, false);
  } else if (str.charAt(0) == "t") {
    if (vvverbose) console.log("    starts with t");
    str = str.slice(1);
    if (isNaN(str)) {
      if (vvverbose) console.log("    rest is not a number");
      if (
        str.charAt(0) == "[" && str.charAt(str.length - 1) == "]" ||
        str.charAt(0) == "%5D" && str.charAt(str.length - 1) == "%5D"
      ) {
        if (vvverbose) console.log("    rest starts/ends with []");
        str = str.slice(1, -1);
        if (vvverbose) console.log("    rest after stripping [] is: " + str);
        totalisticMode = true;
        startTotalisticArrayRule = createTotalisticArrayRuleFromString(str);
        if (vverbose) console.log("    => end getRuleFromString()");
        return createArrayRuleFromTotalisticArrayRule(startTotalisticArrayRule);
      } else {
        if (vvverbose) console.log("    something else: set random rule");
        if (vverbose) console.log("    => end getRuleFromString()");
        return randomRule();
      }
    } else {
      if (vvverbose) console.log("    rest is a number");
      totalisticMode = true;
      startTotalisticArrayRule = createTotalisticArrayRuleFromNumber(str);
      if (vverbose) console.log("    => end getRuleFromString()");
      return createArrayRuleFromTotalisticArrayRule(startTotalisticArrayRule);
    }
  } else {
    if (vverbose) console.log("    => end getRuleFromString()");
    if (vverbose) console.log("    something is wrong; returning random rule");
    return randomRule();
  }
}
function randomRule() {
  if (vvverbose) console.log("randomRule() start");
  let arrayRule = new Array(int(pow(colors, neighbors))).fill(0);
  for (let i = 0; i < int(pow(colors, neighbors)); i++) {
    arrayRule[i] = floor(random(colors));
  }
  if (vvverbose) console.log(arrayRule);
  if (vvverbose) console.log("    => end randomRule()");
  return nextRule(arrayRule);
}
function setRandomRuleFromModules() {
  if (vvverbose) console.log("setRandomRuleFromModules()");
  let pattern = currentPattern;
  if (vverbose) console.log("pattern");
  if (vverbose) console.log(pattern);
  for (let ruleModule of pattern.ruleModules) {
    ruleModule.next = floor(random(colors));
  }
  pattern.setArrayRuleFromRuleModules();
  if (vvverbose) console.log("    => end setRandomRuleFromModules()");
}
function nextRule(rule) {
  if (vverbose) console.log("nextRule: " + rule);
  if (totalisticMode) return incrementRule(rule);
  else {if (filterTotalistic) return nextTotalisticArrayRule(rule);
    else if (filterSymmetric) return nextSymmetricRule(rule);
    else if (filterPersistent) return nextPersistentRule(rule);
    else return incrementRule(rule);}
}
function previousRule(rule) {
  if (filterTotalistic) return previousTotalisticArrayRule(rule);
  else if (filterSymmetric) return previousSymmetricRule(rule);
  else if (filterPersistent) return previousPersistentRule(rule);
  else return decrementRule(rule);
}
function incrementRule(rule) {
  if (vverbose) console.log("incrementRule: " + rule);
  for (let i = 0; i < rule.length; i++) {
    if (rule[i] == colors - 1) rule[i] = 0;
    else {
      rule[i] = rule[i] + 1;
      break;
    }
  }
  if (vverbose) console.log("    returns: " + rule);
  return rule;
}
function incrementRulePartial(rule, i) {
  if (vverbose) console.log("incrementRulePartial: " + rule + " with " + i);
  let result = rule;
  result[i] = (result[i] + 1) % colors;
  if (vverbose) console.log("    returns: " + result);
  return result;
}
function incrementRulePartialMultiset(rule, i) {
  if (vverbose) {
    console.log("incrementRulePartialMultiset: " + rule + " with " + i);
  }
  let result = rule;
  for (let left = 0; left < colors; left++) {
    for (let above = 0; above < colors; above++) {
      for (let right = 0; right < colors; right++) {
        let neighborhoodIndex = colors * colors * left + colors * above + right;
        let multiset = sort([left, above, right]);
        let multisetIndex = colors * colors * multiset[0] +
          colors * multiset[1] + multiset[2];
        if (multisetIndex === i) {
          result[neighborhoodIndex] = (result[neighborhoodIndex] + 1) % colors;
        }
      }
    }
  }
  if (vverbose) console.log("    returning: " + result);
  return result;
}
function changeRulePartialMultiset(rule, i, next) {
  if (vverbose) {
    console.log(
      "changeRulePartialMultiset: " + rule + " for " + i + " with " + next,
    );
  }
  let result = rule;
  for (let left = 0; left < colors; left++) {
    for (let above = 0; above < colors; above++) {
      for (let right = 0; right < colors; right++) {
        let neighborhoodIndex = colors * colors * left + colors * above + right;
        let multiset = sort([left, above, right]);
        let multisetIndex = colors * colors * multiset[0] +
          colors * multiset[1] + multiset[2];
        if (vverbose) {
          console.log(
            "comparing multisetIndex " + multisetIndex + " with i " + i,
          );
        }
        if (multisetIndex === i) {
          if (vverbose) {
            console.log("    modifying the rule array with " + next);
          }
          result[neighborhoodIndex] = next;
        }
      }
    }
  }
  if (vverbose) console.log("    returning: " + result);
  return result;
}
function decrementRule(rule) {
  if (vverbose) console.log("decrementRule: " + rule);
  for (let i = 0; i < rule.length; i++) {
    if (rule[i] == 0) rule[i] = colors - 1;
    else {
      rule[i] = rule[i] - 1;
      break;
    }
  }
  if (vverbose) console.log("    result: " + rule);
  return rule;
}
function randomTotalisticArrayRule() {
  let totalisticRule = new Array((colors - 1) * neighbors + 1).fill(0);
  for (let i = 0; i < totalisticRule.length; i++) {
    totalisticRule[i] = floor(random(colors));
  }
  return totalisticRule;
}
function createArrayRuleFromNumber(N, ruleType = "lar") {
  if (vverbose) {
    console.log("createArrayRuleFromNumber: " + N + " (" + ruleType + ")");
  }
  let arrayRule = new Array(int(pow(colors, neighbors))).fill(0);
  if (ruleType === "lar") {
    for (let i = 0; i < int(pow(colors, neighbors)); i++) {
      arrayRule[i] = N % colors;
      N = floor(N / colors);
    }
  } else {
    if (vverbose) console.log("twoArrayRule");
    let twoArrayRule = new Array(int(pow(colors, 2))).fill(0);
    for (let i = 0; i < int(pow(colors, 2)); i++) {
      twoArrayRule[i] = N % colors;
      N = floor(N / colors);
    }
    if (vverbose) console.log(twoArrayRule);
    for (let i = 0; i < int(pow(colors, neighbors)); i++) {
      arrayRule[i] = twoArrayRule[mapNumericNeighborhood(i, ruleType)];
    }
    if (vverbose) console.log("arrayRule");
    if (vverbose) console.log(arrayRule);
  }
  if (vverbose) console.log("    returning: " + arrayRule);
  return arrayRule;
}
function mapNumericNeighborhood(neighborhoodIndex, targetType) {
  let left = floor(neighborhoodIndex / (colors * colors));
  let above = floor(neighborhoodIndex / colors) % colors;
  let right = neighborhoodIndex % colors;
  if (targetType === "lr") return left * colors + right;
  else if (targetType === "la") return left * colors + above;
  else if (targetType === "ar") return above * colors + right;
  else return neighborhoodIndex;
}
function createTotalisticArrayRuleFromNumber(N) {
  if (vverbose) console.log("createTotalisticArrayRuleFromNumber: " + N);
  let neighborhoods = (colors - 1) * neighbors + 1;
  let base = colors;
  let trule = new Array(neighborhoods).fill(0);
  for (let i = 0; i < neighborhoods; i++) {
    trule[i] = N % base;
    N = floor(N / base);
  }
  if (vverbose) console.log("    returning: " + trule);
  return trule;
}
function createArrayRuleFromTotalisticArrayRule(totalisticRule) {
  if (vverbose) {
    console.log("createArrayRuleFromTotalisticArrayRule: " + totalisticRule);
  }
  let arrayRule = new Array(int(pow(colors, neighbors))).fill(0);
  if (vverbose) console.log("    return: " + arrayRule);
  return arrayRule;
}
function createTotalisticArrayRuleFromArrayRule(arrayRule) {
  if (vverbose) {
    console.log(
      "createTotalisticArrayRuleFromArrayRule: " + formatRule(arrayRule),
    );
  }
  let neighborhoods = (colors - 1) * neighbors + 1;
  let base = colors + 1;
  let totalisticArrayRule = new Array(neighborhoods).fill(0);
  for (let left = 0; left < colors; left++) {
    for (let above = 0; above < colors; above++) {
      for (let right = 0; right < colors; right++) {
        let neighborhoodIndex = colors * colors * left + colors * above + right;
        let input = left + above + right;
        let output = arrayRule[neighborhoodIndex];
        totalisticArrayRule[input] = output;
      }
    }
  }
  if (vverbose) console.log("returning: " + totalisticArrayRule);
  return totalisticArrayRule;
}
function createTotalisticArrayRuleFromString(str) {
  if (vverbose) console.log("createTotalisticArrayRuleFromString: " + str);
  let len = (colors - 1) * neighbors + 1;
  str = pad(str, len);
  if (vverbose) console.log("    with padding: " + str);
  let totalisticArrayRule = new Array(len).fill(0);
  for (let i = 0; i < len; i++) {
    totalisticArrayRule[i] = str.charAt(len - (1 + i)) % colors;
  }
  if (vverbose) console.log("    return: " + totalisticArrayRule);
  return totalisticArrayRule;
}
function dualrule(rule) {
  let neighborhoods = int(pow(colors, neighbors));
  let newRule = [];
  for (let i = 0; i < neighborhoods; i++) {
    newRule[i] = (rule[neighborhoods - 1 - i] + 1) % colors;
  }
  return newRule;
}
function getRuleName(pattern) {
  if (vverbose) console.log("getRuleName() start: " + pattern.arrayRule);
  let result;
  result = ruleNames.get(ruleToString(pattern));
  if (vverbose) console.log("    " + result + " ruleName");
  if (result !== undefined) {
    if (vverbose) console.log("    not undefined, returning: " + result);
    return result;
  }
  if (vverbose) console.log("    " + result + " ruleName");
  result = ruleNames.get(numeric(pattern.arrayRule));
  if (vverbose) console.log("    " + result + " ruleName");
  if (result !== undefined) {
    if (vverbose) console.log("    not undefined, returning: " + result);
    return result;
  }
  if (vverbose) console.log("    undefined, returning empty string: ");
  if (vverbose) console.log("    => getRuleName() end.");
  return "";
}
function numeric(rule) {
  let B = 0;
  let F = 1;
  for (let i = 0; i < rule.length; i++) {
    B = B + F * rule[i];
    F = F * colors;
  }
  return B;
}
function formatRule(arrayRule) {
  let result = "";
  for (let i = 0; i < arrayRule.length; i++) {
    if (arrayRule[i] == -1) result = "_" + result;
    else result = arrayRule[i] + result;
  }
  return result;
}
function nextSymmetricRule(arrayRule) {
  if (vverbose) {
    console.log(
      "nextSymmetricRule: " + numeric(arrayRule) + " " + formatRule(arrayRule),
    );
  }
  if (!isSymmetric(arrayRule)) {
    if (vverbose) console.log("   rule provided NOT symmetric, so making it");
    arrayRule = makeSymmetric(arrayRule);
    if (filterPersistent) {
      if (isPersistent(arrayRule)) return arrayRule;
      else return nextSymmetricRule(arrayRule);
    } else return arrayRule;
  }
  for (let i = 0; i < int(pow(colors, neighbors)); i++) {
    let variant = symmetricComponent(i);
    if (i >= variant) {
      if (arrayRule[i] == colors - 1) {
        if (vverbose) console.log("setting both to " + 0);
        arrayRule[i] = 0;
        arrayRule[variant] = 0;
      } else {
        if (vverbose) {
          console.log("increasing both to " + int(arrayRule[i] + 1));
        }
        arrayRule[i] = arrayRule[i] + 1;
        arrayRule[variant] = arrayRule[i];
        break;
      }
    }
  }
  if (isSymmetric(arrayRule)) {
    if (vverbose) console.log("   is symmetric");
    if (filterPersistent) {
      if (vverbose) console.log("   checking persistence");
      if (isPersistent(arrayRule)) return arrayRule;
      else return nextSymmetricRule(arrayRule);
    } else return arrayRule;
  } else return nextSymmetricRule(arrayRule);
}
function previousSymmetricRule(arrayRule) {
  if (vverbose) {
    console.log(
      "nextSymmetricRule: " + numeric(arrayRule) + " " + formatRule(arrayRule),
    );
  }
  if (!isSymmetric(arrayRule)) return makeSymmetric(arrayRule);
  for (let i = 0; i < int(pow(colors, neighbors)); i++) {
    if (i >= variant) {
      if (vverbose) console.log("i >= variant");
      if (arrayRule[i] == 0) {
        if (vverbose) {
          console.log(
            "value is 0 so decreasing setting both to " + int(colors - 1),
          );
        }
        if (vverbose) {
          console.log("  setting rule[" + i + "] to " + (colors - 1));
        }
        arrayRule[i] = colors - 1;
        if (vverbose) {
          console.log("  setting rule[" + variant + "] to " + (colors - 1));
        }
        arrayRule[variant] = colors - 1;
      } else {
        if (vverbose) {
          console.log("decreasing both to " + int(arrayRule[i] - 1));
        }
        if (vverbose) {
          console.log("  setting rule[" + i + "] to " + (arrayRule[i] - 1));
        }
        arrayRule[i] = arrayRule[i] - 1;
        if (vverbose) {
          console.log("  setting rule[" + variant + "] to " + arrayRule[i]);
        }
        arrayRule[variant] = arrayRule[i];
        break;
      }
    }
  }
  if (isSymmetric(arrayRule)) {
    if (vverbose) console.log("returning " + arrayRule);
    return arrayRule;
  } else {
    if (vverbose) console.log("calling previousSymmetricRule(rule) again");
    return previousSymmetricRule(arrayRule);
  }
}
function isSymmetric(arrayRule) {
  if (vverbose) console.log("isSymmetric(" + formatRule(arrayRule) + ");");
  let result = 1;
  search: for (let left = 0; left < colors; left++) {
    for (let above = 0; above < colors; above++) {
      for (let right = 0; right < colors; right++) {
        let neighborhoodIndex = colors * colors * left + colors * above + right;
        let symmetricNeighborhoodIndex = colors * colors * right +
          colors * above + left;
        if (
          arrayRule[neighborhoodIndex] != arrayRule[symmetricNeighborhoodIndex]
        ) {
          result = 0;
          break search;
        }
      }
    }
  }
  if (vverbose) console.log("    isSymmetric result: " + result);
  return result;
}
function symmetricComponent(neighborhoodIndex) {
  let left = floor(neighborhoodIndex / (colors * colors));
  let above = floor(neighborhoodIndex / colors) % colors;
  let right = neighborhoodIndex % colors;
  let symmetricNeighborhoodIndex = colors * colors * right + colors * above +
    left;
  return symmetricNeighborhoodIndex;
}
function makeSymmetric(arrayRule) {
  if (vverbose) console.log("makeSymmetric: " + arrayRule);
  for (let i = 0; i < int(pow(colors, neighbors)); i++) {
    let variant = symmetricComponent(i);
    if (i < variant && arrayRule[i] != arrayRule[variant]) {
      arrayRule[i] = arrayRule[variant];
    }
  }
  if (vverbose) console.log("    result:        " + arrayRule);
  return arrayRule;
}
function nextTotalisticArrayRule(arrayRule) {
  if (vverbose) {
    console.log("next Totalistic Rule for " + formatRule(arrayRule));
  }
  if (!isTotalistic(arrayRule)) return makeTotalistic(arrayRule);
  else {for (let i = 0; i < int(pow(colors, neighbors)); i++) {
      let variants = totalisticComponents(i);
      if (vverbose) console.log("variants for " + i + " = " + variants);
      if (vverbose) {
        console.log("comparing i = " + i + " to variants[0] = " + variants[0]);
      }
      if (i == variants[0]) {
        if (vverbose) {
          console.log(
            "  equal so checking if rule[" + i + "] == " + int(colors - 1),
          );
        }
        if (arrayRule[i] == colors - 1) {
          if (vverbose) console.log("    yes, so changing values to 0:");
          for (let j = 0; j < variants.length; j++) {
            arrayRule[variants[j]] = 0;
            if (vverbose) {
              console.log(
                "    rule[" + variants[j] + "] = " + arrayRule[variants[j]],
              );
            }
          }
        } else {
          if (vverbose) console.log("    no, so incrementing values:");
          for (let j = 0; j < variants.length; j++) {
            arrayRule[variants[j]] = arrayRule[variants[j]] + 1;
            if (vverbose) {
              console.log(
                "    rule[" + variants[j] + "] = " + arrayRule[variants[j]],
              );
            }
          }
          break;
        }
      } else if (vverbose) console.log("  -> continuing");
    }}
  return arrayRule;
}
function previousTotalisticArrayRule(rule) {
  if (vverbose) console.log("previous Totalistic Rule for " + formatRule(rule));
  if (!isTotalistic(rule)) return makeTotalistic(rule);
  else {for (let i = 0; i < int(pow(colors, neighbors)); i++) {
      let variants = totalisticComponents(i);
      if (vverbose) console.log("variants for " + i + " = " + variants);
      if (vverbose) {
        console.log("comparing i = " + i + " to variants[0] = " + variants[0]);
      }
      if (i == variants[0]) {
        if (vverbose) {
          console.log("  equal so checking if rule[" + i + "] == " + 0);
        }
        if (rule[i] == 0) {
          if (vverbose) {
            console.log("    yes, so changing values to " + (colors - 1) + ":");
          }
          for (let j = 0; j < variants.length; j++) {
            rule[variants[j]] = colors - 1;
            if (vverbose) {
              console.log(
                "    rule[" + variants[j] + "] = " + rule[variants[j]],
              );
            }
          }
        } else {
          if (vverbose) console.log("    no, so decreasing values:");
          for (let j = 0; j < variants.length; j++) {
            rule[variants[j]] = rule[variants[j]] - 1;
            if (vverbose) {
              console.log(
                "    rule[" + variants[j] + "] = " + rule[variants[j]],
              );
            }
          }
          break;
        }
      } else if (vverbose) console.log("  -> continuing");
    }}
  return rule;
}
function isTotalistic(arrayRule) {
  if (vverbose) console.log("isTotalistic(" + formatRule(arrayRule) + ")");
  return isTotalisticHelper(arrayRule, "LAR") ||
    isTotalisticHelper(arrayRule, "LR") ||
    isTotalisticHelper(arrayRule, "LA") || isTotalisticHelper(arrayRule, "AR");
}
function isTotalisticHelper(arrayRule, totalisticType) {
  let table = [];
  for (let i = 0; i <= (colors - 1) * neighbors; i++) table[i] = -1;
  search: for (let left = 0; left < colors; left++) {
    for (let above = 0; above < colors; above++) {
      for (let right = 0; right < colors; right++) {
        let neighborhoodIndex = colors * colors * left + colors * above + right;
        let input = (totalisticType.includes("L") ? left : 0) +
          (totalisticType.includes("A") ? above : 0) +
          (totalisticType.includes("R") ? right : 0);
        let output = arrayRule[neighborhoodIndex];
        if (table[input] === -1) {
          table[input] = output;
        } else if (table[input] != output) return false;
      }
    }
  }
  if (vverbose) console.log("    isTotalistic returning " + totalisticType);
  return totalisticType;
}
function isMultiset(arrayRule) {
  if (vverbose) console.log("isMultiset(" + formatRule(arrayRule) + ")");
  let result = 1;
  let table = [];
  for (let i = 0; i < int(pow(colors, neighbors)); i++) table[i] = -1;
  search: for (let left = 0; left < colors; left++) {
    for (let above = 0; above < colors; above++) {
      for (let right = 0; right < colors; right++) {
        let neighborhoodIndex = colors * colors * left + colors * above + right;
        let multiset = sort([left, above, right]);
        let input = colors * colors * multiset[0] + colors * multiset[1] +
          multiset[2];
        let output = arrayRule[neighborhoodIndex];
        if (table[input] == -1) {
          table[input] = output;
        } else {if (table[input] != output) {
            result = 0;
            break search;
          }}
      }
    }
  }
  if (vverbose) console.log("    isMultiset result = " + result);
  return result;
}
function colorSplitCheck(arrayRule) {
  if (verbose) console.log("colorSplitCheck(" + formatRule(arrayRule) + ")");
  let result = [];
  let allSubsets = getAllSubsets([...Array(colors).keys()]).filter(
    (x) => x.length > 1 && x.length < colors,
  );
  let allTuples = getAllThreeTuples();
  for (let subset of allSubsets) {
    subset.sort();
    if (verbose) console.log("    Checking subset " + subset);
    let pass = true;
    check: for (let tuple of allTuples) {
      let ctuple = tuple.map((x) => collapseColor(x, subset));
      let neighborhoodIndex = colors * colors * tuple[0] + colors * tuple[1] +
        tuple[2];
      let collapsedIndex = colors * colors * ctuple[0] + colors * ctuple[1] +
        ctuple[2];
      let output = collapseColor(arrayRule[neighborhoodIndex], subset);
      let collapsedOutput = collapseColor(arrayRule[collapsedIndex], subset);
      if (output !== collapsedOutput) {
        pass = false;
        if (verbose) console.log("       ====> This is not a color split.");
        break check;
      }
    }
    if (pass) {
      if (verbose) console.log("       ====> This IS a color split.");
      result.push(subset);
    }
  }
  return result;
}
function closedRuleCheck(arrayRule, relaxCheck) {
  if (verbose) console.log("closedRuleCheck(" + formatRule(arrayRule) + ")");
  let result = [];
  let allSubsets = getAllSubsets([...Array(colors).keys()]).filter(
    (x) => x.length > 1 && x.length < colors,
  );
  let allTuples = getAllThreeTuples();
  for (let subset of allSubsets) {
    subset.sort();
    if (verbose) console.log("    Checking subset " + subset);
    let pass = true;
    check: for (let tuple of allTuples) {
      if (
        relaxCheck && tuple[0] === tuple[1] && tuple[1] === tuple[2] &&
        tuple[2] === tuple[0]
      ) continue;
      let neighborhoodIndex = colors * colors * tuple[0] + colors * tuple[1] +
        tuple[2];
      let output = arrayRule[neighborhoodIndex];
      if (subset.includes(output)) continue;
      if (
        subset.includes(tuple[0]) && subset.includes(tuple[1]) &&
        subset.includes(tuple[2])
      ) {
        pass = false;
        if (verbose) {
          console.log("       ====> This rule is NOT closed on this subset.");
        }
        break check;
      }
    }
    if (pass) {
      if (verbose) {
        console.log("       ====> This rule IS closed on this subset.");
      }
      result.push(subset);
    }
  }
  return result;
}
function isOfLRtype(arrayRule) {
  if (vverbose) console.log("isOfLRtype(" + formatRule(arrayRule) + ")");
  let result = 1;
  let table = [];
  for (let i = 0; i < int(pow(colors, 2)); i++) table[i] = -1;
  search: for (let left = 0; left < colors; left++) {
    for (let above = 0; above < colors; above++) {
      for (let right = 0; right < colors; right++) {
        let neighborhoodIndex = colors * colors * left + colors * above + right;
        let LRset = [left, right];
        let input = colors * LRset[0] + LRset[1];
        let output = arrayRule[neighborhoodIndex];
        if (table[input] == -1) {
          table[input] = output;
        } else {if (table[input] != output) {
            result = 0;
            break search;
          }}
      }
    }
  }
  if (vverbose) console.log("    isOfLRtype result = " + result);
  return result;
}
function totalisticComponents(neighborhoodIndex) {
  let result = [];
  let L = floor(neighborhoodIndex / (colors * colors));
  let A = floor(neighborhoodIndex / colors) % colors;
  let R = neighborhoodIndex % colors;
  let target = L + A + R;
  for (let left = 0; left < colors; left++) {
    for (let above = 0; above < colors; above++) {
      for (let right = 0; right < colors; right++) {
        let N = colors * colors * left + colors * above + right;
        let value = left + above + right;
        if (value == target) {
          result.push(N);
        }
      }
    }
  }
  return result.sort().reverse();
}
function makeTotalistic(rule) {
  if (vverbose) console.log("making rule totalistic: " + rule);
  for (let i = 0; i < int(pow(colors, neighbors)); i++) {
    let variants = totalisticComponents(i);
    if (variants.length > 1) {
      let dominant = variants[0];
      for (let j = 1; j < variants.length; j++) {
        rule[variants[j]] = rule[dominant];
      }
    }
  }
  if (vverbose) console.log("    result: " + rule);
  return rule;
}
function nextPersistentRule(rule) {
  if (vverbose) console.log("nextPersistentRule: " + rule);
  if (!isPersistent(rule)) {
    if (vverbose) console.log(" not persistent, so making it");
    return makePersistent(rule);
  } else {
    if (vverbose) console.log(" searching for next");
    rule = incrementRule(rule);
    while (!isPersistent(rule)) {
      if (vverbose) console.log("i");
      rule = incrementRule(rule);
    }
    return rule;
  }
}
function previousPersistentRule(rule) {
  if (vverbose) console.log("previousPersistentRule: " + rule);
  if (!isPersistent(rule)) {
    if (vverbose) console.log(" not persistent, so making it");
    return makePersistent(rule);
  } else {
    if (vverbose) console.log(" searching for previous");
    rule = decrementRule(rule);
    while (!isPersistent(rule)) {
      if (vverbose) console.log("d");
      rule = decrementRule(rule);
    }
    return rule;
  }
}
function isPersistent(arrayRule) {
  if (vverbose) console.log("isPersistent(" + formatRule(arrayRule) + ")");
  let result = 1;
  search: for (let left = 0; left < colors; left++) {
    for (let above = 0; above < colors; above++) {
      for (let right = 0; right < colors; right++) {
        let neighborhoodIndex = colors * colors * left + colors * above + right;
        let value = arrayRule[neighborhoodIndex];
        if (value != left && value != above && value != right) {
          result = 0;
          break search;
        }
      }
    }
  }
  if (vverbose) console.log("    isPersistent result = " + result);
  return result;
}
function makePersistent(rule) {
  if (vverbose) console.log("makePersistent: " + rule);
  for (let i = 0; i < int(pow(colors, neighbors)); i++) {
    let L = floor(i / (colors * colors));
    let A = floor(i / colors) % colors;
    let R = i % colors;
    while (rule[i] != L && rule[i] != A && rule[i] != R) {
      rule[i] = (rule[i] + 1) % colors;
    }
  }
  if (vverbose) console.log("    result:" + rule);
  return rule;
}
function nextNonPeriodTwoRule(rule) {}
function dualRule(rule) {
  let neighborhoods = int(pow(colors, neighbors));
  let newRule = [];
  for (let i = 0; i < neighborhoods; i++) {
    newRule[i] = (rule[neighborhoods - 1 - i] + 1) % colors;
  }
  return newRule;
}
function setSeedFromString(str) {
  if (vverbose) console.log("setSeedFromString() start: " + str);
  if (isNaN(str)) {
    if (vverbose) console.log("    it is not a number");
    if (str.charAt(0) == "[" && str.charAt(str.length - 1) == "]") {
      if (vverbose) console.log("    it is of the form [...]");
      str = str.slice(1, -1);
      if (vverbose) console.log("    rest after stripping [] is: " + str);
      globalSeed = createSeedFromString(str);
      return "explicit";
    } else {
      if (vverbose) console.log("    it is a string, look it up:");
      if (vverbose) {
        console.log("    returning: " + getSeedTypeShortString(str));
      }
      return getSeedTypeShortString(str);
    }
  } else {
    if (vverbose) console.log("    it is a number, look it up:");
    if (vverbose) console.log("    returning: " + getSeedTypeShortString(str));
    return getSeedTypeShortString(str);
  }
}
function setTogglesFromString(str) {
  globalToggles = [];
  errorCount = 0;
  seedChangeCount = 0;
  if (vverbose) console.log("setTogglesFromString() start: " + str);
  if (str.charAt(0) == "[" && str.charAt(str.length - 1) == "]") {
    if (vverbose) console.log("    it is of the form [...]");
    let numbers = split(str.slice(1, -1), ",");
    for (let n of numbers) {
      if (globalToggles[n] === undefined) {
        globalToggles[n] = 1;
        errorCount = errorCount + 1;
        if (vverbose) console.log("errorCount = " + errorCount);
      } else {
        globalToggles[n] = globalToggles[n] + 1;
        errorCount = errorCount + 1;
        if (vverbose) console.log("errorCount = " + errorCount);
      }
    }
  }
  if (vverbose) console.log(globalToggles);
}
function createSeedFromString(str) {
  if (vverbose) console.log("createSeedFromString: " + str);
  str = padright(str, columns);
  if (vverbose) console.log("    with padding: " + str);
  if (vverbose) console.log("    columns: " + columns);
  let result = new Array(columns).fill(0);
  for (let i = 0; i < columns; i++) {
    if (!isNaN(str.charAt(i))) result[i] = str.charAt(i) % colors;
    if (vvverbose) console.log("    seed[" + i + "]: " + result[i]);
  }
  if (vverbose) console.log("    return: ");
  if (vverbose) console.log(result);
  return result;
}
function randomizeGlobalSeed() {
  if (vverbose) console.log("randomizeGlobalSeed() start:");
  globalSeed = [];
  for (let c = 0; c < columns; c++) globalSeed[c] = floor(random(colors));
  if (vverbose) console.log("    => end randomizeGlobalSeed()");
}
function refreshGlobalSeed() {
  if (vverbose) console.log("refreshGlobalSeed() start:");
  for (let c = 0; c < columns; c++) globalSeed[c] = globalSeed[c] % colors;
  if (vverbose) console.log("    => end refreshGlobalSeed()");
}
function updateSeedSizes() {
  if (vverbose) console.log("updateSeedSizes()");
  if (vverbose) console.log("    randomSeed: " + globalSeed);
  if (globalSeed !== "undefined") {
    let newRandomSeed = new Array(columns).fill(0);
    for (let c = 0; c < min(columns, globalSeed.length); c++) {
      newRandomSeed[c] = globalSeed[c];
    }
    if (vverbose) console.log("    newRandomSeed: " + newRandomSeed);
    globalSeed = newRandomSeed;
  }
}
function dualSeed(randomSeed) {
  let dualSeed = [];
  for (let c = 0; c < columns; c++) dualSeed[c] = (randomSeed[c] + 1) % colors;
  return dualSeed;
}
function setGlobalSeedFromPattern(pattern) {
  if (vverbose) console.log("setGlobalSeedFromPattern(pattern) start: ");
  globalSeed = new Array(columns).fill(0);
  if (vvverbose) console.log("    globalSeed: " + globalSeed);
  if (vvverbose) console.log("    pattern.states: " + pattern.states);
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < columns; c++) {
      if (!staggered || (c + r) % 2 == 0) {
        globalSeed[c] = pattern.states[c + columns * r];
      }
    }
  }
  if (pattern.seedChangeCount != 0) {
    if (vvverbose) console.log("    there are SEED CHANGES in pattern");
    if (vvverbose) console.log("    calling pattern.resetSeedChanges()");
    pattern.resetSeedChanges();
  }
  if (vvverbose) console.log("    globalSeed: " + globalSeed);
}
function advanceCurrentPattern(N) {
  if (vverbose) {
    console.log("advanceCurrentPattern() start: " + N + " / rows = " + rows);
  }
  if (rows > N * 2) {
    seedType = "explicit";
    selectSeed.value(getSeedTypeLongString(seedType));
    updateSelectors();
    if (gridLayout) {
      for (let pattern of patterns) {
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < columns; c++) {
            if (!staggered || (c + r) % 2 == 0) {
              pattern.seed[c] = pattern.states[c + columns * (r + N * 2)];
            }
          }
        }
        pattern.calculateRows();
      }
    } else {
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < columns; c++) {
          if (!staggered || (c + r) % 2 == 0) {
            currentPattern.seed[c] =
              currentPattern.states[c + columns * (r + N * 2)];
          }
        }
      }
      currentPattern.calculateRows();
    }
  }
}
function resetToggles() {
  globalToggles = [];
  errorCount = 0;
  seedChangeCount = 0;
}
let properties = {};
function getInfoString() {
  if (verbose) console.log("getInfoString");
  let pattern = currentPattern;
  let infoString = "";
  infoString += "\x3c!-- " + window.location.href + " --\x3e\n" +
    (pattern.stringDescription !== undefined
      ? "<div><span class='infotitle'>Info: </span>" +
        "<span class='infocontent infoblue'>" + pattern.stringDescription +
        "</span></div>"
      : "") +
    "<div><span class='infotitle'>Name: </span>" +
    "<span class='infocontent'>" + getRuleName(pattern) + "</span></div>" +
    "<div><span class='infotitle'>Color set (o/O): </span>" +
    "<span class='infocontent'>" + (currentColorSet.index >= 0
      ? currentColorSet.infoString + " (" + currentColorSet.index + ")"
      : "custom") +
    "</span></div>" +
    "<div><span class='infotitle'>Color mapping (P): </span>" +
    "<span class='infocontent'>" +
    (arrayEquals(colorMapping, [...Array(colors).keys()])
      ? "none"
      : "[" + colorMapping + "]") +
    "</span></div>" + "<div><span class='infotitle'>Reversible: </span>" +
    "<span class='infocontent'>" + (pattern.reversible == 1
      ? "yes"
      : pattern.reversible == 0
      ? "no"
      : "(todo)") +
    "</span></div>" + "<div><span class='infotitle'>Symmetric: </span>" +
    "<span class='infocontent'>" + (pattern.symmetric == 1
      ? "yes"
      : pattern.symmetric == 0
      ? "no"
      : "(todo)") +
    "</span></div>" + "<div><span class='infotitle'>Totalistic: </span>" +
    "<span class='infocontent'>" + (pattern.totalistic == 1
      ? "yes"
      : pattern.totalistic == 0
      ? "no"
      : "(todo)") +
    "</span></div>" + "<div><span class='infotitle'>Multiset: </span>" +
    "<span class='infocontent'>" +
    (pattern.multiset == 1 ? "yes" : pattern.multiset == 0 ? "no" : "(todo)") +
    "</span></div>" + "<div><span class='infotitle'>LR rule: </span>" +
    "<span class='infocontent'>" +
    (pattern.ofLRtype == 1 ? "yes" : pattern.ofLRtype == 0 ? "no" : "(todo)") +
    "</span></div>" +
    "<div><span class='infotitle'>Persistent (empirical): </span>" +
    "<span class='infocontent'>" +
    (pattern.colorsUsed === colors ? "yes" : "no") + "</span></div>" +
    "<div><span class='infotitle'>Colors active: </span>" +
    "<span class='infocontent'>" + pattern.colorsUsed + "</span></div>" +
    "<div><span class='infotitle'>Color split (L+number): </span>" +
    "<span class='infocontent'>" + (pattern.colorSplit.length > 0
      ? "yes " + pattern.colorSplit.map(arrayToString).join(",")
      : "no") +
    "</span></div>" + "<div><span class='infotitle'>Closed: </span>" +
    "<span class='infocontent'>" + (pattern.closedOnSubset.length > 0
      ? "yes " + pattern.closedOnSubset.map(arrayToString).join(",")
      : "no") +
    "</span></div>" + "<div><span class='infotitle'>Semiclosed: </span>" +
    "<span class='infocontent'>" + (pattern.semiclosedOnSubset.length > 0
      ? "yes " + pattern.semiclosedOnSubset.map(arrayToString).join(",")
      : "no") +
    "</span></div>" + (showPeriod
      ? "<div><span class='infotitle'>Period: </span>" +
        "<span class='infocontent'>" +
        (pattern.period == -1 ? "?" : pattern.period) + "</span></div>"
      : "") +
    "<div><span class='infotitle'>Rule: </span>" +
    "<span class='infocontent'>" +
    numeric(pattern.arrayRule, int(pow(colors, neighbors))) +
    (directional ? "(d)" : "") + " of " + numberOfRulesString() +
    (errorCount > 0
      ? " (with " + errorCount + " error" + (errorCount > 1 ? "s" : "") + ")"
      : "") +
    "</span></div>" + "<div><span class='infotitle'>Code: </span>" +
    "<span class='infocontent font-mono'>" + pattern.getRuleModulesCode() +
    "</span></div>" +
    "<div><span class='infotitle'>Equivalent patterns: </span>" +
    "<span class='infocontent'>" + pattern.getEquivalentPatternsString() +
    "</span></div>" + (pattern.totalisticRule !== undefined
      ? "<div><span class='infotitle'>Name: </span>" +
        "<span class='infocontent'>" + "Totalistic rule (array): " +
        formatRule(pattern.totalisticRule) + "<br/>" +
        "Totalistic rule (numeric): " + numeric(pattern.totalisticRule) +
        "<br/>"
      : "") +
    "";
  return infoString;
}
function getValue(query, parameters) {
  if (vvverbose) console.log("    getValue: " + query);
  if (vvverbose) console.log("    getValue: " + parameters);
  let result = "";
  for (let n = 0; n < parameters.length; n++) {
    let parts = split(parameters[n], "=");
    if ("string" === typeof query) {
      if (parts.length === 2 && parts[0] === query) {
        if (vvverbose) {
          console.log("      found value: " + parts[1]);
        }
        return parts[1];
      }
    } else {for (let i = 0; i < query.length; i++) {
        if (parts.length === 2 && parts[0] === query[i]) {
          if (vvverbose) console.log("      found value: " + parts[1]);
          return parts[1];
        }
      }}
  }
  if (vvverbose) console.log("      nothing found");
  return result;
}
function updateURL() {
  if (verbose) console.log("updateURL() start:");
  if (vverbose) console.log("    currentPattern:");
  if (verbose) console.log(currentPattern);
  if (history.pushState) {
    let newurl = window.location.protocol + "//" + window.location.host + "/" +
      "?" + "rule=" + ruleToString(currentPattern) + "&colors=" + colors +
      "&columns=" + columns + "&rows=" + rows + (gridLayout
        ? "&grid=true&gridcolumns=" + gridColumns + "&gridrows=" + gridRows
        : "") +
      (gridLayout ? showGridText ? "" : "&showgridtext=false" : "") + "&seed=" +
      (seedType == "explicit" || seedType == "periodic-explicit"
        ? arrayToString(currentPattern.seed)
        : seedType) +
      (seedType === "periodic" || seedType === "periodic-explicit"
        ? "&seedperiod=" + seedPeriod
        : "") +
      (directional ? "&directional=true" : "") +
      (staggered ? "" : "&staggered=false") +
      (wrapping ? "" : "&wrapping=false") +
      (startShape == defaultStartShape ? "" : "&startshape=" + startShape) +
      (showThread ? "&thread=true" : "") +
      (visualStyle == defaultVisualStyle ? "" : "&style=" + visualStyle) +
      (showBorder ? "&showborder=true" : "") +
      (showBorder && borderWidth !== defaultBorderWidth
        ? "&borderwidth=" + borderWidth
        : "") +
      (showBorder && borderBrightness !== defaultBorderBrightness
        ? "&borderbrightness=" + borderBrightness
        : "") +
      (showWrappingColumnLeft ? "&extraleft=true" : "") +
      (showWrappingColumnRight ? "&extraright=true" : "") +
      (currentColorSet.index === -1
        ? currentColorSet.toURL()
        : currentColorSet.index == defaultColorSetIndex
        ? ""
        : "&colorset=" + currentColorSet.index) +
      (colorMappingActive ? "&colormap=" + arrayToString(colorMapping) : "") +
      (upwards ? "&upwards=true" : "") +
      (altColorMode ? "&colormod=" + colorModulo : "") +
      (showPeriod ? "&showperiod=true" : "") +
      (showArrow ? "" : "&showarrow=false") +
      (ruleCompression === defaultRuleCompression
        ? ""
        : "&rulecompression=" + ruleCompression) +
      (mainLayout === defaultMainLayout ? "" : "&layout=" + mainLayout) +
      (moduleSorting === defaultModuleSorting
        ? ""
        : "&modulesorting=" + moduleSorting) +
      (globalToggles.length > 0 ? "&toggles=" + globalTogglesToString() : "") +
      (comparisonLayout ? "&compare=" + comparisonLayout : "") +
      (filterPeriodTwo ? "&filterperiodtwo=true" : "") +
      (filterPeriodFour ? "&filterperiodfour=true" : "") +
      (filterPeriodSix ? "&filterperiodsix=true" : "") +
      (filterPersistent ? "&filterpersistent=true" : "") +
      (filterFewEquivalents ? "&filterfew=true" : "") +
      (filterOnePerEquivalenceClass ? "&filterone=true" : "") +
      (filterClosed ? "&filterclosed=true" : "") +
      (filterSemiClosed ? "&filtersemiclosed=true" : "") +
      (filterNotSemiClosed ? "&filternotsemiclosed=true" : "") +
      (filterColorSplit ? "&filtercolorsplit=true" : "") +
      (filterNotColorSplit ? "&filternotcolorsplit=true" : "") + "";
    if (vverbose) console.log("  newurl = " + newurl);
    if (vverbose) console.log("  calling window.history.pushState");
    window.history.pushState({ path: newurl }, "", newurl);
  } else if (vverbose) console.log("    !history.pushState");
  if (vverbose) console.log("    => end updateURL()");
}
function setParametersFromString(inputString) {
  if (verbose) console.log("setParametersFromString() start: " + inputString);
  let textAndRule = split(inputString, ":");
  if (textAndRule.length === 4) {
    shortCode = textAndRule[0].slice(1, -1);
    if (verbose) console.log("short code = " + shortCode);
    shortStringDescription = textAndRule[1].slice(1, -1);
    stringDescription = textAndRule[2].slice(1, -1);
    inputString = textAndRule[3];
  } else inputString = textAndRule[0];
  inputString = inputString.replace(" ", "");
  if (vvverbose) console.log("  setParametersFromString: " + inputString);
  let parameters = split(inputString, "&");
  if (vvverbose) console.log("  setParametersFromString: " + parameters);
  for (let p of parameters) {
    let parts = split(p, "=");
    properties[parts[0]] = parts[1];
  }
  if (vverbose) console.log("  setParametersFromString: " + properties);
  if (vverbose) {
    console.log("  setParametersFromString: " + JSON.stringify(properties));
  }
  let columnString = getValue("columns", parameters);
  columns = columnString !== "" ? int(columnString) : defaultColumns;
  columns = columns - columns % 2;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Columns: " + columns);
  }
  let rowString = getValue("rows", parameters);
  rows = rowString !== "" ? int(rowString) : defaultRows;
  rows = rows - rows % 2;
  if (vverbose) console.log("  setParametersFromString: " + "Rows: " + rows);
  let colorString = getValue("colors", parameters);
  colors = colorString !== "" ? int(colorString) : defaultColors;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Colors: " + colors);
  }
  if (vverbose) {
    console.log("  setParametersFromString: " + "What kind of rule?");
  }
  let ruleString = getValue("rule", parameters);
  if (vverbose) {
    console.log("  setParametersFromString: " + "ruleString = " + ruleString);
  }
  if (ruleString !== "") {
    ruleFromString = getRuleFromString(ruleString);
    if (vverbose) {
      console.log("  setParametersFromString: " + "Rule: " + ruleString);
    }
  } else {
    if (vverbose) {
      console.log("  setParametersFromString: " + "Rule: random (default)");
    }
    ruleFromString = randomRule();
    if (vverbose) console.log(ruleFromString);
  }
  let staggeredString = getValue("staggered", parameters);
  staggered = staggeredString === "false" || staggeredString === "0"
    ? false
    : true;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Staggered: " + staggered);
  }
  let dirOptions = ["dir", "directional"];
  let directionalString = getValue(dirOptions, parameters);
  directional = directionalString === "true" || directionalString === "1"
    ? true
    : false;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Directional: " + directional);
  }
  let wrappingString = getValue("wrapping", parameters);
  wrapping = wrappingString === "false" || staggeredString === "0"
    ? false
    : true;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Wrapping: " + wrapping);
  }
  let startshapeString = getValue("startshape", parameters);
  startShape = startshapeString !== "" ? startshapeString : defaultStartShape;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Start shape: " + startShape);
  }
  let seedString = getValue("seed", parameters);
  seedType = seedString !== ""
    ? setSeedFromString(seedString)
    : defaultSeedType;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Seed: " + seedType);
  }
  let seedPeriodOptions = ["seedp", "seedperiod"];
  let seedPeriodString = getValue(seedPeriodOptions, parameters);
  seedPeriod = seedPeriodString !== ""
    ? int(seedPeriodString)
    : defaultSeedPeriod;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Seed period: " + seedPeriod);
  }
  if (seedType === "explicit" && seedPeriodString !== "") {
    seedType = "periodic-explicit";
  }
  let styleString = getValue("style", parameters);
  visualStyle = styleString !== ""
    ? getVisualStyleShortString(styleString)
    : defaultVisualStyle;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Visual style: " + visualStyle);
  }
  let showBorderString = getValue("showborder", parameters);
  showBorder = showBorderString === "true" || showBorderString === "1"
    ? true
    : false;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Show border: " + showBorder);
  }
  let borderWidthString = getValue("borderwidth", parameters);
  borderWidth = borderWidthString !== ""
    ? int(borderWidthString)
    : defaultBorderWidth;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Border width: " + borderWidth);
  }
  let borderBrightnessString = getValue("borderbrightness", parameters);
  borderBrightness = borderBrightnessString !== ""
    ? int(borderBrightnessString)
    : defaultBorderBrightness;
  if (vverbose) {
    console.log(
      "  setParametersFromString: " + "Border Brightness: " + borderBrightness,
    );
  }
  let upwardsString = getValue("upwards", parameters);
  upwards = upwardsString === "true" || upwardsString === "1" ? true : false;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Upwards: " + upwards);
  }
  let arrowString = getValue("showarrow", parameters);
  showArrow = arrowString === "false" ? false : true;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Show arrow: " + showArrow);
  }
  let extraleftString = getValue("extraleft", parameters);
  showWrappingColumnLeft = extraleftString === "true" || extraleftString === "1"
    ? true
    : false;
  if (vverbose) {
    console.log(
      "  setParametersFromString: " + "Show extra column on left side: " +
        showWrappingColumnLeft,
    );
  }
  let extrarightString = getValue("extraright", parameters);
  showWrappingColumnRight =
    extrarightString === "true" || extraleftString === "1" ? true : false;
  if (vverbose) {
    console.log(
      "  setParametersFromString: " + "Show extra column on right side: " +
        showWrappingColumnRight,
    );
  }
  let layoutString = getValue("layout", parameters);
  mainLayout = layoutString !== ""
    ? getMainLayoutShortString(layoutString)
    : defaultMainLayout;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Main layout: " + mainLayout);
  }
  let threadString = getValue("thread", parameters);
  showThread = threadString === "true" || threadString === "1" ? true : false;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Thread: " + showThread);
  }
  let ruleCompressionString = getValue("rulecompression", parameters);
  ruleCompression = ruleCompressionString !== ""
    ? ruleCompressionString
    : defaultRuleCompression;
  if (vverbose) {
    console.log(
      "  setParametersFromString: " + "Rule compression: " + ruleCompression,
    );
  }
  let showPeriodString = getValue("showperiod", parameters);
  showPeriod = showPeriodString === "true" || showPeriodString === "1"
    ? true
    : false;
  if (vverbose) {
    console.log("  setParametersFromString: " + "Show period: " + showPeriod);
  }
  altColorMode = false;
  colorModulo = defaultColorModulo;
  let altColorModeOptions = ["cmod", "colormod"];
  let altColorModeString = getValue(altColorModeOptions, parameters);
  if (altColorModeString !== "") {
    altColorMode = true;
    colorModulo = int(altColorModeString);
  }
  if (vverbose) {
    console.log(
      "  setParametersFromString: " + "Alternating colors / modulo: " +
        (altColorMode ? "true" : "false") + " / " + colorModulo,
    );
  }
  for (let i = 0; i < 6; i++) {
    customColorValuesFrom[i] = color(255 / 6);
    customColorValuesTo[i] = 255 - color(255 / 6);
  }
  let c0fString = getValue("c0f", parameters).replace("#", "");
  let c1fString = getValue("c1f", parameters).replace("#", "");
  let c2fString = getValue("c2f", parameters).replace("#", "");
  let c3fString = getValue("c3f", parameters).replace("#", "");
  let c4fString = getValue("c4f", parameters).replace("#", "");
  let c5fString = getValue("c5f", parameters).replace("#", "");
  let c0tString = getValue("c0t", parameters).replace("#", "");
  let c1tString = getValue("c1t", parameters).replace("#", "");
  let c2tString = getValue("c2t", parameters).replace("#", "");
  let c3tString = getValue("c3t", parameters).replace("#", "");
  let c4tString = getValue("c4t", parameters).replace("#", "");
  let c5tString = getValue("c5t", parameters).replace("#", "");
  if (c0fString !== "") customColorValuesFrom[0] = color("#" + c0fString);
  if (c1fString !== "") customColorValuesFrom[1] = color("#" + c1fString);
  if (c2fString !== "") customColorValuesFrom[2] = color("#" + c2fString);
  if (c3fString !== "") customColorValuesFrom[3] = color("#" + c3fString);
  if (c4fString !== "") customColorValuesFrom[4] = color("#" + c4fString);
  if (c5fString !== "") customColorValuesFrom[5] = color("#" + c5fString);
  if (c0tString !== "") customColorValuesTo[0] = color("#" + c0tString);
  if (c1tString !== "") customColorValuesTo[1] = color("#" + c1tString);
  if (c2tString !== "") customColorValuesTo[2] = color("#" + c2tString);
  if (c3tString !== "") customColorValuesTo[3] = color("#" + c3tString);
  if (c4tString !== "") customColorValuesTo[4] = color("#" + c4tString);
  if (c5tString !== "") customColorValuesTo[5] = color("#" + c5tString);
  if (c0fString !== "") {
    customColors = true;
    colorSetIndexFromURL = -1;
  } else {
    customColors = !true;
    if (vverbose) {
      console.log("  setParametersFromString: " + "Not a custom color set.");
    }
    let colorsetOptions = ["cset", "colorset"];
    let colorsetString = getValue(colorsetOptions, parameters);
    if (vvverbose) {
      console.log(
        "  setParametersFromString: " + "  colorsetString: " + colorsetString,
      );
    }
    colorSetIndexFromURL = colorsetString !== "" && int(colorsetString) >= 0
      ? int(colorsetString) % noColorSets
      : defaultColorSetIndex;
    if (vverbose) {
      console.log(
        "  setParametersFromString: " + "Colorset: " + colorSetIndexFromURL,
      );
    }
  }
  let colormapString = getValue("colormap", parameters);
  if (colormapString !== "") {
    if (vverbose) {
      console.log(
        "  setParametersFromString: " +
          "    setting color mapping from string: " + colormapString,
      );
    }
    colorMapping = stringToArray(colormapString, colors, colors, true);
    colorMappingActive = true;
  } else {
    colorMappingActive = false;
    colorMapping = [...Array(colors).keys()];
  }
  if (vverbose) {
    console.log(
      "  setParametersFromString: " + "Color mapping: " +
        arrayToString(colorMapping),
    );
  }
  let togglesString = getValue("toggles", parameters);
  if (togglesString !== "") {
    if (vverbose) {
      console.log("  setParametersFromString: " + "Toggles: " + togglesString);
    }
    setTogglesFromString(togglesString);
  } else {
    globalToggles = [];
    errorCount = 0;
    seedChangeCount = 0;
    if (vverbose) console.log("  setParametersFromString: " + "No toggles");
  }
  let modulesortingString = getValue("modulesorting", parameters);
  moduleSorting = modulesortingString !== ""
    ? modulesortingString
    : defaultModuleSorting;
  if (vverbose) {
    console.log(
      "  setParametersFromString: " + "Module sorting: " + moduleSorting,
    );
  }
  let compareString = getValue("compare", parameters);
  if (compareString !== "") comparisonLayout = compareString;
  else comparisonLayout = false;
  if (vverbose) console.log("  setParametersFromString: " + "Generate all:");
  let generateString = getValue("generate", parameters);
  if (generateString !== "") {
    generateAll();
    return;
  }
  let gridString = getValue("grid", parameters);
  let gridColumnsString = getValue("gridcolumns", parameters);
  let gridRowsString = getValue("gridrows", parameters);
  let gridShowTextString = getValue("showgridtext", parameters);
  gridLayout = gridString === "true" || gridString === "1" ? true : false;
  if (gridLayout) {
    gridColumns = gridColumnsString !== ""
      ? int(gridColumnsString)
      : defaultGridColumns;
    gridRows = gridRowsString !== "" ? int(gridRowsString) : defaultGridRows;
    showGridText = gridShowTextString === "false" ? false : true;
  }
  let filterPeriodTwoString = getValue("filterperiodtwo", parameters);
  filterPeriodTwo =
    filterPeriodTwoString === "true" || filterPeriodTwoString === "1"
      ? true
      : false;
  let filterPeriodFourString = getValue("filterperiodfour", parameters);
  filterPeriodFour =
    filterPeriodFourString === "true" || filterPeriodFourString === "1"
      ? true
      : false;
  let filterPeriodSixString = getValue("filterperiodsix", parameters);
  filterPeriodSix =
    filterPeriodSixString === "true" || filterPeriodSixString === "1"
      ? true
      : false;
  let filterPersistentString = getValue("filterpersistent", parameters);
  filterPersistent =
    filterPersistentString === "true" || filterPersistentString === "1"
      ? true
      : false;
  let filterFewEquivalentsString = getValue("filterfew", parameters);
  filterFewEquivalents =
    filterFewEquivalentsString === "true" || filterFewEquivalentsString === "1"
      ? true
      : false;
  let filterOnePerEquivalenceClassString = getValue("filterone", parameters);
  filterOnePerEquivalenceClass =
    filterOnePerEquivalenceClassString === "true" ||
      filterOnePerEquivalenceClassString === "1"
      ? true
      : false;
  let filterClosedString = getValue("filterclosed", parameters);
  filterClosed = filterClosedString === "true" || filterClosedString === "1"
    ? true
    : false;
  let filterSemiClosedString = getValue("filtersemiclosed", parameters);
  filterSemiClosed =
    filterSemiClosedString === "true" || filterSemiClosedString === "1"
      ? true
      : false;
  let filterNotSemiClosedString = getValue("filternotsemiclosed", parameters);
  filterNotSemiClosed =
    filterNotSemiClosedString === "true" || filterNotSemiClosedString === "1"
      ? true
      : false;
  let filterColorSplitString = getValue("filtercolorsplit", parameters);
  filterColorSplit =
    filterColorSplitString === "true" || filterColorSplitString === "1"
      ? true
      : false;
  let filterNotColorSplitString = getValue("filternotcolorsplit", parameters);
  filterNotColorSplit =
    filterNotColorSplitString === "true" || filterNotColorSplitString === "1"
      ? true
      : false;
  fixedRuleModules = false;
  createColorsets(colorSetIndexFromURL);
  if (seedType !== "explicit" && seedType !== "periodic-explicit") {
    randomizeGlobalSeed();
  }
  if (!guiInitialized) initalizeGui();
  refreshGui();
  updateVisualStyle();
  updateSelectors();
  currentPattern = new Pattern();
  currentPattern.setArrayRule(ruleFromString.slice());
  initializePatternsAndDraw();
  if (vverbose) {
    console.log(
      "  setParametersFromString: " + "    => setParametersFromString() end",
    );
  }
}
function setParametersFromShortCode(inputString) {
  if (verbose) console.log("setParametersFromShortCode: " + inputString);
  let matchWithPreloadedStrings = !true;
  for (let i = 0; i < preloadedStrings.length; i++) {
    let candidate = preloadedStrings[i].split(":")[0].slice(1, -1);
    if (candidate == inputString) {
      preloadedCounter = i;
      if (vverbose) {
        console.log("we have a code that it is in preloadedStrings!");
      }
      matchWithPreloadedStrings = true;
      break;
    }
  }
  if (matchWithPreloadedStrings) {
    gridLayout = false;
    resetToggles();
    setPreloadedPattern(preloadedCounter);
  } else {}
  if (verbose) console.log("  => end setParametersFromShortCode()");
}
function setParametersFromURL() {
  if (verbose) console.log("setParametersFromURL() start:");
  let matchWithPreloadedStrings = !true;
  let url = decodeURIComponent(location.href + location.hash);
  if (url.indexOf("?") == -1) {
    let code = url.split("/").pop().substring(0, 3).replace(/[^a-z0-9]/, "");
    if (code !== "") {
      setParametersFromShortCode(code);
      return;
    }
  }
  let parts = split(url, "?");
  let inputString = parts.length == 2 ? parts[1] : "do the default!";
  if (vvverbose) console.log(inputString);
  for (let i = 0; i < preloadedStrings.length; i++) {
    if (vvverbose) {
      console.log(
        " comparing " + inputString + " to " +
          preloadedStrings[i].split(":")[3],
      );
    }
    if (preloadedStrings[i].split(":")[3] === inputString) {
      preloadedCounter = i;
      if (verbose) {
        console.log("we have a string that it is in preloadedStrings!");
      }
      matchWithPreloadedStrings = true;
      break;
    }
  }
  if (matchWithPreloadedStrings) setPreloadedPattern(preloadedCounter);
  else {
    preloadedCounter = undefined;
    setParametersFromString(inputString);
  }
  if (vverbose) console.log("  => end setParametersFromURL()");
}
function pad(str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}
function padright(str, max) {
  str = str.toString();
  return str.length < max ? padright(str + "0", max) : str;
}
function arrayToString(array) {
  if (vvverbose) console.log("arrayToString: " + array);
  let result = "[";
  for (let i = 0; i < array.length; i++) result += str(array[i]);
  result += "]";
  if (vvverbose) console.log("    result: " + result);
  return result;
}
function stringToArray(str, arrayLength, mod, forwardDirection) {
  if (vvverbose) {
    console.log("stringToArray: " + str + " " + arrayLength + " " + mod);
  }
  if (str.charAt(0) == "[" && str.charAt(str.length - 1) == "]") {
    if (vvverbose) console.log("    starts/ends with []");
    str = str.slice(1, -1);
    if (vvverbose) console.log("    rest after stripping [] is: " + str);
  }
  str = pad(str, arrayLength);
  if (vvverbose) console.log("    with padding: " + str);
  let result = new Array(arrayLength).fill(0);
  for (let i = 0; i < arrayLength; i++) {
    if (!isNaN(str.charAt(i))) {
      if (forwardDirection) result[i] = str.charAt(i) % mod;
      else result[i] = str.charAt(arrayLength - (1 + i)) % mod;
    }
  }
  if (vvverbose) console.log("    return: " + result);
  return result;
}
function emptyURL() {
  let newurl = window.location.protocol + "//" + window.location.host +
    window.location.pathname;
  if (vverbose) console.log(newurl);
  window.history.pushState({ path: newurl }, "", newurl);
}
function lastmod() {
  let tzoffset = (new Date()).getTimezoneOffset() * 6e4;
  let localISOTime = new Date(new Date(document.lastModified) - tzoffset)
    .toISOString().substr(0, 16).replace("T", " ");
  document.write(localISOTime);
}
function textWithAdjustedColor(str, x, y, bH) {
  if (brightness(currentFill) < 194) fill(0, 0, 255);
  else fill(0, 0, 0);
  noStroke();
  textAlign(CENTER, CENTER);
  textSize(.6 * bH);
  text(str, x, y);
}
function textWithAdjustedColorPart(N, total, str, x, y, w, h) {
  if (brightness(currentFill) < 194) fill(0, 0, 255);
  else fill(0, 0, 0);
  noStroke();
  let unitH = h / total;
  textAlign(CENTER, CENTER);
  textSize(.6 * unitH);
  text(str, x, y - h / 2 + unitH * (N + .5));
}
function ruleToString(pattern) {
  if (totalisticMode) return "t[" + formatRule(pattern.totalisticRule) + "]";
  else return "[" + formatRule(pattern.arrayRule) + "]";
}
function numberOfRulesString() {
  if (colors == 3 && neighbors == 3) return "7625597484986";
  else return "" + int(pow(colors, pow(colors, neighbors)) - 1);
}
function globalTogglesToString() {
  let result = "[";
  for (let i = 0; i < globalToggles.length; i++) {
    if (globalToggles[i] !== undefined) {
      for (let j = 0; j < globalToggles[i]; j++) {
        result += str(i) + ",";
      }
    }
  }
  result = result.slice(0, -1);
  result += "]";
  return result;
}
function shortenString(str) {
  if (str.length <= 12) return str;
  else {return str.substr(0, 6) + "...(" + (str.length - 2) + ")..." +
      str.slice(-6);}
}
function ruleModulesToString(ruleModules) {
  let result = "";
  for (let module of ruleModules) result += module.toString() + " ";
  result += "\n";
  return result;
}
function stringit(A) {
  if (typeof A === "string") return A;
  return "[" + A.map((x) => {
    if (Array.isArray(x)) return stringit(x);
    else return str(x);
  }).join(" ") + "]";
}
