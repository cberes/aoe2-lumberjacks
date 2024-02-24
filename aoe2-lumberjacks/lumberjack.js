/*
1 tree = 100 wood?
23.28 wood/minute = 0.388 wood/second (in dark age)
0.8 tiles/second = walking speed
2.5 seconds to cut down 1 tree
tiles to tree = sqrt(x^2 + y^2)
tiles walked per tree = (tiles to tree) x 2 x 10
                                        x 2 for round trip
                                            x 10 for number of trips to fully cut down
fast speed = divide time by 2
*/
(function (w, d, id) {
    var MapSize = {
        TINY: {name: 'Tiny', x: 120, y: 120},
        SMALL: {name: 'Small', x: 144, y: 144},
        MEDIUM: {name: 'Medium', x: 168, y: 168},
        NORMAL: {name: 'Normal', x: 200, y: 200},
        LARGE: {name: 'Large', x: 220, y: 220},
        GIANT: {name: 'Giant', x: 240, y: 240},
        LUDAKRIS: {name: 'Ludakris', x: 480, y: 480},
        
        values: function () {
            return [this.TINY, this.SMALL, this.MEDIUM, this.NORMAL, this.LARGE, this.GIANT, this.LUDAKRIS];
        }
    };

    var GameSpeed = {
        SLOW: {name: 'Slow', multiplier: 1.0},
        NORMAL: {name: 'Normal', multiplier: 1.5},
        FAST: {name: 'Fast', multiplier: 2.0},
        
        values: function () {
            return [this.SLOW, this.NORMAL, this.FAST];
        }
    };

    function LumberCamp(width, height, x0, y0) {
        var halfWidth = parseInt(width / 2);
        var halfHeight = parseInt(height / 2);

        this.isOnTile = function (x, y) {
            return x >= x0 - halfWidth && x < x0 + halfWidth &&
                    y >= y0 - halfHeight && y < y0 + halfHeight;
        };

        this.tiles = function () {
            return width * height;
        };

        this.x = function () {
            return x0;
        };

        this.y = function () {
            return y0;
        };

        this.height = function () {
            return height;
        };

        this.width = function () {
            return width;
        };
    }

    function LumberjackCalculator() {
        const WOOD_PER_TREE = 100;
        const WOOD_PER_TRIP = 10;
        const WOOD_PER_SECOND = 0.388;
        const TILES_PER_SECOND = 0.8;
        const DELAY_PER_TREE = 2.5;
        const ROUND_TRIP = 2;

        function getLumberCampDistance(lumberCamp, x, y) {
            if (x === 0) {
                return lumberCamp.height() / 2;
            } else if (y === 0) {
                return lumberCamp.width() / 2;
            } else {
                let theta = Math.abs(Math.atan(Math.abs(y) / Math.abs(x)));
                let cosTheta = Math.cos(theta > Math.PI / 4 ? (Math.PI / 2) - theta : theta);
                return lumberCamp.height() / 2 / cosTheta;
            }
        }

        function getTilesToTree(lumberCamp, tree) {
            let x = tree.x - lumberCamp.x();
            let y = tree.y - lumberCamp.y();
            let distance = Math.sqrt((x * x) + (y * y));
            let unwalkableDistance = getLumberCampDistance(lumberCamp, x, y);
            return distance - unwalkableDistance;
        }

        function calculateTimeForTree(lumberCamp, tree) {
            let tiles = getTilesToTree(lumberCamp, tree);
            let trips = Math.ceil(WOOD_PER_TREE / WOOD_PER_TRIP);
            let walkingTime = trips * tiles * ROUND_TRIP / TILES_PER_SECOND;
            let choppingTime = WOOD_PER_TREE / WOOD_PER_SECOND;
            return DELAY_PER_TREE + walkingTime + choppingTime;
        }

        function calculateTimeToClearMap(size, lumberCamp) {
            let totalTime = 0;
            for (let x = 0; x < size.x; ++x) {
                for (let y = 0; y < size.y; ++y) {
                    if (!lumberCamp.isOnTile(x, y)) {
                        totalTime += calculateTimeForTree(lumberCamp, {x: x, y: y});
                    }
                }
            }
            return totalTime;
        }

        this.timeToClearMap = function (size, lumberCamp, speed) {
            let totalTime = calculateTimeToClearMap(size, lumberCamp);
            return totalTime / speed.multiplier;
        };

        this.trees = function (size, lumberCamp) {
            return size.x * size.y - lumberCamp.tiles();
        };

        this.wood = function (size, lumberCamp) {
            return this.trees(size, lumberCamp) * WOOD_PER_TREE;
        };
    }

    function HumanReadableTime() {
        const MINUTE_IN_SECONDS = 60;
        const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS;
        const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS;
        const MONTH_IN_SECONDS = (365 / 12) * DAY_IN_SECONDS;
        const YEAR_IN_SECONDS = 365 * DAY_IN_SECONDS;

        function formatValueWithUnit(value, unit, separator) {
            if (value === 0) {
                return '';
            } else if (value === 1) {
                return value + ' ' + unit + (separator || '');
            } else {
                return value + ' ' + unit + 's' + (separator || '');
            }
        }

        this.format = function (totalTimeInSeconds) {
            let remaining = totalTimeInSeconds;
            let years = Math.floor(remaining / YEAR_IN_SECONDS);
            remaining -= years * YEAR_IN_SECONDS;
            let months = Math.floor(remaining / MONTH_IN_SECONDS);
            remaining -= months * MONTH_IN_SECONDS;
            let days = Math.floor(remaining / DAY_IN_SECONDS);
            remaining -= days * DAY_IN_SECONDS;
            let hours = Math.floor(remaining / HOUR_IN_SECONDS);
            remaining -= hours * HOUR_IN_SECONDS;
            let minutes = Math.floor(remaining / MINUTE_IN_SECONDS);
            remaining -= minutes * MINUTE_IN_SECONDS;
            let seconds = Math.ceil(remaining);
            return formatValueWithUnit(years, 'year', ', ') +
                    formatValueWithUnit(months, 'month', ', ') +
                    formatValueWithUnit(days, 'day', ', ') +
                    formatValueWithUnit(hours, 'hour', ', ') +
                    formatValueWithUnit(minutes, 'minute', ', ') +
                    formatValueWithUnit(seconds, 'second');
        };
    }

    function Simulator(imports) {
        var calculator = imports['calculator'],
            timeFormat = imports['timeFormat'],
            defaultSize = imports['defaultSize'],
            defaultSpeed = imports['defaultSpeed'],
            timeElement = d.getElementById('time'),
            treesElement = d.getElementById('trees'),
            woodElement = d.getElementById('wood'),
            sizeElement = d.getElementById('size'),
            speedElement = d.getElementById('speed'),
            lumberCampXElement = d.getElementById('lumber_camp_x'),
            lumberCampYElement = d.getElementById('lumber_camp_y'),
            centerLumberCampElement = d.getElementById('center_lumber_camp');

        function fillSelect(select, options, defaultValue) {
            for (let i = 0; i < options.length; ++i) {
                let element = document.createElement('option');
                element.innerHTML = options[i].name;
                element.selected = defaultValue && options[i].name === defaultValue.name;
                element.value = i;
                select.appendChild(element);
            }
        }

        function updateCenter() {
            console.log('update');
            if (centerLumberCampElement.checked) {
                let size = MapSize.values()[parseInt(sizeElement.value)];
                lumberCampXElement.value = parseInt(size.x / 2);
                lumberCampYElement.value = parseInt(size.y / 2);
            }
        }

        function toggleCentered() {
            console.log(centerLumberCampElement.checked);
            let checked = centerLumberCampElement.checked;
            lumberCampXElement.disabled = checked;
            lumberCampYElement.disabled = checked;
            run();
        }

        function run() {
            updateCenter();
            let size = MapSize.values()[parseInt(sizeElement.value)];
            let speed = GameSpeed.values()[parseInt(speedElement.value)];
            let lumberCamp = new LumberCamp(2, 2, parseInt(lumberCampXElement.value), parseInt(lumberCampYElement.value));
            let totalTime = calculator.timeToClearMap(size, lumberCamp, speed);
            let trees = calculator.trees(size, lumberCamp);
            let wood = calculator.wood(size, lumberCamp);
            timeElement.innerText = timeFormat.format(totalTime);
            treesElement.innerText = trees;
            woodElement.innerText = wood;
        }
        this.run = run;

        fillSelect(sizeElement, MapSize.values(), defaultSize);
        fillSelect(speedElement, GameSpeed.values(), defaultSpeed);
        updateCenter();

        centerLumberCampElement.addEventListener('click', toggleCentered);
        sizeElement.addEventListener('change', this.run);
        speedElement.addEventListener('change', this.run);
        lumberCampXElement.addEventListener('change', this.run);
        lumberCampYElement.addEventListener('change', this.run);
    }

    d.onreadystatechange = function () {
        if (d.readyState === 'interactive') {
            new Simulator({
                calculator: new LumberjackCalculator(),
                timeFormat: new HumanReadableTime(),
                defaultSize: MapSize.GIANT,
                defaultSpeed: GameSpeed.FAST,
            }).run();
        }
    };
}(window, document, 'answer'));
