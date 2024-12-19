<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no">
  <title>Beading with Algorithms</title>
  <meta name="description" content="Beading with Algorithms">
  <meta name="author" content="Roger Antonsen and Gwen Fisher">
  <meta property="og:site_name" content="Beading with Algorithms">
  <meta name="twitter:site" content="Beading with Algorithms">
  <meta property="og:title" content="Beading with Algorithms">
  <meta name="twitter:title" content="Beading with Algorithms">
  <meta name="description" content="Beading with Algorithms">
  <meta property="og:description" content="Beading with Algorithms">
  <meta name="twitter:description" content="Beading with Algorithms">
  <meta property="og:image" content="favicon/image.png">
  <meta name="twitter:image" content="favicon/image.png">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png">
  <link rel="manifest" href="favicon/site.webmanifest">
  <link rel="stylesheet" href="styles.css">
  <script src="lib.js" defer="defer"></script>
  <script src="app.js" defer="defer"></script>
</head>

<body class="touch-none">
  <div class="flex flex-col w-screen h-[var(--maxvh)] overflow-hidden"
    x-data="{ open: !false, isInfoBoxOpen: !true, showSideBar: window.innerWidth > 768, showButtonPanel: window.innerWidth > 768 }"
    x-on:resize.window="showSideBar = window.innerWidth > 768; showButtonPanel = window.innerWidth > 768">
    <div class="flex items-center justify-center w-full h-[80px] bg-white md:justify-start navbar flew-row">
      <div class="absolute top-0 left-0 pt-4 pl-3">
        <div title="Menu" @click="showSideBar = !showSideBar"
          class="z-50 px-4 py-2 bg-white border rounded-md md:hidden drop-shadow md:menu-horizontal"><svg
            class="beading-menu-main closed" :class="showSideBar ? 'open' : 'closed'" xmlns="http://www.w3.org/2000/svg"
            viewBox="-5 -5 24 24" width="24" fill="currentColor">
            <path
              d="M7.071 5.314l4.95-4.95a1 1 0 1 1 1.414 1.414L7.778 7.435a1 1 0 0 1-1.414 0L.707 1.778A1 1 0 1 1 2.121.364l4.95 4.95zm0 6l4.95-4.95a1 1 0 1 1 1.414 1.414l-5.657 5.657a1 1 0 0 1-1.414 0L.707 7.778a1 1 0 1 1 1.414-1.414l4.95 4.95z">
            </path>
          </svg></div>
      </div><a href="/?rule=[01101001]&colors=2&columns=30&rows=64&seed=random&style=bead&colorset=7"
        class="p-3 text-xl font-bold text-center text-gray-700 select-none font-fun whitespace-nowrap md:text-4xl drop-shadow-sm shadow-red-500">Beading
        with Algorithms</a>
      <div class="hidden p-3 mx-2 font-mono text-xs md:block" id="statusLineTop"></div>
      <div class="absolute top-0 right-0 pt-4 pr-3">
        <ul class="z-50 bg-white border rounded-md drop-shadow menu menu-compact md:menu-horizontal">
          <li class="md:hidden" title="Menu" @click="showButtonPanel = !showButtonPanel">
            <div><svg class="beading-menu-main closed" :class="showButtonPanel ? 'open' : 'closed'"
                xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 24 24" width="24" fill="currentColor">
                <path
                  d="M7.071 5.314l4.95-4.95a1 1 0 1 1 1.414 1.414L7.778 7.435a1 1 0 0 1-1.414 0L.707 1.778A1 1 0 1 1 2.121.364l4.95 4.95zm0 6l4.95-4.95a1 1 0 1 1 1.414 1.414l-5.657 5.657a1 1 0 0 1-1.414 0L.707 7.778a1 1 0 1 1 1.414-1.414l4.95 4.95z">
                </path>
              </svg></div>
          </li>
          <li title="Grid" x-show="showButtonPanel"><a href="/grid.php"><svg xmlns="http://www.w3.org/2000/svg"
                viewBox="-2 -2 24 24" width="24" fill="currentColor">
                <path
                  d="M2 2v4h4V2H2zm0-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm12 0h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2zm0 2v4h4V2h-4zm0 10h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm0 2v4h4v-4h-4zM2 12h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2zm0 2v4h4v-4H2z">
                </path>
              </svg></a></li>
          <li title="Table" x-show="showButtonPanel"><a href="/table.php"><svg xmlns="http://www.w3.org/2000/svg"
                viewBox="-5 -5 24 24" width="24" fill="currentColor">
                <path
                  d="M2,6 L6,6 L6,2 L2,2 L2,6 Z M2,8 L2,12 L6,12 L6,8 L2,8 Z M12,6 L12,2 L8,2 L8,6 L12,6 Z M12,8 L8,8 L8,12 L12,12 L12,8 Z M2,0 L12,0 C13.1045695,0 14,0.8954305 14,2 L14,12 C14,13.1045695 13.1045695,14 12,14 L2,14 C0.8954305,14 0,13.1045695 0,12 L0,2 C0,0.8954305 0.8954305,0 2,0 Z">
                </path>
              </svg></a></li>
          <li title="About" x-show="showButtonPanel"><label for="modalAbout" class="modal-button"><svg
                xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" width="24" fill="currentColor">
                <path
                  d="M10 20C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm1.276-3.218a1 1 0 0 1-1.232-1.576l.394-.308a1.5 1.5 0 1 0-1.847-2.364l-.394.308a1 1 0 1 1-1.23-1.576l.393-.308a3.5 3.5 0 1 1 4.31 5.516l-.394.308z">
                </path>
              </svg></label></li>
          <li title="Take screenshot" @click="screenshotDirect();" title="About" x-show="showButtonPanel"><button
              id="buttonScreenshot"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -4 24 24" width="24"
                fill="currentColor">
                <path
                  d="M5.676 5H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1.676l-.387-1.501A2.002 2.002 0 0 0 12 2H8a2 2 0 0 0-1.937 1.499L5.676 5zm-1.55-2C4.57 1.275 6.136 0 8 0h4a4.002 4.002 0 0 1 3.874 3H16a4 4 0 0 1 4 4v5a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h.126zM10 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-3a1 1 0 1 0 0-2 1 1 0 0 0 0 2z">
                </path>
              </svg></button></li>
          <li title="Keyboard Shortcuts" x-show="showButtonPanel"><label for="modalKeyboardShortcuts"
              class="modal-button"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -5 24 24" width="24"
                fill="currentColor">
                <path
                  d="M3 0h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H3zm0 4h2v2H3V6zm0-3h2v2H3V3zm0 6h2v2H3V9zm3 0h8v2H6V9zm0-3h2v2H6V6zm0-3h2v2H6V3zm3 3h2v2H9V6zm0-3h2v2H9V3zm6 6h2v2h-2V9zm-3-3h2v2h-2V6zm0-3h2v2h-2V3zm3 0h2v5h-2V3z">
                </path>
              </svg></label></li>
          <li title="Show pattern info" x-show="showButtonPanel"><button @click="isInfoBoxOpen = !isInfoBoxOpen"><svg
                xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 24 24" width="24" fill="currentColor">
                <path
                  d="M10 20C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-10a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0V9a1 1 0 0 1 1-1zm0-1a1 1 0 1 1 0-2 1 1 0 0 1 0 2z">
                </path>
              </svg></button></li>
          <li x-show="showButtonPanel"><label title="Enter short code" for="modalShortCode" class="modal-button"><svg
                xmlns="http://www.w3.org/2000/svg" viewBox="-1.5 -1.5 24 24" width="24" fill="currentColor">
                <path
                  d="M10.725 9.094l-5.509 5.51-1.87-.777-.167.169 2.38 1.587 1.588 2.38.168-.168-.776-1.87 5.509-5.508 4.328 6.252.21-.208-2.887-7.696 4.4-4.398a.935.935 0 0 0-1.323-1.323l-4.4 4.399-7.694-2.886-.21.209 6.253 4.328zm5.39 10.483l-4.33-6.253-3.04 3.04.777 1.87-2.666 2.665-2.645-3.967-3.968-2.646 2.666-2.666 1.869.776 3.04-3.04-6.253-4.328 2.646-2.645 7.695 2.885 3.547-3.547a2.806 2.806 0 1 1 3.968 3.968l-3.547 3.547 2.886 7.696-2.646 2.645z">
                </path>
              </svg></label></li>
        </ul>
      </div>
    </div>
    <div class="relative flex flex-row flex-grow w-full h-full overflow-hidden select-none">
      <div
        class="p-3 select-none md:w-[300px] overflow-y-auto z-40 fixed h-[calc(var(--maxvh)-80px)] md:static md:auto md:flex-grow-0 md:flex-shrink-0 no-scrollbar">
        <div x-show="showSideBar">
          <div class="flex flex-col">
            <div class="beading-panel">
              <div class="select-none rantonse-button beading-button closed">Basic</div>
              <div class="beading-stuff">
                <div class="beading-bar-row"><span>Colors <kbd>c/C</kbd></span> <span
                    class="flex items-center gap-2"><span class="inline-flex gap-1"><input type="radio"
                        class="radio radio-secondary" data-colors="2" name="radioColors">2</span> <span
                      class="inline-flex gap-1"><input type="radio" class="radio radio-secondary" data-colors="3"
                        name="radioColors">3</span></span></div>
                <div class="beading-bar-col">
                  <div class="flex justify-between"><span>Number of columns</span> <span id="columnsValue"></span></div>
                  <input type="range" min="4" max="128" value="8" step="2" class="range range-secondary range-xs"
                    id="sliderColumnRange">
                </div>
                <div class="beading-bar-col">
                  <div class="flex justify-between"><span>Number of rows</span> <span id="rowsValue"></span></div><input
                    type="range" min="4" max="128" value="8" step="2" class="range range-secondary range-xs"
                    id="sliderRowRange">
                </div>
                <div class="beading-bar-row"><span>Random rule <kbd>R</kbd></span>
                  <div class="beading-action-button" id="buttonRandom">random rule</div>
                </div>
                <div class="beading-bar-row"><span>Random output <kbd>r</kbd> <span
                      class="beading-tooltip tooltip-above"
                      data-tip="For each rule part shown, randomize the output.">?</span></span>
                  <div class="beading-action-button" id="buttonRandomize">random</div>
                </div>
                <div class="beading-bar-row"><span>Random seed <kbd>0</kbd></span>
                  <div class="beading-action-button" id="buttonRandomSeed">random seed</div>
                </div>
                <div class="beading-bar-col">
                  <div class="flex"><span>Seed <kbd>0–9</kbd> <span class="beading-tooltip tooltip-above"
                        data-tip="The seed is the first row, or rows (depending on the rule), in the patterns. The seed, together with the rule, determines the pattern.">?</span></span>
                  </div><select class="beading-select" id="selectSeed">
                    <option disabled="disabled" selected="selected">Select seed (0–9)</option>
                  </select>
                </div>
                <div class="beading-inner-frame" style="display: none;" id="sliderSeedPeriodOptions">
                  <div class="beading-bar-col">
                    <div class="flex justify-between"><span>Seed period</span> <span id="sliderSeedPeriodValue"></span>
                    </div><input type="range" min="2" max="30" step="1" class="range range-secondary range-xs"
                      id="sliderSeedPeriod">
                  </div>
                </div>
                <div class="beading-bar-row"><span>Staggered <kbd>S</kbd> <span class="beading-tooltip tooltip-above"
                      data-tip="Staggered means that cells are laid out in a hexagonal, instead of a rectangular, grid.">?</span></span>
                  <input type="checkbox" class="checkbox checkbox-secondary" id="checkboxStaggered"></div>
              </div>
            </div>
            <div class="beading-panel">
              <div class="select-none rantonse-button beading-button closed">Styling</div>
              <div class="beading-stuff">
                <div class="beading-bar-row"><span>Layout <kbd>t</kbd></span> <select class="beading-select"
                    id="selectMainLayout">
                    <option disabled="disabled" selected="selected">Layout (t)</option>
                  </select></div>
                <div id="colorSchemeCanvas"></div>
                <div class="beading-bar-col"><span>Color scheme <kbd>o/O</kbd></span> <select class="beading-select"
                    id="selectColorScheme">
                    <option disabled="disabled" selected="selected">Select color scheme (o/O)</option>
                  </select></div>
                <div class="beading-bar-col"><span>Visual style <kbd>v/V</kbd></span> <select class="beading-select"
                    id="selectVisualStyle">
                    <option disabled="disabled" selected="selected">Select visual style (v/V)</option>
                  </select></div>
                <div class="beading-bar-row"><span>Alternating colors <kbd>n</kbd></span><input type="checkbox"
                    class="checkbox checkbox-secondary" id="checkboxAlternatingColors"></div>
                <div class="beading-inner-frame" style="display: none;" id="sliderModuloDiv">
                  <div class="beading-bar-col">
                    <div class="flex justify-between"><span>Colors modulo <kbd>y/Y</kbd></span> <span
                        id="sliderModuloValue"></span></div><input type="range" min="2" max="100" value="8"
                      class="range range-secondary range-xs" id="sliderModuloRange">
                  </div>
                  <div class="beading-bar-row"><span>Animate colors <kbd>N</kbd></span> <input type="checkbox"
                      class="checkbox checkbox-secondary" id="checkboxAnimateColors"></div>
                </div>
                <div class="beading-bar-row"><span>Show thread <kbd>T</kbd></span> <input type="checkbox"
                    class="checkbox checkbox-secondary" id="checkboxThread"></div>
                <div class="beading-bar-row"><span>Show cell border <kbd>b</kbd></span> <input type="checkbox"
                    class="checkbox checkbox-secondary" id="checkboxShowBorder"></div>
                <div style="display: none;" id="borderOptions">
                  <div class="beading-inner-frame">
                    <div class="beading-bar-col">
                      <div class="flex justify-between"><span>Border width</span> <span
                          id="sliderBorderWidthValue"></span></div><input type="range" min="0" max="100" step="1"
                        class="range range-secondary range-xs" id="sliderBorderWidth">
                    </div>
                    <div class="beading-bar-col">
                      <div class="flex justify-between"><span>Border brightness</span> <span
                          id="sliderBorderBrightnessValue"></span></div><input type="range" min="1" max="255" step="1"
                        class="range range-secondary range-xs" id="sliderBorderBrightness">
                    </div>
                  </div>
                </div>
                <div class="beading-bar-col">
                  <div class="flex justify-between"><span>Bead roundness</span> <span
                      id="sliderBeadRoundnessValue"></span></div><input type="range" min="0" max="1" step="0.01"
                    class="range range-secondary range-xs" id="sliderBeadRoundness">
                </div>
                <div class="beading-bar-col">
                  <div class="flex justify-between"><span>Bead spacing width</span> <span
                      id="sliderBeadSpacingWValue"></span></div><input type="range" min="0" max="1" step="0.01"
                    class="range range-secondary range-xs" id="sliderBeadSpacingW">
                </div>
                <div class="beading-bar-col">
                  <div class="flex justify-between"><span>Bead spacing height</span> <span
                      id="sliderBeadSpacingHValue"></span></div><input type="range" min="0" max="1" step="0.01"
                    class="range range-secondary range-xs" id="sliderBeadSpacingH">
                </div>
                <div class="beading-bar-col">
                  <div class="flex justify-between"><span>Bead size ratio</span> <span id="sliderBratioValue"></span>
                  </div><input type="range" min="0" max="1" step="0.01" class="range range-secondary range-xs"
                    id="sliderBratio">
                </div>
              </div>
            </div>
            <div class="beading-panel">
              <div class="select-none rantonse-button beading-button closed">Rules</div>
              <div class="beading-stuff">
                <div class="beading-bar-col"><span>Rule compression <kbd>m/M</kbd></span> <select class="beading-select"
                    id="selectRuleCompression"></select></div>
                <div class="beading-bar-col"><span>Rule part sorting</span> <select class="beading-select"
                    id="selectModuleSorting">
                    <option disabled="disabled" selected="selected">Rule part sorting</option>
                  </select></div>
                <div class="beading-bar-row" style="display: none;"><span>Fixed rule parts</span><input type="checkbox"
                    class="checkbox checkbox-secondary" id="checkboxFixedRuleModules"></div>
                <div class="beading-bar-row"><span>Hide inactive parts <kbd>i</kbd></span><input type="checkbox"
                    class="checkbox checkbox-secondary" id="checkboxMarkInactive"></div>
                <div class="beading-bar-row"><span>Shows counters <kbd>.</kbd></span><input type="checkbox"
                    class="checkbox checkbox-secondary" id="checkboxShowCounters"></div>
                <div class="pt-1" style="display: none;" id="showPercentageDiv">
                  <div><span>Shows percentages <kbd>,</kbd></span><input type="checkbox"
                      class="checkbox checkbox-secondary" id="checkboxShowPercentage"></div>
                </div>
                <div class="beading-bar-row"><span>Expand rule part <kbd>spc</kbd></span>
                  <div class="beading-action-button" id="expandRule">expand</div>
                </div>
              </div>
            </div>
            <div class="beading-panel" id="grid-settings-panel">
              <div class="rantonse-button beading-button closed">Grid</div>
              <div class="beading-stuff">
                <div class="beading-bar-row"><span>Grid layout <kbd>g</kbd></span><input type="checkbox"
                    class="checkbox checkbox-secondary" id="checkboxGridLayout"></div>
                <div style="display: none;" id="gridLayoutDiv">
                  <div class="flex flex-col gap-2">
                    <div class="beading-bar-col">
                      <div class="flex justify-between"><span>Number of grid columns</span> <span
                          id="sliderLayoutColumnsValue"></span></div><input type="range" min="1" max="8" value="2"
                        step="1" class="range range-secondary range-xs" id="sliderLayoutColumns">
                    </div>
                    <div class="beading-bar-col">
                      <div class="flex justify-between"><span>Number of grid rows</span> <span
                          id="sliderLayoutRowsValue"></span></div><input type="range" min="1" max="8" value="2" step="1"
                        class="range range-secondary range-xs" id="sliderLayoutRows">
                    </div>
                    <div class="beading-bar-row"><span>Show grid text</span><input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxShowGridText"></div>
                  <div class="caution-tape">
                    <div class="p-2">
                      <div class="font-bold">Filters</div>
                      <div class="text-sm tracking-tight">The following are various ways to filter the grid. The filters
                        should be used with some caution, because some of them require a lot of computation. If your
                        browser starts working hard and seems unresponsive, consider reloading and starting over.</div>
                    </div>
                    <div class="beading-bar-row"><span>Reset filters</span>
                      <div class="beading-action-button" id="buttonResetFilters">reset</div>
                    </div>
                    <div class="beading-bar-row"><span>Remove period two</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRemovePeriodTwo"></div>
                    <div class="beading-bar-row"><span>Remove period four</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRemovePeriodFour"></div>
                    <div class="beading-bar-row"><span>Remove period six</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRemovePeriodSix"></div>
                    <div class="beading-bar-row"><span>Require persistence</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRequirePersistence"></div>
                    <div class="beading-bar-row"><span>Require fewer equivalents</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRequireFewerEquivalents"></div>
                    <div class="beading-bar-row"><span>Remove equivalents</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRemoveEquivalents"></div>
                    <div class="beading-bar-row"><span>Require closed</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRequireClosed"></div>
                    <div class="beading-bar-row"><span>Require semiclosed</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRequireSemiclosed"></div>
                    <div class="beading-bar-row"><span>Require not semiclosed</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRequireNotSemiclosed"></div>
                    <div class="beading-bar-row"><span>Require color split</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRequireColorSplit"></div>
                    <div class="beading-bar-row"><span>Require not color split</span> <input type="checkbox"
                        class="checkbox checkbox-secondary" id="checkboxRequireNotColorSplit"></div>

                  </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="beading-panel">
              <div class="select-none rantonse-button beading-button closed">Advanced</div>
              <div class="beading-stuff">
                <div class="beading-bar-row caution-tape">
                  <span>Colors <kbd>c/C</kbd></span> <span
                    class="flex items-center gap-2">
                  <span class="inline-flex gap-1"><input type="radio"
                        class="radio radio-secondary" data-colors="4" name="radioColors">4</span>
                  <span class="inline-flex gap-1"><input type="radio" class="radio radio-secondary" data-colors="5"
                        name="radioColors">5</span>
                  <!-- <span class="inline-flex gap-1"><input type="radio"
                        class="radio radio-secondary" data-colors="6" name="radioColors">6</span></span> -->
                </div>
                <div class="beading-bar-row"><span>Clear toggles <kbd>e</kbd></span>
                  <div class="beading-action-button" id="buttonClearToggles">clear</div>
                </div>
                <div class="beading-bar-row"><span>Advance by 2 <kbd>a</kbd>+<kbd>↑</kbd></span>
                  <div class="beading-action-button" id="buttonAdvanceByTwo">advance</div>
                </div>
                <div class="beading-bar-row"><span>Advance by 20 <kbd>A</kbd>+<kbd>↑</kbd></span>
                  <div class="beading-action-button" id="buttonAdvanceByTwenty">advance</div>
                </div>
                <div class="beading-bar-row"><span>Extra column L <kbd>(</kbd> <span
                      class="beading-tooltip tooltip-above"
                      data-tip="Shows an extra column on the left side, identical to the rightmost column.">?</span></span>
                  <input type="checkbox" class="checkbox checkbox-secondary" id="checkboxShowWrappingColumnLeft"></div>
                <div class="beading-bar-row"><span>Extra column R <kbd>)</kbd> <span
                      class="beading-tooltip tooltip-above"
                      data-tip="Shows an extra column on the right side, identical to the leftmost column.">?</span></span>
                  <input type="checkbox" class="checkbox checkbox-secondary" id="checkboxShowWrappingColumnRight"></div>
                <div class="beading-bar-row"><span>Show period <kbd>p</kbd></span> <input type="checkbox"
                    class="checkbox checkbox-secondary" id="checkboxShowPeriod"></div>
                <div class="beading-bar-row"><span>Directional rules <kbd>I</kbd> <span
                      class="beading-tooltip tooltip-above"
                      data-tip="When directional rules are on, the next cell is determined from a neighborhood by also taking into account the direction of an imaginary needle, which switches direction for every row.">?</span></span>
                  <input type="checkbox" class="checkbox checkbox-secondary" id="checkboxDirectional"></div>
                <div class="beading-bar-row"><span>Wrapping <kbd>w</kbd> <span class="beading-tooltip tooltip-above"
                      data-tip="When wrapping is on, the left and the right side of the pattern is connected, as if the sides were wrapped around a torus.">?</span></span>
                  <input type="checkbox" class="checkbox checkbox-secondary" id="checkboxWrapping"></div>
                <div class="beading-bar-col"><span>Start shape <span class="beading-tooltip tooltip-above"
                      data-tip="With these options you can redefined the pattern with different start shapes.">?</span></span>
                  <select class="beading-select" id="selectStartShape">
                    <option disabled="disabled" selected="selected">Start shape</option>
                  </select></div>
                <div class="beading-bar-row"><span>Show direction arrow</span> <input type="checkbox"
                    class="checkbox checkbox-secondary" id="checkboxArrow"></div>
                <div class="beading-bar-row"><span>Upwards <kbd>u</kbd></span> <input type="checkbox"
                    class="checkbox checkbox-secondary" id="checkboxUpwards"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="relative flex-grow overflow-hidden select-none">
        <div class="w-full h-full p-3 select-none rounded-xl">
          <div class="w-full h-full p-3 border select-none rounded-xl">
            <div id="pattern" class="w-full h-full select-none"></div>
          </div>
        </div>
        <div x-cloak
          class="absolute top-0 right-0 p-3 m-3 min-w-[400px] text-sm text-black bg-white drop-shadow-lg rounded-xl border border-gray-200"
          x-show="isInfoBoxOpen">
          <div @click="isInfoBoxOpen = !isInfoBoxOpen" class="closeme"><svg xmlns="http://www.w3.org/2000/svg"
              viewBox="-6 -6 24 24" width="24" fill="currentColor">
              <path
                d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z">
              </path>
            </svg></div>
          <div id="infopanel"></div>
        </div>
      </div>
    </div><input type="checkbox" id="modalShortCode" class="modal-toggle"> <label for="modalShortCode" class="modal">
      <div class="relative modal-box">
        <div for="modalShortCode" class="closeme"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 24 24"
            width="24" fill="currentColor">
            <path
              d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z">
            </path>
          </svg></div>
        <h3 class="mb-2 text-lg font-bold text-center">Enter short code + <kbd>Enter</kbd></h3>
        <div class="mx-3 text-center"><input id="shortCode" maxlength="3"
            class="w-[80px] h-8 max-w-xs input rounded-lg input-bordered text-center"></div>
      </div>
    </label> <input type="checkbox" id="modalKeyboardShortcuts" class="modal-toggle"> <label
      for="modalKeyboardShortcuts" class="modal">
      <div class="max-w-6xl modal-box no-scrollbar">
        <div for="modalKeyboardShortcuts" class="closeme"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 24 24"
            width="24" fill="currentColor">
            <path
              d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z">
            </path>
          </svg></div>
        <div class="w-full mb-2 text-2xl font-bold text-center">Keyboard shortcuts</div>
        <div class="flex flex-col md:flex-row md:gap-4">
          <div class="md:w-1/2">
            <div class="mt-2 font-bold text-center text-red-700 border-b">Basic</div>
            <table class="w-full table-sm shadow-red-500">
              <tbody>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>c/C</kbd></td>
                  <td>Increases/decreases number of colors</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>d/D + ←↑↓→</kbd></td>
                  <td>Changes size by 2/20</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>d + 0–9</kbd></td>
                  <td>Changes to predefined size</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>R</kbd></td>
                  <td>Selects a random rule</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>0–9</kbd></td>
                  <td>Changes seed type</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>S</kbd></td>
                  <td>Toggles staggered</td>
                </tr>
              </tbody>
            </table>
            <div class="mt-2 font-bold text-center text-red-700 border-b">Styling</div>
            <table class="w-full table-sm shadow-red-500">
              <tbody>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>t</kbd></td>
                  <td>Changes screen layout</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>o/O</kbd></td>
                  <td>Changes color scheme</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>v/V</kbd></td>
                  <td>Changes visual style</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>n</kbd></td>
                  <td>Toggles alternating colors</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>y/Y</kbd></td>
                  <td>Changes color modulus value</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>N</kbd></td>
                  <td>Animate colors</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>T</kbd></td>
                  <td>Toggles a beading thread</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>b</kbd></td>
                  <td>Toggles borders around cells</td>
                </tr>
              </tbody>
            </table>
            <div class="mt-2 font-bold text-center text-red-700 border-b">Rules</div>
            <table class="w-full table-sm shadow-red-500">
              <tbody>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>m/M</kbd></td>
                  <td>Changes rule compression</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>i</kbd></td>
                  <td>Toggles inactive parts</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>.</kbd></td>
                  <td>Toggles counters</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>,</kbd></td>
                  <td>Toggles percentages</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>space</kbd></td>
                  <td>Expand rule part</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>→</kbd></td>
                  <td>Next rule (lexicographically)</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>←</kbd></td>
                  <td>Previous rule (lexicographically)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="md:w-1/2">
            <div class="mt-2 font-bold text-center text-red-700 border-b">Grid</div>
            <table class="w-full table-sm shadow-red-500">
              <tbody>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>g</kbd></td>
                  <td>Toggles grid</td>
                </tr>
              </tbody>
            </table>
            <div class="mt-2 font-bold text-center text-red-700 border-b">Advanced</div>
            <table class="w-full table-sm shadow-red-500">
              <tbody>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>a+↑</kbd></td>
                  <td>Advances pattern by 2 rows</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>a+↑</kbd></td>
                  <td>Advances pattern by 20 rows</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>(</kbd></td>
                  <td>Toggles extra column on left side</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>)</kbd></td>
                  <td>Toggles extra column on right side</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>p</kbd></td>
                  <td>Toggle period indicator</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>I</kbd></td>
                  <td>Toggles directional rules</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>w</kbd></td>
                  <td>Toggles left/right wrapping</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>u</kbd></td>
                  <td>Toggles upwards/downwards direction</td>
                </tr>
              </tbody>
            </table>
            <div class="mt-2 font-bold text-center text-red-700 border-b">Other shortcuts</div>
            <table class="w-full table-sm shadow-red-500">
              <tbody>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>Enter</kbd></td>
                  <td>Open short code input box</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>X</kbd></td>
                  <td>Reset everything</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>PageDown</kbd></td>
                  <td>Next pre-defined rule</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>PageUp</kbd></td>
                  <td>Previous pre-defined rule</td>
                </tr>
                <!-- <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>=</kbd></td>
                  <td>Toggles comparison mode</td>
                </tr> -->
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>z</kbd></td>
                  <td>Take a screenshot</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>Z</kbd></td>
                  <td>Take predefined large screenshots</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>P</kbd></td>
                  <td>Changes map of colors</td>
                </tr>
                <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>q</kbd></td>
                  <td>Shows debug boxes</td>
                </tr>
                <!-- <tr>
                  <td class="w-[100px] text-center mr-12 font-bold"><kbd>+/-</kbd></td>
                  <td>Changes analysis threshold</td>
                </tr> -->
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </label> <input type="checkbox" id="modalAbout" class="modal-toggle"> <label for="modalAbout" class="modal">
      <div class="max-w-4xl h-[calc(var(--maxvh)-80px)] modal-box no-scrollbar">
        <div for="modalAbout" class="closeme"><svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 24 24" width="24"
            fill="currentColor">
            <path
              d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z">
            </path>
          </svg></div>
        <div class="italic text-center font-fun">Welcome to</div>
        <div class="mb-2 text-2xl font-bold text-center text-gray-700 font-fun">Beading with Algorithms</div>
        <div class="flex justify-center">
          <div class="max-w-lg p-4 text-center">This is the app accompanying our book <a
              class="italic text-gray-700 font-fun" href="">Beading with Algorithms</a>. With this tool you can explore
            the world of and algorithms through simple and visually appealing rules.</div>
        </div>
        <div class="flex flex-row w-full gap-2 my-2">
          <div><img class="w-full h-auto" src="files/ch1.t.png" alt=""></div>
          <div><img class="w-full h-auto" src="files/ch2.t.png" alt=""></div>
        </div>
        <div class="mt-4 mb-2 text-2xl font-bold text-center text-gray-700 font-fun">Work-in-progress</div>
        <div class="flex flex-col items-center"><a target="_blank" href="grid.php?all" class="external">Grid</a> <a
            target="_blank" href="table.php?all" class="external">Table</a> <a target="_blank" href="colors.php"
            class="external">Colors</a></div>
      </div>
    </label>
  </div>
</body>

</html>